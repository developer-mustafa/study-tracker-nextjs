import {
  Users,
  CreditCard,
  Activity,
  CheckCircle,
  FileCheck,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useFocusStudyData } from '../../lib/storage/store';
import {
  toBengaliNumber,
  formatBengaliDate,
  formatBengaliDuration,
} from '../../lib/utils/formatters';

export function AdminView() {
  const { user } = useAuth();
  const { sessions, tasks } = useFocusStudyData();

  const totalSessionsRecorded = sessions.length;
  const totalFocusMinutes = sessions
    .filter((s) => s.isCompleted)
    .reduce((acc, s) => acc + Math.round(s.actualDurationSeconds / 60), 0);

  const mockUsersCount = 1420;
  const mockProSubscribers = 380;
  const mockPremiumSubscribers = 142;

  const auditLogs = [
    {
      id: 'log-1',
      action: 'সিস্টেম হেলথ চেক সফল',
      actor: 'System Daemon',
      timestamp: new Date().toISOString(),
      status: 'success',
    },
    {
      id: 'log-2',
      action: 'Firestore সিকিউরিটি রুলস কম্পাইল ভেরিফায়েড',
      actor: user.email,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      status: 'success',
    },
    {
      id: 'log-3',
      action: 'ব্যবহারকারী সাবস্ক্রিপশন রোল আপডেট',
      actor: 'Subscription Service',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      status: 'info',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
            সুরক্ষিত অ্যাডমিন প্যানেল
          </span>
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-[#17233F] dark:text-[#F1F5FF] mt-1">
          সিস্টেম অ্যাডমিনিস্ট্রেশন ও অ্যানালিটিক্স
        </h2>
        <p className="text-xs md:text-sm text-[#77839B] dark:text-[#A7B5CC] mt-0.5">
          সিস্টেমের সামগ্রিক স্ট্যাটাস, ব্যবহারকারী পরিসংখ্যান ও প্ল্যাটফর্ম নিরাপত্তা পর্যবেক্ষণ
        </p>
      </div>

      {/* Admin KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#77839B] dark:text-[#A7B5CC]">
              নিবন্ধিত শিক্ষার্থী
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-500">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#17233F] dark:text-[#F1F5FF]">
            {toBengaliNumber(mockUsersCount)} জন
          </div>
          <p className="text-[11px] text-emerald-500 font-bold mt-1">
            +১২% এই মাসে বৃদ্ধি
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#77839B] dark:text-[#A7B5CC]">
              সক্রিয় পেইড সাবস্ক্রিপশন
            </span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-500">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#17233F] dark:text-[#F1F5FF]">
            {toBengaliNumber(mockProSubscribers + mockPremiumSubscribers)} টি
          </div>
          <p className="text-[11px] text-[#77839B] dark:text-[#A7B5CC] mt-1">
            প্রো: {toBengaliNumber(mockProSubscribers)} | প্রিমিয়াম: {toBengaliNumber(mockPremiumSubscribers)}
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#77839B] dark:text-[#A7B5CC]">
              রেকর্ডকৃত ফোকাস সময়
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#17233F] dark:text-[#F1F5FF]">
            {formatBengaliDuration(totalFocusMinutes)}
          </div>
          <p className="text-[11px] text-[#77839B] dark:text-[#A7B5CC] mt-1">
            মোট {toBengaliNumber(totalSessionsRecorded)}টি সেশন
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#77839B] dark:text-[#A7B5CC]">
              সার্ভিস স্ট্যাটাস
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-black text-emerald-500 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span>১০০% সচল (Healthy)</span>
          </div>
          <p className="text-[11px] text-[#77839B] dark:text-[#A7B5CC] mt-1">
            Firestore & Auth Active
          </p>
        </div>
      </div>

      {/* Platform Audit Logs */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E6EAF2] dark:border-[#243754]">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-[#5B5CE2]" />
            <h3 className="font-bold text-base text-[#17233F] dark:text-[#F1F5FF]">
              অ্যাডমিনিস্ট্রেটিভ অডিট ও সিকিউরিটি লগ
            </h3>
          </div>
          <span className="text-xs font-bold text-[#77839B] dark:text-[#A7B5CC]">
            রিয়েল-টাইম পর্যবেক্ষণ
          </span>
        </div>

        <div className="space-y-3">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-2xl bg-[#F5F7FC] dark:bg-[#122440] flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="font-bold text-[#17233F] dark:text-[#F1F5FF] truncate">
                  {log.action}
                </span>
                <span className="text-[#77839B] dark:text-[#A7B5CC] truncate hidden sm:inline">
                  (কর্তৃক: {log.actor})
                </span>
              </div>
              <span className="text-[11px] text-[#77839B] dark:text-[#A7B5CC] shrink-0 font-medium">
                {formatBengaliDate(log.timestamp)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
