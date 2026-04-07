import React, { useState, useEffect, useCallback } from 'react';
import { transactionAPI, categoryAPI } from '../../utils/api';
import { formatCurrency, formatDate, getCategoryColor } from '../../utils/helpers';
import { PageHeader, EmptyState, ConfirmDialog, Badge } from '../shared/UI';
import TransactionForm from './TransactionForm';
import { Plus, Search, Filter, Edit2, Trash2, TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORY_EMOJI = { 'Food & Dining': '🍔', 'Shopping': '🛍️', 'Bills & Utilities': '⚡', 'Entertainment': '🎬', 'Travel': '✈️', 'Health & Fitness': '💊', 'Education': '📚', 'Salary': '💼', 'Freelance': '💻', 'Investment': '📈', 'Business': '🏢', 'Gift': '🎁', 'EMI Payment': '🏦', 'Others': '📦', 'Other Income': '💰' };

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [filters, setFilters] = useState({ type: '', category: '', startDate: '', endDate: '', search: '' });
  const [showFilters, setShowFilters] = useState(false);

  const LIMIT = 15;

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (filters.type) params.type = filters.type;
      if (filters.category) params.category = filters.category;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.search) params.search = filters.search;
      const res = await transactionAPI.getAll(params);
      setTransactions(res.data.data);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (err) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { loadTransactions(); }, [loadTransactions]);
  useEffect(() => {
    categoryAPI.getAll().then(r => setCategories(r.data.data)).catch(() => {});
  }, []);

  const handleDelete = async () => {
    try {
      await transactionAPI.delete(deleteId);
      toast.success('Transaction deleted');
      setDeleteId(null);
      loadTransactions();
    } catch { toast.error('Failed to delete'); }
  };

  const handleEdit = (t) => { setEditData(t); setShowForm(true); };
  const handleAdd = () => { setEditData(null); setShowForm(true); };
  const handleFilterChange = (key, val) => { setFilters(f => ({ ...f, [key]: val })); setPage(1); };
  const clearFilters = () => { setFilters({ type: '', category: '', startDate: '', endDate: '', search: '' }); setPage(1); };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="p-4 sm:p-6 space-y-5 animate-fade-in">
      <PageHeader
        title="Transactions"
        subtitle={`${total} total transactions`}
        actions={
          <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Transaction
          </button>
        }
      />

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Income', value: totalIncome, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: <TrendingUp size={14} /> },
          { label: 'Total Expense', value: totalExpense, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20', icon: <TrendingDown size={14} /> },
          { label: 'Net', value: totalIncome - totalExpense, color: totalIncome - totalExpense >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20', icon: null },
        ].map(item => (
          <div key={item.label} className={`${item.bg} rounded-xl p-3 text-center`}>
            <div className={`num-display text-base sm:text-lg font-bold ${item.color}`}>{formatCurrency(item.value)}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Search + filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input-field pl-9" placeholder="Search transactions..." value={filters.search} onChange={e => handleFilterChange('search', e.target.value)} />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`btn-secondary flex items-center gap-1.5 ${showFilters ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-200' : ''}`}>
            <Filter size={14} /> Filters
          </button>
        </div>
        {showFilters && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <select className="input-field" value={filters.type} onChange={e => handleFilterChange('type', e.target.value)}>
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <select className="input-field" value={filters.category} onChange={e => handleFilterChange('category', e.target.value)}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
            </select>
            <input className="input-field" type="date" placeholder="Start date" value={filters.startDate} onChange={e => handleFilterChange('startDate', e.target.value)} />
            <input className="input-field" type="date" placeholder="End date" value={filters.endDate} onChange={e => handleFilterChange('endDate', e.target.value)} />
            {Object.values(filters).some(Boolean) && (
              <button onClick={clearFilters} className="text-xs text-rose-500 hover:underline col-span-2 sm:col-span-4 text-left">✕ Clear all filters</button>
            )}
          </div>
        )}
      </div>

      {/* Transaction list */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        {loading ? (
          <div className="space-y-0 divide-y divide-slate-100 dark:divide-slate-800">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 shimmer rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2"><div className="h-4 shimmer rounded-lg w-48" /><div className="h-3 shimmer rounded-lg w-32" /></div>
                <div className="h-5 shimmer rounded-lg w-24" />
              </div>
            ))}
          </div>
        ) : transactions.length ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {transactions.map(t => (
              <div key={t._id} className="flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ backgroundColor: getCategoryColor(t.category) + '22' }}>
                  {CATEGORY_EMOJI[t.category] || '💰'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{t.description || t.category}</span>
                    {t.isEMI && <Badge color="amber">EMI</Badge>}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{formatDate(t.date)} · {t.category}</div>
                  {t.notes && <div className="text-xs text-slate-400 mt-0.5 truncate">{t.notes}</div>}
                </div>
                <div className={`num-display text-sm font-bold flex-shrink-0 ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button onClick={() => handleEdit(t)} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => setDeleteId(t._id)} className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/30 text-slate-500 hover:text-rose-600 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon="💸" title="No transactions found" description="Try adjusting your filters or add a new transaction"
            action={<button onClick={handleAdd} className="btn-primary">+ Add Transaction</button>} />
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary p-2 disabled:opacity-40">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-slate-600 dark:text-slate-400 font-medium px-2">Page {page} of {pages}</span>
          <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="btn-secondary p-2 disabled:opacity-40">
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      <TransactionForm open={showForm} onClose={() => { setShowForm(false); setEditData(null); }} onSaved={loadTransactions} editData={editData} />
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Transaction" message="Are you sure you want to delete this transaction? This action cannot be undone." />
    </div>
  );
};

export default TransactionsPage;
