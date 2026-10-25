import React, { useState } from 'react';
import {
  Printer,
  X,
  Award,
  Sparkles,
  ShieldCheck,
  Check,
  Share2,
  Calendar,
  Building2,
  QrCode,
  ZoomIn,
  ZoomOut,
  PenTool,
} from 'lucide-react';
import { Certificate, SignatureRole } from '../../types';
import { toBengaliNumber } from '../../lib/utils/formatters';
import { useFocusStudyData } from '../../lib/storage/store';
import { SignatureBlock } from '../signatures/SignatureBlock';
import { SignatureManagerModal } from '../signatures/SignatureManagerModal';

interface CertificatePrintModalProps {
  certificate: Certificate | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CertificatePrintModal({
  certificate,
  isOpen,
  onClose,
}: CertificatePrintModalProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [copied, setCopied] = useState(false);
  const [isSigModalOpen, setIsSigModalOpen] = useState(false);
  const [activeSigRole, setActiveSigRole] = useState<SignatureRole>('mentor');

  const { signatures } = useFocusStudyData();

  if (!isOpen || !certificate) return null;

  const mentorSig = signatures.find((s) => s.role === 'mentor');
  const adminSig = signatures.find((s) => s.role === 'admin');

  const handlePrint = () => {
    window.print();
  };

  const handleOpenSigModal = (role: SignatureRole) => {
    setActiveSigRole(role);
    setIsSigModalOpen(true);
  };

  const handleCopyLink = () => {
    const text = `🏆 FocusStudy ভেরিফাইড প্রশংসাপত্র ও সম্মাননা সনদ\nপ্রাপক: ${certificate.recipientName} (${certificate.recipientNameEn})\nসনদ: ${certificate.title}\nযাচাইকরণ কোড: ${certificate.verificationCode}\nএকাডেমি: ${certificate.tenantName}\nযাচাই লিংক: https://verify.focusstudy.edu.bd/c/${certificate.certificateNumber}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const issueDateBengali = toBengaliNumber(
    new Date(certificate.issueDate).toLocaleDateString('bn-BD', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex flex-col items-center">
      {/* Top Floating Control Bar (Hidden on print) */}
      <div className="sticky top-0 z-50 w-full bg-slate-900/95 border-b border-slate-800 text-white px-4 md:px-8 py-3 flex items-center justify-between gap-3 shadow-xl no-print">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-md">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm md:text-base font-bold text-white">
                অফিসিয়াল সনদপত্র ও প্রশংসাপত্র (A4 Landscape)
              </h2>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold px-2 py-0.5 rounded-full">
                মার্জিন অপটিমাইজড
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              ভেরিফিকেশন কোড: <span className="font-mono text-amber-400">{certificate.verificationCode}</span>
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Signature Manager Button */}
          <button
            onClick={() => handleOpenSigModal('mentor')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="সনদের স্বাক্ষর ও সিল পরিচালনা করুন"
          >
            <PenTool className="w-3.5 h-3.5 text-amber-400" />
            <span>স্বাক্ষর কনফিগার</span>
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

          <button
            onClick={handleCopyLink}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 border border-slate-700 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'কপি হয়েছে!' : 'লিংক কপি'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>A4 ল্যান্ডস্কেপ প্রিন্ট / PDF</span>
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
            A4 Landscape Sheet with Zero-Margin Printable Class
          */}
          <div className="printable-a4-document a4-landscape-sheet a4-landscape-page bg-[#FDFBF7] text-slate-900 relative shadow-2xl p-5 sm:p-6 rounded-sm overflow-hidden border-8 border-[#1A365D] print:shadow-none print:m-0 print:border-4">
            {/* Outer Ornamental Frame */}
            <div className="h-full w-full border-4 border-amber-600/70 p-4 sm:p-5 relative flex flex-col justify-between rounded-sm bg-gradient-to-br from-[#FEFCF9] via-[#FAF6ED] to-[#F5EEDB]">
              {/* Corner Ornaments */}
              <div className="absolute top-2 left-2 w-8 h-8 border-t-4 border-l-4 border-amber-700 pointer-events-none" />
              <div className="absolute top-2 right-2 w-8 h-8 border-t-4 border-r-4 border-amber-700 pointer-events-none" />
              <div className="absolute bottom-2 left-2 w-8 h-8 border-b-4 border-l-4 border-amber-700 pointer-events-none" />
              <div className="absolute bottom-2 right-2 w-8 h-8 border-b-4 border-r-4 border-amber-700 pointer-events-none" />

              {/* Watermark Emblem */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none">
                <div className="w-80 h-80 rounded-full border-16 border-indigo-950 flex items-center justify-center">
                  <Award className="w-64 h-64 text-indigo-950" />
                </div>
              </div>

              {/* Top Certificate Header */}
              <div className="text-center relative z-10 space-y-1">
                <div className="flex items-center justify-center gap-2 text-[10px] sm:text-[11px] uppercase tracking-widest text-indigo-950 font-black">
                  <span>গণপ্রজাতন্ত্রী বাংলাদেশ অনুমোদিত একাডেমি নেটওয়ার্ক</span>
                  <span>•</span>
                  <span>FOCUSSTUDY NATIONAL EDUCATION NETWORK</span>
                </div>

                <div className="text-xs sm:text-sm font-bold text-amber-800 tracking-wider">
                  {certificate.tenantName}
                </div>

                <div className="py-1">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#1A365D] font-serif uppercase">
                    {certificate.title}
                  </h1>
                  <p className="text-xs font-semibold text-slate-600 tracking-wider mt-0.5">
                    {certificate.titleEn}
                  </p>
                </div>

                <div className="w-48 h-0.5 bg-gradient-to-r from-transparent via-amber-600 to-transparent mx-auto" />
              </div>

              {/* Certificate Body Text */}
              <div className="text-center relative z-10 py-2 max-w-2xl mx-auto space-y-2">
                <p className="text-xs text-slate-700 font-medium">
                  এই মর্মে প্রত্যয়ন ও সম্মাননা জ্ঞাপন করা যাচ্ছে যে,
                </p>

                {/* Recipient Name in Bold Calligraphic Script */}
                <div className="py-1">
                  <div className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-normal font-serif border-b-2 border-amber-700/60 inline-block px-8 pb-0.5">
                    {certificate.recipientName}
                  </div>
                  <div className="text-xs font-bold text-slate-600 mt-0.5">
                    ({certificate.recipientNameEn})
                  </div>
                </div>

                {/* Milestone Description */}
                <p className="text-xs text-slate-800 leading-relaxed font-medium px-4">
                  {certificate.description}
                </p>

                {/* Milestone Detail Badge */}
                <div className="inline-flex items-center gap-2.5 bg-amber-100/70 border border-amber-300 px-3.5 py-1 rounded-full text-xs font-black text-amber-950">
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                  <span>{certificate.milestoneDetail}</span>
                  {certificate.scoreOrHours && (
                    <>
                      <span>•</span>
                      <span className="text-indigo-900">{certificate.scoreOrHours}</span>
                    </>
                  )}
                  {certificate.grade && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-800 font-black">গ্রেড: {certificate.grade}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Bottom Footer with Official Gold Seal and Signatures */}
              <div className="relative z-10 pt-2 border-t border-amber-300/80 flex items-end justify-between px-4 sm:px-6">
                {/* Left Signatory (Mentor / Director) */}
                <div className="w-48">
                  <SignatureBlock
                    signature={mentorSig}
                    role="mentor"
                    defaultName={certificate.signatoryName || 'প্রফেসর ড. মাহফুজুল ইসলাম'}
                    defaultTitle={certificate.signatoryTitle || 'একাডেমিক ডিরেক্টর'}
                    defaultOrg={certificate.tenantName}
                    onEdit={() => handleOpenSigModal('mentor')}
                    showSeal={false}
                  />
                </div>

                {/* Center Official Gold Seal */}
                <div className="flex flex-col items-center justify-center -mb-1">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 p-0.5 shadow-lg flex items-center justify-center">
                    <div className="w-full h-full rounded-full border border-dashed border-amber-900 bg-amber-500/30 flex flex-col items-center justify-center text-center p-1">
                      <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-amber-950" />
                      <span className="text-[6px] sm:text-[7px] font-black uppercase text-amber-950 tracking-tighter leading-none mt-0.5">
                        VERIFIED CREDENTIAL
                      </span>
                      <span className="text-[5px] font-mono text-amber-950 mt-0.5">FOCUSSTUDY</span>
                    </div>
                  </div>
                  <div className="text-[9px] font-mono font-bold text-slate-600 mt-0.5">
                    ইস্যু: {issueDateBengali}
                  </div>
                </div>

                {/* Right Signatory (Platform Admin - Mustafa Rahman) */}
                <div className="w-48">
                  <SignatureBlock
                    signature={adminSig}
                    role="admin"
                    defaultName={certificate.adminSignatoryName || 'মুস্তাফা রহমান'}
                    defaultTitle={certificate.adminSignatoryTitle || 'চিফ প্ল্যাটফর্ম অ্যাডমিনিস্ট্রেটর'}
                    defaultOrg="FocusStudy Technologies BD"
                    onEdit={() => handleOpenSigModal('admin')}
                    showSeal={false}
                  />
                </div>
              </div>

              {/* Verification Code Bar */}
              <div className="pt-1.5 text-center text-[8px] font-mono text-slate-500 flex items-center justify-between border-t border-slate-200 mt-1">
                <span>সনদ নং: {certificate.certificateNumber}</span>
                <span>যাচাইকরণ লিংক: verify.focusstudy.edu.bd/cert/{certificate.verificationCode}</span>
                <span className="flex items-center gap-1 font-bold text-emerald-800">
                  <Check className="w-3 h-3 text-emerald-600" />
                  ডিজিটাল স্বাক্ষর সংরক্ষিত
                </span>
              </div>
            </div>
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
