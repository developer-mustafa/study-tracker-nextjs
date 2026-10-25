import React, { useState } from 'react';
import { Plus, Search, Star, Edit2, Trash2, Tag, X, AlertCircle } from 'lucide-react';
import { Note } from '../../types';
import { useFocusStudyData, FocusStudyStore } from '../../lib/storage/store';
import { useAuth } from '../../contexts/AuthContext';
import { formatBengaliDate } from '../../lib/utils/formatters';

export function NotesView() {
  const { user } = useAuth();
  const { notes, subjects } = useFocusStudyData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const subjectMap = new Map<string, (typeof subjects)[0]>();
  subjects.forEach((s) => subjectMap.set(s.id, s));

  const filteredNotes = notes.filter((n) => {
    if (onlyFavorites && !n.isFavorite) return false;
    if (selectedSubjectId !== 'all' && n.subjectId !== selectedSubjectId) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = n.title.toLowerCase().includes(q);
      const matchContent = n.content.toLowerCase().includes(q);
      const matchTag = n.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchContent && !matchTag) return false;
    }
    return true;
  });

  const handleOpenCreateModal = () => {
    setEditingNoteId(null);
    setTitle('');
    setContent('');
    setSubjectId(subjects[0]?.id || '');
    setTagsInput('');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (note: Note) => {
    setEditingNoteId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setSubjectId(note.subjectId || '');
    setTagsInput(note.tags.join(', '));
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setErrorMsg('নোটের শিরোনাম ও বিস্তারিত বিষয়বস্তু আবশ্যক');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingNoteId) {
      FocusStudyStore.updateNote(editingNoteId, {
        title: title.trim(),
        content: content.trim(),
        subjectId: subjectId || undefined,
        tags,
      });
    } else {
      FocusStudyStore.addNote({
        userId: user.uid,
        title: title.trim(),
        content: content.trim(),
        subjectId: subjectId || undefined,
        tags,
        isFavorite: false,
      });
    }

    setIsModalOpen(false);
  };

  const handleDeleteNote = (id: string) => {
    if (confirm('আপনি কি এই নোটটি মুছে ফেলতে চান?')) {
      FocusStudyStore.deleteNote(id);
    }
  };

  const toggleFavorite = (note: Note) => {
    FocusStudyStore.updateNote(note.id, { isFavorite: !note.isFavorite });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[#17233F] dark:text-[#F1F5FF]">
            পড়ার নোটস ও রিভিশন
          </h2>
          <p className="text-xs md:text-sm text-[#77839B] dark:text-[#A7B5CC] mt-0.5">
            গুরুত্বপূর্ণ বিষয়বস্তু, সূত্র ও সংক্ষিপ্ত নোট লিখে রাখুন
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#5B5CE2] to-[#8B5CF6] text-white text-xs md:text-sm font-semibold shadow-md shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন নোট তৈরি করুন</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#77839B] dark:text-[#A7B5CC]" />
          <input
            type="text"
            placeholder="নোটের শিরোনাম, ট্যাগ বা বিষয়বস্তু দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs md:text-sm rounded-xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] text-[#17233F] dark:text-[#F1F5FF]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              onlyFavorites
                ? 'bg-amber-500 text-white border-amber-500'
                : 'bg-white dark:bg-[#0D1B32] text-[#77839B] border-[#E6EAF2] dark:border-[#243754]'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-white' : ''}`} />
            <span>ফেভারিট</span>
          </button>

          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] text-[#17233F] dark:text-[#F1F5FF]"
          >
            <option value="all">সব বিষয়</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNotes.map((note) => {
          const sub = note.subjectId ? subjectMap.get(note.subjectId) : null;
          return (
            <div
              key={note.id}
              className="p-5 rounded-3xl bg-white dark:bg-[#0D1B32] border border-[#E6EAF2] dark:border-[#243754] shadow-xs flex flex-col justify-between space-y-3 hover:border-indigo-200 dark:hover:border-indigo-900/60 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-sm md:text-base text-[#17233F] dark:text-[#F1F5FF] line-clamp-1">
                    {note.title}
                  </h3>
                  <button
                    onClick={() => toggleFavorite(note)}
                    className="p-1 rounded-lg text-amber-400 hover:scale-110 transition-transform"
                    aria-label="ফেভারিট টগল"
                  >
                    <Star
                      className={`w-4 h-4 ${note.isFavorite ? 'fill-amber-400' : 'text-[#77839B]'}`}
                    />
                  </button>
                </div>

                {sub && (
                  <span
                    className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md text-white mb-2"
                    style={{ backgroundColor: sub.color }}
                  >
                    {sub.name}
                  </span>
                )}

                <p className="text-xs text-[#77839B] dark:text-[#A7B5CC] whitespace-pre-line line-clamp-5 leading-relaxed">
                  {note.content}
                </p>

                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {note.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-[#F5F7FC] dark:bg-[#122440] text-[#77839B] dark:text-[#A7B5CC] font-semibold"
                      >
                        <Tag className="w-2.5 h-2.5" />
                        <span>{t}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#E6EAF2] dark:border-[#243754] text-[11px] text-[#77839B] dark:text-[#A7B5CC]">
                <span>{formatBengaliDate(note.updatedAt)}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(note)}
                    className="p-1.5 rounded-lg text-[#77839B] hover:text-[#5B5CE2] hover:bg-[#F5F7FC] dark:hover:bg-[#122440]"
                    aria-label="সম্পাদনা"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="p-1.5 rounded-lg text-[#77839B] hover:text-rose-500 hover:bg-[#F5F7FC] dark:hover:bg-[#122440]"
                    aria-label="মুছুন"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-[#0D1B32] rounded-3xl border border-[#E6EAF2] dark:border-[#243754] shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6EAF2] dark:border-[#243754]">
              <h3 className="font-bold text-base text-[#17233F] dark:text-[#F1F5FF]">
                {editingNoteId ? 'নোট সম্পাদনা করুন' : 'নতুন রিভিশন নোট তৈরি'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-[#77839B] hover:text-[#17233F] dark:hover:text-[#F1F5FF]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="mt-4 space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-600 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#17233F] dark:text-[#F1F5FF] mb-1">
                  নোটের শিরোনাম <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="যেমন: সমাস চেনার সহজ নিয়ম"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl bg-[#F5F7FC] dark:bg-[#122440] border border-[#E6EAF2] dark:border-[#243754] text-[#17233F] dark:text-[#F1F5FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17233F] dark:text-[#F1F5FF] mb-1">
                  বিষয়
                </label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl bg-[#F5F7FC] dark:bg-[#122440] border border-[#E6EAF2] dark:border-[#243754] text-[#17233F] dark:text-[#F1F5FF]"
                >
                  <option value="">সাধারণ নোট (কোনো নির্দিষ্ট বিষয় নয়)</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17233F] dark:text-[#F1F5FF] mb-1">
                  বিস্তারিত বিষয়বস্তু <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="নোটের গুরুত্বপূর্ণ পয়েন্টগুলো লিখুন..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl bg-[#F5F7FC] dark:bg-[#122440] border border-[#E6EAF2] dark:border-[#243754] text-[#17233F] dark:text-[#F1F5FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17233F] dark:text-[#F1F5FF] mb-1">
                  ট্যাগসমূহ (কমা দিয়ে আলাদা করুন)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: সমাস, ব্যাকরণ, শর্টকাট"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
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
                  {editingNoteId ? 'সংরক্ষণ করুন' : 'তৈরি করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
