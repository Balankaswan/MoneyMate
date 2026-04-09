const Transaction = require('../models/Transaction');
const EMI = require('../models/EMI');
const Subscription = require('../models/Subscription');

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Current month transactions
    const monthlyTransactions = await Transaction.find({
      user: userId,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const monthlyIncome = monthlyTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const monthlyExpense = monthlyTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    // All-time totals
    const allTransactions = await Transaction.find({ user: userId });
    const totalIncome = allTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = allTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    // EMI summary
    const emis = await EMI.find({ user: userId, isActive: true });
    const totalEMI = emis.reduce((s, e) => s + e.emiAmount, 0);
    const upcomingEMIs = [];
    const overdueEMIs = [];

    emis.forEach(emi => {
      emi.payments.forEach((p, idx) => {
        if (p.status === 'pending') upcomingEMIs.push({ emiId: emi._id, loanName: emi.loanName, amount: p.amount, dueDate: p.dueDate, month: p.month, paymentIndex: idx });
        if (p.status === 'overdue') overdueEMIs.push({ emiId: emi._id, loanName: emi.loanName, amount: p.amount, dueDate: p.dueDate, month: p.month, paymentIndex: idx });
      });
    });

    upcomingEMIs.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    overdueEMIs.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    // Category breakdown (current month expenses)
    const categoryBreakdown = {};
    monthlyTransactions.filter(t => t.type === 'expense').forEach(t => {
      categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
    });

    // Last 6 months trend
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      const txns = await Transaction.find({ user: userId, date: { $gte: start, $lte: end } });
      monthlyTrend.push({
        month: d.toLocaleString('default', { month: 'short' }),
        year: d.getFullYear(),
        income: txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        expense: txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
      });
    }

    // Subscription summary
    const subs = await Subscription.find({ user: userId, status: 'active' });
    const totalSubMonthly = subs.reduce((s, x) => s + (x.frequency === 'yearly' ? x.amount / 12 : x.amount), 0);
    const potentialSavings = subs.filter(s => s.aiDecision === 'CANCEL').reduce((s, x) => s + (x.frequency === 'yearly' ? x.amount / 12 : x.amount), 0);
    const wastefulSubs = subs
      .filter(s => s.aiDecision === 'CANCEL' || s.aiDecision === 'CONSIDER')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);

    // Recent transactions
    const recentTransactions = await Transaction.find({ user: userId }).sort({ date: -1 }).limit(5);

    res.json({
      success: true,
      data: {
        balance: totalIncome - totalExpense,
        monthlyIncome,
        monthlyExpense,
        monthlySavings: monthlyIncome - monthlyExpense,
        totalIncome,
        totalExpense,
        totalEMI,
        upcomingEMIs: upcomingEMIs.slice(0, 5),
        overdueEMIs: overdueEMIs.slice(0, 5),
        categoryBreakdown,
        monthlyTrend,
        recentTransactions,
        emiCount: emis.length,
        subscriptionStats: {
          total: totalSubMonthly,
          savings: potentialSavings,
          wastefulSubs
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
