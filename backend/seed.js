require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const EMI = require('./models/EMI');
const Category = require('./models/Category');

const defaultCategories = [
  { name: 'Food & Dining', icon: '🍔', color: '#f97316', type: 'expense', isDefault: true },
  { name: 'Shopping', icon: '🛍️', color: '#ec4899', type: 'expense', isDefault: true },
  { name: 'Bills & Utilities', icon: '⚡', color: '#eab308', type: 'expense', isDefault: true },
  { name: 'Entertainment', icon: '🎬', color: '#8b5cf6', type: 'expense', isDefault: true },
  { name: 'Travel', icon: '✈️', color: '#06b6d4', type: 'expense', isDefault: true },
  { name: 'Health & Fitness', icon: '💊', color: '#10b981', type: 'expense', isDefault: true },
  { name: 'Education', icon: '📚', color: '#3b82f6', type: 'expense', isDefault: true },
  { name: 'Others', icon: '📦', color: '#6b7280', type: 'expense', isDefault: true },
  { name: 'Salary', icon: '💼', color: '#10b981', type: 'income', isDefault: true },
  { name: 'Freelance', icon: '💻', color: '#6366f1', type: 'income', isDefault: true },
  { name: 'Investment', icon: '📈', color: '#f59e0b', type: 'income', isDefault: true },
  { name: 'Business', icon: '🏢', color: '#14b8a6', type: 'income', isDefault: true },
  { name: 'Gift', icon: '🎁', color: '#ec4899', type: 'income', isDefault: true },
  { name: 'Other Income', icon: '💰', color: '#84cc16', type: 'income', isDefault: true }
];

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await User.deleteMany({});
  await Transaction.deleteMany({});
  await EMI.deleteMany({});
  await Category.deleteMany({});
  console.log('Cleared existing data');

  // Create demo user
  const user = await User.create({ name: 'Arjun Sharma', email: 'demo@moneymate.in', password: 'demo1234', currency: 'INR', monthlyBudget: 50000 });
  console.log('Created demo user:', user.email);

  // Create categories
  await Category.insertMany(defaultCategories.map(c => ({ ...c, user: user._id })));
  console.log('Created categories');

  // Create transactions for last 6 months
  const transactions = [];
  const now = new Date();

  for (let m = 5; m >= 0; m--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();

    // Income
    transactions.push({ user: user._id, type: 'income', amount: 75000, category: 'Salary', description: 'Monthly Salary', date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 1), notes: 'Net salary after tax' });
    if (m % 2 === 0) transactions.push({ user: user._id, type: 'income', amount: Math.floor(Math.random() * 15000) + 5000, category: 'Freelance', description: 'Freelance Project', date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 15), notes: 'UI design project' });

    // Expenses
    const expenseData = [
      { category: 'Food & Dining', amounts: [850, 1200, 650, 900, 1100, 750, 1300, 480], descriptions: ['Zomato Order', 'Restaurant Dinner', 'Grocery Shopping', 'Swiggy Breakfast', 'Cafe Coffee', 'Weekly Groceries', 'Pizza Night', 'Lunch Canteen'] },
      { category: 'Shopping', amounts: [3500, 2200], descriptions: ['Myntra Shopping', 'Amazon Purchase'] },
      { category: 'Bills & Utilities', amounts: [1800, 999, 450], descriptions: ['Electricity Bill', 'Internet Bill', 'Mobile Recharge'] },
      { category: 'Entertainment', amounts: [199, 649, 800], descriptions: ['Netflix Subscription', 'Amazon Prime', 'Movie Tickets'] },
      { category: 'Travel', amounts: [350, 1200], descriptions: ['Petrol', 'Weekend Getaway Uber'] },
      { category: 'Health & Fitness', amounts: [1500, 350], descriptions: ['Gym Membership', 'Pharmacy'] },
    ];

    expenseData.forEach(({ category, amounts, descriptions }) => {
      amounts.forEach((amount, i) => {
        const day = Math.floor(Math.random() * daysInMonth) + 1;
        const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
        if (date <= now) {
          transactions.push({ user: user._id, type: 'expense', amount, category, description: descriptions[i] || descriptions[0], date });
        }
      });
    });
  }

  await Transaction.insertMany(transactions);
  console.log(`Created ${transactions.length} transactions`);

  // Create EMIs
  const emiData = [
    { loanName: 'Home Loan', loanType: 'home', totalAmount: 3500000, emiAmount: 28500, interestRate: 8.5, startDate: new Date(now.getFullYear(), now.getMonth() - 14, 5), durationMonths: 240, bankName: 'SBI' },
    { loanName: 'Car Loan', loanType: 'car', totalAmount: 800000, emiAmount: 15200, interestRate: 9.2, startDate: new Date(now.getFullYear(), now.getMonth() - 6, 10), durationMonths: 60, bankName: 'HDFC Bank' },
    { loanName: 'iPhone EMI', loanType: 'personal', totalAmount: 120000, emiAmount: 10000, interestRate: 0, startDate: new Date(now.getFullYear(), now.getMonth() - 2, 1), durationMonths: 12, bankName: 'Apple Finance' },
  ];

  for (const emiInfo of emiData) {
    const emi = new EMI({ ...emiInfo, user: user._id });
    // Mark past payments as paid
    emi.payments.forEach((payment, idx) => {
      if (payment.dueDate < now && idx < emi.durationMonths - 1) {
        payment.status = 'paid';
        payment.paidDate = new Date(payment.dueDate.getTime() + Math.random() * 5 * 86400000);
      }
    });
    await emi.save();
  }
  console.log('Created EMIs');

  console.log('\n✅ Seed completed!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Demo Login Credentials:');
  console.log('  Email:    demo@moneymate.in');
  console.log('  Password: demo1234');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
