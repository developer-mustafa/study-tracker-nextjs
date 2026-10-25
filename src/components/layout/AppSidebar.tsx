import React from 'react';
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
  ChevronLeft,
  ChevronRight,
  Flame,
  Printer,
  GraduationCap,
} from 'lucide-react';
import { toBengaliNumber } from '../../lib/utils/formatters';
import { useFocusStudyData } from '../../lib/storage/store';
import { useAuth } from '../../contexts/AuthContext';

export type NavTab =
  | 'dashboard'
  | 'timer'
  | 'tasks'
  | 'plans'
  | 'subjects'
  | 'progress'
  | 'reports'
  | 'certificates'
  | 'notes'
  | 'calendar'
  | 'achievements'
  | 'pricing'
  | 'admin'
  | 'settings';

interface AppSidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function AppSidebar({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
}: AppSidebarProps) {
  const { user, tasks, achievements, activeTenant, paymentTransactions, certificates } = useFocusStudyData();
  const { isPlatformAdmin } = useAuth();
  const pendingTasksCount = tasks.filter((t) => t.status !== 'completed').length;
  const unlockedAchievementsCount = achievements.filter((a) => a.isUnlocked).length;
  const unlockedCertsCount = certificates.filter((c) => c.isUnlocked).length;
  const pendingTxCount = paymentTransactions.filter((t) => t.status === 'pending').length;

  const navItems = [
    { id: 'dashboard' as NavTab, label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
    { id: 'timer' as NavTab, label: 'ফোকাস টাইমার', icon: Timer, highlight: true },
    {
      id: 'tasks' as NavTab,
      label: 'কাজসমূহ',
      icon: CheckSquare,
      badge: pendingTasksCount > 0 ? toBengaliNumber(pendingTasksCount) : null,
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
    },
    { id: 'plans' as NavTab, label: 'স্টাডি প্ল্যান', icon: BookMarked },
    { id: 'subjects' as NavTab, label: 'বিষয়সমূহ', icon: Layers },
    { id: 'progress' as NavTab, label: 'অগ্রগতি ও কার্ড', icon: TrendingUp },
    { id: 'reports' as NavTab, label: 'এ৪ রিপোর্ট ও প্রিন্ট', icon: Printer, tag: 'A4' },
    {
      id: 'certificates' as NavTab,
      label: 'সনদ ও প্রশংসাপত্র',
      icon: GraduationCap,
      badge: toBengaliNumber(unlockedCertsCount),
      badgeColor: 'bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-300',
    },
    { id: 'notes' as NavTab, label: 'নোটস ও রিভিশন', icon: FileText },
    { id: 'calendar' as NavTab, label: 'ক্যালেন্ডার', icon: Calendar },
    {
      id: 'achievements' as NavTab,
      label: 'অর্জনসমূহ',
      icon: Award,
      badge: toBengaliNumber(unlockedAchievementsCount),
      badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
    },
    {
      id: 'pricing' as NavTab,
      label: 'মূল্যতালিকা ও প্রো',
      icon: Crown,
      tag: 'PRO',
    },
    {
      id: 'admin' as NavTab,
      label: isPlatformAdmin ? '👑 সুপার অ্যাডমিন' : 'অ্যাডমিন ড্যাশবোর্ড',
      icon: ShieldCheck,
      badge: pendingTxCount > 0 ? toBengaliNumber(pendingTxCount) : null,
      badgeColor: 'bg-amber-500 text-white',
      highlight: isPlatformAdmin,
    },
    { id: 'settings' as NavTab, label: 'সেটিংস', icon: Settings },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col border-r border-[#E6EAF2] dark:border-[#243754] bg-white dark:bg-[#0D1B32] transition-all duration-300 select-none z-30 shrink-0 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#E6EAF2] dark:border-[#243754]">
        <div
          onClick={() => onSelectTab('dashboard')}
          className="flex items-center gap-3 cursor-pointer overflow-hidden"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#5B5CE2] to-[#8B5CF6] flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <span className="text-lg font-bold tracking-tight text-[#17233F] dark:text-[#F1F5FF]">
                FocusStudy
              </span>
              <span className="text-[11px] text-[#77839B] dark:text-[#A7B5CC] truncate font-medium">
                লক্ষ্য পূরণ করো
              </span>
            </div>
          )}
        </div>
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-[#77839B] hover:text-[#17233F] dark:text-[#A7B5CC] dark:hover:text-[#F1F5FF] hover:bg-[#F5F7FC] dark:hover:bg-[#122440] transition-colors"
          title={isCollapsed ? 'বড় করুন' : 'ছোট করুন'}
          aria-label="Toggle sidebar collapse"
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#5B5CE2] text-white shadow-md shadow-indigo-500/25 font-semibold'
                  : 'text-[#77839B] dark:text-[#A7B5CC] hover:bg-[#F5F7FC] dark:hover:bg-[#122440] hover:text-[#17233F] dark:hover:text-[#F1F5FF]'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                className={`w-5 h-5 shrink-0 ${
                  isActive ? 'text-white' : item.highlight ? 'text-[#5B5CE2] dark:text-[#6865F2]' : ''
                }`}
              />
              {!isCollapsed && (
                <span className="flex-1 text-left truncate">{item.label}</span>
              )}
              {!isCollapsed && item.badge && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              )}
              {!isCollapsed && item.tag && (
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-500 to-orange-500 text-white tracking-wider">
                  {item.tag}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User profile card at bottom */}
      <div className="p-3 border-t border-[#E6EAF2] dark:border-[#243754]">
        <div
          onClick={() => onSelectTab('settings')}
          className={`flex items-center gap-3 p-2 rounded-xl hover:bg-[#F5F7FC] dark:hover:bg-[#122440] cursor-pointer transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-950 text-[#5B5CE2] dark:text-indigo-400 font-bold flex items-center justify-center text-sm border border-indigo-200 dark:border-indigo-800 shrink-0">
            {user.displayName.charAt(0) || 'ফ'}
          </div>
          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <span className="text-xs font-semibold text-[#17233F] dark:text-[#F1F5FF] truncate">
                {user.displayName}
              </span>
              <span className="text-[10px] text-[#77839B] dark:text-[#A7B5CC] uppercase tracking-wider font-semibold">
                {user.subscriptionTier === 'free' ? 'ফ্রি প্ল্যান' : `${user.subscriptionTier} সদস্য`}
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
