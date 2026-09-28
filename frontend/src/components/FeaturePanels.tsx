import React from 'react';
import { 
  Activity, 
  Database, 
  TrendingUp, 
  Sparkles, 
  ArrowRight
} from 'lucide-react';

interface FeaturePanelsProps {
  onSelectFeature: (featureId: 'monitor' | 'explore' | 'analyze' | 'ai') => void;
}

export const FeaturePanels: React.FC<FeaturePanelsProps> = ({ onSelectFeature }) => {
  const panels = [
    {
      id: 'monitor' as const,
      tag: 'REAL-TIME TRACKING',
      title: 'LIVE MONITOR',
      description: 'Continuously observe environmental changes, land-cover transitions, and spectral heatmaps with swipe-comparison tools.',
      borderClass: 'border-slate-200 hover:border-blue-500 dark:border-zinc-800 dark:hover:border-blue-500',
      iconClass: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-900/50',
      tagClass: 'text-blue-700 dark:text-blue-300',
      icon: Activity,
    },
    {
      id: 'explore' as const,
      tag: 'OPEN STAC ARCHIVES',
      title: 'EXPLORE DATA',
      description: 'Access open Copernicus Sentinel-2 Level-2A imagery with 10-meter ground resolution, cloud masking, and raw scene provenance.',
      borderClass: 'border-slate-200 hover:border-sky-500 dark:border-zinc-800 dark:hover:border-sky-500',
      iconClass: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 border-sky-200 dark:border-sky-900/50',
      tagClass: 'text-sky-700 dark:text-sky-300',
      icon: Database,
    },
    {
      id: 'analyze' as const,
      tag: 'REMOTE SENSING ENGINE',
      title: 'ANALYZE',
      description: 'Compute true scientific indices (NDVI for vegetation, NDBI for built-up, NDWI for water) with multi-year temporal trajectory curves.',
      borderClass: 'border-slate-200 hover:border-emerald-500 dark:border-zinc-800 dark:hover:border-emerald-500',
      iconClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900/50',
      tagClass: 'text-emerald-700 dark:text-emerald-300',
      icon: TrendingUp,
    },
    {
      id: 'ai' as const,
      tag: 'AI REASONING',
      title: 'SATQUERY INTELLIGENCE',
      description: 'Ask complex natural language questions. Receive authoritative, explainable scientific interpretations synthesized by AI.',
      borderClass: 'border-slate-200 hover:border-indigo-500 dark:border-zinc-800 dark:hover:border-indigo-500',
      iconClass: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-900/50',
      tagClass: 'text-indigo-700 dark:text-indigo-300',
      icon: Sparkles,
    },
  ];

  return (
    <section id="features-section" className="scroll-mt-20 py-16 bg-slate-50 dark:bg-[#09090b] border-b border-slate-200 dark:border-zinc-800 relative transition-colors">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-2 text-[11px] font-mono text-blue-600 dark:text-blue-400 uppercase tracking-widest font-semibold mb-2">
            <span>SCIENTIFIC CAPABILITIES</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Engineered for Autonomous Earth Observation
          </h2>
          <p className="text-sm text-slate-600 dark:text-zinc-400 mt-2">
            Four operational pillars delivering satellite intelligence from orbit to your screen.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {panels.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.id}
                role="button"
                tabIndex={0}
                aria-label={`Explore ${p.title} module`}
                onClick={() => onSelectFeature(p.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectFeature(p.id);
                  }
                }}
                className={`group cursor-pointer rounded-2xl p-6 bg-white dark:bg-zinc-900/80 hover:bg-slate-50 dark:hover:bg-zinc-850 border ${p.borderClass} transition-all duration-200 shadow-xs hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 flex flex-col justify-between text-left`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${p.tagClass}`}>
                      {p.tag}
                    </span>
                    <div className={`h-10 w-10 rounded-xl border flex items-center justify-center ${p.iconClass} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 font-sans">
                    {p.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed font-sans">
                    {p.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-zinc-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors w-full">
                  <span>Explore Module</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
