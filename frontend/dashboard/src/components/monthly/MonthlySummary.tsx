import { useState, useEffect } from 'react';
import StatsCard from '../StatsCard';
import { MONTHLY_KPIS } from '../../data/mockData';
import { fetchKPIs } from '../../services/analytics';
import { fetchMetaKPIs } from '../../services/meta';
import type { KPIData } from '../../types';

interface Props {
  yearMonth?: string;
}

type DataSource = 'all' | 'google' | 'meta';

const PAGE_SIZE = 4;

const MonthlySummary = ({ yearMonth }: Props) => {
  const [selectedSource, setSelectedSource] = useState<DataSource>('all');

  const [googleKPIs, setGoogleKPIs] = useState<KPIData[]>(MONTHLY_KPIS);
  const [metaKPIs, setMetaKPIs] = useState<KPIData[]>(MONTHLY_KPIS);

  const [isGoogleReal, setIsGoogleReal] = useState(false);
  const [isMetaReal, setIsMetaReal] = useState(false);

  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchKPIs(yearMonth)
      .then(({ totalActive, totalNew, engagementRate }) => {
        setGoogleKPIs([
          {
            label: 'TOTAL USERS (Website)',
            value: totalActive.toLocaleString(),
            icon: 'users',
          },
          {
            label: 'NEW USERS (Website)',
            value: totalNew.toLocaleString(),
            isNew: true,
            icon: 'user-plus',
          },
          {
            label: 'ENGAGEMENT RATE (Website)',
            value: `${engagementRate}%`,
            icon: 'mouse',
          },
          {
            label: 'ACTIVE USERS (Website)',
            value: totalActive.toLocaleString(),
            icon: 'heart',
          },
        ]);

        setIsGoogleReal(true);
      })
      .catch(() => {
        setGoogleKPIs(MONTHLY_KPIS);
        setIsGoogleReal(false);
      });

    fetchMetaKPIs(yearMonth)
      .then((kpis) => {
        if (kpis.length > 0) {
          setMetaKPIs(
            kpis.map((kpi) => ({
              ...kpi,
              label: `${kpi.label} (Meta)`,
            }))
          );
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

    setPage(0); // reset page when switching month
  }, [yearMonth]);

  const allKPIs = (() => {
    switch (selectedSource) {
      case 'google':
        return isGoogleReal ? googleKPIs : MONTHLY_KPIS;

      case 'meta':
        return isMetaReal ? metaKPIs : MONTHLY_KPIS;

      case 'all':
      default:
        return [
          ...(isGoogleReal ? googleKPIs : MONTHLY_KPIS),
          ...(isMetaReal ? metaKPIs : MONTHLY_KPIS),
        ];
    }
  })();

  const totalPages = Math.ceil(allKPIs.length / PAGE_SIZE);

  const paginatedKPIs = allKPIs.slice(
    page * PAGE_SIZE,
    page * PAGE_SIZE + PAGE_SIZE
  );

  const isMock =
    (selectedSource === 'all' && !isGoogleReal && !isMetaReal) ||
    (selectedSource === 'google' && !isGoogleReal) ||
    (selectedSource === 'meta' && !isMetaReal);

  const nextPage = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  const prevPage = () => {
    if (page > 0) setPage(page - 1);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-4">

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h3 className="text-base font-black text-slate-900">
          Key Performance Metrics
          {isMock && (
            <span className="ml-2 text-sm font-normal text-orange-600">
              Mock Data
            </span>
          )}
        </h3>

        <select
          value={selectedSource}
          onChange={(e) => {
            setSelectedSource(e.target.value as DataSource);
            setPage(0);
          }}
          className="px-4 py-2 border border-slate-200 rounded-xl"
        >
          <option value="all">All</option>
          <option value="google">Google Analytics</option>
          <option value="meta">Meta</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {paginatedKPIs.map((kpi, i) => (
          <StatsCard key={i} data={kpi} />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={prevPage}
          disabled={page === 0}
          className="px-4 py-2 text-sm font-bold rounded-lg bg-slate-100 disabled:opacity-40"
        >
          Prev
        </button>

        <span className="text-sm text-slate-500 font-semibold">
          Page {page + 1} of {totalPages || 1}
        </span>

        <button
          onClick={nextPage}
          disabled={page >= totalPages - 1}
          className="px-4 py-2 text-sm font-bold rounded-lg bg-slate-100 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default MonthlySummary;