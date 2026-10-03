import React, { useState, useEffect, useRef } from 'react';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Coffee,
  Brain,
  Settings as SettingsIcon,
  CheckCircle2,
  Sparkles,
  Flame
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

type TimerMode = 'study' | 'shortBreak' | 'longBreak';

export const PomodoroPage: React.FC = () => {
  const { showToast } = useToast();

  // Custom durations in minutes
  const [studyDuration, setStudyDuration] = useState<number>(25);
  const [shortBreakDuration, setShortBreakDuration] = useState<number>(5);
  const [longBreakDuration, setLongBreakDuration] = useState<number>(15);

  const [mode, setMode] = useState<TimerMode>('study');
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [completedSessionsCount, setCompletedSessionsCount] = useState<number>(0);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Audio tone generation for session completion
  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch (e) {
      // AudioContext unavailable or blocked
    }
  };

  const getModeDurationSeconds = (m: TimerMode) => {
    if (m === 'study') return studyDuration * 60;
    if (m === 'shortBreak') return shortBreakDuration * 60;
    return longBreakDuration * 60;
  };

  // Switch modes
  const switchMode = (newMode: TimerMode) => {
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(getModeDurationSeconds(newMode));
  };

  // Countdown timer loop
  useEffect(() => {
    let interval: any = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      playChime();

      if (mode === 'study') {
        // Record completed pomodoro session to backend (Section 18)
        api.post('/pomodoro', { duration: studyDuration, completed: true }).catch(() => {});
        setCompletedSessionsCount(prev => prev + 1);
        showToast('Great job! One focused session completed. Take a break! 🎉', 'success');

        // Suggest short or long break
        if ((completedSessionsCount + 1) % 4 === 0) {
          switchMode('longBreak');
        } else {
          switchMode('shortBreak');
        }
      } else {
        showToast('Break finished! Ready to refocus? 🚀', 'info');
        switchMode('study');
      }
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, studyDuration, completedSessionsCount]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(getModeDurationSeconds(mode));
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const totalModeSeconds = getModeDurationSeconds(mode);
  const progressPercent = totalModeSeconds > 0 ? ((totalModeSeconds - timeLeft) / totalModeSeconds) * 100 : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-2">
          <Brain className="w-3.5 h-3.5" />
          <span>Neuroscience-Backed Deep Focus</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
          Pomodoro Focus Timer
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
          Work in 25-minute undistracted blocks with structured cognitive rest periods.
        </p>
      </div>

      {/* Main Timer Card */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-10 shadow-xl text-center space-y-8">
        {/* Mode Selector Tabs */}
        <div className="inline-flex items-center p-1 bg-neutral-100 dark:bg-neutral-800 rounded-2xl gap-1">
          <button
            onClick={() => switchMode('study')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
              mode === 'study'
                ? 'bg-white dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>Study (25m)</span>
          </button>

          <button
            onClick={() => switchMode('shortBreak')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
              mode === 'shortBreak'
                ? 'bg-white dark:bg-neutral-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Coffee className="w-4 h-4" />
            <span>Short Break (5m)</span>
          </button>

          <button
            onClick={() => switchMode('longBreak')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
              mode === 'longBreak'
                ? 'bg-white dark:bg-neutral-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Long Break (15m)</span>
          </button>
        </div>

        {/* Big Digital Clock Display (Section 18 default 25:00) */}
        <div className="space-y-4">
          <div className="text-7xl sm:text-8xl font-extrabold font-mono tracking-tight text-neutral-900 dark:text-white tabular-nums select-none">
            {timeFormatted}
          </div>

          {/* Progress Bar */}
          <div className="max-w-md mx-auto w-full bg-neutral-100 dark:bg-neutral-800 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                mode === 'study' ? 'bg-indigo-600' : mode === 'shortBreak' ? 'bg-emerald-500' : 'bg-blue-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
            {mode === 'study' ? '🎯 Stay fully focused on 1 task' : '☕ Step away, hydrate, and stretch'}
          </div>
        </div>

        {/* Control Buttons (Section 18 Start, Pause, Reset) */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={toggleTimer}
            className={`flex items-center gap-2.5 px-8 py-3.5 rounded-2xl text-base font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95 ${
              isActive
                ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/25'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/25'
            }`}
          >
            {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
            <span>{isActive ? 'Pause' : 'Start'}</span>
          </button>

          <button
            onClick={resetTimer}
            className="p-3.5 rounded-2xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-3.5 rounded-2xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors"
            title="Customize Intervals"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Completed Cycles Counter */}
        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-center gap-6 text-xs text-neutral-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Today's Sessions: <strong className="text-neutral-900 dark:text-white font-mono">{completedSessionsCount}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Total Focus: <strong className="text-neutral-900 dark:text-white font-mono">{(completedSessionsCount * studyDuration) / 60 >= 1 ? `${((completedSessionsCount * studyDuration) / 60).toFixed(1)} hrs` : `${completedSessionsCount * studyDuration} mins`}</strong></span>
          </div>
        </div>
      </div>

      {/* Interval Customization Card (Section 18) */}
      {showSettings && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-4 animate-in fade-in">
          <h2 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <SettingsIcon className="w-4 h-4 text-indigo-600" />
            <span>Customize Timer Durations (Minutes)</span>
          </h2>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Study Time
              </label>
              <input
                type="number"
                min="5"
                max="90"
                value={studyDuration}
                onChange={e => {
                  const val = Number(e.target.value);
                  setStudyDuration(val);
                  if (mode === 'study') setTimeLeft(val * 60);
                }}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs sm:text-sm text-neutral-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Short Break
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={shortBreakDuration}
                onChange={e => {
                  const val = Number(e.target.value);
                  setShortBreakDuration(val);
                  if (mode === 'shortBreak') setTimeLeft(val * 60);
                }}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs sm:text-sm text-neutral-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Long Break
              </label>
              <input
                type="number"
                min="5"
                max="60"
                value={longBreakDuration}
                onChange={e => {
                  const val = Number(e.target.value);
                  setLongBreakDuration(val);
                  if (mode === 'longBreak') setTimeLeft(val * 60);
                }}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs sm:text-sm text-neutral-900 dark:text-white font-mono"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
