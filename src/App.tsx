import { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppSidebar, NavTab } from './components/layout/AppSidebar';
import { AppHeader } from './components/layout/AppHeader';
import { MobileNav } from './components/layout/MobileNav';
import { WelcomeCard } from './components/dashboard/WelcomeCard';
import { SummaryCards } from './components/dashboard/SummaryCards';
import { StudyTimeChart } from './components/dashboard/StudyTimeChart';
import { SubjectProgress } from './components/dashboard/SubjectProgress';
import { RecentActivity } from './components/dashboard/RecentActivity';
import { FocusTimerView } from './components/timer/FocusTimerView';
import { TasksView } from './components/tasks/TasksView';
import { StudyPlansView } from './components/study-plans/StudyPlansView';
import { SubjectsView } from './components/subjects/SubjectsView';
import { ProgressView } from './components/progress/ProgressView';
import { NotesView } from './components/notes/NotesView';
import { CalendarView } from './components/calendar/CalendarView';
import { AchievementsView } from './components/achievements/AchievementsView';
import { PricingView } from './components/pricing/PricingView';
import { AdminView } from './components/admin/AdminView';
import { SettingsView } from './components/settings/SettingsView';
import { AuthModal } from './components/auth/AuthModal';
import { BlockedAccountView } from './components/auth/BlockedAccountView';
import { useFocusStudyData } from './lib/storage/store';
import { computeDashboardMetrics } from './lib/utils/analytics';
import { calculateStreak } from './lib/utils/streak';
import { getDateKey, DEFAULT_TIMEZONE } from './lib/utils/date-utils';

function FocusStudyApp() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { user, isBlocked } = useAuth();
  const { sessions, tasks, subjects, achievements } = useFocusStudyData();

  // If user is suspended by platform admin, display dedicated suspension view
  if (isBlocked) {
    return <BlockedAccountView />;
  }

  const metrics = computeDashboardMetrics(
    sessions,
    tasks,
    user.dailyGoalMinutes,
    getDateKey(new Date(), DEFAULT_TIMEZONE)
  );

  const streak = calculateStreak(sessions, getDateKey(new Date(), DEFAULT_TIMEZONE));

  return (
    <div className="min-h-screen flex bg-[#F5F7FC] dark:bg-[#071225] text-[#17233F] dark:text-[#F1F5FF] antialiased">
      {/* Sidebar for Desktop / Tablet */}
      <AppSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <AppHeader
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onSelectTab={setActiveTab}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              {/* Welcome Banner */}
              <WelcomeCard
                onStartTimer={() => setActiveTab('timer')}
                todayMinutes={metrics.todayFocusedMinutes}
                dailyGoalMinutes={metrics.dailyGoalMinutes}
              />

              {/* 6 Key Indicators */}
              <SummaryCards
                todayFocusedMinutes={metrics.todayFocusedMinutes}
                totalFocusedMinutes={metrics.totalFocusedMinutes}
                completedTasksCount={metrics.completedTasksCount}
                totalSessionsCount={metrics.totalSessionsCount}
                currentStreak={streak.currentStreak}
                dailyGoalCompletionPercent={metrics.dailyGoalCompletionPercent}
              />

              {/* Two Column Grid for Charts & Subjects */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <StudyTimeChart sessions={sessions} />
                <SubjectProgress
                  sessions={sessions}
                  subjects={subjects}
                  onManageSubjects={() => setActiveTab('subjects')}
                />
              </div>

              {/* Recent Activity */}
              <RecentActivity
                sessions={sessions}
                tasks={tasks}
                achievements={achievements}
                subjects={subjects}
              />
            </div>
          )}

          {activeTab === 'timer' && <FocusTimerView />}
          {activeTab === 'tasks' && <TasksView />}
          {activeTab === 'plans' && <StudyPlansView />}
          {activeTab === 'subjects' && <SubjectsView />}
          {activeTab === 'progress' && <ProgressView />}
          {activeTab === 'notes' && <NotesView />}
          {activeTab === 'calendar' && <CalendarView />}
          {activeTab === 'achievements' && <AchievementsView />}
          {activeTab === 'pricing' && <PricingView />}
          {activeTab === 'admin' && <AdminView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Mobile Nav & Drawer */}
      <MobileNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Auth & Onboarding Modal */}
      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FocusStudyApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
