const User = require('../models/User');
const Category = require('../models/Category');

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  res.status(statusCode).json({
    success: true,
    token,
    user: { id: user._id, name: user.name, email: user.email, currency: user.currency, darkMode: user.darkMode, monthlyBudget: user.monthlyBudget }
  });
};

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

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });
    const user = await User.create({ name, email, password });
    // Create default categories for user
    await Category.insertMany(defaultCategories.map(c => ({ ...c, user: user._id })));
    sendTokenResponse(user, 201, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Please provide email and password' });
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, currency, darkMode, monthlyBudget } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, { name, currency, darkMode, monthlyBudget }, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
