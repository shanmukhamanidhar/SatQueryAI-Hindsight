import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Columns, 
  SlidersHorizontal, 
  Grid3X3, 
  ArrowLeftRight, 
  Download, 
  MapPin, 
  Calendar, 
  Eye, 
  Maximize2, 
  Minimize2, 
  Sparkles, 
  Search, 
  Check, 
  Satellite,
  Compass,
  Layers
} from 'lucide-react';
import { AnalysisContext, LocationInfo } from '../lib/types';
import { getYearSatelliteImage, resolveLocation } from '../lib/api';

interface RawSatelliteModalProps {
  isOpen: boolean;
  onClose: () => void;
  context?: AnalysisContext | null;
  onSelectCityForAnalysis?: (cityQuery: string) => void;
}

interface PlacePreset {
  id: string;
  name: string;
  country: string;
  bbox: [number, number, number, number];
  query: string;
}

const PRESET_PLACES: PlacePreset[] = [
  {
    id: 'visakhapatnam',
    name: 'Visakhapatnam',
    country: 'India',
    bbox: [83.22213, 17.62355, 83.36213, 17.76355],
    query: 'Analyze Visakhapatnam between 2021 and 2026',
  },
  {
    id: 'vijayawada',
    name: 'Krishna River / Vijayawada',
    country: 'India',
    bbox: [80.55, 16.45, 80.69, 16.58],
    query: 'Krishna River in Vijayawada between 2021 and 2026',
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad',
    country: 'India',
    bbox: [78.40, 17.35, 78.55, 17.48],
    query: 'Analyze Hyderabad, Telangana between 2021 and 2026',
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    country: 'India',
    bbox: [77.52008, 12.90679, 77.66008, 13.04679],
    query: 'Analyze Bengaluru, Karnataka between 2021 and 2026',
  },
  {
    id: 'gujarat',
    name: 'Gujarat Coast',
    country: 'India',
    bbox: [72.10, 21.65, 72.28, 21.80],
    query: 'Analyze Gujarat, India between 2021 and 2026',
  },
  {
    id: 'mumbai',
    name: 'Mumbai Coast',
    country: 'India',
    bbox: [72.78, 18.90, 72.95, 19.08],
    query: 'Analyze Mumbai, Maharashtra between 2021 and 2026',
  },
  {
    id: 'delhi',
    name: 'Delhi NCR',
    country: 'India',
    bbox: [77.12, 28.55, 77.30, 28.70],
    query: 'Analyze Delhi, India between 2021 and 2026',
  },
  {
    id: 'dubai',
    name: 'Dubai',
    country: 'UAE',
    bbox: [55.15, 25.05, 55.35, 25.28],
    query: 'Analyze Dubai, UAE between 2021 and 2026',
  },
  {
    id: 'tokyo',
    name: 'Tokyo Bay',
    country: 'Japan',
    bbox: [139.70, 35.58, 139.90, 35.72],
    query: 'Analyze Tokyo, Japan between 2021 and 2026',
  },
  {
    id: 'london',
    name: 'London',
    country: 'UK',
    bbox: [-0.18, 51.45, 0.05, 51.55],
    query: 'Analyze London, United Kingdom between 2021 and 2026',
  },
  {
    id: 'amazon',
    name: 'Amazon Basin',
    country: 'Brazil',
    bbox: [-60.10, -3.20, -59.90, -3.00],
    query: 'Amazon Rainforest Basin between 2021 and 2026',
  },
  {
    id: 'sydney',
    name: 'Sydney Harbour',
    country: 'Australia',
    bbox: [151.15, -33.90, 151.30, -33.80],
    query: 'Analyze Sydney, Australia between 2021 and 2026',
  },
];

const AVAILABLE_YEARS = [2020, 2021, 2022, 2023, 2024, 2025, 2026];

interface YearImageRecord {
  year: number;
  date: string;
  imageUrl: string;
  cloudCover: number;
  satellite: string;
}

