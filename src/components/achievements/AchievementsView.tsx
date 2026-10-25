import {
  Sparkles,
  Flame,
  Clock,
  Zap,
  Award,
  Trophy,
  CheckCircle,
  BookmarkCheck,
  Lock,
} from 'lucide-react';
import { useFocusStudyData } from '../../lib/storage/store';
import {
  toBengaliNumber,
  formatBengaliDate,
} from '../../lib/utils/formatters';

export function AchievementsView() {
  const { achievements } = useFocusStudyData();

  const iconMap: Record<string, React.ElementType> = {
    Sparkles,
    Flame,
    Clock,
    Zap,
    Award,
    Trophy,
    CheckCircle,
    BookmarkCheck,
  };

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
  const totalCount = achievements.length;
  const completionPercent = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[#17233F] dark:text-[#F1F5FF]">
            অর্জিত মাইলফলক ও ব্যাজ
          </h2>
          <p className="text-xs md:text-sm text-[#77839B] dark:text-[#A7B5CC] mt-0.5">
            অধ্যয়নের শৃঙ্খলা ও অধ্যবসায়ের স্বীকৃতিস্বরূপ বিশেষ সম্মাননা ব্যাজ
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white dark:bg-[#0D1B32] p-3 rounded-2xl border border-[#E6EAF2] dark:border-[#243754] shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[#77839B] dark:text-[#A7B5CC]">
              মোট আনলককৃত
            </div>
            <div className="text-sm font-black text-[#17233F] dark:text-[#F1F5FF]">
              {toBengaliNumber(unlockedCount)} / {toBengaliNumber(totalCount)} ({toBengaliNumber(completionPercent)}%)
            </div>
          </div>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {achievements.map((ach) => {
          const Icon = iconMap[ach.icon] || Trophy;
          const isUnlocked = ach.isUnlocked;
          const progressPercent = Math.min(
            100,
            Math.round((ach.progress / ach.requiredCount) * 100)
          );

          return (
            <div
              key={ach.id}
              className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                isUnlocked
                  ? 'bg-white dark:bg-[#0D1B32] border-indigo-200 dark:border-indigo-900/60 shadow-md ring-1 ring-[#5B5CE2]/20'
                  : 'bg-white/60 dark:bg-[#0D1B32]/60 border-[#E6EAF2] dark:border-[#243754] opacity-80'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md ${
                      isUnlocked
                        ? 'bg-gradient-to-tr from-[#5B5CE2] to-[#8B5CF6] text-white shadow-indigo-500/25'
                        : 'bg-[#E6EAF2] dark:bg-[#1C2C47] text-[#77839B]'
                    }`}
                  >
                    {isUnlocked ? <Icon className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
                  </div>

                  {isUnlocked ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      আনলকড
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400">
                      লকড
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-sm md:text-base text-[#17233F] dark:text-[#F1F5FF]">
                  {ach.title}
                </h3>
                <p className="text-xs text-[#77839B] dark:text-[#A7B5CC] mt-1 line-clamp-2">
                  {ach.description}
                </p>
              </div>

              {/* Progress */}
              <div className="space-y-1.5 pt-2 border-t border-[#E6EAF2] dark:border-[#243754]">
                <div className="flex items-center justify-between text-[11px] text-[#77839B] dark:text-[#A7B5CC]">
                  <span>অগ্রগতি</span>
                  <span className="font-bold text-[#17233F] dark:text-[#F1F5FF]">
                    {toBengaliNumber(Math.round(ach.progress * 10) / 10)} / {toBengaliNumber(ach.requiredCount)}
                  </span>
                </div>

                <div className="w-full bg-[#E6EAF2] dark:bg-[#1C2C47] h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isUnlocked
                        ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                        : 'bg-[#5B5CE2]'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {isUnlocked && ach.unlockedAt && (
                  <div className="text-[10px] text-[#77839B] dark:text-[#A7B5CC] text-right pt-0.5 font-medium">
                    অর্জিত: {formatBengaliDate(ach.unlockedAt)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
