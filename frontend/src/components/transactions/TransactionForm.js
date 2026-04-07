import React, { useState, useEffect } from 'react';
import { Modal } from '../shared/UI';
import { transactionAPI, categoryAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const DEFAULTS = { type: 'expense', amount: '', category: '', description: '', date: new Date().toISOString().split('T')[0], notes: '' };

const TransactionForm = ({ open, onClose, onSaved, editData }) => {
  const [form, setForm] = useState(DEFAULTS);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newCat, setNewCat] = useState('');
  const [showNewCat, setShowNewCat] = useState(false);

  useEffect(() => {
    if (open) {
      loadCategories();
      if (editData) {
        setForm({
          type: editData.type,
          amount: editData.amount,
          category: editData.category,
          description: editData.description || '',
          date: new Date(editData.date).toISOString().split('T')[0],
          notes: editData.notes || ''
        });
      } else {
        setForm(DEFAULTS);
      }
    }
  }, [open, editData]);

  const loadCategories = async () => {
    try {
      const res = await categoryAPI.getAll();
      setCategories(res.data.data);
    } catch {}
  };

  const filteredCats = categories.filter(c => c.type === form.type || c.type === 'both');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.category || !form.date) return toast.error('Please fill all required fields');
    if (parseFloat(form.amount) <= 0) return toast.error('Amount must be positive');
    setLoading(true);
    try {
      if (editData) {
        await transactionAPI.update(editData._id, form);
        toast.success('Transaction updated!');
      } else {
        await transactionAPI.create(form);
        toast.success('Transaction added!');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCat.trim()) return;
    try {
      const res = await categoryAPI.create({ name: newCat.trim(), type: form.type, icon: '📁', color: '#6366f1' });
      setCategories(prev => [...prev, res.data.data]);
      setForm(f => ({ ...f, category: newCat.trim() }));
      setNewCat('');
      setShowNewCat(false);
      toast.success('Category created!');
    } catch { toast.error('Failed to create category'); }
  };

  return (
    <Modal open={open} onClose={onClose} title={editData ? 'Edit Transaction' : 'Add Transaction'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type toggle */}
        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          {['expense', 'income'].map(t => (
            <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t, category: '' }))}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${form.type === t ? (t === 'income' ? 'bg-emerald-500 text-white shadow' : 'bg-rose-500 text-white shadow') : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}>
              {t === 'income' ? '💚 Income' : '🔴 Expense'}
            </button>
          ))}
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Amount <span className="text-rose-400">*</span></label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">₹</span>
            <input className="input-field pl-8" type="number" min="0.01" step="0.01" placeholder="0.00" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Category <span className="text-rose-400">*</span></label>
          <div className="grid grid-cols-3 gap-1.5 max-h-40 overflow-y-auto pr-1">
            {filteredCats.map(cat => (
              <button key={cat._id} type="button" onClick={() => setForm(f => ({ ...f, category: cat.name }))}
                className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium border transition-all ${form.category === cat.name ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                <span>{cat.icon}</span><span className="truncate">{cat.name}</span>
              </button>
            ))}
            <button type="button" onClick={() => setShowNewCat(!showNewCat)}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium border border-dashed border-slate-300 dark:border-slate-600 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition-all">
              + New
            </button>
          </div>
          {showNewCat && (
            <div className="flex gap-2 mt-2">
              <input className="input-field flex-1" placeholder="Category name" value={newCat} onChange={e => setNewCat(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())} />
              <button type="button" onClick={handleAddCategory} className="btn-primary px-3">Add</button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
            <input className="input-field" placeholder="e.g. Lunch at office" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          {/* Date */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Date <span className="text-rose-400">*</span></label>
            <input className="input-field" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Notes</label>
          <textarea className="input-field resize-none" rows={2} placeholder="Optional notes..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
        </div>

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Saving...' : editData ? 'Update' : 'Add Transaction'}</button>
        </div>
      </form>
    </Modal>
  );
};

export default TransactionForm;
