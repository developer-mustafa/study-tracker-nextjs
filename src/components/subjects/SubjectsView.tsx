import React, { useState } from 'react';
import { Plus, Layers, Edit2, Trash2, Clock, X, AlertCircle } from 'lucide-react';
import { Subject } from '../../types';
import { useFocusStudyData, FocusStudyStore } from '../../lib/storage/store';
import { useAuth } from '../../contexts/AuthContext';
import {
  toBengaliNumber,
  formatBengaliDuration,
} from '../../lib/utils/formatters';

const PRESET_COLORS = [
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#EF4444', // Red
  '#6366F1', // Indigo
];

export function SubjectsView() {
  const { user } = useAuth();
  const { subjects, sessions } = useFocusStudyData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubId, setEditingSubId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [targetMinutes, setTargetMinutes] = useState(120);
  const [errorMsg, setErrorMsg] = useState('');

  // Calculate actual time studied per subject
  const minutesBySubject: Record<string, number> = {};
  sessions
    .filter((s) => s.isCompleted && (s.mode === 'focus' || s.mode === 'custom'))
    .forEach((s) => {
      if (s.subjectId) {
        minutesBySubject[s.subjectId] =
          (minutesBySubject[s.subjectId] || 0) + Math.round(s.actualDurationSeconds / 60);
      }
    });

  const handleOpenCreateModal = () => {
    setEditingSubId(null);
    setName('');
    setDescription('');
    setColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
    setTargetMinutes(120);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (sub: Subject) => {
    setEditingSubId(sub.id);
    setName(sub.name);
    setDescription(sub.description || '');
    setColor(sub.color);
    setTargetMinutes(sub.targetMinutes || 120);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleDeleteSubject = (id: string) => {
    if (confirm('আপনি কি এই বিষয়টি মুছে ফেলতে চান? সংশ্লিষ্ট সেশনগুলো সংরক্ষিত থাকবে।')) {
      FocusStudyStore.deleteSubject(id);
    }
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('বিষয়ের নাম আবশ্যক');
      return;
    }

    if (editingSubId) {
      FocusStudyStore.updateSubject(editingSubId, {
        name: name.trim(),
        description: description.trim() || undefined,
        color,
        targetMinutes,
      });
    } else {
      FocusStudyStore.addSubject({
        userId: user.uid,
        name: name.trim(),
        description: description.trim() || undefined,
        color,
        icon: 'BookOpen',
        targetMinutes,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[#17233F] dark:text-[#F1F5FF]">
            পড়ার বিষয়সমূহ
          </h2>
          <p className="text-xs md:text-sm text-[#77839B] dark:text-[#A7B5CC] mt-0.5">
            বিষয়ভিত্তিক পড়ার লক্ষ্য ও সময় বরাদ্দ পরিচালনা করুন
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#5B5CE2] to-[#8B5CF6] text-white text-xs md:text-sm font-semibold shadow-md shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন বিষয় যোগ করুন</span>
        </button>
      </div>

      {/* Grid of Subjects */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((sub) => {
          const actualMins = minutesBySubject[sub.id] || 0;
          const target = sub.targetMinutes || 60;
          const percent = Math.min(100, Math.round((actualMins / target) * 100));

          return (
            <div
              key={sub.id}
              className="p-5 rounded-3xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-200 dark:hover:border-indigo-900/60 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0"
                      style={{ backgroundColor: sub.color }}
                    >
                      <Layers className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-base text-[#17233F] dark:text-[#F1F5FF] truncate">
                        {sub.name}
                      </h3>
                      <p className="text-[11px] text-[#77839B] dark:text-[#A7B5CC] truncate">
                        {sub.description || 'নিয়মিত অধ্যয়ন'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEditModal(sub)}
                      className="p-1.5 rounded-lg text-[#77839B] hover:text-[#5B5CE2] hover:bg-[#F5F7FC] dark:hover:bg-[#122440]"
                      aria-label="সম্পাদনা করুন"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSubject(sub.id)}
                      className="p-1.5 rounded-lg text-[#77839B] hover:text-rose-500 hover:bg-[#F5F7FC] dark:hover:bg-[#122440]"
                      aria-label="মুছুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-2 pt-2 border-t border-[#E6EAF2] dark:border-[#243754]">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-[#77839B] dark:text-[#A7B5CC]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>ব্যয়িত সময়:</span>
                  </div>
                  <span className="font-bold text-[#17233F] dark:text-[#F1F5FF]">
                    {formatBengaliDuration(actualMins)}
                  </span>
                </div>

                <div className="w-full bg-[#E6EAF2] dark:bg-[#1C2C47] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: sub.color,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#77839B] dark:text-[#A7B5CC]">
                  <span>টার্গেট: {formatBengaliDuration(target)}</span>
                  <span className="font-bold">{toBengaliNumber(percent)}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#0D1B32] rounded-3xl border border-[#E6EAF2] dark:border-[#243754] shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6EAF2] dark:border-[#243754]">
              <h3 className="font-bold text-base text-[#17233F] dark:text-[#F1F5FF]">
                {editingSubId ? 'বিষয় সম্পাদনা' : 'নতুন বিষয় যোগ'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-[#77839B] hover:text-[#17233F] dark:hover:text-[#F1F5FF]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="mt-4 space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-600 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#17233F] dark:text-[#F1F5FF] mb-1">
                  বিষয়ের নাম <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="যেমন: পদার্থবিজ্ঞান"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl bg-[#F5F7FC] dark:bg-[#122440] border border-[#E6EAF2] dark:border-[#243754] text-[#17233F] dark:text-[#F1F5FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17233F] dark:text-[#F1F5FF] mb-1">
                  বিবরণ (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: ১ম ও ২য় পত্র"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl bg-[#F5F7FC] dark:bg-[#122440] border border-[#E6EAF2] dark:border-[#243754] text-[#17233F] dark:text-[#F1F5FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17233F] dark:text-[#F1F5FF] mb-1">
                  রং (Color Tag)
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {PRESET_COLORS.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        color === c ? 'scale-125 ring-2 ring-offset-2 ring-[#5B5CE2]' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17233F] dark:text-[#F1F5FF] mb-1">
                  সাপ্তাহিক লক্ষ্য (মিনিট)
                </label>
                <input
                  type="number"
                  min="30"
                  step="30"
                  value={targetMinutes}
                  onChange={(e) => setTargetMinutes(parseInt(e.target.value, 10) || 60)}
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
                  {editingSubId ? 'সংরক্ষণ করুন' : 'যোগ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
