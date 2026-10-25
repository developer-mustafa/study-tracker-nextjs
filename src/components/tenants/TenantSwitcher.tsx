import React, { useState, useRef, useEffect } from 'react';
import {
  Building2,
  ChevronDown,
  Plus,
  Check,
  Shield,
  Users,
  Sparkles,
  Crown,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toBengaliNumber } from '../../lib/utils/formatters';
import { Tenant } from '../../types';

export function TenantSwitcher() {
  const { activeTenant, tenants, switchTenant, createTenant, isPlatformAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // New tenant form state
  const [name, setName] = useState('');
  const [type, setType] = useState<Tenant['type']>('academy');
  const [description, setDescription] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createTenant({
      name: name.trim(),
      type,
      description: description.trim(),
    });
    setName('');
    setDescription('');
    setIsModalOpen(false);
    setIsOpen(false);
  };

  const getTypeName = (t: Tenant['type']) => {
    switch (t) {
      case 'academy':
        return 'একাডেমি';
      case 'coaching':
        return 'কোচিং সেন্টার';
      case 'study_group':
        return 'স্টাডি গ্রুপ';
      case 'institution':
        return 'শিক্ষা প্রতিষ্ঠান';
      default:
        return 'ব্যক্তিগত স্পেস';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Switcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#E6EAF2] dark:border-[#243754] bg-white dark:bg-[#0D1B32] hover:border-[#5B5CE2] dark:hover:border-[#5B5CE2] transition-all text-xs font-semibold shadow-xs"
        title="প্রতিষ্ঠান / টেন্যান্ট পরিবর্তন করুন"
      >
        <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-[#5B5CE2] flex items-center justify-center shrink-0">
          <Building2 className="w-3.5 h-3.5" />
        </div>
        <div className="flex flex-col text-left max-w-[130px] sm:max-w-[170px] truncate">
          <span className="text-[#17233F] dark:text-[#F1F5FF] font-bold truncate">
            {activeTenant?.name || 'স্টাডি স্পেস'}
          </span>
          <span className="text-[10px] text-[#77839B] dark:text-[#A7B5CC] -mt-0.5 truncate">
            {getTypeName(activeTenant?.type || 'personal')} • {toBengaliNumber(activeTenant?.memberCount || 1)} সদস্য
          </span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-[#77839B] dark:text-[#A7B5CC] shrink-0" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] shadow-xl p-2 z-50 animate-fade-in">
          <div className="px-3 py-2 border-b border-[#E6EAF2] dark:border-[#243754] flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#77839B] dark:text-[#A7B5CC]">
              আপনার সক্রিয় প্রতিষ্ঠানসমূহ
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-[#5B5CE2] dark:bg-indigo-950 dark:text-indigo-300 font-extrabold">
              মাল্টি-টেন্যান্ট
            </span>
          </div>

          <div className="max-h-60 overflow-y-auto py-1 space-y-1 custom-scrollbar">
            {tenants.map((tenant) => {
              const isSelected = tenant.id === activeTenant?.id;
              return (
                <button
                  key={tenant.id}
                  onClick={() => {
                    switchTenant(tenant.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all text-xs ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-[#5B5CE2] dark:text-indigo-300 font-bold'
                      : 'hover:bg-[#F5F7FC] dark:hover:bg-[#122440] text-[#17233F] dark:text-[#F1F5FF]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#5B5CE2] to-[#8B5CF6] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {tenant.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-semibold flex items-center gap-1.5">
                        <span>{tenant.name}</span>
                        {tenant.subscriptionPlanId === 'academy' && (
                          <Crown className="w-3 h-3 text-amber-500 shrink-0" />
                        )}
                      </div>
                      <div className="text-[10px] text-[#77839B] dark:text-[#A7B5CC] truncate">
                        {getTypeName(tenant.type)} • {toBengaliNumber(tenant.memberCount)} জন শিক্ষার্থী
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#5B5CE2] shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-[#E6EAF2] dark:border-[#243754]">
            <button
              onClick={() => {
                setIsModalOpen(true);
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-[#5B5CE2] to-[#8B5CF6] text-white font-bold text-xs hover:opacity-95 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>নতুন প্রতিষ্ঠান / একাডেমি খুলুন</span>
            </button>
          </div>
        </div>
      )}

      {/* Create Tenant Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E6EAF2] dark:border-[#243754]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-[#5B5CE2]">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#17233F] dark:text-[#F1F5FF]">
                    নতুন প্রতিষ্ঠান / টেন্যান্ট তৈরি
                  </h3>
                  <p className="text-xs text-[#77839B] dark:text-[#A7B5CC]">
                    আপনার একাডেমি, কোচিং সেন্টার বা স্টাডি গ্রুপের পৃথক স্পেস
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#17233F] dark:text-[#F1F5FF] mb-1">
                  প্রতিষ্ঠানের নাম *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="উদাঃ বিসিএস অগ্রদূত একাডেমি"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6EAF2] dark:border-[#243754] bg-[#F5F7FC] dark:bg-[#122440] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#5B5CE2] text-[#17233F] dark:text-[#F1F5FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17233F] dark:text-[#F1F5FF] mb-1">
                  প্রতিষ্ঠানের ধরন
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as Tenant['type'])}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6EAF2] dark:border-[#243754] bg-[#F5F7FC] dark:bg-[#122440] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#5B5CE2] text-[#17233F] dark:text-[#F1F5FF]"
                >
                  <option value="academy">একাডেমি (Academy)</option>
                  <option value="coaching">কোচিং সেন্টার (Coaching)</option>
                  <option value="study_group">স্টাডি ক্লাব / গ্রুপ (Study Group)</option>
                  <option value="institution">স্কুল / কলেজ / বিশ্ববিদ্যালয় ব্যাচ</option>
                  <option value="personal">ব্যক্তিগত পোর্টফোলিও স্পেস</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17233F] dark:text-[#F1F5FF] mb-1">
                  সংক্ষিপ্ত বিবরণ (ঐচ্ছিক)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="আপনার প্রতিষ্ঠানের লক্ষ্য বা ব্যাচের বিবরণ..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6EAF2] dark:border-[#243754] bg-[#F5F7FC] dark:bg-[#122440] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#5B5CE2] text-[#17233F] dark:text-[#F1F5FF]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-[#E6EAF2] dark:border-[#243754] text-xs font-bold text-[#77839B] dark:text-[#A7B5CC] hover:bg-[#F5F7FC] dark:hover:bg-[#122440]"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#5B5CE2] text-white text-xs font-bold hover:bg-[#4E4FD0] shadow-md shadow-indigo-500/20"
                >
                  প্রতিষ্ঠান নিশ্চিত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
