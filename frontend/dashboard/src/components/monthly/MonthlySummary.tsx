import { useState, useEffect } from 'react';
import StatsCard from '../StatsCard';
import { MONTHLY_KPIS } from '../../data/mockData';
import { fetchKPIs } from '../../services/analytics';
import { fetchMetaKPIs } from '../../services/meta';
import type { KPIData } from '../../types';

interface Props { yearMonth?: string; }

type DataSource = 'all' | 'google' | 'meta';

const combineKPIs = (a: KPIData[], b: KPIData[]): KPIData[] => {
  const map = new Map<string, KPIData>();
  [...a, ...b].forEach(kpi => {
    const key = kpi.label;
    if (map.has(key)) {
      const existing = map.get(key)!;
      const valA = parseFloat(String(existing.value).replace(/,/g, '')) || 0;
      const valB = parseFloat(String(kpi.value).replace(/,/g, '')) || 0;
      map.set(key, { ...existing, value: (valA + valB).toLocaleString() });
    } else {
      map.set(key, kpi);
    }
  });
  return Array.from(map.values());
};

const MonthlySummary = ({ yearMonth }: Props) => {
  const [selectedSource, setSelectedSource] = useState<DataSource>('all');
  const [googleKPIs, setGoogleKPIs] = useState<KPIData[]>(MONTHLY_KPIS);
  const [metaKPIs, setMetaKPIs] = useState<KPIData[]>(MONTHLY_KPIS);
  const [isGoogleReal, setIsGoogleReal] = useState(false);
  const [isMetaReal, setIsMetaReal] = useState(false);

  useEffect(() => {
    // Fetch Google Analytics data
    fetchKPIs(yearMonth)
      .then(({ totalActive, totalNew, engagementRate }) => {  
        setGoogleKPIs([
          { label: 'TOTAL USERS', value: totalActive.toLocaleString(), icon: 'users' },
          { label: 'NEW USERS', value: totalNew.toLocaleString(), isNew: true, icon: 'user-plus' },
          { label: 'ENGAGEMENT RATE', value: `${engagementRate}%`, icon: 'mouse' },
          { label: 'ACTIVE USERS', value: totalActive.toLocaleString(), icon: 'heart' },
        ]);
        setIsGoogleReal(true);
      })
      .catch(() => {
        // Fallback to mock data if fetch fails
        setGoogleKPIs(MONTHLY_KPIS);
        setIsGoogleReal(false);
      });

    fetchMetaKPIs(yearMonth)
      .then((kpis) => {
        if (kpis.length > 0) {
          setMetaKPIs(kpis);
          setIsMetaReal(true);
        } else {
          setMetaKPIs(MONTHLY_KPIS);
          setIsMetaReal(false);
        }
      })
      .catch(() => {
        setMetaKPIs(MONTHLY_KPIS);
        setIsMetaReal(false);
      });
  }, [yearMonth]);

  const getFilteredKPIs = (): KPIData[] => {
    switch (selectedSource) {
      case 'google':
        return isGoogleReal ? googleKPIs : MONTHLY_KPIS;
      case 'meta':
        return isMetaReal ? metaKPIs : MONTHLY_KPIS;
      case 'all':
      default:
        if (isGoogleReal || isMetaReal) {
          return combineKPIs(
            isGoogleReal ? googleKPIs : [],
            isMetaReal ? metaKPIs : [],
          );
        }
        return MONTHLY_KPIS;
    }
  };

  const isMock =
    (selectedSource === 'all' && !isGoogleReal && !isMetaReal) ||
    (selectedSource === 'google' && !isGoogleReal) ||
    (selectedSource === 'meta' && !isMetaReal);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
        <div>
          <h3 className="text-base font-black text-slate-900">
            Key Performance Metrics
            {isMock && (
              <span className="ml-2 text-sm font-normal text-orange-600">Mock Data</span>
            )}
          </h3>
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
