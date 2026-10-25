import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Clock,
  Sparkles,
  Database,
  CheckCircle2,
  AlertTriangle,
  Bell,
  BellRing,
  BellOff,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { FocusStudyStore } from '../../lib/storage/store';
import { isFirebaseConfigured } from '../../lib/firebase/client';
import {
  getBrowserNotificationStatus,
  requestBrowserNotificationPermission,
  triggerBreakNotification,
  NotificationSupportStatus,
} from '../../lib/utils/notifications';

export function SettingsView() {
  const { theme, setTheme } = useTheme();
  const { user, updateProfile } = useAuth();

  const [displayName, setDisplayName] = useState(user.displayName);
  const [studyLevel, setStudyLevel] = useState(user.studyLevel);
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(user.dailyGoalMinutes);
  const [weeklyGoalMinutes, setWeeklyGoalMinutes] = useState(user.weeklyGoalMinutes);
  const [timezone] = useState(user.timezone || 'Asia/Dhaka');
  const [saveToast, setSaveToast] = useState(false);
  const [notifStatus, setNotifStatus] = useState<NotificationSupportStatus>('default');

  React.useEffect(() => {
    setNotifStatus(getBrowserNotificationStatus());
  }, []);

  const handleTestOrRequestNotification = async () => {
    if (notifStatus === 'granted') {
      triggerBreakNotification(25, 'বাংলা সাহিত্য');
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 3000);
      return;
    }

    const res = await requestBrowserNotificationPermission();
    setNotifStatus(res);
    if (res === 'granted') {
      triggerBreakNotification(25, 'বাংলা সাহিত্য');
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 3000);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      displayName,
      studyLevel,
      dailyGoalMinutes,
      weeklyGoalMinutes,
    });
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 4000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Toast Alert */}
      {saveToast && (
        <div className="p-4 rounded-2xl bg-emerald-500 text-white shadow-lg flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-bold text-sm">আপনার সেটিংস সফলভাবে সংরক্ষিত হয়েছে!</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-[#17233F] dark:text-[#F1F5FF]">
          অ্যাকাউন্ট ও অ্যাপ্লিকেশন সেটিংস
        </h2>
        <p className="text-xs md:text-sm text-[#77839B] dark:text-[#A7B5CC] mt-0.5">
          আপনার পড়ার লক্ষ্য, থিম এবং ব্যক্তিগত প্রোফাইল কাস্টমাইজ করুন
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] shadow-xs space-y-4">
          <h3 className="font-bold text-base text-[#17233F] dark:text-[#F1F5FF] pb-2 border-b border-[#E6EAF2] dark:border-[#243754]">
            ব্যক্তিগত তথ্য
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#17233F] dark:text-[#F1F5FF] mb-1">
                আপনার নাম
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-[#F5F7FC] dark:bg-[#122440] border border-[#E6EAF2] dark:border-[#243754] text-[#17233F] dark:text-[#F1F5FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17233F] dark:text-[#F1F5FF] mb-1">
                ইমেইল ঠিকানা
              </label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-[#F5F7FC] dark:bg-[#122440] border border-[#E6EAF2] dark:border-[#243754] text-[#77839B] opacity-80 cursor-not-allowed"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#17233F] dark:text-[#F1F5FF] mb-1">
                শিক্ষার পর্যায় / লক্ষ্য
              </label>
              <select
                value={studyLevel}
                onChange={(e) => setStudyLevel(e.target.value as typeof user.studyLevel)}
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-[#F5F7FC] dark:bg-[#122440] border border-[#E6EAF2] dark:border-[#243754] text-[#17233F] dark:text-[#F1F5FF]"
              >
                <option value="school">স্কুল শিক্ষার্থী</option>
                <option value="college">কলেজ শিক্ষার্থী</option>
                <option value="university">বিশ্ববিদ্যালয় শিক্ষার্থী</option>
                <option value="admission">ভর্তি পরীক্ষার্থী</option>
                <option value="job_seeker">চাকরিপ্রার্থী (বিসিএস/ব্যাংক)</option>
                <option value="programming">প্রোগ্রামিং ও টেক লার্নার</option>
                <option value="self_learner">স্বশিক্ষায় আগ্রহী ব্যক্তি</option>
              </select>
            </div>
          </div>
        </div>

        {/* Study Goals Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E6EAF2] dark:border-[#243754]">
            <Clock className="w-5 h-5 text-[#5B5CE2]" />
            <h3 className="font-bold text-base text-[#17233F] dark:text-[#F1F5FF]">
              পড়ার লক্ষ্য নির্ধারণ
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#17233F] dark:text-[#F1F5FF] mb-1">
                দৈনিক পড়ার লক্ষ্য (মিনিট)
              </label>
              <input
                type="number"
                min="30"
                step="30"
                value={dailyGoalMinutes}
                onChange={(e) => setDailyGoalMinutes(parseInt(e.target.value, 10) || 60)}
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-[#F5F7FC] dark:bg-[#122440] border border-[#E6EAF2] dark:border-[#243754] text-[#17233F] dark:text-[#F1F5FF]"
              />
              <span className="text-[11px] text-[#77839B] dark:text-[#A7B5CC] mt-0.5 block">
                সমানুপাতিক {Math.round((dailyGoalMinutes / 60) * 10) / 10} ঘণ্টা
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17233F] dark:text-[#F1F5FF] mb-1">
                সাপ্তাহিক পড়ার লক্ষ্য (মিনিট)
              </label>
              <input
                type="number"
                min="180"
                step="60"
                value={weeklyGoalMinutes}
                onChange={(e) => setWeeklyGoalMinutes(parseInt(e.target.value, 10) || 600)}
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-[#F5F7FC] dark:bg-[#122440] border border-[#E6EAF2] dark:border-[#243754] text-[#17233F] dark:text-[#F1F5FF]"
              />
              <span className="text-[11px] text-[#77839B] dark:text-[#A7B5CC] mt-0.5 block">
                সমানুপাতিক {Math.round((weeklyGoalMinutes / 60) * 10) / 10} ঘণ্টা
              </span>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#17233F] dark:text-[#F1F5FF] mb-1">
                টাইমজোন (Timezone)
              </label>
              <input
                type="text"
                disabled
                value={timezone}
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-[#F5F7FC] dark:bg-[#122440] border border-[#E6EAF2] dark:border-[#243754] text-[#77839B] opacity-80 cursor-not-allowed"
              />
              <span className="text-[11px] text-[#77839B] dark:text-[#A7B5CC] mt-0.5 block">
                বাংলাদেশ মান সময় (Asia/Dhaka) অনুযায়ী হিসেব করা হয়
              </span>
            </div>
          </div>
        </div>

        {/* Theme Settings Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#E6EAF2] dark:border-[#243754]">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-base text-[#17233F] dark:text-[#F1F5FF]">
              থিম ও ইন্টারফেস পছন্দ
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'light', label: 'লাইট মোড', icon: Sun },
              { id: 'dark', label: 'ডার্ক মোড', icon: Moon },
              { id: 'system', label: 'সিস্টেম অটো', icon: Sparkles },
            ].map((t) => {
              const Icon = t.icon;
              const isSelected = theme === t.id;
              return (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setTheme(t.id as 'light' | 'dark' | 'system')}
                  className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 border-[#5B5CE2] text-[#5B5CE2] dark:text-indigo-400 font-bold shadow-xs'
                      : 'border-[#E6EAF2] dark:border-[#243754] text-[#77839B] hover:text-[#17233F]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Browser Notification Settings Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E6EAF2] dark:border-[#243754]">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#5B5CE2]" />
              <h3 className="font-bold text-base text-[#17233F] dark:text-[#F1F5FF]">
                ব্রাউজার বিরতি নোটিফিকেশন (Break Alert)
              </h3>
            </div>
            {notifStatus === 'granted' ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                সক্রিয় (Allowed)
              </span>
            ) : notifStatus === 'denied' ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                ব্লক করা (Blocked)
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                অনুমতি প্রয়োজন
              </span>
            )}
          </div>

          <p className="text-xs text-[#77839B] dark:text-[#A7B5CC] leading-relaxed">
            ফোকাস সেশন নির্ধারিত সময়সীমায় পৌঁছালে এটি স্বয়ংক্রিয়ভাবে একটি ব্রাউজার নোটিফিকেশন পাঠাবে ("বিরতি নেওয়ার সময় হয়েছে! ☕")। আপনি ব্রাউজারের অন্য ট্যাবে থাকলেও এই রিমাইন্ডার পাবেন।
          </p>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="text-[11px] text-[#77839B] dark:text-[#A7B5CC]">
              * দ্রষ্টব্য: ব্রাউজার সম্পূর্ণ বন্ধ থাকলে নোটিফিকেশন আসবে না।
            </div>

            <button
              type="button"
              onClick={handleTestOrRequestNotification}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                notifStatus === 'granted'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                  : 'bg-gradient-to-r from-[#5B5CE2] to-[#8B5CF6] text-white shadow-md hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              <BellRing className="w-3.5 h-3.5" />
              <span>
                {notifStatus === 'granted'
                  ? 'টেস্ট নোটিফিকেশন পাঠান'
                  : 'নোটিফিকেশন অনুমতি দিন'}
              </span>
            </button>
          </div>
        </div>

        {/* Database & Cloud Integration Status Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E6EAF2] dark:border-[#243754]">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-[#5B5CE2]" />
              <h3 className="font-bold text-base text-[#17233F] dark:text-[#F1F5FF]">
                Firebase ডাটাবেজ সংযোগ স্ট্যাটাস
              </h3>
            </div>
            {isFirebaseConfigured ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                সংযুক্ত (Live Firebase)
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                লোকাল পারসিস্টেন্স মোড (Active)
              </span>
            )}
          </div>

          <p className="text-xs text-[#77839B] dark:text-[#A7B5CC] leading-relaxed">
            FocusStudy সম্পূর্ণ অফলাইন-ফার্স্ট এবং স্থানীয় স্টোরেজ পারসিস্টেন্স দিয়ে সুরক্ষিত। আপনার ডাটা (টাস্ক, স্টাডি প্ল্যান, ফোকাস সেশন) ব্রাউজার রিলোড করলেও সম্পূর্ণ সুরক্ষিত থাকে। ফায়ারবেজ প্রজেক্ট কোটা উপলব্ধ থাকলে বা `.env` ফাইলে ফায়ারবেজ কী যুক্ত করলে স্বয়ংক্রিয়ভাবে ক্লাউড ফায়ারস্টোরে সিঙ্ক হবে।
          </p>

          {!isFirebaseConfigured && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/30 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">ক্লাউড সিঙ্কিং সক্রিয় করতে:</span> আপনার Firebase Project আইডি এবং ওয়েব ক্রেডেনশিয়াল `.env` ফাইলে যোগ করে নিন। কোনো অতিরিক্ত কোড পরিবর্তন ছাড়াই সরাসরি ক্লাউডে ব্যাকআপ নেওয়া যাবে।
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#5B5CE2] to-[#8B5CF6] text-white font-bold text-sm shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            পরিবর্তন সংরক্ষণ করুন
          </button>
        </div>
      </form>
    </div>
  );
}
