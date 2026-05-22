import { BarChart2, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

type CustomMetric = {
  id: string;
  metric_name: string;
  platform: string;
  value: string;
  date: string;
  onDelete: (id: string) => void;
  onEdit: (id: string, updated: { metric_name: string; date: string; value: string }) => void;
};

const Record = ({ id, metric_name, platform, value, date, onDelete, onEdit }: CustomMetric) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(metric_name);
  const [editValue, setEditValue] = useState(value);
  const [editDate, setEditDate] = useState(date);
  const [editPlatform, setEditPlatform] = useState(platform);

  const handleSave = async () => {
    const res = await fetch(`http://localhost:8000/api/v1/metrics/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ metric_name: editName, date: editDate, value: editValue, platform: editPlatform }),
    });
    if (res.ok) {
      onEdit(id, { metric_name: editName, date: editDate, value: editValue });
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    const res = await fetch(`http://localhost:8000/api/v1/metrics/${id}`, { method: "DELETE" });
    if (res.ok) onDelete(id);
  };

  if (isEditing) {
    return (
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr_0.5fr] items-center px-4 py-3 border-b border-slate-100 gap-2">
        <input value={editName} onChange={(e) => setEditName(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-brand-yellow" />
        <input value={editPlatform} onChange={(e) => setEditPlatform(e.target.value)}
  placeholder="Platform"
  className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-brand-brown outline-none focus:ring-2 focus:ring-brand-yellow" />
        <input value={editValue} onChange={(e) => setEditValue(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-brand-yellow" />
        <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-500 outline-none focus:ring-2 focus:ring-brand-yellow" />
        <div className="flex gap-1">
          <button onClick={handleSave} className="text-xs bg-brand-brown text-white px-2 py-1 rounded-lg font-semibold">Save</button>
          <button onClick={() => setIsEditing(false)} className="text-xs border border-slate-200 px-2 py-1 rounded-lg text-slate-500">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[2fr_1fr_1fr_1fr_0.5fr] items-center px-4 py-5 border-b border-slate-100">
      <div className="flex items-center gap-3">
        <div className="bg-brand-yellow p-2 rounded-xl">
          <BarChart2 size={16} className="text-brand-brown" />
        </div>
        <p className="font-semibold text-slate-900">{metric_name || "Unknown"}</p>
      </div>
      <span className="bg-brand-cream text-brand-brown text-[10px] font-bold px-3 py-1 rounded-full uppercase w-fit">{platform || "—"}</span>
      <p className="font-bold text-slate-900">{value || "Unknown"}</p>
      <p className="text-slate-500">{date || "Unknown"}</p>
      <div className="flex gap-2">
        <button onClick={() => setIsEditing(true)} className="text-slate-400 hover:text-brand-brown transition">
          <Pencil size={15} />
        </button>
        <button onClick={handleDelete} className="text-slate-400 hover:text-red-500 transition">
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
};

export default Record;