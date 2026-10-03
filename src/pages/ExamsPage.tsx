import React, { useEffect, useState } from 'react';
import {
  Award,
  PlusCircle,
  Calendar,
  Clock,
  Trash2,
  Edit2,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';
import { Exam, Subject } from '../types';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';

export const ExamsPage: React.FC = () => {
  const { showToast } = useToast();
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Live timer tick
  const [tick, setTick] = useState(0);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    subjectId: '',
    examName: '',
    examDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    preparationPercentage: 50,
    notes: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [examRes, subRes] = await Promise.all([
        api.get('/exams'),
        api.get('/subjects')
      ]);
      setExams(examRes.data);
      setSubjects(subRes.data);
      if (subRes.data.length > 0 && !formData.subjectId) {
        setFormData(prev => ({ ...prev, subjectId: subRes.data[0]._id }));
      }
    } catch (err: any) {
      showToast('Failed to load examination schedule', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update countdown every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTick(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const openCreateModal = () => {
    setEditingExam(null);
    setFormData({
      subjectId: subjects[0]?._id || '',
      examName: '',
      examDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      preparationPercentage: 50,
      notes: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (e: Exam) => {
    setEditingExam(e);
    const dStr = String(e.examDate).split('T')[0];
    setFormData({
      subjectId: e.subjectId,
      examName: e.examName,
      examDate: dStr,
      preparationPercentage: e.preparationPercentage || 0,
      notes: e.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.examName.trim() || !formData.subjectId) {
      showToast('Subject and exam name are required', 'warning');
      return;
    }

    setSaving(true);
    try {
      if (editingExam) {
        const res = await api.put(`/exams/${editingExam._id}`, formData);
        setExams(prev => prev.map(x => (x._id === editingExam._id ? res.data : x)));
        showToast('Exam schedule updated', 'success');
      } else {
        const res = await api.post('/exams', formData);
        setExams(prev => [...prev, res.data]);
        showToast('Exam added to tracker', 'success');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      showToast('Failed to save exam', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete exam "${name}"?`)) return;

    try {
      await api.delete(`/exams/${id}`);
      setExams(prev => prev.filter(x => x._id !== id));
      showToast('Exam deleted', 'info');
    } catch (err: any) {
      showToast('Failed to delete exam', 'error');
    }
  };

  // Helper to compute live countdown
  const getLiveCountdown = (examDateStr: string) => {
    const target = new Date(examDateStr).getTime();
    const now = Date.now();
    const diff = Math.max(0, target - now);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, isPassed: diff === 0 };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-xs text-neutral-500 font-medium">Loading exam schedules...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
            <span>Exam Countdown & Readiness</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
            Monitor target exam dates with real-time countdown clocks, readiness indicators, and revision notes.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Exam</span>
        </button>
      </div>

      {/* Exam Countdown Cards Grid (Section 16) */}
      {exams.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-8 shadow-xs">
          <Award className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-3" />
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">No Upcoming Exams</h3>
          <p className="mt-1 text-xs sm:text-sm text-neutral-500 max-w-sm mx-auto">
            Add your midterms, semester finals, or lab vivas to start the countdown.
          </p>
          <button
            onClick={openCreateModal}
            className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl"
          >
            Add First Exam
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map(exam => {
            const countdown = getLiveCountdown(exam.examDate);
            const dateFormatted = new Date(exam.examDate).toLocaleDateString(undefined, {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            });

            const prep = exam.preparationPercentage || 0;

            return (
              <div
                key={exam._id}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between transition-all hover:border-neutral-300 dark:hover:border-neutral-700"
              >
                <div>
                  {/* Top Bar: Subject name & action buttons */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        {exam.subjectName || 'Course'}
                      </span>
                      <h2 className="text-lg font-bold text-neutral-900 dark:text-white mt-0.5 leading-snug">
                        {exam.examName}
                      </h2>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => openEditModal(exam)}
                        className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                        title="Edit exam"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(exam._id, exam.examName)}
                        className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                        title="Delete exam"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-1 text-xs text-neutral-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{dateFormatted}</span>
                  </div>

                  {/* Section 16 Big Live Countdown Grid */}
                  <div className="mt-5 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/60">
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div>
                        <div className="text-2xl font-extrabold font-mono text-neutral-900 dark:text-white tabular-nums">
                          {String(countdown.days).padStart(2, '0')}
                        </div>
                        <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mt-0.5 font-mono">
                          DAYS
                        </div>
                      </div>

                      <div>
                        <div className="text-2xl font-extrabold font-mono text-neutral-900 dark:text-white tabular-nums">
                          {String(countdown.hours).padStart(2, '0')}
                        </div>
                        <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mt-0.5 font-mono">
                          HOURS
                        </div>
                      </div>

                      <div>
                        <div className="text-2xl font-extrabold font-mono text-neutral-900 dark:text-white tabular-nums">
                          {String(countdown.minutes).padStart(2, '0')}
                        </div>
                        <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mt-0.5 font-mono">
                          MINS
                        </div>
                      </div>

                      <div>
                        <div className="text-2xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400 tabular-nums">
                          {String(countdown.seconds).padStart(2, '0')}
                        </div>
                        <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mt-0.5 font-mono">
                          SECS
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 16 Preparation Progress */}
                  <div className="mt-5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                        Preparation Progress
                      </span>
                      <span className="font-mono font-bold text-neutral-900 dark:text-white tabular-nums">
                        {prep}%
                      </span>
                    </div>

                    <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${prep}%` }}
                      />
                    </div>
                  </div>

                  {/* Notes / Syllabus Focus */}
                  {exam.notes && (
                    <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">Focus Note:</span>{' '}
                      {exam.notes}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExam ? 'Edit Exam' : 'Add Examination'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
              Subject
            </label>
            <select
              value={formData.subjectId}
              onChange={e => setFormData({ ...formData, subjectId: e.target.value })}
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs sm:text-sm text-neutral-900 dark:text-white"
            >
              {subjects.map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
              Exam Name
            </label>
            <input
              type="text"
              required
              value={formData.examName}
              onChange={e => setFormData({ ...formData, examName: e.target.value })}
              placeholder="e.g. Mathematics Final Exam"
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs sm:text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                Exam Date
              </label>
              <input
                type="date"
                required
                value={formData.examDate}
                onChange={e => setFormData({ ...formData, examDate: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs sm:text-sm text-neutral-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                Readiness (%): {formData.preparationPercentage}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={formData.preparationPercentage}
                onChange={e => setFormData({ ...formData, preparationPercentage: Number(e.target.value) })}
                className="w-full accent-indigo-600 mt-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
              Revision Notes / Key Formulas
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Focus on Double Integrals, Eigenvectors, and Differential Equations"
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs sm:text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingExam ? 'Update Exam' : 'Schedule Exam'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
