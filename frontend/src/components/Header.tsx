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
  ArrowRight,
  Radio,
  Brain,
  Database
} from 'lucide-react';
import { AnalysisContext } from '../lib/types';

interface HeaderProps {
  onSearch: (query: string) => void;
  isAnalyzing: boolean;
  activeContext: AnalysisContext | null;
  expertMode: boolean;
  setExpertMode: (val: boolean) => void;
  onOpenReport: () => void;
  onOpenProvenance: () => void;
  onRunDemo?: () => void;
  onOpenMemoryInspector?: () => void;
  onOpenHistory?: () => void;
  onRunJudgeDemo?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSearch,
  isAnalyzing,
  activeContext,
  expertMode,
  setExpertMode,
  onOpenReport,
  onOpenProvenance,
  onRunDemo,
  onOpenMemoryInspector,
  onOpenHistory,
  onRunJudgeDemo,
}) => {
  const [inputVal, setInputVal] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim() && !isAnalyzing) {
      onSearch(inputVal.trim());
    }
  };

  const quickPrompts = [
    "Vijayawada, Andhra Pradesh, India",
    "Krishna River in Vijayawada",
    "Hyderabad, Telangana, India",
    "Gujarat, India",
    "Tamil Nadu, India",
    "Kerala, India",
    "Sri Lanka",
    "Visakhapatnam, Andhra Pradesh, India",
    "Tokyo, Japan",
    "London, United Kingdom",
    "Sydney, Australia"
  ];

  return (
    <header className="border-b border-slate-800/90 bg-[#0a0f1c]/95 backdrop-blur-2xl sticky top-0 z-50">
      {/* Top Telemetry Ticker Ribbon: Location, Analysis Area, Satellite, Dates, Resolution, Availability, Confidence */}
      <div className="px-5 py-1.5 border-b border-slate-800/70 flex items-center justify-between text-[11px] font-telemetry text-slate-400 overflow-x-auto no-scrollbar gap-4">
        {/* Left Side: SatQueryAI / Location & Core Mission Status */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="flex items-center text-orbit-cyan space-x-1.5 font-bold tracking-wider">
            <span className="h-2 w-2 rounded-full bg-orbit-cyan shadow-[0_0_8px_#00f0ff] animate-pulse" />
            <span>SatQueryAI</span>
          </div>

          {activeContext && (
            <>
              <span className="text-slate-700">|</span>
              <div className="flex items-center space-x-1.5 text-slate-100 font-semibold">
                <Compass className="w-3.5 h-3.5 text-orbit-cyan" />
                <span className="text-cyan-300 font-bold">{activeContext.location.name}</span>
                {activeContext.location.admin_region && !activeContext.location.name.includes(activeContext.location.admin_region) && (
                  <span className="text-slate-400">({activeContext.location.admin_region}, {activeContext.location.country})</span>
                )}
              </div>
              {activeContext.memory_active && (
                <div 
                  onClick={onOpenMemoryInspector}
                  className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/50 text-purple-300 text-[10.5px] font-mono font-semibold cursor-pointer hover:bg-purple-900/80 transition-all shrink-0 shadow-[0_0_8px_rgba(168,85,247,0.35)]"
                  title={activeContext.memory_context_note || "Hindsight Memory Active"}
                >
                  <Brain className="w-3 h-3 text-purple-400 animate-pulse" />
                  <span>AGENT MEMORY ACTIVE</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Side: Comprehensive Observation Telemetry Strip */}
        <div className="flex items-center space-x-4 shrink-0 text-[10.5px]">
          {activeContext ? (
            <>
              {/* Analysis Area */}
              <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-space-900 border border-slate-800">
                <span className="text-slate-500 uppercase">Analysis Area:</span>
                <strong className="text-orbit-cyan font-mono">~{activeContext.total_aoi_hectares.toLocaleString()} ha</strong>
              </div>

              {/* Satellite */}
              <div className="hidden sm:flex items-center space-x-1 px-2 py-0.5 rounded bg-space-900 border border-slate-800">
                <span className="text-slate-500 uppercase">Satellite:</span>
                <strong className="text-emerald-400">Sentinel-2 L2A</strong>
              </div>

              {/* Before Date */}
              <div className="hidden md:flex items-center space-x-1 px-2 py-0.5 rounded bg-space-900 border border-slate-800">
                <span className="text-slate-500 uppercase">Before:</span>
                <strong className="text-slate-200 font-mono">{activeContext.actual_before_date}</strong>
              </div>

              {/* After Date */}
              <div className="hidden md:flex items-center space-x-1 px-2 py-0.5 rounded bg-space-900 border border-slate-800">
                <span className="text-slate-500 uppercase">After:</span>
                <strong className="text-orbit-cyan font-mono">{activeContext.actual_after_date}</strong>
              </div>

              {/* Resolution */}
              <div className="hidden lg:flex items-center space-x-1 px-2 py-0.5 rounded bg-space-900 border border-slate-800">
                <span className="text-slate-500 uppercase">Resolution:</span>
                <strong className="text-slate-300">10m Multispectral</strong>
              </div>

              {/* Data Availability */}
              <div className="hidden xl:flex items-center space-x-1 px-2 py-0.5 rounded bg-space-900 border border-slate-800">
                <span className="text-slate-500 uppercase">Data Availability:</span>
                <strong className="text-emerald-300">{activeContext.data_availability || "100% Cloud-Free Pass"}</strong>
              </div>

              {/* Confidence */}
              <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-space-900 border border-slate-800">
                <span className="text-slate-500 uppercase">Confidence:</span>
                <strong className="text-orbit-emerald">{activeContext.confidence.overall_score}% ({activeContext.confidence.rating})</strong>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2 text-slate-500 font-telemetry">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
              <span>AWAITING EARTH OBSERVATION QUERY</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="px-5 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand Identity */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 via-blue-500/15 to-emerald-500/20 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.2)]">
              <Globe2 className="w-5 h-5 text-orbit-cyan" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base tracking-wide text-slate-100 font-sans">
                  SatQueryAI
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-telemetry uppercase tracking-wider bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 rounded-md font-semibold">
                  {activeContext?.location.location_type === 'river'
                    ? 'RIVER CORRIDOR'
                    : activeContext?.location.location_type === 'state'
                    ? 'STATE REGION'
                    : activeContext?.location.location_type === 'country'
                    ? 'NATIONAL'
                    : activeContext?.location.location_type === 'city'
                    ? 'CITY METRO'
                    : 'INTELLIGENCE'}
                </span>
              </div>
              {activeContext ? (
                <div className="text-[11.5px] text-orbit-cyan font-bold font-telemetry truncate max-w-[260px] lg:max-w-[340px]" title={activeContext.location.display_name}>
                  {activeContext.location.name}
                  {activeContext.location.admin_region && !activeContext.location.name.includes(activeContext.location.admin_region) ? `, ${activeContext.location.admin_region}` : ''}
                  {activeContext.location.country && !activeContext.location.name.includes(activeContext.location.country) ? `, ${activeContext.location.country}` : ''}
                </div>
              ) : (
                <p className="text-[10px] text-slate-400 font-telemetry">
                  Autonomous Earth Observation
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Global Natural-Language Search Bar */}
        <form onSubmit={handleSubmit} className="flex-1 max-w-2xl w-full">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask about changes anywhere on Earth (e.g. 'What changed in Visakhapatnam between 2021 and 2026?')"
              className="w-full pl-10 pr-28 py-2.5 bg-[#0f172a]/90 border border-slate-700/70 hover:border-slate-600 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all font-sans shadow-inner"
              disabled={isAnalyzing}
            />
            <button
              type="submit"
              disabled={isAnalyzing || !inputVal.trim()}
              className="absolute right-1.5 px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-space-950 font-bold text-xs rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1.5 font-telemetry shadow-sm"
            >
              {isAnalyzing ? (
                <>
                  <Activity className="w-3.5 h-3.5 animate-spin text-space-950" />
                  <span>ANALYZING</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-space-950" />
                  <span>ANALYZE</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Action Controls */}
        <div className="flex items-center space-x-2.5 w-full md:w-auto justify-end">
          {/* Simple vs Expert Mode Pill Switch */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-700/80">
            <button
              type="button"
              onClick={() => setExpertMode(false)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                !expertMode 
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Simple
            </button>
            <button
              type="button"
              onClick={() => setExpertMode(true)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center space-x-1 ${
                expertMode 
                  ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3 h-3" />
              <span>Expert</span>
            </button>
          </div>

          {/* Dedicated Judge Demo Mode: Automated 3-Step Hindsight Workflow */}
          {(onRunJudgeDemo || onRunDemo) && (
            <button
              type="button"
              onClick={onRunJudgeDemo || onRunDemo}
              disabled={isAnalyzing}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600/30 to-blue-600/30 hover:from-purple-600/50 hover:to-blue-600/50 border border-purple-500/60 text-purple-200 text-xs font-telemetry font-bold transition-all flex items-center space-x-1.5 shadow-[0_0_12px_rgba(168,85,247,0.25)]"
              title="Fast-Track 3-Step Live Demonstration: Retain -> Recall -> Reflect"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
              <span>JUDGE DEMO</span>
            </button>
          )}

          {/* Hindsight Memory Inspector Trigger */}
          {onOpenMemoryInspector && (
            <button
              type="button"
              onClick={onOpenMemoryInspector}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-purple-500/40 text-purple-300 hover:text-white text-xs font-medium transition-all flex items-center space-x-1.5"
              title="Inspect Hindsight Agent Memory, Retained Experiences & Mental Models"
            >
              <Brain className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden md:inline">Memory</span>
            </button>
          )}

          {/* Supabase Persistent History Trigger */}
          {onOpenHistory && (
            <button
              type="button"
              onClick={onOpenHistory}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-blue-300 hover:text-white text-xs font-medium transition-all flex items-center space-x-1.5"
              title="View Stored Supabase Analysis History"
            >
              <Database className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden md:inline">History</span>
            </button>
          )}

          {/* Data Provenance Modal Trigger */}
          <button
            type="button"
            onClick={onOpenProvenance}
            disabled={!activeContext}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1.5"
            title="Inspect Data & Evidence Provenance"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Provenance</span>
          </button>

          {/* PDF Report Trigger */}
          <button
            type="button"
            onClick={onOpenReport}
            disabled={!activeContext}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1.5"
            title="Generate Executive PDF Report"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>PDF Report</span>
          </button>
        </div>
      </div>

      {/* Quick Prompt Chips */}
      <div className="px-5 py-1.5 bg-[#070b13]/80 border-t border-slate-800/40 flex items-center space-x-2 overflow-x-auto text-[11px] no-scrollbar">
        <span className="text-slate-500 font-telemetry uppercase tracking-wider flex items-center space-x-1 shrink-0">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>Quick Intel:</span>
        </span>
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSearch(p)}
            disabled={isAnalyzing}
            className="shrink-0 px-2.5 py-0.5 rounded-full bg-slate-850 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-cyan-300 text-xs transition-colors font-sans"
          >
            {p}
          </button>
        ))}
      </div>
    </header>
  );
};
