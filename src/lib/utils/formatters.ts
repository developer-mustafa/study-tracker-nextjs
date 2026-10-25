/**
 * Bengali number and text formatters
 */

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBengaliNumber(num: number | string): string {
  if (num === null || num === undefined) return '০';
  const str = String(num);
  return str.replace(/[0-9]/g, (digit) => BN_DIGITS[parseInt(digit, 10)] || digit);
}

export function formatBengaliDuration(minutes: number): string {
  if (!minutes || minutes <= 0) return '০ মিনিট';
  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);

  if (hrs > 0 && mins > 0) {
    return `${toBengaliNumber(hrs)} ঘণ্টা ${toBengaliNumber(mins)} মিনিট`;
  }
  if (hrs > 0) {
    return `${toBengaliNumber(hrs)} ঘণ্টা`;
  }
  return `${toBengaliNumber(mins)} মিনিট`;
}

export function formatSecondsToMS(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  const mm = mins < 10 ? `0${mins}` : `${mins}`;
  const ss = secs < 10 ? `0${secs}` : `${secs}`;
  return `${toBengaliNumber(mm)}:${toBengaliNumber(ss)}`;
}

const BENGALI_MONTHS = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর',
];

const BENGALI_WEEKDAYS = [
  'রবিবার',
  'সোমবার',
  'মঙ্গলবার',
  'বুধবার',
  'বৃহস্পতিবার',
  'শুক্রবার',
  'শনিবার',
];

export function formatBengaliDate(dateInput: Date | string | number): string {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  const day = d.getDate();
  const month = BENGALI_MONTHS[d.getMonth()];
  const year = d.getFullYear();
  return `${toBengaliNumber(day)} ${month}, ${toBengaliNumber(year)}`;
}

export function formatBengaliWeekdayDate(dateInput: Date | string | number): string {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  const weekday = BENGALI_WEEKDAYS[d.getDay()];
  return `${weekday}, ${formatBengaliDate(d)}`;
}

export function getBengaliGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'শুভ সকাল';
  if (hour >= 12 && hour < 16) return 'শুভ দুপুর';
  if (hour >= 16 && hour < 19) return 'শুভ বিকেল';
  return 'শুভ রাত্রি';
}

export function formatCurrencyBDT(amount: number): string {
  return `৳${toBengaliNumber(amount.toLocaleString('en-US'))}`;
}

