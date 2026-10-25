import React, { useState } from 'react';
import {
  Flame,
  Clock,
  CheckCircle2,
  Trophy,
  Award,
  Printer,
  Share2,
  Calendar,
  Layers,
  Sparkles,
  Check,
  Building2,
  GraduationCap,
  PenTool,
} from 'lucide-react';
import { useFocusStudyData } from '../../lib/storage/store';
import { useAuth } from '../../contexts/AuthContext';
import {
  computeDashboardMetrics,
  computeSubjectStudyData,
} from '../../lib/utils/analytics';
import { calculateStreak } from '../../lib/utils/streak';
import {
  toBengaliNumber,
  formatBengaliDuration,
} from '../../lib/utils/formatters';
import { getDateKey, DEFAULT_TIMEZONE } from '../../lib/utils/date-utils';
import { SignatureBlock } from '../signatures/SignatureBlock';
import { SignatureManagerModal } from '../signatures/SignatureManagerModal';
import { SignatureRole } from '../../types';

interface StudentProgressCardProps {
  onOpenReportModal?: () => void;
  onOpenCertificateModal?: () => void;
}

export function StudentProgressCard({
  onOpenReportModal,
  onOpenCertificateModal,
}: StudentProgressCardProps) {
  const { user } = useAuth();
  const { sessions, tasks, subjects, activeTenant, certificates, signatures } = useFocusStudyData();
  const [copied, setCopied] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isSigModalOpen, setIsSigModalOpen] = useState(false);
  const [sigRole, setSigRole] = useState<SignatureRole>('student');

  const todayKey = getDateKey(new Date(), DEFAULT_TIMEZONE);
  const metrics = computeDashboardMetrics(
    sessions,
    tasks,
    user.dailyGoalMinutes,
    todayKey
  );
  const streak = calculateStreak(sessions, todayKey);
  const subjectData = computeSubjectStudyData(sessions, subjects).slice(0, 4);

  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const taskCompletionRate =
    tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const efficiencyScore = Math.min(
    99,
    Math.round(
      metrics.dailyGoalCompletionPercent * 0.4 +
        Math.min(streak.currentStreak * 10, 100) * 0.3 +
        taskCompletionRate * 0.3
    ) || 88
  );

  const getRankTier = (score: number) => {
    if (score >= 90)
      return {
        title: 'গোল্ড স্কলার (Gold Scholar)',
        color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
      };
    if (score >= 75)
      return {
        title: 'সিলভার লার্নার (Silver Learner)',
        color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800',
      };
    return {
      title: 'ব্রোঞ্জ ফোকাসার (Bronze Focus)',
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800',
    };
  };

  const rankTier = getRankTier(efficiencyScore);

  const studentSig = signatures.find((s) => s.role === 'student');
  const adminSig = signatures.find((s) => s.role === 'admin');

  const handleShareCard = () => {
    const text = `🎯 FocusStudy স্টুডেন্ট প্রগ্রেস রিপোর্ট কার্ড\n👤 শিক্ষার্থী: ${user.displayName}\n🔥 স্টাডি স্ট্রিক: ${toBengaliNumber(streak.currentStreak)} দিন\n⏱️ মোট পড়ার সময়: ${formatBengaliDuration(metrics.totalFocusedMinutes)}\n⭐ দক্ষতা স্কোর: ${toBengaliNumber(efficiencyScore)}%\n🏛️ একাডেমি: ${activeTenant?.name || 'ঢাকা ড্রিমার্স একাডেমি'}\n#FocusStudy #Education #BCS`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrintCard = () => {
    setIsPrintModalOpen(true);
    setTimeout(() => {
      window.print();
    }, 400);
  };

  const handleOpenSig = (role: SignatureRole) => {
    setSigRole(role);
    setIsSigModalOpen(true);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white p-6 md:p-8 shadow-xl border border-indigo-800/40">
      {/* Background Decorative Rings */}
      <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-indigo-800/60 relative z-10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 via-indigo-500 to-emerald-400 p-0.5 shadow-lg">
              <div className="w-full h-full rounded-2xl bg-slate-900 flex items-center justify-center font-black text-2xl text-amber-400">
                {user.displayName.charAt(0) || 'ম'}
              </div>
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 bg-amber-400 text-slate-950 rounded-full p-1 shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl md:text-2xl font-black tracking-tight text-white">
                {user.displayName}
              </h3>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${rankTier.color}`}>
                {rankTier.title}
              </span>
            </div>
            <p className="text-xs text-indigo-200/80 flex items-center gap-2 mt-1">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>{activeTenant?.name || 'ঢাকা ড্রিমার্স একাডেমি'}</span>
              <span>•</span>
              <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
              <span>{user.primaryGoal || 'বিসিএস ও উচ্চশিক্ষা প্রস্তুতি'}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={() => handleOpenSig('student')}
            className="px-3 py-2 rounded-xl bg-indigo-800/60 hover:bg-indigo-700/80 text-xs font-semibold text-amber-300 flex items-center gap-1.5 border border-indigo-700/60 transition-all cursor-pointer"
            title="ডিজিটাল স্বাক্ষর পরিবর্তন বা যুক্ত করুন"
          >
            <PenTool className="w-3.5 h-3.5 text-amber-400" />
            <span>স্বাক্ষর এডিট</span>
          </button>
          <button
            onClick={handleShareCard}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center gap-1.5 backdrop-blur-md transition-all cursor-pointer border border-white/10"
            title="কার্ড সামারি কপি করুন"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'কপি হয়েছে!' : 'শেয়ার করুন'}</span>
          </button>
          <button
            onClick={handlePrintCard}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>প্রিন্ট / PDF</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-6 border-b border-indigo-800/60 relative z-10">
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-1.5 text-xs text-indigo-200/70 mb-1">
            <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>অবিচল স্ট্রিক</span>
          </div>
          <div className="text-2xl font-black text-amber-400">
            {toBengaliNumber(streak.currentStreak)} <span className="text-xs font-normal text-white/70">দিন</span>
          </div>
          <p className="text-[10px] text-white/50 mt-0.5">সর্বোচ্চ {toBengaliNumber(streak.longestStreak)} দিন</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-1.5 text-xs text-indigo-200/70 mb-1">
            <Clock className="w-4 h-4 text-blue-400" />
            <span>মোট পড়ার সময়</span>
          </div>
          <div className="text-2xl font-black text-white">
            {formatBengaliDuration(metrics.totalFocusedMinutes)}
          </div>
          <p className="text-[10px] text-white/50 mt-0.5">{toBengaliNumber(metrics.totalSessionsCount)} টি ফোকাস সেশন</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-1.5 text-xs text-indigo-200/70 mb-1">
            <Trophy className="w-4 h-4 text-emerald-400" />
            <span>দক্ষতা স্কোর</span>
          </div>
          <div className="text-2xl font-black text-emerald-400">
            {toBengaliNumber(efficiencyScore)}%
          </div>
          <p className="text-[10px] text-white/50 mt-0.5">শীর্ষ ৫% শিক্ষার্থীর অন্তর্ভুক্ত</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-1.5 text-xs text-indigo-200/70 mb-1">
            <Award className="w-4 h-4 text-purple-400" />
            <span>অর্জিত সনদ</span>
          </div>
          <div className="text-2xl font-black text-purple-300">
            {toBengaliNumber(certificates.filter((c) => c.isUnlocked).length)} <span className="text-xs font-normal text-white/70">টি</span>
          </div>
          <p className="text-[10px] text-white/50 mt-0.5">অফিসিয়াল প্রশংসাপত্র</p>
        </div>
      </div>

      {/* Top Subjects & Quick Progress */}
      <div className="pt-6 relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-200 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            প্রধান বিষয়ভিত্তিক পারফরম্যান্স
          </span>
          {onOpenReportModal && (
            <button
              onClick={onOpenReportModal}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
            >
              বিস্তারিত এ৪ রিপোর্ট দেখুন →
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {subjectData.map((sub) => (
            <div
              key={sub.subjectId}
              className="p-3 rounded-xl bg-slate-950/40 border border-indigo-900/60 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-white truncate">{sub.subjectName}</span>
                <span className="text-[11px] font-black text-indigo-300">
                  {toBengaliNumber(sub.percentage)}%
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(sub.percentage, 100)}%`,
                    backgroundColor: sub.color || '#3B82F6',
                  }}
                />
              </div>
              <span className="text-[10px] text-white/50 mt-1.5">
                {formatBengaliDuration(sub.minutes)} সম্পন্ন
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Print Friendly Overlay (Zero-margin defect A4 container) */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="printable-a4-document a4-portrait-sheet bg-white text-slate-900 p-8 rounded-2xl max-w-2xl w-full border-4 border-indigo-950 shadow-2xl space-y-5 print:shadow-none print:m-0 print:border-none">
            <div className="flex justify-between items-start border-b-2 border-indigo-950 pb-3">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-indigo-800">
                  FocusStudy Bangladesh • National Education Network
                </span>
                <h2 className="text-2xl font-black text-slate-950">{user.displayName} — অফিসিয়াল প্রগ্রেস কার্ড</h2>
                <p className="text-xs text-slate-600">{activeTenant?.name || 'ঢাকা ড্রিমার্স একাডেমি'} • শিক্ষাবর্ষ ২০২৬</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold px-3 py-1 bg-indigo-100 text-indigo-900 rounded-full">
                  আইডি: {user.uid.slice(0, 10).toUpperCase()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-slate-50 border rounded-xl">
                <div className="text-[11px] text-slate-500 font-bold">স্টাডি স্ট্রিক</div>
                <div className="text-xl font-black text-amber-600">{toBengaliNumber(streak.currentStreak)} দিন</div>
              </div>
              <div className="p-3 bg-slate-50 border rounded-xl">
                <div className="text-[11px] text-slate-500 font-bold">মোট অধ্যবসায়</div>
                <div className="text-xl font-black text-blue-700">{formatBengaliDuration(metrics.totalFocusedMinutes)}</div>
              </div>
              <div className="p-3 bg-slate-50 border rounded-xl">
                <div className="text-[11px] text-slate-500 font-bold">দক্ষতা রেটিং</div>
                <div className="text-xl font-black text-emerald-700">{toBengaliNumber(efficiencyScore)}%</div>
              </div>
              <div className="p-3 bg-slate-50 border rounded-xl">
                <div className="text-[11px] text-slate-500 font-bold">সনদ সংখ্যা</div>
                <div className="text-xl font-black text-purple-700">{toBengaliNumber(certificates.filter((c) => c.isUnlocked).length)} টি</div>
              </div>
            </div>

            {/* Signatures in Printed Card */}
            <div className="pt-4 border-t border-slate-300 grid grid-cols-2 gap-8 items-end">
              <SignatureBlock
                signature={studentSig}
                role="student"
                defaultName={user.displayName}
                defaultTitle="শিক্ষার্থীর স্বাক্ষর"
                showSeal={false}
              />
              <SignatureBlock
                signature={adminSig}
                role="admin"
                defaultName="মুস্তাফা রহমান"
                defaultTitle="চিফ প্ল্যাটফর্ম অ্যাডমিনিস্ট্রেটর"
                showSeal={true}
              />
            </div>

            <div className="border-t pt-3 flex justify-between items-center text-xs text-slate-500">
              <span>মুদ্রণ তারিখ: {toBengaliNumber(new Date().toLocaleDateString('bn-BD'))}</span>
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl no-print cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Signature Configuration Modal */}
      <SignatureManagerModal
        isOpen={isSigModalOpen}
        onClose={() => setIsSigModalOpen(false)}
        initialRole={sigRole}
      />
    </div>
  );
}