export const RawSatelliteModal: React.FC<RawSatelliteModalProps> = ({
  isOpen,
  onClose,
  context,
  onSelectCityForAnalysis,
}) => {
  // Current active location & bounding box
  const [activePlaceName, setActivePlaceName] = useState<string>(
    context?.location.name || 'Visakhapatnam'
  );
  const [activeBbox, setActiveBbox] = useState<[number, number, number, number]>(
    context?.location.bounding_box || [83.22213, 17.62355, 83.36213, 17.76355]
  );

  // Timeline years selection
  const [leftYear, setLeftYear] = useState<number>(2021);
  const [rightYear, setRightYear] = useState<number>(2026);

  // View modes: 'side-by-side' | 'gallery'
  const [viewMode, setViewMode] = useState<'side-by-side' | 'gallery'>('side-by-side');

  // Cache of fetched year images
  const [imageCache, setImageCache] = useState<Record<number, YearImageRecord>>({});
  const [loadingYears, setLoadingYears] = useState<Record<number, boolean>>({});

  // Place search input
  const [placeSearchInput, setPlaceSearchInput] = useState<string>('');
  const [isResolvingPlace, setIsResolvingPlace] = useState<boolean>(false);
  const [placeDropdownOpen, setPlaceDropdownOpen] = useState<boolean>(false);

  // Fullscreen container mode
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Sync with context on load
  useEffect(() => {
    if (context) {
      setActivePlaceName(context.location.name);
      setActiveBbox(context.location.bounding_box);

      const beforeYr = context.actual_before_date ? parseInt(context.actual_before_date.slice(0, 4)) : 2021;
      const afterYr = context.actual_after_date ? parseInt(context.actual_after_date.slice(0, 4)) : 2026;
      setLeftYear(beforeYr);
      setRightYear(afterYr);

      // Seed cache with currently loaded context images
      const initialCache: Record<number, YearImageRecord> = {};
      if (context.visual_layers?.before_rgb) {
        initialCache[beforeYr] = {
          year: beforeYr,
          date: context.actual_before_date || `${beforeYr}-03-15`,
          imageUrl: context.visual_layers.before_rgb,
          cloudCover: 0.0,
          satellite: 'Copernicus Sentinel-2 L2A / Esri High-Res',
        };
      }
      if (context.visual_layers?.after_rgb) {
        initialCache[afterYr] = {
          year: afterYr,
          date: context.actual_after_date || `${afterYr}-02-20`,
          imageUrl: context.visual_layers.after_rgb,
          cloudCover: 0.0,
          satellite: 'Copernicus Sentinel-2 L2A / Esri High-Res',
        };
      }
      setImageCache(initialCache);
    }
  }, [context]);

  // Load satellite image for a given year if not cached
  const ensureYearImageLoaded = async (year: number) => {
    if (imageCache[year] || loadingYears[year]) return;

    setLoadingYears((prev) => ({ ...prev, [year]: true }));
    try {
      const res = await getYearSatelliteImage({
        analysis_id: context?.analysis_id,
        bbox: activeBbox,
        year,
      });
      setImageCache((prev) => ({
        ...prev,
        [year]: {
          year: res.year,
          date: res.date,
          imageUrl: res.image_url,
          cloudCover: res.cloud_cover_pct,
          satellite: res.satellite || 'Copernicus Sentinel-2 L2A Calibrated',
        },
      }));
    } catch (err) {
      console.error(`Failed to load satellite image for year ${year}:`, err);
    } finally {
      setLoadingYears((prev) => ({ ...prev, [year]: false }));
    }
  };

  // Ensure both Left and Right years are loaded
  useEffect(() => {
    if (!isOpen) return;
    ensureYearImageLoaded(leftYear);
    ensureYearImageLoaded(rightYear);
  }, [leftYear, rightYear, activeBbox, isOpen]);

  // When switching to gallery view, optionally pre-fetch all years
  useEffect(() => {
    if (!isOpen || viewMode !== 'gallery') return;
    AVAILABLE_YEARS.forEach((yr) => {
      ensureYearImageLoaded(yr);
    });
  }, [viewMode, activeBbox, isOpen]);

  // Swap Left and Right Years
  const handleSwapYears = () => {
    const prevLeft = leftYear;
    setLeftYear(rightYear);
    setRightYear(prevLeft);
  };

  // Change active place
  const handleSelectPresetPlace = (place: PlacePreset) => {
    setActivePlaceName(place.name);
    setActiveBbox(place.bbox);
    setImageCache({}); // clear cache for new location
    setPlaceDropdownOpen(false);
  };

  // Custom place search resolution
  const handleSearchCustomPlace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!placeSearchInput.trim()) return;

    setIsResolvingPlace(true);
    try {
      const loc = await resolveLocation(placeSearchInput.trim());
      setActivePlaceName(loc.name);
      setActiveBbox(loc.bounding_box);
      setImageCache({}); // clear cache for new coordinates
      setPlaceSearchInput('');
      setPlaceDropdownOpen(false);
    } catch (err) {
      alert(`Could not locate "${placeSearchInput}". Please check spelling.`);
    } finally {
      setIsResolvingPlace(false);
    }
  };

  // Download raw satellite image file
  const handleDownloadImage = (imgUrl: string, year: number) => {
    if (!imgUrl) return;
    const link = document.createElement('a');
    link.href = imgUrl;
    link.download = `SatQueryAI_Raw_${activePlaceName.replace(/\s+/g, '_')}_${year}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Keyboard escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const leftImg = imageCache[leftYear];
  const rightImg = imageCache[rightYear];

  return (
    <div className={`fixed inset-0 z-[120] bg-slate-900/70 dark:bg-black/85 backdrop-blur-2xl flex flex-col font-sans transition-all text-slate-900 dark:text-slate-100 ${isFullscreen ? 'p-0' : 'p-2 sm:p-4 lg:p-6'}`}>
      <div className={`w-full h-full flex flex-col bg-white dark:bg-[#090e17] border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden ${isFullscreen ? 'rounded-none border-none' : 'rounded-3xl'}`}>
        
        {/* ======================================================================= */}
        {/* 1. TOP HEADER BAR: TITLE, VIEW MODES, CONTROLS, CLOSE                   */}
        {/* ======================================================================= */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-50 dark:bg-[#0c1322] border-b border-slate-200 dark:border-zinc-800 shrink-0">
          
          {/* Left: Title & Subtitle */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500/20 to-emerald-500/20 border border-blue-500/40 flex items-center justify-center shadow-md">
              <Satellite className="w-5 h-5 text-blue-600 dark:text-cyan-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-heading font-black text-sm sm:text-base tracking-wider text-slate-900 dark:text-white uppercase">
                  RAW SATELLITE IMAGERY STUDIO
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-cyan-500/15 text-blue-700 dark:text-cyan-400 text-[10px] font-telemetry font-bold border border-blue-200 dark:border-cyan-500/30">
                  PURE OPTICAL • NO MASKS
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-telemetry">
                True-color satellite photography across timeline years • Side-by-side physical comparison
              </p>
            </div>
          </div>

          {/* Center: View Mode Switcher */}
          <div className="flex items-center bg-slate-200/80 dark:bg-zinc-950 p-1 rounded-2xl border border-slate-300 dark:border-zinc-800 text-xs font-telemetry">
            <button
              type="button"
              onClick={() => setViewMode('side-by-side')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1.5 transition-all ${
                viewMode === 'side-by-side'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/5'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>SIDE-BY-SIDE</span>
            </button>



            <button
              type="button"
              onClick={() => setViewMode('gallery')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1.5 transition-all ${
                viewMode === 'gallery'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/5'
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>ALL-YEARS REEL</span>
            </button>
          </div>

          {/* Right: Actions & Close */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white border border-slate-300 dark:border-zinc-700 transition-colors shadow-sm"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen View'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/15 dark:hover:bg-rose-500/25 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40 text-xs font-telemetry font-bold flex items-center space-x-1.5 transition-all shadow-sm"
              title="Close Raw Satellite Studio"
            >
              <X className="w-4 h-4 text-rose-500 dark:text-rose-400" />
              <span>CLOSE</span>
            </button>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* 2. SECONDARY TOOLBAR: LOCATION PICKER + TIMELINE SELECTORS              */}
        {/* ======================================================================= */}
        <div className="px-4 py-2.5 bg-slate-100/80 dark:bg-[#070b14] border-b border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs font-telemetry shrink-0">
          
          {/* PLACE SELECTOR WITH POPUP / DROPDOWN */}
          <div className="relative">
            <div className="flex items-center space-x-2">
              <span className="text-slate-500 dark:text-slate-400 uppercase font-bold flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>SPECIFIC PLACE:</span>
              </span>
              <button
                type="button"
                onClick={() => setPlaceDropdownOpen(!placeDropdownOpen)}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-900 dark:text-white font-bold border border-slate-300 dark:border-zinc-700 flex items-center space-x-2 transition-all shadow-sm"
              >
                <span className="text-blue-600 dark:text-blue-400 font-mono">{activePlaceName}</span>
                <span className="text-slate-400 dark:text-slate-500 text-[10px]">▼ CHANGE PLACE</span>
              </button>
            </div>

            {/* Dropdown for selecting specific places or searching */}
            {placeDropdownOpen && (
              <div className="absolute left-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-zinc-800 mb-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                    <Compass className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>CHOOSE SPECIFIC OBSERVATION PLACE</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setPlaceDropdownOpen(false)}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs p-1"
                  >
                    ✕
                  </button>
                </div>

                {/* Custom Search Box */}
                <form onSubmit={handleSearchCustomPlace} className="flex items-center gap-1.5 mb-3">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={placeSearchInput}
                      onChange={(e) => setPlaceSearchInput(e.target.value)}
                      placeholder="Type any world city, island, or river..."
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl pl-8 pr-2 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isResolvingPlace}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shrink-0 transition-colors shadow-sm"
                  >
                    {isResolvingPlace ? 'Locating...' : 'Go'}
                  </button>
                </form>

                {/* Curated Quick Locations */}
                <div className="text-[10.5px] text-slate-500 dark:text-slate-400 mb-1 font-semibold uppercase">Popular Satellite Centers:</div>
                <div className="grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto pr-1">
                  {PRESET_PLACES.map((p) => {
                    const isCurrent = p.name === activePlaceName || p.id === activePlaceName.toLowerCase();
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectPresetPlace(p)}
                        className={`p-2 rounded-xl text-left border transition-all flex flex-col ${
                          isCurrent
                            ? 'bg-blue-50 dark:bg-blue-500/15 border-blue-400 dark:border-blue-500/60 text-blue-700 dark:text-blue-400 font-bold'
                            : 'bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <span className="font-semibold text-xs leading-snug">{p.name}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{p.country}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* DUAL TIMELINE YEAR SELECTORS (LEFT & RIGHT) */}
          <div className="flex flex-wrap items-center gap-3">
            {/* LEFT / BASELINE YEAR */}
            <div className="flex items-center space-x-1.5 bg-white dark:bg-zinc-950 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px] uppercase tracking-wider">
                LEFT PASS (A):
              </span>
              <div className="flex items-center space-x-1">
                {AVAILABLE_YEARS.map((yr) => {
                  const isSel = leftYear === yr;
                  return (
                    <button
                      key={`left-${yr}`}
                      type="button"
                      onClick={() => setLeftYear(yr)}
                      className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all ${
                        isSel
                          ? 'bg-emerald-600 text-white shadow-sm scale-105'
                          : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                      }`}
                    >
                      {yr}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SWAP BUTTON */}
            <button
              type="button"
              onClick={handleSwapYears}
              className="p-1.5 rounded-xl bg-white hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 border border-slate-200 dark:border-zinc-700 transition-all shadow-sm"
              title="Swap Left and Right observation timeline passes"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
            </button>

            {/* RIGHT / COMPARATIVE YEAR */}
            <div className="flex items-center space-x-1.5 bg-white dark:bg-zinc-950 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
              <span className="text-blue-600 dark:text-blue-400 font-bold text-[11px] uppercase tracking-wider">
                RIGHT PASS (B):
              </span>
              <div className="flex items-center space-x-1">
                {AVAILABLE_YEARS.map((yr) => {
                  const isSel = rightYear === yr;
                  return (
                    <button
                      key={`right-${yr}`}
                      type="button"
                      onClick={() => setRightYear(yr)}
                      className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all ${
                        isSel
                          ? 'bg-blue-600 text-white shadow-sm scale-105'
                          : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30'
                      }`}
                    >
                      {yr}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Presets */}
            <div className="hidden xl:flex items-center space-x-1 text-[11px] text-slate-500 dark:text-slate-400 pl-1 border-l border-slate-200 dark:border-zinc-800">
              <span className="text-slate-400 dark:text-slate-500 font-bold mr-1">SPAN:</span>
              <button
                type="button"
                onClick={() => { setLeftYear(2020); setRightYear(2026); }}
                className="px-2 py-0.5 rounded-lg bg-white dark:bg-white/5 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/20 dark:hover:text-blue-400 border border-slate-200 dark:border-zinc-800 transition-colors shadow-sm"
              >
                6-Yr (2020➔2026)
              </button>
              <button
                type="button"
                onClick={() => { setLeftYear(2021); setRightYear(2026); }}
                className="px-2 py-0.5 rounded-lg bg-white dark:bg-white/5 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/20 dark:hover:text-blue-400 border border-slate-200 dark:border-zinc-800 transition-colors shadow-sm"
              >
                5-Yr (2021➔2026)
              </button>
              <button
                type="button"
                onClick={() => { setLeftYear(2023); setRightYear(2026); }}
                className="px-2 py-0.5 rounded-lg bg-white dark:bg-white/5 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/20 dark:hover:text-blue-400 border border-slate-200 dark:border-zinc-800 transition-colors shadow-sm"
              >
                3-Yr (2023➔2026)
              </button>
            </div>

          </div>
        </div>

        {/* ======================================================================= */}
        {/* 3. MAIN SATELLITE IMAGES DISPLAY AREA                                   */}
        {/* ======================================================================= */}
        <div className="flex-1 p-3 sm:p-4 overflow-hidden relative bg-slate-100/70 dark:bg-[#040711] flex flex-col">
          
          {/* ------------------------------------------------------------- */}
          {/* MODE A: SIDE-BY-SIDE PANELS (Left Image vs Right Image)       */}
          {/* ------------------------------------------------------------- */}
          {viewMode === 'side-by-side' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full w-full">
              
              {/* LEFT SATELLITE PASS */}
              <div className="flex flex-col h-full bg-white dark:bg-[#080d19] rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                {/* Header Strip */}
                <div className="px-3.5 py-2 bg-slate-50 dark:bg-[#0c1322] border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-telemetry font-bold text-slate-900 dark:text-white uppercase">
                      BASELINE PASS • YEAR {leftYear}
                    </span>
                    <span className="text-[10.5px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/30 font-bold">
                      {leftImg?.date || `${leftYear}-06-15`}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-telemetry text-slate-500 dark:text-slate-400 hidden sm:inline">
                      Cloud: 0.0% • Optical RGB
                    </span>
                    {leftImg?.imageUrl && (
                      <button
                        type="button"
                        onClick={() => handleDownloadImage(leftImg.imageUrl, leftYear)}
                        className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-emerald-50 dark:bg-white/5 dark:hover:bg-emerald-500/20 text-slate-700 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-emerald-300 border border-slate-300 dark:border-zinc-700 text-[10.5px] font-telemetry font-bold flex items-center space-x-1 transition-colors"
                        title="Download raw optical photograph"
                      >
                        <Download className="w-3 h-3" />
                        <span>PNG</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Image Container */}
                <div className="flex-1 relative flex items-center justify-center bg-slate-950 overflow-hidden group">
                  {loadingYears[leftYear] ? (
                    <div className="flex flex-col items-center justify-center space-y-3 p-6 text-center">
                      <div className="w-12 h-12 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 animate-spin" />
                      <span className="text-xs font-telemetry text-emerald-300 font-bold">
                        Retrieving {leftYear} calibrated satellite pass for {activePlaceName}...
                      </span>
                      <span className="text-[10px] text-slate-500 font-telemetry">
                        Sub-meter orthorectified imagery • Esri Wayback / Copernicus
                      </span>
                    </div>
                  ) : leftImg?.imageUrl ? (
                    <div className="w-full h-full relative flex items-center justify-center p-2">
                      <img
                        src={leftImg.imageUrl}
                        alt={`Raw Satellite View ${activePlaceName} ${leftYear}`}
                        className="max-h-full max-w-full object-contain rounded-xl shadow-2xl transition-transform duration-300 hover:scale-[1.02]"
                      />
                      <div className="absolute bottom-4 left-4 px-2.5 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-700/80 text-[10px] font-telemetry text-slate-300 flex items-center space-x-2 pointer-events-none">
                        <span className="text-emerald-400 font-bold">{activePlaceName} ({leftYear})</span>
                        <span className="text-slate-500">•</span>
                        <span>{leftImg.satellite}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 font-telemetry">
                      No satellite imagery pass loaded for {leftYear}.
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT SATELLITE PASS */}
              <div className="flex flex-col h-full bg-white dark:bg-[#080d19] rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                {/* Header Strip */}
                <div className="px-3.5 py-2 bg-slate-50 dark:bg-[#0c1322] border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span className="text-xs font-telemetry font-bold text-slate-900 dark:text-white uppercase">
                      COMPARATIVE PASS • YEAR {rightYear}
                    </span>
                    <span className="text-[10.5px] font-mono text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-500/30 font-bold">
                      {rightImg?.date || `${rightYear}-06-15`}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-telemetry text-slate-500 dark:text-slate-400 hidden sm:inline">
                      Cloud: 0.0% • Optical RGB
                    </span>
                    {rightImg?.imageUrl && (
                      <button
                        type="button"
                        onClick={() => handleDownloadImage(rightImg.imageUrl, rightYear)}
                        className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-white/5 dark:hover:bg-blue-500/20 text-slate-700 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300 border border-slate-300 dark:border-zinc-700 text-[10.5px] font-telemetry font-bold flex items-center space-x-1 transition-colors"
                        title="Download raw optical photograph"
                      >
                        <Download className="w-3 h-3" />
                        <span>PNG</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Image Container */}
                <div className="flex-1 relative flex items-center justify-center bg-slate-950 overflow-hidden group">
                  {loadingYears[rightYear] ? (
                    <div className="flex flex-col items-center justify-center space-y-3 p-6 text-center">
                      <div className="w-12 h-12 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
                      <span className="text-xs font-telemetry text-blue-400 font-bold">
                        Retrieving {rightYear} calibrated satellite pass for {activePlaceName}...
                      </span>
                      <span className="text-[10px] text-slate-500 font-telemetry">
                        Sub-meter orthorectified imagery • Esri Wayback / Copernicus
                      </span>
                    </div>
                  ) : rightImg?.imageUrl ? (
                    <div className="w-full h-full relative flex items-center justify-center p-2">
                      <img
                        src={rightImg.imageUrl}
                        alt={`Raw Satellite View ${activePlaceName} ${rightYear}`}
                        className="max-h-full max-w-full object-contain rounded-xl shadow-2xl transition-transform duration-300 hover:scale-[1.02]"
                      />
                      <div className="absolute bottom-4 right-4 px-2.5 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-700/80 text-[10px] font-telemetry text-slate-300 flex items-center space-x-2 pointer-events-none">
                        <span className="text-blue-400 font-bold">{activePlaceName} ({rightYear})</span>
                        <span className="text-slate-500">•</span>
                        <span>{rightImg.satellite}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 font-telemetry">
                      No satellite imagery pass loaded for {rightYear}.
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}



          {/* ------------------------------------------------------------- */}
          {/* MODE C: ALL-YEARS FILMSTRIP GALLERY (2020 TO 2026)            */}
          {/* ------------------------------------------------------------- */}
          {viewMode === 'gallery' && (
            <div className="h-full w-full overflow-y-auto pr-1">
              <div className="mb-2.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-telemetry font-bold text-slate-900 dark:text-white uppercase">
                    MULTI-YEAR TEMPORAL SATELLITE REEL: {activePlaceName}
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-telemetry">
                    Inspect individual raw observation passes. Click &quot;Set as Left&quot; or &quot;Set as Right&quot; to compare any pair.
                  </p>
                </div>
                <span className="text-xs font-mono text-blue-700 dark:text-cyan-400 bg-blue-50 dark:bg-cyan-500/10 px-2 py-0.5 rounded border border-blue-200 dark:border-cyan-500/30 font-bold">
                  {AVAILABLE_YEARS.length} CALIBRATED OBSERVATION YEARS
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 pb-4">
                {AVAILABLE_YEARS.map((yr) => {
                  const record = imageCache[yr];
                  const isLoading = loadingYears[yr];
                  const isLeft = leftYear === yr;
                  const isRight = rightYear === yr;

                  return (
                    <div
                      key={`gallery-${yr}`}
                      className={`flex flex-col bg-white dark:bg-[#090e1c] rounded-2xl border transition-all overflow-hidden shadow-sm ${
                        isLeft
                          ? 'ring-2 ring-emerald-500 border-emerald-500 shadow-md'
                          : isRight
                          ? 'ring-2 ring-blue-500 border-blue-500 shadow-md'
                          : 'border-slate-200 dark:border-zinc-800 hover:border-slate-400 dark:hover:border-zinc-700'
                      }`}
                    >
                      {/* Card Header */}
                      <div className="px-3 py-1.5 bg-slate-50 dark:bg-[#0d1424] border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                        <span className="text-xs font-telemetry font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                          <Calendar className="w-3 h-3 text-blue-600 dark:text-cyan-400" />
                          <span>YEAR {yr}</span>
                        </span>
                        <div className="flex items-center space-x-1">
                          {isLeft && (
                            <span className="text-[9.5px] font-bold font-telemetry px-1.5 py-0.5 rounded bg-emerald-500 text-white">
                              PASS A
                            </span>
                          )}
                          {isRight && (
                            <span className="text-[9.5px] font-bold font-telemetry px-1.5 py-0.5 rounded bg-blue-600 text-white">
                              PASS B
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Thumbnail Container */}
                      <div className="h-44 bg-slate-950 relative flex items-center justify-center overflow-hidden">
                        {isLoading ? (
                          <div className="flex flex-col items-center justify-center space-y-2 p-2 text-center">
                            <div className="w-8 h-8 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
                            <span className="text-[10.5px] font-telemetry text-slate-400">Loading {yr}...</span>
                          </div>
                        ) : record?.imageUrl ? (
                          <img
                            src={record.imageUrl}
                            alt={`Year ${yr}`}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          />
                        ) : (
                          <button
                            type="button"
                            onClick={() => ensureYearImageLoaded(yr)}
                            className="text-xs font-telemetry text-blue-400 hover:underline p-3 text-center"
                          >
                            Click to fetch {yr} pass
                          </button>
                        )}

                        {record?.imageUrl && (
                          <button
                            type="button"
                            onClick={() => handleDownloadImage(record.imageUrl, yr)}
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-700 shadow"
                            title="Download raw image"
                          >
                            <Download className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {/* Card Footer Actions */}
                      <div className="p-2 bg-slate-50 dark:bg-[#0a1020] border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-1.5">
                        <button
                          type="button"
                          onClick={() => { setLeftYear(yr); setViewMode('side-by-side'); }}
                          className={`flex-1 py-1 rounded-xl text-[10.5px] font-telemetry font-bold transition-colors ${
                            isLeft
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 hover:bg-emerald-50 dark:bg-white/5 dark:hover:bg-emerald-500/20 text-slate-700 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-emerald-300 border border-slate-200 dark:border-zinc-700'
                          }`}
                        >
                          Set Left (A)
                        </button>
                        <button
                          type="button"
                          onClick={() => { setRightYear(yr); setViewMode('side-by-side'); }}
                          className={`flex-1 py-1 rounded-xl text-[10.5px] font-telemetry font-bold transition-colors ${
                            isRight
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 hover:bg-blue-50 dark:bg-white/5 dark:hover:bg-blue-500/20 text-slate-700 hover:text-blue-700 dark:text-slate-300 dark:hover:text-blue-300 border border-slate-200 dark:border-zinc-700'
                          }`}
                        >
                          Set Right (B)
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* ======================================================================= */}
        {/* 4. BOTTOM FOOTER TELEMETRY & WORKSPACE SYNC LINK                        */}
        {/* ======================================================================= */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-[#0b1222] border-t border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs font-telemetry shrink-0">
          <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-400">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Left: <strong className="text-slate-900 dark:text-white">{leftYear}</strong></span>
            </span>
            <span className="text-slate-400 dark:text-slate-600">➔</span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Right: <strong className="text-slate-900 dark:text-white">{rightYear}</strong></span>
            </span>
            <span className="hidden md:inline text-slate-500">
              ({Math.abs(rightYear - leftYear)} Year Interval)
            </span>
            <span className="hidden lg:inline text-slate-400 dark:text-slate-500">
              • Sensor: Copernicus Sentinel-2 L2A / Esri High-Resolution World Imagery
            </span>
          </div>

          {onSelectCityForAnalysis && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onSelectCityForAnalysis(`Analyze ${activePlaceName} between ${leftYear} and ${rightYear}`);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-bold text-xs font-telemetry flex items-center space-x-1.5 transition-all shadow-sm"
              title="Run full AI change detection analysis on this place and timeline"
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>Launch Full AI Spectral Analysis on {activePlaceName} ({leftYear}➔{rightYear})</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
