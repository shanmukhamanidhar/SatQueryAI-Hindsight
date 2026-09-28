import React, { useState } from 'react';
import { 
  FileText, 
  X, 
  Download, 
  CheckCircle2, 
  Activity, 
  Calendar, 
  MapPin, 
  ShieldCheck,
  Layers
} from 'lucide-react';
import { AnalysisContext } from '../lib/types';
import { downloadPdfReport } from '../lib/api';

interface ReportModalProps {
  context: AnalysisContext | null;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ context, onClose }) => {
  const [downloading, setDownloading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!context) return null;

  const handleDownload = async () => {
    setDownloading(true);
    setSuccess(false);
    setError(null);
    try {
      await downloadPdfReport(context.analysis_id, context.location.name);
      setSuccess(true);
    } catch (err: any) {
      console.error('Failed to generate PDF:', err);
      setError(err?.message || 'Failed to generate PDF report');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-md">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl border border-blue-500/30 shadow-2xl p-5 font-sans animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-500/15 border border-blue-300 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-telemetry uppercase text-blue-600 dark:text-blue-400 font-bold tracking-wider">
                DOCUMENTATION SUITE
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Generate Remote Sensing Intelligence Report
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Report Preview Highlights */}
        <div className="space-y-3 text-xs font-sans mb-4">
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            SatQueryAI will compile a publication-grade executive PDF document containing high-resolution satellite observation pairs, multi-spectral change matrices, and AI interpretation.
          </p>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950/70 border border-slate-200 dark:border-zinc-800 space-y-2 font-telemetry text-[11px]">
            <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>Target: <strong className="text-slate-900 dark:text-white">{context.location.name}</strong> ({context.location.country})</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Interval: {context.actual_before_date} → {context.actual_after_date}</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
              <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Included: True-color RGBs, Change Heatmap, Deliberative Transition Matrix</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
              <span>Confidence Rating: <strong className="text-emerald-600 dark:text-emerald-400">{context.confidence.overall_score}% ({context.confidence.rating})</strong></span>
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-telemetry">
              <strong>Generation Error:</strong> {error}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-zinc-800">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-telemetry">
            Standard Format: Executive Letter PDF
          </span>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white text-xs font-telemetry font-bold transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs rounded-xl font-telemetry shadow-lg flex items-center space-x-2 transition-all disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <Activity className="w-3.5 h-3.5 animate-spin" />
                  <span>GENERATING PDF...</span>
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  <span>DOWNLOADED!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>DOWNLOAD PDF REPORT</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
