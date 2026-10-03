import React, { useEffect, useState } from 'react';
import {
  CheckSquare,
  PlusCircle,
  Calendar,
  Clock,
  Trash2,
  Edit2,
  CheckCircle2,
  Circle,
  AlertCircle,
  Loader2,
  Filter
} from 'lucide-react';
import { api } from '../services/api';
import { Task, Subject } from '../types';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';

export const TasksPage: React.FC = () => {
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filter, setFilter] = useState<'All' | 'Todo' | 'In Progress' | 'Completed' | 'High Priority'>('All');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    subjectId: '',
    title: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'Medium' as 'Low' | 'Medium' | 'High',
    status: 'Todo' as 'Todo' | 'In Progress' | 'Completed',
    estimatedTime: 60
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [taskRes, subRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/subjects')
      ]);
      setTasks(taskRes.data);
      setSubjects(subRes.data);
      if (subRes.data.length > 0 && !formData.subjectId) {
        setFormData(prev => ({ ...prev, subjectId: subRes.data[0]._id }));
      }
    } catch (err: any) {
      showToast('Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingTask(null);
    setFormData({
      subjectId: subjects[0]?._id || '',
      title: '',
      description: '',
      dueDate: new Date().toISOString().split('T')[0],
      priority: 'Medium',
      status: 'Todo',
      estimatedTime: 60
    });
    setIsModalOpen(true);
  };

  const openEditModal = (t: Task) => {
    setEditingTask(t);
    const dStr = String(t.dueDate).split('T')[0];
    setFormData({
      subjectId: t.subjectId || '',
      title: t.title,
      description: t.description || '',
      dueDate: dStr,
      priority: t.priority,
      status: t.status,
      estimatedTime: t.estimatedTime || 60
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Task title is required', 'warning');
      return;
    }

    setSaving(true);
    try {
      if (editingTask) {
        const res = await api.put(`/tasks/${editingTask._id}`, formData);
        setTasks(prev => prev.map(t => (t._id === editingTask._id ? res.data : t)));
        showToast('Task updated successfully', 'success');
      } else {
        const res = await api.post('/tasks', formData);
        setTasks(prev => [res.data, ...prev]);
        showToast('Task created successfully', 'success');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      showToast('Failed to save task', 'error');
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (task: Task, nextStatus: 'Todo' | 'In Progress' | 'Completed') => {
    try {
      const res = await api.put(`/tasks/${task._id}`, { status: nextStatus });
      setTasks(prev => prev.map(t => (t._id === task._id ? res.data : t)));
      showToast(`Task marked as ${nextStatus}`, 'success');
    } catch (err: any) {
      showToast('Failed to update task status', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await api.delete(`/tasks/${id}`);
      setTasks(prev => prev.filter(t => t._id !== id));
      showToast('Task deleted successfully', 'info');
    } catch (err: any) {
      showToast('Failed to delete task', 'error');
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    if (filter === 'All') return true;
    if (filter === 'High Priority') return t.priority === 'High';
    return t.status === filter;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-xs text-neutral-500 font-medium">Loading assignments & tasks...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
            <span>Assignment & Task Manager</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
            Track problem sets, lab reports, project milestones, and assignment deadlines.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Filter Tabs (Section 15) */}
      <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-x-auto shadow-xs">
        {(['All', 'Todo', 'In Progress', 'Completed', 'High Priority'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              filter === tab
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Task Cards Grid (Section 15) */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-8 shadow-xs">
          <CheckSquare className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-3" />
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">No Tasks In This View</h3>
          <p className="mt-1 text-xs sm:text-sm text-neutral-500 max-w-sm mx-auto">
            You are all caught up! Add a new homework problem set or assignment to stay ahead.
          </p>
          <button
            onClick={openCreateModal}
            className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl"
          >
            Create New Task
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTasks.map(task => {
            const dueDateFormatted = new Date(task.dueDate).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric'
            });

            return (
              <div
                key={task._id}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all hover:border-neutral-300 dark:hover:border-neutral-700"
              >
                <div>
                  {/* Top Bar: Subject Name & Priority */}
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-neutral-600 dark:text-neutral-400">
                      Subject: <span className="text-neutral-900 dark:text-white font-bold">{task.subjectName || 'General'}</span>
                    </span>
                    <span
                      className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md ${
                        task.priority === 'High'
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                          : task.priority === 'Medium'
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      {task.priority} Priority
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className={`text-sm sm:text-base font-bold text-neutral-900 dark:text-white leading-snug ${task.status === 'Completed' ? 'line-through text-neutral-400 dark:text-neutral-500' : ''}`}>
                    {task.title}
                  </h3>

                  {task.description && (
                    <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  {/* Metadata: Due Date & Estimated Time (Section 15) */}
                  <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Due: <strong className="text-neutral-800 dark:text-neutral-200">{dueDateFormatted}</strong></span>
                    </div>

                    <div className="flex items-center gap-1.5 font-mono">
                      <Clock className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Est: {task.estimatedTime || 60}m</span>
                    </div>
                  </div>
                </div>

                {/* Footer Controls: Status Select & Actions (Section 15) */}
                <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-2">
                  <select
                    value={task.status}
                    onChange={e => updateStatus(task, e.target.value as any)}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
                      task.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                        : task.status === 'In Progress'
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800'
                        : 'bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700'
                    }`}
                  >
                    <option value="Todo">Todo</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(task)}
                      className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                      title="Edit task"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(task._id)}
                      className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? 'Edit Task' : 'Add New Task / Assignment'}
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
              Task Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Complete Algebra Assignment #4"
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs sm:text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
              Description / Questions to solve
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Question numbers, submission portal link, or key criteria"
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs sm:text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                Due Date
              </label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs sm:text-sm text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                Estimated Time (mins)
              </label>
              <input
                type="number"
                min="15"
                step="15"
                value={formData.estimatedTime}
                onChange={e => setFormData({ ...formData, estimatedTime: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs sm:text-sm text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs sm:text-sm text-neutral-900 dark:text-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs sm:text-sm text-neutral-900 dark:text-white"
              >
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
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
              {saving ? 'Saving...' : editingTask ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
