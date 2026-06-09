import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  AGE_DEMOGRAPHICS,
  AGE_DEMOGRAPHICS_INSTAGRAM,
} from '../../data/mockData';
import {
  fetchAgeDemographics,
  fetchInstagramAgeDemographics,
} from '../../services/analytics';
import type { AgeDemographic } from '../../types';

type PlatformMode = 'all' | 'meta' | 'instagram' | 'google';
type PullState = 'checking' | 'live' | 'mock';

type Props = { yearMonth?: string };

const PLATFORM_OPTIONS: { key: PlatformMode; label: string }[] = [
  { key: "all", label: "All" },
  { key: "instagram", label: "Instagram" },
  { key: "google", label: "Google" },
];

const AGE_GROUPS = AGE_DEMOGRAPHICS.map((item) => item.age);
const MOCK_INSTAGRAM_AGE = AGE_DEMOGRAPHICS_INSTAGRAM.map((row: AgeDemographic) => ({ ...row, google: 0 }));

const combineAgeSources = (...sources: AgeDemographic[][]) => {
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
  const [data, setData] = useState<AgeDemographic[]>(() =>
    combineAgeSources(MOCK_INSTAGRAM_AGE, AGE_DEMOGRAPHICS),
  );
  const [pullState, setPullState] = useState<{
    instagram: PullState;
    google: PullState;
  }>({
    instagram: 'checking',
    google: 'checking',
  });

  useEffect(() => {
    let active = true;

    const loadGoogleData = async () => {
      try {
        const googleData = await fetchAgeDemographics(yearMonth);
        const isLive = googleData.length > 0 && googleData.some(row => row.google > 0);
        if (active) {
          setPullState(prev => ({ ...prev, google: isLive ? 'live' : 'mock' }));
        }
        return isLive ? googleData : AGE_DEMOGRAPHICS;
      } catch {
        if (active) setPullState(prev => ({ ...prev, google: 'mock' }));
        return AGE_DEMOGRAPHICS;
      }
    };

    const loadInstagramData = async () => {
      try {
        const instagramData = await fetchInstagramAgeDemographics();
        const isLive = instagramData.length > 0 && instagramData.some(row => row.meta > 0);
        if (active) {
          setPullState(prev => ({ ...prev, instagram: isLive ? 'live' : 'mock' }));
        }
        return isLive ? instagramData : MOCK_INSTAGRAM_AGE;
      } catch {
        if (active) setPullState(prev => ({ ...prev, instagram: 'mock' }));
        return MOCK_INSTAGRAM_AGE;
      }
    };

    const loadData = async () => {
      if (mode === 'instagram' || mode === 'meta') {
        const instagramData = await loadInstagramData();
        if (!active) return;
        setData(instagramData);
        return;
      }

      if (mode === 'google') {
        const googleData = await loadGoogleData();
        if (!active) return;
        setData(googleData.map((row) => ({ age: row.age, google: row.google, meta: 0 })));
        return;
      }

      if (mode === 'all') {
        const [googleData, instagramData] = await Promise.all([
          loadGoogleData(),
          loadInstagramData(),
        ]);
        if (!active) return;
        setData(combineAgeSources(instagramData, googleData));
      }
    };

    loadData();
    return () => { active = false; };
  }, [mode, yearMonth]);

  const visibleSources: Array<'instagram' | 'google'> =
    mode === 'google'
      ? ['google']
      : mode === 'instagram'
      ? ['instagram']
      : ['google', 'instagram'];

  const statusText = (source: 'instagram' | 'google') => {
    const state = pullState[source];

    if (source === 'google') {
      if (state === 'live') return 'Google age: Live';
      if (state === 'mock') return 'Google age: Mock fallback';
      return 'Google age: Checking';
    }

    if (state === 'live') return 'Instagram age: Live';
    if (state === 'mock') return 'Instagram age: Mock fallback';
    return 'Instagram age: Checking';
  };

  const platformLabel =
    mode === 'all' ? 'Google + Instagram combined'
    : mode === 'meta' || mode === 'instagram' ? 'Instagram'
    : 'Google Analytics';

  return (
    <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-5">
        <div>
          <h3 className="text-base font-black text-slate-900">
            Age Demographics
          </h3>

          <p className="text-xs font-semibold text-slate-500 mt-1">
            {platformLabel}
          </p>

          <div className="flex flex-wrap gap-2 mt-2">
            {visibleSources.map((source) => (
              <span
                key={source}
                className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${
                  pullState[source] === 'live'
                    ? 'bg-green-50 text-green-700'
                    : pullState[source] === 'mock'
                    ? 'bg-orange-50 text-orange-700'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {statusText(source)}
              </span>
            ))}
          </div>
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
          <BarChart
            data={data}
            barGap={8}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f1f5f9"
            />
            <XAxis
              dataKey="age"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 600 }}
              dy={10}
            />
            <YAxis hide />
            <Tooltip
              cursor={{ fill: "#f8fafc" }}
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
              }}
            />
            <Bar 
              dataKey="meta" 
              name="Meta" 
              fill="#0f172a" 
              barSize={32} 
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="google" 
              name="Google" 
              fill="#FFB800" 
              barSize={32} 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AgeDemographicsChart;