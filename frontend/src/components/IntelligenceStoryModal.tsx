import React from 'react';
import { 
  X, 
  BookOpen, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  ArrowRight, 
  Trees, 
  Building2, 
  Droplets, 
  Sparkles, 
  Download, 
  Layers 
} from 'lucide-react';
import { AnalysisContext, ChangeRegion } from '../lib/types';
import { getCategoryColor } from '../lib/colorSystem';

interface IntelligenceStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: AnalysisContext | null;
  onSelectHotspot?: (region: ChangeRegion) => void;
  onOpenProvenance?: () => void;
  onOpenReport?: () => void;
}

export const IntelligenceStoryModal: React.FC<IntelligenceStoryModalProps> = ({
  isOpen,
  onClose,
  context,
  onSelectHotspot,
  onOpenProvenance,
  onOpenReport,
}) => {
  if (!isOpen || !context) return null;

  const stats = context.land_cover_stats;
  const builtStat = stats.find((s) => s.category.includes('Built'));
  const treeStat = stats.find((s) => s.category.includes('Trees'));
  const cropStat = stats.find((s) => s.category.includes('Crops'));
  const waterStat = stats.find((s) => s.category.includes('Water'));

  const builtChange = builtStat ? builtStat.change_ha : 0;
  const treeChange = treeStat ? treeStat.change_ha : 0;
  const cropChange = cropStat ? cropStat.change_ha : 0;
  const vegChange = treeChange + cropChange;
  const waterChange = waterStat ? waterStat.change_ha : 0;

  // Largest hotspot
  const largestRegion = context.change_regions && context.change_regions.length > 0
    ? [...context.change_regions].sort((a, b) => b.area_hectares - a.area_hectares)[0]
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-slate-100 font-sans">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-slate-50/80 dark:bg-zinc-950/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-700/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Satellite Intelligence Story
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-semibold uppercase">
                  Narrative Synthesis
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Traceable Earth-observation narrative derived from verified multispectral data
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"
            title="Close Story"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Story Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar text-sm">
          {/* Location & Period Header */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="text-[10.5px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                TARGET LOCATION
              </div>
              <div className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>{context.location.name}</span>
                <span className="text-xs font-normal text-slate-500">({context.location.country})</span>
              </div>
            </div>

            <div className="space-y-1 sm:text-right">
              <div className="text-[10.5px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                OBSERVATION TIMELINE
              </div>
              <div className="text-sm font-mono font-bold text-blue-600 dark:text-blue-400 flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{context.actual_before_date}</span>
                <span className="text-slate-400">➔</span>
                <span>{context.actual_after_date}</span>
              </div>
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
              EXECUTIVE NARRATIVE
            </h4>
            <p className="text-base font-bold text-slate-900 dark:text-white leading-snug">
              {context.ai_summary.headline}
            </p>
          </div>

          {/* Key Observations Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
              KEY SENSORY OBSERVATIONS
            </h4>

            <div className="space-y-2.5">
              {/* Built-up */}
              <div className="p-3.5 rounded-xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800/60 flex items-start space-x-3">
                <Building2 className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5 flex-1">
                  <div className="text-xs font-bold text-orange-900 dark:text-orange-200">
                    Built-Up / Urban Footprint
                  </div>
                  <div className="text-xs text-slate-700 dark:text-slate-300">
                    {builtChange > 0 
                      ? `Urban expansion of approximately ${builtChange.toFixed(1)} hectares detected across the analysis corridor.`
                      : 'Built environment has remained relatively stable over the observation window.'}
                  </div>
                </div>
              </div>

              {/* Vegetation */}
              <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 flex items-start space-x-3">
                <Trees className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5 flex-1">
                  <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    Vegetation &amp; Canopy
                  </div>
                  <div className="text-xs text-slate-700 dark:text-slate-300">
                    {vegChange > 5
                      ? `Photosynthetic biomass increased by ~${vegChange.toFixed(1)} ha, indicating healthy regrowth or agricultural expansion.`
                      : vegChange < -5
                      ? `Vegetation canopy decreased by ~${Math.abs(vegChange).toFixed(1)} ha in localized clearing zones.`
                      : 'Vegetation canopy has remained stable with expected seasonal variations.'}
                  </div>
                </div>
              </div>

              {/* Water */}
              <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/60 flex items-start space-x-3">
                <Droplets className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5 flex-1">
                  <div className="text-xs font-bold text-blue-900 dark:text-blue-200">
                    Water Dynamics
                  </div>
                  <div className="text-xs text-slate-700 dark:text-slate-300">
                    {Math.abs(waterChange) < 1.0
                      ? 'Water bodies and surface channels showed no statistically significant surface reduction or flooding.'
                      : waterChange > 0
                      ? `Surface water extent expanded by ~${waterChange.toFixed(1)} ha.`
                      : `Surface water extent contracted by ~${Math.abs(waterChange).toFixed(1)} ha.`}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Largest Hotspot Spotlight */}
          {largestRegion && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 flex items-center justify-between gap-3">
              <div className="space-y-0.5 min-w-0">
                <div className="text-[10.5px] font-mono text-slate-400 uppercase font-bold">
                  PRIMARY CHANGE HOTSPOT
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {largestRegion.user_label} (~{largestRegion.area_hectares.toFixed(1)} ha)
                </div>
              </div>

              {onSelectHotspot && (
                <button
                  type="button"
                  onClick={() => {
                    onSelectHotspot(largestRegion);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs font-bold transition-all shadow-xs flex items-center space-x-1 shrink-0"
                >
                  <span>Open Hotspot</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {/* Physical Evidence Verification */}
          <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 space-y-1.5 text-xs text-slate-600 dark:text-zinc-300 font-mono">
            <div className="flex items-center space-x-1.5 text-slate-900 dark:text-white font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Traceable Scientific Evidence</span>
            </div>
            <div>• Imagery Source: {context.imagery_source}</div>
            <div>• Spatial Resolution: {context.resolution}</div>
            <div>• Usable Pixels: {context.usable_pixel_pct_before.toFixed(0)}% (Before) / {context.usable_pixel_pct_after.toFixed(0)}% (After)</div>
            <div>• Total Area Analyzed: {context.total_aoi_hectares.toLocaleString()} hectares</div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/80 dark:bg-zinc-950/50">
          <div className="flex items-center space-x-2">
            {onOpenProvenance && (
              <button
                type="button"
                onClick={() => {
                  onOpenProvenance();
                  onClose();
                }}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 text-xs font-mono font-bold text-slate-700 dark:text-zinc-300 transition-all"
              >
                VIEW FULL EVIDENCE
              </button>
            )}

            {onOpenReport && (
              <button
                type="button"
                onClick={() => {
                  onOpenReport();
                  onClose();
                }}
                className="px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 text-xs font-mono font-bold transition-all flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>EXECUTIVE PDF REPORT</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold font-mono transition-all"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
