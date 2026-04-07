const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // null = default/global
  name: { type: String, required: true, trim: true },
  icon: { type: String, default: '💰' },
  color: { type: String, default: '#6366f1' },
  type: { type: String, enum: ['income', 'expense', 'both'], default: 'both' },
  isDefault: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Category', CategorySchema);
