import { ActiveTimerState, FocusSession, TimerMode } from '../../types';

export const DEFAULT_TIMER_DURATIONS: Record<TimerMode, number> = {
  focus: 25 * 60, // 25 minutes
  short_break: 5 * 60, // 5 minutes
  long_break: 15 * 60, // 15 minutes
  custom: 30 * 60, // default custom
};

/**
 * Creates a fresh active timer state with an absolute deadline
 */
export function createTimerState(
  mode: TimerMode,
  durationSeconds: number,
  subjectId?: string,
  taskId?: string,
  now = Date.now()
): ActiveTimerState {
  const planned = Math.max(10, Math.floor(durationSeconds));
  return {
    sessionId: `session_${now}_${Math.random().toString(36).slice(2, 7)}`,
    mode,
    plannedSeconds: planned,
    remainingSeconds: planned,
    startTimestamp: now,
    deadlineTimestamp: now + planned * 1000,
    isPaused: false,
    subjectId,
    taskId,
  };
}

/**
 * Calculates current remaining seconds based on absolute deadline or paused state
 */
export function getRemainingSeconds(state: ActiveTimerState, now = Date.now()): number {
  if (state.isPaused) {
    return Math.max(0, state.remainingSeconds);
  }
  const remainingMs = state.deadlineTimestamp - now;
  return Math.max(0, Math.round(remainingMs / 1000));
}

/**
 * Pauses a timer: saves exact remaining time and records pause timestamp
 */
export function pauseTimerState(state: ActiveTimerState, now = Date.now()): ActiveTimerState {
  if (state.isPaused) return state;
  const currentRemaining = getRemainingSeconds(state, now);
  return {
    ...state,
    isPaused: true,
    remainingSeconds: currentRemaining,
    pauseTimestamp: now,
  };
}

/**
 * Resumes a timer: computes a new deadline from current now + remainingSeconds
 */
export function resumeTimerState(state: ActiveTimerState, now = Date.now()): ActiveTimerState {
  if (!state.isPaused) return state;
  const remaining = Math.max(0, state.remainingSeconds);
  return {
    ...state,
    isPaused: false,
    pauseTimestamp: undefined,
    deadlineTimestamp: now + remaining * 1000,
  };
}

/**
 * Finalizes and creates a completed FocusSession record.
 * Only focus mode counts toward study time. Break modes are logged or excluded.
 */
export function finalizeCompletedSession(
  state: ActiveTimerState,
  userId: string,
  now = Date.now()
): FocusSession {
  // If abandoned or finished, actual focused seconds is planned - remaining
  const remaining = getRemainingSeconds(state, now);
  const actualSeconds = Math.max(0, state.plannedSeconds - remaining);
  const isFinished = remaining <= 0;

  return {
    id: state.sessionId,
    userId,
    mode: state.mode,
    plannedDurationMinutes: Math.round(state.plannedSeconds / 60),
    actualDurationSeconds: isFinished ? state.plannedSeconds : actualSeconds,
    startTime: new Date(state.startTimestamp).toISOString(),
    endTime: new Date(now).toISOString(),
    subjectId: state.subjectId,
    taskId: state.taskId,
    isCompleted: isFinished,
    createdAt: new Date(now).toISOString(),
  };
}

/**
 * Checks if a session is valid focused study (breaks do NOT count as focused study)
 */
export function isQualifyingFocusSession(session: FocusSession): boolean {
  if (session.mode !== 'focus' && session.mode !== 'custom') {
    return false; // Break time never counts
  }
  if (!session.isCompleted) {
    return false; // Abandoned session does not count as completed
  }
  return session.actualDurationSeconds >= 60; // Must be at least 1 min
}
