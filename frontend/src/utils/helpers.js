export const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount || 0);
};

export const formatDate = (date, format = 'short') => {
  if (!date) return '';
  const d = new Date(date);
  if (format === 'short') return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  if (format === 'long') return d.toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  if (format === 'month-year') return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  if (format === 'input') return d.toISOString().split('T')[0];
  return d.toLocaleDateString('en-IN');
};

export const formatRelativeDate = (date) => {
  const d = new Date(date);
  const now = new Date();
  const diff = now - d;
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return formatDate(date);
};

export const getDaysUntil = (date) => {
  const d = new Date(date);
  const now = new Date();
  const diff = d - now;
  return Math.ceil(diff / 86400000);
};

export const getMonthName = (month) => {
  return new Date(2000, month - 1, 1).toLocaleString('default', { month: 'long' });
};

export const CATEGORY_COLORS = {
  'Food & Dining': '#f97316',
  'Shopping': '#ec4899',
  'Bills & Utilities': '#eab308',
  'Entertainment': '#8b5cf6',
  'Travel': '#06b6d4',
  'Health & Fitness': '#10b981',
  'Education': '#3b82f6',
  'Others': '#6b7280',
  'EMI Payment': '#ef4444',
  'Salary': '#10b981',
  'Freelance': '#6366f1',
  'Investment': '#f59e0b',
  'Business': '#14b8a6',
  'Gift': '#ec4899',
  'Other Income': '#84cc16',
};

export const getCategoryColor = (category) => CATEGORY_COLORS[category] || '#6366f1';

export const exportToExcel = (data, filename) => {
  const XLSX = require('xlsx');
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  XLSX.writeFile(wb, `${filename}.xlsx`);
};
