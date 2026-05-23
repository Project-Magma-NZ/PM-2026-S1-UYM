import { useState, useEffect } from 'react';
import { fetchMetaIgTopRegions, type RegionEntry } from '../../services/meta';

const Bar = ({ percentage, color }: { percentage: number; color: string }) => (
  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
    <div
      className="h-full rounded-full transition-all duration-700"
      style={{ width: `${Math.min(percentage, 100)}%`, backgroundColor: color }}
    />
  </div>
);

const RegionList = ({
  title,
  items,
  color,
  loading,
}: {
  title: string;
  items: RegionEntry[];
  color: string;
  loading: boolean;
}) => (
  <div>
    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3">{title}</p>
    {loading ? (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-3 bg-slate-100 rounded w-3/4 mb-1" />
            <div className="h-1.5 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    ) : items.length === 0 ? (
      <p className="text-xs text-slate-400">No data available</p>
    ) : (
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i}>
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-slate-700 truncate pr-2">{item.label}</span>
              <span className="text-xs font-black text-slate-900 shrink-0">{item.percentage}%</span>
            </div>
            <Bar percentage={item.percentage} color={color} />
          </div>
        ))}
      </div>
    )}
  </div>
);

const MetaRegions = () => {
  const [countries, setCountries] = useState<RegionEntry[]>([]);
  const [cities, setCities] = useState<RegionEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetaIgTopRegions()
      .then(({ countries, cities }) => {
        setCountries(countries);
        setCities(cities);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex justify-between items-start mb-5">
        <div>
          <h3 className="text-base font-black text-slate-900">Audience Regions</h3>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">Instagram followers by location</p>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full bg-green-50 text-green-700">
          Instagram — Live
        </span>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <RegionList title="Top Countries" items={countries} color="#6B5600" loading={loading} />
        <RegionList title="Top Cities" items={cities} color="#FFB800" loading={loading} />
      </div>

      <p className="text-[10px] text-slate-300 font-bold mt-5 pt-4 border-t border-slate-50">
        Facebook regional data not available — Meta removed location insights from the New Page Experience API
      </p>
    </div>
  );
};

export default MetaRegions;
