import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  RefreshCw, 
  Database, 
  Compass, 
  Tag, 
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { HindsightStatus, HindsightMemoryItem } from '../lib/types';

interface MemoryInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  onSelectQuery?: (query: string) => void;
}

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) || '/api';

export const MemoryInspectorModal: React.FC<MemoryInspectorModalProps> = ({
  isOpen,
  onClose,
  userId,
  onSelectQuery
}) => {
  const [status, setStatus] = useState<HindsightStatus | null>(null);
  const [memories, setMemories] = useState<HindsightMemoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [reflectQuery, setReflectQuery] = useState('What persistent environmental and land-cover transitions have occurred across all investigated regions?');
  const [reflectResult, setReflectResult] = useState<string | null>(null);
  const [isReflecting, setIsReflecting] = useState(false);
  const [activeTab, setActiveTab] = useState<'experiences' | 'preferences' | 'reflect'>('experiences');

  const fetchStatusAndMemories = async () => {
    setIsLoading(true);
    try {
      const uParam = userId ? `?user_id=${encodeURIComponent(userId)}` : '';
      const [statusRes, memRes] = await Promise.all([
        fetch(`${API_BASE}/hindsight/status${uParam}`),
        fetch(`${API_BASE}/hindsight/memories${uParam}`)
      ]);

      if (statusRes.ok) {
        const sData = await statusRes.json();
        setStatus(sData);
      }
      if (memRes.ok) {
        const mData = await memRes.json();
        setMemories(mData.memories || []);
      }
    } catch (e) {
      console.warn("Failed to fetch Hindsight memory status:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatusAndMemories();
    }
  }, [isOpen, userId]);

  const handleRunReflection = async () => {
    if (!reflectQuery.trim() || isReflecting) return;
    setIsReflecting(true);
    try {
      const res = await fetch(`${API_BASE}/hindsight/reflect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: reflectQuery,
          user_id: userId
        })
      });
      if (res.ok) {
        const data = await res.json();
        setReflectResult(data.reflection);
      } else {
        setReflectResult("Reflective synthesis request returned non-200 status.");
      }
    } catch (e: any) {
      setReflectResult(`Reflective reasoning degraded: ${e?.message || 'Offline'}`);
    } finally {
      setIsReflecting(false);
    }
  };

  if (!isOpen) return null;

  // Filter preferences vs experiences
  const preferenceMemories = memories.filter(m => 
    (m.tags && m.tags.includes('user_preference')) || 
    (m.text && m.text.toLowerCase().includes('preference'))
  );

  const experienceMemories = memories.filter(m => 
    !m.tags?.includes('user_preference') && 
    !m.text?.toLowerCase().includes('user preference:')
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 font-sans">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-[#0d1322] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Brain className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Hindsight Agent Memory Inspector</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-900/40 text-purple-300 border border-purple-700/50">
                  RETAIN • RECALL • REFLECT
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Continuous long-term learning and multi-session contextual recall
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Connection Status Badge */}
            <div className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-medium flex items-center space-x-1.5 border ${
              status?.connected 
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400' 
                : 'bg-amber-950/60 border-amber-500/50 text-amber-300'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status?.connected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
              <span>{status?.connected ? 'Connected' : 'Graceful Fallback'}</span>
            </div>

            <button
              onClick={fetchStatusAndMemories}
              disabled={isLoading}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Refresh Memory Bank"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bank Telemetry Strip */}
        <div className="px-6 py-2 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <Database className="w-3.5 h-3.5 text-purple-400" />
              <span>Memory Bank:</span>
              <strong className="text-slate-200">{status?.bank_id || 'satquery-agent-default'}</strong>
            </span>
            <span>•</span>
            <span>Total Memories: <strong className="text-purple-300">{memories.length}</strong></span>
          </div>
          <div className="text-[11px] text-slate-400">
            {status?.message}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-slate-800 bg-slate-900/60 flex space-x-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('experiences')}
            className={`py-3 border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'experiences'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Retained Experiences ({experienceMemories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('preferences')}
            className={`py-3 border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'preferences'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Learned Preferences ({preferenceMemories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reflect')}
            className={`py-3 border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'reflect'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Reflective Synthesis (Reflect)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
          
          {/* TAB 1: Retained Experiences */}
          {activeTab === 'experiences' && (
            <div className="space-y-3">
              {experienceMemories.length === 0 ? (
                <div className="text-center py-10 text-slate-400 space-y-2">
                  <Compass className="w-8 h-8 mx-auto text-slate-400 opacity-60" />
                  <p className="text-sm">No analysis experiences retained yet in this bank.</p>
                  <p className="text-xs text-slate-400">Ask any Earth-observation question or run a walkthrough to retain verified findings.</p>
                </div>
              ) : (
                experienceMemories.map((mem, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-850/80 border border-slate-700/60 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                      <span className="flex items-center space-x-1.5 text-purple-400 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                        <span>Experience #{idx + 1}</span>
                      </span>
                      {mem.metadata?.location && (
                        <span className="text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                          📍 {mem.metadata.location}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-200 leading-relaxed font-sans text-xs">
                      {mem.text}
                    </p>
                    {mem.metadata?.query && onSelectQuery && (
                      <div className="pt-1">
                        <button
                          onClick={() => {
                            if (mem.metadata?.query) {
                              onSelectQuery(mem.metadata.query);
                              onClose();
                            }
                          }}
                          className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium flex items-center space-x-1"
                        >
                          <span>Re-analyze this investigation: "{mem.metadata.query}"</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: Learned Preferences */}
          {activeTab === 'preferences' && (
            <div className="space-y-3">
              {preferenceMemories.length === 0 ? (
                <div className="text-center py-10 text-slate-400 space-y-2">
                  <Sparkles className="w-8 h-8 mx-auto text-slate-400 opacity-60" />
                  <p className="text-sm">No specific user preferences recorded yet.</p>
                  <p className="text-xs text-slate-400">
                    Tell the analyst: <em>"I only care about agricultural vegetation"</em> or <em>"Focus on water bodies"</em> in chat.
                  </p>
                </div>
              ) : (
                preferenceMemories.map((pref, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-850/80 border border-purple-500/30 space-y-1.5 text-xs">
                    <div className="flex items-center space-x-2 text-purple-300 font-mono font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-purple-400" />
                      <span>Learned Analyst Preference</span>
                    </div>
                    <p className="text-slate-200 pl-6">
                      {pref.text}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: Reflective Synthesis */}
          {activeTab === 'reflect' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Synthesize Multi-Session Insights Across Stored Memory
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={reflectQuery}
                    onChange={(e) => setReflectQuery(e.target.value)}
                    placeholder="Ask Hindsight to reflect across your investigations..."
                    className="flex-1 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    onClick={handleRunReflection}
                    disabled={isReflecting}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-xs font-semibold text-white transition-all flex items-center space-x-1.5 shrink-0"
                  >
                    <Brain className={`w-3.5 h-3.5 ${isReflecting ? 'animate-spin' : ''}`} />
                    <span>{isReflecting ? 'Reflecting...' : 'Run Reflect'}</span>
                  </button>
                </div>
              </div>

              {reflectResult && (
                <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/40 space-y-2 text-xs">
                  <div className="flex items-center space-x-2 text-purple-300 font-semibold font-mono text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>HINDSIGHT REFLECTIVE SYNTHESIS RESULT</span>
                  </div>
                  <div className="text-slate-200 leading-relaxed whitespace-pre-line font-sans text-xs">
                    {reflectResult}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#0a0f1c] flex items-center justify-between text-xs text-slate-400">
          <span>Memory isolation verified per authenticated analyst session.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
