import { useState, useEffect } from 'react';
import MonthlySummary from '../components/monthly/MonthlySummary';
import AgeDemographicsChart from '../components/monthly/AgeDemographicsChart';
import GenderDistributionChart from '../components/monthly/GenderDistributionChart';
import GlobalAudienceReach from '../components/monthly/GlobalAudienceReach';
import { fetchAvailableMonths, fetchKPIs } from '../services/analytics';
import { fetchMetaFbInsights, fetchMetaIgInsights } from '../services/meta';

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
  const [fbViews, setFbViews] = useState<number | null>(null);
  const [igViews, setIgViews] = useState<number | null>(null);

  useEffect(() => {
    fetchAvailableMonths()
      .then((m) => setMonths(m))
      .catch(() => {});

    Promise.all([fetchMetaFbInsights(), fetchMetaIgInsights(selected === 'YTD' ? undefined : selected)])
      .then(([fb, ig]) => {
        setFbViews(fb.page_followers || fb.page_fans || fb.page_impressions || fb.page_reach || 0);
        setIgViews(ig.reach || ig.impressions || 0);
      })
      .catch(() => {
        setFbViews(0);
        setIgViews(0);
      });
  }, [selected]);

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
        <div className="relative">
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="appearance-none px-4 pr-8 py-2 rounded-xl bg-slate-100 text-sm font-semibold text-slate-700 border border-slate-200"
          >
            <option value="YTD">Year to Date</option>

            {months.map((m) => (
              <option key={m} value={m}>
                {formatYearMonth(m)}
              </option>
            ))}
          </select>

          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
            ▾
          </span>
        </div>
      </div>

      {/* YTD Targets */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-base font-black text-slate-900 mb-4">
          {selected === "YTD"
            ? "Year-to-Date Targets"
            : `${formatYearMonth(selected)} Targets`}
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Website Visitors */}
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

          {/* Facebook Followers */}
          <div>
            <div className="flex justify-between text-sm font-bold mb-2">
              <span className="text-slate-600">Facebook Followers</span>
              <span className="text-slate-900">
                {fbViews === null ? "…" : fbViews > 0 ? fbViews.toLocaleString() : "—"}
              </span>
            </div>

            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              {fbViews !== null && fbViews > 0 && (
                <div
                  className="h-full bg-brand-yellow rounded-full transition-all duration-700"
                  style={{ width: `${Math.min((fbViews / 5000) * 100, 100)}%` }}
                />
              )}
            </div>

            <p className="text-[11px] font-bold mt-1">
              {fbViews === null ? (
                <span className="text-slate-400">Loading…</span>
              ) : fbViews > 0 ? (
                <span className="text-emerald-600">Live count — Meta API</span>
              ) : (
                <span className="text-amber-500">No data available</span>
              )}
            </p>
          </div>

          {/* Instagram Reach */}
          <div>
            <div className="flex justify-between text-sm font-bold mb-2">
              <span className="text-slate-600">Instagram Reach</span>
              <span className="text-slate-900">
                {igViews === null ? "…" : igViews > 0 ? igViews.toLocaleString() : "—"}
              </span>
            </div>

            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              {igViews !== null && igViews > 0 && (
                <div
                  className="h-full bg-brand-brown rounded-full transition-all duration-700"
                  style={{ width: `${Math.min((igViews / 5000) * 100, 100)}%` }}
                />
              )}
            </div>

            <p className="text-[11px] font-bold mt-1">
              {igViews === null ? (
                <span className="text-slate-400">Loading…</span>
              ) : igViews > 0 ? (
                <span className="text-emerald-600">Last 28 days — Meta API</span>
              ) : (
                <span className="text-amber-500">No reach data available</span>
              )}
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
