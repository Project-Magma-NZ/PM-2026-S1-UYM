import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { AGE_DEMOGRAPHICS } from '../../data/mockData';

const AgeDemographicsChart = () => {
  const [data, setData] = useState(AGE_DEMOGRAPHICS);
    useEffect(() => {
    fetch('http://localhost:3001/fb_page/demographics?dimension=age&access_token=fake_token')
      .then((res) => res.json())
      .then((res) => {
        const values = res.data[0].values[0].value;

        const total =
          values['13-17'] +
          values['18-24'] +
          values['25-34'] +
          values['35-44'] +
          values['45-54'] +
          values['55+'] ||
          1;

        const metaPercentages = [
          { age: '13-17', meta: (values['13-17'] / total) * 100 },
          { age: '18-24', meta: (values['18-24'] / total) * 100 },
          { age: '25-34', meta: (values['25-34'] / total) * 100 },
          { age: '35-44', meta: (values['35-44'] / total) * 100 },
          { age: '45-54', meta: (values['45-54'] / total) * 100 },
          { age: '55+', meta: (values['55+'] / total) * 100 },
        ];

        const merged = metaPercentages.map((item) => {
          const existing = AGE_DEMOGRAPHICS.find((row) => row.age === item.age);
          return {
            age: item.age,
            meta: item.meta,
            google: existing ? existing.google : 0,
          };
        });

        setData(merged);
      })
      .catch((err) => {
        console.error('Failed to fetch age demographics:', err);
      });
  }, []);

  return (
    <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
    <div className="flex justify-between items-center mb-5">
      <h3 className="text-base font-black text-slate-900">Age Demographics</h3>
      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-slate-900" />
          <span className="text-xs font-bold text-slate-500">Meta</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-brand-yellow" />
          <span className="text-xs font-bold text-slate-500">Google</span>
        </div>
      </div>
    </div>
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={8} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="age"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
            dy={10}
          />
          <YAxis hide />
          <Tooltip
            cursor={{ fill: '#f8fafc' }}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="meta" fill="#0f172a" radius={[4, 4, 0, 0]} barSize={32} />
          <Bar dataKey="google" fill="#FFB800" radius={[4, 4, 0, 0]} barSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
  );
};

export default AgeDemographicsChart;
