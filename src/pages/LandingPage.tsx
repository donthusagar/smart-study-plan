import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  BarChart3,
  Timer,
  Award,
  ArrowRight,
  ShieldCheck,
  Zap,
  GraduationCap,
  Bot
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { isAuthenticated, demoLogin } = useAuth();

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* Top Bar Contract (3 zones) */}
      <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
          {/* Zone 1: Single text wordmark */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
              Smart Study Planner
            </span>
          </Link>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-600 dark:text-neutral-400">
            <a href="#features" className="hover:text-neutral-950 dark:hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-neutral-950 dark:hover:text-white transition-colors">How It Works</a>
            <a href="#architecture" className="hover:text-neutral-950 dark:hover:text-white transition-colors">System Stack</a>
          </nav>

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors whitespace-nowrap shadow-sm shadow-indigo-600/20"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors whitespace-nowrap shadow-sm shadow-indigo-600/20"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Intelligent B.Tech Academic Planning & Analytics Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white text-balance leading-[1.15]">
            Study Smarter. Achieve More.
          </h1>

          <p className="mt-6 text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto text-balance leading-relaxed">
            Your intelligent personal study planner for better preparation, productivity, and academic success. Designed with adaptive scheduling, exam countdowns, and Pomodoro focus tracking.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="px-6 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-600/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={() => demoLogin().then(() => window.location.href = '/dashboard')}
              className="px-6 py-3 text-sm font-semibold text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xs transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Explore Demo (Sagar)</span>
            </button>
          </div>

          {/* Social Proof & Metrics Strip */}
          <div className="mt-14 pt-8 border-t border-neutral-200 dark:border-neutral-800 grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
            <div>
              <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-white">42.5 hrs</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Average weekly focus time logged</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-white">85%</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Average syllabus readiness before exams</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-white">0 Overlaps</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Conflict-free schedule algorithm</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-white">7+ Days</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Average uninterrupted study streak</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid (Section 4) */}
      <section id="features" className="py-16 sm:py-24 bg-white dark:bg-neutral-900/60 border-y border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Core Capabilities
            </h2>
            <h3 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Engineered for Complete Student Productivity
            </h3>
            <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
              Every tool you need to balance coursework, prepare for semester examinations, and beat procrastination.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                <Calendar className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-neutral-900 dark:text-white">Personalized Study Plans</h4>
              <p className="mt-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Algorithmic scheduling considering subject difficulty, pending syllabus topics, and your peak morning or evening hours.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-neutral-900 dark:text-white">Smart Task Management</h4>
              <p className="mt-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Prioritize lab reports, assignments, and problem sets with status tracking (Todo, In Progress, Completed).
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-neutral-900 dark:text-white">Exam Countdown & Readiness</h4>
              <p className="mt-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Live countdown timers down to seconds for upcoming midterms and finals, paired with preparation completion gauges.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-neutral-900 dark:text-white">Progress Analytics</h4>
              <p className="mt-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Visualized with Recharts: weekly study breakdown, subject distribution donut charts, and daily focus velocity tracking.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                <Timer className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-neutral-900 dark:text-white">Pomodoro Timer</h4>
              <p className="mt-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Science-backed 25-minute focus intervals and restorative breaks that seamlessly log completed sessions into your database.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                <Bot className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-neutral-900 dark:text-white">AI Study Assistant</h4>
              <p className="mt-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Gemini-powered academic chatbot that analyzes your real course load to suggest daily study blueprints and revision schedules.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (Section 4) */}
      <section id="how-it-works" className="py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Workflow
            </h2>
            <h3 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
              How Smart Study Planner Works
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <div className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 mb-2">Step 01</div>
              <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">Enter Subjects & Goals</h4>
              <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Add your current semester courses (e.g. Mathematics, Physics, CS), set topic difficulty and daily target hours.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <div className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 mb-2">Step 02</div>
              <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">Add Exams & Study Time</h4>
              <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Specify upcoming exam dates, specify your weak subjects, and pick your preferred study window (morning or evening).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <div className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 mb-2">Step 03</div>
              <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">Generate Study Schedule</h4>
              <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Our smart algorithm constructs a conflict-free timetable blending deep concept study, practice questions, and mock tests.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <div className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 mb-2">Step 04</div>
              <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">Track & Improve</h4>
              <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Check off sessions as completed, run Pomodoro timers, maintain your daily streak, and consult your AI assistant.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* College Project Architecture Highlight */}
      <section id="architecture" className="py-14 bg-neutral-100/60 dark:bg-neutral-900/40 border-t border-neutral-200 dark:border-neutral-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <GraduationCap className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
            B.Tech Final Year Capstone & Demonstration Ready
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-xl mx-auto">
            Engineered with React 19, Vite, Node.js + Express REST APIs, MongoDB + Mongoose Schemas, JWT Authentication, and Gemini AI.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-neutral-500 dark:text-neutral-400">
            <span>React.js</span> · <span>Express.js</span> · <span>MongoDB</span> · <span>JWT Auth</span> · <span>Tailwind CSS</span> · <span>Recharts</span> · <span>Gemini AI</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 dark:text-neutral-400">
          <div>
            © 2026 Smart Study Planner. Academic SaaS Platform for Engineering Students.
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Login</Link>
            <Link to="/register" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Register</Link>
            <a href="#features" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Features</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
