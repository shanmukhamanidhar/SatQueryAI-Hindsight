import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Sliders, 
  ChevronDown, 
  ChevronUp,
  CheckCircle2,
  Calendar,
  Layers,
  MapPin,
  Sparkles,
  HelpCircle,
  Activity,
  ArrowRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { ChangeRegion, AnalysisContext } from '../lib/types';
import { getCategoryVisual } from '../lib/categoryThumbnails';
import { getCategoryConfig, calculateHotspotSeverity } from '../lib/colorSystem';

interface ChangeInspectorProps {
  region: ChangeRegion | null;
  context: AnalysisContext | null;
  onClose: () => void;
}

export const ChangeInspector: React.FC<ChangeInspectorProps> = ({
  region,
  context,
  onClose,
}) => {
  const [showTechnical, setShowTechnical] = useState(false);
  const [showWhyModal, setShowWhyModal] = useState(false);
  const [isWhyLoading, setIsWhyLoading] = useState(false);
  const [whyResponse, setWhyResponse] = useState<{
    observed: string;
    interpretation: string;
  } | null>(null);

  if (!region || !context) return null;

  const categoryVisual = getCategoryVisual(region.category);
  const categoryConfig = getCategoryConfig(region.category);
  const canonicalColor = categoryConfig.color;

  const severity = calculateHotspotSeverity(
    region.area_hectares,
    region.delta_ndvi,
    region.delta_ndbi
  );

  // Synchronized status labels
  const statusLabel = categoryConfig.key === 'urban'
    ? 'Urban expansion & built-up surface development'
    : categoryConfig.key === 'deforestation'
    ? 'Vegetation loss / Canopy clearing detected'
    : categoryConfig.key === 'vegetation'
    ? 'Vegetation growth & canopy recovery detected'
    : categoryConfig.key === 'water'
    ? 'Water surface & hydrology dynamics detected'
    : categoryConfig.key === 'bare'
    ? 'Bare ground & exposed soil detected'
    : region.user_label;

  // Handler for AI "Why did this change?" (Requirement 10)
  const handleAskWhy = () => {
    setShowWhyModal(true);
    if (!whyResponse) {
      setIsWhyLoading(true);
      setTimeout(() => {
        let obs = '';
        let interp = '';

        if (categoryConfig.key === 'urban') {
          obs = `Optical multispectral reflectance shows an increase in Normalized Difference Built-up Index (ΔNDBI: +${Math.abs(region.delta_ndbi).toFixed(3)}) across ~${region.area_hectares.toFixed(1)} hectares. Visible pixels indicate higher surface reflectance consistent with non-evaporating impervious materials.`;
          interp = `An increase in built-up surface is visible in the selected region. This may correspond to new building construction, paved road corridors, industrial expansion, or ground preparation for civil infrastructure. Remote optical sensors cannot independently verify municipal ownership or operational occupancy without local ground truth.`;
        } else if (categoryConfig.key === 'deforestation') {
          obs = `Multispectral observations show a sharp reduction in Normalized Difference Vegetation Index (ΔNDVI: ${region.delta_ndvi.toFixed(3)}) across ~${region.area_hectares.toFixed(1)} hectares of previously photosynthetically active canopy.`;
          interp = `A reduction in photosynthetic biomass is evident in the satellite pass. This may indicate planned timber clearing, agricultural field clearing, civil grading, or environmental disturbance. Satellite optical sensors cannot determine legal permitting status.`;
        } else if (categoryConfig.key === 'water') {
          obs = `Normalized Difference Water Index shifted by ΔNDWI: ${region.delta_ndwi > 0 ? '+' : ''}${region.delta_ndwi.toFixed(3)} across ~${region.area_hectares.toFixed(1)} hectares.`;
          interp = `Surface water reflectance variations are visible along the channel/reservoir boundary. This is consistent with seasonal water storage changes, barrage flow modulation, or precipitation dynamics.`;
        } else {
          obs = `Physical spectral index shifts (ΔNDVI: ${region.delta_ndvi > 0 ? '+' : ''}${region.delta_ndvi.toFixed(3)}) detected over ~${region.area_hectares.toFixed(1)} hectares.`;
          interp = `Surface vegetative vigor increased, consistent with seasonal crop growth, restorative greening, or favorable soil moisture conditions.`;
        }

        setWhyResponse({ observed: obs, interpretation: interp });
        setIsWhyLoading(false);
      }, 400);
    }
  };

  return (
    <div 
      className="absolute top-16 right-4 z-40 w-96 max-w-[calc(100vw-2rem)] max-h-[85vh] overflow-y-auto bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 border-t-4 p-4 font-sans backdrop-blur-2xl animate-in fade-in slide-in-from-right-4 duration-200 shadow-2xl text-slate-900 dark:text-slate-100 custom-scrollbar"
      style={{ 
        borderTopColor: canonicalColor,
        boxShadow: `0 20px 45px -10px ${canonicalColor}25, 0 4px 20px rgba(0,0,0,0.15)`
      }}
    >
      {/* Header: WHAT CHANGED? */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2.5 mb-3">
        <div className="flex items-center space-x-2.5">
          <div 
            className="h-8 w-8 rounded-xl flex items-center justify-center shadow-xs"
            style={{ 
              backgroundColor: `${canonicalColor}15`, 
              color: canonicalColor,
              border: `1px solid ${canonicalColor}40`
            }}
          >
            <Search className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide font-mono">
                WHAT CHANGED?
              </h3>
              <span 
                className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase"
                style={{ 
                  backgroundColor: severity.bg, 
                  color: severity.color,
                  border: `1px solid ${severity.border}`
                }}
              >
                {severity.level}
              </span>
            </div>
            <span 
              className="text-[10.5px] font-telemetry font-bold flex items-center gap-1.5 mt-0.5"
              style={{ color: canonicalColor }}
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: canonicalColor }} />
              {categoryConfig.name}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
          title="Close Investigation Panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Primary Investigation Metrics */}
      <div className="space-y-2.5 mb-3 text-xs">
        {/* Location & Period Card */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-zinc-400 font-mono text-[10.5px]">LOCATION:</span>
            <strong className="text-slate-900 dark:text-white font-bold flex items-center space-x-1">
              <MapPin className="w-3 h-3 text-blue-600" />
              <span>{context.location.name}</span>
            </strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-zinc-400 font-mono text-[10.5px]">PERIOD:</span>
            <strong className="text-blue-600 dark:text-blue-400 font-mono text-[11px]">
              {context.actual_before_date} ➔ {context.actual_after_date}
            </strong>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-zinc-700">
            <span className="text-slate-500 dark:text-zinc-400 font-mono text-[10.5px]">AFFECTED AREA:</span>
            <strong className="text-sm font-bold font-mono" style={{ color: canonicalColor }}>
              ~{region.area_hectares.toFixed(1)} hectares
            </strong>
          </div>
        </div>

        {/* Status & Thumbnail Observation Card */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 flex items-center space-x-3">
          <div className="relative shrink-0">
            <img 
              src={categoryVisual.thumbnail} 
              alt={categoryVisual.name}
              className="w-12 h-12 rounded-xl object-cover border-2 shadow-xs"
              style={{ borderColor: canonicalColor }}
            />
            <span 
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full border border-white dark:border-zinc-900"
              style={{ backgroundColor: canonicalColor }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
              {statusLabel}
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-snug line-clamp-2">
              {region.simple_explanation}
            </p>
          </div>
        </div>

        {/* Visual Evidence Strip (Before → After → Difference) */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 space-y-2">
          <div className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider">
            VISUAL SATELLITE EVIDENCE (BEFORE → AFTER)
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700 bg-black aspect-video">
              <img 
                src={context.visual_layers.before_rgb} 
                alt="Before Satellite Pass"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-white font-mono text-[9px] font-bold">
                {context.actual_before_date}
              </span>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700 bg-black aspect-video">
              <img 
                src={context.visual_layers.after_rgb} 
                alt="After Satellite Pass"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-blue-600/90 text-white font-mono text-[9px] font-bold">
                {context.actual_after_date}
              </span>
            </div>
          </div>
        </div>

        {/* AI "Why Did This Change?" Feature Button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={handleAskWhy}
            className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-zinc-800 dark:to-zinc-800 hover:from-blue-100 dark:hover:from-zinc-750 border border-blue-200 dark:border-zinc-700 text-blue-700 dark:text-blue-300 text-xs font-mono font-bold flex items-center justify-center space-x-2 transition-all shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>AI INVESTIGATION: WHY DID THIS CHANGE?</span>
          </button>
        </div>

        {/* AI "Why Did This Change?" Response Card */}
        {showWhyModal && (
          <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-zinc-800/90 border border-blue-300 dark:border-blue-700 space-y-2.5 animate-in fade-in duration-200 text-xs">
            <div className="flex items-center justify-between border-b border-blue-200/80 dark:border-zinc-700 pb-1.5">
              <span className="text-[10px] font-mono font-bold uppercase text-blue-700 dark:text-blue-300 flex items-center space-x-1">
                <Sparkles className="w-3 h-3" />
                <span>EVIDENCE VS INTERPRETATION</span>
              </span>
              <button
                type="button"
                onClick={() => setShowWhyModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            {isWhyLoading ? (
              <div className="flex items-center justify-center py-4 space-x-2 text-slate-500 font-mono text-xs">
                <Activity className="w-4 h-4 animate-spin text-blue-600" />
                <span>Evaluating spectral signatures...</span>
              </div>
            ) : (
              whyResponse && (
                <div className="space-y-2 text-[11px] leading-relaxed">
                  <div className="p-2 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-blue-100 dark:border-zinc-750">
                    <strong className="text-slate-900 dark:text-white font-mono block text-[10px] uppercase text-blue-700 dark:text-blue-400 mb-0.5">
                      OBSERVED (FACTS):
                    </strong>
                    <p className="text-slate-700 dark:text-slate-300">{whyResponse.observed}</p>
                  </div>

                  <div className="p-2 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-blue-100 dark:border-zinc-750">
                    <strong className="text-slate-900 dark:text-white font-mono block text-[10px] uppercase text-amber-700 dark:text-amber-400 mb-0.5">
                      POSSIBLE INTERPRETATION (HYPOTHESIS):
                    </strong>
                    <p className="text-slate-700 dark:text-slate-300">{whyResponse.interpretation}</p>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Technical Evidence Drawer (Expert Mode) */}
      <div className="border-t border-slate-100 dark:border-zinc-800 pt-2.5">
        <button
          type="button"
          onClick={() => setShowTechnical(!showTechnical)}
          className="w-full flex items-center justify-between text-xs font-telemetry text-blue-600 dark:text-blue-400 hover:underline py-1 font-bold"
        >
          <span className="flex items-center space-x-1.5">
            <Sliders className="w-3.5 h-3.5" />
            <span>{showTechnical ? 'Hide Technical Evidence' : 'Technical Details & Indices'}</span>
          </span>
          {showTechnical ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showTechnical && (
          <div className="mt-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 font-telemetry text-[11px] text-slate-700 dark:text-slate-300 space-y-2.5">
            <p className="leading-relaxed text-slate-700 dark:text-slate-300 font-sans">{region.technical_evidence}</p>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-zinc-750 text-[10.5px]">
              <div className="p-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-750">
                <span className="text-slate-500 block text-[9px]">Δ NDVI (Veg)</span>
                <span className={`font-bold ${region.delta_ndvi >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {region.delta_ndvi >= 0 ? `+${region.delta_ndvi}` : region.delta_ndvi}
                </span>
              </div>
              <div className="p-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-750">
                <span className="text-slate-500 block text-[9px]">Δ NDBI (Urban)</span>
                <span className={`font-bold ${region.delta_ndbi >= 0 ? 'text-orange-600 dark:text-orange-400' : 'text-slate-500'}`}>
                  {region.delta_ndbi >= 0 ? `+${region.delta_ndbi}` : region.delta_ndbi}
                </span>
              </div>
              <div className="p-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-750">
                <span className="text-slate-500 block text-[9px]">Δ NDWI (Water)</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {region.delta_ndwi >= 0 ? `+${region.delta_ndwi}` : region.delta_ndwi}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-zinc-750 flex flex-col space-y-1 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              <div>📍 Centroid: {region.centroid[1].toFixed(4)}°N, {region.centroid[0].toFixed(4)}°E</div>
              <div>🎯 Detection Confidence: <strong className="text-emerald-600 dark:text-emerald-400">{region.confidence_pct}%</strong></div>
              <div>⚖️ Severity Criteria: {severity.criteria}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
