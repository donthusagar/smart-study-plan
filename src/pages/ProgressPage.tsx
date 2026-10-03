import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Flame,
  Clock,
  CheckCircle2,
  BookOpen,
  Calendar,
  TrendingUp,
  Loader2,
  PieChart as PieIcon
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { api } from '../services/api';
import { ProgressData } from '../types';
import { useToast } from '../context/ToastContext';

export const ProgressPage: React.FC = () => {
  const { showToast } = useToast();
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProgress() {
      try {
        setLoading(true);
        const res = await api.get('/progress');
        setData(res.data);
      } catch (err: any) {
        showToast('Failed to load progress analytics', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadProgress();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-xs text-neutral-500 font-medium">Computing academic metrics and charts...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs uppercase tracking-wider">
          <BarChart3 className="w-4 h-4" />
          <span>Academic Velocity & Metrics</span>
        </div>
        <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
          Progress & Study Analytics
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
          In-depth insights into your study habits, syllabus mastery, focus time distribution, and task velocity.
        </p>
      </div>

      {/* Summary Stat Grid (Section 17) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Study Hours */}
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
            Total Study Hours
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-extrabold font-mono text-neutral-900 dark:text-white tabular-nums">
            {data.totalStudyHours}h
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Optimal velocity</span>
          </div>
        </div>

        {/* Average Daily Hours */}
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
            Avg Daily Hours
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-extrabold font-mono text-neutral-900 dark:text-white tabular-nums">
            {data.averageDailyHours}h
          </div>
          <div className="mt-1 text-[11px] text-neutral-500 font-mono">
            Past 14 days
          </div>
        </div>

        {/* Tasks Completed */}
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
            Tasks Completed
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-extrabold font-mono text-neutral-900 dark:text-white tabular-nums">
            {data.tasksCompleted} / {data.totalTasks}
          </div>
          <div className="mt-1 text-[11px] text-neutral-500 font-mono">
            {data.taskCompletionRate}% rate
          </div>
        </div>

        {/* Topics Completed */}
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
            Topics Mastered
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-extrabold font-mono text-neutral-900 dark:text-white tabular-nums">
            {data.topicsCompleted} / {data.totalTopics}
          </div>
          <div className="mt-1 text-[11px] text-neutral-500 font-mono">
            {data.topicCompletionRate}% syllabus
          </div>
        </div>

        {/* Study Streak */}
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs col-span-2 sm:col-span-1">
          <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Study Streak</span>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-extrabold font-mono text-neutral-900 dark:text-white tabular-nums">
            {data.currentStreak} Days
          </div>
          <div className="mt-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            Best: {data.longestStreak} days
          </div>
        </div>
      </div>

      {/* Chart Row 1: Weekly Study Hours Bar Chart & Subject Distribution Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Study Hours Bar Chart (Section 17) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white">
              Weekly Study Hours by Activity Type
            </h2>
            <p className="text-xs text-neutral-500">
              Hours spent in deep Concept Study, Practice Problem Solving, and Spaced Revision.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.weeklyStudyHours} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                <XAxis dataKey="day" stroke="#888888" fontSize={12} tickLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} tickFormatter={v => `${v}h`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="study" name="Study" stackId="a" fill="#4f46e5" radius={[0, 0, 0, 0]} />
                <Bar dataKey="practice" name="Practice" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="revision" name="Revision" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject Progress Pie / Donut Chart (Section 17) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white">
              Subject Progress & Focus Share
            </h2>
            <p className="text-xs text-neutral-500">
              Syllabus completion percentage and allocated focus blocks per course.
            </p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.subjectProgress}
                  dataKey="percentage"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                >
                  {data.subjectProgress.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#4f46e5'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                  formatter={(value: any, name: any, item: any) => [`${value}% Completed (${item.payload.completedTopics}/${item.payload.totalTopics} Topics)`, name]}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart Row 2: Daily Study Activity Line Chart (Section 17) */}
      <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white">
              Daily Study Activity (Past 14 Days)
            </h2>
            <p className="text-xs text-neutral-500">
              Consistency tracking of logged daily focus hours across study sessions and Pomodoro sprints.
            </p>
          </div>
          <div className="text-xs font-mono font-semibold text-neutral-500">
            Average: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{data.averageDailyHours}h/day</span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.dailyActivity} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
              <XAxis dataKey="day" stroke="#888888" fontSize={11} tickLine={false} />
              <YAxis stroke="#888888" fontSize={11} tickLine={false} tickFormatter={v => `${v}h`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                formatter={(value: any) => [`${value} hrs`, 'Focused Time']}
              />
              <Line
                type="monotone"
                dataKey="hours"
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ r: 4, fill: '#6366f1' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
