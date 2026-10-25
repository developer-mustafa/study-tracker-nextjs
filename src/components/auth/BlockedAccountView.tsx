import React from 'react';
import { ShieldAlert, Mail, AlertTriangle, KeyRound, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { FocusStudyStore } from '../../lib/storage/store';
import { formatBengaliDate } from '../../lib/utils/formatters';

export function BlockedAccountView() {
  const { user, switchUser } = useAuth();

  const handleUnblockDemo = () => {
    FocusStudyStore.unblockUser(user.uid);
  };

  const handleSwitchToSuperAdmin = () => {
    FocusStudyStore.switchActiveUser('user_mustafa_super');
  };

  return (
    <div className="min-h-screen bg-[#F5F7FC] dark:bg-[#071225] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-[#0D1B32] border border-rose-200 dark:border-rose-900/60 rounded-3xl p-6 md:p-8 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center animate-pulse">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-200 dark:border-rose-900">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>অ্যাকাউন্ট স্থগিতাদেশ (Account Suspended)</span>
          </div>

          <h2 className="text-xl md:text-2xl font-black text-[#17233F] dark:text-[#F1F5FF]">
            আপনার অ্যাকাউন্টটি স্থগিত করা হয়েছে
          </h2>

          <p className="text-xs md:text-sm text-[#77839B] dark:text-[#A7B5CC]">
            প্ল্যাটফর্ম সুপার অ্যাডমিন <strong>mustafa.rahman.official@gmail.com</strong> কর্তৃক এই অ্যাকাউন্টটি স্থগিত রাখা হয়েছে।
          </p>
        </div>

        {/* Reason Box */}
        <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-left space-y-2 text-xs">
          <div>
            <span className="font-bold text-rose-700 dark:text-rose-400 block mb-0.5">
              স্থগিতের কারণ:
            </span>
            <p className="text-[#17233F] dark:text-zinc-200 leading-relaxed font-medium">
              {user.blockedReason || 'প্ল্যাটফর্ম ব্যবহারের নীতিমালা লঙ্ঘন অথবা অ্যাকাউন্টে সন্দেহজনক কার্যকলাপ সনাক্ত হয়েছে।'}
            </p>
          </div>

          {user.blockedAt && (
            <div className="text-[11px] text-[#77839B] dark:text-[#A7B5CC] pt-1 border-t border-rose-200/60 dark:border-rose-900/40">
              স্থগিতের তারিখ: {formatBengaliDate(user.blockedAt)}
            </div>
          )}
        </div>

        {/* Contact Admin */}
        <div className="space-y-3 pt-2">
          <a
            href="mailto:mustafa.rahman.official@gmail.com?subject=FocusStudy Account Suspension Appeal"
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 text-white font-bold text-xs md:text-sm flex items-center justify-center gap-2 hover:opacity-95 shadow-md shadow-rose-600/20"
          >
            <Mail className="w-4 h-4" />
            <span>প্ল্যাটফর্ম অ্যাডমিনকে ইমেইল পাঠান</span>
          </a>

          <div className="pt-4 border-t border-[#E6EAF2] dark:border-[#243754] space-y-2">
            <span className="text-[11px] text-[#77839B] dark:text-[#A7B5CC] block font-medium">
              (টেস্টিং ও ডেমো সুবিধা: অ্যাডমিন মোডে আনব্লক করুন)
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleUnblockDemo}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-colors"
              >
                তাৎক্ষণিক আনব্লক করুন
              </button>
              <button
                onClick={handleSwitchToSuperAdmin}
                className="flex-1 py-2 px-3 rounded-xl bg-[#5B5CE2] hover:bg-[#4E4FD0] text-white font-bold text-xs transition-colors"
              >
                সুপার অ্যাডমিনে সুইচ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
