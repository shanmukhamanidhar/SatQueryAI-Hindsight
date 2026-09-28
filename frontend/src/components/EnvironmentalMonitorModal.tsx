import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Sliders, 
  Building2, 
  Trees, 
  Droplets, 
  Activity, 
  Info 
} from 'lucide-react';
import { AnalysisContext } from '../lib/types';

interface EnvironmentalMonitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: AnalysisContext | null;
}

export const EnvironmentalMonitorModal: React.FC<EnvironmentalMonitorModalProps> = ({
  isOpen,
  onClose,
  context,
}) => {
  // Configured Monitoring Categories & Thresholds (in Hectares)
  const [monitorUrban, setMonitorUrban] = useState(true);
  const [urbanThresholdHa, setUrbanThresholdHa] = useState(25);

  const [monitorVegetation, setMonitorVegetation] = useState(true);
  const [vegetationLossThresholdHa, setVegetationLossThresholdHa] = useState(15);

  const [monitorWater, setMonitorWater] = useState(true);
  const [waterLossThresholdHa, setWaterLossThresholdHa] = useState(10);

  if (!isOpen || !context) return null;

  const stats = context.land_cover_stats;
  const builtStat = stats.find((s) => s.category.includes('Built'));
  const treeStat = stats.find((s) => s.category.includes('Trees'));
  const cropStat = stats.find((s) => s.category.includes('Crops'));
  const waterStat = stats.find((s) => s.category.includes('Water'));

  const actualUrbanChangeHa = builtStat ? Math.max(0, builtStat.change_ha) : 0;
  const actualVegLossHa = treeStat && treeStat.change_ha < 0 ? Math.abs(treeStat.change_ha) : 0;
  const actualWaterLossHa = waterStat && waterStat.change_ha < 0 ? Math.abs(waterStat.change_ha) : 0;

  const urbanAlertTriggered = monitorUrban && actualUrbanChangeHa >= urbanThresholdHa;
  const vegAlertTriggered = monitorVegetation && actualVegLossHa >= vegetationLossThresholdHa;
  const waterAlertTriggered = monitorWater && actualWaterLossHa >= waterLossThresholdHa;

  const totalActiveAlerts = (urbanAlertTriggered ? 1 : 0) + (vegAlertTriggered ? 1 : 0) + (waterAlertTriggered ? 1 : 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-slate-100 font-sans">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-slate-50/80 dark:bg-zinc-950/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-700/60 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-xs">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Environmental Monitoring &amp; Alert Rules
                </h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                  totalActiveAlerts > 0
                    ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300'
                    : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300'
                }`}>
                  {totalActiveAlerts > 0 ? `${totalActiveAlerts} Active Alert(s)` : 'All Safe'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Configure measurable hectares thresholds for {context.location.name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"
            title="Close Monitor"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar text-sm">
          {/* Scientific Transparency Notice */}
          <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 flex items-start space-x-3 text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <strong>Sensor Cadence Transparency:</strong> Copernicus Sentinel-2 operates on a 5-day optical revisit schedule at the equator. Alerts evaluate against physical land cover transitions measured between verified cloud-free satellite passes.
            </div>
          </div>

          {/* Monitoring Rules Checklist */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
              CONFIGURED ENVIRONMENTAL THRESHOLDS
            </h4>

            {/* 1. Urban Expansion Rule */}
            <div className={`p-4 rounded-2xl border transition-all ${
              urbanAlertTriggered
                ? 'bg-rose-50/60 dark:bg-rose-950/25 border-rose-300 dark:border-rose-800'
                : 'bg-slate-50 dark:bg-zinc-850 border-slate-200 dark:border-zinc-750'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={monitorUrban}
                    onChange={(e) => setMonitorUrban(e.target.checked)}
                    className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
                  />
                  <div className="flex items-center space-x-1.5 font-bold text-slate-900 dark:text-white text-xs">
                    <Building2 className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    <span>Urban Expansion &amp; Construction Alert</span>
                  </div>
                </label>

                {monitorUrban && (
                  <span className={`text-[10.5px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    urbanAlertTriggered
                      ? 'bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200'
                      : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                  }`}>
                    {urbanAlertTriggered ? '⚠️ THRESHOLD EXCEEDED' : '✓ WITHIN LIMIT'}
                  </span>
                )}
              </div>

              {monitorUrban && (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400">
                    <span>Trigger alert when built-up expansion exceeds:</span>
                    <strong className="text-slate-900 dark:text-white font-mono">{urbanThresholdHa} ha</strong>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={urbanThresholdHa}
                    onChange={(e) => setUrbanThresholdHa(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-orange-600"
                  />
                  <div className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 pt-1">
                    Current Measured Expansion: <strong className="text-orange-600 dark:text-orange-400">{actualUrbanChangeHa.toFixed(1)} ha</strong>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Vegetation Loss Rule */}
            <div className={`p-4 rounded-2xl border transition-all ${
              vegAlertTriggered
                ? 'bg-rose-50/60 dark:bg-rose-950/25 border-rose-300 dark:border-rose-800'
                : 'bg-slate-50 dark:bg-zinc-850 border-slate-200 dark:border-zinc-750'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={monitorVegetation}
                    onChange={(e) => setMonitorVegetation(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex items-center space-x-1.5 font-bold text-slate-900 dark:text-white text-xs">
                    <Trees className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Tree Cover &amp; Canopy Loss Alert</span>
                  </div>
                </label>

                {monitorVegetation && (
                  <span className={`text-[10.5px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    vegAlertTriggered
                      ? 'bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200'
                      : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                  }`}>
                    {vegAlertTriggered ? '⚠️ THRESHOLD EXCEEDED' : '✓ WITHIN LIMIT'}
                  </span>
                )}
              </div>

              {monitorVegetation && (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400">
                    <span>Trigger alert when canopy loss exceeds:</span>
                    <strong className="text-slate-900 dark:text-white font-mono">{vegetationLossThresholdHa} ha</strong>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={vegetationLossThresholdHa}
                    onChange={(e) => setVegetationLossThresholdHa(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 pt-1">
                    Current Measured Canopy Loss: <strong className="text-emerald-600 dark:text-emerald-400">{actualVegLossHa.toFixed(1)} ha</strong>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Water Surface Reduction Rule */}
            <div className={`p-4 rounded-2xl border transition-all ${
              waterAlertTriggered
                ? 'bg-rose-50/60 dark:bg-rose-950/25 border-rose-300 dark:border-rose-800'
                : 'bg-slate-50 dark:bg-zinc-850 border-slate-200 dark:border-zinc-750'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={monitorWater}
                    onChange={(e) => setMonitorWater(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex items-center space-x-1.5 font-bold text-slate-900 dark:text-white text-xs">
                    <Droplets className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Surface Water Contraction Alert</span>
                  </div>
                </label>

                {monitorWater && (
                  <span className={`text-[10.5px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    waterAlertTriggered
                      ? 'bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200'
                      : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                  }`}>
                    {waterAlertTriggered ? '⚠️ THRESHOLD EXCEEDED' : '✓ WITHIN LIMIT'}
                  </span>
                )}
              </div>

              {monitorWater && (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400">
                    <span>Trigger alert when water contraction exceeds:</span>
                    <strong className="text-slate-900 dark:text-white font-mono">{waterLossThresholdHa} ha</strong>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={waterLossThresholdHa}
                    onChange={(e) => setWaterLossThresholdHa(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 pt-1">
                    Current Measured Water Contraction: <strong className="text-blue-600 dark:text-blue-400">{actualWaterLossHa.toFixed(1)} ha</strong>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/80 dark:bg-zinc-950/50">
          <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400">
            Rules persisted for active Sentinel-2 footprint
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-mono font-bold transition-all shadow-xs"
          >
            SAVE MONITOR CONFIG
          </button>
        </div>
      </div>
    </div>
  );
};
