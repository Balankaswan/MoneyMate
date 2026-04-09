const Subscription = require('../models/Subscription');
const Transaction = require('../models/Transaction');

exports.getSubscriptions = async (req, res) => {
    try {
        const subscriptions = await Subscription.find({ user: req.user.id }).sort({ amount: -1 });
        res.json({ success: true, data: subscriptions });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.detectSubscriptions = async (req, res) => {
    try {
        const userId = req.user.id;
        // Look at past 6 months of expenses
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const transactions = await Transaction.find({
            user: userId,
            type: 'expense',
            date: { $gte: sixMonthsAgo }
        }).sort({ date: 1 });

        // Simple detection logic: Group by description
        const groups = {};
        transactions.forEach(t => {
            const desc = t.description || t.category;
            if (!groups[desc]) groups[desc] = [];
            groups[desc].push(t);
        });

        const detected = [];
        for (const desc in groups) {
            const txs = groups[desc];
            if (txs.length >= 2) {
                // Check if amounts are similar (within 5% margin)
                const amounts = txs.map(t => t.amount);
                const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
                const variations = amounts.filter(a => Math.abs(a - avg) / avg > 0.05);

                if (variations.length === 0) {
                    // Likely recurring
                    // Check if already exists
                    const existing = await Subscription.findOne({ user: userId, name: desc });
                    if (!existing) {
                        const sub = await Subscription.create({
                            user: userId,
                            name: desc,
                            amount: avg,
                            category: mapCategory(desc, txs[0].category),
                            lastDetectedDate: txs[txs.length - 1].date,
                            originalTransactionIds: txs.map(t => t._id),
                            frequency: 'monthly' // Default to monthly
                        });
                        detected.push(sub);
                    }
                }
            }
        }

        res.json({ success: true, count: detected.length, data: detected });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.analyzeSubscriptions = async (req, res) => {
    try {
        const subs = await Subscription.find({ user: req.user.id, status: 'active' });

        for (const sub of subs) {
            let decision = 'KEEP';
            let reason = 'Active service with regular usage.';
            let isGhost = false;
            let isDuplicate = false;

            // Logic for Ghost detection
            if (sub.usageLevel === 'Never' || (sub.usageLevel === 'Rare' && sub.amount > 500)) {
                decision = 'CANCEL';
                reason = 'Extremely low usage detected for several months.';
                isGhost = true;
            } else if (sub.usageLevel === 'Rare') {
                decision = 'CONSIDER';
                reason = 'Usage is infrequent. Consider if this still provides value.';
            }

            // High cost logic
            if (sub.amount > 2000 && sub.usageLevel !== 'Frequent') {
                decision = 'CANCEL';
                reason = 'High cost with low usage level.';
            }

            // Duplicate detection
            const sameCategory = subs.filter(s => s.category === sub.category && s._id.toString() !== sub._id.toString());
            if (sameCategory.length > 0) {
                isDuplicate = true;
                if (decision !== 'CANCEL') {
                    decision = 'CONSIDER';
                    reason = `Duplicate ${sub.category} service found (also paying for ${sameCategory[0].name}).`;
                }
            }

            sub.aiDecision = decision;
            sub.aiReason = reason;
            sub.isGhost = isGhost;
            sub.isDuplicate = isDuplicate;
            await sub.save();
        }

        res.json({ success: true, message: 'Analysis complete', data: await Subscription.find({ user: req.user.id }) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.trimSubscriptions = async (req, res) => {
    try {
        const cancelledIds = req.body.ids; // IDs user wants to "trim"
        const results = [];

        for (const id of cancelledIds) {
            const sub = await Subscription.findOne({ _id: id, user: req.user.id });
            if (sub) {
                // Generate a mock cancellation email
                const emailTemplate = `Subject: Termination of Subscription - ${sub.name}\n\nDear Support Team,\n\nPlease terminate my subscription for ${sub.name} associated with this email address immediately. I would also like to request a confirmation once this is processed.\n\nThank you,\n${req.user.name || 'User'}`;

                results.push({
                    name: sub.name,
                    action: 'CANCELLED',
                    email: emailTemplate
                });

                sub.status = 'cancelled';
                await sub.save();
            }
        }

        res.json({ success: true, results });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateSubscription = async (req, res) => {
    try {
        const sub = await Subscription.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });
        res.json({ success: true, data: sub });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.seedDemoData = async (req, res) => {
    try {
        const userId = req.user.id;
        await Subscription.deleteMany({ user: userId }); // Clear old ones for demo

        const demoSubs = [
            { name: 'Netflix', amount: 649, category: 'OTT', usageLevel: 'Rare', usageFrequency: 2, aiDecision: 'CONSIDER', aiReason: 'Low usage detected.' },
            { name: 'Spotify Premium', amount: 119, category: 'Music', usageLevel: 'Frequent', usageFrequency: 20 },
            { name: 'Cult.fit Gym', amount: 1500, category: 'Fitness', usageLevel: 'Never', usageFrequency: 0, isGhost: true, aiDecision: 'CANCEL', aiReason: 'Zero attendance recorded.' },
            { name: 'Adobe Creative Cloud', amount: 4230, category: 'SaaS', usageLevel: 'Rare', usageFrequency: 1, aiDecision: 'CANCEL', aiReason: 'Very high cost relative to usage.' },
            { name: 'Amazon Prime', amount: 1499, category: 'OTT', usageLevel: 'Frequent', frequency: 'yearly', usageFrequency: 15 },
            { name: 'Disney+ Hotstar', amount: 299, category: 'OTT', usageLevel: 'Rare', usageFrequency: 1, isDuplicate: true, aiDecision: 'CANCEL', aiReason: 'Duplicate OTT service.' }
        ];

        const created = await Subscription.insertMany(demoSubs.map(s => ({ ...s, user: userId })));
        res.json({ success: true, data: created });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

function mapCategory(name, existingCat) {
    const n = name.toLowerCase();
    if (n.includes('netflix') || n.includes('hotstar') || n.includes('prime') || n.includes('hulu') || n.includes('zee5')) return 'OTT';
    if (n.includes('spotify') || n.includes('gaana') || n.includes('apple music') || n.includes('wynk')) return 'Music';
    if (n.includes('gym') || n.includes('fitness') || n.includes('cult') || n.includes('yoga')) return 'Fitness';
    if (n.includes('adobe') || n.includes('github') || n.includes('notion') || n.includes('openai') || n.includes('canva')) return 'SaaS';
    return 'Others';
}
