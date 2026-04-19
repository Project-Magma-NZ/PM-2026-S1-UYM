import { cn } from '../../lib/utils';
import { YEARLY_AGE_GROUPS } from '../../data/mockData';

const AgeDistributionGrid = () => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
    <h3 className="text-base font-black text-slate-900 mb-4">Age Distribution</h3>
    <div className="grid grid-cols-3 gap-3">
      {YEARLY_AGE_GROUPS.map((item, i) => (
        <div key={i} className="bg-slate-50 p-3 rounded-xl text-center">
          <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mb-1">{item.label}</p>
          <p className="text-2xl font-black text-slate-900">{item.value}</p>
          <p className={cn("text-[8px] font-bold mt-1", item.change.includes('+') ? "text-emerald-600" : "text-slate-400")}>
            {item.change}
          </p>
          <div className={cn("h-1 w-8 mx-auto mt-1.5 rounded-full", item.color)} />
        </div>
      ))}
    </div>
  </div>
);

export default AgeDistributionGrid;
