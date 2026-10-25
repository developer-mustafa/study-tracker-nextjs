import { TrendingUp, Clock, CheckCircle2, Zap, Trophy, Target } from 'lucide-react';
import { useFocusStudyData } from '../../lib/storage/store';
import { useAuth } from '../../contexts/AuthContext';
import {
  computeDashboardMetrics,
  computeSubjectStudyData,
} from '../../lib/utils/analytics';
import { calculateStreak } from '../../lib/utils/streak';
import {
  toBengaliNumber,
  formatBengaliDuration,
} from '../../lib/utils/formatters';
import { getDateKey, DEFAULT_TIMEZONE } from '../../lib/utils/date-utils';
import { StudyTimeChart } from '../dashboard/StudyTimeChart';

export function ProgressView() {
  const { user } = useAuth();
  const { sessions, tasks, subjects } = useFocusStudyData();

  const metrics = computeDashboardMetrics(
    sessions,
    tasks,
    user.dailyGoalMinutes,
    getDateKey(new Date(), DEFAULT_TIMEZONE)
  );

  const streak = calculateStreak(sessions, getDateKey(new Date(), DEFAULT_TIMEZONE));
  const subjectData = computeSubjectStudyData(sessions, subjects);

  const totalTasks = tasks.length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((metrics.completedTasksCount / totalTasks) * 100) : 0;

  const averageSessionDurationMins =
    metrics.totalSessionsCount > 0
      ? Math.round(metrics.totalFocusedMinutes / metrics.totalSessionsCount)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-[#17233F] dark:text-[#F1F5FF]">
          পড়াশোনার অগ্রগতি ও অ্যানালিটিক্স
        </h2>
        <p className="text-xs md:text-sm text-[#77839B] dark:text-[#A7B5CC] mt-0.5">
          আপনার পড়ার সময়, ধারাবাহিকতা এবং লক্ষ্য অর্জনের গভীর বিশ্লেষণ
        </p>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] shadow-xs">
          <div className="flex items-center gap-1.5 text-xs text-[#77839B] dark:text-[#A7B5CC] mb-1">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <span>আজকের সময়</span>
          </div>
          <div className="text-lg font-black text-[#17233F] dark:text-[#F1F5FF]">
            {formatBengaliDuration(metrics.todayFocusedMinutes)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] shadow-xs">
          <div className="flex items-center gap-1.5 text-xs text-[#77839B] dark:text-[#A7B5CC] mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-purple-500" />
            <span>মোট সময়</span>
          </div>
          <div className="text-lg font-black text-[#17233F] dark:text-[#F1F5FF]">
            {formatBengaliDuration(metrics.totalFocusedMinutes)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] shadow-xs">
          <div className="flex items-center gap-1.5 text-xs text-[#77839B] dark:text-[#A7B5CC] mb-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>বর্তমান স্ট্রিক</span>
          </div>
          <div className="text-lg font-black text-[#17233F] dark:text-[#F1F5FF]">
            {toBengaliNumber(streak.currentStreak)} দিন
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] shadow-xs">
          <div className="flex items-center gap-1.5 text-xs text-[#77839B] dark:text-[#A7B5CC] mb-1">
            <Trophy className="w-3.5 h-3.5 text-emerald-500" />
            <span>সর্বোচ্চ স্ট্রিক</span>
          </div>
          <div className="text-lg font-black text-[#17233F] dark:text-[#F1F5FF]">
            {toBengaliNumber(streak.longestStreak)} দিন
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] shadow-xs">
          <div className="flex items-center gap-1.5 text-xs text-[#77839B] dark:text-[#A7B5CC] mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
            <span>কাজের সমাপ্তি হার</span>
          </div>
          <div className="text-lg font-black text-[#17233F] dark:text-[#F1F5FF]">
            {toBengaliNumber(taskCompletionRate)}%
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] shadow-xs">
          <div className="flex items-center gap-1.5 text-xs text-[#77839B] dark:text-[#A7B5CC] mb-1">
            <Target className="w-3.5 h-3.5 text-rose-500" />
            <span>গড় সেশন সময়</span>
          </div>
          <div className="text-lg font-black text-[#17233F] dark:text-[#F1F5FF]">
            {toBengaliNumber(averageSessionDurationMins)} মিনিট
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <StudyTimeChart sessions={sessions} />

      {/* Subject Detailed Breakdown Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] shadow-xs">
        <h3 className="font-bold text-base text-[#17233F] dark:text-[#F1F5FF] mb-4">
          বিষয়ভিত্তিক বিস্তারিত বিশ্লেষণ
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm">
            <thead>
              <tr className="border-b border-[#E6EAF2] dark:border-[#243754] text-[#77839B] dark:text-[#A7B5CC]">
                <th className="pb-3 font-semibold">বিষয়</th>
                <th className="pb-3 font-semibold">মোট পড়ার সময়</th>
                <th className="pb-3 font-semibold">টার্গেট সময়</th>
                <th className="pb-3 font-semibold">অগ্রগতি</th>
                <th className="pb-3 font-semibold text-right">স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6EAF2] dark:divide-[#243754]">
              {subjectData.map((sub) => (
                <tr key={sub.subjectId} className="hover:bg-[#F5F7FC]/60 dark:hover:bg-[#122440]/40 transition-colors">
                  <td className="py-3.5 flex items-center gap-2 font-bold text-[#17233F] dark:text-[#F1F5FF]">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: sub.color }}
                    />
                    <span>{sub.subjectName}</span>
                  </td>
                  <td className="py-3.5 font-semibold text-[#17233F] dark:text-[#F1F5FF]">
                    {formatBengaliDuration(sub.minutes)}
                  </td>
                  <td className="py-3.5 text-[#77839B] dark:text-[#A7B5CC]">
                    {formatBengaliDuration(sub.targetMinutes)}
                  </td>
                  <td className="py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-[#E6EAF2] dark:bg-[#1C2C47] h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${sub.percentage}%`,
                            backgroundColor: sub.color,
                          }}
                        />
                      </div>
                      <span className="font-bold text-xs">{toBengaliNumber(sub.percentage)}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 text-right font-bold">
                    {sub.percentage >= 100 ? (
                      <span className="text-emerald-500">টার্গেট অর্জিত</span>
                    ) : (
                      <span className="text-[#77839B] dark:text-[#A7B5CC]">চলমান</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
