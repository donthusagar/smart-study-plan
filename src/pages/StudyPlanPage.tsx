import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  PlusCircle,
  Sparkles,
  CheckCircle,
  Circle,
  Trash2,
  Filter,
  Clock,
  BookOpen,
  Loader2,
  Calendar
} from 'lucide-react';
import { api } from '../services/api';
import { StudySession, Subject } from '../types';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';

export const StudyPlanPage: React.FC = () => {
  const { showToast } = useToast();
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');

  // Modal for new manual session
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savingSession, setSavingSession] = useState(false);
  const [formData, setFormData] = useState({
    subjectId: '',
    title: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    duration: 60,
    type: 'Study',
    priority: 'Medium'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sessRes, subRes] = await Promise.all([
        api.get('/study-sessions'),
        api.get('/subjects')
      ]);
      setSessions(sessRes.data);
      setSubjects(subRes.data);
      if (subRes.data.length > 0 && !formData.subjectId) {
        setFormData(prev => ({ ...prev, subjectId: subRes.data[0]._id }));
      }
    } catch (err: any) {
      showToast('Failed to load study plan', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleComplete = async (session: StudySession) => {
    try {
      const updatedStatus = !session.completed;
      await api.put(`/study-sessions/${session._id}`, { completed: updatedStatus });
      setSessions(prev =>
        prev.map(s => (s._id === session._id ? { ...s, completed: updatedStatus } : s))
      );
      showToast(updatedStatus ? 'Session completed! 🎯' : 'Marked incomplete', 'success');
    } catch (err: any) {
      showToast('Could not update session', 'error');
    }
  };

  const deleteSession = async (id: string) => {
    try {
      await api.delete(`/study-sessions/${id}`);
      setSessions(prev => prev.filter(s => s._id !== id));
      showToast('Session removed from timetable', 'info');
    } catch (err: any) {
      showToast('Failed to delete session', 'error');
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subjectId || !formData.title) {
      showToast('Please enter subject and title', 'warning');
      return;
    }

    setSavingSession(true);
    try {
      await api.post('/study-sessions', formData);
      showToast('Custom session added to study plan', 'success');
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      showToast('Failed to create session', 'error');
    } finally {
      setSavingSession(false);
    }
  };

  // Filtered list
  const filteredSessions = sessions.filter(s => {
    if (selectedSubject !== 'All' && s.subjectId !== selectedSubject) return false;
    if (selectedType !== 'All' && s.type !== selectedType) return false;
    return true;
  });

  // Group sessions by date
  const groupedByDate: { [key: string]: StudySession[] } = {};
  filteredSessions.forEach(s => {
    const dStr = String(s.date).split('T')[0];
    if (!groupedByDate[dStr]) {
      groupedByDate[dStr] = [];
    }
    groupedByDate[dStr].push(s);
  });

  const sortedDates = Object.keys(groupedByDate).sort();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-xs text-neutral-500 font-medium">Loading study plan...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
            <span>Study Plan & Timetable</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
            Your structured learning schedule. Track progress, mark completed blocks, and maintain focus velocity.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 transition-colors shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Block</span>
          </button>
          <Link
            to="/create-plan"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-sm shadow-indigo-600/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>Regenerate Plan</span>
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-neutral-500" />
          <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Filters:</span>

          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value)}
            className="px-2.5 py-1 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="All">All Subjects</option>
            {subjects.map(s => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="px-2.5 py-1 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="All">All Activity Types</option>
            <option value="Study">Study (Concept)</option>
            <option value="Practice">Practice</option>
            <option value="Revision">Revision</option>
            <option value="Mock Test">Mock Test</option>
            <option value="Break">Break</option>
          </select>
        </div>

        <div className="text-xs text-neutral-500 font-mono">
          Showing {filteredSessions.length} total sessions
        </div>
      </div>

      {/* Timetable grouped by Day */}
      {sortedDates.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-8 shadow-xs">
          <CalendarDays className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-3" />
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">No Study Sessions Scheduled</h3>
          <p className="mt-1 text-xs sm:text-sm text-neutral-500 max-w-sm mx-auto">
            Generate an optimized smart study plan or add a manual session block to get started.
          </p>
          <Link
            to="/create-plan"
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Smart Plan</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map(dateKey => {
            const daySessions = groupedByDate[dateKey];
            const dateObj = new Date(dateKey + 'T00:00:00');
            const dayName = dateObj.toLocaleDateString(undefined, { weekday: 'long' });
            const formattedDate = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
            const isToday = new Date().toISOString().split('T')[0] === dateKey;

            return (
              <div key={dateKey} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className={`text-xs sm:text-sm font-bold ${isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-neutral-900 dark:text-white'}`}>
                    {dayName}, {formattedDate}
                  </span>
                  {isToday && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold">
                      Today
                    </span>
                  )}
                </div>

                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl divide-y divide-neutral-100 dark:divide-neutral-800/80 shadow-xs overflow-hidden">
                  {daySessions.map(session => (
                    <div
                      key={session._id}
                      className={`p-4 flex items-center justify-between gap-4 transition-colors hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 ${
                        session.completed ? 'bg-neutral-50/70 dark:bg-neutral-900/30' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        {/* Completion button */}
                        <button
                          onClick={() => toggleComplete(session)}
                          className="mt-0.5 text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0"
                        >
                          {session.completed ? (
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </button>

                        {/* Details */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap text-xs">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: session.subjectColor || '#6366f1' }}
                            />
                            <span className="font-bold text-neutral-900 dark:text-white">
                              {session.subjectName || 'Study'}
                            </span>
                            <span className="text-neutral-400">·</span>
                            <span className="font-mono text-neutral-500">
                              {session.startTime} - {session.endTime}
                            </span>
                            <span className="text-neutral-400">·</span>
                            <span className="font-mono text-neutral-500">
                              {session.duration} mins
                            </span>
                            <span className="text-neutral-400">·</span>
                            <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                              {session.type}
                            </span>
                          </div>

                          <div className={`mt-1 text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-200 ${session.completed ? 'line-through text-neutral-400 dark:text-neutral-500' : ''}`}>
                            {session.title}
                          </div>

                          {session.topicName && (
                            <div className="text-xs text-neutral-500 mt-0.5">
                              Topic: {session.topicName}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Delete action */}
                      <button
                        onClick={() => deleteSession(session._id)}
                        className="p-1.5 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                        title="Delete session"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Manual Add Session Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Custom Study Session"
      >
        <form onSubmit={handleCreateSession} className="space-y-4">
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
              Session Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Calculus: Integration by Parts"
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs sm:text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs sm:text-sm text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                Duration (mins)
              </label>
              <input
                type="number"
                min="15"
                step="15"
                value={formData.duration}
                onChange={e => setFormData({ ...formData, duration: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs sm:text-sm text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                Start Time
              </label>
              <input
                type="text"
                value={formData.startTime}
                onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                placeholder="09:00 AM"
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs sm:text-sm text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                End Time
              </label>
              <input
                type="text"
                value={formData.endTime}
                onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                placeholder="10:00 AM"
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs sm:text-sm text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
              Activity Type
            </label>
            <select
              value={formData.type}
              onChange={e => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs sm:text-sm text-neutral-900 dark:text-white"
            >
              <option value="Study">Study</option>
              <option value="Revision">Revision</option>
              <option value="Practice">Practice</option>
              <option value="Mock Test">Mock Test</option>
              <option value="Break">Break</option>
            </select>
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
              disabled={savingSession}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-50"
            >
              {savingSession ? 'Saving...' : 'Add Session'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
