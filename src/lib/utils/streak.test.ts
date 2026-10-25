import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateStreak } from './streak';
import { FocusSession } from '../../types';

function mockSession(dateStr: string, mode: 'focus' | 'short_break' = 'focus', actualSeconds = 1500): FocusSession {
  return {
    id: `sess_${dateStr}`,
    userId: 'u1',
    mode,
    plannedDurationMinutes: Math.round(actualSeconds / 60),
    actualDurationSeconds: actualSeconds,
    startTime: `${dateStr}T10:00:00+06:00`,
    endTime: `${dateStr}T10:25:00+06:00`,
    isCompleted: true,
    createdAt: `${dateStr}T10:25:00+06:00`,
  };
}

test('calculateStreak returns 0 when no sessions exist', () => {
  const result = calculateStreak([], '2026-10-24');
  assert.equal(result.currentStreak, 0);
  assert.equal(result.longestStreak, 0);
  assert.equal(result.totalActiveDays, 0);
});

test('calculateStreak counts consecutive active days ending today', () => {
  const sessions: FocusSession[] = [
    mockSession('2026-10-22'),
    mockSession('2026-10-23'),
    mockSession('2026-10-24'),
  ];
  const result = calculateStreak(sessions, '2026-10-24');
  assert.equal(result.currentStreak, 3);
  assert.equal(result.longestStreak, 3);
  assert.equal(result.totalActiveDays, 3);
});

test('calculateStreak preserves streak if last session was yesterday', () => {
  const sessions: FocusSession[] = [
    mockSession('2026-10-22'),
    mockSession('2026-10-23'),
  ];
  // Today is 2026-10-24, hasn't studied today yet, yesterday was studied
  const result = calculateStreak(sessions, '2026-10-24');
  assert.equal(result.currentStreak, 2);
  assert.equal(result.longestStreak, 2);
  assert.equal(result.totalActiveDays, 2);
});

test('calculateStreak resets current streak if day was missed', () => {
  const sessions: FocusSession[] = [
    mockSession('2026-10-20'),
    mockSession('2026-10-21'),
    // Missed 22 and 23
  ];
  const result = calculateStreak(sessions, '2026-10-24');
  assert.equal(result.currentStreak, 0);
  assert.equal(result.longestStreak, 2);
  assert.equal(result.totalActiveDays, 2);
});

test('breaks do not count towards streaks', () => {
  const sessions: FocusSession[] = [
    mockSession('2026-10-23', 'short_break'),
    mockSession('2026-10-24', 'short_break'),
  ];
  const result = calculateStreak(sessions, '2026-10-24');
  assert.equal(result.currentStreak, 0);
  assert.equal(result.totalActiveDays, 0);
});
