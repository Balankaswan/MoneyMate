import React, { useState, useEffect } from 'react';
import { subscriptionAPI } from '../../utils/api';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { PageHeader, EmptyState, Badge, Modal, StatCard } from '../shared/UI';
import {
    Search, Sparkles, Scissors, Trash2, Mail,
    ExternalLink, AlertCircle, CheckCircle, Info, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORY_ICONS = { OTT: '🎬', Music: '🎵', Fitness: '💪', SaaS: '💻', Insurance: '🛡️', Utilities: '⚡', Others: '💰' };

const SubscriptionsPage = () => {
    const [subs, setSubs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [trimResults, setTrimResults] = useState(null);

    const loadSubs = async () => {
        setLoading(true);
        try {
            const res = await subscriptionAPI.getAll();
            setSubs(res.data.data);
        } catch { toast.error('Failed to load subscriptions'); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadSubs(); }, []);

    const handleDetect = async () => {
        toast.promise(subscriptionAPI.detect(), {
            loading: 'Analyzing your transactions...',
            success: (res) => {
                loadSubs();
                return `${res.data.count} new subscriptions detected!`;
            },
            error: 'Detection failed'
        });
    };

    const handleAnalyze = async () => {
        setAnalyzing(true);
        try {
            const res = await subscriptionAPI.analyze();
            setSubs(res.data.data);
            toast.success('AI Analysis complete! Review suggestions below.', { icon: '🧠' });
        } catch { toast.error('Analysis failed'); }
        finally { setAnalyzing(false); }
    };

    const handleTrim = async () => {
        const toCancel = subs.filter(s => s.aiDecision === 'CANCEL' && s.status === 'active');
        if (toCancel.length === 0) {
            toast.error('No "CANCEL" suggestions found. You can manually flag items first.');
            return;
        }

        try {
            const res = await subscriptionAPI.trim(toCancel.map(s => s._id));
            setTrimResults(res.data.results);
            loadSubs();
            toast.success('Financial Trim complete! 🎉', { duration: 5000 });
        } catch { toast.error('Trim failed'); }
    };

    const handleUpdate = async (id, data) => {
        try {
            await subscriptionAPI.update(id, data);
            loadSubs();
            toast.success('Updated');
        } catch { toast.error('Update failed'); }
    };

    const handleSeed = async () => {
        try {
            await subscriptionAPI.seed();
            loadSubs();
            toast.success('Demo data loaded!');
        } catch { toast.error('Seeding failed'); }
    };

    const stats = {
        total: subs.filter(s => s.status === 'active').reduce((s, x) => s + x.amount, 0),
        waste: subs.filter(s => s.status === 'active' && s.aiDecision === 'CANCEL').reduce((s, x) => s + x.amount, 0),
        count: subs.filter(s => s.status === 'active').length
    };

    return (
        <div className="p-4 sm:p-6 space-y-6 animate-fade-in">
            <PageHeader
                title="Subscription Surgeon"
                subtitle="AI-powered financial trim agent"
                actions={
                    <div className="flex gap-2">
                        <button onClick={handleSeed} className="btn-secondary flex items-center gap-2">
                            <RefreshCw size={16} /> Demo Data
                        </button>
                        <button onClick={handleDetect} className="btn-secondary flex items-center gap-2">
                            <Search size={16} /> Detect
                        </button>
                        <button onClick={handleAnalyze} className="btn-secondary flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                            <Sparkles size={16} /> {analyzing ? 'Analyzing...' : 'AI Analyze'}
                        </button>
                        <button onClick={handleTrim} className="btn-primary flex items-center gap-2">
                            <Scissors size={16} /> Financial Trim
                        </button>
                    </div>
                }
            />

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard title="Monthly Spend" value={stats.total} icon={<Sparkles size={20} />} color="indigo" subtitle={`${stats.count} Active Subscriptions`} />
                <StatCard title="Potential Waste" value={stats.waste} icon={<Trash2 size={20} />} color="rose" subtitle="Identified for cancellation" />
                <StatCard title="Monthly Savings" value={stats.waste} icon={<CheckCircle size={20} />} color="emerald" subtitle="If all suggestions followed" />
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => <div key={i} className="h-64 shimmer rounded-2xl" />)}
                </div>
            ) : subs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subs.map(sub => (
                        <SubscriptionCard key={sub._id} sub={sub} onUpdate={handleUpdate} />
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-12">
                    <EmptyState
                        icon="🏥"
                        title="Your subscriptions need a checkup"
                        description="Run detection or use demo data to see Subscription Surgeon in action."
                        action={<button onClick={handleSeed} className="btn-primary">Load Demo Data</button>}
                    />
                </div>
            )}

            {/* Trim Results Modal */}
            <Modal open={!!trimResults} onClose={() => setTrimResults(null)} title="Trim Execution Report" size="lg">
                <div className="space-y-4">
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800 flex items-start gap-3">
                        <Info size={18} className="text-indigo-600 mt-1" />
                        <p className="text-sm text-indigo-700 dark:text-indigo-400 font-medium">
                            Subscription Surgeon has successfully processed your trim request. We've generated cancellation templates and marked the services as cancelled.
                        </p>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {trimResults?.map((r, i) => (
                            <div key={i} className="py-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <CheckCircle size={16} className="text-emerald-500" /> {r.name}
                                    </div>
                                    <Badge color="emerald">ACTION COMPLETED</Badge>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 font-mono text-xs text-slate-500 whitespace-pre-wrap border border-slate-100 dark:border-slate-700">
                                    {r.email}
                                </div>
                                <div className="flex gap-2">
                                    <button className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline">
                                        <Mail size={12} /> Send Email
                                    </button>
                                    <button className="text-xs font-semibold text-slate-500 flex items-center gap-1 hover:underline">
                                        <ExternalLink size={12} /> Visit Support Page
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => setTrimResults(null)} className="btn-primary w-full mt-4">Done</button>
                </div>
            </Modal>
        </div>
    );
};

const SubscriptionCard = ({ sub, onUpdate }) => {
    const isCancelled = sub.status === 'cancelled';

    const getDecisionStyles = () => {
        if (sub.aiDecision === 'KEEP') return { border: 'border-emerald-200 dark:border-emerald-800', bg: 'bg-emerald-50 dark:bg-emerald-900/10', color: 'text-emerald-700 dark:text-emerald-400', badge: 'emerald' };
        if (sub.aiDecision === 'CANCEL') return { border: 'border-rose-200 dark:border-rose-800', bg: 'bg-rose-50 dark:bg-rose-900/10', color: 'text-rose-700 dark:text-rose-400', badge: 'rose' };
        return { border: 'border-amber-200 dark:border-amber-800', bg: 'bg-amber-50 dark:bg-amber-900/10', color: 'text-amber-700 dark:text-amber-400', badge: 'amber' };
    };

    const style = getDecisionStyles();

    return (
        <div className={`rounded-2xl border transition-all overflow-hidden ${isCancelled ? 'opacity-60 bg-slate-50 grayscale border-slate-200' : `${style.border} group`}`}>
            <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-2xl shadow-sm">
                            {CATEGORY_ICONS[sub.category] || '💰'}
                        </div>
                        <div>
                            <div className="font-bold text-slate-900 dark:text-white font-display text-lg">{sub.name}</div>
                            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">{sub.category} · {sub.frequency}</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xl font-bold text-slate-900 dark:text-white num-display">{formatCurrency(sub.amount)}</div>
                        {sub.isGhost && <Badge color="purple">GHOST 👻</Badge>}
                        {sub.isDuplicate && <Badge color="amber">DUPLICATE ⚠️</Badge>}
                    </div>
                </div>

                {/* AI Analysis Row */}
                <div className={`p-3 rounded-xl mb-4 flex items-start gap-2 border ${style.bg} ${style.border}`}>
                    <AlertCircle size={16} className={`${style.color} mt-0.5 flex-shrink-0`} />
                    <div className="space-y-1">
                        <div className={`text-xs font-bold uppercase tracking-widest ${style.color}`}>AI Recommendation: {sub.aiDecision}</div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{sub.aiReason}</p>
                    </div>
                </div>

                {/* Usage inputs */}
                <div className="space-y-3 mb-1">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500">Usage Level</span>
                        <select
                            value={sub.usageLevel}
                            disabled={isCancelled}
                            onChange={(e) => onUpdate(sub._id, { usageLevel: e.target.value })}
                            className="text-xs font-bold bg-transparent focus:outline-none text-indigo-600 dark:text-indigo-400"
                        >
                            <option value="Frequent">Frequent ✅</option>
                            <option value="Rare">Rare ⚠️</option>
                            <option value="Never">Never ❌</option>
                        </select>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-500 ${sub.usageLevel === 'Frequent' ? 'bg-emerald-500 w-full' : sub.usageLevel === 'Rare' ? 'bg-amber-500 w-1/3' : 'bg-rose-500 w-[5%]'}`}
                        />
                    </div>
                </div>
            </div>

            {!isCancelled && (
                <div className="px-5 py-3 bg-white dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50 transition-colors">
                    <span className="text-xs text-slate-500 font-medium">Last detected {formatDate(sub.lastDetectedDate || sub.createdAt)}</span>
                    <button className="p-1.5 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-slate-400 hover:text-rose-600 rounded-lg transition-colors">
                        <Trash2 size={16} />
                    </button>
                </div>
            )}
            {isCancelled && (
                <div className="px-5 py-3 text-center bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-500 tracking-widest uppercase">
                    Cancelled via trim agent
                </div>
            )}
        </div>
    );
};

export default SubscriptionsPage;
