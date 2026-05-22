import { BarChart2 } from "lucide-react";

type CustomMetric = {
  id: string;
  metric_name: string;
  platform: string;
  value: string;
  date: string;
};

const Record = ({ metric_name, platform, value, date }: CustomMetric) => {
  return (
    <div className="grid grid-cols-[2fr_1fr_1fr_1fr_0.5fr] items-center px-4 py-5 border-b border-slate-100">
      <div className="flex items-center gap-3">
        <div className="bg-brand-yellow p-2 rounded-xl">
          <BarChart2 size={16} className="text-brand-brown" />
        </div>
        <p className="font-semibold text-slate-900">{metric_name || "Unknown"}</p>
      </div>
      <span className="bg-brand-cream text-brand-brown text-[10px] font-bold px-3 py-1 rounded-full uppercase w-fit">{platform || "Unknown"}</span>
      <p className="font-bold text-slate-900">{value || "Unknown"}</p>
      <p className="text-slate-500">{date || "Unknown"}</p>
    </div>
  );
};
export default Record;