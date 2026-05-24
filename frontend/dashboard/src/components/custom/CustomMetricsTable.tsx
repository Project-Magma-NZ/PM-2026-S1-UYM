import { useState, useEffect } from "react";
import CustomMetric from "./CustomMetric";
import NewEntryForm from "./NewEntryForm";

export default function CustomMetricsTable() {
  const [isEntry, setIsEntry] = useState(false);
  const [records, setRecords] = useState<{ id: string; metric_name: string; platform: string; value: string; date: string }[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/v1/metrics`)
      .then((res) => res.json())
      .then((data) => {
        const mapped = data.items.map((item: any) => ({
          id: String(item.id),
          metric_name: item.metric_name,
          platform: "",
          value: item.value,
          date: item.date,
        }));
        setRecords(mapped);
      });
  }, []);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(7);

  useEffect(() => {
    const calculate = () => {
      const rowHeight = 72;
      const reserved = 280; // header + table header + pagination + padding
      const available = window.innerHeight - reserved;
      const count = Math.max(3, Math.floor(available / rowHeight));
      setRecordsPerPage(count);
    };
    calculate();
    window.addEventListener("resize", calculate);
    return () => window.removeEventListener("resize", calculate);
  }, []);
  const totalPages = Math.ceil(records.length / recordsPerPage);
  const paginatedRecords = records.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  return (
    <div className="flex flex-col gap-8">
      {isEntry && <NewEntryForm onClose={() => setIsEntry(false)} onSave={(record) => setRecords([record, ...records])} />}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Custom Records</h1>
        </div>
        <button onClick={() => setIsEntry(true)} className="flex items-center gap-2 bg-brand-brown text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-brown/90 transition">
          + New Entry
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Column headers */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_0.5fr] bg-brand-cream px-6 py-4 rounded-t-2xl">
          <p className="text-[11px] font-bold text-brand-brown uppercase tracking-widest">Metric Type</p>
          <p className="text-[11px] font-bold text-brand-brown uppercase tracking-widest">Platform</p>
          <p className="text-[11px] font-bold text-brand-brown uppercase tracking-widest">Value</p>
          <p className="text-[11px] font-bold text-brand-brown uppercase tracking-widest">Date</p>
          <p className="text-[11px] font-bold text-brand-brown uppercase tracking-widest">Actions</p>
        </div>

        {/* Rows */}
        {paginatedRecords.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <p className="text-2xl">📋</p>
            <p className="text-slate-700 font-semibold">No records yet</p>
            <p className="text-sm text-slate-400">Click <span className="font-medium text-brand-brown">+ New Entry</span> to add your first custom metric.</p>
          </div>
        ) : (
          paginatedRecords.map((record) => (
            <CustomMetric
              key={record.id}
              id={record.id}
              metric_name={record.metric_name}
              platform={record.platform}
              value={record.value}
              date={record.date}
              onDelete={(id) => setRecords(records.filter((r) => r.id !== id))}
              onEdit={(id, updated) => setRecords(records.map((r) => r.id === id ? { ...r, ...updated } : r))}
            />
          ))
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 bg-brand-cream rounded-b-2xl">
          <p className="text-sm text-brand-brown font-medium">
            Showing {Math.min(currentPage * recordsPerPage, records.length)} of {records.length} records
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 font-bold text-lg disabled:opacity-30"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold ${
                  page === currentPage
                    ? "bg-brand-brown text-white"
                    : "border border-slate-200 text-slate-600"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 font-bold text-lg disabled:opacity-30"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
