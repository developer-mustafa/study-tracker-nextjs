import { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { FocusSession } from '../../types';
import {
  computeDailyStudyChartData,
  DayStudyData,
} from '../../lib/utils/analytics';
import {
  toBengaliNumber,
  formatBengaliDuration,
} from '../../lib/utils/formatters';

interface StudyTimeChartProps {
  sessions: FocusSession[];
}

type PeriodFilter = '7days' | '30days';

export function StudyTimeChart({ sessions }: StudyTimeChartProps) {
  const [period, setPeriod] = useState<PeriodFilter>('7days');
  const daysCount = period === '7days' ? 7 : 30;

  const data: DayStudyData[] = computeDailyStudyChartData(sessions, daysCount);
  const maxMinutes = Math.max(...data.map((d) => d.minutes), 60);

  const totalPeriodMinutes = data.reduce((acc, d) => acc + d.minutes, 0);

  return (
    <div className="p-5 md:p-6 rounded-2xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] shadow-xs flex flex-col justify-between">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-[#5B5CE2]">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-[#17233F] dark:text-[#F1F5FF]">
              পড়ার সময়ের অ্যানালিটিক্স
            </h3>
          </div>
          <p className="text-xs text-[#77839B] dark:text-[#A7B5CC] mt-1">
            নির্বাচিত সময়ে মোট পড়াশোনা: <span className="font-bold text-[#5B5CE2] dark:text-indigo-400">{formatBengaliDuration(totalPeriodMinutes)}</span>
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1 p-1 bg-[#F5F7FC] dark:bg-[#122440] rounded-xl self-start sm:self-auto border border-[#E6EAF2] dark:border-[#243754]">
          <button
            onClick={() => setPeriod('7days')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              period === '7days'
                ? 'bg-white dark:bg-[#0D1B32] text-[#5B5CE2] dark:text-indigo-400 shadow-xs'
                : 'text-[#77839B] dark:text-[#A7B5CC] hover:text-[#17233F] dark:hover:text-[#F1F5FF]'
            }`}
          >
            শেষ ৭ দিন
          </button>
          <button
            onClick={() => setPeriod('30days')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              period === '30days'
                ? 'bg-white dark:bg-[#0D1B32] text-[#5B5CE2] dark:text-indigo-400 shadow-xs'
                : 'text-[#77839B] dark:text-[#A7B5CC] hover:text-[#17233F] dark:hover:text-[#F1F5FF]'
            }`}
          >
            শেষ ৩০ দিন
          </button>
        </div>
      </div>

      {/* Chart visualization */}
      <div className="pt-4 pb-2">
        <div className="h-44 md:h-52 flex items-end gap-1.5 sm:gap-2.5">
          {data.map((d, index) => {
            const heightPercent = Math.max(8, Math.round((d.minutes / maxMinutes) * 100));
            const hasData = d.minutes > 0;

            return (
              <div
                key={d.dateKey}
                className="flex-1 flex flex-col items-center h-full justify-end group relative"
              >
                {/* Tooltip on hover */}
                <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 bg-[#17233F] text-white text-[11px] py-1 px-2.5 rounded-lg shadow-lg whitespace-nowrap">
                  <div className="font-bold">{d.dateKey}</div>
                  <div>{formatBengaliDuration(d.minutes)}</div>
                </div>

                {/* Bar */}
                <div className="w-full max-w-[28px] h-full flex items-end justify-center">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-lg transition-all duration-500 ${
                      hasData
                        ? 'bg-gradient-to-t from-[#5B5CE2] to-[#8B5CF6] group-hover:from-indigo-600 group-hover:to-purple-600 shadow-xs'
                        : 'bg-[#E6EAF2] dark:bg-[#1C2C47]'
                    }`}
                  />
                </div>

                {/* X-axis label */}
                <span className="text-[10px] sm:text-xs text-[#77839B] dark:text-[#A7B5CC] mt-2 truncate w-full text-center">
                  {period === '7days' ? d.dayLabel : index % 5 === 0 ? toBengaliNumber(d.dateKey.slice(8)) : ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
