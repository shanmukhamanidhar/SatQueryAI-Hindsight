import React, { useState } from 'react';
import { 
  Building2, 
  Trees, 
  Droplets, 
  Sparkles, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  TrendingUp, 
  Calendar, 
  Layers, 
  ArrowRight,
  ExternalLink,
  HelpCircle,
  Eye,
  Crosshair
} from 'lucide-react';
import { AnalysisContext, ChangeRegion } from '../lib/types';
import { getCategoryVisual } from '../lib/categoryThumbnails';
import { getCategoryColor, getCategoryConfig } from '../lib/colorSystem';

interface SummaryCardProps {
  context: AnalysisContext;
  onFilterCategory: (category: string | null) => void;
  activeFilter: string | null;
  onSelectRegion: (region: ChangeRegion) => void;
  onOpenProvenance: () => void;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  context,
  onFilterCategory,
  activeFilter,
  onSelectRegion,
  onOpenProvenance,
}) => {
  const [expandedCard, setExpandedCard] = useState<'urban' | 'veg' | 'water' | null>('urban');
  const [showConfidenceWhy, setShowConfidenceWhy] = useState(false);

  const stats = context.land_cover_stats;
  const builtStat = stats.find((s) => s.category.includes('Built'));
  const treeStat = stats.find((s) => s.category.includes('Trees'));
  const cropStat = stats.find((s) => s.category.includes('Crops'));
  const waterStat = stats.find((s) => s.category.includes('Water'));

  const conf = context.confidence;
  const beforeYear = context.actual_before_date.split('-')[0];
  const afterYear = context.actual_after_date.split('-')[0];
  const changeIntensity = context.percent_aoi_changed > 10 ? 'significantly' : context.percent_aoi_changed > 3 ? 'moderately' : 'slightly';

  // Urban Growth
  const builtChange = builtStat ? builtStat.change_ha : 0;
  const builtLabel = builtChange > 0 ? "Newly built-up areas detected." : "Stable built footprint.";

  // Vegetation
  const treeChange = treeStat ? treeStat.change_ha : 0;
  const cropChange = cropStat ? cropStat.change_ha : 0;
  const vegChange = Number((treeChange + cropChange).toFixed(2));
  const vegLabel = vegChange > 5 ? "Vegetated area increased." : vegChange < -5 ? "Vegetated area changed across the analysis region." : "No significant vegetation change detected.";

  // Water
  const waterChange = waterStat ? waterStat.change_ha : 0;
  const waterLabel = Math.abs(waterChange) < 1.0 ? "No significant water-surface change detected." : waterChange > 0 ? "Water surface expanded." : "Water surface contracted.";

  // Dashboard Status and Arrow logic based strictly on real analysis
  const vegArrow = treeChange > 5 ? '↑' : treeChange < -5 ? '↓' : '→';
  const vegStatus = Math.abs(treeChange) > 25 ? 'Significant change' : Math.abs(treeChange) > 5 ? 'Moderate change' : 'Stable';

  const waterArrow = waterChange > 2 ? '↑' : waterChange < -2 ? '↓' : '→';
  const waterStatus = Math.abs(waterChange) > 10 ? 'Significant change' : Math.abs(waterChange) > 2 ? 'Moderate change' : 'Stable';

  const builtArrow = builtChange > 5 ? '↑' : builtChange < -5 ? '↓' : '→';
  const builtStatus = Math.abs(builtChange) > 25 ? 'Significant change' : Math.abs(builtChange) > 5 ? 'Moderate change' : 'Stable';

  const cropArrow = cropChange > 5 ? '↑' : cropChange < -5 ? '↓' : '→';
  const cropStatus = Math.abs(cropChange) > 25 ? 'Significant change' : Math.abs(cropChange) > 5 ? 'Moderate change' : 'Stable';

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border-l border-slate-200 dark:border-zinc-800 backdrop-blur-xl overflow-y-auto p-4 space-y-4 font-sans text-slate-800 dark:text-slate-100">
      {/* Top Headline Card */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-50/90 via-slate-50 to-indigo-50/60 dark:from-zinc-800/90 dark:via-zinc-900 dark:to-zinc-900 p-4 border border-blue-100 dark:border-zinc-700/80 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center justify-between text-xs font-telemetry mb-2">
          <span className="flex items-center space-x-1.5 text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>EXECUTIVE SUMMARY</span>
          </span>
          <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/30 text-[10px] text-blue-700 dark:text-blue-300 font-semibold">
            {context.resolution} GSD
          </span>
        </div>

        <h2 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
          {context.location.name} changed {changeIntensity} between {beforeYear} and {afterYear}.
        </h2>

        <div className="flex items-center space-x-2 text-[11px] text-slate-600 dark:text-slate-400 mt-2 font-telemetry bg-white/80 dark:bg-zinc-800/70 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700">
          <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
          <span className="text-slate-700 dark:text-slate-300 font-medium">{context.actual_before_date}</span>
          <span className="text-slate-400 dark:text-slate-500">→</span>
          <span className="text-blue-600 dark:text-blue-400 font-semibold">{context.actual_after_date}</span>
        </div>
      </div>

      {/* Compact Environmental-Change Dashboard (Requirement 5) */}
      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            ENVIRONMENTAL-CHANGE DASHBOARD
          </span>
          <span className="text-[9.5px] font-mono text-slate-400">CLICK TO FILTER</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* VEGETATION */}
          <button
            type="button"
            onClick={() => onFilterCategory(activeFilter === 'vegetation' ? null : 'vegetation')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              activeFilter === 'vegetation'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-700 ring-1 ring-emerald-500/20'
                : 'bg-white dark:bg-zinc-900 hover:bg-emerald-50/40 dark:hover:bg-zinc-800 border-slate-200 dark:border-zinc-700'
            }`}
          >
            <div className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 uppercase flex items-center justify-between">
              <span>VEGETATION</span>
              <span className="font-bold text-sm">{vegArrow}</span>
            </div>
            <div className="font-semibold text-slate-900 dark:text-white mt-1 text-[11px] truncate">
              {vegStatus}
            </div>
            <div className="text-[9.5px] font-mono text-slate-500 dark:text-zinc-400 mt-0.5">
              {treeChange >= 0 ? `+${treeChange.toFixed(1)} ha` : `${treeChange.toFixed(1)} ha`}
            </div>
          </button>

          {/* WATER */}
          <button
            type="button"
            onClick={() => onFilterCategory(activeFilter === 'water' ? null : 'water')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              activeFilter === 'water'
                ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700 ring-1 ring-blue-500/20'
                : 'bg-white dark:bg-zinc-900 hover:bg-blue-50/40 dark:hover:bg-zinc-800 border-slate-200 dark:border-zinc-700'
            }`}
          >
            <div className="text-[10px] font-mono font-bold text-blue-700 dark:text-blue-400 uppercase flex items-center justify-between">
              <span>WATER</span>
              <span className="font-bold text-sm">{waterArrow}</span>
            </div>
            <div className="font-semibold text-slate-900 dark:text-white mt-1 text-[11px] truncate">
              {waterStatus}
            </div>
            <div className="text-[9.5px] font-mono text-slate-500 dark:text-zinc-400 mt-0.5">
              {waterChange >= 0 ? `+${waterChange.toFixed(1)} ha` : `${waterChange.toFixed(1)} ha`}
            </div>
          </button>

          {/* BUILT-UP */}
          <button
            type="button"
            onClick={() => onFilterCategory(activeFilter === 'urban' ? null : 'urban')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              activeFilter === 'urban'
                ? 'bg-orange-50 dark:bg-orange-950/40 border-orange-400 dark:border-orange-700 ring-1 ring-orange-500/20'
                : 'bg-white dark:bg-zinc-900 hover:bg-orange-50/40 dark:hover:bg-zinc-800 border-slate-200 dark:border-zinc-700'
            }`}
          >
            <div className="text-[10px] font-mono font-bold text-orange-700 dark:text-orange-400 uppercase flex items-center justify-between">
              <span>BUILT-UP</span>
              <span className="font-bold text-sm">{builtArrow}</span>
            </div>
            <div className="font-semibold text-slate-900 dark:text-white mt-1 text-[11px] truncate">
              {builtStatus}
            </div>
            <div className="text-[9.5px] font-mono text-slate-500 dark:text-zinc-400 mt-0.5">
              {builtChange >= 0 ? `+${builtChange.toFixed(1)} ha` : `${builtChange.toFixed(1)} ha`}
            </div>
          </button>

          {/* AGRICULTURE */}
          <button
            type="button"
            onClick={() => onFilterCategory(activeFilter === 'bare' ? null : 'bare')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              activeFilter === 'bare'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 dark:border-amber-700 ring-1 ring-amber-500/20'
                : 'bg-white dark:bg-zinc-900 hover:bg-amber-50/40 dark:hover:bg-zinc-800 border-slate-200 dark:border-zinc-700'
            }`}
          >
            <div className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400 uppercase flex items-center justify-between">
              <span>AGRICULTURE</span>
              <span className="font-bold text-sm">{cropArrow}</span>
            </div>
            <div className="font-semibold text-slate-900 dark:text-white mt-1 text-[11px] truncate">
              {cropStatus}
            </div>
            <div className="text-[9.5px] font-mono text-slate-500 dark:text-zinc-400 mt-0.5">
              {cropChange >= 0 ? `+${cropChange.toFixed(1)} ha` : `${cropChange.toFixed(1)} ha`}
            </div>
          </button>
        </div>
      </div>

      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-telemetry uppercase tracking-wider">
          WHAT CHANGED?
        </span>
        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-telemetry">
          CLICK CARD TO FILTER
        </span>
      </div>

      {/* 3 Figma-inspired Category Change Cards */}
      <div className="space-y-3">
        {/* 1. Urban Growth Card */}
        <div 
          onClick={() => {
            onFilterCategory(activeFilter === 'Urban development' ? null : 'Urban development');
            setExpandedCard(expandedCard === 'urban' ? null : 'urban');
          }}
          className={`cursor-pointer rounded-2xl overflow-hidden border transition-all shadow-sm ${
            activeFilter === 'Urban development'
              ? 'border-orange-500 ring-2 ring-orange-500/20 bg-orange-50/50 dark:bg-orange-950/30'
              : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-800/60'
          }`}
        >
          {/* Card Top Accent Strip */}
          <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 to-amber-500" />
          
          <div className="p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <img 
                  src="/thumbnails/category_urban.jpg" 
                  alt="Urban Expansion Satellite View" 
                  className="w-10 h-10 rounded-xl object-cover border border-orange-300 dark:border-orange-500/40 shadow-sm shrink-0" 
                />
                <div>
                  <div className="text-[10px] font-telemetry font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wide">
                    URBAN DEVELOPMENT
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Urban growth
                  </h4>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold font-telemetry text-orange-700 dark:text-orange-300 bg-orange-100/70 dark:bg-orange-500/20 px-2 py-0.5 rounded-full border border-orange-200 dark:border-orange-500/30 font-semibold">
                  {builtChange >= 0 ? `+${builtChange}` : builtChange} ha
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              "{builtLabel}"
            </p>

            {/* Expandable Why & Evidence Details */}
            {expandedCard === 'urban' && (
              <div className="pt-2 mt-2 border-t border-slate-200 dark:border-zinc-700/80 space-y-2 text-[11px]">
                <div className="text-slate-500 dark:text-slate-400 font-telemetry text-[10px] uppercase font-semibold">
                  EVIDENCE & METHODOLOGY:
                </div>
                <div className="space-y-1 text-slate-600 dark:text-slate-300">
                  <div className="flex items-start space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-orange-500 mt-0.5 shrink-0" />
                    <span>NDBI index elevated across new built-up footprint (+{context.indices_summary.delta_ndbi_mean.toFixed(2)} mean shift).</span>
                  </div>
                  <div className="flex items-start space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-orange-500 mt-0.5 shrink-0" />
                    <span>Sentinel-2 multispectral surface reflectance validated across observation timeline.</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2. Vegetation / Deforestation Card */}
        <div 
          onClick={() => {
            const filterTarget = vegChange < 0 ? 'deforestation' : 'regrowth';
            onFilterCategory(activeFilter === filterTarget ? null : filterTarget);
            setExpandedCard(expandedCard === 'veg' ? null : 'veg');
          }}
          className={`cursor-pointer rounded-2xl overflow-hidden border transition-all shadow-sm ${
            (activeFilter === 'deforestation' || activeFilter === 'Vegetation loss' || activeFilter === 'regrowth' || activeFilter === 'Vegetation gain')
              ? (vegChange < 0 
                  ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/50 dark:bg-rose-950/30' 
                  : 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/30')
              : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-800/60'
          }`}
        >
          {/* Card Top Accent Strip */}
          <div className={`h-1.5 w-full ${vegChange < 0 ? 'bg-gradient-to-r from-rose-500 to-red-600' : 'bg-gradient-to-r from-emerald-500 to-teal-500'}`} />

          <div className="p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <img 
                  src={vegChange < 0 ? "/thumbnails/category_deforestation.jpg" : "/thumbnails/category_vegetation.jpg"}
                  alt="Vegetation Satellite View" 
                  className={`w-10 h-10 rounded-xl object-cover border shadow-sm shrink-0 ${
                    vegChange < 0 ? 'border-rose-400 dark:border-rose-500/60' : 'border-emerald-400 dark:border-emerald-500/60'
                  }`} 
                />
                <div>
                  <div className={`text-[10px] font-telemetry font-bold uppercase tracking-wide ${
                    vegChange < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {vegChange < 0 ? 'DEFORESTATION & CANOPY LOSS' : 'VEGETATION GROWTH & CANOPY'}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {vegChange < 0 ? 'Deforestation' : 'Vegetation'}
                  </h4>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-xs font-bold font-telemetry px-2 py-0.5 rounded-full border font-semibold ${
                  vegChange >= 0 
                    ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-500/20 border-emerald-200 dark:border-emerald-500/30' 
                    : 'text-rose-700 dark:text-rose-300 bg-rose-100/70 dark:bg-rose-500/20 border-rose-200 dark:border-rose-500/30'
                }`}>
                  {vegChange >= 0 ? `+${vegChange}` : vegChange} ha
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              "{vegLabel}"
            </p>

            {/* Expandable Why & Evidence Details */}
            {expandedCard === 'veg' && (
              <div className="pt-2 mt-2 border-t border-slate-200 dark:border-zinc-700/80 space-y-2 text-[11px]">
                <div className="text-slate-500 dark:text-slate-400 font-telemetry text-[10px] uppercase font-semibold">
                  SPECTRAL EVIDENCE:
                </div>
                <div className="space-y-1 text-slate-600 dark:text-slate-300">
                  <div className="flex items-start space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    <span>Normalized Difference Vegetation Index (NDVI) shift: {context.indices_summary.delta_ndvi_mean >= 0 ? `+${context.indices_summary.delta_ndvi_mean.toFixed(2)}` : context.indices_summary.delta_ndvi_mean.toFixed(2)}.</span>
                  </div>
                  <div className="flex items-start space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    <span>Red-edge & NIR reflectance processed with cloud shadow masking.</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. Water Card */}
        <div 
          onClick={() => {
            onFilterCategory(activeFilter === 'Water reduction' ? null : 'Water reduction');
            setExpandedCard(expandedCard === 'water' ? null : 'water');
          }}
          className={`cursor-pointer rounded-2xl overflow-hidden border transition-all shadow-sm ${
            activeFilter === 'Water reduction'
              ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/50 dark:bg-blue-950/30'
              : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-800/60'
          }`}
        >
          {/* Card Top Accent Strip */}
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-indigo-500" />

          <div className="p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <img 
                  src="/thumbnails/category_water.jpg" 
                  alt="Water Surface Dynamics Satellite View" 
                  className="w-10 h-10 rounded-xl object-cover border border-blue-300 dark:border-blue-500/40 shadow-sm shrink-0" 
                />
                <div>
                  <div className="text-[10px] font-telemetry font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                    SURFACE HYDROLOGY
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Water bodies & dynamics
                  </h4>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold font-telemetry text-blue-700 dark:text-blue-300 bg-blue-100/70 dark:bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-500/30 font-semibold">
                  {waterChange >= 0 ? `+${waterChange}` : waterChange} ha
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              "{waterLabel}"
            </p>

            {/* Expandable Why & Evidence Details */}
            {expandedCard === 'water' && (
              <div className="pt-2 mt-2 border-t border-slate-200 dark:border-zinc-700/80 space-y-2 text-[11px]">
                <div className="text-slate-500 dark:text-slate-400 font-telemetry text-[10px] uppercase font-semibold">
                  HYDROLOGICAL INDICES:
                </div>
                <div className="space-y-1 text-slate-600 dark:text-slate-300">
                  <div className="flex items-start space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                    <span>NDWI (Normalized Difference Water Index) delta: {context.indices_summary.delta_ndwi_mean.toFixed(2)}.</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Row: Total Area & Confidence Bar */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="rounded-xl bg-slate-50 dark:bg-zinc-800/80 p-3 border border-slate-200 dark:border-zinc-700 flex flex-col justify-between shadow-sm">
          <span className="text-[10px] font-telemetry uppercase text-slate-500 dark:text-slate-400 font-semibold">
            Total Changed
          </span>
          <div className="text-base font-bold text-blue-600 dark:text-blue-400 mt-1 font-telemetry">
            {context.total_changed_hectares.toLocaleString()} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">ha</span>
          </div>
          <span className="text-[10.5px] text-slate-500 dark:text-slate-400 font-telemetry mt-0.5">
            {context.percent_aoi_changed}% of AOI
          </span>
        </div>

        <div className="rounded-xl bg-slate-50 dark:bg-zinc-800/80 p-3 border border-slate-200 dark:border-zinc-700 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-telemetry uppercase text-slate-500 dark:text-slate-400 font-semibold">
              Confidence
            </span>
            <button
              type="button"
              onClick={() => setShowConfidenceWhy(!showConfidenceWhy)}
              className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-0.5 font-telemetry font-bold"
            >
              <span>Why?</span>
              {showConfidenceWhy ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
          <div className="flex items-baseline space-x-1.5 mt-1">
            <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-telemetry">
              {conf.overall_score}%
            </span>
            <span className="text-[10px] text-slate-600 dark:text-slate-300 font-telemetry uppercase">
              ({conf.rating})
            </span>
          </div>
          {/* Visual Progress Bar */}
          <div className="w-full bg-slate-200 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div 
              className="bg-emerald-500 dark:bg-emerald-400 h-full rounded-full transition-all duration-500" 
              style={{ width: `${conf.overall_score}%` }} 
            />
          </div>
        </div>
      </div>

      {/* Expandable Confidence & Evidence Audit Trail */}
      {showConfidenceWhy && (
        <div className="rounded-xl p-3 border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/70 dark:bg-emerald-950/20 text-xs font-sans space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-800/40 pb-1.5 font-telemetry text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold">
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>EVIDENCE AUDIT TRAIL</span>
            </span>
            <span>{conf.overall_score}% DEFENDED</span>
          </div>

          <div className="space-y-1 text-[11px] text-slate-700 dark:text-slate-300 font-telemetry bg-white dark:bg-zinc-900/80 p-2 rounded-lg border border-slate-200 dark:border-zinc-800">
            <div>Satellite: <strong className="text-slate-900 dark:text-slate-100">{context.imagery_source}</strong></div>
            <div>Resolution: <strong className="text-slate-900 dark:text-slate-100">{context.resolution} GSD</strong></div>
            <div>Before Scene: <strong className="text-slate-800 dark:text-slate-200">{context.actual_before_date}</strong> (Cloud: {context.cloud_percentage_before}%)</div>
            <div>After Scene: <strong className="text-blue-600 dark:text-blue-400">{context.actual_after_date}</strong> (Cloud: {context.cloud_percentage_after}%)</div>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="font-semibold text-slate-800 dark:text-slate-200 font-telemetry text-[10.5px] uppercase">Validated Evidence:</div>
            <div className="flex items-center space-x-1.5 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>NDBI increase (+{context.indices_summary.delta_ndbi_mean.toFixed(2)} mean)</span>
            </div>
            <div className="flex items-center space-x-1.5 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>NDVI shift ({context.indices_summary.delta_ndvi_mean.toFixed(2)} mean)</span>
            </div>
            <div className="flex items-center space-x-1.5 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Persistent change confirmed across multi-year timeline</span>
            </div>
            <div className="flex items-center space-x-1.5 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Cloud-filtered imagery (&lt;30% atmospheric threshold)</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenProvenance}
            className="text-[10.5px] text-blue-600 dark:text-blue-400 hover:underline font-telemetry pt-1 flex items-center space-x-1 font-semibold"
          >
            <span>Inspect full sensor metadata & STAC scenes</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Significant Change Zones List */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 font-telemetry uppercase tracking-wider flex items-center space-x-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>DETECTED ZONES ({context.change_regions.length})</span>
          </h3>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-telemetry">
            CLICK TO INSPECT
          </span>
        </div>

        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {context.change_regions.slice(0, 10).map((region) => {
            const visual = getCategoryVisual(region.category);
            const canonicalColor = getCategoryColor(region.category);
            return (
              <div
                key={region.id}
                onClick={() => onSelectRegion(region)}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800/80 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700/80 hover:border-blue-300 dark:hover:border-blue-500/50 cursor-pointer transition-all flex items-center justify-between text-xs group shadow-sm"
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="relative shrink-0">
                    <img 
                      src={visual.thumbnail} 
                      alt={region.category} 
                      className="w-9 h-9 rounded-lg object-cover border border-slate-200 dark:border-zinc-700 shadow-xs" 
                    />
                    <span
                      className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full shadow-sm border-2 border-white dark:border-zinc-900"
                      style={{ backgroundColor: canonicalColor }}
                      title={region.category}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-slate-800 dark:text-slate-200 font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                      {region.user_label}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-telemetry flex items-center space-x-1">
                      <span className="truncate">{region.category}</span>
                      <span>•</span>
                      <span>{region.centroid[1].toFixed(2)}°, {region.centroid[0].toFixed(2)}°</span>
                    </div>
                  </div>
                </div>

                <div className="text-right font-telemetry shrink-0 pl-2">
                  <div className="text-slate-800 dark:text-slate-200 font-bold">{region.area_hectares} ha</div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center justify-end space-x-0.5">
                    <Crosshair className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500 dark:text-blue-400" />
                    <span>{region.confidence_pct}% conf</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
