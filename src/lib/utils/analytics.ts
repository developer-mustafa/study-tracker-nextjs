import { FocusSession, Task, Subject } from '../../types';
import { getDateKey, DEFAULT_TIMEZONE, getLastNDaysKeys } from './date-utils';
import { isQualifyingFocusSession } from './timer';

export interface DashboardMetrics {
  todayFocusedMinutes: number;
  totalFocusedMinutes: number;
  completedTasksCount: number;
  totalSessionsCount: number;
  todaySessionsCount: number;
  dailyGoalCompletionPercent: number;
  dailyGoalMinutes: number;
}

export interface DayStudyData {
  dateKey: string;
  dayLabel: string;
  minutes: number;
}

export interface SubjectStudyData {
  subjectId: string;
  subjectName: string;
  color: string;
  minutes: number;
  targetMinutes: number;
  percentage: number;
}

export function computeDashboardMetrics(
  sessions: FocusSession[],
  tasks: Task[],
  dailyGoalMinutes: number = 120,
  todayDateKey: string = getDateKey(new Date(), DEFAULT_TIMEZONE),
  timeZone: string = DEFAULT_TIMEZONE
): DashboardMetrics {
  let todayFocusedSeconds = 0;
  let totalFocusedSeconds = 0;
  let todaySessionsCount = 0;
  let totalSessionsCount = 0;

  for (const s of sessions) {
    if (isQualifyingFocusSession(s)) {
      totalFocusedSeconds += s.actualDurationSeconds;
      totalSessionsCount += 1;

      const sDateKey = getDateKey(s.startTime, timeZone);
      if (sDateKey === todayDateKey) {
        todayFocusedSeconds += s.actualDurationSeconds;
        todaySessionsCount += 1;
      }
    }
  }

  const todayFocusedMinutes = Math.round(todayFocusedSeconds / 60);
  const totalFocusedMinutes = Math.round(totalFocusedSeconds / 60);
  const completedTasksCount = tasks.filter((t) => t.status === 'completed').length;
  const dailyGoalCompletionPercent =
    dailyGoalMinutes > 0
      ? Math.min(100, Math.round((todayFocusedMinutes / dailyGoalMinutes) * 100))
      : 0;

  return {
    todayFocusedMinutes,
    totalFocusedMinutes,
    completedTasksCount,
    totalSessionsCount,
    todaySessionsCount,
    dailyGoalCompletionPercent,
    dailyGoalMinutes,
  };
}

const BENGALI_SHORT_DAYS = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];

export function computeDailyStudyChartData(
  sessions: FocusSession[],
  daysCount: number = 7,
  timeZone: string = DEFAULT_TIMEZONE
): DayStudyData[] {
  const dateKeys = getLastNDaysKeys(daysCount, new Date(), timeZone);
  const minutesByDateKey: Record<string, number> = {};

  for (const k of dateKeys) {
    minutesByDateKey[k] = 0;
  }

  for (const s of sessions) {
    if (isQualifyingFocusSession(s)) {
      const k = getDateKey(s.startTime, timeZone);
      if (minutesByDateKey[k] !== undefined) {
        minutesByDateKey[k] += Math.round(s.actualDurationSeconds / 60);
      }
    }
  }

  return dateKeys.map((k) => {
    const d = new Date(`${k}T12:00:00Z`);
    const dayLabel = BENGALI_SHORT_DAYS[d.getDay()] || k.slice(5);
    return {
      dateKey: k,
      dayLabel,
      minutes: minutesByDateKey[k] || 0,
    };
  });
}

export function computeSubjectStudyData(
  sessions: FocusSession[],
  subjects: Subject[]
): SubjectStudyData[] {
  const subjectMap = new Map<string, Subject>();
  subjects.forEach((sub) => subjectMap.set(sub.id, sub));

  const minutesBySubject: Record<string, number> = {};

  for (const s of sessions) {
    if (isQualifyingFocusSession(s) && s.subjectId) {
      minutesBySubject[s.subjectId] =
        (minutesBySubject[s.subjectId] || 0) + Math.round(s.actualDurationSeconds / 60);
    }
  }

  return subjects.map((sub) => {
    const minutes = minutesBySubject[sub.id] || 0;
    const target = sub.targetMinutes || 60;
    const percentage = Math.min(100, Math.round((minutes / target) * 100));
    return {
      subjectId: sub.id,
      subjectName: sub.name,
      color: sub.color,
      minutes,
      targetMinutes: target,
      percentage,
    };
  });
}
