import React, { useEffect, useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  CheckCircle,
  Circle,
  Clock,
  Trash2,
  Loader2
} from 'lucide-react';
import { api } from '../services/api';
import { StudySession, Subject } from '../types';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';

export const CalendarPage: React.FC = () => {
  const { showToast } = useToast();
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Calendar date cursor
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  // Selected date for viewing / adding sessions
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    subjectId: '',
    title: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00 AM',
    endTime: '11:00 AM',
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
      showToast('Failed to load calendar events', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const navigateTime = (direction: 'prev' | 'next') => {
    const delta = direction === 'next' ? 1 : -1;
    const next = new Date(currentDate);
    if (viewMode === 'week') {
      next.setDate(next.getDate() + delta * 7);
    } else {
      next.setMonth(next.getMonth() + delta);
    }
    setCurrentDate(next);
  };

  const toggleComplete = async (session: StudySession) => {
    try {
      const nextStatus = !session.completed;
      await api.put(`/study-sessions/${session._id}`, { completed: nextStatus });
      setSessions(prev =>
        prev.map(s => (s._id === session._id ? { ...s, completed: nextStatus } : s))
      );
      showToast(nextStatus ? 'Session completed!' : 'Marked incomplete', 'success');
    } catch (err: any) {
      showToast('Could not update status', 'error');
    }
  };

  const deleteSession = async (id: string) => {
    try {
      await api.delete(`/study-sessions/${id}`);
      setSessions(prev => prev.filter(s => s._id !== id));
      showToast('Session deleted', 'info');
    } catch (err: any) {
      showToast('Failed to delete session', 'error');
    }
  };

  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subjectId || !formData.title) {
      showToast('Subject and title are required', 'warning');
      return;
    }

    setSaving(true);
    try {
      await api.post('/study-sessions', formData);
      showToast('Session added to schedule', 'success');
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      showToast('Failed to add session', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Generate 7 days for weekly view
  const getDaysForWeek = () => {
    const start = new Date(currentDate);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    start.setDate(diff);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      weekDays.push(d);
    }
    return weekDays;
  };

  const weekDays = getDaysForWeek();
  const selectedDaySessions = sessions.filter(s => {
    const sDate = String(s.date).split('T')[0];
    return sDate === selectedDateStr;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-xs text-neutral-500 font-medium">Loading study calendar...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
            <span>Academic Calendar</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
            View scheduled blocks by date, inspect daily agendas, and reschedule study commitments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setFormData(prev => ({ ...prev, date: selectedDateStr }));
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Session</span>
          </button>
        </div>
      </div>

      {/* Calendar Controls Bar */}
      <div className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigateTime('prev')}
              className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Previous week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigateTime('next')}
              className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Next week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white">
            {currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </h2>
        </div>

        <button
          onClick={() => {
            const today = new Date();
            setCurrentDate(today);
            setSelectedDateStr(today.toISOString().split('T')[0]);
          }}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors"
        >
          Today
        </button>
      </div>

      {/* Week Days Strip (Section 14) */}
      <div className="grid grid-cols-7 gap-2 overflow-x-auto pb-1">
        {weekDays.map(d => {
          const dateStr = d.toISOString().split('T')[0];
          const isSelected = selectedDateStr === dateStr;
          const isToday = new Date().toISOString().split('T')[0] === dateStr;

          // Count sessions for this day
          const dayCount = sessions.filter(s => {
            const sDate = String(s.date).split('T')[0];
            return sDate === dateStr;
          }).length;

          return (
            <div
              key={dateStr}
              onClick={() => setSelectedDateStr(dateStr)}
              className={`p-3 rounded-2xl border text-center cursor-pointer transition-all min-w-[70px] ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 shadow-xs'
                  : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                {d.toLocaleDateString(undefined, { weekday: 'short' })}
              </div>
              <div
                className={`mt-1 text-base sm:text-lg font-bold font-mono ${
                  isToday
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : isSelected
                    ? 'text-neutral-900 dark:text-white'
                    : 'text-neutral-700 dark:text-neutral-300'
                }`}
              >
                {d.getDate()}
              </div>
              <div className="mt-1 flex items-center justify-center">
                {dayCount > 0 ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                ) : (
                  <span className="w-1.5 h-1.5" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sessions on Selected Date */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Scheduled Blocks for {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </h3>
          </div>
          <span className="text-xs font-mono text-neutral-500">
            {selectedDaySessions.length} sessions
          </span>
        </div>

        {selectedDaySessions.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xs">
            <Clock className="w-10 h-10 text-neutral-300 dark:text-neutral-700 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-neutral-900 dark:text-white">No Sessions Scheduled</h4>
            <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
              Add a study block or review session for this date to keep your pace.
            </p>
            <button
              onClick={() => {
                setFormData(prev => ({ ...prev, date: selectedDateStr }));
                setIsModalOpen(true);
              }}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl"
            >
              Add Session for This Day
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl divide-y divide-neutral-100 dark:divide-neutral-800/80 shadow-xs overflow-hidden">
            {selectedDaySessions.map(session => (
              <div
                key={session._id}
                className={`p-4 flex items-center justify-between gap-4 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors ${
                  session.completed ? 'bg-neutral-50/70 dark:bg-neutral-900/30' : ''
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    onClick={() => toggleComplete(session)}
                    className="mt-0.5 text-neutral-400 hover:text-indigo-600 transition-colors shrink-0"
                  >
                    {session.completed ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs">
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
                      <span className="font-mono text-neutral-500">{session.duration} mins</span>
                      <span className="text-neutral-400">·</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-medium">{session.type}</span>
                    </div>

                    <div className={`mt-1 text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-200 ${session.completed ? 'line-through text-neutral-400' : ''}`}>
                      {session.title}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => deleteSession(session._id)}
                  className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg transition-colors"
                  title="Delete session"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Session Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule New Study Session"
      >
        <form onSubmit={handleAddSession} className="space-y-4">
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
              placeholder="e.g. Physics: Electromagnetic Induction Numerical Drill"
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
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs sm:text-sm text-neutral-900 dark:text-white"
              />
            </div>
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
              {saving ? 'Scheduling...' : 'Add Session'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
