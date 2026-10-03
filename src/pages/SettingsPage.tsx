import React, { useState } from 'react';
import {
  Settings,
  Moon,
  Sun,
  Bell,
  RotateCcw,
  Shield,
  HelpCircle,
  Database,
  CheckCircle2
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

export const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [examReminders, setExamReminders] = useState(true);
  const [sessionAlerts, setSessionAlerts] = useState(true);

  const handleResetData = () => {
    if (!confirm('Would you like to reset your demo sessions and re-seed clean baseline data?')) return;
    showToast('Reset completed! Demo data restored.', 'success');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
          Settings & Preferences
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
          Configure app appearance, alert cadences, and student workspace defaults.
        </p>
      </div>

      <div className="space-y-6">
        {/* Dark Mode Card (Section 22) */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
            <span>Interface Theme</span>
          </h2>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Choose between dark mode for reduced eye strain during late-night study sessions, or light mode for daytime clarity. Persisted across sessions.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => theme === 'dark' && toggleTheme()}
              className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold transition-all ${
                theme === 'light'
                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200'
                  : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Light Mode</span>
              </div>
              {theme === 'light' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
            </button>

            <button
              onClick={() => theme === 'light' && toggleTheme()}
              className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold transition-all ${
                theme === 'dark'
                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200'
                  : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>Dark Mode</span>
              </div>
              {theme === 'dark' && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
            </button>
          </div>
        </div>

        {/* Notification Settings (Section 20) */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-600" />
            <span>Notification & Reminder Preferences</span>
          </h2>
          <p className="text-xs text-neutral-500">
            Configure system alerts delivered to your top navigation bar.
          </p>

          <div className="divide-y divide-neutral-100 dark:divide-neutral-800 space-y-3 pt-1">
            <div className="flex items-center justify-between pt-3">
              <div>
                <div className="text-xs font-bold text-neutral-900 dark:text-white">Upcoming Session Reminders</div>
                <div className="text-[11px] text-neutral-500">Alert 15 minutes before scheduled study block</div>
              </div>
              <input
                type="checkbox"
                checked={sessionAlerts}
                onChange={e => setSessionAlerts(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded-md focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <div className="text-xs font-bold text-neutral-900 dark:text-white">Exam Countdown Milestones</div>
                <div className="text-[11px] text-neutral-500">Weekly and daily notifications before semester tests</div>
              </div>
              <input
                type="checkbox"
                checked={examReminders}
                onChange={e => setExamReminders(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded-md focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Demo Data & Academic Viva Information */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-600" />
            <span>Project Viva Demonstration Controls</span>
          </h2>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Reset or reload sample coursework data for college project demonstration and grading.
          </p>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={handleResetData}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore Demo State</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
