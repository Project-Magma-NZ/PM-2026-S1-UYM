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
import {
  AGE_DEMOGRAPHICS,
  AGE_DEMOGRAPHICS_FACEBOOK,
  AGE_DEMOGRAPHICS_INSTAGRAM,
} from '../../data/mockData';
import { fetchAgeDemographics } from '../../services/analytics';
import type { AgeDemographic } from '../../types';

type PlatformMode = 'all' | 'meta' | 'facebook' | 'instagram' | 'google';

type Props = { yearMonth?: string };

const PLATFORM_OPTIONS: { key: PlatformMode; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'meta', label: 'Meta' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'google', label: 'Google' },
];

const AGE_GROUPS = AGE_DEMOGRAPHICS.map((item) => item.age);

const combineAgeSources = (...sources: AgeDemographic[]) => {
  const rowMap = new Map<string, AgeDemographic>();

  AGE_GROUPS.forEach((age) => rowMap.set(age, { age, meta: 0, google: 0 }));

  for (const source of sources) {
    source.forEach((row) => {
      const existing = rowMap.get(row.age);
      if (existing) {
        existing.meta += row.meta;
        existing.google += row.google;
      }
    });
  }

  return Array.from(rowMap.values());
};

const AgeDemographicsChart = ({ yearMonth }: Props) => {
  const [mode, setMode] = useState<PlatformMode>('all');
  const [data, setData] = useState<AgeDemographic>(() =>
    combineAgeSources(AGE_DEMOGRAPHICS_FACEBOOK, AGE_DEMOGRAPHICS_INSTAGRAM, AGE_DEMOGRAPHICS),
  );

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      if (mode === 'facebook') {
        setData(AGE_DEMOGRAPHICS_FACEBOOK.map((row) => ({ ...row, google: 0 })));
        return;
      }

      if (mode === 'instagram') {
        setData(AGE_DEMOGRAPHICS_INSTAGRAM.map((row) => ({ ...row, google: 0 })));
        return;
      }

      const metaData = combineAgeSources(AGE_DEMOGRAPHICS_FACEBOOK, AGE_DEMOGRAPHICS_INSTAGRAM);

      if (mode === 'meta') {
        setData(metaData);
        return;
      }

      const googleData = await fetchAgeDemographics(yearMonth).catch(() => AGE_DEMOGRAPHICS);
      if (!active) return;

      if (mode === 'google') {
        setData(googleData.map((row) => ({ age: row.age, google: row.google, meta: 0 })));
        return;
      }

      if (mode === 'all') {
        setData(combineAgeSources(metaData, googleData));
        return;
      }
    };

    loadData();
    return () => {
      active = false;
    };
  }, [mode, yearMonth]);

  const platformLabel =
    mode === 'all'
      ? 'All sources combined'
      : mode === 'meta'
      ? 'Meta (Facebook + Instagram)'
      : mode === 'facebook'
      ? 'Facebook'
      : mode === 'instagram'
      ? 'Instagram'
      : 'Google Analytics';

  return (
    <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-5">
        <div>
          <h3 className="text-base font-black text-slate-900">Age Demographics</h3>
          <p className="text-xs font-semibold text-slate-500 mt-1">{platformLabel}</p>
        </div>

        <div className="flex flex-wrap gap-2 bg-slate-100 p-1 rounded-xl">
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as PlatformMode)}
            className="px-3 py-1 rounded-lg text-xs font-bold bg-white text-slate-900 shadow-sm outline-none"
          >
            {PLATFORM_OPTIONS.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
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
              contentStyle={{
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
              }}
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
