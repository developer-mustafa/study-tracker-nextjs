import { Play, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  getBengaliGreeting,
  formatBengaliDate,
  toBengaliNumber,
} from '../../lib/utils/formatters';

interface WelcomeCardProps {
  onStartTimer: () => void;
  todayMinutes: number;
  dailyGoalMinutes: number;
}

export function WelcomeCard({
  onStartTimer,
  todayMinutes,
  dailyGoalMinutes,
}: WelcomeCardProps) {
  const { user } = useAuth();
  const greeting = getBengaliGreeting();
  const percent = dailyGoalMinutes > 0 ? Math.min(100, Math.round((todayMinutes / dailyGoalMinutes) * 100)) : 0;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#5B5CE2] via-[#6865F2] to-[#8B5CF6] text-white p-6 md:p-8 shadow-lg shadow-indigo-500/15">
      {/* Decorative background circles */}
      <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="absolute right-32 -top-12 w-48 h-48 rounded-full bg-indigo-400/20 blur-xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{formatBengaliDate(new Date())}</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {greeting}, {user.displayName}!
          </h2>

          <p className="text-indigo-100 text-sm md:text-base font-medium">
            "মনোযোগ দিয়ে পড়ো, লক্ষ্য পূরণ করো" — আজকের লক্ষ্য অর্জনে সম্পূর্ণ মনোযোগ দিয়ে শুরু করুন।
          </p>

          {/* Goal progress in welcome banner */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs font-semibold mb-1 text-indigo-100">
              <span>আজকের লক্ষ্য পূরণ: {toBengaliNumber(percent)}%</span>
              <span>
                {toBengaliNumber(todayMinutes)} / {toBengaliNumber(dailyGoalMinutes)} মিনিট
              </span>
            </div>
            <div className="w-full bg-black/20 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-white h-full rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="shrink-0 flex items-center">
          <button
            onClick={onStartTimer}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-white text-[#5B5CE2] font-bold text-sm md:text-base shadow-xl hover:bg-indigo-50 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Play className="w-4 h-4 fill-[#5B5CE2]" />
            <span>ফোকাস সেশন শুরু করুন</span>
          </button>
        </div>
      </div>
    </div>
  );
}
