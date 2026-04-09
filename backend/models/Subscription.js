const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },
    category: {
        type: String,
        enum: ['OTT', 'Music', 'Fitness', 'SaaS', 'Insurance', 'Utilities', 'Others'],
        default: 'Others'
    },
    frequency: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
    status: { type: String, enum: ['active', 'cancelled', 'paused'], default: 'active' },

    // Usage details (User Input)
    usageLevel: { type: String, enum: ['Frequent', 'Rare', 'Never'], default: 'Frequent' },
    usageFrequency: { type: Number, default: 4 }, // times per month/week

    // AI Decision fields
    aiDecision: { type: String, enum: ['KEEP', 'CONSIDER', 'CANCEL'], default: 'KEEP' },
    aiReason: { type: String },
    isGhost: { type: Boolean, default: false },
    isDuplicate: { type: Boolean, default: false },

    // Metadata
    startDate: { type: Date, default: Date.now },
    nextPaymentDate: { type: Date },
    lastDetectedDate: { type: Date },
    originalTransactionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }],

    createdAt: { type: Date, default: Date.now }
});

SubscriptionSchema.index({ user: 1, name: 1 });

module.exports = mongoose.model('Subscription', SubscriptionSchema);
