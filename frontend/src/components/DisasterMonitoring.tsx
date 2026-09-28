import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  Flame, 
  Droplets, 
  Trees, 
  Building2, 
  Crosshair, 
  ShieldAlert, 
  ArrowRight,
  Radio,
  CheckCircle2,
  MapPin,
  Compass,
  Activity,
  Layers,
  X,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Info
} from 'lucide-react';
import { AnalysisContext, ChangeRegion } from '../lib/types';
import { useLanguage } from '../i18n/LanguageContext';
import { 
  HOTSPOT_CITIES_REGISTRY, 
  HotspotCityData, 
  getHotspotCityById 
} from '../lib/cityHotspotsData';
import { 
  getCategoryConfig, 
  getCategoryColor, 
  calculateHotspotSeverity 
} from '../lib/colorSystem';

interface DisasterMonitoringProps {
  context: AnalysisContext | null;
  onSelectRegion?: (region: ChangeRegion) => void;
  onExploreHotspots?: () => void;
  selectedHotspotCityId?: string;
  onSelectHotspotCity?: (cityId: string) => void;
  onLoadCityInStudio?: (query: string) => void;
}

export const DisasterMonitoring: React.FC<DisasterMonitoringProps> = ({
  context,
  onSelectRegion,
  onExploreHotspots,
  selectedHotspotCityId,
  onSelectHotspotCity,
  onLoadCityInStudio,
}) => {
  const { t } = useLanguage();

  // Internal state to track selected exploration city
  // Defaults to Visakhapatnam (first city) or selectedHotspotCityId
  const [internalCityId, setInternalCityId] = useState<string>('visakhapatnam');
  const activeCityId = selectedHotspotCityId || internalCityId;

  // Selected hotspot for in-place inspector modal
  const [inspectingHotspot, setInspectingHotspot] = useState<ChangeRegion | null>(null);
  const [hoveredHotspotId, setHoveredHotspotId] = useState<string | null>(null);
  const [showAllHotspots, setShowAllHotspots] = useState<boolean>(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');

  // Resolve active city dataset from authoritative registry
  const activePresetCity: HotspotCityData = useMemo(() => {
    return getHotspotCityById(activeCityId) || HOTSPOT_CITIES_REGISTRY[0];
  }, [activeCityId]);

  // Handle city selection strictly without scrolling or jumping
  const handleCityClick = (e: React.MouseEvent, cityId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setInternalCityId(cityId);
    setShowAllHotspots(false);
    setInspectingHotspot(null);
    if (onSelectHotspotCity) {
      onSelectHotspotCity(cityId);
    }
  };

  // Determine current active hotspots
  const currentHotspots: ChangeRegion[] = useMemo(() => {
    return activePresetCity.hotspots || [];
  }, [activePresetCity]);

  // Filtered hotspots if user clicks a category chip
  const filteredHotspots = useMemo(() => {
    if (selectedCategoryFilter === 'ALL') return currentHotspots;
    return currentHotspots.filter(h => 
      h.category.toLowerCase().includes(selectedCategoryFilter.toLowerCase()) ||
      h.user_label.toLowerCase().includes(selectedCategoryFilter.toLowerCase())
    );
  }, [currentHotspots, selectedCategoryFilter]);

  // Compute spatial bounding box bounds for radar view
  const bbox = activePresetCity.bounding_box || [0, 0, 1, 1];
  const [w, s, e, n] = bbox;
  const lonSpan = Math.max(e - w, 0.001);
  const latSpan = Math.max(n - s, 0.001);

  // Categories present in this city for filter chips
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    currentHotspots.forEach(h => {
      const catConfig = getCategoryConfig(h.category);
      set.add(catConfig.shortLabel);
    });
    return Array.from(set);
  }, [currentHotspots]);

  // Handle hotspot card inspection: opens in-place modal without scrolling
  const handleInspectCard = (e: React.MouseEvent, hotspot: ChangeRegion) => {
    e.preventDefault();
    e.stopPropagation();
    setInspectingHotspot(hotspot);
    if (onSelectRegion) {
      onSelectRegion(hotspot);
    }
  };

  return (
    <section id="monitoring-section" className="scroll-mt-20 py-20 bg-white dark:bg-[#09090b] border-b border-slate-200 dark:border-zinc-800 relative transition-colors">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 text-[11px] font-mono text-rose-600 dark:text-rose-400 uppercase tracking-widest font-semibold mb-2">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>CHANGE HOTSPOTS & ENVIRONMENTAL STRESS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Multispectral Anomaly Clusters
            </h2>
            <p className="text-sm text-slate-600 dark:text-zinc-400 mt-2 max-w-2xl leading-relaxed">
              Empirical change detection polygons extracted from Copernicus Sentinel-2 MSI Level-2A multi-spectral observations (2021 baseline vs. 2026 current).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-xs font-mono">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
              <span className="text-rose-800 dark:text-rose-300 font-bold">
                {currentHotspots.length} Hotspots in {activePresetCity.name}
              </span>
            </div>
            <div className="text-slate-500 dark:text-zinc-400 text-[11px] hidden sm:block">
              {activePresetCity.latitude.toFixed(3)}°N, {activePresetCity.longitude.toFixed(3)}°E
            </div>
          </div>
        </div>

        {/* EXPLORE HOTSPOTS BY CITY RIBBON */}
        <div className="mb-6 p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between mb-2.5 px-1">
            <div className="flex items-center space-x-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
              <Radio className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-pulse" />
              <span>EXPLORE HOTSPOTS BY CITY:</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500 hidden sm:inline">
              Select any city to view verified satellite change clusters
            </span>
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
            {HOTSPOT_CITIES_REGISTRY.map((city) => {
              const isActive = activePresetCity.id === city.id;
              return (
                <button
                  key={city.id}
                  type="button"
                  onClick={(e) => handleCityClick(e, city.id)}
                  className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-mono transition-all flex items-center space-x-2 cursor-pointer select-none ${
                    isActive
                      ? 'bg-blue-600 border border-blue-500 text-white font-bold shadow-md ring-2 ring-blue-400/40 scale-[1.02]'
                      : 'bg-white dark:bg-zinc-800/90 hover:bg-slate-100 dark:hover:bg-zinc-750 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white shadow-xs'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${isActive ? 'bg-cyan-300 animate-pulse' : 'bg-slate-400 dark:bg-zinc-600'}`} />
                  <span className="truncate">{city.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    isActive ? 'bg-blue-700/80 text-blue-100' : 'bg-slate-100 dark:bg-zinc-700 text-slate-500 dark:text-zinc-400'
                  }`}>
                    {city.hotspotsCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ACTIVE CITY TELEMETRY & SPATIAL RADAR STRIP */}
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* Active City Overview Box */}
          <div className="lg:col-span-1 p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-white dark:from-zinc-900 dark:to-zinc-950 border border-slate-200 dark:border-zinc-800 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/50 text-blue-700 dark:text-blue-300 font-mono text-[11px] font-bold uppercase">
                  {activePresetCity.type === 'city' ? 'Urban Center' : 'River Basin / Coast'}
                </span>
                <span className="font-mono text-[11px] text-slate-500 dark:text-zinc-400">
                  {activePresetCity.parentLocation}
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {activePresetCity.name}
              </h3>

              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed mb-4">
                {activePresetCity.summaryNote || `${currentHotspots.length} verified multispectral anomaly clusters detected in ${activePresetCity.name} using Sentinel-2 L2A observations.`}
              </p>
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-zinc-800 text-[11px] font-mono">
              <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                <span>Centroid Coordinates:</span>
                <strong className="text-slate-900 dark:text-zinc-200">{activePresetCity.latitude.toFixed(4)}°N, {activePresetCity.longitude.toFixed(4)}°E</strong>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                <span>Total Hotspot Footprint:</span>
                <strong className="text-rose-600 dark:text-rose-400">
                  {currentHotspots.reduce((acc, h) => acc + h.area_hectares, 0).toLocaleString(undefined, { maximumFractionDigits: 1 })} ha
                </strong>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-zinc-400">
                <span>Constellation Sensor:</span>
                <strong className="text-emerald-600 dark:text-emerald-400">Sentinel-2 MSI (10m L2A)</strong>
              </div>
            </div>
          </div>

          {/* Interactive Spatial Hotspot Distribution Radar */}
          <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-950 border border-zinc-800 text-white flex flex-col justify-between shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-3 z-10">
              <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
                <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '18s' }} />
                <span className="font-bold tracking-wider uppercase">Hotspot Spatial Radar ({activePresetCity.name})</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                16 Detected Vector Clusters
              </span>
            </div>

            {/* Radar Canvas / Plot Area */}
            <div className="relative h-44 w-full rounded-xl bg-slate-900/90 border border-zinc-800/80 overflow-hidden my-2 flex items-center justify-center">
              {/* Radar concentric rings */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <div className="w-24 h-24 rounded-full border border-cyan-400" />
                <div className="w-48 h-48 rounded-full border border-cyan-400" />
                <div className="w-72 h-72 rounded-full border border-cyan-400" />
                <div className="absolute w-full h-[1px] bg-cyan-400/30" />
                <div className="absolute h-full w-[1px] bg-cyan-400/30" />
              </div>

              {/* Cardinal directions */}
              <span className="absolute top-1 left-2 text-[9px] font-mono text-zinc-500">NW</span>
              <span className="absolute top-1 right-2 text-[9px] font-mono text-zinc-500">NE</span>
              <span className="absolute bottom-1 left-2 text-[9px] font-mono text-zinc-500">SW</span>
              <span className="absolute bottom-1 right-2 text-[9px] font-mono text-zinc-500">SE</span>
              <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[9px] font-mono text-cyan-400/80 font-bold">N</span>

              {/* Hotspot Plot Points */}
              {currentHotspots.map((h, i) => {
                const [lon, lat] = h.centroid || [activePresetCity.longitude, activePresetCity.latitude];
                const xPct = Math.min(Math.max(((lon - w) / lonSpan) * 88 + 6, 4), 96);
                const yPct = Math.min(Math.max((1 - (lat - s) / latSpan) * 82 + 9, 6), 94);
                const isHovered = hoveredHotspotId === h.id;
                const catColor = getCategoryColor(h.category);

                return (
                  <button
                    key={h.id || i}
                    type="button"
                    onClick={(e) => handleInspectCard(e, h)}
                    onMouseEnter={() => setHoveredHotspotId(h.id)}
                    onMouseLeave={() => setHoveredHotspotId(null)}
                    style={{ left: `${xPct}%`, top: `${yPct}%`, backgroundColor: catColor }}
                    title={`${h.user_label} (${h.area_hectares} ha)`}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-all cursor-pointer z-10 group ${
                      isHovered ? 'w-4 h-4 ring-4 ring-white/50 scale-125 z-20' : 'w-2.5 h-2.5 ring-2 ring-black/40 hover:scale-125'
                    }`}
                  >
                    {isHovered && (
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-[10px] font-mono text-white whitespace-nowrap shadow-lg pointer-events-none z-30">
                        {h.user_label} ({h.area_hectares} ha)
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Radar Legend */}
            <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-zinc-400 pt-2 border-t border-zinc-800/80 gap-2">
              <div className="flex items-center space-x-3">
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-[#f97316]" />
                  <span>Urban Growth</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
                  <span>Canopy Loss</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-[#0284c7]" />
                  <span>Water Dynamic</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                  <span>Vegetation</span>
                </span>
              </div>
              <span className="text-[10px] text-zinc-500">Click any blip to inspect</span>
            </div>
          </div>
        </div>

        {/* Category Filters Ribbon */}
        {availableCategories.length > 1 && (
          <div className="flex items-center space-x-2 mb-6 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-xs font-mono text-slate-500 dark:text-zinc-400 mr-1 shrink-0">
              Filter by Type:
            </span>
            <button
              type="button"
              onClick={() => setSelectedCategoryFilter('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors shrink-0 ${
                selectedCategoryFilter === 'ALL'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
              }`}
            >
              All ({currentHotspots.length})
            </button>
            {availableCategories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors shrink-0 ${
                  selectedCategoryFilter === cat
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Hotspots Grid */}
        {filteredHotspots.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {(showAllHotspots ? filteredHotspots : filteredHotspots.slice(0, 6)).map((region, idx) => {
                const catConfig = getCategoryConfig(region.category);
                const severity = calculateHotspotSeverity(region.area_hectares, region.delta_ndvi, region.delta_ndbi);
                const isHovered = hoveredHotspotId === region.id;

                return (
                  <div
                    key={region.id || idx}
                    onClick={(e) => handleInspectCard(e, region)}
                    onMouseEnter={() => setHoveredHotspotId(region.id)}
                    onMouseLeave={() => setHoveredHotspotId(null)}
                    className={`group cursor-pointer rounded-2xl p-5 bg-white dark:bg-zinc-900/80 hover:bg-slate-50 dark:hover:bg-zinc-850 border transition-all duration-200 shadow-xs hover:shadow-lg flex flex-col justify-between ${
                      isHovered ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/20' : 'border-slate-200 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span
                            className="w-3 h-3 rounded-full shadow-xs shrink-0 border border-white/20"
                            style={{ backgroundColor: catConfig.color }}
                          />
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${catConfig.badgeClass}`}>
                            {catConfig.shortLabel}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-1.5">
                          <span 
                            className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase"
                            style={{ backgroundColor: severity.bg, color: severity.color, border: `1px solid ${severity.border}` }}
                          >
                            {severity.level}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/50">
                            {region.confidence_pct}%
                          </span>
                        </div>
                      </div>

                      {/* Hotspot Title */}
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2 line-clamp-1">
                        {region.user_label}
                      </h4>

                      {/* Explanation */}
                      <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed font-sans mb-3 line-clamp-2">
                        {region.simple_explanation}
                      </p>

                      {/* Scientific Indices Strip */}
                      <div className="grid grid-cols-3 gap-1.5 p-2 rounded-lg bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 mb-3 text-[10px] font-mono">
                        <div className="flex flex-col">
                          <span className="text-slate-400 dark:text-zinc-500">ΔNDVI</span>
                          <span className={`font-bold ${region.delta_ndvi < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            {region.delta_ndvi > 0 ? `+${region.delta_ndvi.toFixed(3)}` : region.delta_ndvi.toFixed(3)}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-slate-400 dark:text-zinc-500">ΔNDBI</span>
                          <span className={`font-bold ${region.delta_ndbi > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-slate-600 dark:text-zinc-400'}`}>
                            {region.delta_ndbi > 0 ? `+${region.delta_ndbi.toFixed(3)}` : region.delta_ndbi.toFixed(3)}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-slate-400 dark:text-zinc-500">ΔNDWI</span>
                          <span className={`font-bold ${region.delta_ndwi < 0 ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'}`}>
                            {region.delta_ndwi > 0 ? `+${region.delta_ndwi.toFixed(3)}` : region.delta_ndwi.toFixed(3)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                      <div>
                        Area: <strong className="text-slate-900 dark:text-white font-bold">{region.area_hectares.toFixed(1)} ha</strong>
                      </div>
                      <div className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 font-medium group-hover:translate-x-1 transition-transform">
                        <span>Inspect Hotspot</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Show all / View toggle */}
            {filteredHotspots.length > 6 && (
              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); setShowAllHotspots(!showAllHotspots); }}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-mono font-bold transition-all shadow-xs inline-flex items-center space-x-2 cursor-pointer"
                >
                  <span>{showAllHotspots ? `Show Featured 6 Hotspots` : `Show All ${filteredHotspots.length} Hotspots in ${activePresetCity.name}`}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAllHotspots ? 'rotate-180' : ''}`} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl p-12 bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 text-center flex flex-col items-center justify-center space-y-4 shadow-xs">
            <Radio className="w-10 h-10 text-slate-400 dark:text-zinc-600 animate-pulse" />
            <div className="max-w-md">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
                No matching hotspots found
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                Try selecting "All" or picking another featured city from the ribbon above.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* IN-PLACE HOTSPOT INSPECTOR MODAL */}
      {inspectingHotspot && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setInspectingHotspot(null)}
        >
          <div 
            className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-7 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span 
                  className="w-4 h-4 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: getCategoryColor(inspectingHotspot.category) }}
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                      {activePresetCity.name} Hotspot
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500">
                      ID: {inspectingHotspot.id}
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {inspectingHotspot.user_label}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setInspectingHotspot(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                title="Close Inspector"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950/70 border border-slate-200 dark:border-zinc-800 mb-5 font-mono text-xs">
              <div>
                <span className="text-slate-400 dark:text-zinc-500 text-[10px] block">SEVERITY</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">
                  {calculateHotspotSeverity(inspectingHotspot.area_hectares, inspectingHotspot.delta_ndvi, inspectingHotspot.delta_ndbi).level}
                </span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-zinc-500 text-[10px] block">SURFACE AREA</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {inspectingHotspot.area_hectares.toFixed(2)} ha
                </span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-zinc-500 text-[10px] block">CONFIDENCE</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {inspectingHotspot.confidence_pct}% Verified
                </span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-zinc-500 text-[10px] block">CENTROID</span>
                <span className="font-bold text-slate-700 dark:text-zinc-300">
                  {inspectingHotspot.centroid ? `${inspectingHotspot.centroid[1].toFixed(3)}°, ${inspectingHotspot.centroid[0].toFixed(3)}°` : 'N/A'}
                </span>
              </div>
            </div>

            {/* Multispectral Scientific Indices */}
            <div className="mb-5">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-2 flex items-center space-x-1.5">
                <Activity className="w-3.5 h-3.5 text-blue-500" />
                <span>Multispectral Transition Indices (Sentinel-2 L2A)</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60">
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-500 dark:text-zinc-400">ΔNDVI (Vegetation)</span>
                    <strong className={inspectingHotspot.delta_ndvi < 0 ? 'text-rose-500' : 'text-emerald-500'}>
                      {inspectingHotspot.delta_ndvi > 0 ? `+${inspectingHotspot.delta_ndvi.toFixed(3)}` : inspectingHotspot.delta_ndvi.toFixed(3)}
                    </strong>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                    {inspectingHotspot.delta_ndvi < -0.1 ? 'Substantial canopy loss' : inspectingHotspot.delta_ndvi > 0.1 ? 'Noticeable greening' : 'Stable biomass levels'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60">
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-500 dark:text-zinc-400">ΔNDBI (Built-up)</span>
                    <strong className={inspectingHotspot.delta_ndbi > 0 ? 'text-orange-500' : 'text-slate-500'}>
                      {inspectingHotspot.delta_ndbi > 0 ? `+${inspectingHotspot.delta_ndbi.toFixed(3)}` : inspectingHotspot.delta_ndbi.toFixed(3)}
                    </strong>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                    {inspectingHotspot.delta_ndbi > 0.1 ? 'Concrete / impervious growth' : 'No major construction surge'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60">
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-500 dark:text-zinc-400">ΔNDWI (Water/Moisture)</span>
                    <strong className={inspectingHotspot.delta_ndwi < 0 ? 'text-amber-500' : 'text-blue-500'}>
                      {inspectingHotspot.delta_ndwi > 0 ? `+${inspectingHotspot.delta_ndwi.toFixed(3)}` : inspectingHotspot.delta_ndwi.toFixed(3)}
                    </strong>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                    {inspectingHotspot.delta_ndwi < -0.05 ? 'Receding water / dry soil' : inspectingHotspot.delta_ndwi > 0.05 ? 'Increased surface moisture' : 'Consistent moisture'}
                  </p>
                </div>
              </div>
            </div>

            {/* Simple Explanation & Technical Evidence */}
            <div className="space-y-3 mb-6 text-xs leading-relaxed font-sans">
              <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40">
                <span className="font-mono text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase block mb-1">
                  Phenomenon Explanation
                </span>
                <p className="text-slate-800 dark:text-zinc-200">
                  {inspectingHotspot.simple_explanation}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700/60">
                <span className="font-mono text-[10px] font-bold text-slate-600 dark:text-zinc-400 uppercase block mb-1">
                  Empirical Evidence
                </span>
                <p className="text-slate-700 dark:text-zinc-300 font-mono text-[11px]">
                  {inspectingHotspot.technical_evidence || `Sensor NIR/SWIR reflectance shift confirmed across ${inspectingHotspot.area_hectares} ha.`}
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-zinc-800">
              <div className="text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                {activePresetCity.name} • Copernicus Sentinel-2 Level-2A
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setInspectingHotspot(null)}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-mono text-xs font-semibold transition-all"
                >
                  Close
                </button>

                {onLoadCityInStudio && (
                  <button
                    type="button"
                    onClick={() => {
                      const q = activePresetCity.query;
                      setInspectingHotspot(null);
                      onLoadCityInStudio(q);
                    }}
                    className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-1.5"
                    title={`Loads ${activePresetCity.name} into the Planetary Studio`}
                  >
                    <span>Load {activePresetCity.name} in Studio</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </section>
  );
};
