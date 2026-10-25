import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createTimerState,
  getRemainingSeconds,
  pauseTimerState,
  resumeTimerState,
  finalizeCompletedSession,
  isQualifyingFocusSession,
} from './timer';

test('createTimerState establishes absolute deadline correctly', () => {
  const now = 1000000;
  const duration = 25 * 60; // 1500s
  const state = createTimerState('focus', duration, 'sub-1', 'task-1', now);

  assert.equal(state.plannedSeconds, 1500);
  assert.equal(state.remainingSeconds, 1500);
  assert.equal(state.deadlineTimestamp, now + 1500 * 1000);
  assert.equal(state.isPaused, false);
});

test('getRemainingSeconds calculates time from deadline', () => {
  const now = 1000000;
  const state = createTimerState('focus', 300, 'sub-1', undefined, now);

  // 100 seconds later
  const remaining = getRemainingSeconds(state, now + 100 * 1000);
  assert.equal(remaining, 200);

  // After deadline passed
  const afterRemaining = getRemainingSeconds(state, now + 400 * 1000);
  assert.equal(afterRemaining, 0);
});

test('pause and resume correctly recalculate deadline without losing time', () => {
  const now = 1000000;
  const state = createTimerState('focus', 300, undefined, undefined, now);

  // Advance 100s, then pause
  const pauseTime = now + 100 * 1000;
  const pausedState = pauseTimerState(state, pauseTime);

  assert.equal(pausedState.isPaused, true);
  assert.equal(pausedState.remainingSeconds, 200);

  // Remain paused for 500s
  const resumeTime = pauseTime + 500 * 1000;
  const remainingWhilePaused = getRemainingSeconds(pausedState, resumeTime);
  assert.equal(remainingWhilePaused, 200); // frozen

  // Resume
  const resumedState = resumeTimerState(pausedState, resumeTime);
  assert.equal(resumedState.isPaused, false);
  assert.equal(resumedState.deadlineTimestamp, resumeTime + 200 * 1000);

  // 50s after resume
  const afterResumeRemaining = getRemainingSeconds(resumedState, resumeTime + 50 * 1000);
  assert.equal(afterResumeRemaining, 150);
});

test('break sessions do not qualify as study focus sessions', () => {
  const now = 1000000;
  const focusState = createTimerState('focus', 1500, undefined, undefined, now);
  const completedFocus = finalizeCompletedSession(focusState, 'u1', now + 1500 * 1000);
  assert.equal(isQualifyingFocusSession(completedFocus), true);

  const breakState = createTimerState('short_break', 300, undefined, undefined, now);
  const completedBreak = finalizeCompletedSession(breakState, 'u1', now + 300 * 1000);
  assert.equal(isQualifyingFocusSession(completedBreak), false);
});
