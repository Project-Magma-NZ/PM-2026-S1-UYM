import { useState, useEffect } from 'react';
import StatsCard from '../StatsCard';
import { MONTHLY_KPIS } from '../../data/mockData';
import { fetchKPIs } from '../../services/analytics';
import type { KPIData } from '../../types';

interface Props { yearMonth?: string; }

const MonthlySummary = ({ yearMonth }: Props) => {
  const [kpis, setKpis] = useState<KPIData[]>(MONTHLY_KPIS);

  useEffect(() => {
    fetchKPIs(yearMonth)
      .then(({ totalActive, totalNew, engagementRate }) => {
        setKpis([
          { label: 'TOTAL USERS', value: totalActive.toLocaleString(), icon: 'users' },
          { label: 'NEW USERS', value: totalNew.toLocaleString(), isNew: true, icon: 'user-plus' },
          { label: 'ENGAGEMENT RATE', value: `${engagementRate}%`, icon: 'mouse' },
          { label: 'ACTIVE USERS', value: totalActive.toLocaleString(), icon: 'heart' },
        ]);
      })
      .catch(() => {});
  }, [yearMonth]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {kpis.map((kpi, i) => <StatsCard key={i} data={kpi} />)}
    </div>
  );
};

export default MonthlySummary;
