import YearlySummary from '../components/yearly/YearlySummary';
import GrowthTrajectoryChart from '../components/yearly/GrowthTrajectoryChart';
import RegionalDistribution from '../components/yearly/RegionalDistribution';
import AgeDistributionGrid from '../components/yearly/AgeDistributionGrid';
import GenderRepresentation from '../components/yearly/GenderRepresentation';

const YearlyStats = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-1">Yearly Impact Overview</h1>
      <p className="text-slate-500 font-medium">Consolidated data from Jan 1, 2023 – Dec 31, 2023</p>
    </div>

    <YearlySummary />

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <GrowthTrajectoryChart />
      <RegionalDistribution />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <AgeDistributionGrid />
      <GenderRepresentation />
    </div>
  </div>
);

export default YearlyStats;
