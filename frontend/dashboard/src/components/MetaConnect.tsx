import { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';
import { fetchMetaStatus, MetaStatus } from '../services/meta';

const MetaConnect = () => {
  const [status, setStatus] = useState<MetaStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetaStatus().then((s) => {
      setStatus(s);
      setLoading(false);
    });
  }, []);

  return (
    <div className="border-t border-slate-100 pt-4 mt-2">
      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest px-4 mb-2">
        Meta Account
      </p>

      {loading ? (
        <div className="px-4 py-2 flex items-center gap-2 text-slate-300">
          <Loader size={13} className="animate-spin" />
          <span className="text-xs">Checking…</span>
        </div>
      ) : (
        <div className="px-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full shrink-0 ${status?.connected ? 'bg-green-400' : 'bg-slate-300'}`} />
            <span className="text-xs font-semibold text-slate-600 truncate">
              {status?.page_name ?? (status?.connected ? 'Connected' : 'Not configured')}
            </span>
          </div>
          <div className="pl-4 space-y-1">
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className={`w-1.5 h-1.5 rounded-full ${status?.facebook_connected ? 'bg-green-400' : 'bg-slate-300'}`} />
              <span>Facebook data {status?.facebook_connected ? 'connected' : 'not connected'}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className={`w-1.5 h-1.5 rounded-full ${status?.instagram_connected ? 'bg-green-400' : 'bg-slate-300'}`} />
              <span>Instagram data {status?.instagram_connected ? 'connected' : 'not connected'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetaConnect;
