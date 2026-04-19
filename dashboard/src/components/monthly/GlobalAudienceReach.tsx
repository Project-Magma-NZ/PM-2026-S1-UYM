import { motion } from 'motion/react';
import { TrendingUp } from 'lucide-react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { COUNTRY_REACH } from '../../data/mockData';

const WORLD_TOPO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const GlobalAudienceReach = () => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <h3 className="text-base font-black text-slate-900 mb-1">Global Audience Reach</h3>
        <p className="text-slate-500 text-sm font-medium mb-5">User distribution across top performing countries</p>
        <div className="space-y-4">
          {COUNTRY_REACH.map((country, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex justify-between text-sm font-bold">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-300 font-black">0{i + 1}</span>
                  <span className="text-slate-900">{country.name}</span>
                </div>
                <span className="text-slate-900">{country.percentage}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${country.percentage}%` }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                  className="h-full bg-slate-900 rounded-full"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative bg-slate-900 rounded-3xl overflow-hidden min-h-[240px] flex items-center justify-center group">
        <ComposableMap
          projectionConfig={{ scale: 140, center: [10, 10] }}
          style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
        >
          <Geographies geography={WORLD_TOPO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#334155"
                  stroke="#1e293b"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: 'none' },
                    hover: { fill: '#475569', outline: 'none' },
                    pressed: { outline: 'none' },
                  }}
                />
              ))
            }
          </Geographies>
        </ComposableMap>

        <div className="absolute bottom-5 left-5 right-5 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <TrendingUp className="text-white" size={16} />
            </div>
            <div>
              <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest">Global Growth</p>
              <p className="text-sm font-bold text-white">North America +8.2%</p>
            </div>
          </div>
          <button className="bg-white text-slate-900 px-4 py-2 rounded-xl text-xs font-black hover:bg-brand-yellow transition-colors">
            World View
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default GlobalAudienceReach;
