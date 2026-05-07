import { useEffect, useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {
  GENDER_DISTRIBUTION,
  GENDER_DISTRIBUTION_FACEBOOK,
  GENDER_DISTRIBUTION_INSTAGRAM,
} from '../../data/mockData';
import {
  fetchFacebookGenderDistributionCounts,
  fetchGenderDistributionCounts,
  fetchInstagramGenderDistributionCounts,
  type GenderDistributionCount,
} from '../../services/analytics';
import type { GenderData } from '../../types';

type PlatformMode = 'all' | 'meta' | 'facebook' | 'instagram' | 'google';

type Props = { yearMonth?: string };

const PLATFORM_OPTIONS: { key: PlatformMode; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'meta', label: 'Meta' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'google', label: 'Google' },
];

const normalizeToPercent = (data: GenderData[]) => {
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  return data.map((item) => ({
    ...item,
    value: parseFloat(((item.value / total) * 100).toFixed(1)),
  }));
};

const combineGenderData = (...sources: GenderData[][]) => {
  const map = new Map<string, GenderData>();

  sources.forEach((source) => {
    source.forEach((item) => {
      const existing = map.get(item.name);
      if (existing) {
        map.set(item.name, {
          ...existing,
          value: existing.value + item.value,
        });
      } else {
        map.set(item.name, { ...item });
      }
    });
  });

  return normalizeToPercent(Array.from(map.values()));
};

const convertCountsToData = (counts: GenderDistributionCount[]): GenderData[] => {
  return counts.map((item) => ({
    name: item.name,
    value: item.count,
    color: item.color,
  }));
};

const GenderDistributionChart = ({ yearMonth }: Props) => {
  const [mode, setMode] = useState<PlatformMode>('all');
  const [data, setData] = useState<GenderData[]>(() =>
    combineGenderData(GENDER_DISTRIBUTION_FACEBOOK, GENDER_DISTRIBUTION_INSTAGRAM),
  );

  useEffect(() => {
    let active = true;

    const setMockData = (values: GenderData[]) => {
      if (active) {
        setData(normalizeToPercent(values));
      }
    };

    const loadGoogleData = async () => {
      try {
        const googleCounts = await fetchGenderDistributionCounts(yearMonth);
        return convertCountsToData(googleCounts);
      } catch {
        return GENDER_DISTRIBUTION.map((item) => ({ ...item }));
      }
    };

    const loadData = async () => {
      if (mode === 'facebook') {
        setMockData(GENDER_DISTRIBUTION_FACEBOOK);
        return;
      }

      if (mode === 'instagram') {
        setMockData(GENDER_DISTRIBUTION_INSTAGRAM);
        return;
      }

      if (mode === 'meta') {
        setMockData(combineGenderData(GENDER_DISTRIBUTION_FACEBOOK, GENDER_DISTRIBUTION_INSTAGRAM));
        return;
      }

      if (mode === 'google') {
        const googleCounts = await loadGoogleData();
        if (!active) return;
        setData(normalizeToPercent(googleCounts));
        return;
      }

      if (mode === 'all') {
        const [googleCounts, fbCounts, igCounts] = await Promise.all([
          loadGoogleData(),
          fetchFacebookGenderDistributionCounts(),
          fetchInstagramGenderDistributionCounts(),
        ]);

        if (!active) return;

        const googleData = googleCounts;
        const fbData = convertCountsToData(fbCounts);
        const igData = convertCountsToData(igCounts);

        const allCombined = combineGenderData(googleData, fbData, igData);
        setData(allCombined);
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [mode, yearMonth]);

  const dominant = [...data].sort((a, b) => b.value - a.value)[0] ?? {
    name: 'Unknown',
    value: 0,
    color: '#CBD5E1',
  };

  const platformLabel =
    mode === 'all'
      ? 'Combined Google + Meta data'
      : mode === 'meta'
      ? 'Meta (Facebook + Instagram)'
      : mode === 'facebook'
      ? 'Facebook'
      : mode === 'instagram'
      ? 'Instagram'
      : 'Google Analytics';

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
        <div>
          <h3 className="text-base font-black text-slate-900">Gender Distribution</h3>
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

      <div className="flex-1 relative flex items-center justify-center">
        <div className="absolute text-center">
          <p className="text-3xl font-black text-slate-900">{dominant.value.toFixed(1)}%</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            {dominant.name} Majority
          </p>
        </div>

        <ResponsiveContainer width="100%" height={210}>
          <PieChart>
            <Pie data={data} innerRadius={65} outerRadius={82} paddingAngle={5} dataKey="value">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3 mt-4">
        {data.map((item, i) => (
          <div key={i} className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm font-bold text-slate-600">{item.name}</span>
            </div>
            <span className="text-sm font-black text-slate-900">{item.value.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GenderDistributionChart;
