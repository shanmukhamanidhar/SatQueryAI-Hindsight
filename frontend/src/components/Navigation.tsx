import React, { useState } from 'react';
import { 
  Globe2, 
  Search, 
  Sparkles, 
  Sliders, 
  FileText, 
  Activity, 
  ShieldCheck, 
  Compass, 
  Menu, 
  X, 
  Layers,
  Radio,
  ArrowRight,
  Satellite,
  Sun,
  Moon,
  Upload,
  Brain,
  Database,
  User as UserIcon
} from 'lucide-react';
import { SatQueryLogo } from './SatQueryLogo';
import { LanguageSelector } from './LanguageSelector';
import { useLanguage } from '../i18n/LanguageContext';
import { AnalysisContext } from '../lib/types';

interface NavigationProps {
  currentView: 'home' | 'studio' | 'upload';
  setCurrentView: (view: 'home' | 'studio' | 'upload') => void;
  onSearch: (query: string) => void;
  isAnalyzing: boolean;
  activeContext: AnalysisContext | null;
  expertMode: boolean;
  setExpertMode: (val: boolean) => void;
  onOpenReport: () => void;
  onOpenProvenance: () => void;
  onOpenRawSatellite?: () => void;
  onRunDemo?: () => void;
  onOpenMemoryInspector?: () => void;
  onOpenHistory?: () => void;
  onRunJudgeDemo?: () => void;
  currentUser?: any;
  onOpenAuth?: () => void;
  onScrollToSection?: (sectionId: string) => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onOpenIndiaOverview?: () => void;
  onOpenStory?: () => void;
  onOpenAlerts?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentView,
  setCurrentView,
  onSearch,
  isAnalyzing,
  activeContext,
  expertMode,
  setExpertMode,
  onOpenReport,
  onOpenProvenance,
  onOpenRawSatellite,
  onRunDemo,
  onOpenMemoryInspector,
  onOpenHistory,
  onRunJudgeDemo,
  currentUser,
  onOpenAuth,
  onScrollToSection,
  theme = 'light',
  onToggleTheme,
  onOpenIndiaOverview,
  onOpenStory,
  onOpenAlerts,
}) => {
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim() && !isAnalyzing) {
      onSearch(searchInput.trim());
    }
  };

  const navItems = [
    { id: 'home', label: t('nav.home', 'Home'), action: () => { setCurrentView('home'); onScrollToSection?.('hero'); } },
    { id: 'live-earth', label: t('nav.studio', 'Live Studio'), action: () => { if (currentView === 'home') { onScrollToSection?.('live-earth-section'); } else { setCurrentView('studio'); } } },
    { id: 'upload-studio', label: t('nav.upload', 'Upload Studio'), action: () => { if (currentView !== 'home') setCurrentView('home'); setTimeout(() => onScrollToSection?.('upload-studio-section'), 100); } },
    { id: 'environmental', label: t('nav.environmental', 'Environmental'), action: () => { if (currentView !== 'home') setCurrentView('home'); setTimeout(() => onScrollToSection?.('environmental-section'), 100); } },
    { id: 'monitoring', label: t('nav.hotspots', 'Hotspots'), action: () => { if (currentView !== 'home') setCurrentView('home'); setTimeout(() => onScrollToSection?.('monitoring-section'), 100); } },
    { id: 'india-overview', label: t('nav.india', 'India 🇮🇳'), action: () => onOpenIndiaOverview?.() },
  ];

  const quickPrompts = [
    "Visakhapatnam, Andhra Pradesh",
    "Krishna River in Vijayawada",
    "Hyderabad, Telangana",
    "Bengaluru, Karnataka",
    "Gujarat Coast, India",
    "Mumbai, Maharashtra",
    "Delhi NCR, India",
    "Dubai, UAE",
    "Tokyo, Japan",
    "London, United Kingdom",
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-[#0c0c0e]/95 backdrop-blur-xl border-b border-slate-200 dark:border-zinc-800 transition-colors select-none">
      {/* Top Telemetry & Sensor Ticker Ribbon */}
      <div className="px-4 lg:px-8 py-1.5 bg-slate-100/90 dark:bg-zinc-950/80 border-b border-slate-200 dark:border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-slate-600 dark:text-zinc-400 overflow-x-auto no-scrollbar gap-4">
        {/* Left Side: Sensor & Active Location Status */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="flex items-center space-x-1.5 text-blue-600 dark:text-blue-400 font-semibold tracking-wider">
            <span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
            <span className="text-[10px] tracking-widest uppercase font-bold">COPERNICUS SENTINEL-2 L2A</span>
          </div>

          {activeContext && (
            <>
              <span className="text-slate-300 dark:text-zinc-700 hidden sm:inline">|</span>
              <div className="flex items-center space-x-1.5 text-slate-800 dark:text-slate-100 font-semibold">
                <Compass className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="text-blue-600 dark:text-blue-400 font-bold">{activeContext.location.name}</span>
                {activeContext.location.admin_region && !activeContext.location.name.includes(activeContext.location.admin_region) && (
                  <span className="text-slate-500 dark:text-zinc-400 hidden sm:inline">({activeContext.location.admin_region}, {activeContext.location.country})</span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right Side: Purposeful Status Badges */}
        <div className="flex items-center space-x-2.5 shrink-0 text-[10.5px]">
          {activeContext ? (
            <>
              {/* Blue: Area Hectares */}
              <div className="hidden sm:flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-blue-700 dark:text-blue-300">
                <span className="text-blue-600/70 dark:text-blue-400/70 uppercase font-semibold">AOI:</span>
                <strong>~{activeContext.total_aoi_hectares.toLocaleString()} ha</strong>
              </div>

              {/* Slate/Neutral: Dates */}
              <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-slate-200/70 dark:bg-zinc-900 border border-slate-300/80 dark:border-zinc-800 text-slate-700 dark:text-zinc-300">
                <span className="text-slate-500 uppercase">Window:</span>
                <strong>{activeContext.actual_before_date}</strong>
                <span>→</span>
                <strong className="text-blue-600 dark:text-blue-400">{activeContext.actual_after_date}</strong>
              </div>

              {/* Green: Confidence */}
              <div className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold">{activeContext.confidence.overall_score}% Conf ({activeContext.confidence.rating})</span>
              </div>

              {/* Purple: Hindsight Agent Memory Status */}
              {activeContext.memory_active && (
                <div className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-900/50 text-violet-700 dark:text-violet-300">
                  <Brain className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 animate-pulse" />
                  <span className="font-semibold">HINDSIGHT ACTIVE</span>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 font-mono text-[10.5px]">
              <Radio className="w-3 h-3 text-amber-500 animate-pulse" />
              <span className="font-medium">AWAITING LOCATION QUERY</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Navbar Bar */}
      <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-2 sm:gap-3 lg:gap-4">
        {/* Left: SatQueryAI Logo */}
        <div 
          onClick={() => { setCurrentView('home'); onScrollToSection?.('hero'); }}
          className="cursor-pointer shrink-0"
        >
          <SatQueryLogo size="md" />
        </div>

        {/* Center: In Studio Mode show full search bar, in Home mode show Nav Links */}
        {currentView === 'studio' ? (
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-sm sm:max-w-md lg:max-w-xl mx-1 sm:mx-2 min-w-0">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Ask about changes anywhere on Earth (e.g. 'What changed in Visakhapatnam?')"
                className="w-full pl-9 pr-24 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 hover:border-blue-400 dark:hover:border-blue-500 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-blue-600 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all font-sans shadow-inner"
                disabled={isAnalyzing}
              />
              <button
                type="submit"
                disabled={isAnalyzing || !searchInput.trim()}
                className="absolute right-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1 font-mono shadow-xs"
              >
                {isAnalyzing ? (
                  <>
                    <Activity className="w-3 h-3 animate-spin" />
                    <span>SCANNING</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3" />
                    <span>QUERY</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <nav className="hidden lg:flex items-center space-x-1 shrink-0">
            {navItems.map((item) => {
              const isActive = (item.id === 'home' && currentView === 'home') ||
                               (item.id === 'upload-studio' && currentView === 'upload');
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.action}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-slate-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-zinc-800/80'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        )}

        {/* Right Action Bar */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0 ml-auto">
          {/* JUDGE DEMO MODE BUTTON */}
          {onRunJudgeDemo && (
            <button
              type="button"
              onClick={onRunJudgeDemo}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-violet-600 hover:from-amber-600 hover:to-violet-700 text-white font-mono text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer animate-in fade-in"
              title="Open Judge Evaluation Workflow (Hindsight 3-step demonstration)"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>JUDGE DEMO</span>
            </button>
          )}

          {/* HINDSIGHT MEMORY BUTTON */}
          {onOpenMemoryInspector && (
            <button
              type="button"
              onClick={onOpenMemoryInspector}
              className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-violet-50 hover:bg-violet-100 dark:bg-violet-950/40 dark:hover:bg-violet-900/50 border border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 text-xs font-semibold font-mono tracking-wide transition-all shadow-xs shrink-0 cursor-pointer"
              title="Inspect Hindsight Agent Memory Banks & Experiences"
            >
              <Brain className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
              <span>MEMORY</span>
            </button>
          )}

          {/* SUPABASE HISTORY BUTTON */}
          {onOpenHistory && (
            <button
              type="button"
              onClick={onOpenHistory}
              className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-semibold font-mono tracking-wide transition-all shadow-xs shrink-0 cursor-pointer"
              title="View Supabase Persistent Analysis History"
            >
              <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>HISTORY</span>
            </button>
          )}

          {/* SUPABASE AUTH & IDENTITY BUTTON */}
          {onOpenAuth && (
            <button
              type="button"
              onClick={onOpenAuth}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-semibold font-mono tracking-wide transition-all shadow-xs shrink-0 cursor-pointer"
              title="Supabase Auth & Session Identity"
            >
              <UserIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="hidden sm:inline max-w-[85px] truncate">
                {currentUser?.email ? currentUser.email.split('@')[0] : 'GUEST / AUTH'}
              </span>
            </button>
          )}

          {/* Action buttons depending on currentView */}
          {currentView === 'home' ? (
            <>
              <button
                type="button"
                onClick={() => setCurrentView('studio')}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold font-mono tracking-wide transition-all shadow-xs flex items-center space-x-1.5 shrink-0 cursor-pointer"
                title="Launch full-screen satellite analysis studio"
              >
                <Layers className="w-3.5 h-3.5 shrink-0" />
                <span>STUDIO</span>
                <ArrowRight className="w-3 h-3 shrink-0" />
              </button>
              {activeContext && (
                <button
                  type="button"
                  onClick={onOpenReport}
                  className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-semibold transition-all shadow-xs cursor-pointer"
                  title="Download Executive Analysis Report"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>Report</span>
                </button>
              )}
            </>
          ) : currentView === 'upload' ? (
            <>
              <button
                type="button"
                onClick={() => setCurrentView('home')}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-semibold font-mono transition-all flex items-center space-x-1.5 shadow-xs shrink-0 cursor-pointer"
                title="Return to planetary overview"
              >
                <Globe2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>OVERVIEW</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentView('studio')}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold font-mono tracking-wide transition-all shadow-xs flex items-center space-x-1.5 shrink-0 cursor-pointer"
                title="Launch Live Satellite Studio"
              >
                <Layers className="w-3.5 h-3.5 shrink-0" />
                <span>STUDIO</span>
                <ArrowRight className="w-3 h-3 shrink-0" />
              </button>
            </>
          ) : (
            /* STUDIO VIEW: studio controls */
            <>
              {/* Back to Overview */}
              <button
                type="button"
                onClick={() => setCurrentView('home')}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-semibold font-mono transition-all flex items-center space-x-1.5 shadow-xs shrink-0 cursor-pointer"
                title="Return to planetary overview landing page"
              >
                <Globe2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="hidden sm:inline">OVERVIEW</span>
              </button>

              {/* Upload switch */}
              <button
                type="button"
                onClick={() => setCurrentView('upload')}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold font-mono tracking-wide transition-all shadow-xs flex items-center space-x-1.5 shrink-0 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 cursor-pointer"
                title="Upload custom satellite images for AI analysis"
              >
                <Upload className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden md:inline">UPLOAD</span>
              </button>

              {/* Simple vs Expert */}
              <div className="hidden xl:flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 text-xs shrink-0">
                <button
                  type="button"
                  onClick={() => setExpertMode(false)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    !expertMode 
                      ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 font-semibold shadow-xs' 
                      : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                  }`}
                >
                  Simple
                </button>
                <button
                  type="button"
                  onClick={() => setExpertMode(true)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center space-x-1 ${
                    expertMode 
                      ? 'bg-white dark:bg-zinc-800 text-orange-600 dark:text-orange-400 font-semibold shadow-xs' 
                      : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                  }`}
                >
                  <Sliders className="w-3 h-3" />
                  <span>Expert</span>
                </button>
              </div>

              {/* National India Overview */}
              {onOpenIndiaOverview && (
                <button
                  type="button"
                  onClick={onOpenIndiaOverview}
                  className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/40 dark:hover:bg-orange-900/50 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 text-xs font-semibold font-mono tracking-wide transition-all shadow-xs shrink-0 cursor-pointer"
                  title="Explore all 28 States & 8 UTs with National Overview & Drilldown"
                >
                  <span>🇮🇳</span>
                  <span>INDIA</span>
                </button>
              )}

              {/* Intelligence Story Trigger */}
              {onOpenStory && (
                <button
                  type="button"
                  onClick={onOpenStory}
                  disabled={!activeContext}
                  className="hidden 2xl:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold font-mono tracking-wide transition-all shadow-xs shrink-0 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  title="Read narrative intelligence story of detected changes"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>STORY</span>
                </button>
              )}

              {/* Environmental Alerts Trigger */}
              {onOpenAlerts && (
                <button
                  type="button"
                  onClick={onOpenAlerts}
                  disabled={!activeContext}
                  className="hidden 2xl:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-semibold font-mono tracking-wide transition-all shadow-xs shrink-0 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  title="Configure environmental monitoring thresholds & live alerts"
                >
                  <Activity className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>ALERTS</span>
                </button>
              )}

              {/* Provenance */}
              <button
                type="button"
                onClick={onOpenProvenance}
                disabled={!activeContext}
                className="hidden 2xl:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xs shrink-0 cursor-pointer"
                title="Inspect Data Provenance & Copernicus Scenes"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Provenance</span>
              </button>

              {/* Raw Satellite Comparison */}
              {onOpenRawSatellite && (
                <button
                  type="button"
                  onClick={onOpenRawSatellite}
                  className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold font-mono tracking-wide transition-all shadow-xs shrink-0 cursor-pointer"
                  title="Compare raw optical satellite images side-by-side"
                >
                  <Satellite className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>RAW</span>
                </button>
              )}

              {/* PDF Report Trigger */}
              <button
                type="button"
                onClick={onOpenReport}
                disabled={!activeContext}
                className="shrink-0 flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Download Executive Analysis Report"
              >
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span className="font-sans font-semibold">{t('nav.report', 'Report')}</span>
              </button>
            </>
          )}

          {/* LANGUAGE SELECTOR */}
          <LanguageSelector variant="header" />

          {/* THEME TOGGLE (Placed cleanly at far right as an icon button) */}
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              className="p-2 rounded-lg border text-xs transition-all shadow-xs bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200 shrink-0 cursor-pointer flex items-center justify-center"
              title={theme === 'dark' ? 'Switch to Clean White Theme (Light)' : 'Switch to Deep Black Theme (Dark)'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 shrink-0" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 dark:text-zinc-300 shrink-0" />
              )}
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 shrink-0 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Quick Prompts Strip in Studio Mode */}
      {currentView === 'studio' && (
        <div className="px-4 lg:px-8 py-1.5 bg-slate-50 dark:bg-zinc-950/90 border-t border-slate-200 dark:border-zinc-800 flex items-center space-x-2 overflow-x-auto text-[11px] no-scrollbar">
          <span className="text-slate-500 dark:text-zinc-500 font-mono uppercase tracking-wider flex items-center space-x-1 shrink-0">
            <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            <span>Quick Intel:</span>
          </span>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSearch(p)}
              disabled={isAnalyzing}
              className="shrink-0 px-2.5 py-0.5 rounded-full bg-white dark:bg-zinc-900 hover:bg-blue-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 text-xs transition-colors font-sans shadow-xs"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 py-4 bg-white dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 space-y-3 font-sans animate-in slide-in-from-top-2 duration-150 shadow-lg">
          <div className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  item.action();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 font-medium"
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setCurrentView(currentView === 'home' ? 'studio' : 'home');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40"
            >
              {currentView === 'home' ? 'Switch to Studio Workspace' : 'Switch to Planetary Overview'}
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentView('upload');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-purple-600 dark:text-purple-400 font-bold bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/40 flex items-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Mode (Analyze Custom Images)</span>
            </button>
            {onOpenIndiaOverview && (
              <button
                type="button"
                onClick={() => {
                  onOpenIndiaOverview();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-orange-600 dark:text-orange-400 font-bold bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/40 flex items-center space-x-2"
              >
                <span>🇮🇳</span>
                <span>India Overview (28 States & 8 UTs)</span>
              </button>
            )}
            {onOpenStory && activeContext && (
              <button
                type="button"
                onClick={() => {
                  onOpenStory();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Satellite Intelligence Story</span>
              </button>
            )}
            {onOpenAlerts && activeContext && (
              <button
                type="button"
                onClick={() => {
                  onOpenAlerts();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 flex items-center space-x-2"
              >
                <Activity className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Environmental Alerts & Monitoring</span>
              </button>
            )}
            {onOpenRawSatellite && (
              <button
                type="button"
                onClick={() => {
                  onOpenRawSatellite();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/40 flex items-center space-x-2"
              >
                <Satellite className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Raw Satellite Timeline (Side-by-Side)</span>
              </button>
            )}

            {onRunJudgeDemo && (
              <button
                type="button"
                onClick={() => {
                  onRunJudgeDemo();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-white font-bold bg-gradient-to-r from-amber-500 to-violet-600 flex items-center space-x-2 shadow-xs"
              >
                <Sparkles className="w-4 h-4" />
                <span>Judge Evaluation Demo (3-Step Hindsight)</span>
              </button>
            )}

            {onOpenMemoryInspector && (
              <button
                type="button"
                onClick={() => {
                  onOpenMemoryInspector();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-violet-700 dark:text-violet-300 font-bold bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-900/40 flex items-center space-x-2"
              >
                <Brain className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                <span>Inspect Hindsight Memory Bank</span>
              </button>
            )}

            {onOpenHistory && (
              <button
                type="button"
                onClick={() => {
                  onOpenHistory();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 flex items-center space-x-2"
              >
                <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Supabase Analysis History</span>
              </button>
            )}
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 flex flex-col gap-2">
            <LanguageSelector variant="mobile" />
            {onToggleTheme && (
              <button
                type="button"
                onClick={() => {
                  onToggleTheme();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 px-3 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-semibold flex items-center justify-center space-x-2 cursor-pointer"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>Switch to Light Theme</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-slate-700 dark:text-zinc-300" />
                    <span>Switch to Dark Theme</span>
                  </>
                )}
              </button>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onOpenProvenance();
                  setMobileMenuOpen(false);
                }}
                disabled={!activeContext}
                className="flex-1 py-2 px-3 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-medium flex items-center justify-center space-x-1.5 disabled:opacity-40"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Provenance</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onOpenReport();
                  setMobileMenuOpen(false);
                }}
                disabled={!activeContext}
                className="flex-1 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 disabled:opacity-40 shadow-xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Report</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
