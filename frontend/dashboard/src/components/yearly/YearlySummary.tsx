import { useState } from 'react';
import { TrendingUp, Pencil, Check } from 'lucide-react';

const STORAGE_KEY = 'upside_yearly_summary';

const EMPTY_SUMMARY = {
  livesImpacted: '',
  livesImpactedChange: '',
  activeMatches: '',
  matchesGoalPercent: 0,
  mentorRetention: '',
};

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const YearlySummary = () => {
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState(() => loadSaved() ?? EMPTY_SUMMARY);
  const [draft, setDraft] = useState(values);

  const startEdit = () => {
    setDraft(values);
    setEditing(true);
  };

  const save = () => {
    setValues(draft);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    setEditing(false);
  };

  const field = (key: keyof typeof draft, label: string) => (
    editing ? (
      <input
        className="w-full text-2xl font-black text-slate-900 border-b-2 border-brand-yellow bg-transparent outline-none py-1"
        value={draft[key]}
        onChange={e => setDraft({ ...draft, [key]: e.target.value })}
        placeholder={label}
      />
    ) : (
      <h3 className="text-4xl font-black text-slate-900 mb-1">{values[key]}</h3>
    )
  );

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        {editing ? (
          <button onClick={save} className="flex items-center gap-2 px-4 py-2 bg-brand-yellow text-slate-900 rounded-xl text-xs font-black">
            <Check size={14} /> Save
          </button>
        ) : (
          <button onClick={startEdit} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors">
            <Pencil size={14} /> Edit internal metrics
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">TOTAL LIVES IMPACTED</p>
            {field('livesImpacted', 'e.g. 1,248')}
            {editing ? (
              <input
                className="w-full text-sm font-bold text-emerald-600 border-b border-slate-200 bg-transparent outline-none py-1 mt-1"
                value={draft.livesImpactedChange}
                onChange={e => setDraft({ ...draft, livesImpactedChange: e.target.value })}
                placeholder="e.g. +14.2% from 2022"
              />
            ) : (
              <div className="flex items-center gap-1 text-emerald-600 font-bold text-sm">
                <TrendingUp size={14} />
                <span>{values.livesImpactedChange}</span>
              </div>
            )}
          </div>
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-brand-cream/30 rounded-full" />
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">ACTIVE MATCHES</p>
          {field('activeMatches', 'e.g. 412')}
          {editing ? (
            <div className="space-y-1.5 mt-3">
              <input
                type="number"
                className="w-full text-xs font-bold text-slate-500 border-b border-slate-200 bg-transparent outline-none py-1"
                value={draft.matchesGoalPercent}
                onChange={e => setDraft({ ...draft, matchesGoalPercent: Number(e.target.value) })}
                placeholder="% of goal"
                min={0}
                max={100}
              />
            </div>
          ) : (
            <div className="space-y-1.5 mt-3">
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-brand-yellow rounded-full" style={{ width: `${values.matchesGoalPercent}%` }} />
              </div>
              <p className="text-[10px] text-slate-400 font-bold">{values.matchesGoalPercent}% of yearly goal reached</p>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">MENTOR RETENTION</p>
          {field('mentorRetention', 'e.g. 94%')}
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm mt-1">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span>Industry leading</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YearlySummary;
