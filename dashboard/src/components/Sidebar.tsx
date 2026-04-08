import { Calendar, BarChart3, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { View } from '../types';

interface SidebarProps {
  currentView: View;
  setView: (v: View) => void;
}

const Sidebar = ({ currentView, setView }: SidebarProps) => (
  <div className="w-64 h-full bg-brand-sidebar border-r border-slate-100 flex flex-col p-6 fixed left-0 top-0 z-10">
    <div className="mb-12">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-brand-yellow font-black text-2xl tracking-tighter">upside</span>
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">youth<br/>mentoring</span>
      </div>
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Mentoring Analytics</p>
    </div>

    <nav className="flex-1 space-y-2">
      <button
        onClick={() => setView('monthly')}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
          currentView === 'monthly'
            ? "bg-brand-yellow text-brand-brown shadow-lg shadow-brand-yellow/20"
            : "text-slate-500 hover:bg-slate-50"
        )}
      >
        <Calendar size={18} />
        <span className="font-semibold text-sm">Monthly Stats</span>
      </button>
      <button
        onClick={() => setView('yearly')}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
          currentView === 'yearly'
            ? "bg-brand-yellow text-brand-brown shadow-lg shadow-brand-yellow/20"
            : "text-slate-500 hover:bg-slate-50"
        )}
      >
        <BarChart3 size={18} />
        <span className="font-semibold text-sm">Yearly Stats</span>
      </button>
    </nav>

    <button
      onClick={() => setView('login')}
      className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-600 transition-colors mt-auto"
    >
      <LogOut size={18} />
      <span className="font-semibold text-sm">Logout</span>
    </button>
  </div>
);

export default Sidebar;
