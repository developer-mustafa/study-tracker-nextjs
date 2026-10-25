import React, { useState } from 'react';
import { Check, Sparkles, Crown, Smartphone, Building2 } from 'lucide-react';
import { SubscriptionPlan, SubscriptionTier } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { FocusStudyStore, useFocusStudyData } from '../../lib/storage/store';
import { toBengaliNumber } from '../../lib/utils/formatters';
import { PaymentModal } from './PaymentModal';

export function PricingView() {
  const { user, activeTenant } = useAuth();
  const { subscriptionPlans, paymentGateways } = useFocusStudyData();
  const [selectedBilling, setSelectedBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<SubscriptionPlan | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const activeGateways = paymentGateways.filter((g) => g.isActive);

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (plan.id === 'free' || (plan.priceMonthly === 0 && plan.priceYearly === 0)) {
      FocusStudyStore.upgradeSubscription(plan.id as SubscriptionTier);
      setSuccessMsg(`অভিনন্দন! আপনার অ্যাকাউন্ট সফলভাবে ${plan.name} প্ল্যানে পরিবর্তিত হয়েছে।`);
      setTimeout(() => setSuccessMsg(null), 5000);
      return;
    }

    // Open Payment Modal for paid tiers
    setSelectedPlanForPayment(plan);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Toast Alert */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500 text-white shadow-lg flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-200" />
            <span className="font-bold text-sm">{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg(null)}
            className="text-white/80 hover:text-white text-xs underline font-semibold"
          >
            বন্ধ করুন
          </button>
        </div>
      )}

      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-[#5B5CE2] dark:text-indigo-400 text-xs font-bold">
          <Crown className="w-4 h-4" />
          <span>মাল্টি-টেন্যান্ট SaaS সাবস্ক্রিপশন প্ল্যান</span>
        </div>
        <h2 className="text-2xl md:text-4xl font-extrabold text-[#17233F] dark:text-[#F1F5FF] tracking-tight">
          ব্যক্তিগত শিক্ষার্থী ও একাডেমির জন্য উপযোগী প্যাকেজ
        </h2>
        <p className="text-sm md:text-base text-[#77839B] dark:text-[#A7B5CC] max-w-2xl mx-auto">
          বর্তমান সক্রিয় স্পেস: <strong className="text-[#17233F] dark:text-[#F1F5FF]">{activeTenant?.name}</strong> • বিকাশ, নগদ ও রকেটে সহজ পেমেন্ট
        </p>

        {/* Accepted Payment Badges Banner */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <span className="text-xs text-[#77839B] dark:text-[#A7B5CC] font-semibold">
            অনুমোদিত পেমেন্ট গেটওয়ে:
          </span>
          <div className="flex items-center gap-2">
            {activeGateways.map((gw) => (
              <span
                key={gw.id}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border shadow-2xs"
                style={{
                  backgroundColor: gw.bgLight,
                  borderColor: `${gw.color}50`,
                  color: gw.color,
                }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: gw.color }} />
                <span>{gw.banglaName}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Monthly / Yearly Toggle */}
        <div className="pt-3 flex items-center justify-center">
          <div className="p-1 rounded-2xl bg-[#E6EAF2] dark:bg-[#122440] inline-flex items-center">
            <button
              onClick={() => setSelectedBilling('monthly')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedBilling === 'monthly'
                  ? 'bg-white dark:bg-[#0D1B32] text-[#5B5CE2] dark:text-indigo-400 shadow-xs'
                  : 'text-[#77839B] dark:text-[#A7B5CC]'
              }`}
            >
              মাসিক বিলিং
            </button>
            <button
              onClick={() => setSelectedBilling('yearly')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedBilling === 'yearly'
                  ? 'bg-white dark:bg-[#0D1B32] text-[#5B5CE2] dark:text-indigo-400 shadow-xs'
                  : 'text-[#77839B] dark:text-[#A7B5CC]'
              }`}
            >
              <span>বার্ষিক বিলিং</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500 text-white font-extrabold">
                ২০% ছাড়
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {subscriptionPlans
          .filter((p) => p.isActive)
          .map((plan) => {
            const isCurrent =
              activeTenant?.subscriptionPlanId === plan.id ||
              user.subscriptionTier === plan.id;
            const price =
              selectedBilling === 'monthly' ? plan.priceMonthly : plan.priceYearly;

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-6 md:p-7 flex flex-col justify-between transition-all ${
                  plan.popular
                    ? 'bg-white dark:bg-[#0D1B32] border-2 border-[#5B5CE2] shadow-xl md:-translate-y-2'
                    : 'bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] shadow-xs'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-[#5B5CE2] to-[#8B5CF6] text-white text-[11px] font-extrabold shadow-md tracking-wider">
                    জনপ্রিয় পছন্দ
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-bold text-[#17233F] dark:text-[#F1F5FF]">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-[#77839B] dark:text-[#A7B5CC] mt-1 line-clamp-2">
                    {plan.tagline}
                  </p>

                  {/* Price display */}
                  <div className="my-5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-[#17233F] dark:text-[#F1F5FF]">
                        ৳{toBengaliNumber(price)}
                      </span>
                      <span className="text-xs text-[#77839B] dark:text-[#A7B5CC] font-semibold">
                        /{selectedBilling === 'monthly' ? 'মাস' : 'বছর'}
                      </span>
                    </div>
                    {plan.maxStudents && (
                      <span className="text-[11px] text-[#5B5CE2] dark:text-indigo-400 font-bold block mt-1">
                        সর্বোচ্চ {toBengaliNumber(plan.maxStudents)} জন সদস্য / শিক্ষার্থী
                      </span>
                    )}
                  </div>

                  {/* Features List */}
                  <div className="space-y-2.5 pt-4 border-t border-[#E6EAF2] dark:border-[#243754]">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#77839B] dark:text-[#A7B5CC]">
                      অন্তর্ভুক্ত সুবিধাসমূহ:
                    </p>
                    <ul className="space-y-2">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-[#17233F] dark:text-[#F1F5FF]">
                          <div className="w-3.5 h-3.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-[#5B5CE2] flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                          <span className="leading-tight">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-6">
                  <button
                    disabled={isCurrent}
                    onClick={() => handleSelectPlan(plan)}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-xs md:text-sm transition-all ${
                      isCurrent
                        ? 'bg-[#E6EAF2] dark:bg-[#1C2C47] text-[#77839B] cursor-default'
                        : plan.popular
                        ? 'bg-gradient-to-r from-[#5B5CE2] to-[#8B5CF6] text-white shadow-lg shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98]'
                        : 'bg-indigo-50 dark:bg-indigo-950/50 text-[#5B5CE2] dark:text-indigo-400 hover:bg-indigo-100'
                    }`}
                  >
                    {isCurrent ? 'বর্তমান সক্রিয় প্ল্যান' : plan.btnLabel}
                  </button>
                </div>
              </div>
            );
          })}
      </div>

      {/* Payment Modal */}
      {selectedPlanForPayment && (
        <PaymentModal
          plan={selectedPlanForPayment}
          billingCycle={selectedBilling}
          isOpen={Boolean(selectedPlanForPayment)}
          onClose={() => setSelectedPlanForPayment(null)}
          onSuccess={() => {
            setSelectedPlanForPayment(null);
            setSuccessMsg(`আপনার পেমেন্ট সফলভাবে প্রক্রিয়াকরণ করা হয়েছে!`);
            setTimeout(() => setSuccessMsg(null), 5000);
          }}
        />
      )}
    </div>
  );
}
