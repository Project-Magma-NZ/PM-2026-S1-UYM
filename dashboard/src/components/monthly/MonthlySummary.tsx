import StatsCard from '../StatsCard';
import { MONTHLY_KPIS } from '../../data/mockData';

const MonthlySummary = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
    {MONTHLY_KPIS.map((kpi, i) => <StatsCard key={i} data={kpi} />)}
  </div>
);

export default MonthlySummary;
