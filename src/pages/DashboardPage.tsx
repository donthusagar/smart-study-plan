import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  Flame,
  Award,
  Calendar,
  Sparkles,
  ArrowRight,
  PlusCircle,
  PlayCircle,
  CheckCircle,
  Circle,
  BookOpen,
  TrendingUp,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../services/api';
import { DashboardData, StudySession } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingSessionId, setUpdatingSessionId] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard');
      setData(res.data);
    } catch (err: any) {
      showToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const toggleSessionCompletion = async (session: StudySession) => {
    try {
      setUpdatingSessionId(session._id);
      const newStatus = !session.completed;
      await api.put(`/study-sessions/${session._id}`, { completed: newStatus });

      // Update state locally
      setData(prev => {
        if (!prev) return null;
        const updated = prev.todaySessions.map(s => (s._id === session._id ? { ...s, completed: newStatus } : s));
        return {
          ...prev,
          todaySessions: updated,
          studyHours: newStatus ? Number((prev.studyHours + (session.duration || 60) / 60).toFixed(1)) : prev.studyHours
        };
      });

      showToast(newStatus ? `Completed: "${session.title}"! 🎉` : 'Session marked incomplete', 'success');
    } catch (err: any) {
      showToast('Could not update session status', 'error');
    } finally {
      setUpdatingSessionId(null);
    }
  };

  // Time of day greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-xs sm:text-sm text-neutral-500 font-medium">Loading your study dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Section Greeting (Section 8) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
            <span>{greeting}, {data?.userName || user?.name || 'Sagar'}</span>
            <span>👋</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
            Ready to make progress today? You have {data?.todaySessions.filter(s => !s.completed).length || 0} scheduled sessions remaining.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchDashboard}
            className="p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors"
            title="Refresh dashboard"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            to="/pomodoro"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 transition-colors shadow-xs"
          >
            <PlayCircle className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
            <span>Focus Timer</span>
          </Link>
          <Link
            to="/create-plan"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-xs shadow-indigo-600/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Plan</span>
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards (Section 8) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Study Hours */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Study Hours</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-neutral-900 dark:text-white tabular-nums">
              {data?.studyHours || 42.5} hrs
            </span>
          </div>
          <div className="mt-2 flex items-center text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            <span>{data?.studyHoursGrowth || '+12% this week'}</span>
          </div>
        </div>

        {/* Card 2: Tasks Completed */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Tasks Completed</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-neutral-900 dark:text-white tabular-nums">
              {data?.completedTasks} / {data?.totalTasks}
            </span>
            <span className="text-xs font-mono font-semibold text-neutral-500 dark:text-neutral-400">
              ({data?.taskCompletionRate}%)
            </span>
          </div>
          <div className="mt-3 w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${data?.taskCompletionRate || 0}%` }}
            />
          </div>
        </div>

        {/* Card 3: Current Streak */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Current Streak</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-neutral-900 dark:text-white tabular-nums">
              {data?.currentStreak || 7} Days
            </span>
          </div>
          <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
            Personal best: <span className="font-semibold text-neutral-700 dark:text-neutral-300 font-mono">{data?.longestStreak || 14} days</span>
          </div>
        </div>

        {/* Card 4: Upcoming Exams */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Upcoming Exams</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-neutral-900 dark:text-white tabular-nums">
              {data?.upcomingExams || 3} Exams
            </span>
          </div>
          <div className="mt-2">
            <Link
              to="/exams"
              className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
            >
              <span>View live countdowns</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Study Plan Timeline (Section 9) + Weekly Focus Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Today's Study Plan Timeline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                Today's Study Plan
              </h2>
            </div>
            <Link
              to="/study-plan"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Full Schedule</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
            {(!data?.todaySessions || data.todaySessions.length === 0) ? (
              <div className="text-center py-10 px-4">
                <BookOpen className="w-10 h-10 text-neutral-300 dark:text-neutral-700 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">No sessions scheduled for today</h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                  Generate your smart study plan to automatically populate today's timeline.
                </p>
                <Link
                  to="/create-plan"
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Generate Today's Plan</span>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {data.todaySessions.map((session, idx) => {
                  const isUpdating = updatingSessionId === session._id;
                  return (
                    <div
                      key={session._id || idx}
                      className={`py-3.5 first:pt-0 last:pb-0 flex items-start gap-3 sm:gap-4 transition-colors ${
                        session.completed ? 'opacity-70' : ''
                      }`}
                    >
                      {/* Checkbox trigger for session completion */}
                      <button
                        onClick={() => toggleSessionCompletion(session)}
                        disabled={isUpdating}
                        className="mt-1 text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        aria-label={session.completed ? 'Mark incomplete' : 'Mark completed'}
                      >
                        {session.completed ? (
                          <CheckCircle className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      {/* Time slot column */}
                      <div className="w-20 sm:w-24 shrink-0 font-mono text-xs font-bold text-neutral-700 dark:text-neutral-300 pt-0.5">
                        {session.startTime}
                      </div>

                      {/* Session card details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: session.subjectColor || '#6366f1' }}
                          />
                          <span className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                            {session.subjectName}
                          </span>
                          <span className="text-xs text-neutral-400">·</span>
                          <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
                            {session.duration} minutes
                          </span>
                          <span className="text-xs text-neutral-400">·</span>
                          <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                            {session.type}
                          </span>
                        </div>

                        <div className={`mt-1 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 font-medium ${session.completed ? 'line-through text-neutral-400 dark:text-neutral-500' : ''}`}>
                          {session.title}
                        </div>

                        {session.topicName && (
                          <div className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                            Topic: {session.topicName}
                          </div>
                        )}
                      </div>

                      {/* Action status */}
                      <div className="shrink-0 text-right">
                        <span className={`text-[11px] font-mono font-medium ${session.completed ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-500'}`}>
                          {session.completed ? 'Completed' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 col): Weekly Focus Activity Chart + Quick Assistant */}
        <div className="space-y-6">
          {/* Weekly Progress Bar Chart */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Weekly Focus Velocity</h3>
              <span className="text-[11px] font-mono text-neutral-500">Target: {data?.dailyStudyGoal || 4}h/day</span>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.weeklyProgress || []} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                  <XAxis dataKey="day" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `${v}h`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                    formatter={(value: any) => [`${value} hrs`, 'Study Hours']}
                  />
                  <Bar dataKey="hours" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick AI Study Recommendation Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900/10 via-purple-900/10 to-indigo-900/5 dark:from-indigo-950/50 dark:to-purple-950/30 border border-indigo-200/80 dark:border-indigo-800/80 space-y-3">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
              <Sparkles className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider">AI Advisor Recommendation</h3>
            </div>
            <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
              Based on your upcoming <strong>Mathematics Final Exam</strong> in 17 days, allocate today's 60-minute evening slot to <span className="font-semibold text-indigo-600 dark:text-indigo-400">Calculus & Problem Sets</span>.
            </p>
            <Link
              to="/ai-assistant"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline pt-1"
            >
              <span>Ask AI Advisor for custom sprint plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
