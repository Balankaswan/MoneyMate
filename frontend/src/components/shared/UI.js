import React from 'react';
import { X, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

// Modal wrapper
export const Modal = ({ open, onClose, title, children, size = 'md' }) => {
  if (!open) return null;
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal-content ${sizes[size]}`}>
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

// Stat card
export const StatCard = ({ title, value, subtitle, icon, color = 'indigo', trend, currency = 'INR' }) => {
  const colors = {
    indigo: 'from-indigo-500 to-indigo-600',
    emerald: 'from-emerald-500 to-emerald-600',
    rose: 'from-rose-500 to-rose-600',
    amber: 'from-amber-500 to-amber-600',
    purple: 'from-purple-500 to-purple-600',
    cyan: 'from-cyan-500 to-cyan-600',
  };
  const bgColors = {
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20',
    rose: 'bg-rose-50 dark:bg-rose-900/20',
    amber: 'bg-amber-50 dark:bg-amber-900/20',
    purple: 'bg-purple-50 dark:bg-purple-900/20',
    cyan: 'bg-cyan-50 dark:bg-cyan-900/20',
  };

  return (
    <div className={`card-hover rounded-2xl p-5 ${bgColors[color]} border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center text-white shadow-lg`}>
          {icon}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${trend > 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : trend < 0 ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
            {trend > 0 ? <TrendingUp size={12} /> : trend < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
      <div className="num-display text-2xl font-bold text-slate-900 dark:text-white animate-count">
        {typeof value === 'number' ? formatCurrency(value, currency) : value}
      </div>
      <div className="text-sm font-semibold text-slate-600 dark:text-slate-300 mt-1">{title}</div>
      {subtitle && <div className="text-xs text-slate-400 mt-0.5">{subtitle}</div>}
    </div>
  );
};

// Skeleton loader
export const Skeleton = ({ className = '' }) => (
  <div className={`shimmer rounded-xl ${className}`} />
);

export const CardSkeleton = () => (
  <div className="rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
    <div className="flex items-start justify-between mb-4">
      <Skeleton className="w-11 h-11" />
      <Skeleton className="w-16 h-6" />
    </div>
    <Skeleton className="w-32 h-8 mb-2" />
    <Skeleton className="w-24 h-4" />
  </div>
);

// Empty state
export const EmptyState = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="text-5xl mb-4">{icon}</div>
    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2 font-display">{title}</h3>
    <p className="text-sm text-slate-400 dark:text-slate-500 mb-6 max-w-xs">{description}</p>
    {action}
  </div>
);

// Badge
export const Badge = ({ children, color = 'indigo' }) => {
  const colors = {
    indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    rose: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors[color]}`}>
      {children}
    </span>
  );
};

// Page header
export const PageHeader = ({ title, subtitle, actions }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display">{title}</h1>
      {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
  </div>
);

// Confirm dialog
export const ConfirmDialog = ({ open, onClose, onConfirm, title, message, confirmLabel = 'Delete', loading }) => (
  <Modal open={open} onClose={onClose} title={title} size="sm">
    <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">{message}</p>
    <div className="flex gap-3 justify-end">
      <button onClick={onClose} className="btn-secondary">Cancel</button>
      <button onClick={onConfirm} disabled={loading} className="btn-danger">{loading ? 'Processing...' : confirmLabel}</button>
    </div>
  </Modal>
);
