import React from 'react';
import { 
  Sliders, 
  Cpu, 
  Database, 
  Layers, 
  FileCode2, 
  CheckCircle2, 
  Activity,
  ArrowRight,
  TrendingUp,
  X
} from 'lucide-react';
import { AnalysisContext } from '../lib/types';

interface ExpertPanelProps {
  context: AnalysisContext;
  onClose: () => void;
}

export const ExpertPanel: React.FC<ExpertPanelProps> = ({ context, onClose }) => {
  const ind = context.indices_summary;

  return (
    <div className="absolute top-16 right-4 z-40 w-[480px] max-w-[calc(100vw-2rem)] bg-white dark:bg-zinc-900 rounded-2xl border border-amber-300 dark:border-amber-500/40 shadow-2xl p-4 font-sans backdrop-blur-2xl max-h-[85vh] overflow-y-auto text-slate-800 dark:text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-200 dark:border-amber-800/40 pb-2 mb-3">
        <div className="flex items-center space-x-2">
          <div className="h-7 w-7 rounded-lg bg-amber-50 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-telemetry uppercase text-amber-600 dark:text-amber-400 font-bold tracking-wider">
              REMOTE-SENSING EXPERT TELEMETRY
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Sensor & Multi-Spectral Diagnostics</h3>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Sensor & Pipeline Provenance */}
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-xs font-telemetry space-y-1.5 mb-3">
        <div className="flex justify-between">
          <span className="text-slate-500 dark:text-slate-400">Platform:</span>
          <span className="text-slate-800 dark:text-slate-100 font-semibold">{context.imagery_source}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500 dark:text-slate-400">Instrument:</span>
          <span className="text-slate-800 dark:text-slate-100 font-semibold">{context.sensor}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500 dark:text-slate-400">Ground Sample Distance:</span>
          <span className="text-blue-600 dark:text-blue-400 font-semibold">{context.resolution}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500 dark:text-slate-400">Cloud Coverage:</span>
          <span className="text-slate-700 dark:text-slate-200">Before: {context.cloud_percentage_before}% | After: {context.cloud_percentage_after}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500 dark:text-slate-400">Usable Pixels:</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Before: {context.usable_pixel_pct_before}% | After: {context.usable_pixel_pct_after}%</span>
        </div>
      </div>

      {/* Remote Sensing Indices Table */}
      <div className="mb-3">
        <h4 className="text-xs font-bold font-telemetry text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
          <Sliders className="w-3.5 h-3.5 text-amber-500" />
          <span>SPECTRAL INDEX DELTAS</span>
        </h4>

        <div className="grid grid-cols-3 gap-2 text-xs font-telemetry">
          {/* NDVI */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700">
            <span className="text-[10px] text-slate-700 dark:text-slate-300 block font-bold">NDVI</span>
            <span className="text-[9px] text-slate-500 block truncate">Veg Health</span>
            <div className="mt-1.5 space-y-0.5 text-[11px]">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Before:</span>
                <span className="text-slate-700 dark:text-slate-200">{ind.ndvi_before_mean}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>After:</span>
                <span className="text-slate-700 dark:text-slate-200">{ind.ndvi_after_mean}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-zinc-700 font-bold">
                <span>Delta:</span>
                <span className={ind.delta_ndvi_mean >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                  {ind.delta_ndvi_mean >= 0 ? `+${ind.delta_ndvi_mean}` : ind.delta_ndvi_mean}
                </span>
              </div>
            </div>
          </div>

          {/* NDBI */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700">
            <span className="text-[10px] text-slate-700 dark:text-slate-300 block font-bold">NDBI</span>
            <span className="text-[9px] text-slate-500 block truncate">Built-up</span>
            <div className="mt-1.5 space-y-0.5 text-[11px]">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Before:</span>
                <span className="text-slate-700 dark:text-slate-200">{ind.ndbi_before_mean}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>After:</span>
                <span className="text-slate-700 dark:text-slate-200">{ind.ndbi_after_mean}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-zinc-700 font-bold">
                <span>Delta:</span>
                <span className={ind.delta_ndbi_mean >= 0 ? 'text-orange-600 dark:text-orange-400' : 'text-slate-500'}>
                  {ind.delta_ndbi_mean >= 0 ? `+${ind.delta_ndbi_mean}` : ind.delta_ndbi_mean}
                </span>
              </div>
            </div>
          </div>

          {/* NDWI */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700">
            <span className="text-[10px] text-slate-700 dark:text-slate-300 block font-bold">NDWI</span>
            <span className="text-[9px] text-slate-500 block truncate">Water</span>
            <div className="mt-1.5 space-y-0.5 text-[11px]">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Before:</span>
                <span className="text-slate-700 dark:text-slate-200">{ind.ndwi_before_mean}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>After:</span>
                <span className="text-slate-700 dark:text-slate-200">{ind.ndwi_after_mean}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-zinc-700 font-bold">
                <span>Delta:</span>
                <span className="text-blue-600 dark:text-sky-400">
                  {ind.delta_ndwi_mean >= 0 ? `+${ind.delta_ndwi_mean}` : ind.delta_ndwi_mean}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Land-Cover Transition Matrix Table */}
      <div className="mb-3">
        <h4 className="text-xs font-bold font-telemetry text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
          <Layers className="w-3.5 h-3.5 text-amber-500" />
          <span>TRANSITION DYNAMICS</span>
        </h4>

        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 max-h-40 overflow-y-auto space-y-1.5 text-xs font-telemetry">
          {context.transitions.length > 0 ? (
            context.transitions.map((t, idx) => (
              <div key={idx} className="flex items-center justify-between text-[11px] pb-1 border-b border-slate-200 dark:border-zinc-700/60 last:border-none">
                <div className="flex items-center space-x-1.5 text-slate-700 dark:text-slate-300">
                  <span className="text-slate-500 dark:text-slate-400">{t.from_class}</span>
                  <ArrowRight className="w-3 h-3 text-amber-500" />
                  <span className="text-slate-900 dark:text-slate-100 font-semibold">{t.to_class}</span>
                </div>
                <span className="text-amber-600 dark:text-amber-300 font-bold">{t.area_ha} ha</span>
              </div>
            ))
          ) : (
            <p className="text-slate-500 text-xs">No dominant discrete land-cover transitions registered.</p>
          )}
        </div>
      </div>

      {/* Scientific Methodology */}
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-xs font-telemetry space-y-1">
        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase block">Methodology & Algorithms</span>
        <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
          Change detection utilizes normalized multi-index difference thresholding combined with 3x3 morphological structuring elements (opening & closing) to suppress sensor speckle noise. Connected-component labelling is filtered at a minimum 0.5 ha threshold for vector polygon formation.
        </p>
      </div>
    </div>
  );
};
