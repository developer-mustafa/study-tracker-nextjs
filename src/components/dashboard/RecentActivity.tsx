import { CheckCircle2, Flame, Award, Clock } from 'lucide-react';
import { FocusSession, Task, Achievement, Subject } from '../../types';
import {
  formatBengaliDate,
  formatBengaliDuration,
} from '../../lib/utils/formatters';

interface RecentActivityProps {
  sessions: FocusSession[];
  tasks: Task[];
  achievements: Achievement[];
  subjects: Subject[];
}

export function RecentActivity({
  sessions,
  tasks,
  achievements,
  subjects,
}: RecentActivityProps) {
  const subjectMap = new Map<string, Subject>();
  subjects.forEach((s) => subjectMap.set(s.id, s));

  // Merge and sort real events
  interface ActivityItem {
    id: string;
    type: 'session' | 'task' | 'achievement';
    title: string;
    subtitle: string;
    timestamp: string;
    color: string;
  }

  const activities: ActivityItem[] = [];

  // Recent 5 completed sessions
  sessions
    .filter((s) => s.isCompleted)
    .slice(0, 4)
    .forEach((s) => {
      const sub = s.subjectId ? subjectMap.get(s.subjectId) : null;
      activities.push({
        id: `act_${s.id}`,
        type: 'session',
        title: sub ? `${sub.name} এ ফোকাস সেশন` : 'ফোকাস সেশন সম্পন্ন',
        subtitle: `${formatBengaliDuration(Math.round(s.actualDurationSeconds / 60))} গভীর মনোযোগ`,
        timestamp: s.endTime,
        color: sub?.color || '#5B5CE2',
      });
    });

  // Recent 3 completed tasks
  tasks
    .filter((t) => t.status === 'completed' && t.completedAt)
    .slice(0, 3)
    .forEach((t) => {
      activities.push({
        id: `act_${t.id}`,
        type: 'task',
        title: t.title,
        subtitle: 'কাজ সম্পন্ন হিসেবে চিহ্নিত',
        timestamp: t.completedAt || t.updatedAt,
        color: '#10B981',
      });
    });

  // Unlocked achievements
  achievements
    .filter((a) => a.isUnlocked && a.unlockedAt)
    .slice(0, 2)
    .forEach((a) => {
      activities.push({
        id: `act_${a.id}`,
        type: 'achievement',
        title: `অর্জন আনলক: ${a.title}`,
        subtitle: a.description,
        timestamp: a.unlockedAt || new Date().toISOString(),
        color: '#F59E0B',
      });
    });

  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="p-5 md:p-6 rounded-2xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] shadow-xs">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-[#8B5CF6]">
          <Clock className="w-4 h-4" />
        </div>
        <h3 className="font-bold text-base text-[#17233F] dark:text-[#F1F5FF]">
          সাম্প্রতিক অ্যাক্টিভিটি
        </h3>
      </div>

      <div className="space-y-3">
        {activities.length === 0 ? (
          <p className="text-xs text-[#77839B] dark:text-[#A7B5CC] py-6 text-center">
            এখনো কোনো কার্যকলাপ রেকর্ড হয়নি
          </p>
        ) : (
          activities.slice(0, 6).map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 p-2.5 rounded-xl bg-[#F5F7FC]/70 dark:bg-[#122440]/50 hover:bg-[#EAEFF9] dark:hover:bg-[#182C4E] transition-colors"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white shadow-xs"
                style={{ backgroundColor: item.color }}
              >
                {item.type === 'session' && <Flame className="w-4 h-4" />}
                {item.type === 'task' && <CheckCircle2 className="w-4 h-4" />}
                {item.type === 'achievement' && <Award className="w-4 h-4" />}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#17233F] dark:text-[#F1F5FF] truncate">
                  {item.title}
                </p>
                <p className="text-[11px] text-[#77839B] dark:text-[#A7B5CC] truncate mt-0.5">
                  {item.subtitle}
                </p>
              </div>

              <div className="text-[10px] text-[#77839B] dark:text-[#A7B5CC] shrink-0 font-medium">
                {formatBengaliDate(item.timestamp)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
