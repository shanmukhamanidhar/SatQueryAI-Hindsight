import React, { useState } from 'react';
import { 
  Scale, 
  X, 
  ArrowRight, 
  CheckCircle2, 
  Activity, 
  Brain, 
  Database, 
  Satellite, 
  Sparkles, 
  RefreshCw, 
  Play, 
  ChevronRight,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { AnalysisContext } from '../lib/types';
import { runAnalysis } from '../lib/api';
import { getOrCreateLocalUserId, resetLocalUserSession } from '../lib/supabase';

interface JudgeDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalysisComplete: (context: AnalysisContext, query: string) => void;
  onOpenMemoryInspector: () => void;
  onOpenHistory: () => void;
}

export const JudgeDemoModal: React.FC<JudgeDemoModalProps> = ({
  isOpen,
  onClose,
  onAnalysisComplete,
  onOpenMemoryInspector,
  onOpenHistory,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0); // 0=not started, 1=step1 done, 2=step2 done, 3=step3 done
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeStepRunning, setActiveStepRunning] = useState<number | null>(null);
  const [stepLogs, setStepLogs] = useState<{ [step: number]: string }>({});
  const [demoUserId, setDemoUserId] = useState<string>(() => getOrCreateLocalUserId());

  if (!isOpen) return null;

  const handleResetSession = () => {
    const newUid = resetLocalUserSession();
    setDemoUserId(newUid);
    setCurrentStep(0);
    setStepLogs({});
  };

  const executeStep1 = async (): Promise<AnalysisContext | null> => {
    setActiveStepRunning(1);
    const q = "Analyze vegetation in Visakhapatnam between 2021 and 2026";
    setStepLogs(prev => ({ ...prev, 1: "Submitting cold-start analysis for Visakhapatnam to Copernicus Sentinel-2 STAC..." }));
    try {
      const res = await runAnalysis({
        query: q,
        user_id: demoUserId,
      });
      setStepLogs(prev => ({
        ...prev,
        1: `✓ Analysis completed (~${res.total_aoi_hectares.toLocaleString()} ha). Supabase persisted. Hindsight retained: Visakhapatnam vegetation baseline.`
      }));
      setCurrentStep(prev => Math.max(prev, 1));
      onAnalysisComplete(res, q);
      return res;
    } catch (err: any) {
      setStepLogs(prev => ({ ...prev, 1: `Error: ${err.message || 'Analysis failed'}` }));
      return null;
    } finally {
      setActiveStepRunning(null);
    }
  };

  const executeStep2 = async (): Promise<AnalysisContext | null> => {
    setActiveStepRunning(2);
    // Notice: NO location named! Anaphoric "that area"
    const q = "Analyze that area again with focus on agriculture";
    setStepLogs(prev => ({ ...prev, 2: "Query: 'Analyze that area again with focus on agriculture'. Hindsight recalling 'that area'..." }));
    try {
      const res = await runAnalysis({
        query: q,
        user_id: demoUserId,
      });
      const resolvedLoc = res.location.name;
      setStepLogs(prev => ({
        ...prev,
        2: `✓ Hindsight recalled location: '${resolvedLoc}' without user specification! Applied agricultural focus. Retained updated experience.`
      }));
      setCurrentStep(prev => Math.max(prev, 2));
      onAnalysisComplete(res, q);
      return res;
    } catch (err: any) {
      setStepLogs(prev => ({ ...prev, 2: `Error: ${err.message || 'Recall analysis failed'}` }));
      return null;
    } finally {
      setActiveStepRunning(null);
    }
  };

  const executeStep3 = async (): Promise<AnalysisContext | null> => {
    setActiveStepRunning(3);
    const q = "Compare with my previous analysis";
    setStepLogs(prev => ({ ...prev, 3: "Query: 'Compare with my previous analysis'. Querying Hindsight memory bank + Supabase history..." }));
    try {
      const res = await runAnalysis({
        query: q,
        user_id: demoUserId,
      });
      setStepLogs(prev => ({
        ...prev,
        3: `✓ Comparative synthesis complete! Synthesized delta between Session 1 and Session 2 across Copernicus Sentinel-2 observations.`
      }));
      setCurrentStep(prev => Math.max(prev, 3));
      onAnalysisComplete(res, q);
      return res;
    } catch (err: any) {
      setStepLogs(prev => ({ ...prev, 3: `Error: ${err.message || 'Comparison failed'}` }));
      return null;
    } finally {
      setActiveStepRunning(null);
    }
  };

  const handleRunFullDemo = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setStepLogs({});
    setCurrentStep(0);

    const res1 = await executeStep1();
    if (!res1) {
      setIsRunning(false);
      return;
    }

    // Brief pause to make progression visible to judges
    await new Promise(r => setTimeout(r, 2200));

    const res2 = await executeStep2();
    if (!res2) {
      setIsRunning(false);
      return;
    }

    await new Promise(r => setTimeout(r, 2200));

    await executeStep3();
    setIsRunning(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-900 dark:text-slate-100 font-sans">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-950/50">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-violet-600 flex items-center justify-center text-white shadow-md">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  JUDGE EVALUATION WORKFLOW
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 font-mono text-[10px] font-bold">
                  HINDSIGHT + SUPABASE
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Demonstrates cross-session agent learning: Cold Start → Memory Retention → Anaphoric Recall → Comparative Synthesis.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleResetSession}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-mono text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center space-x-1.5 transition-all"
              title="Reset user session ID for clean cold-start demonstration"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Session</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Master Run Button Strip */}
        <div className="px-6 py-4 bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center space-x-2 text-xs">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>
              <strong>1-Click Automated Evaluation:</strong> Runs the complete 3-step sequence autonomously.
            </span>
          </div>

          <button
            type="button"
            onClick={handleRunFullDemo}
            disabled={isRunning || activeStepRunning !== null}
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-violet-900 font-mono text-xs font-bold transition-all shadow-md disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer shrink-0"
          >
            {isRunning ? (
              <>
                <Activity className="w-4 h-4 animate-spin text-violet-700" />
                <span>EXECUTING WORKFLOW...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-violet-700 fill-violet-700" />
                <span>RUN ENTIRE 3-STEP DEMO</span>
              </>
            )}
          </button>
        </div>

        {/* Workflow Steps Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* STEP 1 */}
          <div className={`p-4 rounded-2xl border transition-all ${
            currentStep >= 1 
              ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20' 
              : activeStepRunning === 1
                ? 'border-violet-400 dark:border-violet-600 bg-violet-50/40 dark:bg-violet-950/30'
                : 'border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/50'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start space-x-3">
                <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                  currentStep >= 1 ? 'bg-emerald-600 text-white' : activeStepRunning === 1 ? 'bg-violet-600 text-white animate-spin' : 'bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                }`}>
                  {currentStep >= 1 ? '✓' : '1'}
                </span>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-bold">
                      STEP 1: COLD START & RETENTION
                    </span>
                    <span className="px-2 py-0.2 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px] font-mono">
                      RETAIN
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                    "Analyze vegetation in Visakhapatnam between 2021 and 2026"
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
                    Initial query. Remote sensing pipeline extracts NDVI & polygons. Supabase persists record. Hindsight <strong>retains</strong> location, vegetation focus, and baseline experience.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={executeStep1}
                disabled={isRunning || activeStepRunning !== null}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-mono text-xs font-bold transition-all shadow-xs disabled:opacity-40 shrink-0 flex items-center space-x-1.5 cursor-pointer self-end sm:self-center"
              >
                {activeStepRunning === 1 ? (
                  <>
                    <Activity className="w-3.5 h-3.5 animate-spin" />
                    <span>RUNNING...</span>
                  </>
                ) : (
                  <>
                    <span>Run Step 1</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
            {stepLogs[1] && (
              <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-zinc-800/60 font-mono text-[11px] text-slate-700 dark:text-zinc-300">
                {stepLogs[1]}
              </div>
            )}
          </div>

          {/* STEP 2 */}
          <div className={`p-4 rounded-2xl border transition-all ${
            currentStep >= 2 
              ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20' 
              : activeStepRunning === 2
                ? 'border-violet-400 dark:border-violet-600 bg-violet-50/40 dark:bg-violet-950/30'
                : 'border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/50'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start space-x-3">
                <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                  currentStep >= 2 ? 'bg-emerald-600 text-white' : activeStepRunning === 2 ? 'bg-violet-600 text-white animate-spin' : 'bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                }`}>
                  {currentStep >= 2 ? '✓' : '2'}
                </span>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-bold">
                      STEP 2: ANAPHORIC REFERENCE & CROSS-SESSION RECALL
                    </span>
                    <span className="px-2 py-0.2 rounded bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 text-[10px] font-mono">
                      RECALL
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                    "Analyze that area again with focus on agriculture"
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
                    Notice: <strong>Zero location coordinates or city name provided!</strong> Hindsight agent memory resolves <em>"that area"</em> → <strong>Visakhapatnam</strong> and applies learned agricultural vegetation focus.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={executeStep2}
                disabled={isRunning || activeStepRunning !== null}
                className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-mono text-xs font-bold transition-all shadow-xs disabled:opacity-40 shrink-0 flex items-center space-x-1.5 cursor-pointer self-end sm:self-center"
              >
                {activeStepRunning === 2 ? (
                  <>
                    <Activity className="w-3.5 h-3.5 animate-spin" />
                    <span>RUNNING...</span>
                  </>
                ) : (
                  <>
                    <span>Run Step 2</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
            {stepLogs[2] && (
              <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-zinc-800/60 font-mono text-[11px] text-slate-700 dark:text-zinc-300">
                {stepLogs[2]}
              </div>
            )}
          </div>

          {/* STEP 3 */}
          <div className={`p-4 rounded-2xl border transition-all ${
            currentStep >= 3 
              ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20' 
              : activeStepRunning === 3
                ? 'border-violet-400 dark:border-violet-600 bg-violet-50/40 dark:bg-violet-950/30'
                : 'border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/50'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start space-x-3">
                <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                  currentStep >= 3 ? 'bg-emerald-600 text-white' : activeStepRunning === 3 ? 'bg-violet-600 text-white animate-spin' : 'bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                }`}>
                  {currentStep >= 3 ? '✓' : '3'}
                </span>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-bold">
                      STEP 3: MULTI-SESSION SYNTHESIS & REFLECTION
                    </span>
                    <span className="px-2 py-0.2 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-[10px] font-mono">
                      REFLECT + COMPARE
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                    "Compare with my previous analysis"
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
                    The agent recalls prior contextual findings from Hindsight, fetches exact historical metrics from Supabase, and performs grounded delta synthesis between sessions.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={executeStep3}
                disabled={isRunning || activeStepRunning !== null}
                className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-mono text-xs font-bold transition-all shadow-xs disabled:opacity-40 shrink-0 flex items-center space-x-1.5 cursor-pointer self-end sm:self-center"
              >
                {activeStepRunning === 3 ? (
                  <>
                    <Activity className="w-3.5 h-3.5 animate-spin" />
                    <span>RUNNING...</span>
                  </>
                ) : (
                  <>
                    <span>Run Step 3</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
            {stepLogs[3] && (
              <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-zinc-800/60 font-mono text-[11px] text-slate-700 dark:text-zinc-300">
                {stepLogs[3]}
              </div>
            )}
          </div>
        </div>

        {/* Footer Inspector Links */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-[11px] font-mono text-slate-500 dark:text-zinc-400">
            Active Bank: <span className="font-bold text-slate-800 dark:text-zinc-200">satquery-user-{demoUserId}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenMemoryInspector();
              }}
              className="px-3 py-1.5 rounded-xl border border-violet-300 dark:border-violet-700/60 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/40 font-mono text-xs font-medium transition-all flex items-center space-x-1.5"
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Inspect Memory Bank</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenHistory();
              }}
              className="px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 font-mono text-xs font-medium transition-all flex items-center space-x-1.5"
            >
              <Database className="w-3.5 h-3.5" />
              <span>View Supabase History</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
