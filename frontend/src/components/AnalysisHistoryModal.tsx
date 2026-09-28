import React, { useState, useEffect } from 'react';
import { 
  Database, 
  X, 
  Clock, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  ShieldCheck, 
  RefreshCw, 
  ArrowRight,
  Search
} from 'lucide-react';
import { SupabaseStatus, SavedAnalysisSummary } from '../lib/types';

interface AnalysisHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  onLoadAnalysis: (analysisId: string) => void;
}

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) || '/api';

export const AnalysisHistoryModal: React.FC<AnalysisHistoryModalProps> = ({
  isOpen,
  onClose,
  userId,
  onLoadAnalysis
}) => {
  const [status, setStatus] = useState<SupabaseStatus | null>(null);
  const [analyses, setAnalyses] = useState<SavedAnalysisSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchHistoryAndStatus = async () => {
    setIsLoading(true);
    try {
      const uParam = userId ? `?user_id=${encodeURIComponent(userId)}` : '';
      const [statusRes, histRes] = await Promise.all([
        fetch(`${API_BASE}/supabase/status`),
        fetch(`${API_BASE}/history${uParam}`)
      ]);

      if (statusRes.ok) {
        setStatus(await statusRes.json());
      }
      if (histRes.ok) {
        const hData = await histRes.json();
        setAnalyses(hData.analyses || []);
      }
    } catch (e) {
      console.warn("Failed to fetch Supabase history:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHistoryAndStatus();
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const filteredAnalyses = analyses.filter(a => 
    a.location_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.query?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 font-sans">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-[#0d1322] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Supabase Analysis History</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-900/40 text-blue-300 border border-blue-700/50">
                  STRUCTURED APPLICATION DATA
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Persistent database records of previous Earth-observation investigations
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Status Badge */}
            <div className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-medium flex items-center space-x-1.5 border ${
              status?.connected 
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400' 
                : 'bg-blue-950/60 border-blue-500/50 text-blue-300'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status?.connected ? 'bg-emerald-400 animate-ping' : 'bg-blue-400'}`} />
              <span>{status?.connected ? 'Supabase Online' : 'Local Storage Mode'}</span>
            </div>

            <button
              onClick={fetchHistoryAndStatus}
              disabled={isLoading}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Refresh History"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter and Stats Bar */}
        <div className="px-6 py-3 bg-slate-950/80 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search past analyses..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="text-slate-400 font-mono text-xs flex items-center space-x-2">
            <span>Saved Records: <strong className="text-white">{analyses.length}</strong></span>
          </div>
        </div>

        {/* List of Analyses */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-3">
          {filteredAnalyses.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Clock className="w-8 h-8 mx-auto text-slate-400 opacity-60" />
              <p className="text-sm">No analysis records found.</p>
              <p className="text-xs text-slate-400">Run any query in the live studio to persist records to the application database.</p>
            </div>
          ) : (
            filteredAnalyses.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onLoadAnalysis(item.id);
                  onClose();
                }}
                className="p-4 rounded-xl bg-slate-850/80 hover:bg-slate-800 border border-slate-700/60 hover:border-blue-500/50 cursor-pointer transition-all space-y-2 text-xs group"
              >
                <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono">
                  <span className="flex items-center space-x-1.5 text-blue-400 font-bold">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{item.location_name}</span>
                  </span>
                  <span className="text-slate-400">
                    {new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="text-slate-200 font-medium font-sans text-xs">
                  "{item.query}"
                </div>

                {item.headline && (
                  <p className="text-slate-400 text-xs line-clamp-1">
                    {item.headline}
                  </p>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400">
                  <div className="flex items-center space-x-4">
                    {item.actual_before_date && (
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{item.actual_before_date} → {item.actual_after_date}</span>
                      </span>
                    )}
                    <span>Changed: <strong className="text-amber-400">{item.total_changed_ha?.toLocaleString()} ha</strong> ({item.percent_aoi_changed}%)</span>
                  </div>

                  <span className="text-blue-400 group-hover:text-blue-300 font-semibold flex items-center space-x-1">
                    <span>Load Analysis</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#0a0f1c] flex items-center justify-between text-xs text-slate-400">
          <span>Row Level Security (RLS) active: Analysis records isolated per analyst.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            Close History
          </button>
        </div>

      </div>
    </div>
  );
};
