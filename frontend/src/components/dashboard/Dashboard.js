import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../../utils/api';
import { formatCurrency, formatDate, getDaysUntil, getCategoryColor } from '../../utils/helpers';
import { StatCard, CardSkeleton, EmptyState, Badge, PageHeader } from '../shared/UI';
import { Wallet, TrendingUp, TrendingDown, CreditCard, AlertCircle, Plus } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await dashboardAPI.get();
        setData(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="h-8 w-64 shimmer rounded-xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-72 shimmer rounded-2xl" />
        <div className="h-72 shimmer rounded-2xl" />
      </div>
    </div>
  );

  const categoryData = data?.categoryBreakdown || {};
  const catLabels = Object.keys(categoryData);
  const catValues = Object.values(categoryData);
  const catColors = catLabels.map(l => getCategoryColor(l));

  const pieData = {
    labels: catLabels,
    datasets: [{ data: catValues, backgroundColor: catColors, borderWidth: 2, borderColor: '#fff' }]
  };

  const barData = {
    labels: data?.monthlyTrend?.map(m => m.month) || [],
    datasets: [
      { label: 'Income', data: data?.monthlyTrend?.map(m => m.income) || [], backgroundColor: 'rgba(16,185,129,0.8)', borderRadius: 6, borderSkipped: false },
      { label: 'Expense', data: data?.monthlyTrend?.map(m => m.expense) || [], backgroundColor: 'rgba(239,68,68,0.8)', borderRadius: 6, borderSkipped: false }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 15, font: { family: 'Plus Jakarta Sans', size: 11 } } } }
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      x: { grid: { display: false }, ticks: { font: { family: 'Plus Jakarta Sans', size: 11 } } },
      y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { family: 'Plus Jakarta Sans', size: 11 }, callback: v => '₹' + (v/1000).toFixed(0) + 'k' } }
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fade-in">
      <PageHeader
        title={`Good ${new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, ${user?.name?.split(' ')[0]} 👋`}
        subtitle={new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        actions={
          <button onClick={() => navigate('/transactions')} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Transaction
          </button>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard title="Total Balance" value={data?.balance || 0} icon={<Wallet size={20} />} color="indigo" subtitle="All time net" />
        <StatCard title="Monthly Income" value={data?.monthlyIncome || 0} icon={<TrendingUp size={20} />} color="emerald" subtitle="This month" />
        <StatCard title="Monthly Expense" value={data?.monthlyExpense || 0} icon={<TrendingDown size={20} />} color="rose" subtitle="This month" />
        <StatCard title="Monthly EMI" value={data?.totalEMI || 0} icon={<CreditCard size={20} />} color="amber" subtitle={`${data?.emiCount || 0} active loans`} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
        {/* Bar chart */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 dark:text-white font-display">Income vs Expenses</h3>
            <span className="text-xs text-slate-400">Last 6 months</span>
          </div>
          <div className="h-56">
            {data?.monthlyTrend?.length ? <Bar data={barData} options={barOptions} /> : <EmptyState icon="📊" title="No data yet" description="Add transactions to see trends" />}
          </div>
        </div>

        {/* Pie chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 dark:text-white font-display">Spending by Category</h3>
            <span className="text-xs text-slate-400">This month</span>
          </div>
          <div className="h-56">
            {catLabels.length ? <Pie data={pieData} options={chartOptions} /> : <EmptyState icon="🍩" title="No expenses" description="No spending recorded this month" />}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent transactions */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 dark:text-white font-display">Recent Transactions</h3>
            <button onClick={() => navigate('/transactions')} className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">View all</button>
          </div>
          {data?.recentTransactions?.length ? (
            <div className="space-y-3">
              {data.recentTransactions.map(t => (
                <div key={t._id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base" style={{ backgroundColor: getCategoryColor(t.category) + '22' }}>
                    {getCategoryEmoji(t.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{t.description || t.category}</div>
                    <div className="text-xs text-slate-400">{formatDate(t.date)} · {t.category}</div>
                  </div>
                  <div className={`num-display text-sm font-bold ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon="💸" title="No transactions" description="Start adding income and expenses" />
          )}
        </div>

        {/* EMI due */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 dark:text-white font-display">EMI Upcoming</h3>
            <button onClick={() => navigate('/emi')} className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">View all</button>
          </div>
          {data?.overdueEMIs?.length > 0 && (
            <div className="flex items-start gap-2 p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl mb-3 border border-rose-100 dark:border-rose-800">
              <AlertCircle size={16} className="text-rose-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-rose-700 dark:text-rose-400 font-medium">{data.overdueEMIs.length} overdue EMI payment{data.overdueEMIs.length > 1 ? 's' : ''}! Pay now to avoid penalties.</span>
            </div>
          )}
          {[...(data?.overdueEMIs || []), ...(data?.upcomingEMIs || [])].slice(0, 5).length ? (
            <div className="space-y-3">
              {[...(data?.overdueEMIs || []), ...(data?.upcomingEMIs || [])].slice(0, 5).map((emi, i) => {
                const daysUntil = getDaysUntil(emi.dueDate);
                const isOverdue = daysUntil < 0;
                return (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm ${isOverdue ? 'bg-rose-100 dark:bg-rose-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                      {isOverdue ? '🔴' : '⏰'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{emi.loanName}</div>
                      <div className={`text-xs font-medium ${isOverdue ? 'text-rose-500' : 'text-amber-600 dark:text-amber-400'}`}>
                        {isOverdue ? `${Math.abs(daysUntil)} days overdue` : daysUntil === 0 ? 'Due today!' : `Due in ${daysUntil} days`}
                      </div>
                    </div>
                    <div className="num-display text-sm font-bold text-slate-700 dark:text-slate-300">
                      {formatCurrency(emi.amount)}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState icon="✅" title="All EMIs up to date" description="No upcoming EMI payments" />
          )}
        </div>
      </div>
    </div>
  );
};

const getCategoryEmoji = (cat) => {
  const map = { 'Food & Dining': '🍔', 'Shopping': '🛍️', 'Bills & Utilities': '⚡', 'Entertainment': '🎬', 'Travel': '✈️', 'Health & Fitness': '💊', 'Education': '📚', 'Salary': '💼', 'Freelance': '💻', 'Investment': '📈', 'Business': '🏢', 'Gift': '🎁', 'EMI Payment': '🏦' };
  return map[cat] || '💰';
};

export default Dashboard;
