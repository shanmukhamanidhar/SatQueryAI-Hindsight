import React, { useState } from 'react';
import { 
  Trees, 
  Droplets, 
  Building2, 
  Wheat, 
  ArrowRight, 
  TrendingUp, 
  Sparkles,
  Layers,
  Flame,
  Radio,
  X,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  MapPin
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { AnalysisContext, ChangeRegion } from '../lib/types';

interface EnvironmentalExplorationProps {
  context?: AnalysisContext | null;
  onSelectCategory: (categoryQuery: string, filterName?: string) => void;
  onSelectRegion?: (region: ChangeRegion) => void;
  onScrollToMap?: () => void;
}

export const EnvironmentalExploration: React.FC<EnvironmentalExplorationProps> = ({ 
  context,
  onSelectCategory,
  onSelectRegion,
  onScrollToMap
}) => {
  const { t } = useLanguage();
  const [inspectingCategory, setInspectingCategory] = useState<any | null>(null);

  // Extract empirical metrics from active context if available
  const ind = context?.indices_summary;
  const stats = context?.land_cover_stats || [];
  const regions = context?.change_regions || [];

  const getStatHa = (catKey: string): number => {
    const found = stats.find(s => s.category.toLowerCase().includes(catKey.toLowerCase()));
    return found ? Math.round(found.after_ha) : 0;
  };

  const getHotspotsForCat = (catId: string): ChangeRegion[] => {
    if (!regions.length) return [];
    if (catId === 'vegetation') {
      return regions.filter(r => {
        const cat = r.category.toLowerCase();
        const lbl = r.user_label.toLowerCase();
        // Match vegetation growth / gain / canopy / forest (exclude deforestation loss)
        return (
          cat.includes('gain') ||
          lbl.includes('growth') ||
          lbl.includes('regrowth') ||
          cat.includes('regrowth') ||
          (cat.includes('veg') && !cat.includes('loss') && !cat.includes('deforest')) ||
          (lbl.includes('veg') && !lbl.includes('loss') && !lbl.includes('deforest')) ||
          r.delta_ndvi > 0.05
        );
      });
    }
    if (catId === 'water') {
      return regions.filter(r => 
        r.category.toLowerCase().includes('water') || 
        r.user_label.toLowerCase().includes('water') ||
        r.category.toLowerCase().includes('hydro')
      );
    }
    if (catId === 'urban') {
      return regions.filter(r => 
        r.category.toLowerCase().includes('urban') || 
        r.user_label.toLowerCase().includes('urban') ||
        r.user_label.toLowerCase().includes('built') ||
        r.category.toLowerCase().includes('built')
      );
    }
    if (catId === 'agriculture') {
      return regions.filter(r => 
        r.category.toLowerCase().includes('agri') || 
        r.category.toLowerCase().includes('crop') ||
        r.user_label.toLowerCase().includes('crop') ||
        r.category.toLowerCase().includes('bare') ||
        r.category.toLowerCase().includes('soil')
      );
    }
    return [];
  };

  const categories = [
    {
      id: 'vegetation',
      label: 'FORESTS & BIOMASS',
      title: t('env.vegTitle'),
      subtitle: t('env.vegSub'),
      metricLabel: 'NDVI Delta',
      metricValue: ind ? (ind.delta_ndvi_mean >= 0 ? `+${ind.delta_ndvi_mean.toFixed(3)}` : ind.delta_ndvi_mean.toFixed(3)) : 'NDVI Spectral Shift',
      monitoredHa: getStatHa('veg') || (context ? Math.round(context.total_aoi_hectares * 0.35) : 0),
      hotspotCount: getHotspotsForCat('vegetation').length,
      thumbnail: '/thumbnails/category_vegetation.jpg',
      sensorTag: 'Copernicus Sentinel-2 • 10m',
      query: 'Vegetation growth and canopy health',
      filter: 'vegetation',
      colorClass: 'text-emerald-600 dark:text-emerald-400',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50',
      borderClass: 'border-slate-200 hover:border-emerald-400 dark:border-zinc-800 dark:hover:border-emerald-500/60',
      bgClass: 'bg-white hover:bg-emerald-50/20 dark:bg-zinc-900/80 dark:hover:bg-zinc-850',
    },
    {
      id: 'water',
      label: 'HYDROLOGY & WATER SECURITY',
      title: t('env.waterTitle'),
      subtitle: t('env.waterSub'),
      metricLabel: 'NDWI Delta',
      metricValue: ind ? (ind.delta_ndwi_mean >= 0 ? `+${ind.delta_ndwi_mean.toFixed(3)}` : ind.delta_ndwi_mean.toFixed(3)) : 'NDWI Moisture Delta',
      monitoredHa: getStatHa('water') || (context ? Math.round(context.total_aoi_hectares * 0.12) : 0),
      hotspotCount: getHotspotsForCat('water').length,
      thumbnail: '/thumbnails/category_water.jpg',
      sensorTag: 'Copernicus Sentinel-2 • 10m',
      query: 'Water reduction and reservoir changes',
      filter: 'Water reduction',
      colorClass: 'text-blue-600 dark:text-blue-400',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50',
      borderClass: 'border-slate-200 hover:border-blue-400 dark:border-zinc-800 dark:hover:border-blue-500/60',
      bgClass: 'bg-white hover:bg-blue-50/20 dark:bg-zinc-900/80 dark:hover:bg-zinc-850',
    },
    {
      id: 'urban',
      label: 'BUILT ENVIRONMENT',
      title: t('env.urbanTitle'),
      subtitle: t('env.urbanSub'),
      metricLabel: 'NDBI Impervious',
      metricValue: ind ? (ind.delta_ndbi_mean >= 0 ? `+${ind.delta_ndbi_mean.toFixed(3)}` : ind.delta_ndbi_mean.toFixed(3)) : 'NDBI Impervious Index',
      monitoredHa: getStatHa('urban') || (context ? Math.round(context.total_aoi_hectares * 0.28) : 0),
      hotspotCount: getHotspotsForCat('urban').length,
      thumbnail: '/thumbnails/category_urban.jpg',
      sensorTag: 'Copernicus Sentinel-2 • 10m',
      query: 'Urban growth and infrastructure expansion',
      filter: 'Urban development',
      colorClass: 'text-orange-600 dark:text-orange-400',
      badgeClass: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-900/50',
      borderClass: 'border-slate-200 hover:border-orange-400 dark:border-zinc-800 dark:hover:border-orange-500/60',
      bgClass: 'bg-white hover:bg-orange-50/20 dark:bg-zinc-900/80 dark:hover:bg-zinc-850',
    },
    {
      id: 'agriculture',
      label: 'CROPLAND MONITORING',
      title: t('env.agriTitle'),
      subtitle: t('env.agriSub'),
      metricLabel: 'Reflectance Index',
      metricValue: context ? 'Surface Albedo' : 'Multi-Band Reflectance',
      monitoredHa: getStatHa('agri') || (context ? Math.round(context.total_aoi_hectares * 0.25) : 0),
      hotspotCount: getHotspotsForCat('agriculture').length,
      thumbnail: '/thumbnails/category_agriculture.jpg',
      sensorTag: 'Copernicus Sentinel-2 • 10m',
      query: 'Agricultural crop transitions and cultivated land',
      filter: 'agriculture',
      colorClass: 'text-amber-600 dark:text-amber-400',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50',
      borderClass: 'border-slate-200 hover:border-amber-400 dark:border-zinc-800 dark:hover:border-amber-500/60',
      bgClass: 'bg-white hover:bg-amber-50/20 dark:bg-zinc-900/80 dark:hover:bg-zinc-850',
    },
  ];

  const handleCategoryClick = (c: typeof categories[0], e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setInspectingCategory(c);
    onSelectCategory(c.query, c.filter);
    
    // Automatically pre-select the top matching hotspot for this category within current location
    if (onSelectRegion) {
      const catHotspots = getHotspotsForCat(c.id);
      if (catHotspots.length > 0) {
        onSelectRegion(catHotspots[0]);
      }
    }
  };

  return (
    <section id="environmental-section" className="scroll-mt-20 py-20 bg-slate-50 dark:bg-[#09090b] border-b border-slate-200 dark:border-zinc-800 relative transition-colors">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('env.badge')}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('env.title')}
            </h2>
            <p className="text-sm text-slate-600 dark:text-zinc-400 mt-2 max-w-xl">
              {t('env.subtitle')}
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono text-slate-500 dark:text-zinc-400">
            {context ? (
              <span className="flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Active Target: {context.location.name}</span>
              </span>
            ) : (
              <span>Filter directly into the satellite analytics engine</span>
            )}
          </div>
        </div>

        {/* 4-Pillar Multispectral Cards: Responsive 1-col mobile, 2-col tablet, 4-col desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((c) => {
            return (
              <div
                key={c.id}
                onClick={(e) => handleCategoryClick(c, e)}
                className={`group cursor-pointer rounded-2xl p-5 border ${c.borderClass} ${c.bgClass} transition-all duration-200 hover:-translate-y-1 shadow-sm hover:shadow-xl flex flex-col justify-between`}
              >
                <div>
                  {/* Visual Satellite Thumbnail Header Strip */}
                  <div className="relative h-36 w-full rounded-xl overflow-hidden mb-4 border border-slate-200/90 dark:border-zinc-700/80 shadow-inner bg-slate-950">
                    <img 
                      src={c.thumbnail} 
                      alt={c.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-95 group-hover:brightness-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent pointer-events-none" />
                    
                    <div className="absolute top-2.5 left-2.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border backdrop-blur-md shadow-sm ${c.badgeClass}`}>
                        {c.label}
                      </span>
                    </div>

                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[10px] font-telemetry text-white/90">
                      <span className="bg-slate-950/70 px-2 py-0.5 rounded backdrop-blur-md border border-white/10 font-mono">
                        {c.sensorTag}
                      </span>
                      <span className="bg-slate-950/70 px-2 py-0.5 rounded backdrop-blur-md border border-white/10 font-mono text-emerald-400 font-bold">
                        10m RGB
                      </span>
                    </div>
                  </div>

                  <h3 className={`text-lg font-bold text-slate-900 dark:text-white mb-2 font-sans group-hover:${c.colorClass} transition-colors line-clamp-1`}>
                    {c.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed font-sans line-clamp-3 mb-4">
                    {c.subtitle}
                  </p>

                  {/* Empirical Telemetry Bar if context active */}
                  {context && (
                    <div className="grid grid-cols-2 gap-2 mb-4 p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-700/50 text-[10px] font-mono">
                      <div>
                        <span className="text-slate-500 dark:text-zinc-400 block text-[9px] uppercase tracking-wider">
                          {t('env.monitoredArea')}
                        </span>
                        <strong className="text-slate-900 dark:text-white text-xs font-bold">
                          {c.monitoredHa ? `${c.monitoredHa} ha` : '—'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-zinc-400 block text-[9px] uppercase tracking-wider">
                          {t('env.activeHotspots')}
                        </span>
                        <strong className={`${c.colorClass} text-xs font-bold`}>
                          {c.hotspotCount} zones
                        </strong>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-[11px] font-mono text-slate-600 dark:text-zinc-300">
                    <TrendingUp className={`w-3.5 h-3.5 ${c.colorClass}`} />
                    <span className="font-semibold">{c.metricValue}</span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleCategoryClick(c, e)}
                    className="flex items-center space-x-1 text-xs font-semibold text-slate-700 dark:text-zinc-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-pointer"
                  >
                    <span>{t('env.analyzeBtn')}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* In-Place Category Spectral Analysis Modal (Zero Auto-Scroll) */}
      {inspectingCategory && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setInspectingCategory(null)}
        >
          <div 
            className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-slate-100 font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-slate-50/80 dark:bg-zinc-950/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {inspectingCategory.title}
                    </h3>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${inspectingCategory.badgeClass}`}>
                      {inspectingCategory.label}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-zinc-400">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {context ? `${context.location.name} (${context.location.country})` : 'Target Location'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setInspectingCategory(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar text-sm">
              {/* Spectral Telemetry Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700">
                  <div className="text-[10px] font-mono uppercase text-slate-500 dark:text-zinc-400">
                    {inspectingCategory.metricLabel}
                  </div>
                  <div className={`text-lg font-bold font-mono mt-1 ${inspectingCategory.colorClass}`}>
                    {inspectingCategory.metricValue}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700">
                  <div className="text-[10px] font-mono uppercase text-slate-500 dark:text-zinc-400">
                    MONITORED EXTENT
                  </div>
                  <div className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-1">
                    {inspectingCategory.monitoredHa ? `${inspectingCategory.monitoredHa.toLocaleString()} ha` : '—'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 col-span-2 sm:col-span-1">
                  <div className="text-[10px] font-mono uppercase text-slate-500 dark:text-zinc-400">
                    ANOMALY HOTSPOTS
                  </div>
                  <div className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-1">
                    {inspectingCategory.hotspotCount} zones
                  </div>
                </div>
              </div>

              {/* Scientific Interpretation */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 space-y-2">
                <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-700 dark:text-zinc-300">
                  Multispectral Analysis &amp; Observation
                </h4>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  {inspectingCategory.subtitle}
                </p>
                <div className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 pt-1">
                  Observation Pass: <strong className="text-slate-800 dark:text-slate-200">{context?.actual_before_date || '2021'} ➔ {context?.actual_after_date || '2026'}</strong> · 10m GSD Sentinel-2 MSI
                </div>
              </div>

              {/* Anomaly Zones for this Category in current location */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-700 dark:text-zinc-300">
                    Identified Hotspot Clusters ({getHotspotsForCat(inspectingCategory.id).length})
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">
                    Strictly for {context?.location.name || 'this location'}
                  </span>
                </div>

                {getHotspotsForCat(inspectingCategory.id).length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {getHotspotsForCat(inspectingCategory.id).map((spot, idx) => (
                      <div 
                        key={spot.id || idx}
                        onClick={() => {
                          if (onSelectRegion) onSelectRegion(spot);
                        }}
                        className="p-3 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:border-blue-400 flex items-center justify-between text-xs transition-all cursor-pointer shadow-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">
                            {spot.user_label}
                          </div>
                          <div className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 mt-0.5">
                            Area: {spot.area_hectares.toFixed(1)} ha · ΔNDVI: {spot.delta_ndvi > 0 ? '+' : ''}{spot.delta_ndvi.toFixed(3)}
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          {spot.confidence_pct}% Conf
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-dashed border-slate-200 dark:border-zinc-700 text-center text-xs text-slate-500 font-mono">
                    No significant anomaly clusters detected in this specific category for {context?.location.name || 'this location'}.
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer with optional intentional scroll to map */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/80 dark:bg-zinc-950/50">
              <button
                type="button"
                onClick={() => setInspectingCategory(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
              >
                Close View
              </button>

              {onScrollToMap && (
                <button
                  type="button"
                  onClick={() => {
                    setInspectingCategory(null);
                    onScrollToMap();
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-mono font-bold transition-all shadow-md flex items-center space-x-1.5 cursor-pointer"
                >
                  <span>View Filtered on Map</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
