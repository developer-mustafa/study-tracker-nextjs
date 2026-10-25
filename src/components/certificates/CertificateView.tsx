import React, { useState } from 'react';
import {
  Award,
  Sparkles,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Search,
  Filter,
  PlusCircle,
  Building2,
  Lock,
  ExternalLink,
  Flame,
  Clock,
  BookOpen,
  PenTool,
} from 'lucide-react';
import { useFocusStudyData, FocusStudyStore } from '../../lib/storage/store';
import { useAuth } from '../../contexts/AuthContext';
import { Certificate, CertificateType, SignatureRole } from '../../types';
import { CertificatePrintModal } from './CertificatePrintModal';
import { SignatureManagerModal } from '../signatures/SignatureManagerModal';
import { toBengaliNumber } from '../../lib/utils/formatters';

export function CertificateView() {
  const { user, isPlatformAdmin } = useAuth();
  const { certificates, activeTenant } = useFocusStudyData();
  const [selectedType, setSelectedType] = useState<CertificateType | 'all'>('all');
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isSigModalOpen, setIsSigModalOpen] = useState(false);
  const [sigRole, setSigRole] = useState<SignatureRole>('mentor');

  // New certificate form state (for mentor/admin issuance)
  const [newTitle, setNewTitle] = useState('');
  const [newTitleEn, setNewTitleEn] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newRecipientName, setNewRecipientName] = useState(user.displayName);
  const [newRecipientNameEn, setNewRecipientNameEn] = useState('Mustafa Rahman');
  const [newType, setNewType] = useState<CertificateType>('excellence');
  const [newMilestoneDetail, setNewMilestoneDetail] = useState('');
  const [newScore, setNewScore] = useState('৯২% স্কোর');
  const [newGrade, setNewGrade] = useState('A+ (Distinction)');

  const filteredCerts = certificates.filter((c) => {
    if (selectedType === 'all') return true;
    return c.type === selectedType;
  });

  const unlockedCount = certificates.filter((c) => c.isUnlocked).length;

  const handleOpenCert = (cert: Certificate) => {
    setSelectedCert(cert);
    setIsPrintModalOpen(true);
  };

  const handleIssueCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    FocusStudyStore.issueCertificate({
      userId: user.uid,
      recipientName: newRecipientName || user.displayName,
      recipientNameEn: newRecipientNameEn || 'Mustafa Rahman',
      tenantId: activeTenant?.id,
      tenantName: activeTenant?.name || 'ঢাকা ড্রিমার্স একাডেমি',
      type: newType,
      title: newTitle,
      titleEn: newTitleEn || 'Certificate of Academic Excellence',
      subtitle: newSubtitle || 'অধ্যবসায় ও বিশেষ কৃতিত্বের স্বীকৃতিস্বরূপ',
      description: `এই মর্মে প্রত্যায়ন করা যাচ্ছে যে, ${newRecipientName || user.displayName} নির্ধারিত মাইলস্টোন ও পাঠক্রম সফলভাবে সম্পন্ন করেছেন।`,
      milestoneDetail: newMilestoneDetail || 'স্পেশাল একাডেমি কোর্স সমাপ্তি',
      scoreOrHours: newScore,
      grade: newGrade,
      signatoryName: 'প্রফেসর ড. মাহফুজুল ইসলাম',
      signatoryTitle: 'একাডেমিক ডিরেক্টর',
      adminSignatoryName: 'মুস্তাফা রহমান',
      adminSignatoryTitle: 'চিফ প্ল্যাটফর্ম অ্যাডমিনিস্ট্রেটর, FocusStudy',
    });

    setIsIssueModalOpen(false);
    // Reset form
    setNewTitle('');
    setNewTitleEn('');
    setNewSubtitle('');
    setNewMilestoneDetail('');
  };

  // Predefined upcoming milestones for aspirational progress
  const upcomingMilestones = [
    {
      title: '৫০ দিনের অবিচল স্টাডি স্ট্রিক সনদ',
      category: 'ধারাবাহিকতা',
      progress: 60,
      current: '৩০/৫০ দিন',
      icon: Flame,
      color: 'text-amber-500',
    },
    {
      title: '২০০ ঘণ্টার সেঞ্চুরিয়ান মাস্টার সনদ',
      category: 'গভীর একাগ্রতা',
      progress: 45,
      current: '৯০/২০০ ঘণ্টা',
      icon: Clock,
      color: 'text-blue-500',
    },
    {
      title: 'আইসিটি ও সাধারণ জ্ঞান পূর্ণ সিলেবাস সমাপ্তি',
      category: 'সিলেবাস মাস্টারি',
      progress: 75,
      current: '১৫/২০ মডিউল',
      icon: BookOpen,
      color: 'text-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl md:text-2xl font-bold text-[#17233F] dark:text-[#F1F5FF]">
              সনদপত্র ও সম্মাননা ক্রেডেনশিয়াল (Sanad & Certificates)
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
              {toBengaliNumber(unlockedCount)} টি অর্জিত
            </span>
          </div>
          <p className="text-xs md:text-sm text-[#77839B] dark:text-[#A7B5CC] mt-0.5">
            আপনার অধ্যবসায়, স্ট্রিক এবং একাডেমি কোর্স সমাপ্তির অফিসিয়াল ভেরিফায়েড প্রশংসাপত্র
          </p>
        </div>

        {/* Action Buttons: Signatures & Issue Certificate */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSigRole('mentor');
              setIsSigModalOpen(true);
            }}
            className="px-3.5 py-2 bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] hover:bg-slate-50 dark:hover:bg-[#122440] text-amber-600 dark:text-amber-400 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <PenTool className="w-4 h-4 text-amber-500" />
            <span>স্বাক্ষর ও সিল যুক্ত করুন</span>
          </button>

          <button
            onClick={() => setIsIssueModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>নতুন প্রশংসাপত্র প্রদান করুন</span>
          </button>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] shadow-xs">
          <div className="flex items-center gap-1.5 text-xs text-[#77839B] dark:text-[#A7B5CC] mb-1">
            <Award className="w-4 h-4 text-amber-500" />
            <span>অর্জিত সনদপত্র</span>
          </div>
          <div className="text-2xl font-black text-[#17233F] dark:text-[#F1F5FF]">
            {toBengaliNumber(unlockedCount)} টি
          </div>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">সবগুলি যাচাইযোগ্য</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] shadow-xs">
          <div className="flex items-center gap-1.5 text-xs text-[#77839B] dark:text-[#A7B5CC] mb-1">
            <Building2 className="w-4 h-4 text-indigo-500" />
            <span>একাডেমি পার্টনারশিপ</span>
          </div>
          <div className="text-lg font-bold text-[#17233F] dark:text-[#F1F5FF] truncate">
            {activeTenant?.name || 'ঢাকা ড্রিমার্স'}
          </div>
          <p className="text-[10px] text-[#77839B] dark:text-[#A7B5CC] mt-1">স্বীকৃত একাডেমি ব্যাচ</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] shadow-xs">
          <div className="flex items-center gap-1.5 text-xs text-[#77839B] dark:text-[#A7B5CC] mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>ডিজিটাল অডিট</span>
          </div>
          <div className="text-2xl font-black text-emerald-600">১০০% ভেরিফাইড</div>
          <p className="text-[10px] text-[#77839B] dark:text-[#A7B5CC] mt-1">QR ও কোড ট্র্যাকিং সক্রিয়</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] shadow-xs">
          <div className="flex items-center gap-1.5 text-xs text-[#77839B] dark:text-[#A7B5CC] mb-1">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>আসন্ন মাইলস্টোন</span>
          </div>
          <div className="text-2xl font-black text-purple-600">৩ টি চলমান</div>
          <p className="text-[10px] text-[#77839B] dark:text-[#A7B5CC] mt-1">অগ্রগতি ট্র্যাকিং চলছে</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setSelectedType('all')}
          className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
            selectedType === 'all'
              ? 'bg-[#5B5CE2] text-white shadow-md shadow-indigo-500/20'
              : 'bg-white dark:bg-[#0D1B32] text-[#77839B] dark:text-[#A7B5CC] border border-[#E6EAF2] dark:border-[#243754] hover:bg-slate-100 dark:hover:bg-[#122440]'
          }`}
        >
          সকল সনদ ({toBengaliNumber(certificates.length)})
        </button>
        <button
          onClick={() => setSelectedType('study_streak')}
          className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
            selectedType === 'study_streak'
              ? 'bg-[#5B5CE2] text-white shadow-md shadow-indigo-500/20'
              : 'bg-white dark:bg-[#0D1B32] text-[#77839B] dark:text-[#A7B5CC] border border-[#E6EAF2] dark:border-[#243754] hover:bg-slate-100 dark:hover:bg-[#122440]'
          }`}
        >
          স্টাডি স্ট্রিক ও নিষ্ঠা
        </button>
        <button
          onClick={() => setSelectedType('subject_mastery')}
          className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
            selectedType === 'subject_mastery'
              ? 'bg-[#5B5CE2] text-white shadow-md shadow-indigo-500/20'
              : 'bg-white dark:bg-[#0D1B32] text-[#77839B] dark:text-[#A7B5CC] border border-[#E6EAF2] dark:border-[#243754] hover:bg-slate-100 dark:hover:bg-[#122440]'
          }`}
        >
          বিষয়ভিত্তিক মাস্টারি
        </button>
        <button
          onClick={() => setSelectedType('course_completion')}
          className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
            selectedType === 'course_completion'
              ? 'bg-[#5B5CE2] text-white shadow-md shadow-indigo-500/20'
              : 'bg-white dark:bg-[#0D1B32] text-[#77839B] dark:text-[#A7B5CC] border border-[#E6EAF2] dark:border-[#243754] hover:bg-slate-100 dark:hover:bg-[#122440]'
          }`}
        >
          কোর্স ও ব্যাচ সমাপ্তি
        </button>
        <button
          onClick={() => setSelectedType('focus_hours')}
          className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer shrink-0 ${
            selectedType === 'focus_hours'
              ? 'bg-[#5B5CE2] text-white shadow-md shadow-indigo-500/20'
              : 'bg-white dark:bg-[#0D1B32] text-[#77839B] dark:text-[#A7B5CC] border border-[#E6EAF2] dark:border-[#243754] hover:bg-slate-100 dark:hover:bg-[#122440]'
          }`}
        >
          ১০০+ ঘণ্টা ফোকাস
        </button>
      </div>

      {/* Certificates Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredCerts.map((cert) => (
          <div
            key={cert.id}
            className="group relative overflow-hidden rounded-3xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] hover:border-amber-400 dark:hover:border-amber-500/60 p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            {/* Top Ornamental Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-indigo-600 to-emerald-500" />

            <div>
              {/* Header Badge & Verification Code */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#77839B] dark:text-[#A7B5CC] block">
                      {cert.tenantName}
                    </span>
                    <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {cert.certificateNumber}
                    </span>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  ভেরিফাইড সনদ
                </span>
              </div>

              {/* Title & Recipient */}
              <h3 className="text-lg font-bold text-[#17233F] dark:text-[#F1F5FF] group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                {cert.title}
              </h3>
              <p className="text-xs text-[#77839B] dark:text-[#A7B5CC] mt-0.5">
                {cert.subtitle}
              </p>

              {/* Recipient Details Pill */}
              <div className="my-4 p-3 rounded-2xl bg-[#F5F7FC] dark:bg-[#122440] border border-[#E6EAF2] dark:border-[#243754] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-[#77839B] dark:text-[#A7B5CC] block">প্রাপক</span>
                  <span className="font-bold text-[#17233F] dark:text-[#F1F5FF]">{cert.recipientName}</span>
                </div>
                {cert.grade && (
                  <div className="text-right">
                    <span className="text-[10px] text-[#77839B] dark:text-[#A7B5CC] block">গ্রেড/স্কোর</span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400">{cert.grade}</span>
                  </div>
                )}
                {cert.scoreOrHours && !cert.grade && (
                  <div className="text-right">
                    <span className="text-[10px] text-[#77839B] dark:text-[#A7B5CC] block">মাইলস্টোন</span>
                    <span className="font-black text-indigo-600 dark:text-indigo-400">{cert.scoreOrHours}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="pt-4 border-t border-[#E6EAF2] dark:border-[#243754] flex items-center justify-between">
              <span className="text-[11px] text-[#77839B] dark:text-[#A7B5CC] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {toBengaliNumber(new Date(cert.issueDate).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' }))}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenCert(cert)}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>সনদ দেখুন ও A4 প্রিন্ট</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming / In-Progress Milestones */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] shadow-xs">
        <h3 className="text-base font-bold text-[#17233F] dark:text-[#F1F5FF] mb-1 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          আসন্ন সনদপত্র ও মাইলস্টোন লক্ষ্যসমূহ
        </h3>
        <p className="text-xs text-[#77839B] dark:text-[#A7B5CC] mb-4">
          ধারাবাহিক অধ্যবসায়ের মাধ্যমে পরবর্তী মাইলস্টোন আনলক করুন
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {upcomingMilestones.map((m, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-[#F5F7FC] dark:bg-[#122440] border border-[#E6EAF2] dark:border-[#243754] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-[#77839B] dark:text-[#A7B5CC] flex items-center gap-1">
                    <m.icon className={`w-3.5 h-3.5 ${m.color}`} />
                    {m.category}
                  </span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">{toBengaliNumber(m.progress)}%</span>
                </div>
                <h4 className="text-sm font-bold text-[#17233F] dark:text-[#F1F5FF] mb-2">{m.title}</h4>
              </div>

              <div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mb-1.5">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${m.progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-[#77839B] dark:text-[#A7B5CC]">
                  <span>অগ্রগতি: {m.current}</span>
                  <span className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                    <Lock className="w-3 h-3" /> লকড
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Issue Certificate Modal (Mentors / Super Admin) */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E6EAF2] dark:border-[#243754] pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#17233F] dark:text-[#F1F5FF]">
                  নতুন সনদপত্র ও প্রশংসাপত্র ইস্যু করুন
                </h3>
                <p className="text-xs text-[#77839B] dark:text-[#A7B5CC]">
                  একাডেমি শিক্ষার্থী বা ব্যাচ সদস্যের জন্য অফিসিয়াল সনদ
                </p>
              </div>
              <button
                onClick={() => setIsIssueModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleIssueCertificate} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  সনদপত্রের শিরোনাম (বাংলা)
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: বিসিএস আন্তর্জাতিক বিষয়াবলি বিশেষ পারদর্শিতা সনদ"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#122440] text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Title (English)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Certificate of International Affairs Excellence"
                  value={newTitleEn}
                  onChange={(e) => setNewTitleEn(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#122440] text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    প্রাপকের নাম (বাংলা)
                  </label>
                  <input
                    type="text"
                    required
                    value={newRecipientName}
                    onChange={(e) => setNewRecipientName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#122440] text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Recipient Name (English)
                  </label>
                  <input
                    type="text"
                    required
                    value={newRecipientNameEn}
                    onChange={(e) => setNewRecipientNameEn(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#122440] text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    সনদের ক্যাটাগরি
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as CertificateType)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#122440] text-slate-900 dark:text-white"
                  >
                    <option value="study_streak">স্টাডি স্ট্রিক ও নিষ্ঠা</option>
                    <option value="subject_mastery">বিষয়ভিত্তিক মাস্টারি</option>
                    <option value="course_completion">কোর্স ও ব্যাচ সমাপ্তি</option>
                    <option value="focus_hours">১০০+ ঘণ্টা ফোকাস</option>
                    <option value="excellence">সামগ্রিক শ্রেষ্ঠত্ব সনদ</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    গ্রেড / স্বীকৃতি
                  </label>
                  <input
                    type="text"
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value)}
                    placeholder="যেমন: A+ (Distinction)"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#122440] text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  মাইলস্টোন বিবরণ
                </label>
                <input
                  type="text"
                  placeholder="যেমন: ৪৫তম মডেল টেস্টে প্রথম স্থান অধিকার করায়"
                  value={newMilestoneDetail}
                  onChange={(e) => setNewMilestoneDetail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#122440] text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsIssueModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  সনদ প্রদান নিশ্চিত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Certificate Print Preview Modal */}
      <CertificatePrintModal
        certificate={selectedCert}
        isOpen={isPrintModalOpen}
        onClose={() => {
          setIsPrintModalOpen(false);
          setSelectedCert(null);
        }}
      />

      {/* Signature Configuration Modal */}
      <SignatureManagerModal
        isOpen={isSigModalOpen}
        onClose={() => setIsSigModalOpen(false)}
        initialRole={sigRole}
      />
    </div>
  );
}
