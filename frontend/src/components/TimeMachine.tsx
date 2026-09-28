import React, { useState } from 'react';
import { 
  Calendar, 
  TrendingUp, 
  Clock, 
  ChevronRight, 
  Building2, 
  Trees, 
  Droplets,
  Activity,
  ArrowRight,
  X
} from 'lucide-react';
import { TimelinePoint } from '../lib/types';

interface TimeMachineProps {
  timeline: TimelinePoint[];
  fromYear?: number | null;
  toYear?: number | null;
  fromImageData?: { year: number; date: string; imageUrl: string } | null;
  toImageData?: { year: number; date: string; imageUrl: string } | null;
  isLoadingFromYear?: boolean;
  isLoadingToYear?: boolean;
  onSelectFromYear?: (year: number | null) => void;
  onSelectToYear?: (year: number | null) => void;
  onResetYears?: () => void;
  onClose?: () => void;
  defaultBeforeYear?: number;
  defaultAfterYear?: number;
}

export const TimeMachine: React.FC<TimeMachineProps> = ({
  timeline,
  fromYear,
  toYear,
  fromImageData,
  toImageData,
  isLoadingFromYear,
  isLoadingToYear,
  onSelectFromYear,
  onSelectToYear,
  onResetYears,
  onClose,
  defaultBeforeYear = 2021,
  defaultAfterYear = 2026,
}) => {
  const [selectedIdx, setSelectedIdx] = useState<number>(timeline.length - 1);
  const [activeMetric, setActiveMetric] = useState<'indices' | 'hectares'>('indices');
  const [showTrajectoryChart, setShowTrajectoryChart] = useState<boolean>(false);

  if (!timeline || timeline.length === 0) return null;

  const currentPoint = timeline[selectedIdx] || timeline[timeline.length - 1];

  // Available observation years
  const availableYears = [2020, 2021, 2022, 2023, 2024, 2025, 2026];
  const activeFromYear = fromYear || defaultBeforeYear;
  const activeToYear = toYear || defaultAfterYear;

  // Calculate SVG chart coordinates
  const svgWidth = 550;
  const svgHeight = 100;
  const padding = 25;

  const minYear = timeline[0].year;
  const maxYear = timeline[timeline.length - 1].year;
  const yearSpan = Math.max(1, maxYear - minYear);

  const getX = (year: number) => padding + ((year - minYear) / yearSpan) * (svgWidth - 2 * padding);

  // Normalize indices (-0.5 to 0.8) to Y
  const getYIndex = (val: number) => {
    const minVal = -0.3;
    const maxVal = 0.8;
    const norm = (val - minVal) / (maxVal - minVal);
    return svgHeight - padding - norm * (svgHeight - 2 * padding);
  };

  // Build SVG path strings for NDVI (Vegetation) and NDBI (Built-up)
  const ndviPoints = timeline.map((p) => `${getX(p.year)},${getYIndex(p.mean_ndvi)}`).join(' ');
  const ndbiPoints = timeline.map((p) => `${getX(p.year)},${getYIndex(p.mean_ndbi)}`).join(' ');

  return (
    <div className="border-t border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 p-3.5 flex flex-col gap-3 font-sans backdrop-blur-2xl text-slate-800 dark:text-slate-100">
      {/* 1. Dual Yearly Satellite Pass Selector (FROM and TO: e.g. 2020 to 2026) */}
      <div className="w-full flex flex-col gap-2 pb-2.5 border-b border-slate-200 dark:border-zinc-800">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="font-telemetry font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
              TEMPORAL OBSERVATION PASSES:
            </span>
            <span className="text-xs font-telemetry text-emerald-600 dark:text-emerald-400 font-mono font-bold">
              FROM {activeFromYear}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-telemetry text-blue-600 dark:text-blue-400 font-mono font-bold">
              TO {activeToYear}
            </span>
            <span className="text-[10.5px] font-telemetry text-slate-500 dark:text-slate-400 hidden lg:inline">
              (Choose any From &amp; To years to swap satellite passes on the map)
            </span>
          </div>

          {/* Quick Comparison Presets & Reset */}
          <div className="flex items-center gap-1.5 text-[11px] font-telemetry">
            <span className="text-slate-400 hidden sm:inline">PRESETS:</span>
            <button
              type="button"
              onClick={() => {
                onSelectFromYear?.(2020);
                onSelectToYear?.(2026);
              }}
              className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-zinc-700 transition-colors"
            >
              2020 ➔ 2026
            </button>
            <button
              type="button"
              onClick={() => {
                onSelectFromYear?.(2021);
                onSelectToYear?.(2025);
              }}
              className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-zinc-700 transition-colors"
            >
              2021 ➔ 2025
            </button>
            <button
              type="button"
              onClick={() => {
                onSelectFromYear?.(2022);
                onSelectToYear?.(2026);
              }}
              className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-zinc-700 transition-colors"
            >
              2022 ➔ 2026
            </button>

            <button
              type="button"
              onClick={() => setShowTrajectoryChart(!showTrajectoryChart)}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-telemetry flex items-center space-x-1 border transition-all ${
                showTrajectoryChart
                  ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/50 font-bold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-zinc-800 dark:text-slate-300 dark:hover:bg-zinc-700 border-slate-200 dark:border-zinc-700'
              }`}
              title="Toggle multi-year spectral trend chart and metrics"
            >
              <TrendingUp className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              <span>{showTrajectoryChart ? 'Hide Trends' : 'Trajectory Trends'}</span>
            </button>

            {(fromYear !== null || toYear !== null) && (
              <button
                type="button"
                onClick={onResetYears}
                className="px-2 py-0.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/20 dark:hover:bg-rose-500/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/40 font-bold transition-all ml-1"
                title="Reset to default baseline and comparative observation dates"
              >
                ✕ RESET
              </button>
            )}

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-zinc-700 font-bold text-xs font-telemetry transition-all flex items-center space-x-1.5 ml-2 shadow-sm"
                title="Close Time Changes drawer & maximize map area"
              >
                <X className="w-3.5 h-3.5 text-rose-500" />
                <span>Close (Enlarge Map)</span>
              </button>
            )}
          </div>
        </div>

        {/* Dual Selectors: FROM row and TO row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-slate-50 dark:bg-zinc-950/80 p-2 rounded-2xl border border-slate-200 dark:border-zinc-800">
          {/* FROM SELECTOR */}
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-400 font-telemetry text-xs font-bold shrink-0 tracking-wider">
              FROM:
            </span>
            <div className="flex flex-wrap items-center gap-1">
              {availableYears.map((yr) => {
                const isSelected = activeFromYear === yr;
                return (
                  <button
                    key={`from-${yr}`}
                    type="button"
                    onClick={() => onSelectFromYear?.(yr)}
                    className={`px-2.5 py-1 rounded-xl font-telemetry text-xs font-bold transition-all flex items-center space-x-1 ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-md scale-105 ring-2 ring-emerald-400/50'
                        : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-zinc-800 hover:border-emerald-500/50 hover:text-emerald-600 dark:hover:text-emerald-400'
                    }`}
                    title={`Set baseline imagery pass to ${yr}`}
                  >
                    <span>{yr}</span>
                    {isSelected && isLoadingFromYear && (
                      <Activity className="w-2.5 h-2.5 animate-spin text-white" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* TO SELECTOR */}
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/40 text-blue-700 dark:text-blue-400 font-telemetry text-xs font-bold shrink-0 tracking-wider">
              TO:
            </span>
            <div className="flex flex-wrap items-center gap-1">
              {availableYears.map((yr) => {
                const isSelected = activeToYear === yr;
                return (
                  <button
                    key={`to-${yr}`}
                    type="button"
                    onClick={() => onSelectToYear?.(yr)}
                    className={`px-2.5 py-1 rounded-xl font-telemetry text-xs font-bold transition-all flex items-center space-x-1 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md scale-105 ring-2 ring-blue-400/50'
                        : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-zinc-800 hover:border-blue-500/50 hover:text-blue-600 dark:hover:text-blue-400'
                    }`}
                    title={`Set comparative imagery pass to ${yr}`}
                  >
                    <span>{yr}</span>
                    {isSelected && isLoadingToYear && (
                      <Activity className="w-2.5 h-2.5 animate-spin text-white" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Optional Collapsible Trajectory Timeline Chart & Metrics */}
      {showTrajectoryChart && (
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-200 dark:border-zinc-800 animate-in fade-in duration-150">
        {/* Time Machine Label & Metric Switch */}
        <div className="flex flex-col space-y-1 shrink-0">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="font-telemetry font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
              TEMPORAL ARCHIVE TIMELINE
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-telemetry pl-8">
            Sentinel-2 Trajectory: <span className="text-slate-800 dark:text-slate-200 font-mono">{minYear}</span> → <span className="text-blue-600 dark:text-blue-400 font-mono">{maxYear}</span>
          </p>

          <div className="flex items-center space-x-2 pt-1 pl-8">
            <button
              type="button"
              onClick={() => setActiveMetric('indices')}
              className={`px-2.5 py-1 rounded-lg text-[10.5px] font-telemetry transition-all ${
                activeMetric === 'indices'
                  ? 'bg-blue-50 text-blue-700 border border-blue-300 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/50 shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-transparent'
              }`}
            >
              Spectral Indices
            </button>
            <button
              type="button"
              onClick={() => setActiveMetric('hectares')}
              className={`px-2.5 py-1 rounded-lg text-[10.5px] font-telemetry transition-all ${
                activeMetric === 'hectares'
                  ? 'bg-blue-50 text-blue-700 border border-blue-300 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/50 shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-transparent'
              }`}
            >
              Hectares Area
            </button>
          </div>
        </div>

        {/* Interactive SVG Chart */}
        <div className="flex-1 max-w-xl w-full relative">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-20 overflow-visible">
            {/* Subtle Grid Lines */}
            <line x1={padding} y1={svgHeight - padding} x2={svgWidth - padding} y2={svgHeight - padding} stroke="#cbd5e1" className="dark:stroke-zinc-800" strokeWidth="1" strokeDasharray="3,3" />
            <line x1={padding} y1={padding} x2={svgWidth - padding} y2={padding} stroke="#cbd5e1" className="dark:stroke-zinc-800" strokeWidth="1" strokeDasharray="3,3" />

            {activeMetric === 'indices' ? (
              <>
                {/* NDVI Line (Green) */}
                <polyline
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  points={ndviPoints}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="drop-shadow(0 0 4px rgba(16,185,129,0.4))"
                />
                {/* NDBI Line (Orange) */}
                <polyline
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="2.5"
                  points={ndbiPoints}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="drop-shadow(0 0 4px rgba(249,115,22,0.4))"
                />
              </>
            ) : (
              <>
                {/* Built-up Area Trend */}
                <polyline
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="2.5"
                  points={timeline.map((p) => `${getX(p.year)},${svgHeight - padding - (p.built_ha / 4000.0) * (svgHeight - 2 * padding)}`).join(' ')}
                  strokeLinecap="round"
                  filter="drop-shadow(0 0 4px rgba(249,115,22,0.4))"
                />
                {/* Vegetation Area Trend */}
                <polyline
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  points={timeline.map((p) => `${getX(p.year)},${svgHeight - padding - (p.vegetation_ha / 4000.0) * (svgHeight - 2 * padding)}`).join(' ')}
                  strokeLinecap="round"
                  filter="drop-shadow(0 0 4px rgba(16,185,129,0.4))"
                />
              </>
            )}

            {/* Timeline Year Points */}
            {timeline.map((p, idx) => {
              const x = getX(p.year);
              const isFrom = activeFromYear === p.year;
              const isTo = activeToYear === p.year;
              const isSel = isFrom || isTo || idx === selectedIdx;
              const pointColor = isTo ? '#2563eb' : (isFrom ? '#10b981' : '#94a3b8');
              return (
                <g key={p.year} className="cursor-pointer" onClick={() => { setSelectedIdx(idx); onSelectToYear?.(p.year); }}>
                  <line x1={x} y1={padding} x2={x} y2={svgHeight - padding} stroke={isSel ? pointColor : '#e2e8f0'} className="dark:stroke-zinc-800" strokeWidth={isSel ? 2 : 1} />
                  <circle
                    cx={x}
                    cy={svgHeight - padding}
                    r={isSel ? 5.5 : 3.5}
                    fill={pointColor}
                    className="transition-all hover:scale-150"
                    filter={isSel ? `drop-shadow(0 0 6px ${pointColor})` : undefined}
                  />
                  <text x={x} y={svgHeight - 4} textAnchor="middle" fill={isSel ? pointColor : '#64748b'} fontSize="9.5" fontFamily="monospace" fontWeight={isSel ? 'bold' : 'normal'}>
                    {p.year}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Legend */}
          <div className="flex items-center justify-between text-[10px] font-telemetry text-slate-500 dark:text-slate-400 mt-1 px-4">
            <div className="flex items-center space-x-3">
              <span className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                <span>{activeMetric === 'indices' ? 'NDVI (Vegetation)' : 'Vegetation (ha)'}</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,0.5)]" />
                <span>{activeMetric === 'indices' ? 'NDBI (Built-up)' : 'Built-up (ha)'}</span>
              </span>
            </div>
            <span className="text-slate-400">Click year node to inspect</span>
          </div>
        </div>

      {/* Selected Year Telemetry Readout */}
      <div className="rounded-2xl p-3 border border-slate-200 dark:border-zinc-700/80 bg-slate-50 dark:bg-zinc-800/80 text-xs font-telemetry shrink-0 min-w-[190px] shadow-sm">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[10px] border-b border-slate-200 dark:border-zinc-700/80 pb-1.5 mb-2">
          <span className="font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">OBSERVATION</span>
          <strong className="text-blue-600 dark:text-blue-400 font-mono text-xs px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/30">
            {currentPoint.year}
          </strong>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="p-1.5 rounded-lg bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-750">
            <span className="text-slate-500 dark:text-slate-400 text-[9.5px] block">Mean NDVI</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{currentPoint.mean_ndvi}</span>
          </div>
          <div className="p-1.5 rounded-lg bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-750">
            <span className="text-slate-500 dark:text-slate-400 text-[9.5px] block">Mean NDBI</span>
            <span className="font-bold text-orange-600 dark:text-orange-400 font-mono">{currentPoint.mean_ndbi}</span>
          </div>
          <div className="p-1.5 rounded-lg bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-750">
            <span className="text-slate-500 dark:text-slate-400 text-[9.5px] block">Built Surface</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">{currentPoint.built_ha} ha</span>
          </div>
          <div className="p-1.5 rounded-lg bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-750">
            <span className="text-slate-500 dark:text-slate-400 text-[9.5px] block">Vegetation</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">{currentPoint.vegetation_ha} ha</span>
          </div>
        </div>
      </div>
      </div>
      )}
    </div>
  );
};
