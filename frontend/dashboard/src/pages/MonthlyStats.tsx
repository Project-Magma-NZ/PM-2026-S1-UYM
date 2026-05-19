import { useState, useEffect } from "react";
import MonthlySummary from "../components/monthly/MonthlySummary";
import AgeDemographicsChart from "../components/monthly/AgeDemographicsChart";
import GenderDistributionChart from "../components/monthly/GenderDistributionChart";
import { fetchAvailableMonths, fetchKPIs } from "../services/analytics";

const WEBSITE_TARGET = 6800;

function formatYearMonth(ym: string): string {
  const year = parseInt(ym.slice(0, 4));
  const month = parseInt(ym.slice(4, 6)) - 1;
  return new Date(year, month).toLocaleString("default", {
    month: "short",
    year: "numeric",
  });
}

const MonthlyStats = () => {
  const [months, setMonths] = useState<string[]>([]);
  const [selected, setSelected] = useState<string>("YTD");
  const [websiteVisitors, setWebsiteVisitors] = useState<number>(0);

  useEffect(() => {
    fetchAvailableMonths()
      .then((m) => setMonths(m))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchKPIs(selected)
      .then(({ totalActive }) => setWebsiteVisitors(totalActive))
      .catch(() => {});
  }, [selected]);

  const targetPercent = Math.min((websiteVisitors / WEBSITE_TARGET) * 100, 100);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-1">
            Monthly Performance
          </h1>
          <p className="text-slate-500 font-medium">
            Cross-platform insights from Google Analytics
          </p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1 flex-wrap justify-end">
          <button
            onClick={() => setSelected("YTD")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${selected === "YTD" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"}`}
          >
            YTD
          </button>
          {months.map((m) => (
            <button
              key={m}
              onClick={() => setSelected(m)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${selected === m ? "bg-white shadow-sm text-slate-900" : "text-slate-500"}`}
            >
              {formatYearMonth(m)}
            </button>
          ))}
        </div>
      </div>

      {/* YTD Targets */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-base font-black text-slate-900 mb-4">
          {selected === "YTD"
            ? "Year-to-Date Targets"
            : `${formatYearMonth(selected)} Targets`}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between text-sm font-bold mb-2">
              <span className="text-slate-600">Website Unique Visitors</span>
              <span className="text-slate-900">
                {websiteVisitors.toLocaleString()} /{" "}
                {WEBSITE_TARGET.toLocaleString()}
              </span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-yellow rounded-full transition-all duration-700"
                style={{ width: `${targetPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 font-bold mt-1">
              {targetPercent.toFixed(1)}% of 2026 target reached
            </p>
          </div>
          <div>
            <div className="flex justify-between text-sm font-bold mb-2">
              <span className="text-slate-600">Meta Views</span>
              <span className="text-slate-400">— / 150,000</span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full" />
            <p className="text-[11px] text-amber-500 font-bold mt-1">
              Meta Ads not connected — manual entry needed
            </p>
          </div>
        </div>
      </div>

      <MonthlySummary yearMonth={selected} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <AgeDemographicsChart yearMonth={selected} />
        <GenderDistributionChart yearMonth={selected} />
      </div>
    </div>
  );
};

export default MonthlyStats;
