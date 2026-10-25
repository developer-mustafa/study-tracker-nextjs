import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  Smartphone,
  CreditCard,
  AlertCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../contexts/AuthContext';
import { FocusStudyStore, useFocusStudyData } from '../../lib/storage/store';
import { PaymentGatewayType, SubscriptionPlan } from '../../types';
import { toBengaliNumber } from '../../lib/utils/formatters';

interface PaymentModalProps {
  plan: SubscriptionPlan;
  billingCycle: 'monthly' | 'yearly';
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function PaymentModal({
  plan,
  billingCycle,
  isOpen,
  onClose,
  onSuccess,
}: PaymentModalProps) {
  const { user, activeTenant } = useAuth();
  const { paymentGateways } = useFocusStudyData();

  const [selectedGatewayId, setSelectedGatewayId] = useState<PaymentGatewayType>('bkash');
  const [senderNumber, setSenderNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedTx, setSubmittedTx] = useState<{ trxId: string; status: string } | null>(null);

  if (!isOpen) return null;

  const activeGateways = paymentGateways.filter((g) => g.isActive);
  const currentGateway =
    activeGateways.find((g) => g.id === selectedGatewayId) || activeGateways[0] || paymentGateways[0];

  const price = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly;
  const fee = Math.round((price * (currentGateway?.feePercentage || 0)) / 100);
  const totalAmount = price + fee;

  const handleCopyNumber = () => {
    if (!currentGateway?.accountNumber) return;
    navigator.clipboard.writeText(currentGateway.accountNumber);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleSubmit = (e: React.FormEvent, instantApprove = false) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanSender = senderNumber.trim();
    const cleanTrx = trxId.trim().toUpperCase();

    if (!cleanSender || cleanSender.length < 11) {
      setErrorMsg('অনুগ্রহ করে সঠিক ১১ সংখ্যার মোবাইল নম্বর লিখুন (যেমন: 017XXXXXXXX)');
      return;
    }
    if (!cleanTrx || cleanTrx.length < 6) {
      setErrorMsg('অনুগ্রহ করে সঠিক ট্রানজেকশন আইডি (TrxID) লিখুন (কমপক্ষে ৬ অক্ষর)');
      return;
    }

    setIsSubmitting(true);

    try {
      const tx = FocusStudyStore.submitPaymentTransaction({
        gateway: selectedGatewayId,
        senderNumber: cleanSender,
        trxId: cleanTrx,
        planId: plan.id,
        billingCycle,
        amount: totalAmount,
        tenantId: activeTenant?.id,
      });

      if (instantApprove) {
        FocusStudyStore.approvePaymentTransaction(tx.id, 'mustafa.rahman.official@gmail.com');
        try {
          confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // fallback
        }
        setSubmittedTx({ trxId: cleanTrx, status: 'approved' });
      } else {
        setSubmittedTx({ trxId: cleanTrx, status: 'pending' });
      }

      onSuccess?.();
    } catch (err) {
      console.error(err);
      setErrorMsg('পেমেন্ট জমা দেওয়ার সময় ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-[#77839B] hover:text-[#17233F] dark:hover:text-[#F1F5FF] hover:bg-[#F5F7FC] dark:hover:bg-[#122440] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {submittedTx ? (
          /* Success Screen */
          <div className="text-center space-y-5 py-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-[#17233F] dark:text-[#F1F5FF]">
                {submittedTx.status === 'approved'
                  ? 'পেমেন্ট সফল ও প্ল্যান সক্রিয় হয়েছে!'
                  : 'পেমেন্ট ভেরিফিকেশন অনুরোধ সফলভাবে জমা হয়েছে'}
              </h3>
              <p className="text-xs md:text-sm text-[#77839B] dark:text-[#A7B5CC]">
                {submittedTx.status === 'approved'
                  ? `আপনার প্রতিষ্ঠান "${activeTenant?.name}" এখন ${plan.name} প্ল্যানে উন্নীত।`
                  : `প্ল্যাটফর্ম অ্যাডমিন (${'mustafa.rahman.official@gmail.com'}) আপনার ট্রানজেকশন আইডি যাচাই করে দ্রুত অনুমোদন করবেন।`}
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-4 rounded-2xl bg-[#F5F7FC] dark:bg-[#122440] border border-[#E6EAF2] dark:border-[#243754] text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#77839B] dark:text-[#A7B5CC]">সাবস্ক্রিপশন প্যাকেজ:</span>
                <span className="font-bold text-[#17233F] dark:text-[#F1F5FF]">{plan.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#77839B] dark:text-[#A7B5CC]">পেমেন্ট মাধ্যম:</span>
                <span className="font-bold uppercase text-[#17233F] dark:text-[#F1F5FF]">{selectedGatewayId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#77839B] dark:text-[#A7B5CC]">ট্রানজেকশন আইডি (TrxID):</span>
                <span className="font-mono font-bold text-[#5B5CE2] dark:text-indigo-400">{submittedTx.trxId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#77839B] dark:text-[#A7B5CC]">পরিশোধিত মোট ফি:</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400">৳{toBengaliNumber(totalAmount)}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 px-4 rounded-xl bg-[#5B5CE2] text-white font-bold text-xs md:text-sm hover:bg-[#4E4FD0] shadow-md shadow-indigo-500/20"
            >
              ড্যাশবোর্ডে ফিরে যান
            </button>
          </div>
        ) : (
          /* Payment Form Screen */
          <div className="space-y-5">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  নিরাপদ পেমেন্ট গেটওয়ে
                </span>
                <span className="text-[10px] font-bold text-[#77839B] dark:text-[#A7B5CC]">
                  {billingCycle === 'monthly' ? 'মাসিক প্যাকেজ' : 'বার্ষিক প্যাকেজ (২০% ছাড়)'}
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#17233F] dark:text-[#F1F5FF] mt-1">
                {plan.name} সাবস্ক্রিপশন ফি পরিশোধ
              </h3>
              <p className="text-xs text-[#77839B] dark:text-[#A7B5CC]">
                প্রতিষ্ঠান: <strong className="text-[#17233F] dark:text-[#F1F5FF]">{activeTenant?.name}</strong>
              </p>
            </div>

            {/* Gateway Selector (bKash, Nagad, Rocket) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#17233F] dark:text-[#F1F5FF]">
                ১. পছন্দের মোবাইল পেমেন্ট গেটওয়ে নির্বাচন করুন:
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {activeGateways.map((gw) => {
                  const isSelected = gw.id === selectedGatewayId;
                  return (
                    <button
                      key={gw.id}
                      type="button"
                      onClick={() => setSelectedGatewayId(gw.id)}
                      className={`relative p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all ${
                        isSelected
                          ? 'border-[#5B5CE2] bg-indigo-50/50 dark:bg-indigo-950/40 shadow-xs'
                          : 'border-[#E6EAF2] dark:border-[#243754] bg-white dark:bg-[#0D1B32] hover:border-slate-300'
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-extrabold text-sm shadow-xs"
                        style={{ backgroundColor: gw.color }}
                      >
                        {gw.name.charAt(0)}
                      </div>
                      <span className="font-bold text-xs text-[#17233F] dark:text-[#F1F5FF]">
                        {gw.banglaName}
                      </span>
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#5B5CE2] text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Merchant Account Details Box */}
            {currentGateway && (
              <div
                className="p-4 rounded-2xl border transition-all space-y-3"
                style={{
                  backgroundColor: currentGateway.bgLight,
                  borderColor: `${currentGateway.color}40`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4" style={{ color: currentGateway.color }} />
                    <span className="text-xs font-bold text-[#17233F] dark:text-zinc-800">
                      {currentGateway.banglaName} {currentGateway.accountType === 'merchant' ? 'মার্চেন্ট নম্বর' : 'পার্সোনাল নম্বর'}:
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyNumber}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/90 text-xs font-bold text-[#17233F] hover:bg-white shadow-xs border border-black/10"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'কপি হয়েছে!' : 'কপি করুন'}</span>
                  </button>
                </div>

                <div className="text-xl md:text-2xl font-black tracking-wider text-[#17233F] dark:text-zinc-900 font-mono">
                  {currentGateway.accountNumber}
                </div>

                <p className="text-[11px] text-zinc-700 leading-relaxed">
                  {currentGateway.instructions}
                </p>
              </div>
            )}

            {/* Price breakdown */}
            <div className="p-3.5 rounded-xl bg-[#F5F7FC] dark:bg-[#122440] flex items-center justify-between text-xs">
              <span className="text-[#77839B] dark:text-[#A7B5CC]">পরিশোধযোগ্য মোট মূল্য:</span>
              <div className="text-right">
                <span className="text-lg font-black text-[#5B5CE2] dark:text-indigo-400">
                  ৳{toBengaliNumber(totalAmount)}
                </span>
                {fee > 0 && (
                  <span className="text-[10px] text-[#77839B] dark:text-[#A7B5CC] block">
                    (প্ল্যান ৳{toBengaliNumber(price)} + গেটওয়ে ফি ৳{toBengaliNumber(fee)})
                  </span>
                )}
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submission Form */}
            <form className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#17233F] dark:text-[#F1F5FF] mb-1">
                  ২. যে নম্বর থেকে টাকা পাঠিয়েছেন (প্রেরকের নম্বর) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="উদাঃ 01712345678"
                  value={senderNumber}
                  onChange={(e) => setSenderNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6EAF2] dark:border-[#243754] bg-[#F5F7FC] dark:bg-[#122440] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#5B5CE2] text-[#17233F] dark:text-[#F1F5FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17233F] dark:text-[#F1F5FF] mb-1">
                  ৩. এসএমএসে প্রাপ্ত ট্রানজেকশন আইডি (TrxID) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="উদাঃ 9A87BK39 বা BL89XK29P1"
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6EAF2] dark:border-[#243754] bg-[#F5F7FC] dark:bg-[#122440] text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#5B5CE2] text-[#17233F] dark:text-[#F1F5FF] uppercase"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={(e) => handleSubmit(e, false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-[#5B5CE2] text-[#5B5CE2] dark:text-indigo-400 text-xs font-bold hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-all flex items-center justify-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>যাচাইয়ের জন্য জমা দিন (Admin Approval)</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={(e) => handleSubmit(e, true)}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#5B5CE2] to-[#8B5CF6] text-white text-xs font-bold hover:opacity-95 shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                  <span>ইনস্ট্যান্ট টেস্ট এক্টিভেশন (Sandbox)</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
