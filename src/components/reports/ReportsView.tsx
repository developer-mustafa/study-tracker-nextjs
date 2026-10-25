import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Calendar,
  Building2,
  Download,
  Share2,
  CheckCircle2,
  TrendingUp,
  Layers,
  Sparkles,
  ExternalLink,
  Receipt,
  GraduationCap,
  Users,
} from 'lucide-react';
import { useFocusStudyData } from '../../lib/storage/store';
import { useAuth } from '../../contexts/AuthContext';
import { ReportType } from '../../types';
import { ReportPrintModal } from './ReportPrintModal';
import { toBengaliNumber } from '../../lib/utils/formatters';

import { PenTool } from 'lucide-react';
import { SignatureManagerModal } from '../signatures/SignatureManagerModal';
import { SignatureRole } from '../../types';

export function ReportsView() {
  const { user } = useAuth();
  const { activeTenant, sessions, tasks, subjects, paymentTransactions } = useFocusStudyData();
  const [selectedReportType, setSelectedReportType] = useState<ReportType>('progress_summary');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSigModalOpen, setIsSigModalOpen] = useState(false);
  const [sigRole, setSigRole] = useState<SignatureRole>('student');

  const reportCards = [
    {
      id: 'progress_summary' as ReportType,
      title: 'দৈনিক ও সাপ্তাহিক স্টাডি প্রগ্রেস রিপোর্ট',
      titleEn: 'Study Progress & Performance Evaluation Report',
      description: 'মোট অধ্যয়ন সময়, সেশন সংখ্যা, দৈনিক লক্ষ্য সমাপ্তি হার এবং স্ট্রিকের বিস্তারিত অফিসিয়াল মূল্যায়ন ছক।',
      icon: TrendingUp,
      color: 'from-blue-600 to-indigo-600',
      badge: 'জনপ্রিয়',
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
      pages: '১ পৃষ্ঠা (A4 Portrait)',
    },
    {
      id: 'subject_mastery' as ReportType,
      title: 'বিষয়ভিত্তিক ফলাফল ও মাস্টারি বিশ্লেষণ রিপোর্ট',
      titleEn: 'Subject-wise Mastery & Syllabus Coverage Audit',
      description: 'প্রতিটি বিষয়ের টার্গেট সময় বনাম অর্জিত সময়, মাস্টারি স্কোর, গ্রেড এবং শিক্ষকদের পর্যালোচনা নোট।',
      icon: Layers,
      color: 'from-purple-600 to-pink-600',
      badge: 'সিলেবাস অডিট',
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
      pages: '১ পৃষ্ঠা (A4 Portrait)',
    },
    {
      id: 'attendance_batch' as ReportType,
      title: 'মাল্টি-টেন্যান্ট একাডেমি ও ব্যাচ উপস্থিতি রিপোর্ট',
      titleEn: 'Batch Attendance & Live Focus Tracking Ledger',
      description: `${activeTenant?.name || 'ঢাকা ড্রিমার্স একাডেমি'} এর নির্ধারিত ব্যাচ উপস্থিতি, সময়ানুবর্তিতা এবং ডিজিটাল স্বাক্ষর অডিট।`,
      icon: Users,
      color: 'from-emerald-600 to-teal-600',
      badge: 'একাডেমি অনুমোদিত',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
      pages: '১ পৃষ্ঠা (A4 Portrait)',
    },
    {
      id: 'invoice_receipt' as ReportType,
      title: 'আর্থিক সাবস্ক্রিপশন ইনভয়েস ও মানি রিসিট',
      titleEn: 'Official Tax Invoice & Money Receipt (bKash/Nagad/Rocket)',
      description: 'পেমেন্ট গেটওয়ে TrxID, প্রেরক মোবাইল নম্বর, সাবস্ক্রিপশন প্ল্যান, টাকার অঙ্ক (কথায় ও অংকে) ও ভ্যাট চালান।',
      icon: Receipt,
      color: 'from-amber-500 to-orange-600',
      badge: 'অফিসিয়াল চালান',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
      pages: '১ পৃষ্ঠা (A4 Portrait)',
    },
  ];

  const handleOpenReport = (type: ReportType) => {
    setSelectedReportType(type);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl md:text-2xl font-bold text-[#17233F] dark:text-[#F1F5FF]">
              এ৪ রিপোর্ট জেনারেশন ও পিডিএফ প্রিন্ট মডিউল
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300">
              A4 Standard
            </span>
          </div>
          <p className="text-xs md:text-sm text-[#77839B] dark:text-[#A7B5CC] mt-0.5">
            সকল একাডেমিক প্রগ্রেস, বিষয়ভিত্তিক অ্যানালিটিক্স এবং পেমেন্ট রিসিট সরাসরি প্রিন্ট ও PDF আকারে সংরক্ষণ করুন
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSigRole('student');
              setIsSigModalOpen(true);
            }}
            className="px-3.5 py-2.5 bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] hover:bg-slate-50 dark:hover:bg-[#122440] text-amber-600 dark:text-amber-400 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <PenTool className="w-4 h-4 text-amber-500" />
            <span>স্বাক্ষর ও সিল যুক্ত করুন</span>
          </button>

          <button
            onClick={() => handleOpenReport('progress_summary')}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>তাত্ক্ষণিক প্রিন্ট প্রিভিউ খুলুন</span>
          </button>
        </div>
      </div>

      {/* Feature Highlights Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white border border-indigo-800/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>বাংলাদেশি শিক্ষাব্যবস্থা ও কোচিং একাডেমির উপযোগী প্রিন্ট ফরম্যাট</span>
          </div>
          <h3 className="text-lg font-bold text-white">
            অফিসিয়াল লেটারহেড, প্রাতিষ্ঠানিক সিল এবং QR ভেরিফিকেশন কোড অন্তর্ভুক্ত
          </h3>
          <p className="text-xs text-indigo-200/80">
            ব্রাউজারের ডিফল্ট হেডার/ফুটার ছাড়াই মার্জিনযুক্ত নিখুঁত ভেক্টর প্রিন্ট নিশ্চিত করে
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-md text-xs font-semibold text-white border border-white/10 text-center">
            <div className="text-[10px] text-indigo-300">পেজ সাইজ</div>
            <div className="font-bold">A4 (210×297 mm)</div>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-md text-xs font-semibold text-white border border-white/10 text-center">
            <div className="text-[10px] text-emerald-300">এক্সপোর্ট কোয়ালিটি</div>
            <div className="font-bold">Vector High-Res PDF</div>
          </div>
        </div>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {reportCards.map((rc) => {
          const Icon = rc.icon;
          return (
            <div
              key={rc.id}
              className="group relative overflow-hidden rounded-3xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] hover:border-indigo-400 dark:hover:border-indigo-500/50 p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${rc.color} text-white flex items-center justify-center shadow-md`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${rc.badgeColor}`}>
                      {rc.badge}
                    </span>
                    <span className="text-[10px] font-semibold text-[#77839B] dark:text-[#A7B5CC] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                      {rc.pages}
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-[#17233F] dark:text-[#F1F5FF] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {rc.title}
                </h3>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                  {rc.titleEn}
                </p>
                <p className="text-xs text-[#77839B] dark:text-[#A7B5CC] mt-2.5 leading-relaxed">
                  {rc.description}
                </p>
              </div>

              <div className="pt-5 mt-4 border-t border-[#E6EAF2] dark:border-[#243754] flex items-center justify-between">
                <span className="text-[11px] text-[#77839B] dark:text-[#A7B5CC]">
                  একাডেমি: <strong className="text-slate-800 dark:text-slate-200">{activeTenant?.name || 'ঢাকা ড্রিমার্স'}</strong>
                </span>

                <button
                  onClick={() => handleOpenReport(rc.id)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>প্রিভিউ ও প্রিন্ট (A4)</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Embedded Quick Modal */}
      <ReportPrintModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialReportType={selectedReportType}
      />

      {/* Signature Manager Modal */}
      <SignatureManagerModal
        isOpen={isSigModalOpen}
        onClose={() => setIsSigModalOpen(false)}
        initialRole={sigRole}
      />
    </div>
  );
}
