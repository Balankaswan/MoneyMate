const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  amount: { type: Number, required: [true, 'Amount is required'], min: [0.01, 'Amount must be positive'] },
  category: { type: String, required: [true, 'Category is required'], trim: true },
  description: { type: String, trim: true, maxlength: 200 },
  date: { type: Date, required: true, default: Date.now },
  notes: { type: String, trim: true, maxlength: 500 },
  isEMI: { type: Boolean, default: false },
  emiId: { type: mongoose.Schema.Types.ObjectId, ref: 'EMI' },
  tags: [{ type: String, trim: true }],
  createdAt: { type: Date, default: Date.now }
});

TransactionSchema.index({ user: 1, date: -1 });
TransactionSchema.index({ user: 1, type: 1 });
TransactionSchema.index({ user: 1, category: 1 });

module.exports = mongoose.model('Transaction', TransactionSchema);
