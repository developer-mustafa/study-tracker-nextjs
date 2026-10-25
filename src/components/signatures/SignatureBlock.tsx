import React from 'react';
import { AppSignature, SignatureRole } from '../../types';
import { Edit3, ShieldCheck, Check } from 'lucide-react';

interface SignatureBlockProps {
  signature?: AppSignature;
  role: SignatureRole;
  defaultName?: string;
  defaultTitle?: string;
  defaultOrg?: string;
  onEdit?: () => void;
  showSeal?: boolean;
}

export function SignatureBlock({
  signature,
  role,
  defaultName = 'মুস্তাফা রহমান',
  defaultTitle = 'স্বাক্ষরকারী',
  defaultOrg,
  onEdit,
  showSeal = true,
}: SignatureBlockProps) {
  const name = signature?.signatoryName || defaultName;
  const title = signature?.signatoryTitle || defaultTitle;
  const org = signature?.organization || defaultOrg;
  const sigType = signature?.type || 'calligraphy';
  const calligStyle = signature?.calligraphyStyle || 'cursive';

  // Calligraphy font-family / styles
  const getCalligraphyClass = (style: string) => {
    switch (style) {
      case 'brush':
        return 'font-serif font-black tracking-wider text-indigo-950 dark:text-indigo-200 text-lg sm:text-xl italic transform -rotate-1';
      case 'formal':
        return 'font-serif font-bold tracking-normal text-slate-900 dark:text-slate-100 text-base sm:text-lg underline decoration-slate-400 decoration-1 underline-offset-4';
      case 'stylish':
        return 'font-sans font-extrabold tracking-tight text-blue-900 dark:text-blue-300 text-lg italic transform -rotate-3';
      case 'cursive':
      default:
        return 'font-serif font-bold italic tracking-wide text-indigo-900 dark:text-indigo-300 text-lg sm:text-xl transform -rotate-2';
    }
  };

  return (
    <div className="relative group text-center flex flex-col items-center justify-end min-h-[90px] w-full max-w-[210px] mx-auto">
      {/* Edit Trigger Badge on Hover (Hidden in Print) */}
      {onEdit && (
        <button
          onClick={onEdit}
          type="button"
          className="no-print absolute -top-3 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md z-20 cursor-pointer"
          title="স্বাক্ষর পরিবর্তন বা যুক্ত করুন"
        >
          <Edit3 className="w-2.5 h-2.5" />
          <span>স্বাক্ষর এডিট</span>
        </button>
      )}

      {/* Signature Content Area */}
      <div className="h-14 w-full flex items-end justify-center pb-1 relative">
        {/* If drawn or uploaded image */}
        {sigType !== 'calligraphy' && signature?.dataUrl ? (
          <img
            src={signature.dataUrl}
            alt={`${name} এর ডিজিটাল স্বাক্ষর`}
            className="max-h-12 max-w-[170px] object-contain select-none"
          />
        ) : (
          /* Stylized Signature rendering with realistic pen flourishing */
          <div className="relative flex flex-col items-center">
            <span className={`${getCalligraphyClass(calligStyle)} select-none drop-shadow-xs`}>
              {name}
            </span>
            {/* Elegant Calligraphic underline stroke */}
            <svg
              className="w-28 h-2 text-indigo-800/60 dark:text-indigo-400/60 -mt-0.5"
              viewBox="0 0 100 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 7 C 25 2, 60 9, 98 4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </div>
        )}

        {/* Optional Seal Overlay if configured */}
        {showSeal && signature?.sealType === 'approved_stamp' && (
          <div className="absolute -top-1 -right-3 border-2 border-emerald-600/90 text-emerald-700 text-[8px] font-black px-1.5 py-0.5 rounded-sm rotate-[-12deg] uppercase pointer-events-none opacity-85">
            ✓ APPROVED
          </div>
        )}

        {showSeal && signature?.sealType === 'official_round' && (
          <div className="absolute -top-2 -right-4 w-9 h-9 rounded-full border-2 border-indigo-900/60 text-indigo-950 flex flex-col items-center justify-center p-0.5 rotate-[8deg] pointer-events-none opacity-85">
            <span className="text-[5px] font-bold">SEAL</span>
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-800" />
          </div>
        )}
      </div>

      {/* Baseline Divider */}
      <div className="w-full border-b border-slate-400 dark:border-slate-600 mb-1" />

      {/* Signatory Name & Designation */}
      <div className="text-slate-900 dark:text-slate-100 font-bold text-xs truncate max-w-full">
        {name}
      </div>
      <div className="text-slate-600 dark:text-slate-400 text-[10px] truncate max-w-full font-medium">
        {title}
      </div>
      {org && (
        <div className="text-slate-500 dark:text-slate-400 text-[9px] truncate max-w-full">
          {org}
        </div>
      )}
    </div>
  );
}
