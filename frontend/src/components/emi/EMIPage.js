import React, { useState, useEffect } from 'react';
import { emiAPI } from '../../utils/api';
import { formatCurrency, formatDate, getDaysUntil } from '../../utils/helpers';
import { PageHeader, EmptyState, ConfirmDialog, Badge } from '../shared/UI';
import EMIForm from './EMIForm';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const LOAN_ICONS = { home: '🏠', car: '🚗', personal: '👤', education: '📚', credit_card: '💳', other: '📦' };

const EMICard = ({ emi, onEdit, onDelete, onPaymentToggle }) => {
  const [expanded, setExpanded] = useState(false);
  const paidCount = emi.payments?.filter(p => p.status === 'paid').length || 0;
  const overduePayments = emi.payments?.filter(p => p.status === 'overdue') || [];
  const progress = Math.round((paidCount / emi.durationMonths) * 100);
  const amountPaid = emi.payments?.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0) || 0;
  const nextDue = emi.payments?.find(p => p.status === 'pending' || p.status === 'overdue');

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-2xl">
              {LOAN_ICONS[emi.loanType] || '📦'}
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white font-display">{emi.loanName}</div>
              <div className="text-xs text-slate-400">{emi.bankName || 'No lender specified'}</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {overduePayments.length > 0 && (
              <Badge color="rose">⚠ {overduePayments.length} Overdue</Badge>
            )}
            <button onClick={() => onEdit(emi)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 transition-colors">
              <Edit2 size={14} />
            </button>
            <button onClick={() => onDelete(emi._id)} className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/30 text-slate-400 hover:text-rose-600 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
            <div className="text-xs text-slate-400 mb-0.5">Monthly EMI</div>
            <div className="font-bold text-indigo-600 dark:text-indigo-400 text-sm num-display">{formatCurrency(emi.emiAmount)}</div>
          </div>
          <div className="text-center p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
            <div className="text-xs text-slate-400 mb-0.5">Remaining</div>
            <div className="font-bold text-rose-600 dark:text-rose-400 text-sm num-display">{formatCurrency(emi.totalAmount - amountPaid)}</div>
          </div>
          <div className="text-center p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
            <div className="text-xs text-slate-400 mb-0.5">Progress</div>
            <div className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{paidCount}/{emi.durationMonths} mo</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span>Paid {progress}%</span>
            <span>{emi.durationMonths - paidCount} months left</span>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Next due */}
        {nextDue && (
          <div className={`flex items-center gap-2 p-2.5 rounded-xl text-sm ${nextDue.status === 'overdue' ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'}`}>
            <AlertCircle size={14} />
            <span className="font-medium">
              {nextDue.status === 'overdue'
                ? `Overdue! Due was ${formatDate(nextDue.dueDate)}`
                : `Next due: ${formatDate(nextDue.dueDate)} (${getDaysUntil(nextDue.dueDate)} days)`}
            </span>
            <span className="ml-auto font-bold num-display">{formatCurrency(nextDue.amount)}</span>
          </div>
        )}
      </div>

      {/* Payment schedule toggle */}
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between px-5 py-3 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm font-semibold text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
        <span>Payment Schedule ({paidCount} paid)</span>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {/* Payment list */}
      {expanded && (
        <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          {emi.payments?.map((payment, idx) => {
            const daysLeft = getDaysUntil(payment.dueDate);
            return (
              <div key={idx} className={`flex items-center gap-3 px-5 py-3 ${payment.status === 'paid' ? 'opacity-60' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${payment.status === 'paid' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : payment.status === 'overdue' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                  {payment.month}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Month {payment.month}</div>
                  <div className="text-xs text-slate-400">
                    Due: {formatDate(payment.dueDate)}
                    {payment.status === 'paid' && payment.paidDate && ` · Paid: ${formatDate(payment.paidDate)}`}
                  </div>
                </div>
                <div className="text-sm font-bold text-slate-700 dark:text-slate-300 num-display mr-2">{formatCurrency(payment.amount)}</div>
                <button
                  onClick={() => onPaymentToggle(emi._id, idx, payment.status)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${payment.status === 'paid' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-rose-100 hover:text-rose-600' : payment.status === 'overdue' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 hover:bg-emerald-100 hover:text-emerald-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-emerald-100 hover:text-emerald-700'}`}
                >
                  {payment.status === 'paid' ? <><CheckCircle size={12} /> Paid</> : payment.status === 'overdue' ? <><XCircle size={12} /> Overdue</> : <>Pay</>}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const EMIPage = () => {
  const [emis, setEmis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const loadEMIs = async () => {
    setLoading(true);
    try {
      const res = await emiAPI.getAll();
      setEmis(res.data.data);
    } catch { toast.error('Failed to load EMIs'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadEMIs(); }, []);

  const handleDelete = async () => {
    try {
      await emiAPI.delete(deleteId);
      toast.success('EMI deleted');
      setDeleteId(null);
      loadEMIs();
    } catch { toast.error('Failed to delete EMI'); }
  };

  const handlePaymentToggle = async (emiId, paymentIndex, currentStatus) => {
    try {
      if (currentStatus === 'paid') {
        await emiAPI.markUnpaid(emiId, paymentIndex);
        toast.success('Payment marked as unpaid');
      } else {
        await emiAPI.markPaid(emiId, paymentIndex);
        toast.success('Payment marked as paid! 🎉');
      }
      loadEMIs();
    } catch { toast.error('Failed to update payment'); }
  };

  const totalMonthlyEMI = emis.reduce((s, e) => s + e.emiAmount, 0);
  const totalOutstanding = emis.reduce((s, e) => {
    const paid = e.payments?.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0) || 0;
    return s + (e.totalAmount - paid);
  }, 0);
  const overdueCount = emis.reduce((count, e) => count + (e.payments?.filter(p => p.status === 'overdue').length || 0), 0);

  return (
    <div className="p-4 sm:p-6 space-y-5 animate-fade-in">
      <PageHeader
        title="EMI Manager"
        subtitle={`${emis.length} active loan${emis.length !== 1 ? 's' : ''}`}
        actions={
          <button onClick={() => { setEditData(null); setShowForm(true); }} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add EMI
          </button>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 text-center">
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 num-display">{formatCurrency(totalMonthlyEMI)}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Monthly EMI Total</div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 text-center">
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 num-display">{formatCurrency(totalOutstanding)}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Total Outstanding</div>
        </div>
        <div className={`rounded-2xl p-4 border text-center ${overdueCount > 0 ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'}`}>
          <div className={`text-2xl font-bold ${overdueCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{overdueCount}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">{overdueCount > 0 ? '⚠ Overdue Payments' : '✓ Overdue Payments'}</div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(2)].map((_, i) => <div key={i} className="h-56 shimmer rounded-2xl" />)}</div>
      ) : emis.length ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {emis.map(emi => (
            <EMICard key={emi._id} emi={emi}
              onEdit={(e) => { setEditData(e); setShowForm(true); }}
              onDelete={setDeleteId}
              onPaymentToggle={handlePaymentToggle}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8">
          <EmptyState icon="🏦" title="No EMIs added" description="Track your loan payments, set due dates, and never miss an EMI again."
            action={<button onClick={() => setShowForm(true)} className="btn-primary">+ Add Your First EMI</button>} />
        </div>
      )}

      <EMIForm open={showForm} onClose={() => { setShowForm(false); setEditData(null); }} onSaved={loadEMIs} editData={editData} />
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete EMI" message="This will delete the EMI and all its payment records. Any transactions created from EMI payments will remain. Continue?" />
    </div>
  );
};

export default EMIPage;
