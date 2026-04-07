import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../utils/api';
import { PageHeader } from '../shared/UI';
import { User, Moon, Sun, Bell, Shield, Palette } from 'lucide-react';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const { user, updateUser, darkMode, toggleDarkMode } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', currency: user?.currency || 'INR', monthlyBudget: user?.monthlyBudget || '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await authAPI.updateProfile(form);
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 animate-fade-in">
      <PageHeader title="Settings" subtitle="Manage your account preferences" />

      {/* Profile */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
        <div className="flex items-center gap-3 mb-5">
          <User size={18} className="text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-bold text-slate-900 dark:text-white font-display">Profile Settings</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
            <input className="input-field max-w-sm" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
            <input className="input-field max-w-sm" value={user?.email || ''} disabled className="input-field max-w-sm opacity-60 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Currency</label>
            <select className="input-field max-w-sm" value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
              <option value="INR">🇮🇳 INR - Indian Rupee</option>
              <option value="USD">🇺🇸 USD - US Dollar</option>
              <option value="EUR">🇪🇺 EUR - Euro</option>
              <option value="GBP">🇬🇧 GBP - British Pound</option>
              <option value="AED">🇦🇪 AED - UAE Dirham</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Monthly Budget</label>
            <div className="relative max-w-sm">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">₹</span>
              <input className="input-field pl-8" type="number" min="0" placeholder="50000" value={form.monthlyBudget} onChange={e => setForm(f => ({ ...f, monthlyBudget: e.target.value }))} />
            </div>
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
        <div className="flex items-center gap-3 mb-5">
          <Palette size={18} className="text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-bold text-slate-900 dark:text-white font-display">Appearance</h3>
        </div>
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl max-w-sm">
          <div className="flex items-center gap-3">
            {darkMode ? <Moon size={18} className="text-indigo-400" /> : <Sun size={18} className="text-amber-500" />}
            <div>
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{darkMode ? 'Dark Mode' : 'Light Mode'}</div>
              <div className="text-xs text-slate-400">{darkMode ? 'Easy on the eyes at night' : 'Bright and clean'}</div>
            </div>
          </div>
          <button onClick={toggleDarkMode} className={`relative w-11 h-6 rounded-full transition-colors ${darkMode ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${darkMode ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
        <div className="flex items-center gap-3 mb-5">
          <Shield size={18} className="text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-bold text-slate-900 dark:text-white font-display">Security</h3>
        </div>
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl max-w-sm">
          <div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">JWT Authentication</div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">✓ Active & Secured</div>
          </div>
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
        </div>
      </div>

      {/* About */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800 p-5 text-center">
        <div className="text-3xl mb-2">💰</div>
        <div className="font-bold text-slate-900 dark:text-white font-display mb-1">Money Mate v1.0</div>
        <div className="text-xs text-slate-500 dark:text-slate-400">Smart Expense Tracker · Built with React + Node.js + MongoDB</div>
      </div>
    </div>
  );
};

export default SettingsPage;
