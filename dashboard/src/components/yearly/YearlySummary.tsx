import { TrendingUp } from 'lucide-react';
import { YEARLY_SUMMARY } from '../../data/mockData';

const YearlySummary = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
    <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
      <div className="relative z-10">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">TOTAL LIVES IMPACTED</p>
        <h3 className="text-4xl font-black text-slate-900 mb-1">{YEARLY_SUMMARY.livesImpacted}</h3>
        <div className="flex items-center gap-1 text-emerald-600 font-bold text-sm">
          <TrendingUp size={14} />
          <span>{YEARLY_SUMMARY.livesImpactedChange}</span>
        </div>
      </div>
      <div className="absolute -right-12 -top-12 w-48 h-48 bg-brand-cream/30 rounded-full" />
    </div>

    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">ACTIVE MATCHES</p>
      <h3 className="text-4xl font-black text-slate-900 mb-3">{YEARLY_SUMMARY.activeMatches}</h3>
      <div className="space-y-1.5">
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-brand-yellow rounded-full" style={{ width: `${YEARLY_SUMMARY.matchesGoalPercent}%` }} />
        </div>
        <p className="text-[10px] text-slate-400 font-bold">{YEARLY_SUMMARY.matchesGoalPercent}% of yearly goal reached</p>
      </div>
    </div>

    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">MENTOR RETENTION</p>
      <h3 className="text-4xl font-black text-slate-900 mb-1">{YEARLY_SUMMARY.mentorRetention}</h3>
      <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
        <span>Industry leading</span>
      </div>
    </div>
  </div>
);

export default YearlySummary;
