import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  ArrowRight, 
  Activity, 
  Globe2, 
  ShieldCheck, 
  Layers, 
  Compass, 
  Trees, 
  Droplets, 
  Building2, 
  Calendar, 
  Satellite,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { AnalysisContext, QueryUnderstanding } from '../lib/types';
import { parseQuery } from '../lib/api';
import { RealisticEarth } from './RealisticEarth';

interface HeroSectionProps {
  onSearch: (query: string) => void;
  isAnalyzing: boolean;
  activeContext: AnalysisContext | null;
  onRunDemo?: () => void;
  onExploreClick?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSearch,
  isAnalyzing,
  activeContext,
  onRunDemo,
  onExploreClick,
}) => {
  const [queryInput, setQueryInput] = useState('');
  const [inputFeedback, setInputFeedback] = useState<{
    type: 'error' | 'info' | 'warning';
    message: string;
  } | null>(null);
  const [disambiguation, setDisambiguation] = useState<{
    question: string;
    options: string[];
  } | null>(null);

  const executeQuery = async (queryText: string) => {
    const text = queryText.trim();
    if (!text) {
      setInputFeedback({
        type: 'error',
        message: 'Please enter a location or Earth-observation question.',
      });
      return;
    }

    setInputFeedback(null);
    setDisambiguation(null);

    // Fast client pre-flight check via backend NLP engine
    try {
      const prev = activeContext ? {
        location: activeContext.location?.name,
        start_year: activeContext.actual_before_date ? parseInt(activeContext.actual_before_date.slice(0, 4)) : 2021,
        end_year: activeContext.actual_after_date ? parseInt(activeContext.actual_after_date.slice(0, 4)) : 2026,
      } : undefined;

      const parsed: QueryUnderstanding = await parseQuery({
        query: text,
        previous_context: prev,
      });

      if (!parsed.is_earth_observation) {
        setInputFeedback({
          type: 'info',
          message: parsed.rejection_reason || 'SatQueryAI is designed for satellite and Earth-observation analysis. Try asking about environmental, land-use, water, vegetation, or urban changes for a location.',
        });
        return;
      }

      if (parsed.is_ambiguous && parsed.disambiguation_options && parsed.disambiguation_options.length > 0) {
        setDisambiguation({
          question: parsed.clarification_question || 'Which location do you mean?',
          options: parsed.disambiguation_options,
        });
        return;
      }

      if (parsed.year_warning) {
        setInputFeedback({
          type: 'warning',
          message: parsed.year_warning,
        });
      }

      onSearch(text);
    } catch (err: any) {
      // If network fails or fallback, dispatch query directly to master analysis
      onSearch(text);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAnalyzing) {
      executeQuery(queryInput);
    }
  };

  const handleChipClick = (prompt: string) => {
    setQueryInput(prompt);
    if (!isAnalyzing) {
      executeQuery(prompt);
    }
  };

  const tryAskingExamples = [
    { label: "Vijayawada since 2021", query: "What changed in Vijayawada since 2021?" },
    { label: "Dubai 2020–2026", query: "Compare Dubai from 2020 to 2026" },
    { label: "Urban growth in Hyderabad", query: "Show urban growth in Hyderabad" },
    { label: "Vegetation in Bengaluru", query: "How has vegetation changed in Bengaluru?" },
    { label: "Water changes in Krishna River", query: "Show water changes in Krishna River" },
    { label: "Amazon Deforestation", query: "Show deforestation in the Amazon from 2021 to 2026" },
    { label: "Coastline in Mumbai", query: "How has the coastline changed in Mumbai?" },
    { label: "Changes in Andhra Pradesh", query: "Show me changes in Andhra Pradesh between 2021 and 2026" },
  ];

  return (
    <section id="hero" className="relative min-h-[85vh] flex flex-col justify-between overflow-hidden bg-white dark:bg-[#09090b] studio-grid border-b border-slate-200 dark:border-zinc-800 transition-colors">
      {/* Background Graphic Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        {/* Soft Radial Ambient Aura */}
        <div className="absolute top-1/4 right-0 lg:right-[-5%] w-[600px] lg:w-[850px] h-[600px] lg:h-[850px] rounded-full bg-gradient-to-br from-blue-500/10 via-emerald-500/5 to-transparent blur-3xl opacity-70" />

        {/* Photorealistic Scientific 3D Earth Visualization */}
        <div className="absolute -right-12 sm:-right-10 lg:right-[-2%] top-[12%] lg:top-[5%] w-[340px] sm:w-[500px] lg:w-[760px] h-[340px] sm:h-[500px] lg:h-[760px] pointer-events-none select-none">
          <RealisticEarth />
        </div>

        {/* Subtle Fade Gradients for High Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-transparent dark:from-[#09090b] dark:via-[#09090b]/95 dark:to-transparent lg:w-3/5 z-10 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent dark:from-[#09090b] dark:to-transparent z-10 pointer-events-none" />
      </div>

      {/* Hero Content Area */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 lg:px-8 pt-12 lg:pt-20 pb-12 w-full flex flex-col justify-center">
        <div className="max-w-3xl">
          {/* Status Badge */}
          <div className="inline-flex items-center space-x-2.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 backdrop-blur-md mb-6 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
            <span className="text-[11px] font-mono tracking-wider text-slate-700 dark:text-zinc-300 uppercase font-semibold">
              COPERNICUS MULTISPECTRAL OBSERVATION · REAL-TIME STAC
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.08] mb-6 font-sans">
            Earth Observation. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 dark:from-blue-400 dark:via-indigo-400 dark:to-sky-300">
              Clear. Explainable.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-300 max-w-xl font-normal leading-relaxed mb-8">
            Investigate environmental dynamics, deforestation, water security, and urban sprawl across real satellite imagery. Ask in plain language—get verifiable scientific indices and vector boundaries.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3.5 mb-10">
            <button
              type="button"
              onClick={onExploreClick}
              className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm tracking-wide transition-all shadow-md shadow-blue-500/25 flex items-center space-x-2 group cursor-pointer"
            >
              <span>Explore Satellite Maps</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Hero Query Interface */}
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xl shadow-slate-200/50 dark:shadow-black/60 transition-all">
            <div className="flex items-center space-x-2 px-1 pb-2.5 text-[11px] font-mono text-blue-600 dark:text-blue-400 font-bold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask Any Location on Earth</span>
            </div>

            <form onSubmit={handleSubmit} className="relative flex flex-col">
              <div className="relative flex items-center w-full">
                <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={queryInput}
                  onChange={(e) => {
                    setQueryInput(e.target.value);
                    if (inputFeedback) setInputFeedback(null);
                    if (disambiguation) setDisambiguation(null);
                  }}
                  placeholder="Ask about changes anywhere... (e.g. 'What changed in Vijayawada since 2021?')"
                  className="w-full pl-10 pr-28 py-3 bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 hover:border-blue-400 dark:hover:border-blue-500 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-blue-600 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all font-sans"
                  disabled={isAnalyzing}
                />
                {queryInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setQueryInput('');
                      setInputFeedback(null);
                      setDisambiguation(null);
                    }}
                    className="absolute right-28 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs px-1 cursor-pointer"
                    title="Clear input"
                  >
                    ✕
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isAnalyzing}
                  className="absolute right-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1.5 font-mono shadow-xs cursor-pointer"
                >
                  {isAnalyzing ? (
                    <>
                      <Activity className="w-3.5 h-3.5 animate-spin" />
                      <span>ANALYZING</span>
                    </>
                  ) : (
                    <>
                      <span>ANALYZE</span>
                      <ArrowRight className="w-3 h-3" />
                    </>
                  )}
                </button>
              </div>

              {/* Feedback Banner (Error / Warning / Info) */}
              {inputFeedback && (
                <div className={`mt-2.5 p-2.5 rounded-lg border text-xs flex items-start gap-2 animate-in fade-in ${
                  inputFeedback.type === 'error'
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                    : inputFeedback.type === 'warning'
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200'
                    : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
                }`}>
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{inputFeedback.message}</span>
                </div>
              )}

              {/* Disambiguation Prompt */}
              {disambiguation && (
                <div className="mt-2.5 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs animate-in fade-in">
                  <div className="font-semibold text-blue-900 dark:text-blue-200 mb-1.5 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>{disambiguation.question}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {disambiguation.options.map((opt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setDisambiguation(null);
                          setQueryInput(opt);
                          onSearch(opt);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-blue-300 dark:border-blue-700 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 text-slate-800 dark:text-zinc-200 text-xs font-medium transition-all cursor-pointer shadow-xs"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </form>

            {/* Try Asking Examples */}
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
              <div className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-2 font-medium">
                Try Asking:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {tryAskingExamples.map((ex, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleChipClick(ex.query)}
                    disabled={isAnalyzing}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800/80 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-700 border border-slate-200 dark:border-zinc-700 text-[11px] text-slate-700 dark:text-zinc-300 font-medium transition-all cursor-pointer"
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Purposeful Multi-Color Statistics Strip */}
      <div className="relative z-20 w-full bg-slate-50 dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800 py-6 transition-colors">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 grid grid-cols-2 md:grid-cols-5 gap-6">
          {/* Blue: Resolution */}
          <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 mb-1">
              <Satellite className="w-4 h-4" />
              <span className="text-xl lg:text-2xl font-black font-mono tracking-tight">10m GSD</span>
            </div>
            <div className="text-xs text-slate-600 dark:text-zinc-400 font-medium">
              Multispectral Ground Sample
            </div>
          </div>

          {/* Sky: STAC Coverage */}
          <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center space-x-2 text-sky-600 dark:text-sky-400 mb-1">
              <Globe2 className="w-4 h-4" />
              <span className="text-xl lg:text-2xl font-black font-mono tracking-tight">100% Real</span>
            </div>
            <div className="text-xs text-slate-600 dark:text-zinc-400 font-medium">
              Copernicus STAC Discovery
            </div>
          </div>

          {/* Green: Scientific Indices */}
          <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 mb-1">
              <Trees className="w-4 h-4" />
              <span className="text-xl lg:text-2xl font-black font-mono tracking-tight">3 Indices</span>
            </div>
            <div className="text-xs text-slate-600 dark:text-zinc-400 font-medium">
              NDVI · NDBI · NDWI
            </div>
          </div>

          {/* Orange: Vector Polygons */}
          <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center space-x-2 text-orange-600 dark:text-orange-400 mb-1">
              <Building2 className="w-4 h-4" />
              <span className="text-xl lg:text-2xl font-black font-mono tracking-tight">Vector</span>
            </div>
            <div className="text-xs text-slate-600 dark:text-zinc-400 font-medium">
              Hectare-Quantified Polygons
            </div>
          </div>

          {/* Red/Crimson: Time Machine */}
          <div className="col-span-2 md:col-span-1 p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xl lg:text-2xl font-black font-mono tracking-tight">2020–2026</span>
            </div>
            <div className="text-xs text-slate-600 dark:text-zinc-400 font-medium">
              Multi-Year Time Slider
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
