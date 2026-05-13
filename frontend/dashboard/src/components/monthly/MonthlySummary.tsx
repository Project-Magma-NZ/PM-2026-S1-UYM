import { useState, useEffect } from 'react';
import StatsCard from '../StatsCard';
import { MONTHLY_KPIS } from '../../data/mockData';
import { fetchKPIs } from '../../services/analytics';
import type { KPIData } from '../../types';

interface Props { yearMonth?: string; }

const combineKPIs = (a: KPIData[], b: KPIData[]): KPIData[] => {
  const map = new Map<string, KPIData>();
  [...a, ...b].forEach(kpi => {
    const key = kpi.label;
    if (map.has(key)) {
      const existing = map.get(key)!;
      const valA = parseFloat(existing.value.replace(/,/g, '')) || 0;
      const valB = parseFloat(kpi.value.replace(/,/g, '')) || 0;
      const sum = valA + valB;
      map.set(key, { ...existing, value: sum.toLocaleString() });
    } else {
      map.set(key, kpi);
    }
  });
  return Array.from(map.values());
};

const MonthlySummary = ({ yearMonth }: Props) => {
  const [combinedKPIs, setCombinedKPIs] = useState<KPIData[]>(MONTHLY_KPIS);

  useEffect(() => {
    let googleData: KPIData[] = MONTHLY_KPIS;
    let metaData: KPIData[] = [];
    let googleReal = false;
    let metaReal = false;

    // Fetch Google Analytics data
    fetchKPIs(yearMonth)
      .then(({ totalActive, totalNew, engagementRate }) => {
        googleData = [
          { label: 'TOTAL USERS', value: totalActive.toLocaleString(), icon: 'users' },
          { label: 'NEW USERS', value: totalNew.toLocaleString(), isNew: true, icon: 'user-plus' },
          { label: 'ENGAGEMENT RATE', value: `${engagementRate}%`, icon: 'mouse' },
          { label: 'ACTIVE USERS', value: totalActive.toLocaleString(), icon: 'heart' },
        ];
        googleReal = true;
      })
      .catch(() => {
        googleReal = false;
      })
      .finally(() => {
        // Fetch Meta data (Facebook/Instagram) - easily replaceable once real API is available
        fetch('http://localhost:3001/kpi_summary?access_token=fake_token')
          .then((res) => res.json())
          .then((res) => {
            metaData = res.data || [];
            metaReal = true;
          })
          .catch((err) => {
            console.error('Failed to fetch Meta KPI summary:', err);
            metaReal = false;
          })
          .finally(() => {
            // Combine data after both fetches complete
            if (googleReal && metaReal) {
              setCombinedKPIs(combineKPIs(googleData, metaData));
            } else {
              setCombinedKPIs(MONTHLY_KPIS);
            }
          });
      });
  }, [yearMonth]);

  const getFilteredKPIs = (): KPIData[] => {
    switch (selectedSource) {
      case 'google':
        return googleKPIs;
      case 'meta':
        return metaKPIs;
      // case 'instagram':
      //   // Assuming Meta data includes Instagram; filter if possible, else return all Meta
      //   return metaKPIs.filter(kpi => kpi.label?.toLowerCase().includes('instagram') || true); // Placeholder filter
      // case 'facebook':
      //   // Assuming Meta data includes Facebook; filter if possible, else return all Meta
      //   return metaKPIs.filter(kpi => kpi.label?.toLowerCase().includes('facebook') || true); // Placeholder filter
      case 'all':
      default:
        return [...googleKPIs, ...metaKPIs];
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
        <div>
          <h3 className="text-base font-black text-slate-900">Key Performance Metrics</h3>
        </div>
        <div className="mb-4">
          <select
            id="data-source"
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value as DataSource)}
            className="block p-6 py-2 border border-slate-100 rounded-2xl shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
          <option value="all">All</option>
          <option value="google">Google Analytics</option>
          <option value="meta">Meta</option>
        </select>
      </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {getFilteredKPIs().map((kpi, i) => <StatsCard key={i} data={kpi} />)}
      </div>
    </div>
  );
};

export default MonthlySummary;
