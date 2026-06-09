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
}

const GrowthTrajectoryChart = () => {
  const [data, setData] = useState<MonthlyPoint[]>([]);

  useEffect(() => {
    fetchMonthlyAllPlatformData()
      .then((d) => {
        const cleaned = d.map((x) => ({
          month: x.month,
          website: Number(x.website) || 0,
        }));

        setData(cleaned);
      })
      .catch(() => setData([]));
  }, []);

  const totalWebsite = data.reduce((s, d) => s + d.website, 0);

  return (
    <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
      
      {/* HEADER */}
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-base font-black text-slate-900">
          Website Reach
        </h3>

        {/* ✅ MOVED TOTAL TO TOP RIGHT */}
        <div className="text-right">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Total Visitors
          </p>
          <p className="text-sm font-black text-slate-900">
            {totalWebsite.toLocaleString()}
          </p>
        </div>
      </div>

      {/* CHART */}
      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
          >
            <defs>
              <linearGradient id="colorWebsite" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0f172a" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f1f5f9"
            />

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
              contentStyle={{
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
              }}
            />

            <Area
              type="monotone"
              dataKey="website"
              stroke="#0f172a"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorWebsite)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default GrowthTrajectoryChart;