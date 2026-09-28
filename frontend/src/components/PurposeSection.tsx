import React from 'react';
import { Shield, HeartHandshake, Sparkles } from 'lucide-react';

export const PurposeSection: React.FC = () => {
  return (
    <section className="py-20 bg-white dark:bg-[#09090b] border-b border-slate-200 dark:border-zinc-800 relative transition-colors">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-14">
          <div className="text-[11px] font-mono text-blue-600 dark:text-blue-400 uppercase tracking-widest font-semibold mb-2">
            MISSION & PHILOSOPHY
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Empowering Global Earth Stewardship
          </h2>
          <p className="text-sm text-slate-600 dark:text-zinc-400 mt-2">
            Transparent remote sensing insights delivered with scientific rigor and plain language clarity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Column 1: Blue */}
          <div className="flex flex-col items-center text-center p-7 rounded-2xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 shadow-xs">
            <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xs font-mono font-bold tracking-widest text-blue-700 dark:text-blue-400 uppercase mb-1">
              FOR A SAFER WORLD
            </h3>
            <div className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Monitor. Prepare. Respond.
            </div>
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed max-w-xs">
              Continuous multispectral observation identifies rapid land alterations and infrastructural stress before they escalate into unchecked ecological damage.
            </p>
          </div>

          {/* Column 2: Green */}
          <div className="flex flex-col items-center text-center p-7 rounded-2xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 shadow-xs">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-xs font-mono font-bold tracking-widest text-emerald-700 dark:text-emerald-400 uppercase mb-1">
              FOR A HEALTHIER PLANET
            </h3>
            <div className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Understand. Protect. Sustain.
            </div>
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed max-w-xs">
              Scientific indices democratize environmental insight. From canopy biomass to surface water security, transparency drives sustainable planning.
            </p>
          </div>

          {/* Column 3: Indigo */}
          <div className="flex flex-col items-center text-center p-7 rounded-2xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 shadow-xs">
            <div className="h-12 w-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xs font-mono font-bold tracking-widest text-indigo-700 dark:text-indigo-400 uppercase mb-1">
              FOR FUTURE GENERATIONS
            </h3>
            <div className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Data for a better tomorrow.
            </div>
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed max-w-xs">
              Open Copernicus STAC archives paired with explainable AI ensure objective, reproducible evidence for researchers and policymakers.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
