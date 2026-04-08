import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { GENDER_DISTRIBUTION } from '../../data/mockData';

const GenderDistributionChart = () => {
  const dominant = [...GENDER_DISTRIBUTION].sort((a, b) => b.value - a.value)[0];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
      <h3 className="text-base font-black text-slate-900 mb-4">Gender Distribution</h3>
      <div className="flex-1 relative flex items-center justify-center">
        <div className="absolute text-center">
          <p className="text-3xl font-black text-slate-900">{Math.round(dominant.value)}%</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{dominant.name} Majority</p>
        </div>
        <ResponsiveContainer width="100%" height={210}>
          <PieChart>
            <Pie data={GENDER_DISTRIBUTION} innerRadius={65} outerRadius={82} paddingAngle={5} dataKey="value">
              {GENDER_DISTRIBUTION.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-3 mt-4">
        {GENDER_DISTRIBUTION.map((item, i) => (
          <div key={i} className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm font-bold text-slate-600">{item.name}</span>
            </div>
            <span className="text-sm font-black text-slate-900">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GenderDistributionChart;
