import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  MapPin, 
  Globe2, 
  Compass, 
  Building2, 
  Droplets, 
  Trees, 
  ArrowRight, 
  Search, 
  X, 
  Check, 
  ChevronDown,
  Sun,
  CloudSnow
} from 'lucide-react';
import { 
  AVAILABLE_LOCATIONS, 
  AvailableLocation, 
  GLOBAL_LOCATIONS,
  INDIA_28_STATES, 
  INDIA_8_UTS,
  INDIA_KEY_CITIES 
} from '../lib/availableLocations';

interface CitySelectorProps {
  activeLocationName?: string;
  onSelectCity: (query: string) => void;
  isAnalyzing: boolean;
  onOpenRawSatellite?: () => void;
}

export const CitySelector: React.FC<CitySelectorProps> = ({
  activeLocationName = '',
  onSelectCity,
  isAnalyzing,
  onOpenRawSatellite,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [filterTab, setFilterTab] = useState<'all' | 'global' | 'states' | 'uts' | 'cities'>('all');
  const [globalCategoryFilter, setGlobalCategoryFilter] = useState<'all' | 'urban' | 'forest' | 'water' | 'coastal' | 'climate' | 'dryland'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const modalRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Find active location object
  const activeLocation = useMemo(() => {
    if (!activeLocationName) return AVAILABLE_LOCATIONS[0];
    const norm = activeLocationName.toLowerCase();
    return (
      AVAILABLE_LOCATIONS.find(
        (c) => norm.includes(c.name.toLowerCase()) || norm.includes(c.id) || c.name.toLowerCase().includes(norm)
      ) || AVAILABLE_LOCATIONS[0]
    );
  }, [activeLocationName]);

  const filteredCities = useMemo(() => {
    return AVAILABLE_LOCATIONS.filter((city) => {
      // Primary category tab filtering
      if (filterTab === 'states' && !city.isState) return false;
      if (filterTab === 'uts' && !city.isUT) return false;
      if (filterTab === 'cities' && (city.isState || city.isUT || city.isGlobal)) return false;
      if (filterTab === 'global') {
        if (!city.isGlobal) return false;
        if (globalCategoryFilter !== 'all' && city.globalCategory !== globalCategoryFilter && city.category !== globalCategoryFilter) {
          return false;
        }
      }

      // Search term filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          city.name.toLowerCase().includes(q) ||
          city.region.toLowerCase().includes(q) ||
          city.country.toLowerCase().includes(q) ||
          city.tag.toLowerCase().includes(q) ||
          city.focus.toLowerCase().includes(q) ||
          (city.targetType && city.targetType.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [filterTab, globalCategoryFilter, searchTerm]);

  // Quick preset chips for rapid access to key states, UTs and globally important observation zones
  const featuredLocations = useMemo(() => {
    const ids = [
      'andhra_pradesh',
      'dubai',
      'amazon_basin',
      'tokyo',
      'greenland',
      'aral_sea',
      'delhi',
      'maharashtra',
      'karnataka',
      'gujarat',
      'visakhapatnam'
    ];
    return AVAILABLE_LOCATIONS.filter((c) => ids.includes(c.id));
  }, []);

  const getCategoryTheme = (city: AvailableLocation) => {
    if (city.isState) {
      return {
        icon: <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />,
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900/50',
      };
    }
    if (city.isUT) {
      return {
        icon: <Compass className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />,
        badge: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-900/50',
      };
    }
    if (city.category === 'climate' || city.globalCategory === 'climate') {
      return {
        icon: <CloudSnow className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />,
        badge: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-300 dark:border-cyan-900/50',
      };
    }
    if (city.category === 'dryland' || city.globalCategory === 'dryland') {
      return {
        icon: <Sun className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />,
        badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900/50',
      };
    }
    switch (city.category) {
      case 'water':
        return {
          icon: <Droplets className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />,
          badge: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900/50',
        };
      case 'forest':
        return {
          icon: <Trees className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />,
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900/50',
        };
      case 'coastal':
        return {
          icon: <Compass className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />,
          badge: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-900/50',
        };
      default:
        return {
          icon: <Building2 className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />,
          badge: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-900/50',
        };
    }
  };

  const isCurrentActive = (city: AvailableLocation) => {
    if (!activeLocationName) return false;
    const normActive = activeLocationName.toLowerCase();
    return normActive.includes(city.name.toLowerCase()) || normActive.includes(city.id) || city.name.toLowerCase().includes(normActive);
  };

  return (
    <div className="w-full mb-4 select-none">
      {/* Sleek Active Location Banner & Dropdown Launcher */}
      <div className="bg-white/95 dark:bg-zinc-900/90 border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-3 sm:p-4 shadow-sm backdrop-blur-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
        {/* Left Side: Active Observation Target Status */}
        <div className="flex items-center space-x-3 min-w-0">
          <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-bounce" style={{ animationDuration: '2.5s' }} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                ACTIVE OBSERVATION TARGET
              </span>
              <span className="px-1.5 py-0.2 text-[9px] font-mono rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-semibold uppercase">
                {activeLocation?.targetType || activeLocation?.tag || 'REGION'}
              </span>
              <span className="px-1.5 py-0.2 text-[9px] font-mono rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-semibold">
                Pass: {activeLocation?.years || '2021–2026'}
              </span>
            </div>
            <div className="flex items-center space-x-2 mt-0.5 truncate">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white truncate flex items-center space-x-1.5">
                <span>{activeLocation?.flag || '🌐'}</span>
                <span>{activeLocation?.name || activeLocationName || 'Planetary Location'}</span>
              </h3>
              {activeLocation?.region && (
                <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium truncate hidden sm:inline">
                  • {activeLocation.region}, {activeLocation.country}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Primary Actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Change Location Button (Opens sleek popover/modal) */}
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            disabled={isAnalyzing}
            className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-mono font-bold transition-all shadow-xs flex items-center space-x-2 cursor-pointer disabled:opacity-50"
            title="Browse all 28 Indian States, 8 Union Territories, and 19 Global Benchmarks"
          >
            <Globe2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>BROWSE PLANETARY LOCATIONS (55)</span>
            <ChevronDown className="w-3.5 h-3.5 text-blue-600/70 dark:text-blue-400/70" />
          </button>

          {/* Raw Satellite Studio Option */}
          {onOpenRawSatellite && (
            <button
              type="button"
              onClick={onOpenRawSatellite}
              className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-mono font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
              title="Open Raw Optical Satellite Studio"
            >
              <Compass className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>RAW SATELLITE</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Access Preset Chips */}
      <div className="mt-2.5 flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs font-mono">
        <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-semibold shrink-0 mr-1 flex items-center space-x-1">
          <span>QUICK TARGETS:</span>
        </span>
        {featuredLocations.map((c) => {
          const isAct = isCurrentActive(c);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                if (!isAnalyzing && !isAct) {
                  onSelectCity(c.query);
                }
              }}
              disabled={isAnalyzing}
              className={`shrink-0 px-2.5 py-1 rounded-lg border text-xs transition-all flex items-center space-x-1.5 cursor-pointer ${
                isAct
                  ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                  : 'bg-white/80 dark:bg-zinc-900/80 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-800 hover:border-blue-300'
              } disabled:opacity-50`}
            >
              <span>{c.flag}</span>
              <span className="font-sans font-semibold text-[11px]">{c.name}</span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="shrink-0 px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-dashed border-blue-300 dark:border-blue-700 cursor-pointer"
        >
          ＋ All 55 Targets...
        </button>
      </div>

      {/* Searchable Location Selector Modal (All 28 States, 8 UTs, Key Cities, and 19 Global Benchmarks) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div 
            ref={modalRef}
            className="w-full max-w-4xl max-h-[85vh] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 flex items-center justify-center">
                  <Globe2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                    Global & India Planetary Observation Registry
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    All 28 Indian States, 8 Union Territories, and 19 Globally Benchmarked Earth Features
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-400 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 bg-slate-50/80 dark:bg-zinc-950/60 border-b border-slate-200 dark:border-zinc-800 flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* Search Box */}
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search state, country, city, basin, or focus (e.g. Dubai, Amazon, Andhra Pradesh)..."
                    className="w-full pl-9 pr-8 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-xs"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Primary Category Tabs */}
                <div className="flex items-center p-1 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono shrink-0 self-start sm:self-auto overflow-x-auto no-scrollbar">
                  {[
                    { id: 'all', label: `All (55)` },
                    { id: 'global', label: `Global (19)` },
                    { id: 'states', label: `India States (28)` },
                    { id: 'uts', label: `India UTs (8)` },
                    { id: 'cities', label: `India Cities & Rivers` },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setFilterTab(tab.id as any)}
                      className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                        filterTab === tab.id
                          ? 'bg-blue-600 text-white font-bold shadow-xs'
                          : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sub-Category Pills for Global Locations */}
              {filterTab === 'global' && (
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 text-xs font-mono">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold shrink-0 mr-1">THEME:</span>
                  {[
                    { id: 'all', label: 'All Global (19)' },
                    { id: 'urban', label: '🏙 Urban (7)' },
                    { id: 'forest', label: '🌳 Forests (2)' },
                    { id: 'water', label: '💧 Water / Deltas (3)' },
                    { id: 'coastal', label: '🌊 Coastal / Reefs (3)' },
                    { id: 'climate', label: '❄ Climate / Ice (2)' },
                    { id: 'dryland', label: '🏜 Dryland / Desert (2)' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setGlobalCategoryFilter(cat.id as any)}
                      className={`shrink-0 px-2.5 py-1 rounded-lg border text-xs transition-all cursor-pointer ${
                        globalCategoryFilter === cat.id
                          ? 'bg-blue-600 text-white border-blue-600 font-bold'
                          : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:border-slate-300'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Locations List (Scrollable 3-column grid) */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredCities.map((city) => {
                  const active = isCurrentActive(city);
                  const theme = getCategoryTheme(city);

                  return (
                    <div
                      key={city.id}
                      onClick={() => {
                        if (!isAnalyzing) {
                          onSelectCity(city.query);
                          setIsOpen(false);
                        }
                      }}
                      className={`group cursor-pointer p-3.5 rounded-xl border transition-all duration-150 flex flex-col justify-between ${
                        active
                          ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 dark:border-blue-500 ring-1 ring-blue-500/30 shadow-sm'
                          : 'bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800/70 border-slate-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-zinc-700 shadow-xs'
                      } ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div>
                        {/* Tag & Active Indicator */}
                        <div className="flex items-center justify-between mb-2">
                          <span className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase border ${theme.badge}`}>
                            {theme.icon}
                            <span>{city.targetType || city.tag}</span>
                          </span>
                          {active && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-blue-600 text-white flex items-center space-x-1">
                              <Check className="w-3 h-3" />
                              <span>CURRENT</span>
                            </span>
                          )}
                        </div>

                        {/* City / State Title */}
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                          {city.flag} {city.name}
                        </h4>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400 mb-1.5 truncate">
                          {city.region}, {city.country}
                        </div>

                        {/* Focus description */}
                        <p className="text-[11px] text-slate-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                          {city.focus}
                        </p>
                      </div>

                      {/* Bottom Action Footer */}
                      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-zinc-400">
                        <span>{city.years}</span>
                        <span className="text-blue-600 dark:text-blue-400 font-bold group-hover:translate-x-1 transition-transform flex items-center space-x-0.5">
                          <span>Observe</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredCities.length === 0 && (
                <div className="text-center py-12 text-slate-500 dark:text-zinc-400 font-mono text-xs">
                  No observation locations found matching &quot;{searchTerm}&quot;
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-zinc-400 px-5">
              <span>Showing {filteredCities.length} locations</span>
              <span>Press ESC to close</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
