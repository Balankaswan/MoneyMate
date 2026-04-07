import React, { useState, useEffect } from 'react';
import { insightsAPI } from '../../utils/api';
import { PageHeader, EmptyState } from '../shared/UI';
import { RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const InsightCard = ({ insight, delay = 0 }) => {
  const colors = {
    success: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', bar: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-400' },
    warning: { bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', bar: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-400' },
    danger: { bg: 'bg-rose-50 dark:bg-rose-900/20', border: 'border-rose-200 dark:border-rose-800', bar: 'bg-rose-500', text: 'text-rose-700 dark:text-rose-400' },
    info: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', border: 'border-indigo-200 dark:border-indigo-800', bar: 'bg-indigo-500', text: 'text-indigo-700 dark:text-indigo-400' },
  };
  const c = colors[insight.type] || colors.info;

  return (
    <div className={`rounded-2xl border p-5 ${c.bg} ${c.border} animate-fade-in`} style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-start gap-4">
        <div className="text-3xl flex-shrink-0 mt-0.5">{insight.icon}</div>
        <div className="flex-1 min-w-0">
          <div className={`font-bold text-base mb-1 font-display ${c.text}`}>{insight.title}</div>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{insight.message}</p>
          {insight.value !== undefined && typeof insight.value === 'number' && insight.value <= 100 && insight.value >= 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>{insight.title}</span>
                <span className="font-semibold">{insight.value.toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-white/60 dark:bg-slate-800/60 rounded-full overflow-hidden">
                <div className={`h-full ${c.bar} rounded-full transition-all duration-1000`} style={{ width: `${Math.min(100, insight.value)}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const InsightsPage = () => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadInsights = async () => {
    setLoading(true);
    try {
      const res = await insightsAPI.get();
      setInsights(res.data.data);
    } catch { toast.error('Failed to load insights'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadInsights(); }, []);

  const successInsights = insights.filter(i => i.type === 'success');
  const warningInsights = insights.filter(i => i.type === 'warning' || i.type === 'info');
  const dangerInsights = insights.filter(i => i.type === 'danger');

  return (
    <div className="p-4 sm:p-6 space-y-5 animate-fade-in">
      <PageHeader
        title="Smart Insights"
        subtitle="AI-powered analysis of your spending habits"
        actions={
          <button onClick={loadInsights} disabled={loading} className="btn-secondary flex items-center gap-2">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        }
      />

      {/* Intro card */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">🧠</span>
          <h3 className="font-bold text-lg font-display">Your Financial Health</h3>
        </div>
        <p className="text-indigo-100 text-sm leading-relaxed">
          Based on your transactions, EMIs, and spending patterns, here are personalized insights to help you make smarter money decisions.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-24 shimmer rounded-2xl" />)}</div>
      ) : insights.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8">
          <EmptyState icon="💡" title="Not enough data yet" description="Add more transactions to get personalized financial insights and recommendations." />
        </div>
      ) : (
        <div className="space-y-4">
          {dangerInsights.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-rose-500 rounded-full" />
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Action Required</h3>
              </div>
              <div className="space-y-3">
                {dangerInsights.map((ins, i) => <InsightCard key={i} insight={ins} delay={i * 80} />)}
              </div>
            </div>
          )}

          {warningInsights.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-amber-500 rounded-full" />
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Attention Needed</h3>
              </div>
              <div className="space-y-3">
                {warningInsights.map((ins, i) => <InsightCard key={i} insight={ins} delay={i * 80} />)}
              </div>
            </div>
          )}

          {successInsights.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Doing Well</h3>
              </div>
              <div className="space-y-3">
                {successInsights.map((ins, i) => <InsightCard key={i} insight={ins} delay={i * 80} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tips section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
        <h3 className="font-bold text-slate-900 dark:text-white font-display mb-4 flex items-center gap-2">
          <span>📌</span> General Finance Tips
        </h3>
        <div className="space-y-3">
          {[
            { icon: '💰', tip: '50/30/20 Rule', desc: 'Spend 50% on needs, 30% on wants, and save 20% of your income.' },
            { icon: '🚨', tip: 'Emergency Fund', desc: 'Keep 3-6 months of expenses in a liquid savings account.' },
            { icon: '📉', tip: 'Reduce EMI Burden', desc: 'Try to keep total EMIs below 40% of your monthly income.' },
            { icon: '📈', tip: 'Invest Early', desc: 'Start investing as early as possible to benefit from compounding.' },
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <span className="text-xl flex-shrink-0">{tip.icon}</span>
              <div>
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{tip.tip}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{tip.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InsightsPage;
