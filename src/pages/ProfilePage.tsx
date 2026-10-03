import React, { useState } from 'react';
import {
  User as UserIcon,
  Mail,
  Clock,
  Target,
  Save,
  CheckCircle2,
  Camera,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || 'Sagar');
  const [dailyGoal, setDailyGoal] = useState<number>(user?.dailyStudyGoal || 4);
  const [preferredTime, setPreferredTime] = useState<string>(user?.preferredStudyTime || 'Morning');
  const [profileImage, setProfileImage] = useState<string>(user?.profileImage || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name is required', 'warning');
      return;
    }

    setSaving(true);
    try {
      const res = await api.put('/auth/profile', {
        name: name.trim(),
        dailyStudyGoal: dailyGoal,
        preferredStudyTime: preferredTime,
        profileImage
      });

      updateUser(res.data.user);
      showToast('Profile updated successfully!', 'success');
    } catch (err: any) {
      showToast('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const sampleAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80'
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
          Student Profile
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
          Manage your personal information, academic daily study goals, and peak focus preferences.
        </p>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-6 border-b border-neutral-100 dark:border-neutral-800">
            <div className="relative w-20 h-20 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 flex items-center justify-center overflow-hidden shrink-0">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <UserIcon className="w-8 h-8 text-neutral-400" />
              )}
            </div>

            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Profile Avatar
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Choose an avatar or leave empty for initials.
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                {sampleAvatars.map((url, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setProfileImage(url)}
                    className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-transform ${
                      profileImage === url ? 'scale-110 border-indigo-600' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt="preset avatar" className="w-full h-full object-cover" />
                  </button>
                ))}
                {profileImage && (
                  <button
                    type="button"
                    onClick={() => setProfileImage('')}
                    className="text-xs text-rose-600 dark:text-rose-400 hover:underline ml-2"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Form Fields (Section 21) */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs sm:text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                Registered College Email (Read-Only)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  disabled
                  value={user?.email || 'sagar@college.edu'}
                  className="block w-full pl-10 pr-3 py-2.5 bg-neutral-100 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                  Daily Study Goal (Hours)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                    <Target className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    step="0.5"
                    value={dailyGoal}
                    onChange={e => setDailyGoal(Number(e.target.value))}
                    className="block w-full pl-10 pr-3 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs sm:text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                  Preferred Study Window
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <select
                    value={preferredTime}
                    onChange={e => setPreferredTime(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs sm:text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Morning">Morning (08:00 AM)</option>
                    <option value="Afternoon">Afternoon (01:00 PM)</option>
                    <option value="Evening">Evening (05:00 PM)</option>
                    <option value="Night">Night (08:00 PM)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-indigo-600/20 disabled:opacity-50 transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
