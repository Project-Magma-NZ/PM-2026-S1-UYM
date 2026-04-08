import MonthlySummary from '../components/monthly/MonthlySummary';
import AgeDemographicsChart from '../components/monthly/AgeDemographicsChart';
import GenderDistributionChart from '../components/monthly/GenderDistributionChart';
import GlobalAudienceReach from '../components/monthly/GlobalAudienceReach';

const MonthlyStats = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-end">
      <div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-1">Monthly Performance</h1>
        <p className="text-slate-500 font-medium">Cross-platform insights from Meta & Google Analytics</p>
      </div>
      <div className="flex bg-slate-100 p-1 rounded-xl">
        <button className="px-4 py-2 bg-white rounded-lg shadow-sm text-xs font-bold text-slate-900">October 2023</button>
        <button className="px-4 py-2 text-xs font-bold text-slate-500">September 2023</button>
      </div>
    </div>

    <MonthlySummary />

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <AgeDemographicsChart />
      <GenderDistributionChart />
    </div>

    <GlobalAudienceReach />
  </div>
);

export default MonthlyStats;
