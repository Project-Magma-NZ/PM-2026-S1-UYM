import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AGE_DEMOGRAPHICS } from '../../data/mockData';
import { fetchAgeDemographics } from '../../services/analytics';

interface Props { yearMonth?: string; }

const AgeDemographicsChart = ({ yearMonth }: Props) => {
  const [data, setData] = useState(AGE_DEMOGRAPHICS);

  useEffect(() => {
    fetchAgeDemographics(yearMonth).then(setData).catch(() => {});
  }, [yearMonth]);

  return (
    <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-base font-black text-slate-900">Age Demographics</h3>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-brand-yellow" />
          <span className="text-xs font-bold text-slate-500">Google Analytics</span>
        </div>
      </div>
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={8} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="age" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} dy={10} />
            <YAxis hide />
            <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
            <Bar dataKey="google" name="Active Users" fill="#FFB800" radius={[4, 4, 0, 0]} barSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AgeDemographicsChart;
