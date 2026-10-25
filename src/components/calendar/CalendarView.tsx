import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { useFocusStudyData } from '../../lib/storage/store';
import {
  toBengaliNumber,
  formatBengaliDate,
  formatBengaliDuration,
} from '../../lib/utils/formatters';
import { getDateKey, DEFAULT_TIMEZONE } from '../../lib/utils/date-utils';

const BENGALI_WEEKDAY_NAMES = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];
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

export function CalendarView() {
  const { tasks, sessions, subjects } = useFocusStudyData();

  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // 0-indexed
  const [selectedDateKey, setSelectedDateKey] = useState<string>(
    getDateKey(new Date(), DEFAULT_TIMEZONE)
  );

  const subjectMap = new Map<string, (typeof subjects)[0]>();
  subjects.forEach((s) => subjectMap.set(s.id, s));

  // Navigate months
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Calendar math
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Aggregate minutes by date
  const minutesByDateKey: Record<string, number> = {};
  sessions
    .filter((s) => s.isCompleted && (s.mode === 'focus' || s.mode === 'custom'))
    .forEach((s) => {
      const k = getDateKey(s.startTime, DEFAULT_TIMEZONE);
      minutesByDateKey[k] =
        (minutesByDateKey[k] || 0) + Math.round(s.actualDurationSeconds / 60);
    });

  // Tasks by deadline
  const tasksByDateKey: Record<string, typeof tasks> = {};
  tasks.forEach((t) => {
    if (t.deadline) {
      if (!tasksByDateKey[t.deadline]) tasksByDateKey[t.deadline] = [];
      tasksByDateKey[t.deadline].push(t);
    }
  });

  // Selected date details
  const selectedDateTasks = tasksByDateKey[selectedDateKey] || [];
  const selectedDateSessions = sessions.filter(
    (s) =>
      s.isCompleted &&
      (s.mode === 'focus' || s.mode === 'custom') &&
      getDateKey(s.startTime, DEFAULT_TIMEZONE) === selectedDateKey
  );
  const selectedDateMinutes = minutesByDateKey[selectedDateKey] || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[#17233F] dark:text-[#F1F5FF]">
            স্টাডি ক্যালেন্ডার ও সময়সূচি
          </h2>
          <p className="text-xs md:text-sm text-[#77839B] dark:text-[#A7B5CC] mt-0.5">
            মাসিক পড়ার ইতিহাস, কাজের ডেডলাইন ও প্রতিদিনের অধ্যয়ন সূচি
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-2 bg-white dark:bg-[#0D1B32] p-1.5 rounded-2xl border border-[#E6EAF2] dark:border-[#243754] shadow-xs">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-xl text-[#77839B] hover:text-[#17233F] dark:hover:text-[#F1F5FF] hover:bg-[#F5F7FC] dark:hover:bg-[#122440]"
            aria-label="পূর্ববর্তী মাস"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-sm px-3 text-[#17233F] dark:text-[#F1F5FF]">
            {BENGALI_MONTHS[currentMonth]} {toBengaliNumber(currentYear)}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-xl text-[#77839B] hover:text-[#17233F] dark:hover:text-[#F1F5FF] hover:bg-[#F5F7FC] dark:hover:bg-[#122440]"
            aria-label="পরবর্তী মাস"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid (2 Cols) */}
        <div className="lg:col-span-2 p-5 md:p-6 rounded-3xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] shadow-xs">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-[#77839B] dark:text-[#A7B5CC] pb-3 border-b border-[#E6EAF2] dark:border-[#243754]">
            {BENGALI_WEEKDAY_NAMES.map((w, idx) => (
              <div key={idx}>{w}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5 pt-3">
            {/* Empty prefix slots */}
            {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
              <div key={`empty_${idx}`} className="h-16 md:h-20" />
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(
                dayNum
              ).padStart(2, '0')}`;
              const isSelected = selectedDateKey === dateStr;
              const isToday = dateStr === getDateKey(new Date(), DEFAULT_TIMEZONE);
              const mins = minutesByDateKey[dateStr] || 0;
              const dayTasks = tasksByDateKey[dateStr] || [];

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDateKey(dateStr)}
                  className={`h-16 md:h-20 p-1.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#5B5CE2] bg-indigo-50/70 dark:bg-indigo-950/40 ring-2 ring-[#5B5CE2]/30'
                      : isToday
                      ? 'border-[#E6EAF2] dark:border-[#243754] bg-amber-50/30 dark:bg-amber-950/20'
                      : 'border-[#E6EAF2] dark:border-[#243754] hover:bg-[#F5F7FC] dark:hover:bg-[#122440]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isToday
                          ? 'w-5 h-5 rounded-full bg-[#5B5CE2] text-white flex items-center justify-center'
                          : 'text-[#17233F] dark:text-[#F1F5FF]'
                      }`}
                    >
                      {toBengaliNumber(dayNum)}
                    </span>
                    {dayTasks.length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-rose-500" title="কাজের ডেডলাইন" />
                    )}
                  </div>

                  {mins > 0 && (
                    <div className="text-[10px] font-bold text-[#5B5CE2] dark:text-indigo-400 truncate">
                      {toBengaliNumber(mins)} মি.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Inspector (1 Col) */}
        <div className="p-5 md:p-6 rounded-3xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] shadow-xs space-y-5">
          <div className="pb-3 border-b border-[#E6EAF2] dark:border-[#243754]">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#77839B] dark:text-[#A7B5CC]">
              <CalendarIcon className="w-3.5 h-3.5 text-[#5B5CE2]" />
              <span>নির্বাচিত তারিখ</span>
            </div>
            <h3 className="text-base font-bold text-[#17233F] dark:text-[#F1F5FF] mt-1">
              {formatBengaliDate(selectedDateKey)}
            </h3>
            <p className="text-xs text-[#77839B] dark:text-[#A7B5CC] mt-0.5">
              মোট পড়াশোনা: <span className="font-bold text-[#5B5CE2]">{formatBengaliDuration(selectedDateMinutes)}</span>
            </p>
          </div>

          {/* Tasks for date */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#77839B] dark:text-[#A7B5CC] mb-2">
              এই তারিখের কাজসমূহ ({toBengaliNumber(selectedDateTasks.length)})
            </h4>
            <div className="space-y-2">
              {selectedDateTasks.length === 0 ? (
                <p className="text-xs text-[#77839B] dark:text-[#A7B5CC] py-2">
                  এই তারিখে কোনো কাজের ডেডলাইন নেই
                </p>
              ) : (
                selectedDateTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-2.5 rounded-xl bg-[#F5F7FC] dark:bg-[#122440] text-xs font-semibold flex items-center gap-2"
                  >
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 ${
                        t.status === 'completed' ? 'text-emerald-500' : 'text-[#77839B]'
                      }`}
                    />
                    <span className="truncate">{t.title}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sessions for date */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#77839B] dark:text-[#A7B5CC] mb-2">
              সম্পন্ন ফোকাস সেশন ({toBengaliNumber(selectedDateSessions.length)})
            </h4>
            <div className="space-y-2">
              {selectedDateSessions.length === 0 ? (
                <p className="text-xs text-[#77839B] dark:text-[#A7B5CC] py-2">
                  এই তারিখে কোনো ফোকাস সেশন নেই
                </p>
              ) : (
                selectedDateSessions.map((s) => {
                  const sub = s.subjectId ? subjectMap.get(s.subjectId) : null;
                  return (
                    <div
                      key={s.id}
                      className="p-2.5 rounded-xl bg-[#F5F7FC] dark:bg-[#122440] text-xs font-semibold flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Clock className="w-3.5 h-3.5 text-[#5B5CE2]" />
                        <span className="truncate">{sub ? sub.name : 'ফোকাস সেশন'}</span>
                      </div>
                      <span className="font-bold text-[#17233F] dark:text-[#F1F5FF] shrink-0">
                        {toBengaliNumber(Math.round(s.actualDurationSeconds / 60))} মিনিট
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
