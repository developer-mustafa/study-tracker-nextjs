import { FocusSession } from '../../types';
import { getDateKey, DEFAULT_TIMEZONE, getDaysDifference } from './date-utils';
import { isQualifyingFocusSession } from './timer';

export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  activeDateKeys: string[];
}

/**
 * Calculates current study streak, longest streak, and total active days
 */
export function calculateStreak(
  sessions: FocusSession[],
  todayDateKey: string = getDateKey(new Date(), DEFAULT_TIMEZONE),
  timeZone: string = DEFAULT_TIMEZONE
): StreakResult {
  // Collect unique qualifying dates
  const qualifyingDateSet = new Set<string>();

  for (const session of sessions) {
    if (isQualifyingFocusSession(session)) {
      const sessionDateKey = getDateKey(session.startTime, timeZone);
      qualifyingDateSet.add(sessionDateKey);
    }
  }

  const sortedDates = Array.from(qualifyingDateSet).sort(); // ascending YYYY-MM-DD
  const totalActiveDays = sortedDates.length;

  if (totalActiveDays === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalActiveDays: 0,
      activeDateKeys: [],
    };
  }

  // Calculate longest streak
  let maxStreak = 1;
  let currentRun = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const diff = getDaysDifference(sortedDates[i - 1], sortedDates[i]);
    if (diff === 1) {
      currentRun += 1;
      if (currentRun > maxStreak) {
        maxStreak = currentRun;
      }
    } else if (diff > 1) {
      currentRun = 1;
    }
  }

  // Calculate current streak
  // A streak is active if the last studied day was today OR yesterday
  const lastActiveDate = sortedDates[sortedDates.length - 1];
  const diffFromToday = getDaysDifference(lastActiveDate, todayDateKey);

  let currentStreak = 0;
  if (diffFromToday === 0 || diffFromToday === 1) {
    currentStreak = 1;
    for (let i = sortedDates.length - 1; i > 0; i--) {
      const diff = getDaysDifference(sortedDates[i - 1], sortedDates[i]);
      if (diff === 1) {
        currentStreak += 1;
      } else {
        break;
      }
    }
  }

  return {
    currentStreak,
    longestStreak: Math.max(maxStreak, currentStreak),
    totalActiveDays,
    activeDateKeys: sortedDates,
  };
}
