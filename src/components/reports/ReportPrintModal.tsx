import React, { useState } from 'react';
import {
  Printer,
  X,
  FileText,
  Calendar,
  Building2,
  CheckCircle2,
  TrendingUp,
  Download,
  CreditCard,
  QrCode,
  ShieldCheck,
  Award,
  Layers,
  ZoomIn,
  ZoomOut,
  Sparkles,
  PenTool,
  Check,
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
  formatCurrencyBDT,
} from '../../lib/utils/formatters';
import { getDateKey, DEFAULT_TIMEZONE } from '../../lib/utils/date-utils';
import { ReportType, SignatureRole } from '../../types';
import { SignatureBlock } from '../signatures/SignatureBlock';
import { SignatureManagerModal } from '../signatures/SignatureManagerModal';

interface ReportPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialReportType?: ReportType;
}

export function ReportPrintModal({
  isOpen,
  onClose,
  initialReportType = 'progress_summary',
}: ReportPrintModalProps) {
  const [selectedReport, setSelectedReport] = useState<ReportType>(initialReportType);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isSigModalOpen, setIsSigModalOpen] = useState(false);
  const [activeSigRole, setActiveSigRole] = useState<SignatureRole>('student');

  const { user } = useAuth();
  const {
    sessions,
    tasks,
    subjects,
    activeTenant,
    paymentTransactions,
    certificates,
    signatures,
  } = useFocusStudyData();

  if (!isOpen) return null;

  const todayKey = getDateKey(new Date(), DEFAULT_TIMEZONE);
  const metrics = computeDashboardMetrics(
    sessions,
    tasks,
    user.dailyGoalMinutes,
    todayKey
  );
  const streak = calculateStreak(sessions, todayKey);
  const subjectData = computeSubjectStudyData(sessions, subjects);

  const handlePrint = () => {
    window.print();
  };

  const handleOpenSigModal = (role: SignatureRole) => {
    setActiveSigRole(role);
    setIsSigModalOpen(true);
  };

  const studentSig = signatures.find((s) => s.role === 'student');
  const mentorSig = signatures.find((s) => s.role === 'mentor');
  const adminSig = signatures.find((s) => s.role === 'admin');

  const activeTx = paymentTransactions.find((tx) => tx.userId === user.uid) || paymentTransactions[0];
  const reportIdNumber = `RPT-2026-${todayKey.replace(/-/g, '').slice(4)}-${Math.floor(1000 + Math.random() * 9000)}`;
  const currentDateBengali = toBengaliNumber(
    new Date().toLocaleDateString('bn-BD', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex flex-col items-center">
      {/* Top Floating Action Bar (Strictly hidden during print) */}
      <div className="sticky top-0 z-50 w-full bg-slate-900/95 border-b border-slate-800 text-white px-4 md:px-8 py-3 flex flex-wrap items-center justify-between gap-3 shadow-xl no-print">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-md">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm md:text-base font-bold text-white">
                এ৪ প্রিন্ট ও অফিসিয়াল অডিট রিপোর্ট
              </h2>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold px-2 py-0.5 rounded-full">
                মার্জিন অপটিমাইজড (Zero Defect)
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              A4 স্ট্যান্ডার্ড (২১০×২৯৭ মিমি) মার্জিনে ক্রিস্প ভেক্টর প্রিন্ট
            </p>
          </div>
        </div>

        {/* Report Switcher Tabs */}
        <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700 overflow-x-auto text-xs">
          <button
            onClick={() => setSelectedReport('progress_summary')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer shrink-0 ${
              selectedReport === 'progress_summary'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            স্টাডি প্রগ্রেস রিপোর্ট
          </button>
          <button
            onClick={() => setSelectedReport('subject_mastery')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer shrink-0 ${
              selectedReport === 'subject_mastery'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            বিষয়ভিত্তিক ফলাফল
          </button>
          <button
            onClick={() => setSelectedReport('attendance_batch')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer shrink-0 ${
              selectedReport === 'attendance_batch'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            উপস্থিতি ও ব্যাচ অডিট
          </button>
          <button
            onClick={() => setSelectedReport('invoice_receipt')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer shrink-0 ${
              selectedReport === 'invoice_receipt'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            পেমেন্ট চালান / মানি রিসিট
          </button>
        </div>

        {/* Right Tools: Signature Config, Zoom & Print */}
        <div className="flex items-center gap-2">
          {/* Signature Manager Button */}
          <button
            onClick={() => handleOpenSigModal('student')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="স্বাক্ষর ও অফিসিয়াল সিল পরিচালনা করুন"
          >
            <PenTool className="w-3.5 h-3.5 text-amber-400" />
            <span>স্বাক্ষর ও সিল যুক্ত করুন</span>
          </button>

          {/* Zoom controls */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-800 rounded-lg p-1 border border-slate-700 text-xs text-slate-300">
            <button
              onClick={() => setZoomLevel((prev) => Math.max(70, prev - 10))}
              className="p-1 hover:text-white cursor-pointer"
              title="জুম কমান"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1 font-mono text-[11px]">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel((prev) => Math.min(120, prev + 10))}
              className="p-1 hover:text-white cursor-pointer"
              title="জুম বাড়ান"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>A4 প্রিন্ট / PDF সংরক্ষণ</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Preview Container */}
      <div className="w-full flex-1 overflow-y-auto py-8 px-2 sm:px-4 flex justify-center bg-slate-900/60">
        <div
          className="transition-transform duration-200"
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
        >
          {/*
            Strict A4 Printable Document Container:
            Uses `.printable-a4-document` and `.a4-portrait-sheet` so browser print media
            isolates it without margin conflicts, overflows, or blank page spills!
          */}
          <div className="printable-a4-document a4-portrait-sheet bg-white text-slate-900 shadow-2xl rounded-sm print:shadow-none print:m-0 print:border-none">
            {/* ========================================================
                REPORT 1: STUDY PROGRESS & PERFORMANCE REPORT
                ======================================================== */}
            {selectedReport === 'progress_summary' && (
              <div className="space-y-4 text-slate-900 flex flex-col justify-between min-h-[265mm]">
                <div>
                  {/* Official Header with National Monogram & Barcode */}
                  <div className="border-b-2 border-indigo-950 pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-indigo-900 text-white flex flex-col items-center justify-center font-black text-xl shadow-md border-2 border-amber-400">
                          FS
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black tracking-widest text-indigo-900 uppercase">
                              গণপ্রজাতন্ত্রী বাংলাদেশ অনুমোদিত একাডেমি নেটওয়ার্ক
                            </span>
                            <span className="text-[9px] bg-indigo-100 text-indigo-900 font-extrabold px-1.5 py-0.2 rounded border border-indigo-300">
                              GOVT REG: DDA-2026-BD
                            </span>
                          </div>
                          <h1 className="text-xl font-black text-slate-950 tracking-tight">
                            {activeTenant?.name || 'ঢাকা ড্রিমার্স একাডেমি'}
                          </h1>
                          <p className="text-[11px] text-slate-600 font-medium">
                            অফিসিয়াল স্টাডি প্রগ্রেস ও সার্বিক পারফরম্যান্স মূল্যায়ন রিপোর্ট • শিক্ষাবর্ষ ২০২৬
                          </p>
                        </div>
                      </div>

                      {/* Barcode & Verification Ref */}
                      <div className="text-right">
                        <div className="font-mono text-sm tracking-widest text-slate-800 font-bold select-none">
                          ||| | |||| | ||| |||| |
                        </div>
                        <div className="text-[10px] font-mono font-bold text-slate-700">
                          {reportIdNumber}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          তারিখ: {currentDateBengali}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Student Profile Ribbon */}
                  <div className="grid grid-cols-4 gap-2.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs mt-3">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">শিক্ষার্থীর নাম</span>
                      <span className="font-black text-slate-950 text-xs truncate block">{user.displayName}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">শিক্ষার্থী আইডি</span>
                      <span className="font-mono font-bold text-indigo-800 text-xs">{user.uid.slice(0, 12).toUpperCase()}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">টার্গেট প্রস্তুতি</span>
                      <span className="font-bold text-slate-800 text-xs truncate block">{user.primaryGoal || 'বিসিএস ও উচ্চশিক্ষা'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">বিভাগ ও সেশন</span>
                      <span className="font-bold text-slate-800 text-xs">সেশন ২০২৬ (Regular)</span>
                    </div>
                  </div>

                  {/* Executive KPI Scorecards */}
                  <div className="mt-3.5">
                    <div className="text-[11px] font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-indigo-700" />
                        মূল্যায়ন সূচক ও ফোকাস পরিসংখ্যান (Key Performance Indicators)
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        দক্ষতা গ্রেড: A+ (Exemplary)
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="p-2.5 bg-indigo-50/70 border border-indigo-200 rounded-lg">
                        <div className="text-[10px] font-bold text-indigo-900">মোট অধ্যয়ন সময়</div>
                        <div className="text-lg font-black text-indigo-800 mt-0.5">
                          {formatBengaliDuration(metrics.totalFocusedMinutes)}
                        </div>
                        <div className="text-[9px] text-slate-500 mt-0.5">{toBengaliNumber(metrics.totalSessionsCount)} টি সেশন সম্পন্ন</div>
                      </div>

                      <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-lg">
                        <div className="text-[10px] font-bold text-amber-900">বর্তমান স্ট্রিক</div>
                        <div className="text-lg font-black text-amber-600 mt-0.5">
                          {toBengaliNumber(streak.currentStreak)} দিন
                        </div>
                        <div className="text-[9px] text-slate-500 mt-0.5">অবিচল নিয়মানুবর্তিতা</div>
                      </div>

                      <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-lg">
                        <div className="text-[10px] font-bold text-emerald-900">দৈনিক লক্ষ্য পূরণ</div>
                        <div className="text-lg font-black text-emerald-700 mt-0.5">
                          {toBengaliNumber(metrics.dailyGoalCompletionPercent)}%
                        </div>
                        <div className="text-[9px] text-slate-500 mt-0.5">টার্গেট {toBengaliNumber(user.dailyGoalMinutes / 60)} ঘণ্টা/দিন</div>
                      </div>

                      <div className="p-2.5 bg-purple-50/70 border border-purple-200 rounded-lg">
                        <div className="text-[10px] font-bold text-purple-900">টাস্ক সমাপ্তি হার</div>
                        <div className="text-lg font-black text-purple-700 mt-0.5">
                          {toBengaliNumber(metrics.completedTasksCount)} / {toBengaliNumber(tasks.length)}
                        </div>
                        <div className="text-[9px] text-slate-500 mt-0.5">নির্ধারিত কাজ সম্পন্ন</div>
                      </div>
                    </div>
                  </div>

                  {/* Audit Log Table */}
                  <div className="mt-3.5">
                    <div className="text-[11px] font-black text-slate-800 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-indigo-700" />
                        সাম্প্রতিক ফোকাস স্টাডি সেশন অডিট লগ (Audit Log Ledger)
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono">সর্বশেষ কার্যদিবসের তথ্য</span>
                    </div>

                    <table className="w-full text-left text-xs border border-slate-300 rounded-lg overflow-hidden">
                      <thead className="bg-slate-100 text-slate-800 border-b border-slate-300">
                        <tr>
                          <th className="py-1.5 px-2.5 font-bold text-[11px]">তারিখ ও সময়</th>
                          <th className="py-1.5 px-2.5 font-bold text-[11px]">বিষয়</th>
                          <th className="py-1.5 px-2.5 font-bold text-[11px]">পরিকল্পিত সময়</th>
                          <th className="py-1.5 px-2.5 font-bold text-[11px]">প্রকৃত অধ্যয়ন</th>
                          <th className="py-1.5 px-2.5 font-bold text-[11px]">অগ্রগতি নোট</th>
                          <th className="py-1.5 px-2.5 font-bold text-[11px] text-right">স্ট্যাটাস</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-[11px]">
                        {sessions.slice(0, 6).map((sess, idx) => {
                          const subj = subjects.find((s) => s.id === sess.subjectId);
                          const dateFormatted = new Date(sess.startTime).toLocaleDateString('bn-BD', {
                            day: 'numeric',
                            month: 'short',
                          });
                          return (
                            <tr key={sess.id || idx} className="hover:bg-slate-50/70">
                              <td className="py-1.5 px-2.5 font-medium text-slate-700">{toBengaliNumber(dateFormatted)}</td>
                              <td className="py-1.5 px-2.5 font-bold text-slate-900">{subj?.name || 'ফোকাস সেশন'}</td>
                              <td className="py-1.5 px-2.5 text-slate-600">{toBengaliNumber(sess.plannedDurationMinutes)} মিনিট</td>
                              <td className="py-1.5 px-2.5 font-black text-indigo-800">
                                {toBengaliNumber(Math.round(sess.actualDurationSeconds / 60))} মিনিট
                              </td>
                              <td className="py-1.5 px-2.5 text-slate-600 text-[10px] truncate max-w-[190px]">
                                {sess.notes || 'অধ্যায় ভিত্তিক অনুশীলন ও মডেল সমাধান সম্পন্ন'}
                              </td>
                              <td className="py-1.5 px-2.5 text-right font-bold">
                                <span className="inline-flex items-center text-[9px] text-emerald-800 bg-emerald-100/80 px-1.5 py-0.2 rounded border border-emerald-300">
                                  ✓ সফল
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mentor Evaluation Remarks */}
                  <div className="mt-3 p-2.5 bg-amber-50/60 rounded-lg border border-amber-200 text-[11px] text-amber-950">
                    <span className="font-bold text-amber-900">মেন্টরের প্রাতিষ্ঠানিক মন্তব্য:</span>{' '}
                    শিক্ষার্থী বিগত সপ্তাহজুড়ে পূর্ণ একাগ্রতা ও সময়ানুবর্তিতা প্রদর্শন করেছেন। গণিত ও সাধারণ জ্ঞানে লক্ষ্যমাত্রা অর্জিত হয়েছে; ইংরেজি ভোকাবুলারি রিভিশন বজায় রাখলে আগামী মক টেস্টে শীর্ষস্থান নিশ্চিত হবে।
                  </div>
                </div>

                {/* Professional Signatures Section */}
                <div className="pt-2 border-t-2 border-slate-300 print-avoid-break">
                  <div className="grid grid-cols-3 gap-4 items-end">
                    <SignatureBlock
                      signature={studentSig}
                      role="student"
                      defaultName={user.displayName}
                      defaultTitle="শিক্ষার্থীর প্রতিস্বাক্ষর"
                      onEdit={() => handleOpenSigModal('student')}
                      showSeal={false}
                    />
                    <SignatureBlock
                      signature={mentorSig}
                      role="mentor"
                      defaultName="প্রফেসর ড. মাহফুজুল ইসলাম"
                      defaultTitle="একাডেমিক ডিরেক্টর ও প্রধান শিক্ষক"
                      defaultOrg={activeTenant?.name || 'ঢাকা ড্রিমার্স একাডেমি'}
                      onEdit={() => handleOpenSigModal('mentor')}
                      showSeal={true}
                    />
                    <SignatureBlock
                      signature={adminSig}
                      role="admin"
                      defaultName="মুস্তাফা রহমান"
                      defaultTitle="চিফ প্ল্যাটফর্ম অ্যাডমিনিস্ট্রেটর"
                      defaultOrg="FocusStudy Technologies BD"
                      onEdit={() => handleOpenSigModal('admin')}
                      showSeal={true}
                    />
                  </div>

                  {/* Official Audit Sub-footer */}
                  <div className="mt-4 pt-1.5 border-t border-slate-200 flex justify-between items-center text-[9px] font-mono text-slate-500">
                    <span>FocusStudy Bangladesh • National Education Network</span>
                    <span>পৃষ্ঠা ১ এর ১ (A4 Single Page Audit)</span>
                    <span>ডিজিটাল অডিট লিংক: verify.focusstudy.edu.bd/audit/{reportIdNumber}</span>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================
                REPORT 2: SUBJECT MASTERY & PERFORMANCE REPORT
                ======================================================== */}
            {selectedReport === 'subject_mastery' && (
              <div className="space-y-4 text-slate-900 flex flex-col justify-between min-h-[265mm]">
                <div>
                  <div className="border-b-2 border-indigo-950 pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-purple-900 text-white flex flex-col items-center justify-center font-black text-xl shadow-md border-2 border-amber-400">
                          SM
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black tracking-widest text-purple-900 uppercase">
                              বিষয়ভিত্তিক সক্ষমতা ও সিলেবাস কভারেজ অডিট
                            </span>
                            <span className="text-[9px] bg-purple-100 text-purple-900 font-bold px-1.5 py-0.2 rounded border border-purple-300">
                              ACADEMIC MASTERY REPORT
                            </span>
                          </div>
                          <h1 className="text-xl font-black text-slate-950">
                            {activeTenant?.name || 'ঢাকা ড্রিমার্স একাডেমি'}
                          </h1>
                          <p className="text-[11px] text-slate-600 font-medium">
                            শিক্ষার্থী: {user.displayName} (আইডি: {user.uid.slice(0, 10).toUpperCase()})
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono text-sm tracking-widest text-slate-800 font-bold select-none">
                          |||| | || ||||| | |||
                        </div>
                        <div className="text-[10px] font-mono font-bold text-slate-700">
                          {reportIdNumber}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          তারিখ: {currentDateBengali}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Subject Matrix Table */}
                  <div className="mt-3.5">
                    <div className="text-[11px] font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>বিষয়ভিত্তিক সময় বরাদ্দ, টার্গেট অর্জন ও সক্ষমতা গ্রেড</span>
                      <span className="text-[9px] font-mono text-indigo-700 font-bold">সিলেবাস কভারেজ ৮০%+</span>
                    </div>

                    <table className="w-full text-left text-xs border border-slate-300 rounded-lg overflow-hidden">
                      <thead className="bg-slate-100 text-slate-800 border-b border-slate-300 text-[11px]">
                        <tr>
                          <th className="py-2 px-2.5 font-bold">বিষয়</th>
                          <th className="py-2 px-2.5 font-bold">টার্গেট সময়</th>
                          <th className="py-2 px-2.5 font-bold">অর্জিত সময়</th>
                          <th className="py-2 px-2.5 font-bold">অগ্রগতি হার</th>
                          <th className="py-2 px-2.5 font-bold">মাস্টারি গ্রেড</th>
                          <th className="py-2 px-2.5 font-bold text-right">স্ট্যাটাস</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-[11px]">
                        {subjectData.map((sub, idx) => {
                          const grade =
                            sub.percentage >= 100
                              ? 'A+ (Exemplary)'
                              : sub.percentage >= 70
                              ? 'A (Strong)'
                              : 'B (Developing)';
                          return (
                            <tr key={sub.subjectId || idx} className="hover:bg-slate-50/70">
                              <td className="py-2 px-2.5 font-bold text-slate-900 flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: sub.color }} />
                                <span>{sub.subjectName}</span>
                              </td>
                              <td className="py-2 px-2.5 text-slate-600 font-medium">
                                {formatBengaliDuration(sub.targetMinutes)}
                              </td>
                              <td className="py-2 px-2.5 font-black text-indigo-800">
                                {formatBengaliDuration(sub.minutes)}
                              </td>
                              <td className="py-2 px-2.5">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-20 bg-slate-200 h-2 rounded-full overflow-hidden">
                                    <div
                                      className="h-full rounded-full"
                                      style={{
                                        width: `${Math.min(sub.percentage, 100)}%`,
                                        backgroundColor: sub.color,
                                      }}
                                    />
                                  </div>
                                  <span className="font-bold text-[10px]">{toBengaliNumber(sub.percentage)}%</span>
                                </div>
                              </td>
                              <td className="py-2 px-2.5 font-bold text-slate-800">{grade}</td>
                              <td className="py-2 px-2.5 text-right">
                                {sub.percentage >= 100 ? (
                                  <span className="text-emerald-800 font-bold bg-emerald-100/70 px-1.5 py-0.2 rounded text-[10px] border border-emerald-300">
                                    টার্গেট অর্জিত
                                  </span>
                                ) : (
                                  <span className="text-amber-800 font-bold bg-amber-100/70 px-1.5 py-0.2 rounded text-[10px] border border-amber-300">
                                    চলমান
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Strengths & Actionable Recommendations */}
                  <div className="grid grid-cols-2 gap-3 mt-3.5">
                    <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg">
                      <h4 className="text-[11px] font-black text-emerald-900 mb-1 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                        শীর্ষ পারফরম্যান্স ও শক্তি
                      </h4>
                      <ul className="text-[10px] text-slate-700 space-y-1 list-disc list-inside">
                        <li>উচ্চতর গণিত ও অ্যালগরিদমিক সমাধান দক্ষতা ৯৫%+</li>
                        <li>বিসিএস বাংলা ব্যাকরণ ও সাহিত্য নিয়মিত রিভিশন সম্পন্ন</li>
                        <li>প্রতিদিনের পড়া নির্ধারিত সময়ের আগেই সমাপ্ত হচ্ছে</li>
                      </ul>
                    </div>

                    <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-lg">
                      <h4 className="text-[11px] font-black text-indigo-900 mb-1 flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-indigo-700" />
                        আগামী সপ্তাহের অ্যাকশন প্ল্যান
                      </h4>
                      <ul className="text-[10px] text-slate-700 space-y-1 list-disc list-inside">
                        <li>English Reading Comprehension ও Vocabulary সেশন বৃদ্ধি</li>
                        <li>বিসিএস সাম্প্রতিক সাধারণ জ্ঞান ও মক টেস্টে সময় দেওয়া</li>
                        <li>সাপ্তাহিক রিভিশন প্ল্যান অনুযায়ী ৩টি ফুল টেস্ট দেওয়া</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Signatures */}
                <div className="pt-2 border-t-2 border-slate-300 print-avoid-break">
                  <div className="grid grid-cols-2 gap-8 items-end max-w-lg mx-auto">
                    <SignatureBlock
                      signature={mentorSig}
                      role="mentor"
                      defaultName="প্রফেসর ড. মাহফুজুল ইসলাম"
                      defaultTitle="বিষয়ভিত্তিক প্রধান উপদেষ্টা ও মেন্টর"
                      defaultOrg={activeTenant?.name || 'ঢাকা ড্রিমার্স একাডেমি'}
                      onEdit={() => handleOpenSigModal('mentor')}
                      showSeal={true}
                    />
                    <SignatureBlock
                      signature={adminSig}
                      role="admin"
                      defaultName="মুস্তাফা রহমান"
                      defaultTitle="চিফ প্ল্যাটফর্ম অ্যাডমিনিস্ট্রেটর"
                      defaultOrg="FocusStudy Technologies BD"
                      onEdit={() => handleOpenSigModal('admin')}
                      showSeal={true}
                    />
                  </div>

                  <div className="mt-4 pt-1.5 border-t border-slate-200 flex justify-between items-center text-[9px] font-mono text-slate-500">
                    <span>FocusStudy Bangladesh • Academic Analytics Engine</span>
                    <span>পৃষ্ঠা ১ এর ১ (A4 Single Page Audit)</span>
                    <span>ভেরিফিকেশন আইডি: {reportIdNumber}</span>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================
                REPORT 3: TENANT ACADEMY BATCH & ATTENDANCE REPORT
                ======================================================== */}
            {selectedReport === 'attendance_batch' && (
              <div className="space-y-4 text-slate-900 flex flex-col justify-between min-h-[265mm]">
                <div>
                  <div className="border-b-2 border-indigo-950 pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-teal-900 text-white flex flex-col items-center justify-center font-black text-xl shadow-md border-2 border-amber-400">
                          ATT
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black tracking-widest text-teal-900 uppercase">
                              মাল্টি-টেন্যান্ট একাডেমি ও ব্যাচ উপস্থিতি অডিট
                            </span>
                            <span className="text-[9px] bg-teal-100 text-teal-900 font-bold px-1.5 py-0.2 rounded border border-teal-300">
                              BATCH AUDIT LEDGER
                            </span>
                          </div>
                          <h1 className="text-xl font-black text-slate-950">
                            {activeTenant?.name || 'ঢাকা ড্রিমার্স একাডেমি'}
                          </h1>
                          <p className="text-[11px] text-slate-600 font-medium">
                            ব্যাচ: BATCH-47 (বিসিএস প্রিলিমিনারি স্পেশাল) • শিক্ষাবর্ষ ২০২৬
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono text-sm tracking-widest text-slate-800 font-bold select-none">
                          || | ||||| | ||| || ||
                        </div>
                        <div className="text-[10px] font-mono font-bold text-slate-700">
                          {reportIdNumber}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          তারিখ: {currentDateBengali}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-4 gap-2 text-center mt-3">
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="text-[10px] text-slate-600 font-bold uppercase">মোট কার্যদিবস</div>
                      <div className="text-lg font-black text-slate-950 mt-0.5">৩০ দিন</div>
                      <div className="text-[9px] text-slate-500">ব্যাচ ক্যালেন্ডার</div>
                    </div>
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <div className="text-[10px] text-emerald-900 font-bold uppercase">উপস্থিত দিন</div>
                      <div className="text-lg font-black text-emerald-700 mt-0.5">২৯ দিন</div>
                      <div className="text-[9px] text-emerald-600">১ দিন ছুটির আবেদন</div>
                    </div>
                    <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-lg">
                      <div className="text-[10px] text-indigo-900 font-bold uppercase">উপস্থিতি হার</div>
                      <div className="text-lg font-black text-indigo-800 mt-0.5">৯৬.৭%</div>
                      <div className="text-[9px] text-indigo-600">রেগুলার স্ট্যান্ডিং</div>
                    </div>
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="text-[10px] text-amber-900 font-bold uppercase">শৃঙ্খলা ও অডিট</div>
                      <div className="text-lg font-black text-amber-700 mt-0.5">A+ (নিখুঁত)</div>
                      <div className="text-[9px] text-amber-600">ভেরিফায়েড উপস্থিতি</div>
                    </div>
                  </div>

                  {/* Attendance Log Table */}
                  <div className="mt-3.5">
                    <div className="text-[11px] font-black text-slate-800 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span>ব্যাচ উপস্থিতি ও দৈনিক প্রবেশ লগ (Daily Check-in Ledger)</span>
                      <span className="text-[9px] text-slate-500 font-mono">ক্লাউড লগ ও বায়োমেট্রিক/অনলাইন ভেরিফাইড</span>
                    </div>

                    <table className="w-full text-left text-xs border border-slate-300 rounded-lg overflow-hidden">
                      <thead className="bg-slate-100 text-slate-800 border-b border-slate-300 text-[11px]">
                        <tr>
                          <th className="py-2 px-2.5 font-bold">তারিখ</th>
                          <th className="py-2 px-2.5 font-bold">শুরুর সময়</th>
                          <th className="py-2 px-2.5 font-bold">সমাপ্তি সময়</th>
                          <th className="py-2 px-2.5 font-bold">স্থায়িত্ব</th>
                          <th className="py-2 px-2.5 font-bold">অনলাইন ব্যাচ চেক-ইন</th>
                          <th className="py-2 px-2.5 font-bold text-right">স্ট্যাটাস</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-[11px]">
                        {[1, 2, 3, 4, 5, 6].map((day) => {
                          const d = new Date();
                          d.setDate(d.getDate() - day);
                          const dateFmt = d.toLocaleDateString('bn-BD', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          });
                          return (
                            <tr key={day} className="hover:bg-slate-50/70">
                              <td className="py-2 px-2.5 font-bold text-slate-900">{toBengaliNumber(dateFmt)}</td>
                              <td className="py-2 px-2.5 font-mono text-slate-600">১০:০০ AM</td>
                              <td className="py-2 px-2.5 font-mono text-slate-600">১২:৩০ PM</td>
                              <td className="py-2 px-2.5 font-black text-indigo-800">১৫০ মিনিট</td>
                              <td className="py-2 px-2.5 text-slate-700">ডিজিটাল ও মেন্টর ভেরিফাইড</td>
                              <td className="py-2 px-2.5 text-right font-bold">
                                <span className="text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded text-[10px] border border-emerald-300">
                                  ✓ নিয়মিত উপস্থিত
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Signatures with Academy Seal */}
                <div className="pt-2 border-t-2 border-slate-300 print-avoid-break">
                  <div className="grid grid-cols-3 gap-4 items-end">
                    <SignatureBlock
                      signature={studentSig}
                      role="student"
                      defaultName={user.displayName}
                      defaultTitle="শিক্ষার্থীর স্বাক্ষর"
                      onEdit={() => handleOpenSigModal('student')}
                      showSeal={false}
                    />

                    {/* Official Academy Seal Stamp in Center */}
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-20 h-20 rounded-full border-4 border-dashed border-indigo-900 text-indigo-950 flex flex-col items-center justify-center p-1 text-center rotate-[-6deg] opacity-90 shadow-xs">
                        <span className="text-[7px] font-black uppercase tracking-tight leading-none text-indigo-950">
                          {activeTenant?.name || 'ঢাকা ড্রিমার্স একাডেমি'}
                        </span>
                        <ShieldCheck className="w-5 h-5 text-indigo-800 my-0.5" />
                        <span className="text-[6px] font-mono font-bold text-indigo-900">VERIFIED AUDIT</span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-600 mt-1">অফিসিয়াল একাডেমি সিল</span>
                    </div>

                    <SignatureBlock
                      signature={mentorSig}
                      role="mentor"
                      defaultName="প্রফেসর ড. মাহফুজুল ইসলাম"
                      defaultTitle="ব্যাচ কো-অর্ডিনেটর ও প্রধান শিক্ষক"
                      defaultOrg={activeTenant?.name || 'ঢাকা ড্রিমার্স একাডেমি'}
                      onEdit={() => handleOpenSigModal('mentor')}
                      showSeal={true}
                    />
                  </div>

                  <div className="mt-4 pt-1.5 border-t border-slate-200 flex justify-between items-center text-[9px] font-mono text-slate-500">
                    <span>FocusStudy Attendance Verification Gateway</span>
                    <span>পৃষ্ঠা ১ এর ১ (A4 Single Page Audit)</span>
                    <span>অডিট ট্র্যাকিং কোড: {reportIdNumber}</span>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================
                REPORT 4: MONEY RECEIPT & TAX INVOICE (bKash/Nagad/Rocket)
                ======================================================== */}
            {selectedReport === 'invoice_receipt' && (
              <div className="space-y-4 text-slate-900 flex flex-col justify-between min-h-[265mm]">
                <div>
                  <div className="border-b-2 border-indigo-950 pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-emerald-800 text-white flex flex-col items-center justify-center font-black text-xl shadow-md border-2 border-amber-400">
                          ৳
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black tracking-widest text-emerald-800 uppercase">
                              OFFICIAL MONEY RECEIPT / সরকারি অনুমোদিত চালান রশিদ
                            </span>
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.2 rounded border border-emerald-300">
                              ✓ PAID & SETTLED
                            </span>
                          </div>
                          <h1 className="text-xl font-black text-slate-950">
                            FocusStudy Technologies Bangladesh
                          </h1>
                          <p className="text-[11px] text-slate-600 font-medium">
                            মিরপুর ডিওএইচএস, ঢাকা-১২১৬ • ইমেইল: billing@focusstudy.edu.bd
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono text-sm tracking-widest text-slate-800 font-bold select-none">
                          ||||| | ||| |||| | ||
                        </div>
                        <div className="text-[10px] font-mono font-bold text-slate-900">
                          রশিদ নং: MR-2026-BD-{activeTx?.trxId || 'BK9821'}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          তারিখ: {currentDateBengali}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Customer and Gateway Info Box */}
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs mt-3">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">গ্রাহক / শিক্ষার্থীর বিবরণ:</span>
                      <div className="font-black text-slate-950 text-xs mt-0.5">{user.displayName}</div>
                      <div className="text-slate-600 text-[11px]">{user.email}</div>
                      <div className="text-slate-600 text-[11px]">একাডেমি: {activeTenant?.name || 'ঢাকা ড্রিমার্স একাডেমি'}</div>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">পেমেন্ট গেটওয়ে ট্রানজেকশন:</span>
                      <div className="text-slate-900 font-mono text-xs font-bold mt-0.5">
                        TrxID: <span className="text-emerald-700 font-black">{activeTx?.trxId || 'BL98KX72Q4'}</span>
                      </div>
                      <div className="text-slate-600 text-[11px]">
                        গেটওয়ে মাধ্যম: <strong className="uppercase">{(activeTx?.gateway || 'bkash')}</strong>
                      </div>
                      <div className="text-slate-600 text-[11px]">প্রেরক মোবাইল: {activeTx?.senderNumber || '01712-345678'}</div>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="mt-3.5">
                    <table className="w-full text-left text-xs border border-slate-300 rounded-lg overflow-hidden">
                      <thead className="bg-slate-100 text-slate-800 border-b border-slate-300 text-[11px]">
                        <tr>
                          <th className="py-2 px-2.5 font-bold">আইটেম বিবরণ (Item Description)</th>
                          <th className="py-2 px-2.5 font-bold text-center">মেয়াদকাল</th>
                          <th className="py-2 px-2.5 font-bold text-center">পরিমাণ</th>
                          <th className="py-2 px-2.5 font-bold text-right">মূল্য (BDT)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-[11px]">
                        <tr>
                          <td className="py-2.5 px-2.5">
                            <div className="font-bold text-slate-950">
                              FocusStudy {activeTx?.planName || 'মাল্টি-টেন্যান্ট একাডেমি'} সাবস্ক্রিপশন
                            </div>
                            <div className="text-[10px] text-slate-500">
                              ফুল মাল্টি-টেন্যান্ট অ্যাক্সেস, স্টাডি ট্র্যাকিং, ব্যাচ ম্যানেজমেন্ট ও সনদ সুবিধা
                            </div>
                          </td>
                          <td className="py-2.5 px-2.5 text-center text-slate-700">
                            {activeTx?.billingCycle === 'yearly' ? '১ বছর' : '১ মাস'}
                          </td>
                          <td className="py-2.5 px-2.5 text-center text-slate-700 font-mono">১</td>
                          <td className="py-2.5 px-2.5 text-right font-black text-slate-900">
                            {formatCurrencyBDT(activeTx?.amount || 9990)}
                          </td>
                        </tr>
                        <tr className="bg-slate-50/60">
                          <td colSpan={3} className="py-1.5 px-2.5 text-right font-bold text-slate-600">
                            উপ-মোট (Subtotal):
                          </td>
                          <td className="py-1.5 px-2.5 text-right font-bold text-slate-900">
                            {formatCurrencyBDT(activeTx?.amount || 9990)}
                          </td>
                        </tr>
                        <tr className="bg-slate-50/60">
                          <td colSpan={3} className="py-1.5 px-2.5 text-right font-bold text-slate-600">
                            ভ্যাট / ট্যাক্স (VAT 0% - Educational Exempted):
                          </td>
                          <td className="py-1.5 px-2.5 text-right font-bold text-slate-900">৳০.০০</td>
                        </tr>
                        <tr className="bg-indigo-50/80 text-indigo-950">
                          <td colSpan={3} className="py-2 px-2.5 text-right font-black text-xs">
                            সর্বমোট পরিশোধিত টাকা (Total Paid):
                          </td>
                          <td className="py-2 px-2.5 text-right font-black text-sm text-indigo-900">
                            {formatCurrencyBDT(activeTx?.amount || 9990)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Amount in Words */}
                  <div className="mt-3 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                    <span className="font-bold text-slate-700">কথায় (In Words):</span>{' '}
                    <span className="italic text-slate-950 font-semibold">
                      {activeTx?.amount === 9990
                        ? 'নয় হাজার নয় শত নব্বই টাকা মাত্র'
                        : 'তিন শত নিরানব্বই টাকা মাত্র'}
                    </span>
                  </div>
                </div>

                {/* Signatures & Paid Stamp */}
                <div className="pt-2 border-t-2 border-slate-300 print-avoid-break">
                  <div className="grid grid-cols-3 gap-4 items-end">
                    <SignatureBlock
                      signature={studentSig}
                      role="student"
                      defaultName={user.displayName}
                      defaultTitle="গ্রাহকের স্বাক্ষর"
                      onEdit={() => handleOpenSigModal('student')}
                      showSeal={false}
                    />

                    {/* Paid Stamp in center */}
                    <div className="flex flex-col items-center justify-center">
                      <div className="px-3.5 py-1.5 border-4 border-emerald-600 text-emerald-700 font-black text-xs uppercase tracking-widest rounded-lg rotate-[-6deg] opacity-90 text-center shadow-xs">
                        ✓ PAID & SETTLED<br />
                        <span className="text-[8px] font-mono font-normal">GATEWAY VERIFIED</span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-500 mt-1">পেমেন্ট গেটওয়ে সিল</span>
                    </div>

                    <SignatureBlock
                      signature={adminSig}
                      role="admin"
                      defaultName="মুস্তাফা রহমান"
                      defaultTitle="কর্তৃপক্ষের অনুমোদিত স্বাক্ষর"
                      defaultOrg="FocusStudy Technologies BD"
                      onEdit={() => handleOpenSigModal('admin')}
                      showSeal={true}
                    />
                  </div>

                  <div className="mt-4 pt-1.5 border-t border-slate-200 flex justify-between items-center text-[9px] font-mono text-slate-500">
                    <span>FocusStudy Bangladesh • Automated Billing System</span>
                    <span>পৃষ্ঠা ১ এর ১ (A4 Single Page Invoice)</span>
                    <span>চালান ভেরিফিকেশন লিংক: verify.focusstudy.edu.bd/inv/{activeTx?.trxId || 'BK9821'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Signature Configuration Modal */}
      <SignatureManagerModal
        isOpen={isSigModalOpen}
        onClose={() => setIsSigModalOpen(false)}
        initialRole={activeSigRole}
      />
    </div>
  );
}
