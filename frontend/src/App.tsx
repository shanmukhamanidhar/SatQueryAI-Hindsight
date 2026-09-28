import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  MapPin, 
  Globe2, 
  ChevronRight, 
  ChevronLeft,
  Bot, 
  BarChart3, 
  Compass, 
  Radio, 
  Sparkles, 
  Sliders, 
  Layers, 
  ArrowRight, 
  Clock,
  Maximize2,
  Minimize2,
  Satellite,
  Upload
} from 'lucide-react';
import { AnalysisContext, ChangeRegion } from './lib/types';
import { runAnalysis, getYearSatelliteImage, fetchAnalysisById } from './lib/api';
import { getOrCreateLocalUserId, getCurrentUser, onAuthStateChange } from './lib/supabase';
import { User } from '@supabase/supabase-js';
import { Navigation } from './components/Navigation';
import { HeroSection } from './components/HeroSection';
import { FeaturePanels } from './components/FeaturePanels';
import { EnvironmentalExploration } from './components/EnvironmentalExploration';
import { DisasterMonitoring } from './components/DisasterMonitoring';
import { CitySelector } from './components/CitySelector';
import { PurposeSection } from './components/PurposeSection';
import { Footer } from './components/Footer';
import { MapViewer } from './components/MapViewer';
import { ChatAnalyst } from './components/ChatAnalyst';
import { SummaryCard } from './components/SummaryCard';
import { ExpertPanel } from './components/ExpertPanel';
import { TimeMachine } from './components/TimeMachine';
import { ChangeInspector } from './components/ChangeInspector';
import { ExplainMapModal } from './components/ExplainMapModal';
import { ProvenanceModal } from './components/ProvenanceModal';
import { ReportModal } from './components/ReportModal';
import { RawSatelliteModal } from './components/RawSatelliteModal';
import { UploadStudio } from './components/UploadStudio';
import { IndiaOverviewModal } from './components/IndiaOverviewModal';
import { IntelligenceStoryModal } from './components/IntelligenceStoryModal';
import { EnvironmentalMonitorModal } from './components/EnvironmentalMonitorModal';
import { QueryAnalysisPanel } from './components/QueryAnalysisPanel';
import { MemoryInspectorModal } from './components/MemoryInspectorModal';
import { AnalysisHistoryModal } from './components/AnalysisHistoryModal';
import { JudgeDemoModal } from './components/JudgeDemoModal';
import { AuthModal } from './components/AuthModal';

