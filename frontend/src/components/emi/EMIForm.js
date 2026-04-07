import React, { useState, useEffect } from 'react';
import { Modal } from '../shared/UI';
import { emiAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const DEFAULTS = {
  loanName: '', loanType: 'personal', totalAmount: '', emiAmount: '',
  interestRate: '', startDate: new Date().toISOString().split('T')[0],
  durationMonths: '', bankName: '', notes: ''
};

const LOAN_TYPES = [
  { value: 'home', label: '🏠 Home Loan' },
  { value: 'car', label: '🚗 Car Loan' },
  { value: 'personal', label: '👤 Personal Loan' },
  { value: 'education', label: '📚 Education Loan' },
  { value: 'credit_card', label: '💳 Credit Card' },
  { value: 'other', label: '📦 Other' },
];

const EMIForm = ({ open, onClose, onSaved, editData }) => {
  const [form, setForm] = useState(DEFAULTS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (editData) {
        setForm({
          loanName: editData.loanName,
          loanType: editData.loanType,
          totalAmount: editData.totalAmount,
          emiAmount: editData.emiAmount,
          interestRate: editData.interestRate || '',
          startDate: new Date(editData.startDate).toISOString().split('T')[0],
          durationMonths: editData.durationMonths,
          bankName: editData.bankName || '',
          notes: editData.notes || ''
        });
      } else {
        setForm(DEFAULTS);
      }
    }
  }, [open, editData]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  // Auto-calculate EMI if total, duration, rate are filled
  const calcEMI = () => {
    const P = parseFloat(form.totalAmount);
    const n = parseInt(form.durationMonths);
    const r = parseFloat(form.interestRate) / 100 / 12;
    if (P && n && r > 0) {
      const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      set('emiAmount', emi.toFixed(0));
    } else if (P && n && !r) {
      set('emiAmount', (P / n).toFixed(0));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.loanName || !form.totalAmount || !form.emiAmount || !form.durationMonths || !form.startDate) {
      return toast.error('Please fill all required fields');
    }
    setLoading(true);
    try {
      if (editData) {
        await emiAPI.update(editData._id, form);
        toast.success('EMI updated!');
      } else {
        await emiAPI.create(form);
        toast.success('EMI added successfully!');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save EMI');
    } finally {
      setLoading(false);
    }
  };

  const totalPayable = parseFloat(form.emiAmount || 0) * parseInt(form.durationMonths || 0);
  const totalInterest = totalPayable - parseFloat(form.totalAmount || 0);

  return (
    <Modal open={open} onClose={onClose} title={editData ? 'Edit EMI' : 'Add New EMI'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Loan type selector */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Loan Type</label>
          <div className="grid grid-cols-3 gap-2">
            {LOAN_TYPES.map(lt => (
              <button key={lt.value} type="button" onClick={() => set('loanType', lt.value)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${form.loanType === lt.value ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'}`}>
                {lt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Loan Name <span className="text-rose-400">*</span></label>
            <input className="input-field" placeholder="e.g. Home Loan SBI" value={form.loanName} onChange={e => set('loanName', e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Bank / Lender</label>
            <input className="input-field" placeholder="e.g. HDFC Bank" value={form.bankName} onChange={e => set('bankName', e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Total Loan Amount <span className="text-rose-400">*</span></label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">₹</span>
              <input className="input-field pl-8" type="number" min="1" placeholder="500000" value={form.totalAmount} onChange={e => set('totalAmount', e.target.value)} required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Interest Rate (% p.a.)</label>
            <input className="input-field" type="number" min="0" step="0.1" placeholder="8.5" value={form.interestRate} onChange={e => set('interestRate', e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Duration (months) <span className="text-rose-400">*</span></label>
            <input className="input-field" type="number" min="1" max="360" placeholder="60" value={form.durationMonths} onChange={e => set('durationMonths', e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Start Date <span className="text-rose-400">*</span></label>
            <input className="input-field" type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} required />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            EMI Amount <span className="text-rose-400">*</span>
            {form.totalAmount && form.durationMonths && (
              <button type="button" onClick={calcEMI} className="ml-2 text-xs text-indigo-500 hover:underline font-normal">Auto-calculate</button>
            )}
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">₹</span>
            <input className="input-field pl-8" type="number" min="1" placeholder="15000" value={form.emiAmount} onChange={e => set('emiAmount', e.target.value)} required />
          </div>
        </div>

        {/* Summary preview */}
        {form.emiAmount && form.durationMonths && form.totalAmount && (
          <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
            <div className="text-center">
              <div className="text-xs text-slate-400 mb-1">Total Payable</div>
              <div className="font-bold text-slate-800 dark:text-white text-sm">₹{Math.round(totalPayable).toLocaleString('en-IN')}</div>
            </div>
            <div className="text-center border-x border-slate-200 dark:border-slate-700">
              <div className="text-xs text-slate-400 mb-1">Total Interest</div>
              <div className={`font-bold text-sm ${totalInterest > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                ₹{Math.round(Math.max(0, totalInterest)).toLocaleString('en-IN')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-400 mb-1">Monthly EMI</div>
              <div className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">₹{parseFloat(form.emiAmount).toLocaleString('en-IN')}</div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Notes</label>
          <textarea className="input-field resize-none" rows={2} placeholder="Any additional notes..." value={form.notes} onChange={e => set('notes', e.target.value)} />
        </div>

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Saving...' : editData ? 'Update EMI' : 'Add EMI'}</button>
        </div>
      </form>
    </Modal>
  );
};

export default EMIForm;
