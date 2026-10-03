import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  PlusCircle,
  CheckCircle2,
  Circle,
  Trash2,
  Edit2,
  BookOpen,
  Loader2,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { Subject, Topic } from '../types';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';

export const SubjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [subject, setSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Topic Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [saving, setSaving] = useState(false);
  const [topicName, setTopicName] = useState('');
  const [topicDifficulty, setTopicDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [topicDesc, setTopicDesc] = useState('');

  const fetchSubject = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/subjects/${id}`);
      setSubject(res.data);
      setTopics(res.data.topics || []);
    } catch (err: any) {
      showToast('Failed to load subject details', 'error');
      navigate('/subjects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchSubject();
    }
  }, [id]);

  const toggleTopicCompleted = async (topic: Topic) => {
    try {
      const updatedStatus = !topic.completed;
      await api.put(`/topics/${topic._id}`, { completed: updatedStatus });

      setTopics(prev => {
        const next = prev.map(t => (t._id === topic._id ? { ...t, completed: updatedStatus } : t));
        return next;
      });

      // Recalculate local subject progress
      setSubject(prev => {
        if (!prev) return null;
        const total = topics.length;
        const completedCount = topics.filter(t => (t._id === topic._id ? updatedStatus : t.completed)).length;
        const newProgress = total > 0 ? Math.round((completedCount / total) * 100) : 0;
        return {
          ...prev,
          completedTopics: completedCount,
          progress: newProgress
        };
      });

      showToast(updatedStatus ? `Completed topic: "${topic.name}"!` : 'Topic marked incomplete', 'success');
    } catch (err: any) {
      showToast('Could not update topic status', 'error');
    }
  };

  const handleSaveTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicName.trim() || !id) {
      showToast('Topic name is required', 'warning');
      return;
    }

    setSaving(true);
    try {
      if (editingTopic) {
        const res = await api.put(`/topics/${editingTopic._id}`, {
          name: topicName.trim(),
          description: topicDesc,
          difficulty: topicDifficulty
        });
        setTopics(prev => prev.map(t => (t._id === editingTopic._id ? res.data : t)));
        showToast('Topic updated', 'success');
      } else {
        const res = await api.post('/topics', {
          subjectId: id,
          name: topicName.trim(),
          description: topicDesc,
          difficulty: topicDifficulty,
          completed: false
        });
        setTopics(prev => [...prev, res.data]);
        showToast('Topic added to syllabus', 'success');
      }

      setIsModalOpen(false);
      setEditingTopic(null);
      setTopicName('');
      setTopicDesc('');
    } catch (err: any) {
      showToast('Failed to save topic', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTopic = async (topicId: string, name: string) => {
    if (!confirm(`Delete topic "${name}"?`)) return;

    try {
      await api.delete(`/topics/${topicId}`);
      setTopics(prev => prev.filter(t => t._id !== topicId));
      showToast('Topic deleted', 'info');
    } catch (err: any) {
      showToast('Failed to delete topic', 'error');
    }
  };

  const openAddModal = () => {
    setEditingTopic(null);
    setTopicName('');
    setTopicDesc('');
    setTopicDifficulty('Medium');
    setIsModalOpen(true);
  };

  const openEditModal = (t: Topic) => {
    setEditingTopic(t);
    setTopicName(t.name);
    setTopicDesc(t.description || '');
    setTopicDifficulty(t.difficulty);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-xs text-neutral-500 font-medium">Loading syllabus topics...</p>
      </div>
    );
  }

  if (!subject) return null;

  const total = topics.length;
  const completedCount = topics.filter(t => t.completed).length;
  const progressPercent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button & Breadcrumb */}
      <div>
        <Link
          to="/subjects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Subjects</span>
        </Link>
      </div>

      {/* Subject Header Banner */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className="w-4 h-4 rounded-full shrink-0"
              style={{ backgroundColor: subject.color || '#4f46e5' }}
            />
            <div>
              <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white">
                {subject.name}
              </h1>
              <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
                <span>{subject.difficulty} Difficulty</span>
                <span>·</span>
                <span>{subject.priority} Priority</span>
              </div>
            </div>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Topic</span>
          </button>
        </div>

        {subject.description && (
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed border-t border-neutral-100 dark:border-neutral-800 pt-3">
            {subject.description}
          </p>
        )}

        {/* Progress Bar & Counter (Section 11) */}
        <div className="pt-2 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-neutral-700 dark:text-neutral-300">
              Syllabus Completion
            </span>
            <span className="font-mono font-bold text-neutral-900 dark:text-white tabular-nums">
              {completedCount} / {total} Topics ({progressPercent}%)
            </span>
          </div>

          <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: subject.color || '#4f46e5'
              }}
            />
          </div>
        </div>
      </div>

      {/* Topic Management Checklist (Section 11) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">
            Course Topics & Syllabus Checklist
          </h2>
          <span className="text-xs text-neutral-500 font-mono">
            {completedCount} Completed
          </span>
        </div>

        {topics.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
            <BookOpen className="w-10 h-10 text-neutral-300 dark:text-neutral-700 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">No Topics Added Yet</h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
              Break down this course into modules or chapter topics to track your understanding.
            </p>
            <button
              onClick={openAddModal}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl"
            >
              Add First Topic
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl divide-y divide-neutral-100 dark:divide-neutral-800/80 shadow-xs overflow-hidden">
            {topics.map(topic => (
              <div
                key={topic._id}
                className={`p-4 flex items-center justify-between gap-4 transition-colors hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 ${
                  topic.completed ? 'bg-neutral-50/50 dark:bg-neutral-900/30' : ''
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  {/* Topic Checkbox */}
                  <button
                    onClick={() => toggleTopicCompleted(topic)}
                    className="mt-0.5 text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0"
                    aria-label={topic.completed ? 'Mark incomplete' : 'Mark completed'}
                  >
                    {topic.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs sm:text-sm font-semibold ${topic.completed ? 'line-through text-neutral-400 dark:text-neutral-500' : 'text-neutral-900 dark:text-white'}`}>
                        {topic.name}
                      </span>
                      <span className="text-[11px] font-mono text-neutral-400">
                        ({topic.difficulty})
                      </span>
                    </div>

                    {topic.description && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                        {topic.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Edit & Delete Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEditModal(topic)}
                    className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteTopic(topic._id, topic.name)}
                    className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Topic Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTopic ? 'Edit Topic' : 'Add New Topic'}
      >
        <form onSubmit={handleSaveTopic} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
              Topic Name
            </label>
            <input
              type="text"
              required
              value={topicName}
              onChange={e => setTopicName(e.target.value)}
              placeholder="e.g. Calculus: Limits & Continuity"
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs sm:text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
              Difficulty
            </label>
            <select
              value={topicDifficulty}
              onChange={e => setTopicDifficulty(e.target.value as any)}
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs sm:text-sm text-neutral-900 dark:text-white"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
              Notes / Subtopics
            </label>
            <textarea
              rows={2}
              value={topicDesc}
              onChange={e => setTopicDesc(e.target.value)}
              placeholder="Key formulas, proofs, or textbook references"
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
              {saving ? 'Saving...' : editingTopic ? 'Update Topic' : 'Add Topic'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
