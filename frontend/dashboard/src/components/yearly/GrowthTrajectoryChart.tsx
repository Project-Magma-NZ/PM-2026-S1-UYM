import { useState, useEffect } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { fetchMonthlyAllPlatformData } from '../../services/analytics';

interface MonthlyPoint {
  month: string;
  website: number;
  instagram: number;
}

const GrowthTrajectoryChart = () => {
  const [data, setData] = useState<MonthlyPoint[]>([]);

  useEffect(() => {
    fetchMonthlyAllPlatformData().then(setData).catch(() => {});
  }, []);

  const totalWebsite = data.reduce((s, d) => s + d.website, 0);
  const totalInstagram = data.reduce((s, d) => s + (d as any).instagram, 0);

  return (
    <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-base font-black text-slate-900">Website vs Instagram Reach</h3>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-900" />
            <span className="text-xs font-bold text-slate-500">Website (GA4)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-brand-brown" />
            <span className="text-xs font-bold text-slate-500">Instagram Reach</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Website Visitors</p>
          <p className="text-xl font-black text-slate-900">{totalWebsite.toLocaleString()}</p>
          <p className="text-[10px] text-emerald-600 font-bold mt-1">Google Analytics</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Instagram Reach</p>
          {totalInstagram > 0 ? (
            <>
              <p className="text-xl font-black text-slate-900">{totalInstagram.toLocaleString()}</p>
              <p className="text-[10px] text-emerald-600 font-bold mt-1">Meta API — Real data</p>
            </>
          ) : (
            <>
              <p className="text-xl font-black text-slate-300">—</p>
              <p className="text-[10px] text-amber-500 font-bold mt-1">Loading…</p>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <defs>
              <linearGradient id="colorWebsite" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0f172a" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorInstagram" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6B5600" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6B5600" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
              domain={['dataMin - 5', 'dataMax + 5']}
              width={30}
            />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            />
            <Area
              type="monotone"
              dataKey="website"
              name="Website Visitors"
              stroke="#0f172a"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorWebsite)"
            />
            <Area
              type="monotone"
              dataKey="instagram"
              name="Instagram Reach"
              stroke="#6B5600"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorInstagram)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default GrowthTrajectoryChart;
