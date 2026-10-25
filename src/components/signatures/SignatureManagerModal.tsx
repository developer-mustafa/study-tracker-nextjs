import React, { useState, useRef, useEffect } from 'react';
import {
  Edit3,
  PenTool,
  Type,
  Upload,
  RotateCcw,
  Check,
  X,
  ShieldCheck,
  Award,
  Sparkles,
} from 'lucide-react';
import { AppSignature, SignatureRole } from '../../types';
import { FocusStudyStore, useFocusStudyData } from '../../lib/storage/store';
import { useAuth } from '../../contexts/AuthContext';

interface SignatureManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: SignatureRole;
}

export function SignatureManagerModal({
  isOpen,
  onClose,
  initialRole = 'student',
}: SignatureManagerModalProps) {
  const { user } = useAuth();
  const { signatures, activeTenant } = useFocusStudyData();
  const [selectedRole, setSelectedRole] = useState<SignatureRole>(initialRole);

  const currentSig = signatures.find((s) => s.role === selectedRole);

  const [sigType, setSigType] = useState<'drawn' | 'calligraphy' | 'uploaded'>(
    currentSig?.type || 'calligraphy'
  );
  const [name, setName] = useState(currentSig?.signatoryName || user.displayName);
  const [title, setTitle] = useState(
    currentSig?.signatoryTitle ||
      (selectedRole === 'student'
        ? 'শিক্ষার্থী'
        : selectedRole === 'mentor'
        ? 'একাডেমিক ডিরেক্টর ও প্রধান সমন্বয়ক'
        : 'চিফ প্ল্যাটফর্ম অ্যাডমিনিস্ট্রেটর')
  );
  const [org, setOrg] = useState(
    currentSig?.organization || activeTenant?.name || 'ঢাকা ড্রিমার্স একাডেমি'
  );
  const [calligStyle, setCalligStyle] = useState<'cursive' | 'brush' | 'formal' | 'stylish'>(
    currentSig?.calligraphyStyle || 'cursive'
  );
  const [sealType, setSealType] = useState<'official_round' | 'approved_stamp' | 'gold_seal' | 'none'>(
    currentSig?.sealType || (selectedRole === 'admin' ? 'approved_stamp' : 'none')
  );
  const [inkColor, setInkColor] = useState('#1e1b4b'); // deep indigo / navy
  const [drawnDataUrl, setDrawnDataUrl] = useState<string | undefined>(currentSig?.dataUrl);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);

  // Sync state when role changes
  useEffect(() => {
    const sig = signatures.find((s) => s.role === selectedRole);
    if (sig) {
      setName(sig.signatoryName);
      setTitle(sig.signatoryTitle);
      setOrg(sig.organization || activeTenant?.name || '');
      setSigType(sig.type);
      setCalligStyle(sig.calligraphyStyle || 'cursive');
      setSealType(sig.sealType || 'none');
      setDrawnDataUrl(sig.dataUrl);
    } else {
      if (selectedRole === 'student') {
        setName(user.displayName);
        setTitle('শিক্ষার্থী');
        setOrg(activeTenant?.name || 'ঢাকা ড্রিমার্স একাডেমি');
      } else if (selectedRole === 'mentor') {
        setName('প্রফেসর ড. মাহফুজুল ইসলাম');
        setTitle('একাডেমিক ডিরেক্টর ও প্রধান সমন্বয়ক');
        setOrg(activeTenant?.name || 'ঢাকা ড্রিমার্স একাডেমি');
      } else {
        setName('মুস্তাফা রহমান');
        setTitle('চিফ প্ল্যাটফর্ম অ্যাডমিনিস্ট্রেটর');
        setOrg('FocusStudy Technologies BD');
      }
    }
  }, [selectedRole, signatures, activeTenant, user]);

  // Setup canvas
  useEffect(() => {
    if (sigType === 'drawn' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = inkColor;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [sigType, inkColor]);

  if (!isOpen) return null;

  // Drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    isDrawing.current = true;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing.current && canvasRef.current) {
      isDrawing.current = false;
      setDrawnDataUrl(canvasRef.current.toDataURL('image/png'));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setDrawnDataUrl(undefined);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setDrawnDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedSig: AppSignature = {
      id: currentSig?.id || `sig_${selectedRole}`,
      role: selectedRole,
      signatoryName: name.trim() || user.displayName,
      signatoryTitle: title.trim(),
      organization: org.trim(),
      type: sigType,
      dataUrl: sigType !== 'calligraphy' ? drawnDataUrl : undefined,
      calligraphyStyle: calligStyle,
      sealType: sealType,
      updatedAt: new Date().toISOString(),
    };

    FocusStudyStore.saveSignature(updatedSig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm no-print">
      <div className="bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E6EAF2] dark:border-[#243754] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#17233F] dark:text-[#F1F5FF]">
                অফিসিয়াল স্বাক্ষর ও সিল ম্যানেজার (Signature System)
              </h3>
              <p className="text-xs text-[#77839B] dark:text-[#A7B5CC]">
                রিপোর্ট এবং সনদপত্রে প্রদর্শনের জন্য কাস্টম স্বাক্ষর ও সিল কনফিগার করুন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Signatory Role Switcher */}
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-2">
              ১. কোন স্বাক্ষর পরিবর্তন করতে চান? (Signatory Role)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRole('student')}
                className={`py-2 px-3 rounded-xl font-bold border transition-all cursor-pointer ${
                  selectedRole === 'student'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                শিক্ষার্থীর স্বাক্ষর
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('mentor')}
                className={`py-2 px-3 rounded-xl font-bold border transition-all cursor-pointer ${
                  selectedRole === 'mentor'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                মেন্টর / সমন্বয়ক
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('admin')}
                className={`py-2 px-3 rounded-xl font-bold border transition-all cursor-pointer ${
                  selectedRole === 'admin'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                প্ল্যাটফর্ম সুপার অ্যাডমিন
              </button>
            </div>
          </div>

          {/* Signature Mode Tabs */}
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-2">
              ২. স্বাক্ষরের ধরন নির্বাচন করুন (Signature Input Mode)
            </label>
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
              <button
                type="button"
                onClick={() => setSigType('calligraphy')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer ${
                  sigType === 'calligraphy'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                <span>স্টাইলিশ ক্যালিগ্রাফি</span>
              </button>
              <button
                type="button"
                onClick={() => setSigType('drawn')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer ${
                  sigType === 'drawn'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>হাতে ড্র করুন (Canvas Pen)</span>
              </button>
              <button
                type="button"
                onClick={() => setSigType('uploaded')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer ${
                  sigType === 'uploaded'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>ছবি আপলোড (Upload Image)</span>
              </button>
            </div>
          </div>

          {/* Mode 1: Calligraphy Presets */}
          {sigType === 'calligraphy' && (
            <div className="space-y-3 bg-slate-50 dark:bg-[#122440] p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-700 dark:text-slate-300 block">
                ক্যালিগ্রাফিক স্টাইল নির্বাচন করুন:
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: 'cursive', label: 'স্মুথ কার্সিভ (Cursive Flow)', sample: 'font-serif font-bold italic tracking-wide text-indigo-900 dark:text-indigo-300 text-base' },
                  { id: 'brush', label: 'এক্সিকিউটিভ ব্রাশ (Bold Brush)', sample: 'font-serif font-black tracking-wider text-slate-900 dark:text-slate-100 text-base italic' },
                  { id: 'formal', label: 'অফিসিয়াল ফরমাল (Formal Script)', sample: 'font-serif font-bold tracking-normal text-slate-800 dark:text-slate-200 text-base underline' },
                  { id: 'stylish', label: 'মডার্ন ডায়নামিক (Modern Angled)', sample: 'font-sans font-extrabold italic text-blue-900 dark:text-blue-300 text-base' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setCalligStyle(s.id as any)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      calligStyle === s.id
                        ? 'border-indigo-600 bg-white dark:bg-[#0D1B32] shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60'
                    }`}
                  >
                    <div className="text-[10px] text-slate-500 mb-1">{s.label}</div>
                    <div className={s.sample}>{name || 'মুস্তাফা রহমান'}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mode 2: Interactive Drawing Canvas */}
          {sigType === 'drawn' && (
            <div className="space-y-3 bg-slate-50 dark:bg-[#122440] p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  নিচের বোর্ডে মাউস বা আঙুল দিয়ে স্বাক্ষর আঁকুন:
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500">কালি:</span>
                  <button
                    type="button"
                    onClick={() => setInkColor('#1e1b4b')}
                    className={`w-5 h-5 rounded-full bg-[#1e1b4b] border-2 ${inkColor === '#1e1b4b' ? 'border-amber-400' : 'border-transparent'}`}
                    title="গাঢ় নীল কালি"
                  />
                  <button
                    type="button"
                    onClick={() => setInkColor('#09090b')}
                    className={`w-5 h-5 rounded-full bg-[#09090b] border-2 ${inkColor === '#09090b' ? 'border-amber-400' : 'border-transparent'}`}
                    title="কালো কালি"
                  />
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 flex items-center gap-1 cursor-pointer font-bold ml-2"
                    title="মুছে ফেলুন"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>ক্লিয়ার</span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl border-2 border-dashed border-slate-300 p-2 flex justify-center shadow-inner">
                <canvas
                  ref={canvasRef}
                  width={420}
                  height={140}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="cursor-crosshair bg-white touch-none"
                />
              </div>
              <p className="text-[10px] text-slate-500 text-center">
                পেন দিয়ে আঁকা সম্পন্ন হলে স্বয়ংক্রিয়ভাবে এটি ডিজিটাল ভেক্টর রূপে সংরক্ষিত হবে
              </p>
            </div>
          )}

          {/* Mode 3: Upload Image */}
          {sigType === 'uploaded' && (
            <div className="space-y-3 bg-slate-50 dark:bg-[#122440] p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">
                স্বাক্ষরের স্ক্যান কপি বা ছবি আপলোড করুন (PNG/JPEG):
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="w-full file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
              />
              {drawnDataUrl && (
                <div className="p-3 bg-white rounded-xl border flex items-center justify-center">
                  <img src={drawnDataUrl} alt="আপলোডকৃত স্বাক্ষর" className="max-h-16 object-contain" />
                </div>
              )}
            </div>
          )}

          {/* Signatory Text Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                স্বাক্ষরকারীর নাম
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#122440] text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                পদবি / টাইটেল (Designation)
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#122440] text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                প্রতিষ্ঠান / একাডেমি
              </label>
              <input
                type="text"
                value={org}
                onChange={(e) => setOrg(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#122440] text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                সংযুক্ত অফিসিয়াল সিল / স্ট্যাম্প (Seal)
              </label>
              <select
                value={sealType}
                onChange={(e) => setSealType(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#122440] text-slate-900 dark:text-white"
              >
                <option value="none">কোনো সিল থাকবে না (শুধু স্বাক্ষর)</option>
                <option value="approved_stamp">✓ APPROVED রবার স্ট্যাম্প</option>
                <option value="official_round">একাডেমিক গোল সিল (Round Seal)</option>
                <option value="gold_seal">গোল্ডেন ক্রেডেন্সিয়াল সিল</option>
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>স্বাক্ষর নিশ্চিত ও সংরক্ষণ করুন</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
