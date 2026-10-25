import React, { useState } from 'react';
import {
  Users,
  CreditCard,
  Building2,
  ShieldCheck,
  ShieldAlert,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  Smartphone,
  Save,
  Plus,
  Trash2,
  Edit2,
  Ban,
  Check,
  UserCheck,
  Search,
  ExternalLink,
  Crown,
  Sparkles,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { FocusStudyStore, useFocusStudyData } from '../../lib/storage/store';
import {
  toBengaliNumber,
  formatBengaliDate,
  formatBengaliDuration,
} from '../../lib/utils/formatters';
import {
  PaymentGatewayConfig,
  PaymentGatewayType,
  SubscriptionPlan,
  UserProfile,
  Tenant,
} from '../../types';

type AdminTab = 'overview' | 'users' | 'tenants' | 'gateways' | 'plans' | 'transactions';

export function AdminView() {
  const { user, isPlatformAdmin, switchUser, switchTenant } = useAuth();
  const {
    allUsers,
    tenants,
    paymentGateways,
    subscriptionPlans,
    paymentTransactions,
    sessions,
  } = useFocusStudyData();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);

  // User Blocking Modal State
  const [blockingUser, setBlockingUser] = useState<UserProfile | null>(null);
  const [blockReason, setBlockReason] = useState('প্ল্যাটফর্ম ব্যবহারের নীতিমালা লঙ্ঘন');

  // Edit Gateway State
  const [gatewaysForm, setGatewaysForm] = useState<PaymentGatewayConfig[]>(paymentGateways);

  // Edit Plan State
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [newPlanModal, setNewPlanModal] = useState(false);
  const [newPlanForm, setNewPlanForm] = useState({
    id: '',
    name: '',
    tagline: '',
    priceMonthly: 499,
    priceYearly: 4990,
    maxStudents: 50,
    maxStudyPlans: 100,
    featuresText: 'আনলিমিটেড টাইমার\nকাস্টম ব্যাচ রুটিন\nউন্নত স্টাডি রিপোর্ট',
  });

  const showToast = (msg: string) => {
    setSavedSuccessMsg(msg);
    setTimeout(() => setSavedSuccessMsg(null), 4000);
  };

  // KPIs
  const totalUsersCount = allUsers.length;
  const blockedUsersCount = allUsers.filter((u) => u.isBlocked).length;
  const totalTenantsCount = tenants.length;
  const pendingTransactions = paymentTransactions.filter((t) => t.status === 'pending');
  const approvedTransactions = paymentTransactions.filter((t) => t.status === 'approved');
  const totalRevenue = approvedTransactions.reduce((acc, t) => acc + t.amount, 0);

  // User Blocking Handlers
  const handleConfirmBlock = () => {
    if (!blockingUser) return;
    FocusStudyStore.blockUser(blockingUser.uid, blockReason);
    setBlockingUser(null);
    showToast(`ব্যবহারকারী "${blockingUser.displayName}" সফলভাবে স্থগিত (Blocked) করা হয়েছে।`);
  };

  const handleUnblock = (targetUser: UserProfile) => {
    FocusStudyStore.unblockUser(targetUser.uid);
    showToast(`ব্যবহারকারী "${targetUser.displayName}" সফলভাবে সক্রিয় (Unblocked) করা হয়েছে।`);
  };

  // Gateway Update Handlers
  const handleUpdateGateway = (id: PaymentGatewayType, updates: Partial<PaymentGatewayConfig>) => {
    FocusStudyStore.updatePaymentGateway(id, updates);
    setGatewaysForm(FocusStudyStore.getPaymentGateways());
    showToast(`${id.toUpperCase()} পেমেন্ট গেটওয়ে সেটিংস সফলভাবে সংরক্ষিত হয়েছে!`);
  };

  // Plan Handlers
  const handleSavePlan = (plan: SubscriptionPlan) => {
    FocusStudyStore.updateSubscriptionPlan(plan.id, plan);
    setEditingPlan(null);
    showToast(`প্ল্যান "${plan.name}" সফলভাবে আপডেট হয়েছে।`);
  };

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanForm.name.trim() || !newPlanForm.id.trim()) return;
    const plan: SubscriptionPlan = {
      id: newPlanForm.id.trim().toLowerCase().replace(/\s+/g, '-'),
      name: newPlanForm.name.trim(),
      tagline: newPlanForm.tagline.trim(),
      priceMonthly: Number(newPlanForm.priceMonthly) || 0,
      priceYearly: Number(newPlanForm.priceYearly) || 0,
      maxStudents: Number(newPlanForm.maxStudents) || 10,
      maxStudyPlans: Number(newPlanForm.maxStudyPlans) || 20,
      isActive: true,
      features: newPlanForm.featuresText
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean),
      btnLabel: `${newPlanForm.name.trim()} নিন`,
    };
    FocusStudyStore.addSubscriptionPlan(plan);
    setNewPlanModal(false);
    showToast(`নতুন সাবস্ক্রিপশন প্ল্যান "${plan.name}" যুক্ত করা হয়েছে!`);
  };

  // Transaction Handlers
  const handleApproveTx = (txId: string) => {
    FocusStudyStore.approvePaymentTransaction(txId, 'mustafa.rahman.official@gmail.com');
    showToast('পেমেন্ট সফলভাবে অনুমোদিত এবং প্ল্যান সক্রিয় হয়েছে!');
  };

  const handleRejectTx = (txId: string) => {
    const reason = prompt('বাতিল করার কারণ লিখুন:', 'ভুল TrxID অথবা পেমেন্ট পাওয়া যায়নি');
    if (reason) {
      FocusStudyStore.rejectPaymentTransaction(txId, reason, 'mustafa.rahman.official@gmail.com');
      showToast('পেমেন্ট বাতিল করা হয়েছে।');
    }
  };

  // Filter Users
  const filteredUsers = allUsers.filter(
    (u) =>
      u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.studyLevel && u.studyLevel.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Toast */}
      {savedSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-600 text-white shadow-xl flex items-center justify-between animate-fade-in z-50">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-200" />
            <span className="font-bold text-xs md:text-sm">{savedSuccessMsg}</span>
          </div>
          <button
            onClick={() => setSavedSuccessMsg(null)}
            className="text-white/80 hover:text-white text-xs underline font-semibold"
          >
            বন্ধ করুন
          </button>
        </div>
      )}

      {/* Header & Super Admin Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs">
              👑 প্ল্যাটফর্ম সুপার অ্যাডমিন প্যানেল
            </span>
            <span className="text-xs font-semibold text-[#77839B] dark:text-[#A7B5CC]">
              {isPlatformAdmin ? 'সক্রিয় অ্যাডমিন: mustafa.rahman.official@gmail.com' : 'ডেমো মোড'}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-[#17233F] dark:text-[#F1F5FF] mt-1 tracking-tight">
            FocusStudy মাল্টি-টেন্যান্ট SaaS ম্যানেজমেন্ট
          </h2>
          <p className="text-xs md:text-sm text-[#77839B] dark:text-[#A7B5CC]">
            টেন্যান্ট অর্গানাইজেশন, ইউজার ব্লকিং, bKash/Nagad/Rocket গেটওয়ে ও সাবস্ক্রিপশন প্ল্যান মেইনটেইনার
          </p>
        </div>

        {/* Quick User Role Switcher for Testers */}
        <div className="p-2 rounded-2xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] flex items-center gap-2 text-xs">
          <span className="font-bold text-[#77839B] dark:text-[#A7B5CC] text-[11px] pl-1 hidden sm:inline">
            সুইচ করুন:
          </span>
          <button
            onClick={() => switchUser('user_mustafa_super')}
            className={`px-2.5 py-1.5 rounded-xl font-bold transition-all ${
              user.email === 'mustafa.rahman.official@gmail.com'
                ? 'bg-[#5B5CE2] text-white shadow-xs'
                : 'bg-[#F5F7FC] dark:bg-[#122440] text-[#17233F] dark:text-[#F1F5FF]'
            }`}
            title="সুপার অ্যাডমিন হিসেবে সুইচ করুন"
          >
            👑 সুপার অ্যাডমিন
          </button>
          <button
            onClick={() => switchUser('student_demo_101')}
            className={`px-2.5 py-1.5 rounded-xl font-bold transition-all ${
              user.uid === 'student_demo_101'
                ? 'bg-[#5B5CE2] text-white shadow-xs'
                : 'bg-[#F5F7FC] dark:bg-[#122440] text-[#17233F] dark:text-[#F1F5FF]'
            }`}
            title="সাধারণ শিক্ষার্থী হিসেবে সুইচ করুন"
          >
            🎓 শিক্ষার্থী
          </button>
          <button
            onClick={() => switchUser('user_spammer_blocked_105')}
            className={`px-2.5 py-1.5 rounded-xl font-bold transition-all ${
              user.isBlocked
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-[#F5F7FC] dark:bg-[#122440] text-[#17233F] dark:text-[#F1F5FF]'
            }`}
            title="ব্লকড একাউন্ট হিসেবে টেস্ট করুন"
          >
            🚫 ব্লকড টেস্ট
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#E6EAF2] dark:border-[#243754] custom-scrollbar">
        {[
          { id: 'overview' as AdminTab, label: 'প্ল্যাটফর্ম ওভারভিউ', icon: ShieldCheck },
          { id: 'users' as AdminTab, label: 'ব্যবহারকারী ও ব্লক কন্ট্রোল', icon: Users, badge: blockedUsersCount > 0 ? toBengaliNumber(blockedUsersCount) : null },
          { id: 'tenants' as AdminTab, label: 'মাল্টি-টেন্যান্ট একাডেমি', icon: Building2, badge: toBengaliNumber(totalTenantsCount) },
          { id: 'gateways' as AdminTab, label: 'পেমেন্ট গেটওয়ে (bKash/Nagad/Rocket)', icon: Smartphone },
          { id: 'plans' as AdminTab, label: 'সাবস্ক্রিপশন প্ল্যান মেইনটেইনার', icon: Crown },
          { id: 'transactions' as AdminTab, label: 'পেমেন্ট ট্রানজেকশন লেজার', icon: CreditCard, badge: pendingTransactions.length > 0 ? toBengaliNumber(pendingTransactions.length) : null, badgeColor: 'bg-amber-500 text-white' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#5B5CE2] text-white shadow-md shadow-indigo-500/20'
                  : 'text-[#77839B] dark:text-[#A7B5CC] hover:bg-white dark:hover:bg-[#0D1B32] hover:text-[#17233F] dark:hover:text-[#F1F5FF]'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${tab.badgeColor || 'bg-rose-500 text-white'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#77839B] dark:text-[#A7B5CC]">
                  মোট টেন্যান্ট / প্রতিষ্ঠান
                </span>
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-[#5B5CE2]">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-[#17233F] dark:text-[#F1F5FF]">
                {toBengaliNumber(totalTenantsCount)} টি
              </div>
              <p className="text-[11px] text-emerald-500 font-bold mt-1">
                একাডেমি ও কোচিং ব্যাচ
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#77839B] dark:text-[#A7B5CC]">
                  নিবন্ধিত শিক্ষার্থী ও ইউজার
                </span>
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-500">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-[#17233F] dark:text-[#F1F5FF]">
                {toBengaliNumber(totalUsersCount)} জন
              </div>
              <p className="text-[11px] text-rose-500 font-bold mt-1">
                স্থগিত: {toBengaliNumber(blockedUsersCount)} জন
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#77839B] dark:text-[#A7B5CC]">
                  সফল MFS রাজস্ব (৳)
                </span>
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-[#17233F] dark:text-[#F1F5FF]">
                ৳{toBengaliNumber(totalRevenue)}
              </div>
              <p className="text-[11px] text-emerald-500 font-bold mt-1">
                বিকাশ/নগদ/রকেট ভেরিফায়েড
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#77839B] dark:text-[#A7B5CC]">
                  অপেক্ষমাণ পেমেন্ট
                </span>
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-amber-500">
                {toBengaliNumber(pendingTransactions.length)} টি
              </div>
              <p className="text-[11px] text-[#77839B] dark:text-[#A7B5CC] mt-1">
                যাচাই ও অনুমোদন প্রয়োজন
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#77839B] dark:text-[#A7B5CC]">
                  প্ল্যাটফর্ম স্ট্যাটাস
                </span>
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500">
                  <CheckCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-lg font-black text-emerald-500 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span>সচল (Healthy)</span>
              </div>
              <p className="text-[11px] text-[#77839B] dark:text-[#A7B5CC] mt-1">
                Multi-Tenant SaaS
              </p>
            </div>
          </div>

          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600">
                  <Ban className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#17233F] dark:text-[#F1F5FF]">
                    ইউজার ব্লকিং ও নিরাপত্তা
                  </h4>
                  <p className="text-xs text-[#77839B] dark:text-[#A7B5CC]">
                    পলিসি লঙ্ঘনকারী অ্যাকাউন্ট তাৎক্ষণিক স্থগিত
                  </p>
                </div>
              </div>
              <p className="text-xs text-[#77839B] dark:text-[#A7B5CC] leading-relaxed">
                প্ল্যাটফর্ম সুপার অ্যাডমিন যেকোনো ব্যবহারকারীকে নির্দিষ্ট কারণসহ সাময়িক স্থগিত বা সচল করতে পারেন।
              </p>
              <button
                onClick={() => setActiveTab('users')}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-100"
              >
                ব্যবহারকারী তালিকা দেখুন
              </button>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#17233F] dark:text-[#F1F5FF]">
                    bKash, Nagad ও Rocket
                  </h4>
                  <p className="text-xs text-[#77839B] dark:text-[#A7B5CC]">
                    মার্চেন্ট নম্বর ও গেটওয়ে নির্দেশিকা
                  </p>
                </div>
              </div>
              <p className="text-xs text-[#77839B] dark:text-[#A7B5CC] leading-relaxed">
                অ্যাডমিন প্যানেল থেকে সরাসরি বিকাশ, নগদ ও রকেট মার্চেন্ট নম্বর এবং ফি পরিবর্তন করুন।
              </p>
              <button
                onClick={() => setActiveTab('gateways')}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-bold text-xs hover:bg-amber-100"
              >
                পেমেন্ট গেটওয়ে কনফিগার করুন
              </button>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-[#5B5CE2]">
                  <Crown className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#17233F] dark:text-[#F1F5FF]">
                    প্ল্যান ও সাবস্ক্রিপশন মেইনটেইনার
                  </h4>
                  <p className="text-xs text-[#77839B] dark:text-[#A7B5CC]">
                    মাসিক/বার্ষিক মূল্য ও স্টুডেন্ট লিমিট
                  </p>
                </div>
              </div>
              <p className="text-xs text-[#77839B] dark:text-[#A7B5CC] leading-relaxed">
                যেকোনো সময় নতুন প্যাকেজ যোগ করুন বা বিদ্যমান প্ল্যানের প্রাইসিং আপডেট করুন।
              </p>
              <button
                onClick={() => setActiveTab('plans')}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-[#5B5CE2] dark:text-indigo-400 font-bold text-xs hover:bg-indigo-100"
              >
                সাবস্ক্রিপশন প্ল্যান সম্পাদনা
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USERS & BLOCKING */}
      {activeTab === 'users' && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-5 rounded-3xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-base text-[#17233F] dark:text-[#F1F5FF]">
                  প্ল্যাটফর্মের সকল ব্যবহারকারী ও ব্লক কন্ট্রোল
                </h3>
                <p className="text-xs text-[#77839B] dark:text-[#A7B5CC]">
                  সুপার অ্যাডমিন যেকোনো ব্যবহারকারীর অ্যাকাউন্ট স্থগিত বা সচল করতে পারেন
                </p>
              </div>

              {/* Search */}
              <div className="relative max-w-xs w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#77839B]" />
                <input
                  type="text"
                  placeholder="নাম বা ইমেইল দিয়ে খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-[#E6EAF2] dark:border-[#243754] bg-[#F5F7FC] dark:bg-[#122440] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#5B5CE2] text-[#17233F] dark:text-[#F1F5FF]"
                />
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E6EAF2] dark:border-[#243754] text-[#77839B] dark:text-[#A7B5CC]">
                    <th className="py-3 px-3 font-bold">নাম ও ইমেইল</th>
                    <th className="py-3 px-3 font-bold">ভূমিকা (Role)</th>
                    <th className="py-3 px-3 font-bold">সাবস্ক্রিপশন</th>
                    <th className="py-3 px-3 font-bold">অ্যাকাউন্ট স্ট্যাটাস</th>
                    <th className="py-3 px-3 font-bold text-right">ব্লক / অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6EAF2] dark:divide-[#243754]">
                  {filteredUsers.map((u) => {
                    const isSelf = u.uid === user.uid;
                    const isSuper = u.email === 'mustafa.rahman.official@gmail.com';
                    return (
                      <tr key={u.uid} className="hover:bg-[#F5F7FC] dark:hover:bg-[#122440] transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-bold text-[#17233F] dark:text-[#F1F5FF] flex items-center gap-1.5">
                            <span>{u.displayName}</span>
                            {isSuper && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                          </div>
                          <div className="text-[11px] text-[#77839B] dark:text-[#A7B5CC] font-mono">
                            {u.email}
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.role === 'platform_admin'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          }`}>
                            {u.role === 'platform_admin' ? 'সুপার অ্যাডমিন' : 'শিক্ষার্থী'}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-bold uppercase text-[11px] text-[#5B5CE2] dark:text-indigo-400">
                            {u.subscriptionTier}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          {u.isBlocked ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-[10px] font-extrabold">
                              <XCircle className="w-3 h-3" />
                              <span>স্থগিত (Blocked)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-extrabold">
                              <CheckCircle className="w-3 h-3" />
                              <span>সক্রিয় (Active)</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {u.isBlocked ? (
                              <button
                                onClick={() => handleUnblock(u)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[11px] transition-colors"
                              >
                                আনব্লক করুন
                              </button>
                            ) : (
                              <button
                                disabled={isSuper}
                                onClick={() => setBlockingUser(u)}
                                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                                  isSuper
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800'
                                    : 'bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                                }`}
                              >
                                ব্লক করুন
                              </button>
                            )}

                            <button
                              onClick={() => {
                                switchUser(u.uid);
                                showToast(`"${u.displayName}" হিসেবে সুইচ করা হয়েছে।`);
                              }}
                              className="px-2 py-1 rounded-lg bg-[#F5F7FC] dark:bg-[#122440] hover:bg-indigo-50 text-[#77839B] hover:text-[#5B5CE2] text-[11px] font-bold"
                              title="এই ব্যবহারকারী হিসেবে টেস্ট করুন"
                            >
                              লগইন
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TENANTS DIRECTORY */}
      {activeTab === 'tenants' && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tenants.map((tenant) => (
              <div
                key={tenant.id}
                className="p-6 rounded-3xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-[#5B5CE2] dark:bg-indigo-950 dark:text-indigo-300 uppercase">
                      {tenant.type}
                    </span>
                    <span className="text-xs font-bold text-emerald-500">
                      {tenant.subscriptionPlanId.toUpperCase()} প্ল্যান
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-base text-[#17233F] dark:text-[#F1F5FF]">
                      {tenant.name}
                    </h4>
                    <p className="text-xs text-[#77839B] dark:text-[#A7B5CC] font-mono mt-0.5">
                      slug: {tenant.slug}
                    </p>
                  </div>

                  <p className="text-xs text-[#77839B] dark:text-[#A7B5CC] line-clamp-2">
                    {tenant.description || 'প্রতিষ্ঠানের কোনো বিবরণ দেওয়া হয়নি।'}
                  </p>

                  <div className="p-3 rounded-2xl bg-[#F5F7FC] dark:bg-[#122440] text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-[#77839B] dark:text-[#A7B5CC]">পরিচালক / ওনার:</span>
                      <span className="font-bold text-[#17233F] dark:text-[#F1F5FF] truncate max-w-[150px]">
                        {tenant.ownerEmail}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#77839B] dark:text-[#A7B5CC]">বর্তমান শিক্ষার্থী:</span>
                      <span className="font-black text-[#5B5CE2] dark:text-indigo-400">
                        {toBengaliNumber(tenant.memberCount)} জন / {toBengaliNumber(tenant.maxMembers)} সর্বোচ্চ
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => {
                      switchTenant(tenant.id);
                      showToast(`"${tenant.name}" টেন্যান্টে সক্রিয় সুইচ করা হয়েছে।`);
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#5B5CE2] text-white text-xs font-bold hover:bg-[#4E4FD0]"
                  >
                    টেন্যান্টে প্রবেশ করুন
                  </button>
                  <button
                    onClick={() => {
                      FocusStudyStore.toggleTenantSuspension(tenant.id);
                      showToast(`টেন্যান্ট স্ট্যাটাস পরিবর্তিত হয়েছে।`);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold ${
                      tenant.isSuspended
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40'
                    }`}
                  >
                    {tenant.isSuspended ? 'পুনরুজ্জীবিত' : 'স্থগিত'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PAYMENT GATEWAYS (bKash / Nagad / Rocket) */}
      {activeTab === 'gateways' && (
        <div className="space-y-6 animate-fade-in">
          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 flex items-start gap-3">
            <Smartphone className="w-5 h-5 text-[#5B5CE2] shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-[#17233F] dark:text-[#F1F5FF] block">
                মোবাইল পেমেন্ট গেটওয়ে কনফিগারেশন
              </span>
              <p className="text-[#77839B] dark:text-[#A7B5CC] mt-0.5">
                প্ল্যাটফর্ম সুপার অ্যাডমিন এখানে মার্চেন্ট নম্বর, পেমেন্টের ধরন এবং শিক্ষার্থীদের জন্য বিশেষ নির্দেশনা নির্ধারণ করতে পারেন।
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {gatewaysForm.map((gw) => (
              <div
                key={gw.id}
                className="p-6 rounded-3xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#E6EAF2] dark:border-[#243754]">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-extrabold text-sm shadow-xs"
                      style={{ backgroundColor: gw.color }}
                    >
                      {gw.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#17233F] dark:text-[#F1F5FF]">
                        {gw.banglaName}
                      </h4>
                      <span className="text-[10px] text-[#77839B] dark:text-[#A7B5CC] uppercase">
                        {gw.id} Gateway
                      </span>
                    </div>
                  </div>

                  {/* Active Toggle */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={gw.isActive}
                      onChange={(e) => {
                        handleUpdateGateway(gw.id, { isActive: e.target.checked });
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#5B5CE2]"></div>
                  </label>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#17233F] dark:text-[#F1F5FF] mb-1">
                      অ্যাকাউন্ট নম্বর *
                    </label>
                    <input
                      type="text"
                      value={gw.accountNumber}
                      onChange={(e) => {
                        const val = e.target.value;
                        setGatewaysForm((prev) =>
                          prev.map((g) => (g.id === gw.id ? { ...g, accountNumber: val } : g))
                        );
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-[#E6EAF2] dark:border-[#243754] bg-[#F5F7FC] dark:bg-[#122440] text-xs font-mono font-bold text-[#17233F] dark:text-[#F1F5FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#17233F] dark:text-[#F1F5FF] mb-1">
                      অ্যাকাউন্টের ধরন
                    </label>
                    <select
                      value={gw.accountType}
                      onChange={(e) => {
                        const val = e.target.value as PaymentGatewayConfig['accountType'];
                        setGatewaysForm((prev) =>
                          prev.map((g) => (g.id === gw.id ? { ...g, accountType: val } : g))
                        );
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-[#E6EAF2] dark:border-[#243754] bg-[#F5F7FC] dark:bg-[#122440] text-xs font-semibold text-[#17233F] dark:text-[#F1F5FF]"
                    >
                      <option value="merchant">মার্চেন্ট (Merchant)</option>
                      <option value="personal">পার্সোনাল (Personal Send Money)</option>
                      <option value="agent">এজেন্ট (Agent Cash In)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#17233F] dark:text-[#F1F5FF] mb-1">
                      ফি / চার্জ (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={gw.feePercentage}
                      onChange={(e) => {
                        const val = Number(e.target.value) || 0;
                        setGatewaysForm((prev) =>
                          prev.map((g) => (g.id === gw.id ? { ...g, feePercentage: val } : g))
                        );
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-[#E6EAF2] dark:border-[#243754] bg-[#F5F7FC] dark:bg-[#122440] text-xs font-bold text-[#17233F] dark:text-[#F1F5FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#17233F] dark:text-[#F1F5FF] mb-1">
                      শিক্ষার্থীদের জন্য নির্দেশিকা
                    </label>
                    <textarea
                      rows={3}
                      value={gw.instructions}
                      onChange={(e) => {
                        const val = e.target.value;
                        setGatewaysForm((prev) =>
                          prev.map((g) => (g.id === gw.id ? { ...g, instructions: val } : g))
                        );
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-[#E6EAF2] dark:border-[#243754] bg-[#F5F7FC] dark:bg-[#122440] text-xs text-[#17233F] dark:text-[#F1F5FF]"
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    handleUpdateGateway(gw.id, gw);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 hover:opacity-95 shadow-xs"
                  style={{ backgroundColor: gw.color }}
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{gw.banglaName} সেটিংস সংরক্ষণ করুন</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: SUBSCRIPTION PLANS MAINTAINER */}
      {activeTab === 'plans' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-[#17233F] dark:text-[#F1F5FF]">
                SaaS সাবস্ক্রিপশন প্ল্যান মেইনটেইনার
              </h3>
              <p className="text-xs text-[#77839B] dark:text-[#A7B5CC]">
                মূল্য, শিক্ষার্থী সংখ্যা ও ফিচার তালিকা পরিবর্তন করুন
              </p>
            </div>
            <button
              onClick={() => setNewPlanModal(true)}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#5B5CE2] to-[#8B5CF6] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন প্ল্যান তৈরি করুন</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {subscriptionPlans.map((plan) => (
              <div
                key={plan.id}
                className="p-6 rounded-3xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-[#5B5CE2] dark:bg-indigo-950 dark:text-indigo-300">
                      ID: {plan.id}
                    </span>
                    {plan.popular && (
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500 text-white">
                        জনপ্রিয়
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-lg text-[#17233F] dark:text-[#F1F5FF]">
                      {plan.name}
                    </h4>
                    <p className="text-xs text-[#77839B] dark:text-[#A7B5CC]">
                      {plan.tagline}
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#F5F7FC] dark:bg-[#122440] space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#77839B] dark:text-[#A7B5CC]">মাসিক মূল্য:</span>
                      <span className="font-black text-[#17233F] dark:text-[#F1F5FF]">৳{toBengaliNumber(plan.priceMonthly)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#77839B] dark:text-[#A7B5CC]">বার্ষিক মূল্য:</span>
                      <span className="font-black text-emerald-600 dark:text-emerald-400">৳{toBengaliNumber(plan.priceYearly)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#77839B] dark:text-[#A7B5CC]">শিক্ষার্থী সীমা:</span>
                      <span className="font-bold text-[#5B5CE2]">{toBengaliNumber(plan.maxStudents)} জন</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase text-[#77839B] dark:text-[#A7B5CC]">
                      ফিচারসমূহ ({toBengaliNumber(plan.features.length)}টি):
                    </span>
                    <ul className="text-xs space-y-1 text-[#17233F] dark:text-[#F1F5FF]">
                      {plan.features.slice(0, 4).map((f, i) => (
                        <li key={i} className="flex items-start gap-1.5 truncate">
                          <Check className="w-3 h-3 text-[#5B5CE2] shrink-0 mt-0.5" />
                          <span className="truncate">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  onClick={() => setEditingPlan(plan)}
                  className="w-full py-2 px-3 rounded-xl border border-[#5B5CE2] text-[#5B5CE2] dark:text-indigo-400 font-bold text-xs hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center justify-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>প্ল্যান সম্পাদনা করুন</span>
                </button>
              </div>
            ))}
          </div>

          {/* Edit Plan Modal */}
          {editingPlan && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
              <div className="bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#E6EAF2] dark:border-[#243754]">
                  <h3 className="font-bold text-base text-[#17233F] dark:text-[#F1F5FF]">
                    "{editingPlan.name}" প্ল্যান এডিট
                  </h3>
                  <button onClick={() => setEditingPlan(null)}>
                    <XCircle className="w-5 h-5 text-[#77839B]" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[#17233F] dark:text-[#F1F5FF] mb-1">
                      প্ল্যানের নাম
                    </label>
                    <input
                      type="text"
                      value={editingPlan.name}
                      onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#E6EAF2] dark:border-[#243754] bg-[#F5F7FC] dark:bg-[#122440] text-xs font-bold text-[#17233F] dark:text-[#F1F5FF]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#17233F] dark:text-[#F1F5FF] mb-1">
                        মাসিক ফি (৳)
                      </label>
                      <input
                        type="number"
                        value={editingPlan.priceMonthly}
                        onChange={(e) =>
                          setEditingPlan({ ...editingPlan, priceMonthly: Number(e.target.value) || 0 })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-[#E6EAF2] dark:border-[#243754] bg-[#F5F7FC] dark:bg-[#122440] text-xs font-bold text-[#17233F] dark:text-[#F1F5FF]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#17233F] dark:text-[#F1F5FF] mb-1">
                        বার্ষিক ফি (৳)
                      </label>
                      <input
                        type="number"
                        value={editingPlan.priceYearly}
                        onChange={(e) =>
                          setEditingPlan({ ...editingPlan, priceYearly: Number(e.target.value) || 0 })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-[#E6EAF2] dark:border-[#243754] bg-[#F5F7FC] dark:bg-[#122440] text-xs font-bold text-[#17233F] dark:text-[#F1F5FF]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#17233F] dark:text-[#F1F5FF] mb-1">
                      সর্বোচ্চ শিক্ষার্থী সীমা (Max Students)
                    </label>
                    <input
                      type="number"
                      value={editingPlan.maxStudents}
                      onChange={(e) =>
                        setEditingPlan({ ...editingPlan, maxStudents: Number(e.target.value) || 1 })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-[#E6EAF2] dark:border-[#243754] bg-[#F5F7FC] dark:bg-[#122440] text-xs font-bold text-[#17233F] dark:text-[#F1F5FF]"
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => setEditingPlan(null)}
                    className="flex-1 py-2 px-3 rounded-xl border border-[#E6EAF2] dark:border-[#243754] text-xs font-bold text-[#77839B]"
                  >
                    বাতিল
                  </button>
                  <button
                    onClick={() => handleSavePlan(editingPlan)}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#5B5CE2] text-white text-xs font-bold"
                  >
                    সংরক্ষণ করুন
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* New Plan Modal */}
          {newPlanModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
              <div className="bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#E6EAF2] dark:border-[#243754]">
                  <h3 className="font-bold text-base text-[#17233F] dark:text-[#F1F5FF]">
                    নতুন সাবস্ক্রিপশন প্ল্যান তৈরি
                  </h3>
                  <button onClick={() => setNewPlanModal(false)}>
                    <XCircle className="w-5 h-5 text-[#77839B]" />
                  </button>
                </div>

                <form onSubmit={handleCreatePlan} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#17233F] dark:text-[#F1F5FF] mb-1">
                        প্ল্যান কোড/ID *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="ultra-academy"
                        value={newPlanForm.id}
                        onChange={(e) => setNewPlanForm({ ...newPlanForm, id: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-[#E6EAF2] dark:border-[#243754] bg-[#F5F7FC] dark:bg-[#122440] text-xs font-bold text-[#17233F] dark:text-[#F1F5FF]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#17233F] dark:text-[#F1F5FF] mb-1">
                        প্ল্যানের নাম *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="আল্ট্রা একাডেমি"
                        value={newPlanForm.name}
                        onChange={(e) => setNewPlanForm({ ...newPlanForm, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-[#E6EAF2] dark:border-[#243754] bg-[#F5F7FC] dark:bg-[#122440] text-xs font-bold text-[#17233F] dark:text-[#F1F5FF]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#17233F] dark:text-[#F1F5FF] mb-1">
                        মাসিক ফি (৳)
                      </label>
                      <input
                        type="number"
                        value={newPlanForm.priceMonthly}
                        onChange={(e) =>
                          setNewPlanForm({ ...newPlanForm, priceMonthly: Number(e.target.value) || 0 })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-[#E6EAF2] dark:border-[#243754] bg-[#F5F7FC] dark:bg-[#122440] text-xs font-bold text-[#17233F] dark:text-[#F1F5FF]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#17233F] dark:text-[#F1F5FF] mb-1">
                        বার্ষিক ফি (৳)
                      </label>
                      <input
                        type="number"
                        value={newPlanForm.priceYearly}
                        onChange={(e) =>
                          setNewPlanForm({ ...newPlanForm, priceYearly: Number(e.target.value) || 0 })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-[#E6EAF2] dark:border-[#243754] bg-[#F5F7FC] dark:bg-[#122440] text-xs font-bold text-[#17233F] dark:text-[#F1F5FF]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#17233F] dark:text-[#F1F5FF] mb-1">
                      ফিচার তালিকা (প্রতি লাইনে ১টি)
                    </label>
                    <textarea
                      rows={3}
                      value={newPlanForm.featuresText}
                      onChange={(e) => setNewPlanForm({ ...newPlanForm, featuresText: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#E6EAF2] dark:border-[#243754] bg-[#F5F7FC] dark:bg-[#122440] text-xs text-[#17233F] dark:text-[#F1F5FF]"
                    />
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setNewPlanModal(false)}
                      className="flex-1 py-2 px-3 rounded-xl border border-[#E6EAF2] dark:border-[#243754] text-xs font-bold text-[#77839B]"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 px-3 rounded-xl bg-[#5B5CE2] text-white text-xs font-bold"
                    >
                      তৈরি করুন
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: PAYMENT TRANSACTIONS & APPROVALS */}
      {activeTab === 'transactions' && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-5 rounded-3xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-[#17233F] dark:text-[#F1F5FF]">
                  পেমেন্ট লেনদেন ও ভেরিফিকেশন লেজার
                </h3>
                <p className="text-xs text-[#77839B] dark:text-[#A7B5CC]">
                  বিকাশ, নগদ ও রকেট মাধ্যমে প্রেরিত TrxID যাচাই করে এক ক্লিকে অনুমোদন দিন
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                অপেক্ষমাণ: {toBengaliNumber(pendingTransactions.length)}টি
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E6EAF2] dark:border-[#243754] text-[#77839B] dark:text-[#A7B5CC]">
                    <th className="py-3 px-3 font-bold">গেটওয়ে ও TrxID</th>
                    <th className="py-3 px-3 font-bold">প্রেরকের মোবাইল</th>
                    <th className="py-3 px-3 font-bold">প্যাকেজ ও মূল্য</th>
                    <th className="py-3 px-3 font-bold">প্রতিষ্ঠান ও ইউজার</th>
                    <th className="py-3 px-3 font-bold">স্ট্যাটাস</th>
                    <th className="py-3 px-3 font-bold text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6EAF2] dark:divide-[#243754]">
                  {paymentTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-[#F5F7FC] dark:hover:bg-[#122440] transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase text-white ${
                            tx.gateway === 'bkash' ? 'bg-[#D12053]' : tx.gateway === 'nagad' ? 'bg-[#F7941D]' : 'bg-[#8C3494]'
                          }`}>
                            {tx.gateway}
                          </span>
                          <span className="font-mono font-bold text-xs text-[#17233F] dark:text-[#F1F5FF]">
                            {tx.trxId}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#77839B] dark:text-[#A7B5CC] block mt-0.5">
                          {formatBengaliDate(tx.createdAt)}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-mono font-semibold text-[#17233F] dark:text-[#F1F5FF]">
                        {tx.senderNumber}
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-bold text-[#17233F] dark:text-[#F1F5FF] block">
                          {tx.planName}
                        </span>
                        <span className="font-black text-emerald-600 dark:text-emerald-400">
                          ৳{toBengaliNumber(tx.amount)}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-bold text-[#17233F] dark:text-[#F1F5FF] block truncate max-w-[150px]">
                          {tx.tenantName}
                        </span>
                        <span className="text-[11px] text-[#77839B] dark:text-[#A7B5CC] font-mono truncate max-w-[150px] block">
                          {tx.userEmail}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        {tx.status === 'approved' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-extrabold">
                            <CheckCircle className="w-3 h-3" />
                            <span>অনুমোদিত</span>
                          </span>
                        )}
                        {tx.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-extrabold">
                            <Clock className="w-3 h-3" />
                            <span>যাচাই বাকি</span>
                          </span>
                        )}
                        {tx.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-[10px] font-extrabold">
                            <XCircle className="w-3 h-3" />
                            <span>বাতিল</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right">
                        {tx.status === 'pending' ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleApproveTx(tx.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[11px] transition-colors"
                            >
                              অনুমোদন
                            </button>
                            <button
                              onClick={() => handleRejectTx(tx.id)}
                              className="px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-950 dark:text-rose-400 font-bold text-[11px] transition-colors"
                            >
                              বাতিল
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#77839B] dark:text-[#A7B5CC]">
                            সম্পন্ন
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Block User Modal */}
      {blockingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-[#0D1B32] border border-rose-200 dark:border-rose-900 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400 flex items-center justify-center shrink-0">
                <Ban className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#17233F] dark:text-[#F1F5FF]">
                  ব্যবহারকারী সাময়িক স্থগিত (Block User)
                </h3>
                <p className="text-xs text-[#77839B] dark:text-[#A7B5CC]">
                  {blockingUser.displayName} ({blockingUser.email})
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17233F] dark:text-[#F1F5FF] mb-1">
                স্থগিতাদেশের কারণ লিখুন *
              </label>
              <textarea
                rows={3}
                required
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="উদাঃ স্প্যামিং, পলিসি লঙ্ঘন, বা পেমেন্ট বকেয়া..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6EAF2] dark:border-[#243754] bg-[#F5F7FC] dark:bg-[#122440] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500 text-[#17233F] dark:text-[#F1F5FF]"
              />
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setBlockingUser(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-[#E6EAF2] dark:border-[#243754] text-xs font-bold text-[#77839B]"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleConfirmBlock}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-md shadow-rose-600/20"
              >
                অ্যাকাউন্ট স্থগিত করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
