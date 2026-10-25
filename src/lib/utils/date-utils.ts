/**
 * Date and Timezone utilities (Default: Asia/Dhaka)
 */

export const DEFAULT_TIMEZONE = 'Asia/Dhaka';

/**
 * Returns dateKey in YYYY-MM-DD format for a given date in the specified timezone
 */
export function getDateKey(dateInput: Date | string | number = new Date(), timeZone = DEFAULT_TIMEZONE): string {
  const d = new Date(dateInput);
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(d); // Returns YYYY-MM-DD
  } catch {
    // Fallback if timezone invalid
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

/**
 * Get date keys for the last N days up to today
 */
export function getLastNDaysKeys(n: number, endDate = new Date(), timeZone = DEFAULT_TIMEZONE): string[] {
  const keys: string[] = [];
  const current = new Date(endDate);
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(current);
    d.setDate(d.getDate() - i);
    keys.push(getDateKey(d, timeZone));
  }
  return keys;
}

/**
 * Difference in calendar days between two YYYY-MM-DD strings
 */
export function getDaysDifference(dateKey1: string, dateKey2: string): number {
  const d1 = new Date(`${dateKey1}T00:00:00Z`).getTime();
  const d2 = new Date(`${dateKey2}T00:00:00Z`).getTime();
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
}
