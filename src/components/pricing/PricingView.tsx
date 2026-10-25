import { useState } from 'react';
import { Check, Sparkles, Crown } from 'lucide-react';
import { SubscriptionTier } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { FocusStudyStore } from '../../lib/storage/store';
import { toBengaliNumber } from '../../lib/utils/formatters';

export function PricingView() {
  const { user } = useAuth();
  const [selectedBilling, setSelectedBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSelectTier = (tier: SubscriptionTier) => {
    FocusStudyStore.upgradeSubscription(tier);
    setSuccessMsg(`অভিনন্দন! আপনার অ্যাকাউন্ট সফলভাবে ${tier.toUpperCase()} প্ল্যানে আপগ্রেড হয়েছে।`);
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  const tiers: {
    id: SubscriptionTier;
    name: string;
    tagline: string;
    priceMonthly: number;
    priceYearly: number;
    popular?: boolean;
    features: string[];
    btnLabel: string;
  }[] = [
    {
      id: 'free',
      name: 'ফ্রি স্টুডেন্ট',
      tagline: 'শুরু করার জন্য প্রয়োজনীয় সব মৌলিক টুলস',
      priceMonthly: 0,
      priceYearly: 0,
      features: [
        'বেসিক ফোকাস টাইমার (২৫ ও ৫ মিনিট)',
        '৩টি পর্যন্ত সক্রিয় স্টাডি প্ল্যান',
        'দৈনিক কাজ ও রুটিন ট্র্যাকিং',
        'গত ৭ দিনের মৌলিক প্রগ্রেস রিপোর্ট',
        'স্টাডি স্ট্রিক ও অর্জন ব্যাজ',
      ],
      btnLabel: 'বর্তমান ফ্রি প্ল্যান',
    },
    {
      id: 'pro',
      name: 'প্রো লার্নার',
      tagline: 'সিরিয়াস শিক্ষার্থী ও পরীক্ষার্থীদের জন্য সেরা পছন্দ',
      priceMonthly: 199,
      priceYearly: 1990,
      popular: true,
      features: [
        'ফ্রি প্ল্যানের সকল সুবিধা',
        'আনলিমিটেড বিষয় ও কাস্টম টাইমার',
        'আনলিমিটেড স্টাডি প্ল্যান ও টপিক চেকলিস্ট',
        'গত ৩০ দিন ও মাসিক বিস্তারিত অ্যানালিটিক্স',
        'ক্যালেন্ডার ইন্টিগ্রেশন ও ডেডলাইন রিমাইন্ডার',
        'নোটস ও রিভিশন ম্যাটেরিয়াল ব্যাকআপ',
      ],
      btnLabel: 'প্রো প্ল্যান নিন',
    },
    {
      id: 'premium',
      name: 'প্রিমিয়াম স্কলার',
      tagline: 'সর্বোচ্চ ফলাফল ও পেশাদার পরীক্ষার চূড়ান্ত প্রস্তুতি',
      priceMonthly: 399,
      priceYearly: 3990,
      features: [
        'প্রো প্ল্যানের সকল সুবিধা',
        'স্মার্ট স্টাডি অ্যানালিটিক্স ও দুর্বল বিষয় চিহ্নিতকরণ',
        'বিসিএস, অ্যাডমিশন ও সরকারি চাকরির কাস্টম টেমপ্লেট',
        'পিডিএফ ফরম্যাটে প্রগ্রেস রিপোর্ট এক্সপোর্ট',
        'অগ্রাধিকারভিত্তিক ক্লাউড ব্যাকআপ ও সাপোর্ট',
        'বিজ্ঞাপনমুক্ত প্রিমিয়াম অভিজ্ঞতা',
      ],
      btnLabel: 'প্রিমিয়াম প্ল্যান নিন',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Toast Alert */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500 text-white shadow-lg flex items-center justify-between">
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
          <span>সহজ ও সাশ্রয়ী সাবস্ক্রিপশন প্ল্যান</span>
        </div>
        <h2 className="text-2xl md:text-4xl font-extrabold text-[#17233F] dark:text-[#F1F5FF] tracking-tight">
          আপনার পড়াশোনাকে আরও এক ধাপ এগিয়ে নিন
        </h2>
        <p className="text-sm md:text-base text-[#77839B] dark:text-[#A7B5CC] max-w-2xl mx-auto">
          যেকোনো সময় প্ল্যান পরিবর্তন বা বাতিল করতে পারবেন। কোনো গোপন চার্জ নেই।
        </p>

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

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier) => {
          const isCurrent = user.subscriptionTier === tier.id;
          const price =
            selectedBilling === 'monthly' ? tier.priceMonthly : tier.priceYearly;

          return (
            <div
              key={tier.id}
              className={`relative rounded-3xl p-6 md:p-8 flex flex-col justify-between transition-all ${
                tier.popular
                  ? 'bg-white dark:bg-[#0D1B32] border-2 border-[#5B5CE2] shadow-xl md:-translate-y-2'
                  : 'bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] shadow-xs'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-[#5B5CE2] to-[#8B5CF6] text-white text-[11px] font-extrabold shadow-md tracking-wider">
                  জনপ্রিয় পছন্দ
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold text-[#17233F] dark:text-[#F1F5FF]">
                  {tier.name}
                </h3>
                <p className="text-xs text-[#77839B] dark:text-[#A7B5CC] mt-1">
                  {tier.tagline}
                </p>

                {/* Price display */}
                <div className="my-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl md:text-4xl font-black text-[#17233F] dark:text-[#F1F5FF]">
                      ৳{toBengaliNumber(price)}
                    </span>
                    <span className="text-xs text-[#77839B] dark:text-[#A7B5CC] font-semibold">
                      /{selectedBilling === 'monthly' ? 'মাস' : 'বছর'}
                    </span>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-3 pt-4 border-t border-[#E6EAF2] dark:border-[#243754]">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#77839B] dark:text-[#A7B5CC]">
                    অন্তর্ভুক্ত সুবিধাসমূহ:
                  </p>
                  <ul className="space-y-2.5">
                    {tier.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-[#17233F] dark:text-[#F1F5FF]">
                        <div className="w-4 h-4 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-[#5B5CE2] flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-8">
                <button
                  disabled={isCurrent}
                  onClick={() => handleSelectTier(tier.id)}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs md:text-sm transition-all ${
                    isCurrent
                      ? 'bg-[#E6EAF2] dark:bg-[#1C2C47] text-[#77839B] cursor-default'
                      : tier.popular
                      ? 'bg-gradient-to-r from-[#5B5CE2] to-[#8B5CF6] text-white shadow-lg shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98]'
                      : 'bg-indigo-50 dark:bg-indigo-950/50 text-[#5B5CE2] dark:text-indigo-400 hover:bg-indigo-100'
                  }`}
                >
                  {isCurrent ? 'বর্তমান সক্রিয় প্ল্যান' : tier.btnLabel}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
