const Transaction = require('../models/Transaction');
const EMI = require('../models/EMI');

exports.getInsights = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const thisMonth = await Transaction.find({ user: userId, date: { $gte: thisMonthStart } });
    const lastMonth = await Transaction.find({ user: userId, date: { $gte: lastMonthStart, $lte: lastMonthEnd } });

    const thisIncome = thisMonth.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const thisExpense = thisMonth.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const lastExpense = lastMonth.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    const insights = [];

    // Spending trend
    if (lastExpense > 0) {
      const diff = ((thisExpense - lastExpense) / lastExpense) * 100;
      if (Math.abs(diff) > 5) {
        insights.push({
          type: diff > 0 ? 'warning' : 'success',
          icon: diff > 0 ? '📈' : '📉',
          title: diff > 0 ? 'Spending Increased' : 'Spending Decreased',
          message: `You spent ${Math.abs(diff).toFixed(1)}% ${diff > 0 ? 'more' : 'less'} this month compared to last month.`,
          value: diff
        });
      }
    }

    // Category analysis
    const thisCategories = {};
    const lastCategories = {};
    thisMonth.filter(t => t.type === 'expense').forEach(t => { thisCategories[t.category] = (thisCategories[t.category] || 0) + t.amount; });
    lastMonth.filter(t => t.type === 'expense').forEach(t => { lastCategories[t.category] = (lastCategories[t.category] || 0) + t.amount; });

    for (const [cat, amount] of Object.entries(thisCategories)) {
      const last = lastCategories[cat] || 0;
      if (last > 0) {
        const diff = ((amount - last) / last) * 100;
        if (diff > 30) {
          insights.push({
            type: 'warning',
            icon: '⚠️',
            title: `High ${cat} Spending`,
            message: `You spent ${diff.toFixed(0)}% more on ${cat} this month (₹${amount.toLocaleString('en-IN')} vs ₹${last.toLocaleString('en-IN')} last month).`,
            category: cat
          });
        }
      }
    }

    // Top spending category
    const topCat = Object.entries(thisCategories).sort((a, b) => b[1] - a[1])[0];
    if (topCat && thisExpense > 0) {
      const pct = ((topCat[1] / thisExpense) * 100).toFixed(0);
      insights.push({
        type: 'info',
        icon: '🏆',
        title: 'Top Spending Category',
        message: `${topCat[0]} is your biggest expense this month at ₹${topCat[1].toLocaleString('en-IN')} (${pct}% of total spending).`,
        category: topCat[0]
      });
    }

    // EMI burden
    const emis = await EMI.find({ user: userId, isActive: true });
    const totalEMI = emis.reduce((s, e) => s + e.emiAmount, 0);
    if (thisIncome > 0 && totalEMI > 0) {
      const emiBurden = ((totalEMI / thisIncome) * 100).toFixed(0);
      insights.push({
        type: emiBurden > 40 ? 'danger' : emiBurden > 25 ? 'warning' : 'success',
        icon: emiBurden > 40 ? '🔴' : emiBurden > 25 ? '🟡' : '🟢',
        title: 'EMI Burden Analysis',
        message: `${emiBurden}% of your income goes to EMI payments (₹${totalEMI.toLocaleString('en-IN')} / month). ${emiBurden > 40 ? 'This is quite high — consider refinancing.' : emiBurden > 25 ? 'This is manageable but watch other expenses.' : 'Great! Your EMI burden is healthy.'}`,
        value: parseFloat(emiBurden)
      });
    }

    // Savings rate
    if (thisIncome > 0) {
      const savings = thisIncome - thisExpense;
      const savingsRate = ((savings / thisIncome) * 100).toFixed(0);
      insights.push({
        type: savingsRate >= 20 ? 'success' : savingsRate >= 10 ? 'warning' : 'danger',
        icon: '💰',
        title: 'Savings Rate',
        message: `You're saving ${savingsRate}% of your income this month (₹${Math.max(0, savings).toLocaleString('en-IN')}). ${savingsRate >= 20 ? 'Excellent saving habit!' : savingsRate >= 10 ? 'Try to save more — target 20%.' : 'Critical: You need to cut expenses urgently.'}`,
        value: parseFloat(savingsRate)
      });
    }

    // Overdue EMIs alert
    const overdueCount = emis.reduce((count, emi) => count + emi.payments.filter(p => p.status === 'overdue').length, 0);
    if (overdueCount > 0) {
      insights.push({
        type: 'danger',
        icon: '🚨',
        title: 'Overdue EMI Payments',
        message: `You have ${overdueCount} overdue EMI payment${overdueCount > 1 ? 's' : ''}. Pay them immediately to avoid penalty charges.`,
        value: overdueCount
      });
    }

    res.json({ success: true, data: insights });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
