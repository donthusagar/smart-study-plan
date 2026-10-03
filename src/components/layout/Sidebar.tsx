import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  PlusCircle,
  BookOpen,
  CheckSquare,
  Calendar,
  Award,
  BarChart3,
  Timer,
  Bot,
  User,
  Settings,
  Flame,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Study Plan', path: '/study-plan', icon: CalendarDays },
    { label: 'Create Plan', path: '/create-plan', icon: PlusCircle },
    { label: 'Subjects', path: '/subjects', icon: BookOpen },
    { label: 'Tasks', path: '/tasks', icon: CheckSquare },
    { label: 'Calendar', path: '/calendar', icon: Calendar },
    { label: 'Exams', path: '/exams', icon: Award },
    { label: 'Progress', path: '/progress', icon: BarChart3 },
    { label: 'Pomodoro', path: '/pomodoro', icon: Timer },
    { label: 'AI Assistant', path: '/ai-assistant', icon: Bot },
    { label: 'Profile', path: '/profile', icon: User },
    { label: 'Settings', path: '/settings', icon: Settings }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-mono">
            Platform Menu
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20 font-semibold'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-neutral-500 dark:text-neutral-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-200" />}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom Section: Study Streak & Goal Callout */}
        <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
          {/* Streak indicator */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 dark:from-amber-950/40 dark:to-orange-950/20 border border-amber-300/40 dark:border-amber-800/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1">
                  <span>7 Days Streak</span>
                </div>
                <div className="text-[10px] text-amber-700 dark:text-amber-300 font-mono">
                  Keep learning daily!
                </div>
              </div>
            </div>
            <div className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
              🔥
            </div>
          </div>

          {/* Quick Create Study Plan action */}
          <NavLink
            to="/create-plan"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-semibold shadow-xs transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Generate Study Plan</span>
          </NavLink>
        </div>
      </aside>
    </>
  );
};
