import { Clock, Hourglass, CheckCircle2, Flame, Zap, Target } from 'lucide-react';
import {
  formatBengaliDuration,
  toBengaliNumber,
} from '../../lib/utils/formatters';

interface SummaryCardsProps {
  todayFocusedMinutes: number;
  totalFocusedMinutes: number;
  completedTasksCount: number;
  totalSessionsCount: number;
  currentStreak: number;
  dailyGoalCompletionPercent: number;
}

export function SummaryCards({
  todayFocusedMinutes,
  totalFocusedMinutes,
  completedTasksCount,
  totalSessionsCount,
  currentStreak,
  dailyGoalCompletionPercent,
}: SummaryCardsProps) {
  const cards = [
    {
      title: 'আজকের পড়ার সময়',
      value: formatBengaliDuration(todayFocusedMinutes),
      subtitle: 'আজকে ব্যয়িত সময়',
      icon: Clock,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/40',
      borderColor: 'border-blue-100 dark:border-blue-900/30',
    },
    {
      title: 'মোট পড়ার সময়',
      value: formatBengaliDuration(totalFocusedMinutes),
      subtitle: 'সর্বমোট ফোকাস সময়',
      icon: Hourglass,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950/40',
      borderColor: 'border-purple-100 dark:border-purple-900/30',
    },
    {
      title: 'সম্পন্ন কাজ',
      value: `${toBengaliNumber(completedTasksCount)}টি কাজ`,
      subtitle: 'সফলভাবে সমাপ্ত',
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
      borderColor: 'border-emerald-100 dark:border-emerald-900/30',
    },
    {
      title: 'ফোকাস সেশন',
      value: `${toBengaliNumber(totalSessionsCount)}টি সেশন`,
      subtitle: 'মোট পমোডোরো সেশন',
      icon: Flame,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40',
      borderColor: 'border-amber-100 dark:border-amber-900/30',
    },
    {
      title: 'বর্তমান স্টাডি স্ট্রিক',
      value: `${toBengaliNumber(currentStreak)} দিন`,
      subtitle: 'ধারাবাহিক পড়ার দিন',
      icon: Zap,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-950/40',
      borderColor: 'border-orange-100 dark:border-orange-900/30',
    },
    {
      title: 'আজকের লক্ষ্য পূরণ',
      value: `${toBengaliNumber(dailyGoalCompletionPercent)}%`,
      subtitle: 'দৈনিক লক্ষ্যের অগ্রগতি',
      icon: Target,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/40',
      borderColor: 'border-indigo-100 dark:border-indigo-900/30',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 md:gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`p-4 md:p-5 rounded-2xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] shadow-xs flex flex-col justify-between transition-all hover:translate-y-[-2px]`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#77839B] dark:text-[#A7B5CC] line-clamp-1">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl ${card.bgColor} ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="text-lg md:text-xl font-extrabold text-[#17233F] dark:text-[#F1F5FF] tracking-tight">
                {card.value}
              </div>
              <p className="text-[11px] text-[#77839B] dark:text-[#A7B5CC] mt-0.5">
                {card.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
