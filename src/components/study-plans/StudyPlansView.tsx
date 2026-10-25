import React, { useState } from 'react';
import {
  Plus,
  BookMarked,
  Calendar,
  CheckCircle2,
  Clock,
  Trash2,
  Copy,
  Edit2,
  Check,
  AlertCircle,
  X,
} from 'lucide-react';
import { StudyPlan, PlanStatus } from '../../types';
import { useFocusStudyData, FocusStudyStore } from '../../lib/storage/store';
import { useAuth } from '../../contexts/AuthContext';
import {
  toBengaliNumber,
  formatBengaliDate,
  formatBengaliDuration,
} from '../../lib/utils/formatters';

export function StudyPlansView() {
  const { user } = useAuth();
  const { studyPlans, subjects } = useFocusStudyData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [targetDate, setTargetDate] = useState('');
  const [targetMinutes, setTargetMinutes] = useState(1200);
  const [status, setStatus] = useState<PlanStatus>('in_progress');
  const [topicsInput, setTopicsInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const subjectMap = new Map<string, (typeof subjects)[0]>();
  subjects.forEach((s) => subjectMap.set(s.id, s));

  const handleOpenCreateModal = () => {
    setEditingPlanId(null);
    setTitle('');
    setDescription('');
    setSelectedSubjects(subjects.slice(0, 2).map((s) => s.id));
    setStartDate(new Date().toISOString().slice(0, 10));
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setTargetDate(nextMonth.toISOString().slice(0, 10));
    setTargetMinutes(1200);
    setStatus('in_progress');
    setTopicsInput('১. বেসিক ধারণা ও পরিচিতি\n২. গুরুত্বপূর্ণ সূত্রাবলী\n৩. বিগত বছরের প্রশ্ন সমাধান');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (plan: StudyPlan) => {
    setEditingPlanId(plan.id);
    setTitle(plan.title);
    setDescription(plan.description);
    setSelectedSubjects(plan.subjectIds || []);
    setStartDate(plan.startDate);
    setTargetDate(plan.targetDate);
    setTargetMinutes(plan.targetMinutes);
    setStatus(plan.status);
    setTopicsInput(plan.topics.map((t) => t.title).join('\n'));
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleDuplicatePlan = (plan: StudyPlan) => {
    FocusStudyStore.addStudyPlan({
      userId: user.uid,
      title: `${plan.title} (কপি)`,
      description: plan.description,
      subjectIds: plan.subjectIds,
      startDate: new Date().toISOString().slice(0, 10),
      targetDate: plan.targetDate,
      targetMinutes: plan.targetMinutes,
      status: 'planned',
      weeklyDays: plan.weeklyDays,
      topics: plan.topics.map((t) => ({ ...t, id: `top_${Date.now()}_${Math.random()}`, isCompleted: false })),
    });
  };

  const handleDeletePlan = (id: string) => {
    if (confirm('আপনি কি এই স্টাডি প্ল্যানটি মুছে ফেলতে চান?')) {
      FocusStudyStore.deleteStudyPlan(id);
    }
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('প্ল্যানের শিরোনাম আবশ্যক');
      return;
    }

    const topicsList = topicsInput
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean)
      .map((topicTitle, index) => ({
        id: `topic_${Date.now()}_${index}`,
        title: topicTitle,
        isCompleted: false,
      }));

    if (editingPlanId) {
      FocusStudyStore.updateStudyPlan(editingPlanId, {
        title: title.trim(),
        description: description.trim(),
        subjectIds: selectedSubjects,
        startDate,
        targetDate,
        targetMinutes,
        status,
        topics: topicsList.length > 0 ? topicsList : undefined,
      });
    } else {
      FocusStudyStore.addStudyPlan({
        userId: user.uid,
        title: title.trim(),
        description: description.trim(),
        subjectIds: selectedSubjects,
        startDate,
        targetDate,
        targetMinutes,
        status,
        weeklyDays: [0, 1, 2, 3, 4, 5, 6],
        topics: topicsList,
      });
    }

    setIsModalOpen(false);
  };

  const planStatusLabels: Record<PlanStatus, { label: string; color: string }> = {
    planned: { label: 'পরিকল্পিত', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
    in_progress: { label: 'চলমান', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' },
    completed: { label: 'সম্পন্ন', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' },
    paused: { label: 'স্থগিত', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[#17233F] dark:text-[#F1F5FF]">
            স্টাডি প্ল্যান ও সিলেবাস
          </h2>
          <p className="text-xs md:text-sm text-[#77839B] dark:text-[#A7B5CC] mt-0.5">
            নির্দিষ্ট সময়সীমা নির্ধারণ করে বিষয়ভিত্তিক পড়া গুছিয়ে রাখুন
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#5B5CE2] to-[#8B5CF6] text-white text-xs md:text-sm font-semibold shadow-md shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন প্ল্যান তৈরি করুন</span>
        </button>
      </div>

      {/* Grid of Study Plans */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {studyPlans.map((plan) => {
          const completedTopics = plan.topics.filter((t) => t.isCompleted).length;
          const totalTopics = plan.topics.length;
          const topicPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

          return (
            <div
              key={plan.id}
              className="p-5 md:p-6 rounded-3xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Header info */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="space-y-1">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md ${
                        planStatusLabels[plan.status].color
                      }`}
                    >
                      {planStatusLabels[plan.status].label}
                    </span>
                    <h3 className="text-base font-bold text-[#17233F] dark:text-[#F1F5FF] line-clamp-1">
                      {plan.title}
                    </h3>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleDuplicatePlan(plan)}
                      className="p-1.5 rounded-lg text-[#77839B] hover:text-[#5B5CE2] hover:bg-[#F5F7FC] dark:hover:bg-[#122440]"
                      title="ডুপ্লিকেট করুন"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(plan)}
                      className="p-1.5 rounded-lg text-[#77839B] hover:text-[#5B5CE2] hover:bg-[#F5F7FC] dark:hover:bg-[#122440]"
                      title="সম্পাদনা করুন"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      className="p-1.5 rounded-lg text-[#77839B] hover:text-rose-500 hover:bg-[#F5F7FC] dark:hover:bg-[#122440]"
                      title="মুছুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-[#77839B] dark:text-[#A7B5CC] line-clamp-2">
                  {plan.description}
                </p>

                {/* Subject tags */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {plan.subjectIds.map((sid) => {
                    const sub = subjectMap.get(sid);
                    if (!sub) return null;
                    return (
                      <span
                        key={sid}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white"
                        style={{ backgroundColor: sub.color }}
                      >
                        {sub.name}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Progress Bar & Topics Checklist */}
              <div className="space-y-3 pt-2 border-t border-[#E6EAF2] dark:border-[#243754]">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#77839B] dark:text-[#A7B5CC]">
                    অগ্রগতি ({toBengaliNumber(completedTopics)}/{toBengaliNumber(totalTopics)} টপিক)
                  </span>
                  <span className="font-bold text-[#5B5CE2] dark:text-indigo-400">
                    {toBengaliNumber(topicPercent)}%
                  </span>
                </div>

                <div className="w-full bg-[#E6EAF2] dark:bg-[#1C2C47] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#5B5CE2] to-[#8B5CF6] h-full rounded-full transition-all duration-500"
                    style={{ width: `${topicPercent}%` }}
                  />
                </div>

                {/* Topics list */}
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {plan.topics.map((top) => (
                    <div
                      key={top.id}
                      onClick={() => FocusStudyStore.toggleTopicCompletion(plan.id, top.id)}
                      className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-[#F5F7FC] dark:hover:bg-[#122440] cursor-pointer text-xs"
                    >
                      <div
                        className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border ${
                          top.isCompleted
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-[#77839B]'
                        }`}
                      >
                        {top.isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span
                        className={`truncate ${
                          top.isCompleted
                            ? 'line-through text-[#77839B] dark:text-[#A7B5CC]'
                            : 'text-[#17233F] dark:text-[#F1F5FF]'
                        }`}
                      >
                        {top.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom dates */}
              <div className="flex items-center justify-between text-[11px] text-[#77839B] dark:text-[#A7B5CC] pt-2 border-t border-[#E6EAF2] dark:border-[#243754]">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>টার্গেট: {formatBengaliDate(plan.targetDate)}</span>
                </div>
                <div className="flex items-center gap-1 font-semibold text-[#17233F] dark:text-[#F1F5FF]">
                  <Clock className="w-3.5 h-3.5 text-[#5B5CE2]" />
                  <span>লক্ষ্য: {formatBengaliDuration(plan.targetMinutes)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-[#0D1B32] rounded-3xl border border-[#E6EAF2] dark:border-[#243754] shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6EAF2] dark:border-[#243754]">
              <h3 className="font-bold text-base text-[#17233F] dark:text-[#F1F5FF]">
                {editingPlanId ? 'স্টাডি প্ল্যান সম্পাদনা' : 'নতুন স্টাডি প্ল্যান তৈরি'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-[#77839B] hover:text-[#17233F] dark:hover:text-[#F1F5FF]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="mt-4 space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-600 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#17233F] dark:text-[#F1F5FF] mb-1">
                  প্ল্যানের নাম / শিরোনাম <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="যেমন: বিসিএস প্রিলিমিনারি প্রস্তুতি"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl bg-[#F5F7FC] dark:bg-[#122440] border border-[#E6EAF2] dark:border-[#243754] text-[#17233F] dark:text-[#F1F5FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17233F] dark:text-[#F1F5FF] mb-1">
                  সংক্ষিপ্ত উদ্দেশ্য
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="এই প্ল্যানের প্রধান লক্ষ্য ও কৌশল..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl bg-[#F5F7FC] dark:bg-[#122440] border border-[#E6EAF2] dark:border-[#243754] text-[#17233F] dark:text-[#F1F5FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17233F] dark:text-[#F1F5FF] mb-1">
                  অন্তর্ভুক্ত বিষয়সমূহ
                </label>
                <div className="flex flex-wrap gap-2">
                  {subjects.map((sub) => {
                    const isSelected = selectedSubjects.includes(sub.id);
                    return (
                      <button
                        type="button"
                        key={sub.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedSubjects(selectedSubjects.filter((s) => s !== sub.id));
                          } else {
                            setSelectedSubjects([...selectedSubjects, sub.id]);
                          }
                        }}
                        className={`text-xs px-3 py-1.5 rounded-xl border font-bold transition-all ${
                          isSelected
                            ? 'bg-[#5B5CE2] text-white border-[#5B5CE2]'
                            : 'bg-[#F5F7FC] dark:bg-[#122440] border-[#E6EAF2] dark:border-[#243754] text-[#77839B]'
                        }`}
                      >
                        {sub.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#17233F] dark:text-[#F1F5FF] mb-1">
                    টার্গেট সমাপ্তির তারিখ
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl bg-[#F5F7FC] dark:bg-[#122440] border border-[#E6EAF2] dark:border-[#243754] text-[#17233F] dark:text-[#F1F5FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#17233F] dark:text-[#F1F5FF] mb-1">
                    মোট পড়ার টার্গেট (মিনিট)
                  </label>
                  <input
                    type="number"
                    min="60"
                    step="60"
                    value={targetMinutes}
                    onChange={(e) => setTargetMinutes(parseInt(e.target.value, 10) || 600)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl bg-[#F5F7FC] dark:bg-[#122440] border border-[#E6EAF2] dark:border-[#243754] text-[#17233F] dark:text-[#F1F5FF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17233F] dark:text-[#F1F5FF] mb-1">
                  সিলেবাসের টপিকসমূহ (প্রতি লাইনে একটি করে)
                </label>
                <textarea
                  rows={4}
                  value={topicsInput}
                  onChange={(e) => setTopicsInput(e.target.value)}
                  placeholder="টপিক ১&#10;টপিক ২&#10;টপিক ৩"
                  className="w-full px-3.5 py-2 text-sm rounded-xl bg-[#F5F7FC] dark:bg-[#122440] border border-[#E6EAF2] dark:border-[#243754] text-[#17233F] dark:text-[#F1F5FF]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E6EAF2] dark:border-[#243754]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#77839B] hover:bg-[#F5F7FC] dark:hover:bg-[#122440]"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#5B5CE2] to-[#8B5CF6] text-white text-xs font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  {editingPlanId ? 'সংরক্ষণ করুন' : 'তৈরি করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
