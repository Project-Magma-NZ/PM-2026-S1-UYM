import { useState } from "react";
import { ChevronRight, X } from "lucide-react";

type Record = {
  id: string;
  metric_name: string;
  platform: string;
  value: string;
  date: string;
};

type NewEntryFormProps = {
  onClose: () => void;
  onSave: (record: Record) => void;
};

const NewEntryForm = ({ onClose, onSave }: NewEntryFormProps) => {
  const [metric_name, setMetricName] = useState("");
  const [platform, setPlatform] = useState("");
  const [value, setValue] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const handleSave = async () => {
    const res = await fetch("http://localhost:8000/api/v1/metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ metric_name, date, value, platform }),
    });
    const data = await res.json();
    onSave({
      id: String(data.item.id),
      metric_name: data.item.metric_name,
      platform: data.item.platform,
      value: data.item.value,
      date: data.item.date,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="w-full max-w-md bg-white p-10 rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-50">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-slate-900">New Entry</h2>
          <button onClick={onClose}>
            <X size={20} className="text-slate-400 hover:text-slate-600" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] text-brand-brown font-bold uppercase tracking-widest ml-1">Metric Type</label>
            <input
              value={metric_name}
              onChange={(e) => setMetricName(e.target.value)}
              placeholder="e.g. Instagram Clicks"
              className="w-full bg-brand-cream/50 border-none rounded-2xl py-4 px-6 text-brand-brown font-medium focus:ring-2 focus:ring-brand-yellow outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-brand-brown font-bold uppercase tracking-widest ml-1">Platform</label>
            <input
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              placeholder="e.g. Instagram"
              className="w-full bg-brand-cream/50 border-none rounded-2xl py-4 px-6 text-brand-brown font-medium focus:ring-2 focus:ring-brand-yellow outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-brand-brown font-bold uppercase tracking-widest ml-1">Value</label>
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="e.g. 1,284"
              className="w-full bg-brand-cream/50 border-none rounded-2xl py-4 px-6 text-brand-brown font-medium focus:ring-2 focus:ring-brand-yellow outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-brand-brown font-bold uppercase tracking-widest ml-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-brand-cream/50 border-none rounded-2xl py-4 px-6 text-brand-brown font-medium focus:ring-2 focus:ring-brand-yellow outline-none transition-all"
            />
          </div>

          <button onClick={handleSave} className="w-full bg-brand-brown text-white py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-brand-brown/90 transition-all active:scale-[0.98] shadow-lg shadow-brand-brown/20">
            Save Entry <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewEntryForm;
