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
  Tenant,
  TenantMember,
  PaymentGatewayConfig,
  PaymentGatewayType,
  SubscriptionPlan,
  PaymentTransaction,
  Certificate,
  AppSignature,
} from '../../types';
import {
  INITIAL_USER,
  INITIAL_ALL_USERS,
  INITIAL_TENANTS,
  INITIAL_TENANT_MEMBERS,
  INITIAL_PAYMENT_GATEWAYS,
  INITIAL_SUBSCRIPTION_PLANS,
  INITIAL_TRANSACTIONS,
  INITIAL_SUBJECTS,
  INITIAL_SESSIONS,
  INITIAL_TASKS,
  INITIAL_PLANS,
  INITIAL_NOTES,
  INITIAL_ACHIEVEMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_CERTIFICATES,
  INITIAL_SIGNATURES,
} from './seedData';
import { calculateStreak } from '../utils/streak';
import { getDateKey, DEFAULT_TIMEZONE } from '../utils/date-utils';

const STORAGE_KEYS = {
  USER: 'focusstudy_user',
  ALL_USERS: 'focusstudy_all_users',
  TENANTS: 'focusstudy_tenants',
  ACTIVE_TENANT_ID: 'focusstudy_active_tenant_id',
  TENANT_MEMBERS: 'focusstudy_tenant_members',
  PAYMENT_GATEWAYS: 'focusstudy_payment_gateways',
  SUBSCRIPTION_PLANS: 'focusstudy_subscription_plans',
  TRANSACTIONS: 'focusstudy_transactions',
  SUBJECTS: 'focusstudy_subjects',
  SESSIONS: 'focusstudy_sessions',
  TASKS: 'focusstudy_tasks',
  PLANS: 'focusstudy_plans',
  NOTES: 'focusstudy_notes',
  ACHIEVEMENTS: 'focusstudy_achievements',
  NOTIFICATIONS: 'focusstudy_notifications',
  ACTIVE_TIMER: 'focusstudy_active_timer',
  CERTIFICATES: 'focusstudy_certificates',
  SIGNATURES: 'focusstudy_signatures',
};

const memoryStore = new Map<string, string>();

function loadItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    const item = memoryStore.get(key);
    return item ? JSON.parse(item) : fallback;
  }
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error loading key ${key}:`, e);
    return fallback;
  }
}

function saveItem<T>(key: string, val: T): void {
  if (typeof window === 'undefined') {
    memoryStore.set(key, JSON.stringify(val));
    return;
  }
  try {
    localStorage.setItem(key, JSON.stringify(val));
    window.dispatchEvent(new Event('focusstudy_storage_updated'));
  } catch (e) {
    console.error(`Error saving key ${key}:`, e);
  }
}

export const FocusStudyStore = {
  // Current Active User
  getUser(): UserProfile {
    return loadItem(STORAGE_KEYS.USER, INITIAL_USER);
  },
  setUser(user: UserProfile) {
    saveItem(STORAGE_KEYS.USER, user);
    // Also keep in allUsers list in sync
    const allUsers = this.getAllUsers();
    const idx = allUsers.findIndex((u) => u.uid === user.uid || u.email === user.email);
    if (idx >= 0) {
      allUsers[idx] = { ...allUsers[idx], ...user };
    } else {
      allUsers.push(user);
    }
    this.setAllUsers(allUsers);
  },

  // All Users Platform Directory & Blocking
  getAllUsers(): UserProfile[] {
    return loadItem(STORAGE_KEYS.ALL_USERS, INITIAL_ALL_USERS);
  },
  setAllUsers(users: UserProfile[]) {
    saveItem(STORAGE_KEYS.ALL_USERS, users);
  },
  blockUser(uid: string, reason = 'প্ল্যাটফর্ম অ্যাডমিন কর্তৃক সাময়িকভাবে অ্যাকাউন্ট স্থগিত করা হয়েছে।') {
    const users = this.getAllUsers().map((u) =>
      u.uid === uid
        ? {
            ...u,
            isBlocked: true,
            blockedReason: reason,
            blockedAt: new Date().toISOString(),
          }
        : u
    );
    this.setAllUsers(users);

    const currentUser = this.getUser();
    if (currentUser.uid === uid) {
      this.setUser({
        ...currentUser,
        isBlocked: true,
        blockedReason: reason,
        blockedAt: new Date().toISOString(),
      });
    }
  },
  unblockUser(uid: string) {
    const users = this.getAllUsers().map((u) =>
      u.uid === uid
        ? {
            ...u,
            isBlocked: false,
            blockedReason: undefined,
            blockedAt: undefined,
          }
        : u
    );
    this.setAllUsers(users);

    const currentUser = this.getUser();
    if (currentUser.uid === uid) {
      this.setUser({
        ...currentUser,
        isBlocked: false,
        blockedReason: undefined,
        blockedAt: undefined,
      });
    }
  },
  switchActiveUser(uid: string) {
    const allUsers = this.getAllUsers();
    const target = allUsers.find((u) => u.uid === uid);
    if (target) {
      saveItem(STORAGE_KEYS.USER, target);
      if (target.activeTenantId) {
        this.setActiveTenantId(target.activeTenantId);
      }
    }
  },

  // Tenants Management
  getTenants(): Tenant[] {
    return loadItem(STORAGE_KEYS.TENANTS, INITIAL_TENANTS);
  },
  setTenants(tenants: Tenant[]) {
    saveItem(STORAGE_KEYS.TENANTS, tenants);
  },
  getActiveTenantId(): string {
    const tenants = this.getTenants();
    const stored = loadItem(
      STORAGE_KEYS.ACTIVE_TENANT_ID,
      tenants[0]?.id || 'tenant-personal-workspace'
    );
    // Ensure it exists in list
    return tenants.some((t) => t.id === stored) ? stored : (tenants[0]?.id || 'tenant-personal-workspace');
  },
  setActiveTenantId(id: string) {
    saveItem(STORAGE_KEYS.ACTIVE_TENANT_ID, id);
    const user = this.getUser();
    if (user.activeTenantId !== id) {
      this.setUser({ ...user, activeTenantId: id });
    }
  },
  getActiveTenant(): Tenant {
    const tenants = this.getTenants();
    const activeId = this.getActiveTenantId();
    return tenants.find((t) => t.id === activeId) || tenants[0] || INITIAL_TENANTS[0];
  },
  createTenant(params: {
    name: string;
    type: 'academy' | 'coaching' | 'study_group' | 'institution' | 'personal';
    description?: string;
    subscriptionPlanId?: string;
  }): Tenant {
    const user = this.getUser();
    const tenants = this.getTenants();
    const slug = params.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || `org-${Date.now()}`;
    const newTenant: Tenant = {
      id: `tenant_${Date.now()}`,
      name: params.name,
      slug,
      type: params.type,
      ownerId: user.uid,
      ownerEmail: user.email,
      description: params.description || '',
      subscriptionPlanId: params.subscriptionPlanId || 'free',
      subscriptionStatus: 'active',
      billingCycle: 'monthly',
      maxMembers: params.subscriptionPlanId === 'academy' ? 500 : 5,
      memberCount: 1,
      isSuspended: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.setTenants([newTenant, ...tenants]);

    // Add owner as first member
    const members = this.getTenantMembers();
    const newMember: TenantMember = {
      id: `tm_${Date.now()}`,
      tenantId: newTenant.id,
      userId: user.uid,
      userName: user.displayName,
      userEmail: user.email,
      role: 'owner',
      joinedAt: new Date().toISOString(),
    };
    this.setTenantMembers([newMember, ...members]);
    this.setActiveTenantId(newTenant.id);

    return newTenant;
  },
  updateTenant(id: string, updates: Partial<Tenant>) {
    const tenants = this.getTenants().map((t) =>
      t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
    );
    this.setTenants(tenants);
  },
  toggleTenantSuspension(id: string, reason?: string) {
    const tenants = this.getTenants().map((t) =>
      t.id === id
        ? {
            ...t,
            isSuspended: !t.isSuspended,
            suspendedReason: !t.isSuspended ? (reason || 'প্ল্যাটফর্ম অ্যাডমিন কর্তৃক স্থগিত') : undefined,
            updatedAt: new Date().toISOString(),
          }
        : t
    );
    this.setTenants(tenants);
  },

  // Tenant Members
  getTenantMembers(): TenantMember[] {
    return loadItem(STORAGE_KEYS.TENANT_MEMBERS, INITIAL_TENANT_MEMBERS);
  },
  setTenantMembers(members: TenantMember[]) {
    saveItem(STORAGE_KEYS.TENANT_MEMBERS, members);
  },
  addTenantMember(tenantId: string, member: Omit<TenantMember, 'id' | 'tenantId' | 'joinedAt'>) {
    const members = this.getTenantMembers();
    const newMember: TenantMember = {
      ...member,
      id: `tm_${Date.now()}`,
      tenantId,
      joinedAt: new Date().toISOString(),
    };
    this.setTenantMembers([...members, newMember]);

    // Update tenant member count
    const count = members.filter((m) => m.tenantId === tenantId).length + 1;
    this.updateTenant(tenantId, { memberCount: count });
    return newMember;
  },

  // Payment Gateways (bKash, Nagad, Rocket)
  getPaymentGateways(): PaymentGatewayConfig[] {
    return loadItem(STORAGE_KEYS.PAYMENT_GATEWAYS, INITIAL_PAYMENT_GATEWAYS);
  },
  setPaymentGateways(gateways: PaymentGatewayConfig[]) {
    saveItem(STORAGE_KEYS.PAYMENT_GATEWAYS, gateways);
  },
  updatePaymentGateway(id: PaymentGatewayType, updates: Partial<PaymentGatewayConfig>) {
    const gateways = this.getPaymentGateways().map((g) =>
      g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g
    );
    this.setPaymentGateways(gateways);
  },

  // Subscription Plans Maintainer
  getSubscriptionPlans(): SubscriptionPlan[] {
    return loadItem(STORAGE_KEYS.SUBSCRIPTION_PLANS, INITIAL_SUBSCRIPTION_PLANS);
  },
  setSubscriptionPlans(plans: SubscriptionPlan[]) {
    saveItem(STORAGE_KEYS.SUBSCRIPTION_PLANS, plans);
  },
  updateSubscriptionPlan(id: string, updates: Partial<SubscriptionPlan>) {
    const plans = this.getSubscriptionPlans().map((p) =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    );
    this.setSubscriptionPlans(plans);
  },
  addSubscriptionPlan(plan: SubscriptionPlan) {
    const plans = this.getSubscriptionPlans();
    this.setSubscriptionPlans([...plans, { ...plan, updatedAt: new Date().toISOString() }]);
  },

  // Payment Transactions & Approvals
  getTransactions(): PaymentTransaction[] {
    return loadItem(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
  },
  setTransactions(txs: PaymentTransaction[]) {
    saveItem(STORAGE_KEYS.TRANSACTIONS, txs);
  },
  submitPaymentTransaction(data: {
    gateway: PaymentGatewayType;
    senderNumber: string;
    trxId: string;
    planId: string;
    billingCycle: 'monthly' | 'yearly';
    amount: number;
    tenantId?: string;
  }): PaymentTransaction {
    const user = this.getUser();
    const plans = this.getSubscriptionPlans();
    const targetPlan = plans.find((p) => p.id === data.planId);
    const activeTenant = this.getActiveTenant();

    const newTx: PaymentTransaction = {
      id: `tx_${Date.now()}`,
      userId: user.uid,
      userName: user.displayName,
      userEmail: user.email,
      tenantId: data.tenantId || activeTenant?.id,
      tenantName: activeTenant?.name || 'ব্যক্তিগত অ্যাকাউন্ট',
      gateway: data.gateway,
      senderNumber: data.senderNumber,
      trxId: data.trxId.trim().toUpperCase(),
      planId: data.planId,
      planName: targetPlan?.name || data.planId,
      billingCycle: data.billingCycle,
      amount: data.amount,
      currency: 'BDT',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const txs = this.getTransactions();
    this.setTransactions([newTx, ...txs]);

    // Send in-app notification to user
    const notifs = this.getNotifications();
    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: user.uid,
      type: 'payment_status',
      title: `${data.gateway.toUpperCase()} পেমেন্ট সাবমিট হয়েছে`,
      message: `TrxID: ${newTx.trxId} যাচাই করা হচ্ছে। প্ল্যাটফর্ম অ্যাডমিন অনুমোদন করার সাথে সাথে প্ল্যান সক্রিয় হবে।`,
      isRead: false,
      link: 'pricing',
      createdAt: new Date().toISOString(),
    };
    this.setNotifications([notif, ...notifs]);

    return newTx;
  },
  approvePaymentTransaction(txId: string, adminEmail = 'mustafa.rahman.official@gmail.com') {
    const txs = this.getTransactions();
    const tx = txs.find((t) => t.id === txId);
    if (!tx) return;

    const updatedTxs = txs.map((t) =>
      t.id === txId
        ? {
            ...t,
            status: 'approved' as const,
            approvedBy: adminEmail,
            approvedAt: new Date().toISOString(),
          }
        : t
    );
    this.setTransactions(updatedTxs);

    // Automatically upgrade the tenant subscription
    if (tx.tenantId) {
      const expiresAt = new Date();
      if (tx.billingCycle === 'yearly') {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      } else {
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      }

      this.updateTenant(tx.tenantId, {
        subscriptionPlanId: tx.planId,
        subscriptionStatus: 'active',
        billingCycle: tx.billingCycle,
        planExpiresAt: expiresAt.toISOString(),
      });
    }

    // Automatically upgrade the user subscription
    const user = this.getUser();
    if (user.uid === tx.userId) {
      this.setUser({
        ...user,
        subscriptionTier: tx.planId as SubscriptionTier,
        subscriptionStatus: 'active',
      });
    }

    // Add success notification
    const notifs = this.getNotifications();
    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: tx.userId,
      type: 'subscription_update',
      title: 'পেমেন্ট অনুমোদিত হয়েছে! 🎉',
      message: `আপনার ${tx.planName} সাবস্ক্রিপশন সফলভাবে সক্রিয় করা হয়েছে। ধন্যবাদ!`,
      isRead: false,
      link: 'pricing',
      createdAt: new Date().toISOString(),
    };
    this.setNotifications([notif, ...notifs]);
  },
  rejectPaymentTransaction(txId: string, reason: string, adminEmail = 'mustafa.rahman.official@gmail.com') {
    const txs = this.getTransactions();
    const updatedTxs = txs.map((t) =>
      t.id === txId
        ? {
            ...t,
            status: 'rejected' as const,
            rejectionReason: reason,
            approvedBy: adminEmail,
            approvedAt: new Date().toISOString(),
          }
        : t
    );
    this.setTransactions(updatedTxs);

    const tx = txs.find((t) => t.id === txId);
    if (tx) {
      const notifs = this.getNotifications();
      const notif: AppNotification = {
        id: `notif_${Date.now()}`,
        userId: tx.userId,
        type: 'payment_status',
        title: 'পেমেন্ট বাতিল হয়েছে',
        message: `TrxID: ${tx.trxId} এর পেমেন্ট অনুরোধ বাতিল করা হয়েছে। কারণ: ${reason}`,
        isRead: false,
        link: 'pricing',
        createdAt: new Date().toISOString(),
      };
      this.setNotifications([notif, ...notifs]);
    }
  },

  // Subjects
  getSubjects(): Subject[] {
    return loadItem(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
  },
  setSubjects(subs: Subject[]) {
    saveItem(STORAGE_KEYS.SUBJECTS, subs);
  },
  addSubject(sub: Omit<Subject, 'id' | 'createdAt' | 'updatedAt' | 'isArchived'>) {
    const subs = this.getSubjects();
    const activeTenantId = this.getActiveTenantId();
    const newSub: Subject = {
      ...sub,
      tenantId: activeTenantId,
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

  // Tasks
  getTasks(): Task[] {
    return loadItem(STORAGE_KEYS.TASKS, INITIAL_TASKS);
  },
  setTasks(tasks: Task[]) {
    saveItem(STORAGE_KEYS.TASKS, tasks);
  },
  addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) {
    const tasks = this.getTasks();
    const activeTenantId = this.getActiveTenantId();
    const newTask: Task = {
      ...task,
      tenantId: activeTenantId,
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

  // Study Plans
  getStudyPlans(): StudyPlan[] {
    return loadItem(STORAGE_KEYS.PLANS, INITIAL_PLANS);
  },
  setStudyPlans(plans: StudyPlan[]) {
    saveItem(STORAGE_KEYS.PLANS, plans);
  },
  addStudyPlan(plan: Omit<StudyPlan, 'id' | 'createdAt' | 'updatedAt' | 'completedMinutes'>) {
    const plans = this.getStudyPlans();
    const activeTenantId = this.getActiveTenantId();
    const newPlan: StudyPlan = {
      ...plan,
      tenantId: activeTenantId,
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

  // Focus Sessions
  getSessions(): FocusSession[] {
    return loadItem(STORAGE_KEYS.SESSIONS, INITIAL_SESSIONS);
  },
  setSessions(sessions: FocusSession[]) {
    saveItem(STORAGE_KEYS.SESSIONS, sessions);
  },
  recordSession(session: FocusSession) {
    const sessions = this.getSessions();
    const activeTenantId = this.getActiveTenantId();
    const enrichedSession = { ...session, tenantId: activeTenantId };
    this.setSessions([enrichedSession, ...sessions]);

    if (session.taskId && session.isCompleted) {
      const task = this.getTasks().find((t) => t.id === session.taskId);
      if (task && task.status === 'pending') {
        this.updateTask(task.id, { status: 'in_progress' });
      }
    }

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

  // Notes
  getNotes(): Note[] {
    return loadItem(STORAGE_KEYS.NOTES, INITIAL_NOTES);
  },
  setNotes(notes: Note[]) {
    saveItem(STORAGE_KEYS.NOTES, notes);
  },
  addNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) {
    const notes = this.getNotes();
    const activeTenantId = this.getActiveTenantId();
    const newNote: Note = {
      ...note,
      tenantId: activeTenantId,
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

  // Achievements
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

  // Notifications
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
      message: `আপনি FocusStudy ${tier.toUpperCase()} প্যাকেজে উন্নীত হয়েছেন। সমস্ত সুবিধা সক্রিয়!`,
      isRead: false,
      link: 'pricing',
      createdAt: new Date().toISOString(),
    };
    this.setNotifications([newNotif, ...notifs]);
  },

  // Certificates
  getCertificates(): Certificate[] {
    return loadItem(STORAGE_KEYS.CERTIFICATES, INITIAL_CERTIFICATES);
  },

  setCertificates(certs: Certificate[]): void {
    saveItem(STORAGE_KEYS.CERTIFICATES, certs);
  },

  issueCertificate(
    certData: Omit<
      Certificate,
      | 'id'
      | 'certificateNumber'
      | 'issueDate'
      | 'verificationCode'
      | 'isUnlocked'
      | 'signatoryName'
      | 'signatoryTitle'
      | 'adminSignatoryName'
      | 'adminSignatoryTitle'
    > & Partial<Certificate>
  ): Certificate {
    const certs = this.getCertificates();
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const newCert: Certificate = {
      ...certData,
      id: certData.id || `cert_${Date.now()}_${randNum}`,
      certificateNumber: certData.certificateNumber || `FS-CERT-2026-BD-${randNum}`,
      issueDate: certData.issueDate || new Date().toISOString(),
      verificationCode: certData.verificationCode || `VRF-2026-${randNum}-VER`,
      isUnlocked: certData.isUnlocked ?? true,
      signatoryName: certData.signatoryName || 'প্রফেসর ড. মাহফুজুল ইসলাম',
      signatoryTitle: certData.signatoryTitle || 'একাডেমিক ডিরেক্টর',
      adminSignatoryName: certData.adminSignatoryName || 'মুস্তাফা রহমান',
      adminSignatoryTitle: certData.adminSignatoryTitle || 'চিফ প্ল্যাটফর্ম অ্যাডমিনিস্ট্রেটর, FocusStudy',
    };
    this.setCertificates([newCert, ...certs]);

    // Send notification
    const user = this.getUser();
    const notifs = this.getNotifications();
    const certNotif: AppNotification = {
      id: `notif_cert_${Date.now()}`,
      userId: user.uid,
      type: 'achievement_unlocked',
      title: '🎉 নতুন প্রশংসাপত্র / সনদপত্র অর্জিত হয়েছে!',
      message: `"${newCert.title}" সনদপত্র সফলভাবে ইস্যু হয়েছে। এখনই ডাউনলোড বা প্রিন্ট করুন।`,
      isRead: false,
      link: 'certificates',
      createdAt: new Date().toISOString(),
    };
    this.setNotifications([certNotif, ...notifs]);

    return newCert;
  },

  deleteCertificate(certId: string): void {
    const certs = this.getCertificates().filter((c) => c.id !== certId);
    this.setCertificates(certs);
  },

  // Signatures
  getSignatures(): AppSignature[] {
    return loadItem(STORAGE_KEYS.SIGNATURES, INITIAL_SIGNATURES);
  },

  setSignatures(sigs: AppSignature[]): void {
    saveItem(STORAGE_KEYS.SIGNATURES, sigs);
  },

  saveSignature(signature: AppSignature): void {
    const sigs = this.getSignatures();
    const idx = sigs.findIndex((s) => s.id === signature.id || s.role === signature.role);
    if (idx >= 0) {
      sigs[idx] = { ...signature, updatedAt: new Date().toISOString() };
    } else {
      sigs.push({ ...signature, updatedAt: new Date().toISOString() });
    }
    this.setSignatures(sigs);
  },

  getSignatureByRole(role: string): AppSignature | undefined {
    return this.getSignatures().find((s) => s.role === role);
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

  const activeTenantId = FocusStudyStore.getActiveTenantId();
  const allTenants = FocusStudyStore.getTenants();
  const activeTenant = allTenants.find((t) => t.id === activeTenantId) || allTenants[0];

  return {
    user: FocusStudyStore.getUser(),
    allUsers: FocusStudyStore.getAllUsers(),
    tenants: allTenants,
    activeTenant,
    tenantMembers: FocusStudyStore.getTenantMembers().filter((m) => m.tenantId === activeTenant?.id),
    allTenantMembers: FocusStudyStore.getTenantMembers(),
    paymentGateways: FocusStudyStore.getPaymentGateways(),
    subscriptionPlans: FocusStudyStore.getSubscriptionPlans(),
    paymentTransactions: FocusStudyStore.getTransactions(),
    subjects: FocusStudyStore.getSubjects(),
    tasks: FocusStudyStore.getTasks(),
    studyPlans: FocusStudyStore.getStudyPlans(),
    sessions: FocusStudyStore.getSessions(),
    notes: FocusStudyStore.getNotes(),
    achievements: FocusStudyStore.getAchievements(),
    certificates: FocusStudyStore.getCertificates(),
    signatures: FocusStudyStore.getSignatures(),
    notifications: FocusStudyStore.getNotifications(),
    activeTimer: FocusStudyStore.getActiveTimer(),
  };
}
