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

type PlatformMode = 'meta' | 'facebook' | 'instagram';

type AgeValues = {
  '13-17': number;
  '18-24': number;
  '25-34': number;
  '35-44': number;
  '45-54': number;
  '55+': number;
};

const AGE_GROUPS: (keyof AgeValues)[] = ['13-17', '18-24', '25-34', '35-44', '45-54', '55+'];

const AgeDemographicsChart = () => {
  const [mode, setMode] = useState<PlatformMode>('meta');
  const [data, setData] = useState(AGE_DEMOGRAPHICS);

  useEffect(() => {
    const fbUrl =
      'http://localhost:3001/fb_page/demographics?dimension=age&access_token=fake_token';
    const igUrl =
      'http://localhost:3001/ig_account/demographics?dimension=age&access_token=fake_token';

    const formatAgeData = (values: AgeValues) => {
      const total =
        AGE_GROUPS.reduce((sum, group) => sum + values[group], 0) || 1;

      return AGE_GROUPS.map((age) => {
        const existing = AGE_DEMOGRAPHICS.find((row) => row.age === age);

        return {
          age,
          meta: (values[age] / total) * 100,
          google: existing ? existing.google : 0,
        };
      });
    };

    const getLatestValues = (res: { data: { values: { value: AgeValues }[] }[] }) => {
      const valuesList = res.data[0].values;
      return valuesList[valuesList.length - 1].value;
    };

    if (mode === 'facebook') {
      fetch(fbUrl)
        .then((res) => res.json())
        .then((res) => {
          const values = getLatestValues(res);
          setData(formatAgeData(values));
        })
        .catch((err) => {
          console.error('Failed to fetch Facebook age demographics:', err);
        });
    }

    if (mode === 'instagram') {
      fetch(igUrl)
        .then((res) => res.json())
        .then((res) => {
          const values = getLatestValues(res);
          setData(formatAgeData(values));
        })
        .catch((err) => {
          console.error('Failed to fetch Instagram age demographics:', err);
        });
    }

    if (mode === 'meta') {
      Promise.all([
        fetch(fbUrl).then((res) => res.json()),
        fetch(igUrl).then((res) => res.json()),
      ])
        .then(([fbRes, igRes]) => {
          const fbValues = getLatestValues(fbRes);
          const igValues = getLatestValues(igRes);

          const combined = AGE_GROUPS.reduce((result, age) => {
            result[age] = fbValues[age] + igValues[age];
            return result;
          }, {} as AgeValues);

          setData(formatAgeData(combined));
        })
        .catch((err) => {
          console.error('Failed to fetch Meta age demographics:', err);
        });
    }
  }, [mode]);

  return (
    <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-base font-black text-slate-900">Age Demographics</h3>

        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {(['meta', 'facebook', 'instagram'] as PlatformMode[]).map((option) => (
              <button
                key={option}
                onClick={() => setMode(option)}
                className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition ${
                  mode === option
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {option === 'meta' ? 'Meta' : option === 'facebook' ? 'Facebook' : 'Instagram'}
              </button>
            ))}
          </div>

          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-900" />
              <span className="text-xs font-bold text-slate-500">
                {mode === 'meta' ? 'Meta' : mode === 'facebook' ? 'Facebook' : 'Instagram'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-brand-yellow" />
              <span className="text-xs font-bold text-slate-500">Google</span>
            </div>
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
