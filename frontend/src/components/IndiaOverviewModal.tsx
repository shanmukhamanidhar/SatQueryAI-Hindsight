import React, { useState, useMemo } from 'react';
import { 
  X, 
  Globe2, 
  Search, 
  MapPin, 
  ArrowRight, 
  Layers, 
  ChevronRight, 
  Activity, 
  Compass, 
  Building2, 
  Droplets, 
  Trees, 
  AlertTriangle, 
  ShieldCheck, 
  Flame 
} from 'lucide-react';
import { 
  ALL_INDIA_LOCATIONS, 
  INDIA_28_STATES, 
  INDIA_8_UTS, 
  AvailableLocation 
} from '../lib/availableLocations';

interface IndiaOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (query: string) => void;
  activeLocationName?: string;
}

export const IndiaOverviewModal: React.FC<IndiaOverviewModalProps> = ({
  isOpen,
  onClose,
  onSelectLocation,
  activeLocationName = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'states' | 'uts'>('all');
  const [selectedLocation, setSelectedLocation] = useState<AvailableLocation | null>(null);

  // Drilldown level: 'national' | 'state_drilldown'
  const [drilldownLevel, setDrilldownLevel] = useState<'national' | 'state_drilldown'>('national');

  const filteredLocations = useMemo(() => {
    return ALL_INDIA_LOCATIONS.filter((loc) => {
      if (filterType === 'states' && !loc.isState) return false;
      if (filterType === 'uts' && !loc.isUT) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          loc.name.toLowerCase().includes(q) ||
          loc.region.toLowerCase().includes(q) ||
          loc.focus.toLowerCase().includes(q) ||
          loc.tag.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [filterType, searchTerm]);

  if (!isOpen) return null;

  const handleOpenStateDrilldown = (loc: AvailableLocation) => {
    setSelectedLocation(loc);
    setDrilldownLevel('state_drilldown');
  };

  const handleLaunchAnalysis = (loc: AvailableLocation) => {
    onSelectLocation(loc.query);
    onClose();
  };

  const getStatusTheme = (category: string) => {
    switch (category) {
      case 'water':
        return {
          dotColor: '#0284c7', // Blue
          label: 'Water Dynamics',
          status: 'River Basin & Hydrological Monitoring',
          icon: <Droplets className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />,
          badge: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900/50'
        };
      case 'forest':
        return {
          dotColor: '#10b981', // Green
          label: 'Healthy Canopy',
          status: 'Dense Forest Cover & Agro-Ecosystem',
          icon: <Trees className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />,
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900/50'
        };
      case 'coastal':
        return {
          dotColor: '#0284c7', // Blue
          label: 'Coastal / Water',
          status: 'Coastal Marine Buffer & Delta Hydrology',
          icon: <Compass className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />,
          badge: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-900/50'
        };
      default:
        return {
          dotColor: '#f97316', // Orange
          label: 'Urban Development',
          status: 'Active Infrastructure & Suburban Growth',
          icon: <Building2 className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />,
          badge: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-900/50'
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-5xl max-h-[90vh] bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-slate-100 font-sans">
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-slate-50/70 dark:bg-zinc-950/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-xs">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  National Geospatial Overview of India
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100/70 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 font-mono font-bold">
                  36 States &amp; UTs
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-zinc-400 flex items-center space-x-2 mt-0.5">
                <span className="font-semibold text-slate-700 dark:text-zinc-300">Hierarchical Drilldown:</span>
                <span className="text-blue-600 dark:text-blue-400 font-mono">India</span>
                <span>➔</span>
                <span className={drilldownLevel === 'state_drilldown' ? 'text-blue-600 dark:text-blue-400 font-mono font-bold' : 'text-slate-400 font-mono'}>
                  {selectedLocation ? selectedLocation.name : 'State / UT'}
                </span>
                <span>➔</span>
                <span className="text-slate-400 font-mono">Sentinel-2 AOI</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"
            title="Close Overview"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Level 1: National Overview vs Level 2: State Drilldown */}
        {drilldownLevel === 'national' ? (
          <div className="flex-1 flex flex-col overflow-hidden p-6 space-y-4">
            {/* National Environmental Legend & Search Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-zinc-800">
              {/* Category Color Mapping Key */}
              <div className="flex items-center gap-3 text-xs font-mono text-slate-600 dark:text-zinc-400 flex-wrap">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">MACRO STATUS:</span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                  <span>Vegetation / Forest (28%)</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f97316]" />
                  <span>Urban / Built-up (42%)</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7]" />
                  <span>Water / Coast (30%)</span>
                </span>
              </div>

              {/* Filters & Search */}
              <div className="flex items-center gap-2">
                <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-zinc-800/80 text-xs font-mono">
                  {[
                    { id: 'all', label: 'All (36)' },
                    { id: 'states', label: 'States (28)' },
                    { id: 'uts', label: 'UTs (8)' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setFilterType(tab.id as any)}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        filterType === tab.id
                          ? 'bg-blue-600 text-white font-bold shadow-xs'
                          : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search State or UT..."
                    className="pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 w-44 sm:w-56"
                  />
                </div>
              </div>
            </div>

            {/* Grid of All 36 States & UTs */}
            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredLocations.map((loc) => {
                  const theme = getStatusTheme(loc.category);
                  const isCurrent = activeLocationName.toLowerCase().includes(loc.name.toLowerCase());

                  return (
                    <div
                      key={loc.id}
                      onClick={() => handleOpenStateDrilldown(loc)}
                      className={`group cursor-pointer p-3.5 rounded-2xl border transition-all duration-150 flex flex-col justify-between ${
                        isCurrent
                          ? 'bg-blue-50/90 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700 ring-2 ring-blue-500/20 shadow-sm'
                          : 'bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800/80 border-slate-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-zinc-700 shadow-xs'
                      }`}
                    >
                      <div>
                        {/* Top Badge & Flag */}
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${
                            loc.isState
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              : 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                          }`}>
                            {loc.tag}
                          </span>
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.dotColor }} title={theme.label} />
                        </div>

                        {/* Location Name */}
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center space-x-1.5">
                          <span>{loc.name}</span>
                          {isCurrent && <span className="text-[10px] text-blue-600 font-mono font-normal">(Active)</span>}
                        </h4>

                        {/* Focus Corridor */}
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 line-clamp-1">
                          📍 {loc.region}
                        </div>

                        <div className="text-[10.5px] text-slate-600 dark:text-zinc-400 mt-1.5 line-clamp-2 leading-snug">
                          {loc.focus}
                        </div>
                      </div>

                      {/* Bottom Action Footer */}
                      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-[10.5px] font-mono">
                        <span className="text-slate-400">{theme.label}</span>
                        <span className="text-blue-600 dark:text-blue-400 font-bold group-hover:translate-x-1 transition-transform flex items-center space-x-0.5">
                          <span>Drill Down</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Level 2: State Drilldown View */
          selectedLocation && (
            <div className="flex-1 flex flex-col overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {/* Breadcrumb Return Button */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setDrilldownLevel('national')}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-mono font-bold text-slate-700 dark:text-zinc-300 flex items-center space-x-1.5 transition-all"
                >
                  <span>← Back to India Map</span>
                </button>

                <div className="flex items-center space-x-2 text-xs font-mono text-slate-500 dark:text-zinc-400">
                  <span>Coordinates:</span>
                  <strong className="text-slate-900 dark:text-white">
                    {selectedLocation.coordinates[1].toFixed(4)}°N, {selectedLocation.coordinates[0].toFixed(4)}°E
                  </strong>
                </div>
              </div>

              {/* State Spotlight Banner */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-50/80 via-slate-50 to-indigo-50/50 dark:from-zinc-800/90 dark:via-zinc-900 dark:to-zinc-900 border border-blue-200/80 dark:border-zinc-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">🇮🇳</span>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {selectedLocation.name}
                    </h3>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase border ${
                      selectedLocation.isState
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                    }`}>
                      {selectedLocation.tag}
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-zinc-300 max-w-2xl leading-relaxed">
                    {selectedLocation.focus}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 text-xs font-mono border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">
                      🏛️ <strong>Capital / Corridor:</strong> {selectedLocation.region}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 text-xs font-mono border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">
                      🛰️ <strong>Sensor:</strong> Sentinel-2 (10m GSD)
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 text-xs font-mono border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">
                      📐 <strong>Target AOI:</strong> ~22,000–48,000 ha
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleLaunchAnalysis(selectedLocation)}
                  className="px-6 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm font-mono tracking-wide transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 shrink-0 group"
                >
                  <Activity className="w-4 h-4" />
                  <span>RUN SATELLITE ANALYSIS</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Multi-spectral Category Status Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 space-y-2">
                  <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs font-mono uppercase">
                    <Trees className="w-4 h-4" />
                    <span>Vegetation Canopy Index</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                    Evaluated via Sentinel-2 NDVI (Normalized Difference Vegetation Index) across native forest reserves and agricultural river basins.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 space-y-2">
                  <div className="flex items-center space-x-2 text-orange-600 dark:text-orange-400 font-bold text-xs font-mono uppercase">
                    <Building2 className="w-4 h-4" />
                    <span>Built-Up / Urban Surface</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                    Calculated via Sentinel-2 NDBI (Normalized Difference Built-up Index) monitoring commercial corridors, highways, and residential expansion.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 space-y-2">
                  <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 font-bold text-xs font-mono uppercase">
                    <Droplets className="w-4 h-4" />
                    <span>Surface Water Dynamics</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                    Monitored via Sentinel-2 NDWI (Normalized Difference Water Index) tracking major reservoir levels, river deltas, and wetland stability.
                  </p>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};
