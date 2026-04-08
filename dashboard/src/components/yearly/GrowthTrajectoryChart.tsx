import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { GROWTH_TRAJECTORY } from '../../data/mockData';

const GrowthTrajectoryChart = () => (
  <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
    <div className="flex justify-between items-center mb-5">
      <h3 className="text-base font-black text-slate-900">Annual Growth Trajectory</h3>
      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-slate-900" />
          <span className="text-xs font-bold text-slate-500">2023 Actual</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-slate-200" />
          <span className="text-xs font-bold text-slate-500">2022 Baseline</span>
        </div>
      </div>
    </div>
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={GROWTH_TRAJECTORY}>
          <defs>
            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0f172a" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
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
          <YAxis hide />
          <Tooltip />
          <Area type="monotone" dataKey="actual" stroke="#0f172a" strokeWidth={3} fillOpacity={1} fill="url(#colorActual)" />
          <Area type="monotone" dataKey="baseline" stroke="#e2e8f0" strokeWidth={2} strokeDasharray="5 5" fill="transparent" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default GrowthTrajectoryChart;
