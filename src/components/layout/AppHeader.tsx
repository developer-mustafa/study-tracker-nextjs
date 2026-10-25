import { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Sun,
  Moon,
  Bell,
  Play,
  Flame,
  CheckCircle2,
  Trash2,
  ShieldCheck,
  Crown,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useFocusStudyData, FocusStudyStore } from '../../lib/storage/store';
import {
  formatBengaliWeekdayDate,
  toBengaliNumber,
} from '../../lib/utils/formatters';
import { calculateStreak } from '../../lib/utils/streak';
import { getDateKey, DEFAULT_TIMEZONE } from '../../lib/utils/date-utils';
import { NavTab } from './AppSidebar';
import { TenantSwitcher } from '../tenants/TenantSwitcher';

interface AppHeaderProps {
  onOpenMobileMenu: () => void;
  onSelectTab: (tab: NavTab) => void;
}

export function AppHeader({ onOpenMobileMenu, onSelectTab }: AppHeaderProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const { user, openAuthModal, signOut, isPlatformAdmin } = useAuth();
  const { notifications, sessions, activeTenant } = useFocusStudyData();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const streak = calculateStreak(sessions, getDateKey(new Date(), DEFAULT_TIMEZONE));

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 px-4 md:px-6 bg-white dark:bg-[#0D1B32] border-b border-[#E6EAF2] dark:border-[#243754] flex items-center justify-between z-20 shrink-0 gap-3">
      {/* Left section: mobile hamburger + Tenant Switcher */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-xl text-[#77839B] dark:text-[#A7B5CC] hover:bg-[#F5F7FC] dark:hover:bg-[#122440] shrink-0"
          aria-label="মেনু খুলুন"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Multi-tenant Switcher */}
        <TenantSwitcher />

        <div className="hidden lg:flex items-center gap-2">
          <span className="text-xs font-semibold text-[#77839B] dark:text-[#A7B5CC]">
            {formatBengaliWeekdayDate(new Date())}
          </span>
          {streak.currentStreak > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 text-amber-600 dark:text-amber-400 text-xs font-bold">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{toBengaliNumber(streak.currentStreak)} দিনের স্ট্রিক</span>
            </div>
          )}
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        {/* Platform Admin Quick Button */}
        {isPlatformAdmin && (
          <button
            onClick={() => onSelectTab('admin')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-extrabold transition-all"
            title="সুপার অ্যাডমিন ড্যাশবোর্ড"
          >
            <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>সুপার অ্যাডমিন</span>
          </button>
        )}

        {/* Quick Start Timer button */}
        <button
          onClick={() => onSelectTab('timer')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#5B5CE2] to-[#8B5CF6] text-white text-xs font-semibold shadow-xs hover:shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span className="hidden sm:inline">টাইমার শুরু</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 rounded-xl text-[#77839B] dark:text-[#A7B5CC] hover:bg-[#F5F7FC] dark:hover:bg-[#122440] transition-colors relative"
            aria-label="বিজ্ঞপ্তি"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-[#0D1B32]">
                {toBengaliNumber(unreadCount)}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] shadow-xl p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-[#E6EAF2] dark:border-[#243754]">
                <h4 className="font-bold text-sm text-[#17233F] dark:text-[#F1F5FF]">
                  বিজ্ঞপ্তি ({toBengaliNumber(unreadCount)})
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => FocusStudyStore.markAllNotificationsRead()}
                    className="text-xs text-[#5B5CE2] dark:text-indigo-400 hover:underline font-medium"
                  >
                    সব পঠিত করুন
                  </button>
                  <button
                    onClick={() => FocusStudyStore.clearNotifications()}
                    className="text-[#77839B] dark:text-[#A7B5CC] hover:text-rose-500"
                    title="সব মুছুন"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-2 max-h-72 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#77839B] dark:text-[#A7B5CC]">
                    কোনো নতুন বিজ্ঞপ্তি নেই
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        FocusStudyStore.markNotificationRead(n.id);
                        if (n.link) onSelectTab(n.link as NavTab);
                        setIsNotifOpen(false);
                      }}
                      className={`p-2.5 rounded-xl text-left cursor-pointer transition-colors ${
                        n.isRead
                          ? 'bg-[#F5F7FC]/60 dark:bg-[#122440]/40'
                          : 'bg-indigo-50/60 dark:bg-indigo-950/40 border-l-2 border-[#5B5CE2]'
                      } hover:bg-[#EAEFF9] dark:hover:bg-[#182C4E]`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-[#17233F] dark:text-[#F1F5FF]">
                          {n.title}
                        </span>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-[#5B5CE2] shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-[11px] text-[#77839B] dark:text-[#A7B5CC] mt-0.5 line-clamp-2">
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-[#77839B] dark:text-[#A7B5CC] hover:bg-[#F5F7FC] dark:hover:bg-[#122440] transition-colors"
          aria-label={resolvedTheme === 'dark' ? 'লাইট মোড চালু করুন' : 'ডার্ক মোড চালু করুন'}
          title={resolvedTheme === 'dark' ? 'লাইট মোড' : 'ডার্ক মোড'}
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-[#17233F]" />
          )}
        </button>

        {/* User Account Popover */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 p-1 pl-2 pr-1 rounded-xl border border-[#E6EAF2] dark:border-[#243754] hover:bg-[#F5F7FC] dark:hover:bg-[#122440] transition-colors"
            aria-label="ব্যবহারকারী মেনু"
          >
            <span className="hidden sm:inline text-xs font-semibold text-[#17233F] dark:text-[#F1F5FF] max-w-[120px] truncate">
              {user.displayName}
            </span>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#5B5CE2] to-[#8B5CF6] text-white font-bold flex items-center justify-center text-xs">
              {user.displayName.charAt(0) || 'ম'}
            </div>
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] shadow-xl p-3 z-50">
              <div className="p-2 border-b border-[#E6EAF2] dark:border-[#243754]">
                <p className="text-sm font-bold text-[#17233F] dark:text-[#F1F5FF] truncate">
                  {user.displayName}
                </p>
                <p className="text-xs text-[#77839B] dark:text-[#A7B5CC] truncate font-mono">
                  {user.email}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300 uppercase">
                    <CheckCircle2 className="w-3 h-3 text-[#5B5CE2]" />
                    <span>{user.subscriptionTier}</span>
                  </span>
                  {isPlatformAdmin && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                      👑 সুপার অ্যাডমিন
                    </span>
                  )}
                </div>
              </div>

              <div className="py-2 space-y-1">
                {isPlatformAdmin && (
                  <button
                    onClick={() => {
                      onSelectTab('admin');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-bold rounded-lg text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 flex items-center justify-between"
                  >
                    <span>সুপার অ্যাডমিন ড্যাশবোর্ড</span>
                    <Crown className="w-3.5 h-3.5 text-amber-500" />
                  </button>
                )}
                <button
                  onClick={() => {
                    onSelectTab('settings');
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg text-[#17233F] dark:text-[#F1F5FF] hover:bg-[#F5F7FC] dark:hover:bg-[#122440]"
                >
                  প্রোফাইল ও সেটিংস
                </button>
                <button
                  onClick={() => {
                    onSelectTab('pricing');
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg text-[#5B5CE2] dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                >
                  সাবস্ক্রিপশন প্ল্যান
                </button>
                <button
                  onClick={() => {
                    openAuthModal();
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg text-[#17233F] dark:text-[#F1F5FF] hover:bg-[#F5F7FC] dark:hover:bg-[#122440]"
                >
                  Google অ্যাকাউন্ট দিয়ে সাইন-ইন
                </button>
                <button
                  onClick={async () => {
                    await signOut();
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                >
                  লগআউট করুন
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
