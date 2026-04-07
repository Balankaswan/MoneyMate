import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, ArrowLeftRight, CreditCard, BarChart3,
  Lightbulb, Settings, LogOut, Moon, Sun, X, Menu, TrendingUp, PiggyBank
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/transactions', icon: <ArrowLeftRight size={18} />, label: 'Transactions' },
  { to: '/emi', icon: <CreditCard size={18} />, label: 'EMI Manager' },
  { to: '/reports', icon: <BarChart3 size={18} />, label: 'Reports' },
  { to: '/insights', icon: <Lightbulb size={18} />, label: 'Insights' },
];

const Sidebar = ({ open, onClose }) => {
  const { user, logout, darkMode, toggleDarkMode } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between p-5 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-lg shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30">💰</div>
          <div>
            <div className="font-bold text-slate-900 dark:text-white font-display text-lg leading-none">Money Mate</div>
            <div className="text-xs text-slate-400 mt-0.5">Smart Finance</div>
          </div>
        </div>
        <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
          <X size={18} />
        </button>
      </div>

      {/* User */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.name}</div>
            <div className="text-xs text-slate-400 truncate">{user?.email}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pb-4 space-y-0.5">
        <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2">Main</div>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="text-current">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}

        <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mt-5 mb-2">Account</div>
        <NavLink to="/settings" onClick={onClose} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Settings size={18} /> Settings
        </NavLink>
      </nav>

      {/* Bottom actions */}
      <div className="px-3 pb-5 border-t border-slate-100 dark:border-slate-800 pt-4 space-y-1">
        <button onClick={toggleDarkMode} className="nav-link w-full">
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button onClick={handleLogout} className="nav-link w-full text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600">
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex-col h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <aside className="relative w-72 bg-white dark:bg-slate-900 h-full flex flex-col shadow-2xl animate-slide-in">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
};

export const TopBar = ({ onMenuClick }) => {
  const { darkMode, toggleDarkMode } = useAuth();
  return (
    <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-40">
      <button onClick={onMenuClick} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
        <Menu size={20} />
      </button>
      <div className="flex items-center gap-2">
        <span className="text-lg">💰</span>
        <span className="font-bold text-slate-900 dark:text-white font-display">Money Mate</span>
      </div>
      <button onClick={toggleDarkMode} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </header>
  );
};

export default Sidebar;
