import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, TrendingUp, Shield, Zap } from 'lucide-react';

const AuthPage = () => {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const { login, register, loading } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (mode === 'register' && !form.name.trim()) e.name = 'Name is required';
    if (!form.email.match(/^\S+@\S+\.\S+$/)) e.email = 'Valid email required';
    if (form.password.length < 6) e.password = 'Password must be 6+ characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const result = mode === 'login'
      ? await login(form.email, form.password)
      : await register(form.name, form.email, form.password);
    if (result.success) navigate('/dashboard');
  };

  const handleDemo = async () => {
    const result = await login('demo@moneymate.in', 'demo1234');
    if (result.success) navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-5xl flex flex-col lg:flex-row shadow-2xl rounded-3xl overflow-hidden">
        {/* Left panel */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 p-12 flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">💰</div>
              <span className="text-white text-2xl font-bold font-display">Money Mate</span>
            </div>
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Take control of your finances
            </h1>
            <p className="text-indigo-200 text-lg leading-relaxed">
              Track expenses, manage EMIs, and get smart insights to achieve your financial goals.
            </p>
          </div>
          <div className="space-y-4">
            {[
              { icon: <TrendingUp size={18} />, text: 'Real-time expense tracking' },
              { icon: <Shield size={18} />, text: 'Secure JWT authentication' },
              { icon: <Zap size={18} />, text: 'Smart financial insights' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-indigo-100">
                <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center">{f.icon}</div>
                <span className="text-sm font-medium">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel - form */}
        <div className="w-full lg:w-1/2 bg-white dark:bg-slate-900 p-8 lg:p-12 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <span className="text-2xl">💰</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white font-display">Money Mate</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 font-display">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
            {mode === 'login' ? 'Sign in to your account' : 'Start your financial journey'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                <input className="input-field" placeholder="Arjun Sharma" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name}</p>}
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
              <input className="input-field" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              {errors.email && <p className="text-rose-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input className="input-field pr-10" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-rose-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-700" /></div>
            <div className="relative flex justify-center text-xs text-slate-400 dark:text-slate-500">
              <span className="bg-white dark:bg-slate-900 px-3">or</span>
            </div>
          </div>

          <button onClick={handleDemo} disabled={loading} className="w-full py-2.5 border-2 border-dashed border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-semibold rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all text-sm">
            🚀 Try Demo Account
          </button>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
