import { Layers, ArrowRight } from 'lucide-react';
import { FocusSession, Subject } from '../../types';
import {
  computeSubjectStudyData,
  SubjectStudyData,
} from '../../lib/utils/analytics';
import {
  formatBengaliDuration,
  toBengaliNumber,
} from '../../lib/utils/formatters';

interface SubjectProgressProps {
  sessions: FocusSession[];
  subjects: Subject[];
  onManageSubjects: () => void;
}

export function SubjectProgress({
  sessions,
  subjects,
  onManageSubjects,
}: SubjectProgressProps) {
  const data: SubjectStudyData[] = computeSubjectStudyData(sessions, subjects);

  return (
    <div className="p-5 md:p-6 rounded-2xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500">
            <Layers className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-base text-[#17233F] dark:text-[#F1F5FF]">
            বিষয়ভিত্তিক পড়াশোনা
          </h3>
        </div>
        <button
          onClick={onManageSubjects}
          className="text-xs font-semibold text-[#5B5CE2] dark:text-indigo-400 hover:underline flex items-center gap-1"
        >
          <span>সব দেখুন</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-4">
        {data.length === 0 ? (
          <p className="text-xs text-[#77839B] dark:text-[#A7B5CC] py-6 text-center">
            এখনো কোনো বিষয় যোগ করা হয়নি
          </p>
        ) : (
          data.slice(0, 5).map((item) => (
            <div key={item.subjectId} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-semibold text-[#17233F] dark:text-[#F1F5FF] truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="truncate">{item.subjectName}</span>
                </div>
                <div className="shrink-0 text-[#77839B] dark:text-[#A7B5CC] font-medium">
                  <span className="font-bold text-[#17233F] dark:text-[#F1F5FF]">
                    {formatBengaliDuration(item.minutes)}
                  </span>
                  {' / '}
                  {formatBengaliDuration(item.targetMinutes)}
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-[#E6EAF2] dark:bg-[#1C2C47] h-2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>

              <div className="flex justify-end text-[10px] text-[#77839B] dark:text-[#A7B5CC] font-bold">
                {toBengaliNumber(item.percentage)}%
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
