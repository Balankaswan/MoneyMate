import React, { useState, useEffect, useCallback } from 'react';
import { reportsAPI } from '../../utils/api';
import { formatCurrency, getCategoryColor } from '../../utils/helpers';
import { PageHeader, EmptyState } from '../shared/UI';
import { Download, FileSpreadsheet } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Tooltip, Legend } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Tooltip, Legend);

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const ReportsPage = () => {
  const [tab, setTab] = useState('monthly');
  const [monthlyData, setMonthlyData] = useState(null);
  const [yearlyData, setYearlyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const loadReport = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === 'monthly') {
        const res = await reportsAPI.monthly({ year: selectedYear, month: selectedMonth });
        setMonthlyData(res.data.data);
      } else {
        const res = await reportsAPI.yearly({ year: selectedYear });
        setYearlyData(res.data.data);
      }
    } catch { toast.error('Failed to load report'); }
    finally { setLoading(false); }
  }, [tab, selectedMonth, selectedYear]);

  useEffect(() => { loadReport(); }, [loadReport]);

  const exportExcel = () => {
    try {
      const XLSX = require('xlsx');
      const data = tab === 'monthly' ? monthlyData?.transactions?.map(t => ({
        Date: new Date(t.date).toLocaleDateString('en-IN'),
        Type: t.type,
        Category: t.category,
        Description: t.description || '',
        Amount: t.amount,
        Notes: t.notes || ''
      })) : yearlyData?.monthlyBreakdown?.map(m => ({
        Month: m.month,
        Income: m.income,
        Expense: m.expense,
        Savings: m.income - m.expense
      }));
      const ws = XLSX.utils.json_to_sheet(data || []);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Report');
      XLSX.writeFile(wb, `money-mate-report-${tab}-${selectedYear}${tab === 'monthly' ? '-' + selectedMonth : ''}.xlsx`);
      toast.success('Excel exported!');
    } catch { toast.error('Export failed'); }
  };

  const exportPDF = () => {
    try {
      const { jsPDF } = require('jspdf');
      require('jspdf-autotable');
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text('Money Mate - Financial Report', 14, 22);
      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      doc.text(`Period: ${tab === 'monthly' ? `${MONTHS[selectedMonth - 1]} ${selectedYear}` : `Year ${selectedYear}`}`, 14, 32);

      if (tab === 'monthly' && monthlyData) {
        doc.setFontSize(12);
        doc.text(`Income: ${formatCurrency(monthlyData.income)}`, 14, 44);
        doc.text(`Expenses: ${formatCurrency(monthlyData.expense)}`, 14, 52);
        doc.text(`Savings: ${formatCurrency(monthlyData.savings)}`, 14, 60);
        if (monthlyData.transactions?.length) {
          doc.autoTable({
            startY: 70,
            head: [['Date', 'Type', 'Category', 'Description', 'Amount']],
            body: monthlyData.transactions.map(t => [
              new Date(t.date).toLocaleDateString('en-IN'), t.type, t.category,
              t.description || '-', formatCurrency(t.amount)
            ]),
            styles: { fontSize: 9 },
            headStyles: { fillColor: [99, 102, 241] }
          });
        }
      }
      doc.save(`money-mate-${tab}-${selectedYear}${tab === 'monthly' ? '-' + selectedMonth : ''}.pdf`);
      toast.success('PDF exported!');
    } catch (e) { console.error(e); toast.error('PDF export failed'); }
  };

  const currentData = tab === 'monthly' ? monthlyData : yearlyData;

  const yearlyBarData = yearlyData ? {
    labels: yearlyData.monthlyBreakdown?.map(m => m.month),
    datasets: [
      { label: 'Income', data: yearlyData.monthlyBreakdown?.map(m => m.income), backgroundColor: 'rgba(16,185,129,0.8)', borderRadius: 6, borderSkipped: false },
      { label: 'Expense', data: yearlyData.monthlyBreakdown?.map(m => m.expense), backgroundColor: 'rgba(239,68,68,0.8)', borderRadius: 6, borderSkipped: false }
    ]
  } : null;

  const categoryPieData = currentData?.categoryBreakdown ? {
    labels: Object.keys(currentData.categoryBreakdown),
    datasets: [{
      data: Object.values(currentData.categoryBreakdown),
      backgroundColor: Object.keys(currentData.categoryBreakdown).map(l => getCategoryColor(l)),
      borderWidth: 2, borderColor: '#fff'
    }]
  } : null;

  const chartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 12, font: { size: 11 } } } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { size: 11 }, callback: v => '₹' + (v / 1000).toFixed(0) + 'k' } }
    }
  };
  const pieOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 12, font: { size: 11 } } } } };

  return (
    <div className="p-4 sm:p-6 space-y-5 animate-fade-in">
      <PageHeader
        title="Reports"
        subtitle="Detailed financial analysis"
        actions={
          <div className="flex gap-2">
            <button onClick={exportExcel} className="btn-secondary flex items-center gap-1.5 text-xs">
              <FileSpreadsheet size={14} /> Excel
            </button>
            <button onClick={exportPDF} className="btn-secondary flex items-center gap-1.5 text-xs">
              <Download size={14} /> PDF
            </button>
          </div>
        }
      />

      {/* Tab + filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
            {['monthly', 'yearly'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all capitalize ${tab === t ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}>
                {t}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {tab === 'monthly' && (
              <select className="input-field w-auto" value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))}>
                {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
            )}
            <select className="input-field w-auto" value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))}>
              {[2022, 2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">{[...Array(3)].map((_, i) => <div key={i} className="h-24 shimmer rounded-2xl" />)}</div>
          <div className="h-72 shimmer rounded-2xl" />
        </div>
      ) : currentData ? (
        <>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Income', value: currentData.income || currentData.totalIncome || 0, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
              { label: 'Total Expense', value: currentData.expense || currentData.totalExpense || 0, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20' },
              { label: 'Net Savings', value: currentData.savings || 0, color: (currentData.savings || 0) >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
            ].map(item => (
              <div key={item.label} className={`${item.bg} rounded-2xl p-4 text-center`}>
                <div className={`num-display text-xl font-bold ${item.color}`}>{formatCurrency(item.value)}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">{item.label}</div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {tab === 'yearly' && yearlyBarData && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
                <h3 className="font-bold text-slate-900 dark:text-white font-display mb-4">Monthly Breakdown {selectedYear}</h3>
                <div className="h-56"><Bar data={yearlyBarData} options={chartOpts} /></div>
              </div>
            )}
            {categoryPieData && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
                <h3 className="font-bold text-slate-900 dark:text-white font-display mb-4">Category Breakdown</h3>
                <div className="h-56"><Pie data={categoryPieData} options={pieOpts} /></div>
              </div>
            )}
          </div>

          {/* Category table */}
          {currentData.categoryBreakdown && Object.keys(currentData.categoryBreakdown).length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white font-display">Category-wise Expenses</h3>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {Object.entries(currentData.categoryBreakdown)
                  .sort(([, a], [, b]) => b - a)
                  .map(([cat, amount]) => {
                    const total = Object.values(currentData.categoryBreakdown).reduce((s, v) => s + v, 0);
                    const pct = total > 0 ? ((amount / total) * 100).toFixed(1) : 0;
                    return (
                      <div key={cat} className="flex items-center gap-3 px-5 py-3">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: getCategoryColor(cat) }} />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex-1">{cat}</span>
                        <div className="flex items-center gap-3">
                          <div className="hidden sm:block w-32 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: getCategoryColor(cat) }} />
                          </div>
                          <span className="text-xs text-slate-400 w-10 text-right">{pct}%</span>
                          <span className="num-display text-sm font-bold text-slate-800 dark:text-slate-200 w-24 text-right">{formatCurrency(amount)}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Transaction list (monthly only) */}
          {tab === 'monthly' && monthlyData?.transactions?.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white font-display">All Transactions ({monthlyData.transactions.length})</h3>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-96 overflow-y-auto">
                {monthlyData.transactions.map(t => (
                  <div key={t._id} className="flex items-center gap-3 px-5 py-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ backgroundColor: getCategoryColor(t.category) + '22' }}>
                      {t.type === 'income' ? '💚' : '🔴'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{t.description || t.category}</div>
                      <div className="text-xs text-slate-400">{new Date(t.date).toLocaleDateString('en-IN')} · {t.category}</div>
                    </div>
                    <div className={`num-display text-sm font-bold ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8">
          <EmptyState icon="📊" title="No data for this period" description="Try selecting a different time period or add some transactions first." />
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
