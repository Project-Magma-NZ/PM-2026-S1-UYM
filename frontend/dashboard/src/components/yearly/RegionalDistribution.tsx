import { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { fetchNZRegions } from '../../services/analytics';

interface Region {
  label: string;
  percentage: number;
}

const RegionalDistribution = () => {
  const [regions, setRegions] = useState<Region[]>([]);

  useEffect(() => {
    fetchNZRegions()
      .then((data) => {
        // Debug: See what the API actually returns
        console.log('Raw API data:', data);
        
        const nzRegions = new Set([
          'Northland',
          'Auckland',
          'Waikato',
          'Bay of Plenty',
          'Gisborne',
          "Hawke's Bay",
          'Taranaki',
          'Manawatū-Whanganui',
          'Wellington',
          'Tasman',
          'Nelson',
          'Marlborough',
          'West Coast',
          'Canterbury',
          'Otago',
          'Southland',
        ]);

        // Debug: Check which regions are being filtered out
        const filtered = data
          .filter((r) => {
            const isValid = nzRegions.has(r.label);
            if (!isValid) {
              console.log(`Filtered out: "${r.label}" - not in NZ regions list`);
            }
            return isValid;
          })
          .sort((a, b) => b.percentage - a.percentage);

        console.log('Filtered regions:', filtered);
        setRegions(filtered);
      })
      .catch((err) => {
        console.error('Error fetching regions:', err);
        setRegions([]);
      });
  }, []);

  const topRegion = regions[0];

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm h-full flex flex-col">
      {/* HEADER */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-black text-slate-900">
            Website Regional Distribution
          </h3>
          <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
            New Zealand traffic breakdown
          </p>
        </div>

        {topRegion && (
          <div className="text-right">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
              Top Region
            </p>
            <p className="text-sm font-black text-slate-900">
              {topRegion.label}
            </p>
          </div>
        )}
      </div>

      {/* CHART */}
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={regions}
            layout="vertical"
            margin={{ top: 5, right: 10, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="label"
              width={110}
              tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
            />
            <Tooltip
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{
                borderRadius: '10px',
                border: 'none',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
              }}
            />
            <Bar
              dataKey="percentage"
              fill="#0f172a"
              radius={[0, 6, 6, 0]}
              barSize={10}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RegionalDistribution;