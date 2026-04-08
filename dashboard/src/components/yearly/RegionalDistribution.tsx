import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { REGIONS } from '../../data/mockData';

const WORLD_TOPO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// New Zealand country numeric code (ISO 3166-1)
const NZ_COUNTRY_ID = '554';

const RegionalDistribution = () => {
  const topRegion = REGIONS[0];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <h3 className="text-base font-black text-slate-900 mb-4">Regional Distribution</h3>

      <div className="relative bg-slate-50 rounded-xl mb-4 overflow-hidden" style={{ height: '220px' }}>
        <ComposableMap
          // Zoom and center projection onto New Zealand
          projectionConfig={{ scale: 1800, center: [172, -41] }}
          style={{ width: '100%', height: '100%' }}
        >
          <Geographies geography={WORLD_TOPO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const isNZ = geo.id === NZ_COUNTRY_ID;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={isNZ ? '#4a7c59' : 'transparent'}
                    stroke={isNZ ? '#3a6347' : 'none'}
                    strokeWidth={0.5}
                    style={{
                      default: { outline: 'none' },
                      hover: { outline: 'none' },
                      pressed: { outline: 'none' },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>

        {/* Top region label */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-md border border-slate-100">
          <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Top Region</p>
          <p className="text-sm font-black text-slate-900">{topRegion.label}</p>
        </div>
      </div>

      <div className="space-y-3">
        {REGIONS.map((region, i) => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between text-sm font-bold">
              <span className="text-slate-600">{region.label}</span>
              <span className="text-slate-900">{region.percentage}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-slate-900 rounded-full" style={{ width: `${region.percentage}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RegionalDistribution;
