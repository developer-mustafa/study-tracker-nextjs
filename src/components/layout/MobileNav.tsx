import {
  LayoutDashboard,
  Timer,
  CheckSquare,
  BookMarked,
  Layers,
  TrendingUp,
  FileText,
  Calendar,
  Award,
  Crown,
  Settings,
  ShieldCheck,
  X,
  Flame,
  Printer,
  GraduationCap,
} from 'lucide-react';
import { NavTab } from './AppSidebar';
import { toBengaliNumber } from '../../lib/utils/formatters';
import { useFocusStudyData } from '../../lib/storage/store';

interface MobileNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ activeTab, onSelectTab, isOpen, onClose }: MobileNavProps) {
  const { tasks, achievements, certificates } = useFocusStudyData();
  const pendingTasksCount = tasks.filter((t) => t.status !== 'completed').length;
  const unlockedAchievementsCount = achievements.filter((a) => a.isUnlocked).length;
  const unlockedCertsCount = certificates.filter((c) => c.isUnlocked).length;

  const allNavItems = [
    { id: 'dashboard' as NavTab, label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
    { id: 'timer' as NavTab, label: 'ফোকাস টাইমার', icon: Timer },
    {
      id: 'tasks' as NavTab,
      label: 'কাজসমূহ',
      icon: CheckSquare,
      badge: pendingTasksCount > 0 ? toBengaliNumber(pendingTasksCount) : null,
    },
    { id: 'plans' as NavTab, label: 'স্টাডি প্ল্যান', icon: BookMarked },
    { id: 'subjects' as NavTab, label: 'বিষয়সমূহ', icon: Layers },
    { id: 'progress' as NavTab, label: 'অগ্রগতি ও কার্ড', icon: TrendingUp },
    { id: 'reports' as NavTab, label: 'এ৪ রিপোর্ট ও প্রিন্ট', icon: Printer },
    {
      id: 'certificates' as NavTab,
      label: 'সনদ ও প্রশংসাপত্র',
      icon: GraduationCap,
      badge: toBengaliNumber(unlockedCertsCount),
    },
    { id: 'notes' as NavTab, label: 'নোটস ও রিভিশন', icon: FileText },
    { id: 'calendar' as NavTab, label: 'ক্যালেন্ডার', icon: Calendar },
    {
      id: 'achievements' as NavTab,
      label: 'অর্জনসমূহ',
      icon: Award,
      badge: toBengaliNumber(unlockedAchievementsCount),
    },
    { id: 'pricing' as NavTab, label: 'মূল্যতালিকা ও প্রো', icon: Crown },
    { id: 'admin' as NavTab, label: 'অ্যাডমিন ড্যাশবোর্ড', icon: ShieldCheck },
    { id: 'settings' as NavTab, label: 'সেটিংস', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />

          <div className="relative w-72 max-w-[80vw] bg-white dark:bg-[#0D1B32] h-full shadow-2xl flex flex-col z-10 border-r border-[#E6EAF2] dark:border-[#243754]">
            {/* Header */}
            <div className="h-16 px-4 flex items-center justify-between border-b border-[#E6EAF2] dark:border-[#243754]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#5B5CE2] to-[#8B5CF6] flex items-center justify-center text-white">
                  <Flame className="w-5 h-5" />
                </div>
                <span className="font-bold text-base text-[#17233F] dark:text-[#F1F5FF]">
                  FocusStudy
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-[#77839B] dark:text-[#A7B5CC] hover:bg-[#F5F7FC] dark:hover:bg-[#122440]"
                aria-label="বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {allNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      onClose();
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#5B5CE2] text-white font-semibold'
                        : 'text-[#77839B] dark:text-[#A7B5CC] hover:bg-[#F5F7FC] dark:hover:bg-[#122440]'
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                          isActive ? 'bg-white/20 text-white' : 'bg-indigo-100 text-[#5B5CE2]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Mobile Bottom Bar for 5 Quick Items */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-[#0D1B32] border-t border-[#E6EAF2] dark:border-[#243754] flex items-center justify-around px-2 z-40">
        {[
          { id: 'dashboard' as NavTab, label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
          { id: 'timer' as NavTab, label: 'টাইমার', icon: Timer },
          { id: 'tasks' as NavTab, label: 'কাজসমূহ', icon: CheckSquare },
          { id: 'plans' as NavTab, label: 'প্ল্যান', icon: BookMarked },
          { id: 'progress' as NavTab, label: 'রিপোর্ট', icon: TrendingUp },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-lg transition-colors ${
                isActive
                  ? 'text-[#5B5CE2] dark:text-[#6865F2] font-bold'
                  : 'text-[#77839B] dark:text-[#A7B5CC]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
