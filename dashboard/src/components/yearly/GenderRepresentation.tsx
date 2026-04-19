import { TrendingUp } from 'lucide-react';
import { cn } from '../../lib/utils';
import { YEARLY_GENDER } from '../../data/mockData';

const GenderRepresentation = () => {
  const [male, female, other] = YEARLY_GENDER;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-black text-slate-900">Gender Representation</h3>
        <div className="w-5 h-5 rounded-full border border-slate-200 flex items-center justify-center text-[10px] text-slate-400 font-bold">i</div>
      </div>
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-8">
          {[male, female].map((gender, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex justify-between items-end">
                <span className="text-sm font-bold text-slate-600">{gender.label}</span>
                <span className="text-lg font-black text-slate-900">{gender.value}</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full", gender.color)}
                  style={{ width: `${gender.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-slate-900" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {other.label}: {other.value}
            </span>
          </div>
          <div className="flex items-center gap-1 text-emerald-600 font-bold text-[10px] uppercase tracking-widest">
            <TrendingUp size={12} />
            <span>Rising Inclusivity Trend</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenderRepresentation;