export const App: React.FC = () => {
  // Theme State: 'light' (default) or 'dark'
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('satquery-theme');
      return saved === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  // Keep documentElement classList synchronized with theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('satquery-theme', theme);
    } catch (e) {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Navigation View State: 'home' for cinematic landing experience, 'studio' for full-screen analysis control room, 'upload' for custom imagery
  const [currentView, setCurrentView] = useState<'home' | 'studio' | 'upload'>('home');

  // Analysis State
  const [context, setContext] = useState<AnalysisContext | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentStage, setCurrentStage] = useState<number>(0);

  // Modes & Modals
  const [expertMode, setExpertMode] = useState<boolean>(false);
  const [selectedRegion, setSelectedRegion] = useState<ChangeRegion | null>(null);
  const [showExplainMap, setShowExplainMap] = useState<boolean>(false);
  const [showProvenance, setShowProvenance] = useState<boolean>(false);
  const [showReport, setShowReport] = useState<boolean>(false);
  const [showIndiaOverview, setShowIndiaOverview] = useState<boolean>(false);
  const [showIntelligenceStory, setShowIntelligenceStory] = useState<boolean>(false);
  const [showEnvironmentalMonitor, setShowEnvironmentalMonitor] = useState<boolean>(false);

  // Hindsight Agent Memory, Supabase Auth & History Modals
  const [showMemoryInspector, setShowMemoryInspector] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [showJudgeDemoModal, setShowJudgeDemoModal] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [guestUserId] = useState<string>(() => getOrCreateLocalUserId());

  const currentUserId = currentUser?.id || guestUserId;

  useEffect(() => {
    getCurrentUser().then(u => {
      if (u) setCurrentUser(u);
    });
    const unsubscribe = onAuthStateChange((u) => {
      setCurrentUser(u);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Map Filter, Highlights & Zoom Target from Chat
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [highlightedRegionIds, setHighlightedRegionIds] = useState<string[] | null>(null);
  const [zoomTarget, setZoomTarget] = useState<[number, number, number] | null>(null);

  // From and To Yearly Satellite Image Selector State (e.g. 2020 to 2026)
  const [fromYear, setFromYear] = useState<number | null>(null);
  const [toYear, setToYear] = useState<number | null>(null);
  const [fromImageData, setFromImageData] = useState<{
    year: number;
    date: string;
    imageUrl: string;
  } | null>(null);
  const [toImageData, setToImageData] = useState<{
    year: number;
    date: string;
    imageUrl: string;
  } | null>(null);
  const [isLoadingFromYear, setIsLoadingFromYear] = useState<boolean>(false);
  const [isLoadingToYear, setIsLoadingToYear] = useState<boolean>(false);

  const handleSelectFromYear = async (year: number | null) => {
    if (year === null || !context) {
      setFromYear(null);
      setFromImageData(null);
      return;
    }

    setFromYear(year);
    setIsLoadingFromYear(true);
    try {
      const data = await getYearSatelliteImage({
        analysis_id: context.analysis_id,
        bbox: context.location.bounding_box,
        year,
      });
      setFromImageData({
        year: data.year,
        date: data.date,
        imageUrl: data.image_url,
      });
    } catch (err) {
      console.error('Failed to load From satellite image for year:', err);
    } finally {
      setIsLoadingFromYear(false);
    }
  };

  const handleSelectToYear = async (year: number | null) => {
    if (year === null || !context) {
      setToYear(null);
      setToImageData(null);
      return;
    }

    setToYear(year);
    setIsLoadingToYear(true);
    try {
      const data = await getYearSatelliteImage({
        analysis_id: context.analysis_id,
        bbox: context.location.bounding_box,
        year,
      });
      setToImageData({
        year: data.year,
        date: data.date,
        imageUrl: data.image_url,
      });
    } catch (err) {
      console.error('Failed to load To satellite image for year:', err);
    } finally {
      setIsLoadingToYear(false);
    }
  };

  const handleResetYears = () => {
    setFromYear(null);
    setToYear(null);
    setFromImageData(null);
    setToImageData(null);
  };

  // Collapsible Sidebars & Maximize Map Viewport State
  const [leftSidebarOpen, setLeftSidebarOpen] = useState<boolean>(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState<boolean>(false);
  const [isMapMaximized, setIsMapMaximized] = useState<boolean>(false);
  const [timeDrawerOpen, setTimeDrawerOpen] = useState<boolean>(false);
  const [showRawSatelliteModal, setShowRawSatelliteModal] = useState<boolean>(false);
  const [selectedHotspotCityId, setSelectedHotspotCityId] = useState<string>('visakhapatnam');

  // Trigger map resize on layout changes
  useEffect(() => {
    const t1 = setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
    const t2 = setTimeout(() => window.dispatchEvent(new Event('resize')), 250);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [currentView, isMapMaximized, leftSidebarOpen, rightSidebarOpen]);

  const handleToggleMaximizeMap = () => {
    const next = !isMapMaximized;
    setIsMapMaximized(next);
    if (next) {
      setLeftSidebarOpen(false);
      setRightSidebarOpen(false);
    }
  };

  // Exit maximized map mode or fullscreen studio on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isMapMaximized) {
          setIsMapMaximized(false);
        } else if (currentView === 'studio' || currentView === 'upload') {
          setCurrentView('home');
        }
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isMapMaximized, currentView]);

  // Sync browser Fullscreen API state changes
  useEffect(() => {
    const handleFsChange = () => {
      if (!document.fullscreenElement && isMapMaximized) {
        setIsMapMaximized(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, [isMapMaximized]);

  // Mobile layout tab switcher
  const [mobileTab, setMobileTab] = useState<'map' | 'chat' | 'summary'>('map');

  // Multi-step progress pipeline
  const stages = [
    "Resolving location and geospatial bounding box...",
    "Querying Copernicus Sentinel-2 open STAC catalogue...",
    "Filtering atmospheric clouds & selecting optimal observation passes...",
    "Streaming multi-spectral bands (Red, Green, Blue, NIR, SWIR)...",
    "Computing scientific indices (NDVI, NDWI, NDBI)...",
    "Running morphological change detection & vector cluster extraction...",
    "Calculating hectares transition matrix & rate of change...",
    "Synthesizing Gemini AI geospatial intelligence & evidence summary...",
    "Analysis complete!"
  ];

  // Request ID ref to prevent asynchronous race conditions from overwriting active location
  const activeRequestIdRef = useRef<number>(0);

  // Natural language query tracking
  const [lastQuery, setLastQuery] = useState<string>("Analyze Visakhapatnam between 2021 and 2026");

  // Initial load: run default analysis for Visakhapatnam to showcase immediate live capability
  useEffect(() => {
    handleSearch("Analyze Visakhapatnam between 2021 and 2026");
  }, []);

  const handleSearch = async (
    query: string,
    options?: {
      smoothScroll?: boolean;
    }
  ) => {
    setLastQuery(query);
    const reqId = ++activeRequestIdRef.current;
    setIsAnalyzing(true);
    setErrorMessage(null);
    setCurrentStage(0);
    setSelectedRegion(null);
    setActiveFilter(null);
    setHighlightedRegionIds(null);
    setZoomTarget(null);
    setFromYear(null);
    setToYear(null);
    setFromImageData(null);
    setToImageData(null);

    if (options?.smoothScroll) {
      setTimeout(() => {
        const el = document.getElementById('live-earth-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }

    // Simulate progressive telemetry stages while backend processes
    const timer1 = setTimeout(() => { if (reqId === activeRequestIdRef.current) setCurrentStage(1); }, 700);
    const timer2 = setTimeout(() => { if (reqId === activeRequestIdRef.current) setCurrentStage(2); }, 1600);
    const timer3 = setTimeout(() => { if (reqId === activeRequestIdRef.current) setCurrentStage(3); }, 2600);
    const timer4 = setTimeout(() => { if (reqId === activeRequestIdRef.current) setCurrentStage(4); }, 3800);
    const timer5 = setTimeout(() => { if (reqId === activeRequestIdRef.current) setCurrentStage(5); }, 4800);
    const timer6 = setTimeout(() => { if (reqId === activeRequestIdRef.current) setCurrentStage(6); }, 5600);
    const timer7 = setTimeout(() => { if (reqId === activeRequestIdRef.current) setCurrentStage(7); }, 6400);

    try {
      const prevLoc = context?.location?.name;
      const prevStart = context?.actual_before_date ? parseInt(context.actual_before_date.slice(0, 4)) : undefined;
      const prevEnd = context?.actual_after_date ? parseInt(context.actual_after_date.slice(0, 4)) : undefined;

      const res = await runAnalysis({
        query,
        previous_location: prevLoc,
        previous_start_year: prevStart,
        previous_end_year: prevEnd,
        user_id: currentUserId,
      });
      if (reqId !== activeRequestIdRef.current) {
        console.warn(`[App] Stale response #${reqId} discarded in favor of #${activeRequestIdRef.current}`);
        return;
      }
      setCurrentStage(8);
      setTimeout(() => {
        if (reqId === activeRequestIdRef.current) {
          setContext(res);
          setIsAnalyzing(false);
        }
      }, 400);
    } catch (err: any) {
      if (reqId === activeRequestIdRef.current) {
        setErrorMessage(err.message || 'Analysis could not be completed.');
        setIsAnalyzing(false);
      }
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
      clearTimeout(timer6);
      clearTimeout(timer7);
    }
  };

  // Load a historical analysis record retrieved from Supabase
  const handleLoadAnalysisFromHistory = async (analysisId: string) => {
    try {
      setIsAnalyzing(true);
      const loaded = await fetchAnalysisById(analysisId);
      setContext(loaded);
      setLastQuery(loaded.query);
      setShowHistoryModal(false);
      handleScrollToSection('live-earth-section');
    } catch (err: any) {
      setErrorMessage(`Failed to load historical analysis: ${err.message || err}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Autonomous Earth Observation Walkthrough Tour
  const handleDemoWalkthrough = async () => {
    await handleSearch("Analyze Visakhapatnam between 2021 and 2026");
    setTimeout(() => {
      if (context && context.change_regions.length > 0) {
        const topUrban = context.change_regions.find(r => r.category.includes('Urban')) || context.change_regions[0];
        setSelectedRegion(topUrban);
        setHighlightedRegionIds([topUrban.id]);
        setZoomTarget([topUrban.centroid[0], topUrban.centroid[1], 14.2]);
      }
    }, 1500);
  };

  const handleAnalyzeCustomAoi = async (geometry: any, areaHa: number) => {
    const reqId = ++activeRequestIdRef.current;
    setIsAnalyzing(true);
    setErrorMessage(null);
    setCurrentStage(0);
    setSelectedRegion(null);
    setActiveFilter(null);
    setHighlightedRegionIds(null);
    setZoomTarget(null);
    setFromYear(null);
    setToYear(null);
    setFromImageData(null);
    setToImageData(null);

    const timer1 = setTimeout(() => { if (reqId === activeRequestIdRef.current) setCurrentStage(1); }, 700);
    const timer2 = setTimeout(() => { if (reqId === activeRequestIdRef.current) setCurrentStage(3); }, 1800);
    const timer3 = setTimeout(() => { if (reqId === activeRequestIdRef.current) setCurrentStage(5); }, 3200);
    const timer4 = setTimeout(() => { if (reqId === activeRequestIdRef.current) setCurrentStage(7); }, 4800);

    try {
      const targetLoc = context?.location?.name || 'Drawn Area of Interest';
      const res = await runAnalysis({
        query: `Analyze region around ${targetLoc} (~${Math.round(areaHa)} ha)`,
        location: targetLoc,
        aoi_geojson: geometry,
        user_id: currentUserId,
      });
      if (reqId !== activeRequestIdRef.current) {
        console.warn(`[App] Stale custom AOI response #${reqId} discarded`);
        return;
      }
      setCurrentStage(8);
      setTimeout(() => {
        if (reqId === activeRequestIdRef.current) {
          setContext(res);
          setIsAnalyzing(false);
        }
      }, 400);
    } catch (err: any) {
      if (reqId === activeRequestIdRef.current) {
        setErrorMessage(err.message || 'Custom AOI analysis could not be completed.');
        setIsAnalyzing(false);
      }
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    }
  };

  const handleScrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Strictly controlled hotspot/region selection:
  // SELECTED LOCATION !== SELECTED HOTSPOT rule:
  // Clicking a hotspot selects and zooms to that hotspot strictly within the CURRENT active location.
  // It NEVER alters or changes the user's selected location.
  const handleSelectRegion = (region: ChangeRegion | null) => {
    if (!region) {
      setSelectedRegion(null);
      setZoomTarget(null);
      return;
    }

    // Geographically validate that hotspot centroid lies within the active location bounding box
    if (context?.location?.bounding_box && region.centroid) {
      const [w, s, e, n] = context.location.bounding_box;
      const [lon, lat] = region.centroid;
      const pad = 0.08;
      if (lon < w - pad || lon > e + pad || lat < s - pad || lat > n + pad) {
        console.warn('[App] Blocked foreign hotspot selection outside active location bounds:', region);
        return;
      }
    }

    setSelectedRegion(region);
    // Keep zoomTarget synchronized to this exact region so old stale coords never trigger
    setZoomTarget([region.centroid[0], region.centroid[1], 14.2]);
  };

  const handleSelectHotspot = (region: ChangeRegion) => {
    handleSelectRegion(region);
    if (region?.id) {
      setHighlightedRegionIds([region.id]);
    }
    if (currentView === 'home') {
      handleScrollToSection('live-earth-section');
    }
  };

  const handleSelectCategory = (categoryQuery: string, filterName?: string) => {
    if (filterName) {
      setActiveFilter(filterName);
      if (context?.change_regions && context.change_regions.length > 0) {
        const matchingHotspot = context.change_regions.find(r => 
          r.category.toLowerCase().includes(filterName.toLowerCase()) || 
          r.user_label.toLowerCase().includes(filterName.toLowerCase())
        );
        if (matchingHotspot) {
          handleSelectRegion(matchingHotspot);
          setHighlightedRegionIds([matchingHotspot.id]);
        }
      }
    } else if (!context) {
      handleSearch(categoryQuery);
    }
  };

  // Reusable Studio Workspace component used both full-screen and embedded in the Home View
  const renderStudioWorkspace = (isFullscreen: boolean) => (
    <div className={`flex flex-col lg:flex-row overflow-hidden relative ${
      isFullscreen 
        ? 'h-full w-full bg-slate-50 dark:bg-zinc-950' 
        : isMapMaximized 
          ? 'fixed inset-0 z-50 h-screen w-screen bg-black' 
          : 'h-[750px] w-full rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl'
    }`}>
      {/* Left Column: AI Analyst Chat (Hidden when isMapMaximized) */}
      {!isMapMaximized && (
        leftSidebarOpen ? (
          <div className={`w-full lg:w-72 xl:w-80 h-full shrink-0 relative transition-all duration-200 ${mobileTab === 'chat' ? 'flex' : 'hidden lg:flex'}`}>
            <ChatAnalyst
              context={context}
              onFilterCategory={setActiveFilter}
              onHighlightRegions={setHighlightedRegionIds}
              onSelectRegion={handleSelectRegion}
              onZoomTo={setZoomTarget}
            />
            {/* Collapse button */}
            <button
              type="button"
              onClick={() => setLeftSidebarOpen(false)}
              className="absolute top-3 -right-3 z-30 h-6 w-6 rounded-full bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center shadow-lg transition-all"
              title="Collapse AI Chat (Expand map)"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="hidden lg:flex flex-col items-center py-3 px-1 bg-slate-50/90 dark:bg-zinc-950/90 border-r border-slate-200 dark:border-zinc-800 shrink-0 z-20">
            <button
              type="button"
              onClick={() => setLeftSidebarOpen(true)}
              className="px-2 py-3 rounded-xl bg-white dark:bg-zinc-900 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-zinc-800 transition-all flex flex-col items-center space-y-2 group shadow-sm"
              title="Open AI Analyst Chat"
            >
              <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-mono uppercase tracking-wider [writing-mode:vertical-lr] font-bold">
                AI CHAT
              </span>
            </button>
          </div>
        )
      )}

      {/* Center Column: Interactive Global Map + TimeMachine */}
      <div className={`flex-1 min-w-0 flex flex-col h-full relative ${mobileTab === 'map' ? 'flex' : 'hidden lg:flex'}`}>
        {/* Map Viewer */}
        <div className="flex-1 relative w-full h-full min-w-0">
          <MapViewer
            context={context}
            selectedRegion={selectedRegion}
            onSelectRegion={handleSelectRegion}
            onExplainMap={() => setShowExplainMap(true)}
            filteredCategory={activeFilter}
            highlightedRegionIds={highlightedRegionIds}
            zoomTarget={zoomTarget}
            onFilterCategory={setActiveFilter}
            fromYear={fromYear}
            toYear={toYear}
            fromImageData={fromImageData}
            toImageData={toImageData}
            isLoadingFromYear={isLoadingFromYear}
            isLoadingToYear={isLoadingToYear}
            onSelectFromYear={handleSelectFromYear}
            onSelectToYear={handleSelectToYear}
            onResetYears={handleResetYears}
            isMapMaximized={isMapMaximized}
            onToggleMaximizeMap={handleToggleMaximizeMap}
            timeDrawerOpen={timeDrawerOpen}
            onToggleTimeDrawer={() => setTimeDrawerOpen(!timeDrawerOpen)}
            onOpenRawSatelliteModal={() => setShowRawSatelliteModal(true)}
            theme={theme}
            onSelectLocation={handleSearch}
            isAnalyzing={isAnalyzing}
            onAnalyzeCustomAoi={handleAnalyzeCustomAoi}
          />

          {/* Change Region Inspector Modal */}
          {selectedRegion && (
            <ChangeInspector
              region={selectedRegion}
              context={context}
              onClose={() => setSelectedRegion(null)}
            />
          )}

          {/* Expert Mode Panel Drawer */}
          {expertMode && context && (
            <ExpertPanel
              context={context}
              onClose={() => setExpertMode(false)}
            />
          )}
        </div>

        {/* Bottom Time Machine Drawer with Dual From / To Yearly Satellite Selector */}
        {context && timeDrawerOpen && (
          <div className="shrink-0 animate-in slide-in-from-bottom-4 duration-200">
            <TimeMachine
              timeline={context.timeline}
              fromYear={fromYear}
              toYear={toYear}
              fromImageData={fromImageData}
              toImageData={toImageData}
              isLoadingFromYear={isLoadingFromYear}
              isLoadingToYear={isLoadingToYear}
              onSelectFromYear={handleSelectFromYear}
              onSelectToYear={handleSelectToYear}
              onResetYears={handleResetYears}
              onClose={() => setTimeDrawerOpen(false)}
              defaultBeforeYear={context.actual_before_date ? parseInt(context.actual_before_date.slice(0, 4)) : 2021}
              defaultAfterYear={context.actual_after_date ? parseInt(context.actual_after_date.slice(0, 4)) : 2026}
            />
          </div>
        )}
      </div>

      {/* Right Column: Simple Summary / Inspector (Hidden when isMapMaximized) */}
      {!isMapMaximized && (
        rightSidebarOpen ? (
          <div className={`w-full lg:w-72 xl:w-80 h-full shrink-0 relative transition-all duration-200 ${mobileTab === 'summary' ? 'flex' : 'hidden lg:flex'}`}>
            <button
              type="button"
              onClick={() => setRightSidebarOpen(false)}
              className="absolute top-3 -left-3 z-30 h-6 w-6 rounded-full bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center shadow-lg transition-all"
              title="Collapse Summary (Expand map)"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            {context ? (
              <SummaryCard
                context={context}
                onFilterCategory={setActiveFilter}
                activeFilter={activeFilter}
                onSelectRegion={handleSelectRegion}
                onOpenProvenance={() => setShowProvenance(true)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center text-slate-500 font-mono text-xs space-y-2">
                <Radio className="w-8 h-8 text-slate-400 dark:text-slate-600 animate-pulse" />
                <p>Awaiting Earth observation search command...</p>
              </div>
            )}
          </div>
        ) : (
          <div className="hidden lg:flex flex-col items-center py-3 px-1 bg-slate-50/90 dark:bg-zinc-950/90 border-l border-slate-200 dark:border-zinc-800 shrink-0 z-20">
            <button
              type="button"
              onClick={() => setRightSidebarOpen(true)}
              className="px-2 py-3 rounded-xl bg-white dark:bg-zinc-900 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-zinc-800 transition-all flex flex-col items-center space-y-2 group shadow-sm"
              title="Open Metrics Summary"
            >
              <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-mono uppercase tracking-wider [writing-mode:vertical-lr] font-bold">
                SUMMARY
              </span>
            </button>
          </div>
        )
      )}

      {/* Mobile Navigation Tabs (visible only on mobile screens) */}
      <div className="lg:hidden flex border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-mono z-30">
        <button
          type="button"
          onClick={() => setMobileTab('chat')}
          className={`flex-1 py-3 text-center transition-colors ${mobileTab === 'chat' ? 'text-blue-600 dark:text-blue-400 border-t-2 border-blue-600 dark:border-blue-400 font-bold bg-slate-50 dark:bg-zinc-900' : 'text-slate-500 dark:text-slate-400'}`}
        >
          AI Analyst
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('map')}
          className={`flex-1 py-3 text-center transition-colors ${mobileTab === 'map' ? 'text-blue-600 dark:text-blue-400 border-t-2 border-blue-600 dark:border-blue-400 font-bold bg-slate-50 dark:bg-zinc-900' : 'text-slate-500 dark:text-slate-400'}`}
        >
          Map View
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('summary')}
          className={`flex-1 py-3 text-center transition-colors ${mobileTab === 'summary' ? 'text-blue-600 dark:text-blue-400 border-t-2 border-blue-600 dark:border-blue-400 font-bold bg-slate-50 dark:bg-zinc-900' : 'text-slate-500 dark:text-slate-400'}`}
        >
          Summary
        </button>
      </div>
    </div>
  );

  return (
    <div className={`${currentView === 'studio' ? 'h-screen overflow-hidden' : 'min-h-screen'} w-full max-w-full overflow-x-hidden bg-white dark:bg-[#09090b] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 flex flex-col`}>
      {/* Unified Top Navigation */}
      <Navigation
        currentView={currentView}
        setCurrentView={setCurrentView}
        onSearch={handleSearch}
        isAnalyzing={isAnalyzing}
        activeContext={context}
        expertMode={expertMode}
        setExpertMode={setExpertMode}
        onOpenReport={() => setShowReport(true)}
        onOpenProvenance={() => setShowProvenance(true)}
        onOpenRawSatellite={() => setShowRawSatelliteModal(true)}
        onRunDemo={handleDemoWalkthrough}
        onOpenMemoryInspector={() => setShowMemoryInspector(true)}
        onOpenHistory={() => setShowHistoryModal(true)}
        onRunJudgeDemo={() => setShowJudgeDemoModal(true)}
        currentUser={currentUser}
        onOpenAuth={() => setShowAuthModal(true)}
        onScrollToSection={handleScrollToSection}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenIndiaOverview={() => setShowIndiaOverview(true)}
        onOpenStory={() => setShowIntelligenceStory(true)}
        onOpenAlerts={() => setShowEnvironmentalMonitor(true)}
      />

      {/* VIEW MODE 1: CINEMATIC HOME / LANDING PAGE */}
      {currentView === 'home' && (
        <main className="flex-1 flex flex-col">
          {/* Hero Section */}
          <HeroSection
            onSearch={(q) => handleSearch(q, { smoothScroll: true })}
            isAnalyzing={isAnalyzing}
            activeContext={context}
            onRunDemo={handleDemoWalkthrough}
            onExploreClick={() => handleScrollToSection('live-earth-section')}
          />

          {/* Feature Capabilities Panels */}
          <FeaturePanels
            onSelectFeature={(featId) => {
              if (featId === 'monitor') {
                setMobileTab('map');
                handleScrollToSection('live-earth-section');
              } else if (featId === 'explore') {
                handleScrollToSection('live-earth-section');
                setShowProvenance(true);
              } else if (featId === 'analyze') {
                handleScrollToSection('environmental-section');
              } else if (featId === 'ai') {
                setLeftSidebarOpen(true);
                setMobileTab('chat');
                handleScrollToSection('live-earth-section');
                setTimeout(() => {
                  const inputEl = document.getElementById('chat-analyst-input');
                  inputEl?.focus();
                }, 350);
              }
            }}
          />

          {/* Interactive Live Earth Section */}
          <section id="live-earth-section" className="scroll-mt-20 py-16 bg-slate-50/70 dark:bg-zinc-950/80 border-b border-slate-200 dark:border-zinc-800 relative">
            <div className="max-w-7xl mx-auto px-4 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                  <div className="inline-flex items-center space-x-2 text-[11px] font-mono text-blue-600 dark:text-blue-400 uppercase tracking-widest font-semibold mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>INTERACTIVE OBSERVATION WORKSPACE</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Live Planetary Satellite Studio
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Direct multispectral examination of {context ? context.location.name : 'planetary locations'} with swipe comparison, vector polygons, and Gemini AI synthesis.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleScrollToSection('upload-studio-section')}
                    className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/50 border border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 text-xs font-mono font-bold transition-all shadow-sm flex items-center space-x-2 cursor-pointer"
                    title="Upload and analyze custom satellite rasters"
                  >
                    <Upload className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span>UPLOAD STUDIO</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowRawSatelliteModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 border border-blue-300 dark:border-blue-500/40 text-blue-700 dark:text-blue-300 text-xs font-mono font-bold transition-all shadow-sm flex items-center space-x-2"
                    title="Open Raw Satellite Timeline Studio: Side-by-side pure optical satellite imagery with timeline choice"
                  >
                    <Satellite className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-pulse" />
                    <span>RAW SATELLITE (SIDE-BY-SIDE)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentView('studio')}
                    aria-label="Maximize map"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-mono font-bold transition-all shadow-md flex items-center space-x-2 cursor-pointer"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>EXPAND FULLSCREEN STUDIO</span>
                  </button>
                </div>
              </div>

              {/* Multi-City / Location Selection Options */}
              <CitySelector
                activeLocationName={context?.location.name}
                onSelectCity={(cityQuery) => handleSearch(cityQuery, { smoothScroll: false })}
                isAnalyzing={isAnalyzing}
                onOpenRawSatellite={() => setShowRawSatelliteModal(true)}
              />

              {/* Embedded Live Earth Workspace */}
              {renderStudioWorkspace(false)}

              {/* Dedicated SatQuery Intelligence / NL Query Result Panel */}
              <QueryAnalysisPanel
                context={context}
                activeQuery={lastQuery}
                isAnalyzing={isAnalyzing}
                onFollowUpQuery={(q) => handleSearch(q, { smoothScroll: false })}
                onOpenProvenance={() => setShowProvenance(true)}
                onOpenTimeMachine={() => setTimeDrawerOpen(true)}
                onOpenRawSatellite={() => setShowRawSatelliteModal(true)}
                onFilterCategory={(cat) => setActiveFilter(cat)}
                activeFilter={activeFilter}
                onOpenMemoryInspector={() => setShowMemoryInspector(true)}
                onOpenHistory={() => setShowHistoryModal(true)}
              />
            </div>
          </section>

          {/* Dedicated Satellite Imagery Upload Studio Section */}
          <section id="upload-studio-section" className="scroll-mt-20 py-12 bg-white dark:bg-zinc-900/40 border-b border-slate-200 dark:border-zinc-800 relative">
            <div className="max-w-7xl mx-auto px-4 lg:px-8">
              <UploadStudio
                onClose={() => handleScrollToSection('live-earth-section')}
                onOpenLiveStudio={() => {
                  handleScrollToSection('live-earth-section');
                }}
              />
            </div>
          </section>

          {/* Environmental Exploration */}
          <EnvironmentalExploration 
            context={context}
            onSelectCategory={handleSelectCategory}
            onSelectRegion={handleSelectRegion}
            onScrollToMap={() => handleScrollToSection('live-earth-section')}
          />

          {/* Disaster & Stress Hotspot Monitoring */}
          <DisasterMonitoring
            context={context}
            selectedHotspotCityId={selectedHotspotCityId}
            onSelectHotspotCity={(cityId) => setSelectedHotspotCityId(cityId)}
            onSelectRegion={handleSelectRegion}
            onExploreHotspots={() => handleScrollToSection('live-earth-section')}
            onLoadCityInStudio={(query) => {
              handleSearch(query);
              handleScrollToSection('live-earth-section');
            }}
          />

          {/* Purpose & Impact Section */}
          <PurposeSection />

          {/* Footer */}
          <Footer />
        </main>
      )}

      {/* VIEW MODE 2: FULL-SCREEN MISSION STUDIO WORKSPACE */}
      {currentView === 'studio' && (
        <main className="flex-1 w-full min-h-0 overflow-hidden relative flex flex-col">
          {/* Prominent floating restore control for full-screen Studio view */}
          <div className="absolute top-4 right-4 z-50 animate-in fade-in duration-150">
            <button
              type="button"
              onClick={() => setCurrentView('home')}
              aria-label="Restore map"
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-mono font-bold text-xs shadow-2xl border border-blue-400/60 backdrop-blur-xl transition-all cursor-pointer hover:scale-105 active:scale-95"
              title="Exit Fullscreen Studio and return to Home (Esc)"
            >
              <Minimize2 className="w-4 h-4 text-white" />
              <span>RESTORE STUDIO [ ↙ ]</span>
              <span className="hidden sm:inline text-[10px] opacity-80 font-normal">(ESC)</span>
            </button>
          </div>
          {renderStudioWorkspace(true)}
        </main>
      )}

      {/* VIEW MODE 3: SEPARATE DEDICATED UPLOAD STUDIO WORKSPACE */}
      {currentView === 'upload' && (
        <main className="flex-1 w-full min-h-0 overflow-y-auto relative flex flex-col">
          <UploadStudio
            onClose={() => setCurrentView('home')}
            onOpenLiveStudio={() => setCurrentView('studio')}
          />
        </main>
      )}

      {/* Progress Telemetry Overlay */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 font-mono text-slate-900 dark:text-slate-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  AUTONOMOUS EARTH PIPELINE ACTIVE
                </h3>
                <span className="text-[11px] text-blue-600 dark:text-blue-400">
                  {stages[currentStage]}
                </span>
              </div>
            </div>

            {/* Stepper Checklist */}
            <div className="space-y-2 text-xs py-2 border-y border-slate-200 dark:border-zinc-800 my-4">
              {stages.slice(0, 8).map((stepText, idx) => {
                const isDone = currentStage > idx;
                const isCurrent = currentStage === idx;
                return (
                  <div key={idx} className="flex items-center space-x-2.5">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : isCurrent ? (
                      <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin shrink-0" />
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-slate-300 dark:border-zinc-700 shrink-0" />
                    )}
                    <span className={`text-[11px] ${isDone ? 'text-slate-400 dark:text-slate-500' : isCurrent ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-400 dark:text-slate-600'}`}>
                      {stepText.replace("...", "")}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="text-[10px] text-slate-500 text-center font-sans">
              Accessing Sentinel-2 open cloud rasters. No manual upload or GIS expertise required.
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {errorMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl border border-rose-200 dark:border-rose-900/50 p-5 font-sans shadow-2xl">
            <div className="flex items-center space-x-3 text-rose-600 dark:text-rose-400 mb-3 font-mono">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-sm uppercase">OBSERVATION NOTICE</h3>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed mb-4">
              {errorMessage}
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-slate-200 text-xs rounded-lg font-mono font-medium"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showExplainMap && (
        <ExplainMapModal
          context={context}
          onClose={() => setShowExplainMap(false)}
        />
      )}

      {showProvenance && (
        <ProvenanceModal
          context={context}
          onClose={() => setShowProvenance(false)}
        />
      )}

      {showReport && (
        <ReportModal
          context={context}
          onClose={() => setShowReport(false)}
        />
      )}

      {/* Raw Satellite Imagery Studio Modal (Pure Optical Comparison) */}
      <RawSatelliteModal
        isOpen={showRawSatelliteModal}
        onClose={() => setShowRawSatelliteModal(false)}
        context={context}
        onSelectCityForAnalysis={handleSearch}
      />

      {/* National India Overview Modal (28 States & 8 UTs) */}
      <IndiaOverviewModal
        isOpen={showIndiaOverview}
        onClose={() => setShowIndiaOverview(false)}
        onSelectLocation={(locQuery) => {
          setShowIndiaOverview(false);
          handleSearch(locQuery);
        }}
        activeLocationName={context?.location.name}
      />

      {/* Intelligence Story Modal */}
      <IntelligenceStoryModal
        isOpen={showIntelligenceStory}
        onClose={() => setShowIntelligenceStory(false)}
        context={context}
        onSelectHotspot={(region) => {
          setShowIntelligenceStory(false);
          handleSelectHotspot(region);
        }}
        onOpenProvenance={() => {
          setShowIntelligenceStory(false);
          setShowProvenance(true);
        }}
        onOpenReport={() => {
          setShowIntelligenceStory(false);
          setShowReport(true);
        }}
      />

      {/* Environmental Monitor & Threshold Alerts Modal */}
      <EnvironmentalMonitorModal
        isOpen={showEnvironmentalMonitor}
        onClose={() => setShowEnvironmentalMonitor(false)}
        context={context}
      />

      {/* Hindsight Agent Memory Inspector Modal */}
      <MemoryInspectorModal
        isOpen={showMemoryInspector}
        onClose={() => setShowMemoryInspector(false)}
        userId={currentUserId}
        onSelectQuery={(q) => {
          setShowMemoryInspector(false);
          handleSearch(q);
        }}
      />

      {/* Supabase Analysis History Modal */}
      <AnalysisHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        userId={currentUserId}
        onLoadAnalysis={handleLoadAnalysisFromHistory}
      />

      {/* Judge Mode Evaluation Workflow Modal */}
      <JudgeDemoModal
        isOpen={showJudgeDemoModal}
        onClose={() => setShowJudgeDemoModal(false)}
        onAnalysisComplete={(completedContext, q) => {
          setContext(completedContext);
          setLastQuery(q);
        }}
        onOpenMemoryInspector={() => setShowMemoryInspector(true)}
        onOpenHistory={() => setShowHistoryModal(true)}
      />

      {/* Supabase Authentication & Session Identity Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        currentUser={currentUser}
        onUserChanged={(u) => setCurrentUser(u)}
      />
    </div>
  );
};
