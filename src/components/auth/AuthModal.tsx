import React, { useState } from 'react';
import { X, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { StudyLevel } from '../../types';

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, signInWithGoogle, completeOnboarding } = useAuth();

  const [activeTab, setActiveTab] = useState<'google' | 'onboarding'>('google');
  const [displayName, setDisplayName] = useState('');
  const [studyLevel, setStudyLevel] = useState<StudyLevel>('university');
  const [primaryGoal, setPrimaryGoal] = useState('');
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(180);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isAuthModalOpen) return null;

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      await signInWithGoogle();
      setActiveTab('onboarding');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Google সাইন-ইন সম্পন্ন করা যায়নি। পুনরায় চেষ্টা করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setErrorMsg('আপনার নাম প্রদান করুন');
      return;
    }
    completeOnboarding({
      displayName: displayName.trim(),
      studyLevel,
      primaryGoal: primaryGoal.trim() || 'পড়াশোনায় সর্বোচ্চ ধারাবাহিকতা অর্জন',
      dailyGoalMinutes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-[#0D1B32] rounded-3xl border border-[#E6EAF2] dark:border-[#243754] shadow-2xl p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E6EAF2] dark:border-[#243754]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#5B5CE2] to-[#8B5CF6] text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-[#17233F] dark:text-[#F1F5FF]">
              {activeTab === 'google' ? 'সাইন-ইন ও নিবন্ধন' : 'শিক্ষার্থী অনবোর্ডিং'}
            </h3>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded-lg text-[#77839B] hover:text-[#17233F] dark:hover:text-[#F1F5FF]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 text-rose-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {activeTab === 'google' ? (
          <div className="mt-6 space-y-4">
            <div className="text-center space-y-1">
              <h4 className="font-bold text-lg text-[#17233F] dark:text-[#F1F5FF]">
                FocusStudy তে স্বাগতম
              </h4>
              <p className="text-xs text-[#77839B] dark:text-[#A7B5CC]">
                আপনার পড়ার অগ্রগতি ও ডেটা সুরক্ষিত রাখতে অ্যাকাউন্টে প্রবেশ করুন
              </p>
            </div>

            {/* Google Login CTA */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-2xl border border-[#E6EAF2] dark:border-[#243754] bg-white dark:bg-[#122440] hover:bg-[#F5F7FC] dark:hover:bg-[#182C4E] flex items-center justify-center gap-3 text-xs md:text-sm font-bold text-[#17233F] dark:text-[#F1F5FF] shadow-xs transition-all hover:scale-[1.01]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isLoading ? 'প্রবেশ করা হচ্ছে...' : 'Google দিয়ে সাইন-ইন করুন'}</span>
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-[#E6EAF2] dark:border-[#243754]"></div>
              <span className="flex-shrink mx-3 text-xs text-[#77839B] dark:text-[#A7B5CC]">
                অথবা ডেমো সেটআপ
              </span>
              <div className="flex-grow border-t border-[#E6EAF2] dark:border-[#243754]"></div>
            </div>

            <button
              onClick={() => setActiveTab('onboarding')}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-[#5B5CE2] dark:text-indigo-400 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-indigo-100 transition-colors"
            >
              <span>অতিথি শিক্ষার্থী হিসেবে প্রোফাইল সাজান</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleCompleteOnboarding} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#17233F] dark:text-[#F1F5FF] mb-1">
                আপনার পুরো নাম <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="যেমন: মুস্তাফা রহমান"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-[#F5F7FC] dark:bg-[#122440] border border-[#E6EAF2] dark:border-[#243754] text-[#17233F] dark:text-[#F1F5FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17233F] dark:text-[#F1F5FF] mb-1">
                আপনার শিক্ষার স্তর
              </label>
              <select
                value={studyLevel}
                onChange={(e) => setStudyLevel(e.target.value as StudyLevel)}
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-[#F5F7FC] dark:bg-[#122440] border border-[#E6EAF2] dark:border-[#243754] text-[#17233F] dark:text-[#F1F5FF]"
              >
                <option value="school">স্কুল শিক্ষার্থী</option>
                <option value="college">কলেজ শিক্ষার্থী</option>
                <option value="university">বিশ্ববিদ্যালয় শিক্ষার্থী</option>
                <option value="admission">ভর্তি পরীক্ষার্থী</option>
                <option value="job_seeker">চাকরিপ্রার্থী (বিসিএস/ব্যাংক)</option>
                <option value="programming">প্রোগ্রামিং শিক্ষার্থী</option>
                <option value="self_learner">স্বশিক্ষায় আগ্রহী ব্যক্তি</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17233F] dark:text-[#F1F5FF] mb-1">
                প্রধান পড়ার লক্ষ্য
              </label>
              <input
                type="text"
                placeholder="যেমন: বিসিএস প্রিলিমিনারি ও গণিত প্রস্তুতি"
                value={primaryGoal}
                onChange={(e) => setPrimaryGoal(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-[#F5F7FC] dark:bg-[#122440] border border-[#E6EAF2] dark:border-[#243754] text-[#17233F] dark:text-[#F1F5FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17233F] dark:text-[#F1F5FF] mb-1">
                প্রতিদিনের পড়ার টার্গেট (মিনিট)
              </label>
              <input
                type="number"
                min="30"
                step="30"
                value={dailyGoalMinutes}
                onChange={(e) => setDailyGoalMinutes(parseInt(e.target.value, 10) || 60)}
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-[#F5F7FC] dark:bg-[#122440] border border-[#E6EAF2] dark:border-[#243754] text-[#17233F] dark:text-[#F1F5FF]"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('google')}
                className="px-4 py-2 text-xs font-semibold text-[#77839B] hover:text-[#17233F]"
              >
                ফিরে যান
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#5B5CE2] to-[#8B5CF6] text-white text-xs font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                অনবোর্ডিং সম্পন্ন করুন
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
