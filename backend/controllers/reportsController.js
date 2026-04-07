const Transaction = require('../models/Transaction');
const EMI = require('../models/EMI');

exports.getMonthlyReport = async (req, res) => {
  try {
    const { year, month } = req.query;
    const y = parseInt(year) || new Date().getFullYear();
    const m = parseInt(month) || new Date().getMonth() + 1;
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59);

    const transactions = await Transaction.find({ user: req.user.id, date: { $gte: start, $lte: end } }).sort({ date: -1 });
    const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    const categoryBreakdown = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      if (!categoryBreakdown[t.category]) categoryBreakdown[t.category] = { total: 0, count: 0, transactions: [] };
      categoryBreakdown[t.category].total += t.amount;
      categoryBreakdown[t.category].count++;
      categoryBreakdown[t.category].transactions.push(t);
    });

    // Daily breakdown
    const dailyBreakdown = {};
    transactions.forEach(t => {
      const day = new Date(t.date).getDate();
      if (!dailyBreakdown[day]) dailyBreakdown[day] = { income: 0, expense: 0 };
      dailyBreakdown[day][t.type] += t.amount;
    });

    res.json({ success: true, data: { transactions, income, expense, savings: income - expense, categoryBreakdown, dailyBreakdown, period: { year: y, month: m } } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getYearlyReport = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31, 23, 59, 59);

    const transactions = await Transaction.find({ user: req.user.id, date: { $gte: start, $lte: end } });
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    const monthlyBreakdown = Array.from({ length: 12 }, (_, i) => {
      const txns = transactions.filter(t => new Date(t.date).getMonth() === i);
      return {
        month: new Date(year, i, 1).toLocaleString('default', { month: 'short' }),
        income: txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        expense: txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
      };
    });

    const categoryBreakdown = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
    });

    res.json({ success: true, data: { totalIncome, totalExpense, savings: totalIncome - totalExpense, monthlyBreakdown, categoryBreakdown, year } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
