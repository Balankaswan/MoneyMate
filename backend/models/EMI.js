const mongoose = require('mongoose');

const EMIPaymentSchema = new mongoose.Schema({
  month: { type: Number, required: true }, // 1-based month number
  dueDate: { type: Date, required: true },
  paidDate: { type: Date },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'paid', 'overdue'], default: 'pending' },
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }
});

const EMISchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  loanName: { type: String, required: [true, 'Loan name is required'], trim: true },
  loanType: { type: String, enum: ['home', 'car', 'personal', 'education', 'credit_card', 'other'], default: 'other' },
  totalAmount: { type: Number, required: [true, 'Total loan amount is required'] },
  emiAmount: { type: Number, required: [true, 'EMI amount is required'] },
  interestRate: { type: Number, default: 0 },
  startDate: { type: Date, required: true },
  durationMonths: { type: Number, required: true },
  bankName: { type: String, trim: true },
  notes: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
  payments: [EMIPaymentSchema],
  createdAt: { type: Date, default: Date.now }
});

// Virtual: paid months
EMISchema.virtual('paidMonths').get(function () {
  return this.payments.filter(p => p.status === 'paid').length;
});

// Virtual: remaining months
EMISchema.virtual('remainingMonths').get(function () {
  return this.durationMonths - this.payments.filter(p => p.status === 'paid').length;
});

// Virtual: amount paid
EMISchema.virtual('amountPaid').get(function () {
  return this.payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
});

// Virtual: remaining balance
EMISchema.virtual('remainingBalance').get(function () {
  return this.totalAmount - this.amountPaid;
});

// Virtual: next due payment
EMISchema.virtual('nextDue').get(function () {
  return this.payments.find(p => p.status === 'pending' || p.status === 'overdue');
});

EMISchema.set('toJSON', { virtuals: true });
EMISchema.set('toObject', { virtuals: true });

// Generate payment schedule on save
EMISchema.pre('save', function (next) {
  if (this.isNew && this.payments.length === 0) {
    const payments = [];
    for (let i = 0; i < this.durationMonths; i++) {
      const dueDate = new Date(this.startDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      const now = new Date();
      let status = 'pending';
      if (dueDate < now) status = 'overdue';
      payments.push({ month: i + 1, dueDate, amount: this.emiAmount, status });
    }
    this.payments = payments;
  }
  next();
});

module.exports = mongoose.model('EMI', EMISchema);
