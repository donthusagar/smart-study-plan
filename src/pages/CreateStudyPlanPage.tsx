import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Calendar,
  Clock,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { Subject } from '../types';
import { useToast } from '../context/ToastContext';

export const CreateStudyPlanPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Form Fields
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [examDate, setExamDate] = useState<string>('');
  const [availableHours, setAvailableHours] = useState<number>(4);
  const [weakSubjectIds, setWeakSubjectIds] = useState<string[]>([]);
  const [preferredStudyTime, setPreferredStudyTime] = useState<string>('Morning');
  const [studyDays, setStudyDays] = useState<string[]>([
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ]);
  const [dailyGoalHours, setDailyGoalHours] = useState<number>(4);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const studyTimes = ['Morning', 'Afternoon', 'Evening', 'Night'];

  useEffect(() => {
    async function loadSubjects() {
      try {
        const res = await api.get('/subjects');
        setSubjects(res.data);
        // By default select all subjects
        setSelectedSubjectIds(res.data.map((s: Subject) => s._id));
      } catch (err: any) {
        showToast('Failed to load subjects', 'error');
      } finally {
        setLoadingSubjects(false);
      }
    }
    loadSubjects();
  }, []);

  const toggleSubject = (id: string) => {
    setSelectedSubjectIds(prev =>
      prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
    );
  };

  const toggleWeakSubject = (id: string) => {
    setWeakSubjectIds(prev =>
      prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
    );
  };

  const toggleDay = (day: string) => {
    setStudyDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedSubjectIds.length === 0) {
      showToast('Please select at least one subject to study', 'warning');
      return;
    }

    if (studyDays.length === 0) {
      showToast('Please select at least one study day', 'warning');
      return;
    }

    setGenerating(true);
    try {
      const res = await api.post('/study-sessions/generate', {
        subjectIds: selectedSubjectIds,
        examDate: examDate || undefined,
        availableHoursPerDay: availableHours,
        weakSubjectIds,
        preferredStudyTime,
        studyDays,
        dailyGoalHours,
        saveToDatabase: true
      });

      showToast(res.data.message || 'Smart Study Plan generated successfully!', 'success');
      navigate('/study-plan');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to generate study plan', 'error');
    } finally {
      setGenerating(false);
    }
  };

  if (loadingSubjects) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-xs text-neutral-500 font-medium">Loading subjects...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>Algorithmic Optimization Engine</span>
        </div>
        <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
          Create Your Smart Study Plan
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
          Our intelligent algorithm analyzes your exam deadlines, weak areas, and available hours to synthesize a realistic, conflict-free timetable.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Subjects selection */}
        <div className="bg-white dark:bg-neutral-900 p-5 sm:p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-4 shadow-xs">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>1. Enrolled Subjects for This Plan</span>
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">Select the subjects you want to schedule.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {subjects.map(sub => {
              const isSelected = selectedSubjectIds.includes(sub._id);
              return (
                <div
                  key={sub._id}
                  onClick={() => toggleSubject(sub._id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: sub.color || '#6366f1' }}
                    />
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-white">
                        {sub.name}
                      </div>
                      <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                        {sub.difficulty} · {sub.priority} Priority
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="w-4 h-4 text-indigo-600 rounded-md focus:ring-indigo-500 pointer-events-none"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Weak Subjects (Section 12 requirement) */}
        <div className="bg-white dark:bg-neutral-900 p-5 sm:p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-4 shadow-xs">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span>2. Identify Your Weak Subjects</span>
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              The algorithm allocates 1.5x more practice questions and spaced revision to these subjects.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {subjects.map(sub => {
              const isWeak = weakSubjectIds.includes(sub._id);
              return (
                <button
                  type="button"
                  key={sub._id}
                  onClick={() => toggleWeakSubject(sub._id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    isWeak
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <span>{sub.name}</span>
                  {isWeak && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Time & Deadlines */}
        <div className="bg-white dark:bg-neutral-900 p-5 sm:p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-5 shadow-xs">
          <h2 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>3. Study Time & Target Exam Date</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Target Exam Date */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                Target Exam Date (Optional)
              </label>
              <input
                type="date"
                value={examDate}
                onChange={e => setExamDate(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs sm:text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Available Study Hours per day */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                Available Study Time: <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{availableHours} hrs/day</span>
              </label>
              <input
                type="range"
                min="1"
                max="8"
                step="0.5"
                value={availableHours}
                onChange={e => {
                  const val = Number(e.target.value);
                  setAvailableHours(val);
                  setDailyGoalHours(val);
                }}
                className="w-full accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-neutral-400 font-mono mt-1">
                <span>1 hr</span>
                <span>4 hrs (Recommended)</span>
                <span>8 hrs</span>
              </div>
            </div>

            {/* Preferred Study Time */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                Preferred Study Time Window
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {studyTimes.map(time => (
                  <button
                    type="button"
                    key={time}
                    onClick={() => setPreferredStudyTime(time)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition-colors ${
                      preferredStudyTime === time
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Daily Goal */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                Daily Goal: <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{dailyGoalHours} hours</span>
              </label>
              <input
                type="number"
                min="1"
                max="12"
                value={dailyGoalHours}
                onChange={e => setDailyGoalHours(Number(e.target.value))}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs sm:text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Study Days Selection */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
              Scheduled Study Days
            </label>
            <div className="flex flex-wrap gap-2">
              {daysOfWeek.map(day => {
                const isSelected = studyDays.includes(day);
                return (
                  <button
                    type="button"
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isSelected
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold'
                        : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/study-plan')}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={generating}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Generate Smart Study Plan</span>
          </button>
        </div>
      </form>
    </div>
  );
};
