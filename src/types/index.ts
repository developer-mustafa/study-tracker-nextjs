export type StudyLevel =
  | 'school' // স্কুল শিক্ষার্থী
  | 'college' // কলেজ শিক্ষার্থী
  | 'university' // বিশ্ববিদ্যালয় শিক্ষার্থী
  | 'admission' // ভর্তি পরীক্ষার্থী
  | 'job_seeker' // চাকরিপ্রার্থী
  | 'programming' // প্রোগ্রামিং শিক্ষার্থী
  | 'self_learner'; // স্বশিক্ষায় আগ্রহী ব্যক্তি

export type TimerMode = 'focus' | 'short_break' | 'long_break' | 'custom';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export type PlanStatus = 'planned' | 'in_progress' | 'completed' | 'paused';

export type SubscriptionTier = 'free' | 'pro' | 'premium';
export type SubscriptionStatus = 'free' | 'active' | 'trialing' | 'past_due' | 'canceled' | 'expired';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  studyLevel: StudyLevel;
  primaryGoal: string;
  timezone: string;
  themePreference: 'light' | 'dark' | 'system';
  dailyGoalMinutes: number;
  weeklyGoalMinutes: number;
  onboardingCompleted: boolean;
  role: 'student' | 'admin';
  subscriptionTier: SubscriptionTier;
  subscriptionStatus: SubscriptionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: string;
  userId: string;
  name: string;
  color: string;
  icon: string;
  targetMinutes: number;
  description?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudyTopic {
  id: string;
  title: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface StudyPlan {
  id: string;
  userId: string;
  title: string;
  description: string;
  subjectIds: string[];
  startDate: string;
  targetDate: string;
  targetMinutes: number;
  completedMinutes: number;
  status: PlanStatus;
  topics: StudyTopic[];
  weeklyDays: number[]; // 0 = Sunday, 1 = Monday, etc.
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  subjectId?: string;
  studyPlanId?: string;
  priority: TaskPriority;
  status: TaskStatus;
  deadline?: string;
  estimatedMinutes?: number;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FocusSession {
  id: string;
  userId: string;
  mode: TimerMode;
  plannedDurationMinutes: number;
  actualDurationSeconds: number;
  startTime: string; // ISO string
  endTime: string; // ISO string
  subjectId?: string;
  taskId?: string;
  notes?: string;
  isCompleted: boolean;
  createdAt: string;
}

export interface ActiveTimerState {
  sessionId: string;
  mode: TimerMode;
  plannedSeconds: number;
  remainingSeconds: number;
  startTimestamp: number; // Date.now()
  deadlineTimestamp: number; // Date.now() + remaining
  isPaused: boolean;
  pauseTimestamp?: number;
  subjectId?: string;
  taskId?: string;
}

export interface DailyStat {
  dateKey: string; // YYYY-MM-DD in Asia/Dhaka
  focusedMinutes: number;
  completedSessions: number;
  completedTasks: number;
  dailyGoalMinutes: number;
  subjectMinutes: Record<string, number>; // subjectId -> minutes
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  subjectId?: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'sessions' | 'streak' | 'hours' | 'tasks' | 'plans';
  requiredCount: number;
  unlockedAt?: string;
  isUnlocked: boolean;
  progress: number; // e.g. 3 out of 5
}

export interface AppNotification {
  id: string;
  userId: string;
  type: 'reminder' | 'session_completed' | 'deadline' | 'goal_achieved' | 'achievement_unlocked' | 'subscription_update';
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  dailyGoalMinutes: number;
  weeklyGoalMinutes: number;
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  autoStartBreaks: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  timezone: string;
}
