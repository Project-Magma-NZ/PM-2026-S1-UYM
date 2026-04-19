import React from 'react';
import { motion } from 'motion/react';
import { Users, UserPlus, MousePointer2, Heart, Award } from 'lucide-react';
import { cn } from '../lib/utils';
import { KPIData } from '../types';

const ICON_MAP = {
  'users': Users,
  'user-plus': UserPlus,
  'mouse': MousePointer2,
  'heart': Heart,
  'award': Award,
};

const StatsCard: React.FC<{ data: KPIData }> = ({ data }) => {
  const Icon = ICON_MAP[data.icon as keyof typeof ICON_MAP] || Users;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-2 relative overflow-hidden group"
    >
      <div className="flex justify-between items-start">
        <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-brand-cream transition-colors">
          <Icon size={20} className="text-slate-600 group-hover:text-brand-brown transition-colors" />
        </div>
        {data.change && (
          <div className={cn(
            "text-[10px] font-bold px-2 py-1 rounded-full",
            data.trend === 'up' ? "bg-emerald-50 text-emerald-600" :
            data.trend === 'down' ? "bg-rose-50 text-rose-600" : "bg-slate-50 text-slate-600"
          )}>
            {data.change}
          </div>
        )}
        {data.isNew && (
          <div className="text-[10px] font-bold px-2 py-1 rounded-full bg-brand-cream text-brand-brown italic">
            ✨ New!
          </div>
        )}
      </div>
      <div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{data.label}</p>
        <h3 className="text-3xl font-black text-slate-900">{data.value}</h3>
      </div>
      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-slate-50/50 rounded-full group-hover:scale-110 transition-transform duration-500" />
    </motion.div>
  );
};

export default StatsCard;
