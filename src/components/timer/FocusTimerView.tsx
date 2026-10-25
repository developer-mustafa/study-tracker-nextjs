import { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  XCircle,
  Volume2,
  VolumeX,
  Sparkles,
  Bell,
  BellRing,
  BellOff,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TimerMode } from '../../types';
import {
  createTimerState,
  getRemainingSeconds,
  pauseTimerState,
  resumeTimerState,
  finalizeCompletedSession,
} from '../../lib/utils/timer';
import {
  getBrowserNotificationStatus,
  requestBrowserNotificationPermission,
  triggerBreakNotification,
  NotificationSupportStatus,
} from '../../lib/utils/notifications';
import {
  formatSecondsToMS,
  formatBengaliDuration,
  toBengaliNumber,
} from '../../lib/utils/formatters';
import { FocusStudyStore, useFocusStudyData } from '../../lib/storage/store';
import { useAuth } from '../../contexts/AuthContext';

export function FocusTimerView() {
  const { user } = useAuth();
  const { subjects, tasks, sessions, activeTimer } = useFocusStudyData();

  // Mode defaults
  const modeDurations: Record<TimerMode, number> = {
    focus: (user.dailyGoalMinutes ? 25 : 25) * 60,
    short_break: 5 * 60,
    long_break: 15 * 60,
    custom: 30 * 60,
  };

  const [currentMode, setCurrentMode] = useState<TimerMode>(
    activeTimer?.mode || 'focus'
  );
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    activeTimer?.subjectId || subjects[0]?.id || ''
  );
  const [selectedTaskId, setSelectedTaskId] = useState<string>(
    activeTimer?.taskId || ''
  );
  const [customMinutesInput, setCustomMinutesInput] = useState<number>(30);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [sessionNotes, setSessionNotes] = useState<string>('');
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [notifStatus, setNotifStatus] = useState<NotificationSupportStatus>('default');

  useEffect(() => {
    setNotifStatus(getBrowserNotificationStatus());
  }, []);

  const handleRequestNotification = async () => {
    if (notifStatus === 'granted') {
      const testSub = subjects.find((s) => s.id === selectedSubjectId);
      triggerBreakNotification(25, testSub?.name);
      setSuccessToast('ব্রাউজারে বিরতির টেস্ট নোটিফিকেশন পাঠানো হয়েছে!');
      setTimeout(() => setSuccessToast(null), 4000);
      return;
    }

    const status = await requestBrowserNotificationPermission();
    setNotifStatus(status);
    if (status === 'granted') {
      const testSub = subjects.find((s) => s.id === selectedSubjectId);
      triggerBreakNotification(25, testSub?.name);
      setSuccessToast('নোটিফিকেশন সক্রিয় হয়েছে! প্রতিটি ফোকাস সেশন শেষে বিরতির সতর্কবার্তা পাবেন।');
      setTimeout(() => setSuccessToast(null), 4000);
    } else if (status === 'denied') {
      alert('ব্রাউজার সেটিংসে নোটিফিকেশন ব্লক করা রয়েছে। অনুগ্রহ করে সাইট সেটিংসে অনুমতি দিন।');
    }
  };

  // Remaining seconds tick
  const [remaining, setRemaining] = useState<number>(() => {
    if (activeTimer) {
      return getRemainingSeconds(activeTimer);
    }
    return modeDurations[currentMode];
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync remaining every 500ms when active and not paused
  useEffect(() => {
    if (!activeTimer || activeTimer.isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const checkTimer = () => {
      const rem = getRemainingSeconds(activeTimer);
      setRemaining(rem);

      if (rem <= 0) {
        // Automatically trigger completion
        handleComplete();
      }
    };

    checkTimer();
    timerRef.current = setInterval(checkTimer, 500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeTimer]);

  const playChime = () => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch {
      // AudioContext not allowed or unsupported
    }
  };

  const handleStart = () => {
    let dur = modeDurations[currentMode];
    if (currentMode === 'custom') {
      dur = Math.max(1, customMinutesInput) * 60;
    }

    const newState = createTimerState(
      currentMode,
      dur,
      selectedSubjectId || undefined,
      selectedTaskId || undefined
    );
    FocusStudyStore.setActiveTimer(newState);
    setRemaining(dur);
    playChime();
  };

  const handlePause = () => {
    if (!activeTimer) return;
    const paused = pauseTimerState(activeTimer);
    FocusStudyStore.setActiveTimer(paused);
    setRemaining(paused.remainingSeconds);
  };

  const handleResume = () => {
    if (!activeTimer) return;
    const resumed = resumeTimerState(activeTimer);
    FocusStudyStore.setActiveTimer(resumed);
    setRemaining(getRemainingSeconds(resumed));
  };

  const handleReset = () => {
    FocusStudyStore.setActiveTimer(null);
    const dur = currentMode === 'custom' ? customMinutesInput * 60 : modeDurations[currentMode];
    setRemaining(dur);
  };

  const handleCancel = () => {
    if (confirm('আপনি কি এই সেশনটি বাতিল করতে চান? বাতিলকৃত সেশন পড়ার সময়ে গণনা করা হবে না।')) {
      FocusStudyStore.setActiveTimer(null);
      const dur = currentMode === 'custom' ? customMinutesInput * 60 : modeDurations[currentMode];
      setRemaining(dur);
    }
  };

  const handleComplete = () => {
    if (!activeTimer) return;

    const completed = finalizeCompletedSession(activeTimer, user.uid);
    if (sessionNotes) {
      completed.notes = sessionNotes;
    }

    FocusStudyStore.recordSession(completed);
    FocusStudyStore.setActiveTimer(null);

    // Fire confetti celebration
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // Confetti fallback
    }

    playChime();

    const isStudy = completed.mode === 'focus' || completed.mode === 'custom';
    const durMins = Math.round(completed.actualDurationSeconds / 60);

    // Trigger browser notification for 'time to take a break' alert
    if (isStudy) {
      const currentSub = subjects.find((s) => s.id === completed.subjectId);
      triggerBreakNotification(durMins, currentSub?.name);
    }

    setSuccessToast(
      isStudy
        ? `দারুণ! ${toBengaliNumber(durMins)} মিনিটের ফোকাস সেশন সফলভাবে সম্পন্ন হয়েছে। বিরতি নেওয়ার সতর্কবার্তা পাঠানো হয়েছে।`
        : 'বিরতির সময় শেষ। নতুন ফোকাস সেশন শুরু করার প্রস্তুতি নিন!'
    );

    setTimeout(() => setSuccessToast(null), 5000);

    // Next mode suggestion
    if (isStudy) {
      setCurrentMode('short_break');
      setRemaining(modeDurations.short_break);
    } else {
      setCurrentMode('focus');
      setRemaining(modeDurations.focus);
    }
    setSessionNotes('');
  };

  // Switch mode when idle
  const handleModeChange = (mode: TimerMode) => {
    if (activeTimer) {
      if (!confirm('চলমান সেশনটি বন্ধ করে মোড পরিবর্তন করতে চান?')) return;
      FocusStudyStore.setActiveTimer(null);
    }
    setCurrentMode(mode);
    setRemaining(mode === 'custom' ? customMinutesInput * 60 : modeDurations[mode]);
  };

  // Circular progress math
  const totalPlanned = activeTimer ? activeTimer.plannedSeconds : modeDurations[currentMode];
  const progressRatio = totalPlanned > 0 ? (totalPlanned - remaining) / totalPlanned : 0;
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  // Today's summary stats for timer view
  const todaySessions = sessions.filter(
    (s) => s.isCompleted && (s.mode === 'focus' || s.mode === 'custom')
  );
  const todayMinutes = todaySessions.reduce(
    (acc, s) => acc + Math.round(s.actualDurationSeconds / 60),
    0
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Toast Alert */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-500 text-white shadow-lg flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-200" />
            <span className="font-bold text-sm">{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-white/80 hover:text-white text-xs underline font-semibold"
          >
            বন্ধ করুন
          </button>
        </div>
      )}

      {/* Mode Selector Tabs */}
      <div className="flex items-center justify-center">
        <div className="inline-flex p-1.5 rounded-2xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] shadow-xs gap-1">
          {[
            { id: 'focus' as TimerMode, label: 'ফোকাস (২৫ মি)' },
            { id: 'short_break' as TimerMode, label: 'ছোট বিরতি (৫ মি)' },
            { id: 'long_break' as TimerMode, label: 'বড় বিরতি (১৫ মি)' },
            { id: 'custom' as TimerMode, label: 'কাস্টম' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleModeChange(tab.id)}
              className={`px-3 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                currentMode === tab.id
                  ? 'bg-gradient-to-r from-[#5B5CE2] to-[#8B5CF6] text-white shadow-md shadow-indigo-500/25'
                  : 'text-[#77839B] dark:text-[#A7B5CC] hover:text-[#17233F] dark:hover:text-[#F1F5FF]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Timer Display Card */}
      <div className="p-6 md:p-10 rounded-3xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] shadow-md flex flex-col items-center justify-center relative overflow-hidden">
        {/* Action icons (Notification Alert & Sound) */}
        <div className="absolute top-6 right-6 flex items-center gap-2">
          <button
            onClick={handleRequestNotification}
            className={`p-2 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold ${
              notifStatus === 'granted'
                ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-800/40'
                : notifStatus === 'denied'
                ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/40 border border-rose-200/50'
                : 'text-[#5B5CE2] dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60'
            }`}
            title={
              notifStatus === 'granted'
                ? 'বিরতি নোটিফিকেশন সক্রিয় (ক্লিক করে টেস্ট নোটিফিকেশন পাঠান)'
                : notifStatus === 'denied'
                ? 'ব্রাউজারে নোটিফিকেশন ব্লক করা রয়েছে'
                : 'সেশন শেষে বিরতির নোটিফিকেশন চালু করুন'
            }
            aria-label="বিরতি নোটিফিকেশন অ্যালার্ট"
          >
            {notifStatus === 'granted' ? (
              <>
                <BellRing className="w-4 h-4 text-emerald-500" />
                <span className="hidden sm:inline">বিরতি অ্যালার্ট সচল</span>
              </>
            ) : notifStatus === 'denied' ? (
              <>
                <BellOff className="w-4 h-4 text-rose-500" />
                <span className="hidden sm:inline">নোটিফিকেশন ব্লক</span>
              </>
            ) : (
              <>
                <Bell className="w-4 h-4 animate-bounce" />
                <span className="hidden sm:inline">বিরতি নোটিফিকেশন অন করুন</span>
              </>
            )}
          </button>

          {/* Sound toggle button */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl text-[#77839B] dark:text-[#A7B5CC] hover:bg-[#F5F7FC] dark:hover:bg-[#122440]"
            title={soundEnabled ? 'শব্দ বন্ধ করুন' : 'শব্দ চালু করুন'}
            aria-label="সাউন্ড টগল"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 text-[#5B5CE2]" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>

        {/* Circular Ring Timer */}
        <div className="relative w-72 h-72 md:w-80 md:h-80 flex items-center justify-center my-4">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              className="text-[#E6EAF2] dark:text-[#1C2C47]"
            />
            {/* Animated progress circle */}
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              stroke="url(#timerGradient)"
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-300"
            />
            <defs>
              <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#5B5CE2" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
          </svg>

          {/* Time text centered */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-4xl sm:text-5xl md:text-6xl font-black text-[#17233F] dark:text-[#F1F5FF] tracking-tight">
              {formatSecondsToMS(remaining)}
            </span>
            <span className="mt-2 text-xs sm:text-sm font-bold text-[#77839B] dark:text-[#A7B5CC] uppercase tracking-wider">
              {currentMode === 'focus' && 'গভীর মনোযোগ সময়'}
              {currentMode === 'short_break' && 'হালকা বিরতি'}
              {currentMode === 'long_break' && 'দীর্ঘ বিরতি'}
              {currentMode === 'custom' && 'কাস্টম ফোকাস সেশন'}
            </span>
            {activeTimer && (
              <span
                className={`mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  activeTimer.isPaused
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 animate-pulse'
                }`}
              >
                {activeTimer.isPaused ? 'বিরতি চলছে' : 'চলমান'}
              </span>
            )}
          </div>
        </div>

        {/* Custom Duration Input when custom mode is chosen and inactive */}
        {currentMode === 'custom' && !activeTimer && (
          <div className="mb-6 flex items-center gap-3">
            <label className="text-xs font-semibold text-[#77839B] dark:text-[#A7B5CC]">
              পড়ার সময়কাল (মিনিট):
            </label>
            <input
              type="number"
              min="1"
              max="180"
              value={customMinutesInput}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10) || 1;
                setCustomMinutesInput(val);
                setRemaining(val * 60);
              }}
              className="w-20 px-3 py-1.5 text-center text-sm font-bold rounded-xl bg-[#F5F7FC] dark:bg-[#122440] border border-[#E6EAF2] dark:border-[#243754] text-[#17233F] dark:text-[#F1F5FF]"
            />
          </div>
        )}

        {/* Subject & Task Assignment Selectors */}
        <div className="w-full max-w-md grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          <div>
            <label className="block text-xs font-semibold text-[#77839B] dark:text-[#A7B5CC] mb-1">
              পড়ার বিষয় নির্বাচন:
            </label>
            <select
              value={selectedSubjectId}
              disabled={Boolean(activeTimer)}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-[#F5F7FC] dark:bg-[#122440] border border-[#E6EAF2] dark:border-[#243754] text-[#17233F] dark:text-[#F1F5FF] disabled:opacity-70"
            >
              <option value="">কোনো নির্দিষ্ট বিষয় নয়</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#77839B] dark:text-[#A7B5CC] mb-1">
              নির্দিষ্ট কাজ (ঐচ্ছিক):
            </label>
            <select
              value={selectedTaskId}
              disabled={Boolean(activeTimer)}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-[#F5F7FC] dark:bg-[#122440] border border-[#E6EAF2] dark:border-[#243754] text-[#17233F] dark:text-[#F1F5FF] disabled:opacity-70"
            >
              <option value="">কোনো কাজ নয়</option>
              {tasks
                .filter((t) => t.status !== 'completed')
                .map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.title}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
          {!activeTimer ? (
            <button
              onClick={handleStart}
              className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#5B5CE2] to-[#8B5CF6] text-white font-bold text-base shadow-lg shadow-indigo-500/30 hover:scale-[1.03] active:scale-[0.97] transition-all"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>শুরু করুন</span>
            </button>
          ) : activeTimer.isPaused ? (
            <button
              onClick={handleResume}
              className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-base shadow-lg shadow-emerald-500/30 hover:scale-[1.03] active:scale-[0.97] transition-all"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>আবার শুরু করুন</span>
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-base shadow-lg shadow-amber-500/30 hover:scale-[1.03] active:scale-[0.97] transition-all"
            >
              <Pause className="w-5 h-5 fill-current" />
              <span>বিরতি দিন</span>
            </button>
          )}

          {activeTimer && (
            <button
              onClick={handleComplete}
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-[#5B5CE2] dark:text-indigo-400 font-bold text-sm border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              <span>ফোকাস সম্পন্ন</span>
            </button>
          )}

          {activeTimer && (
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-3.5 rounded-2xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-sm font-semibold transition-colors"
            >
              <XCircle className="w-4 h-4" />
              <span>সেশন বাতিল</span>
            </button>
          )}

          <button
            onClick={handleReset}
            className="p-3.5 rounded-2xl text-[#77839B] dark:text-[#A7B5CC] hover:bg-[#F5F7FC] dark:hover:bg-[#122440] transition-colors"
            title="টাইমার রিসেট"
            aria-label="রিসেট"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Optional notes input during session */}
        {activeTimer && (
          <div className="w-full max-w-md mt-6">
            <input
              type="text"
              placeholder="এই সেশনে কী কী পড়ছেন? (সংক্ষিপ্ত নোট)..."
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#F5F7FC] dark:bg-[#122440] border border-[#E6EAF2] dark:border-[#243754] text-[#17233F] dark:text-[#F1F5FF]"
            />
          </div>
        )}
      </div>

      {/* Footer Metrics for Timer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] text-center">
          <span className="text-xs text-[#77839B] dark:text-[#A7B5CC] font-semibold">
            আজকের সম্পন্ন সেশন
          </span>
          <div className="text-xl font-extrabold text-[#17233F] dark:text-[#F1F5FF] mt-1">
            {toBengaliNumber(todaySessions.length)}টি
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] text-center">
          <span className="text-xs text-[#77839B] dark:text-[#A7B5CC] font-semibold">
            আজকের মোট ফোকাস সময়
          </span>
          <div className="text-xl font-extrabold text-[#17233F] dark:text-[#F1F5FF] mt-1">
            {formatBengaliDuration(todayMinutes)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] text-center">
          <span className="text-xs text-[#77839B] dark:text-[#A7B5CC] font-semibold">
            দৈনিক লক্ষ্য
          </span>
          <div className="text-xl font-extrabold text-[#17233F] dark:text-[#F1F5FF] mt-1">
            {formatBengaliDuration(user.dailyGoalMinutes)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] text-center">
          <span className="text-xs text-[#77839B] dark:text-[#A7B5CC] font-semibold">
            লক্ষ্য অর্জনের হার
          </span>
          <div className="text-xl font-extrabold text-[#5B5CE2] dark:text-indigo-400 mt-1">
            {toBengaliNumber(
              user.dailyGoalMinutes > 0
                ? Math.min(100, Math.round((todayMinutes / user.dailyGoalMinutes) * 100))
                : 0
            )}
            %
          </div>
        </div>
      </div>
    </div>
  );
}
