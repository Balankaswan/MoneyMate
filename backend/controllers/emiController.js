const EMI = require('../models/EMI');
const Transaction = require('../models/Transaction');

exports.getEMIs = async (req, res) => {
  try {
    const emis = await EMI.find({ user: req.user.id }).sort({ createdAt: -1 });
    // Update overdue status
    const now = new Date();
    for (const emi of emis) {
      let changed = false;
      for (const payment of emi.payments) {
        if (payment.status === 'pending' && payment.dueDate < now) {
          payment.status = 'overdue';
          changed = true;
        }
      }
      if (changed) await emi.save();
    }
    res.json({ success: true, data: emis });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createEMI = async (req, res) => {
  try {
    const emi = await EMI.create({ ...req.body, user: req.user.id });
    res.status(201).json({ success: true, data: emi });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateEMI = async (req, res) => {
  try {
    const emi = await EMI.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, req.body, { new: true, runValidators: true });
    if (!emi) return res.status(404).json({ success: false, message: 'EMI not found' });
    res.json({ success: true, data: emi });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteEMI = async (req, res) => {
  try {
    const emi = await EMI.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!emi) return res.status(404).json({ success: false, message: 'EMI not found' });
    res.json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.markEMIPaid = async (req, res) => {
  try {
    const { paymentIndex } = req.body;
    const emi = await EMI.findOne({ _id: req.params.id, user: req.user.id });
    if (!emi) return res.status(404).json({ success: false, message: 'EMI not found' });

    const payment = emi.payments[paymentIndex];
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

    payment.status = 'paid';
    payment.paidDate = new Date();

    // Create a transaction for this EMI payment
    const transaction = await Transaction.create({
      user: req.user.id,
      type: 'expense',
      amount: payment.amount,
      category: 'EMI Payment',
      description: `${emi.loanName} - EMI Month ${payment.month}`,
      date: payment.paidDate,
      isEMI: true,
      emiId: emi._id
    });
    payment.transactionId = transaction._id;

    await emi.save();
    res.json({ success: true, data: emi });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.markEMIUnpaid = async (req, res) => {
  try {
    const { paymentIndex } = req.body;
    const emi = await EMI.findOne({ _id: req.params.id, user: req.user.id });
    if (!emi) return res.status(404).json({ success: false, message: 'EMI not found' });

    const payment = emi.payments[paymentIndex];
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

    // Remove associated transaction
    if (payment.transactionId) {
      await Transaction.findByIdAndDelete(payment.transactionId);
    }

    payment.status = payment.dueDate < new Date() ? 'overdue' : 'pending';
    payment.paidDate = undefined;
    payment.transactionId = undefined;

    await emi.save();
    res.json({ success: true, data: emi });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
