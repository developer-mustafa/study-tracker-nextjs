import { useEffect, useState } from 'react';
import {
  UserProfile,
  Subject,
  StudyPlan,
  Task,
  FocusSession,
  ActiveTimerState,
  Note,
  Achievement,
  AppNotification,
  SubscriptionTier,
} from '../../types';
import {
  INITIAL_USER,
  INITIAL_SUBJECTS,
  INITIAL_SESSIONS,
  INITIAL_TASKS,
  INITIAL_PLANS,
  INITIAL_NOTES,
  INITIAL_ACHIEVEMENTS,
  INITIAL_NOTIFICATIONS,
} from './seedData';
import { calculateStreak } from '../utils/streak';
import { getDateKey, DEFAULT_TIMEZONE } from '../utils/date-utils';

const STORAGE_KEYS = {
  USER: 'focusstudy_user',
  SUBJECTS: 'focusstudy_subjects',
  SESSIONS: 'focusstudy_sessions',
  TASKS: 'focusstudy_tasks',
  PLANS: 'focusstudy_plans',
  NOTES: 'focusstudy_notes',
  ACHIEVEMENTS: 'focusstudy_achievements',
  NOTIFICATIONS: 'focusstudy_notifications',
  ACTIVE_TIMER: 'focusstudy_active_timer',
};

function loadItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error loading key ${key}:`, e);
    return fallback;
  }
}

function saveItem<T>(key: string, val: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
    window.dispatchEvent(new Event('focusstudy_storage_updated'));
  } catch (e) {
    console.error(`Error saving key ${key}:`, e);
  }
}

export const FocusStudyStore = {
  getUser(): UserProfile {
    return loadItem(STORAGE_KEYS.USER, INITIAL_USER);
  },
  setUser(user: UserProfile) {
    saveItem(STORAGE_KEYS.USER, user);
  },

  getSubjects(): Subject[] {
    return loadItem(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
  },
  setSubjects(subs: Subject[]) {
    saveItem(STORAGE_KEYS.SUBJECTS, subs);
  },
  addSubject(sub: Omit<Subject, 'id' | 'createdAt' | 'updatedAt' | 'isArchived'>) {
    const subs = this.getSubjects();
    const newSub: Subject = {
      ...sub,
      id: `sub_${Date.now()}`,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.setSubjects([newSub, ...subs]);
    return newSub;
  },
  updateSubject(id: string, updates: Partial<Subject>) {
    const subs = this.getSubjects().map((s) =>
      s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
    );
    this.setSubjects(subs);
  },
  deleteSubject(id: string) {
    this.setSubjects(this.getSubjects().filter((s) => s.id !== id));
  },

  getTasks(): Task[] {
    return loadItem(STORAGE_KEYS.TASKS, INITIAL_TASKS);
  },
  setTasks(tasks: Task[]) {
    saveItem(STORAGE_KEYS.TASKS, tasks);
  },
  addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) {
    const tasks = this.getTasks();
    const newTask: Task = {
      ...task,
      id: `task_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.setTasks([newTask, ...tasks]);
    return newTask;
  },
  updateTask(id: string, updates: Partial<Task>) {
    const tasks = this.getTasks().map((t) =>
      t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
    );
    this.setTasks(tasks);
  },
  deleteTask(id: string) {
    this.setTasks(this.getTasks().filter((t) => t.id !== id));
  },
  toggleTaskCompletion(id: string) {
    const tasks = this.getTasks();
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const isNowCompleted = task.status !== 'completed';
    this.updateTask(id, {
      status: isNowCompleted ? 'completed' : 'pending',
      completedAt: isNowCompleted ? new Date().toISOString() : undefined,
    });
    this.checkAchievements();
  },

  getStudyPlans(): StudyPlan[] {
    return loadItem(STORAGE_KEYS.PLANS, INITIAL_PLANS);
  },
  setStudyPlans(plans: StudyPlan[]) {
    saveItem(STORAGE_KEYS.PLANS, plans);
  },
  addStudyPlan(plan: Omit<StudyPlan, 'id' | 'createdAt' | 'updatedAt' | 'completedMinutes'>) {
    const plans = this.getStudyPlans();
    const newPlan: StudyPlan = {
      ...plan,
      id: `plan_${Date.now()}`,
      completedMinutes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.setStudyPlans([newPlan, ...plans]);
    return newPlan;
  },
  updateStudyPlan(id: string, updates: Partial<StudyPlan>) {
    const plans = this.getStudyPlans().map((p) =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    );
    this.setStudyPlans(plans);
  },
  deleteStudyPlan(id: string) {
    this.setStudyPlans(this.getStudyPlans().filter((p) => p.id !== id));
  },
  toggleTopicCompletion(planId: string, topicId: string) {
    const plans = this.getStudyPlans();
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;

    const updatedTopics = plan.topics.map((top) => {
      if (top.id === topicId) {
        const isComp = !top.isCompleted;
        return {
          ...top,
          isCompleted: isComp,
          completedAt: isComp ? new Date().toISOString() : undefined,
        };
      }
      return top;
    });

    const allFinished = updatedTopics.length > 0 && updatedTopics.every((t) => t.isCompleted);
    this.updateStudyPlan(planId, {
      topics: updatedTopics,
      status: allFinished ? 'completed' : 'in_progress',
    });
    this.checkAchievements();
  },

  getSessions(): FocusSession[] {
    return loadItem(STORAGE_KEYS.SESSIONS, INITIAL_SESSIONS);
  },
  setSessions(sessions: FocusSession[]) {
    saveItem(STORAGE_KEYS.SESSIONS, sessions);
  },
  recordSession(session: FocusSession) {
    const sessions = this.getSessions();
    this.setSessions([session, ...sessions]);

    // If attached to a task and completed, offer or auto update
    if (session.taskId && session.isCompleted) {
      const task = this.getTasks().find((t) => t.id === session.taskId);
      if (task && task.status === 'pending') {
        this.updateTask(task.id, { status: 'in_progress' });
      }
    }

    // Add in-app notification
    const user = this.getUser();
    if (session.isCompleted && (session.mode === 'focus' || session.mode === 'custom')) {
      const mins = Math.round(session.actualDurationSeconds / 60);
      const notifs = this.getNotifications();
      const newNotif: AppNotification = {
        id: `notif_${Date.now()}`,
        userId: user.uid,
        type: 'session_completed',
        title: 'ফোকাস সেশন সম্পন্ন!',
        message: `আপনি সফলভাবে ${mins} মিনিট পড়াশোনা সম্পন্ন করেছেন। দারুণ কাজ!`,
        isRead: false,
        link: 'progress',
        createdAt: new Date().toISOString(),
      };
      this.setNotifications([newNotif, ...notifs]);
    }

    this.checkAchievements();
  },

  getActiveTimer(): ActiveTimerState | null {
    return loadItem(STORAGE_KEYS.ACTIVE_TIMER, null);
  },
  setActiveTimer(timer: ActiveTimerState | null) {
    saveItem(STORAGE_KEYS.ACTIVE_TIMER, timer);
  },

  getNotes(): Note[] {
    return loadItem(STORAGE_KEYS.NOTES, INITIAL_NOTES);
  },
  setNotes(notes: Note[]) {
    saveItem(STORAGE_KEYS.NOTES, notes);
  },
  addNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) {
    const notes = this.getNotes();
    const newNote: Note = {
      ...note,
      id: `note_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.setNotes([newNote, ...notes]);
    return newNote;
  },
  updateNote(id: string, updates: Partial<Note>) {
    const notes = this.getNotes().map((n) =>
      n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
    );
    this.setNotes(notes);
  },
  deleteNote(id: string) {
    this.setNotes(this.getNotes().filter((n) => n.id !== id));
  },

  getAchievements(): Achievement[] {
    return loadItem(STORAGE_KEYS.ACHIEVEMENTS, INITIAL_ACHIEVEMENTS);
  },
  setAchievements(achievements: Achievement[]) {
    saveItem(STORAGE_KEYS.ACHIEVEMENTS, achievements);
  },
  checkAchievements() {
    const sessions = this.getSessions();
    const tasks = this.getTasks();
    const plans = this.getStudyPlans();
    const achievements = this.getAchievements();

    const qualifyingSessions = sessions.filter(
      (s) => s.isCompleted && (s.mode === 'focus' || s.mode === 'custom')
    );
    const totalMins = qualifyingSessions.reduce(
      (acc, s) => acc + Math.round(s.actualDurationSeconds / 60),
      0
    );
    const totalHours = Math.round((totalMins / 60) * 10) / 10;
    const completedTasksCount = tasks.filter((t) => t.status === 'completed').length;
    const completedPlansCount = plans.filter((p) => p.status === 'completed').length;
    const streakResult = calculateStreak(sessions, getDateKey(new Date(), DEFAULT_TIMEZONE));

    let hasChanges = false;
    const updated = achievements.map((ach) => {
      let currentProgress = ach.progress;
      let shouldUnlock = ach.isUnlocked;

      if (ach.id === 'ach-first-session') {
        currentProgress = qualifyingSessions.length;
        if (currentProgress >= 1) shouldUnlock = true;
      } else if (ach.id === 'ach-5-sessions') {
        currentProgress = qualifyingSessions.length;
        if (currentProgress >= 5) shouldUnlock = true;
      } else if (ach.id === 'ach-10-hours') {
        currentProgress = totalHours;
        if (currentProgress >= 10) shouldUnlock = true;
      } else if (ach.id === 'ach-5-streak') {
        currentProgress = streakResult.currentStreak;
        if (streakResult.longestStreak >= 5) shouldUnlock = true;
      } else if (ach.id === 'ach-7-streak') {
        currentProgress = streakResult.currentStreak;
        if (streakResult.longestStreak >= 7) shouldUnlock = true;
      } else if (ach.id === 'ach-30-streak') {
        currentProgress = streakResult.currentStreak;
        if (streakResult.longestStreak >= 30) shouldUnlock = true;
      } else if (ach.id === 'ach-25-tasks') {
        currentProgress = completedTasksCount;
        if (currentProgress >= 25) shouldUnlock = true;
      } else if (ach.id === 'ach-first-plan') {
        currentProgress = completedPlansCount;
        if (currentProgress >= 1) shouldUnlock = true;
      }

      if (shouldUnlock !== ach.isUnlocked || currentProgress !== ach.progress) {
        hasChanges = true;
        return {
          ...ach,
          progress: currentProgress,
          isUnlocked: shouldUnlock,
          unlockedAt: shouldUnlock && !ach.isUnlocked ? new Date().toISOString() : ach.unlockedAt,
        };
      }
      return ach;
    });

    if (hasChanges) {
      this.setAchievements(updated);
    }
  },

  getNotifications(): AppNotification[] {
    return loadItem(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  },
  setNotifications(notifs: AppNotification[]) {
    saveItem(STORAGE_KEYS.NOTIFICATIONS, notifs);
  },
  markNotificationRead(id: string) {
    const notifs = this.getNotifications().map((n) =>
      n.id === id ? { ...n, isRead: true } : n
    );
    this.setNotifications(notifs);
  },
  markAllNotificationsRead() {
    const notifs = this.getNotifications().map((n) => ({ ...n, isRead: true }));
    this.setNotifications(notifs);
  },
  clearNotifications() {
    this.setNotifications([]);
  },

  upgradeSubscription(tier: SubscriptionTier) {
    const user = this.getUser();
    const updatedUser: UserProfile = {
      ...user,
      subscriptionTier: tier,
      subscriptionStatus: tier === 'free' ? 'free' : 'active',
      updatedAt: new Date().toISOString(),
    };
    this.setUser(updatedUser);

    const notifs = this.getNotifications();
    const newNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: user.uid,
      type: 'subscription_update',
      title: 'সাবস্ক্রিপশন সফলভাবে আপডেট হয়েছে',
      message: `আপনি FocusStudy ${tier.toUpperCase()} প্যাকেজে উন্নীত হয়েছেন। সমস্ত প্রিমিয়াম সুবিধা উপভোগ করুন!`,
      isRead: false,
      link: 'pricing',
      createdAt: new Date().toISOString(),
    };
    this.setNotifications([newNotif, ...notifs]);
  },
};

/**
 * Custom React hook that subscribes to storage mutations
 */
export function useFocusStudyData() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setTick((t) => t + 1);
    window.addEventListener('focusstudy_storage_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('focusstudy_storage_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return {
    user: FocusStudyStore.getUser(),
    subjects: FocusStudyStore.getSubjects(),
    tasks: FocusStudyStore.getTasks(),
    studyPlans: FocusStudyStore.getStudyPlans(),
    sessions: FocusStudyStore.getSessions(),
    notes: FocusStudyStore.getNotes(),
    achievements: FocusStudyStore.getAchievements(),
    notifications: FocusStudyStore.getNotifications(),
    activeTimer: FocusStudyStore.getActiveTimer(),
  };
}
