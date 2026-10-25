import React, { useState } from 'react';
import {
  Plus,
  Search,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Trash2,
  Edit2,
  AlertCircle,
  X,
} from 'lucide-react';
import { Task, TaskPriority, TaskStatus } from '../../types';
import { useFocusStudyData, FocusStudyStore } from '../../lib/storage/store';
import { useAuth } from '../../contexts/AuthContext';
import {
  toBengaliNumber,
  formatBengaliDate,
} from '../../lib/utils/formatters';
import { getDateKey, DEFAULT_TIMEZONE } from '../../lib/utils/date-utils';

type FilterType = 'all' | 'today' | 'upcoming' | 'completed' | 'pending' | 'overdue';

export function TasksView() {
  const { user } = useAuth();
  const { tasks, subjects } = useFocusStudyData();

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [deadline, setDeadline] = useState(getDateKey(new Date(), DEFAULT_TIMEZONE));
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [errorMsg, setErrorMsg] = useState('');

  const todayKey = getDateKey(new Date(), DEFAULT_TIMEZONE);

  const subjectMap = new Map<string, (typeof subjects)[0]>();
  subjects.forEach((s) => subjectMap.set(s.id, s));

  // Filter logic
  const filteredTasks = tasks.filter((task) => {
    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }

    // Tab filter
    if (activeFilter === 'today') {
      return task.deadline === todayKey;
    }
    if (activeFilter === 'upcoming') {
      return task.deadline && task.deadline > todayKey && task.status !== 'completed';
    }
    if (activeFilter === 'completed') {
      return task.status === 'completed';
    }
    if (activeFilter === 'pending') {
      return task.status !== 'completed';
    }
    if (activeFilter === 'overdue') {
      return task.deadline && task.deadline < todayKey && task.status !== 'completed';
    }
    return true;
  });

  const handleOpenCreateModal = () => {
    setEditingTaskId(null);
    setTitle('');
    setDescription('');
    setSubjectId(subjects[0]?.id || '');
    setPriority('medium');
    setDeadline(todayKey);
    setEstimatedMinutes(30);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setEditingTaskId(task.id);
    setTitle(task.title);
    setDescription(task.description || '');
    setSubjectId(task.subjectId || '');
    setPriority(task.priority);
    setDeadline(task.deadline || todayKey);
    setEstimatedMinutes(task.estimatedMinutes || 30);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('কাজের শিরোনাম আবশ্যক');
      return;
    }

    if (editingTaskId) {
      FocusStudyStore.updateTask(editingTaskId, {
        title: title.trim(),
        description: description.trim() || undefined,
        subjectId: subjectId || undefined,
        priority,
        deadline,
        estimatedMinutes,
      });
    } else {
      FocusStudyStore.addTask({
        userId: user.uid,
        title: title.trim(),
        description: description.trim() || undefined,
        subjectId: subjectId || undefined,
        priority,
        status: 'pending' as TaskStatus,
        deadline,
        estimatedMinutes,
      });
    }

    setIsModalOpen(false);
  };

  const handleDeleteTask = (id: string) => {
    if (confirm('আপনি কি এই কাজটি মুছে ফেলতে চান?')) {
      FocusStudyStore.deleteTask(id);
    }
  };

  const priorityLabels: Record<TaskPriority, { label: string; color: string }> = {
    low: { label: 'কম', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
    medium: { label: 'মাঝারি', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' },
    high: { label: 'উচ্চ', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' },
    urgent: { label: 'জরুরি', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300' },
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[#17233F] dark:text-[#F1F5FF]">
            পড়ার কাজসমূহ
          </h2>
          <p className="text-xs md:text-sm text-[#77839B] dark:text-[#A7B5CC] mt-0.5">
            আপনার লক্ষ্য অর্জনে দৈনিক কাজের তালিকা সাজান ও সম্পন্ন করুন
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#5B5CE2] to-[#8B5CF6] text-white text-xs md:text-sm font-semibold shadow-md shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন কাজ যোগ করুন</span>
        </button>
      </div>

      {/* Search & Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#77839B] dark:text-[#A7B5CC]" />
          <input
            type="text"
            placeholder="কাজের শিরোনাম বা বিবরণ খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs md:text-sm rounded-xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] text-[#17233F] dark:text-[#F1F5FF] placeholder:text-[#77839B]"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
          {[
            { id: 'all' as FilterType, label: 'সব কাজ' },
            { id: 'today' as FilterType, label: 'আজকের কাজ' },
            { id: 'upcoming' as FilterType, label: 'আসন্ন' },
            { id: 'pending' as FilterType, label: 'অসম্পন্ন' },
            { id: 'completed' as FilterType, label: 'সম্পন্ন' },
            { id: 'overdue' as FilterType, label: 'সময় উত্তীর্ণ' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeFilter === f.id
                  ? 'bg-[#5B5CE2] text-white shadow-xs'
                  : 'bg-white dark:bg-[#0D1B32] text-[#77839B] dark:text-[#A7B5CC] border border-[#E6EAF2] dark:border-[#243754] hover:text-[#17233F]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754]">
            <CheckCircle2 className="w-12 h-12 mx-auto text-[#77839B] opacity-40 mb-3" />
            <h4 className="font-bold text-sm text-[#17233F] dark:text-[#F1F5FF]">
              কোনো কাজ পাওয়া যায়নি
            </h4>
            <p className="text-xs text-[#77839B] dark:text-[#A7B5CC] mt-1">
              {searchQuery ? 'আপনার সার্চ অনুযায়ী কোনো কাজ মেলেনি' : 'নতুন কাজ যোগ করে শুরু করুন'}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const sub = task.subjectId ? subjectMap.get(task.subjectId) : null;
            const isOverdue = task.deadline && task.deadline < todayKey && !isCompleted;

            return (
              <div
                key={task.id}
                className={`p-4 rounded-2xl bg-white dark:bg-[#0D1B32] border transition-all flex items-start sm:items-center justify-between gap-3 ${
                  isCompleted
                    ? 'border-[#E6EAF2] dark:border-[#243754] opacity-75'
                    : isOverdue
                    ? 'border-rose-300 dark:border-rose-900/60 shadow-xs'
                    : 'border-[#E6EAF2] dark:border-[#243754] hover:border-indigo-200 dark:hover:border-indigo-900/60 shadow-xs'
                }`}
              >
                {/* Left check + text */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <button
                    onClick={() => FocusStudyStore.toggleTaskCompletion(task.id)}
                    className="mt-0.5 text-[#5B5CE2] hover:scale-110 transition-transform shrink-0"
                    aria-label={isCompleted ? 'অসম্পন্ন করুন' : 'সম্পন্ন করুন'}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                    ) : (
                      <Circle className="w-5 h-5 text-[#77839B] hover:text-[#5B5CE2]" />
                    )}
                  </button>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-sm font-bold ${
                          isCompleted
                            ? 'line-through text-[#77839B] dark:text-[#A7B5CC]'
                            : 'text-[#17233F] dark:text-[#F1F5FF]'
                        }`}
                      >
                        {task.title}
                      </span>

                      {/* Subject pill */}
                      {sub && (
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white"
                          style={{ backgroundColor: sub.color }}
                        >
                          {sub.name}
                        </span>
                      )}

                      {/* Priority pill */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          priorityLabels[task.priority].color
                        }`}
                      >
                        {priorityLabels[task.priority].label}
                      </span>

                      {isOverdue && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
                          সময় পার হয়েছে
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-xs text-[#77839B] dark:text-[#A7B5CC] line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-[11px] text-[#77839B] dark:text-[#A7B5CC] pt-0.5">
                      {task.deadline && (
                        <div className="flex items-center gap-1 font-medium">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatBengaliDate(task.deadline)}</span>
                        </div>
                      )}
                      {task.estimatedMinutes && (
                        <div className="flex items-center gap-1 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{toBengaliNumber(task.estimatedMinutes)} মিনিট</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right action buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleOpenEditModal(task)}
                    className="p-1.5 rounded-lg text-[#77839B] hover:text-[#5B5CE2] hover:bg-[#F5F7FC] dark:hover:bg-[#122440] transition-colors"
                    aria-label="সম্পাদনা করুন"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1.5 rounded-lg text-[#77839B] hover:text-rose-500 hover:bg-[#F5F7FC] dark:hover:bg-[#122440] transition-colors"
                    aria-label="মুছুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create / Edit Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-[#0D1B32] rounded-3xl border border-[#E6EAF2] dark:border-[#243754] shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6EAF2] dark:border-[#243754]">
              <h3 className="font-bold text-base text-[#17233F] dark:text-[#F1F5FF]">
                {editingTaskId ? 'কাজ সম্পাদনা করুন' : 'নতুন কাজ যোগ করুন'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-[#77839B] hover:text-[#17233F] dark:hover:text-[#F1F5FF]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="mt-4 space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#17233F] dark:text-[#F1F5FF] mb-1">
                  কাজের শিরোনাম <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="যেমন: বাংলা ব্যাকরণের সমাস অধ্যায় রিভিশন"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl bg-[#F5F7FC] dark:bg-[#122440] border border-[#E6EAF2] dark:border-[#243754] text-[#17233F] dark:text-[#F1F5FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17233F] dark:text-[#F1F5FF] mb-1">
                  বিস্তারিত বিবরণ (ঐচ্ছিক)
                </label>
                <textarea
                  rows={2}
                  placeholder="কী কী অংশ পড়া হবে বা নোট তৈরি..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl bg-[#F5F7FC] dark:bg-[#122440] border border-[#E6EAF2] dark:border-[#243754] text-[#17233F] dark:text-[#F1F5FF]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#17233F] dark:text-[#F1F5FF] mb-1">
                    বিষয়
                  </label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl bg-[#F5F7FC] dark:bg-[#122440] border border-[#E6EAF2] dark:border-[#243754] text-[#17233F] dark:text-[#F1F5FF]"
                  >
                    <option value="">কোনো বিষয় নির্দিষ্ট নয়</option>
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#17233F] dark:text-[#F1F5FF] mb-1">
                    গুরুত্ব (অগ্রাধিকার)
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl bg-[#F5F7FC] dark:bg-[#122440] border border-[#E6EAF2] dark:border-[#243754] text-[#17233F] dark:text-[#F1F5FF]"
                  >
                    <option value="low">কম (Low)</option>
                    <option value="medium">মাঝারি (Medium)</option>
                    <option value="high">উচ্চ (High)</option>
                    <option value="urgent">জরুরি (Urgent)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#17233F] dark:text-[#F1F5FF] mb-1">
                    শেষ করার তারিখ (Deadline)
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl bg-[#F5F7FC] dark:bg-[#122440] border border-[#E6EAF2] dark:border-[#243754] text-[#17233F] dark:text-[#F1F5FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#17233F] dark:text-[#F1F5FF] mb-1">
                    আনুমানিক সময় (মিনিট)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="600"
                    value={estimatedMinutes}
                    onChange={(e) => setEstimatedMinutes(parseInt(e.target.value, 10) || 30)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl bg-[#F5F7FC] dark:bg-[#122440] border border-[#E6EAF2] dark:border-[#243754] text-[#17233F] dark:text-[#F1F5FF]"
                  />
                </div>
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
                  {editingTaskId ? 'সংরক্ষণ করুন' : 'তৈরি করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
