import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  MapPin, 
  Crosshair, 
  Activity, 
  Calendar, 
  HelpCircle, 
  ShieldCheck, 
  ChevronDown,
  ArrowRight,
  Compass,
  CheckCircle2
} from 'lucide-react';
import { AnalysisContext, ChatMessage, ChangeRegion } from '../lib/types';
import { sendChatMessage } from '../lib/api';
import { useLanguage } from '../i18n/LanguageContext';

interface ChatAnalystProps {
  context: AnalysisContext | null;
  onFilterCategory: (category: string | null) => void;
  onHighlightRegions: (regionIds: string[] | null) => void;
  onSelectRegion: (region: ChangeRegion | null) => void;
  onZoomTo: (coords: [number, number, number] | null) => void;
}

export const ChatAnalyst: React.FC<ChatAnalystProps> = ({
  context,
  onFilterCategory,
  onHighlightRegions,
  onSelectRegion,
  onZoomTo,
}) => {
  const { language, t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isUserNearBottomRef = useRef<boolean>(true);
  const prevMessagesCountRef = useRef<number>(0);
  const [hasNewUnseenMessages, setHasNewUnseenMessages] = useState<boolean>(false);

  // Monitor user scrolling to detect if user is reading older messages or near bottom
  const handleContainerScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const threshold = 75; // px from bottom considered "near bottom"
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const nearBottom = distanceFromBottom <= threshold;
    isUserNearBottomRef.current = nearBottom;
    if (nearBottom) {
      setHasNewUnseenMessages(false);
    }
  };

  const scrollToBottom = (smooth = true) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto',
    });
    isUserNearBottomRef.current = true;
    setHasNewUnseenMessages(false);
  };

  // Initialize analyst investigation when context changes or on mount
  useEffect(() => {
    if (!context) {
      const initialWelcomeMsg: ChatMessage = {
        id: 'init-msg',
        role: 'assistant',
        content: (
          `I am your **Geospatial AI Analyst**.\n\n` +
          `Ask me any question about satellite observations, spectral indices (NDVI, NDBI, NDWI), or select any city to analyze.`
        ),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: [
          "What is NDVI?",
          "What is NDBI?",
          "How does Copernicus Sentinel-2 work?"
        ],
      };
      setMessages([initialWelcomeMsg]);
      return;
    }

    const initialAiMsg: ChatMessage = {
      id: 'init-msg',
      role: 'assistant',
      content: (
        `I am your **Geospatial AI Analyst** for **${context.location.name}**.\n\n` +
        `Ask me any specific question about vegetation, urban expansion, water bodies, or map hotspots.`
      ),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        "How did vegetation change?",
        "Where did the biggest change happen?",
        "How much urban development occurred?",
        "When did changes happen?"
      ],
    };

    setMessages([initialAiMsg]);
  }, [context?.analysis_id]);

  // Intelligent auto-scroll: Respect user manual scroll position
  useEffect(() => {
    const isNewMessage = messages.length > prevMessagesCountRef.current;
    prevMessagesCountRef.current = messages.length;

    if (isUserNearBottomRef.current) {
      // User is already reading near the bottom -> smooth auto-scroll to keep newest message visible
      scrollToBottom(true);
    } else if (isNewMessage) {
      // User has manually scrolled upward to read older messages -> DO NOT FORCE SCROLL!
      // Display a floating "↓ New response" button instead
      setHasNewUnseenMessages(true);
    }
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputVal).trim();
    if (!query || isSending) return;

    setInputVal('');
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsSending(true);

    if (isUserNearBottomRef.current) {
      setTimeout(() => scrollToBottom(true), 40);
    }

    try {
      // Retain full conversational history
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res: any = await sendChatMessage({
        analysis_id: context ? context.analysis_id : 'general',
        message: query,
        history: historyPayload,
        language,
      });

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: res.suggested_actions,
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Execute suggested map actions from AI (Ask -> Map -> Answer loop)
      if (context) {
        if (res.filter_category !== undefined) {
          onFilterCategory(res.filter_category === 'ALL' ? null : res.filter_category);
        }
        if (res.highlight_region_ids !== undefined) {
          onHighlightRegions(res.highlight_region_ids);
        }
        if (res.selected_region_id) {
          const match = context.change_regions.find((r) => r.id === res.selected_region_id);
          if (match) {
            onSelectRegion(match);
          }
        }
        if (res.zoom_to && Array.isArray(res.zoom_to) && res.zoom_to.length >= 2) {
          onZoomTo(res.zoom_to as [number, number, number]);
        }
      }
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'system',
        content: `Geospatial Analyst error: ${err.message || 'Network failure'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsSending(false);
    }
  };

  // Quick Action Handler for [SHOW ON MAP]
  const handleShowBiggestOnMap = () => {
    if (!context || context.change_regions.length === 0) return;
    const sorted = [...context.change_regions].sort((a, b) => b.area_hectares - a.area_hectares);
    const top = sorted[0];
    onSelectRegion(top);
    onHighlightRegions([top.id]);
    onZoomTo([top.centroid[0], top.centroid[1], 14.2]);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 backdrop-blur-xl font-sans text-slate-800 dark:text-slate-100">
      {/* Analyst Panel Header */}
      <div className="p-3.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/80 dark:bg-zinc-800/40">
        <div className="flex items-center space-x-2.5">
          <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-xs text-slate-900 dark:text-white tracking-wide">
              {t('chat.title')}
            </h3>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-telemetry flex items-center space-x-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
              <span>{t('chat.activeInvestigation')}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          {context && (
            <span className="text-[10px] font-telemetry px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-blue-700 dark:text-blue-300 font-semibold">
              {context.location.name}
            </span>
          )}
        </div>
      </div>

      {/* Messages Scroll Area with Isolated Scroll Container */}
      <div className="flex-1 relative overflow-hidden flex flex-col min-h-0">
        <div
          ref={scrollContainerRef}
          onScroll={handleContainerScroll}
          className="flex-1 p-3.5 overflow-y-auto space-y-4 text-xs overscroll-contain"
        >
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${
                m.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              {/* Message Meta Tag */}
              <div className="flex items-center space-x-1.5 mb-1 text-[10px] font-telemetry text-slate-500 dark:text-slate-400">
                {m.role === 'user' ? (
                  <span>You • {m.timestamp}</span>
                ) : m.role === 'assistant' ? (
                  <>
                    <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    <span className="text-blue-700 dark:text-blue-300 font-medium">SatQueryAI Intelligence</span>
                    <span>•</span>
                    <span>{m.timestamp}</span>
                  </>
                ) : (
                  <span className="text-rose-600 dark:text-rose-400">System Notification</span>
                )}
              </div>

              {/* Bubble */}
              <div
                className={`p-3.5 rounded-2xl max-w-[94%] leading-relaxed shadow-sm ${
                  m.role === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-sm shadow-md'
                    : m.role === 'assistant'
                    ? 'bg-slate-50 dark:bg-zinc-800/90 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-slate-100 rounded-tl-sm'
                    : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans text-xs leading-relaxed">{m.content}</div>

                {/* Integrated Investigation Actions for Assistant Messages */}
                {m.role === 'assistant' && context && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-zinc-700/60 flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={handleShowBiggestOnMap}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-300 text-[10.5px] font-telemetry font-medium transition-all flex items-center space-x-1"
                    >
                      <Crosshair className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      <span>{t('chat.showOnMap')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSendMessage("What is the spectral evidence for this change?")}
                      disabled={isSending}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:white text-[10.5px] font-telemetry transition-all flex items-center space-x-1"
                    >
                      <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span>{t('chat.viewEvidence')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSendMessage("When did the change happen across observations?")}
                      disabled={isSending}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:white text-[10.5px] font-telemetry transition-all flex items-center space-x-1"
                    >
                      <Calendar className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      <span>{t('chat.whenHappened')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSendMessage("Why did SatQueryAI classify this as development?")}
                      disabled={isSending}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:white text-[10.5px] font-telemetry transition-all flex items-center space-x-1"
                    >
                      <HelpCircle className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                      <span>{t('chat.why')}</span>
                    </button>
                  </div>
                )}

                {/* Follow-up Question Suggestion Pills */}
                {m.suggestedActions && m.suggestedActions.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-zinc-750/70 flex flex-wrap gap-1">
                    {m.suggestedActions.map((action, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendMessage(action)}
                        disabled={isSending}
                        className="px-2.5 py-1 rounded-full bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-300 text-[10px] font-sans transition-colors text-left shadow-2xs"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isSending && (
            <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 text-xs font-telemetry p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 w-fit">
              <Activity className="w-3.5 h-3.5 animate-spin text-blue-600 dark:text-blue-400" />
              <span>{t('chat.analyzing')}</span>
            </div>
          )}

          <div ref={messagesEndRef} className="h-0.5 w-full pointer-events-none" />
        </div>

        {/* Floating "↓ New response" Pill when user has manually scrolled upward */}
        {hasNewUnseenMessages && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <button
              type="button"
              onClick={() => scrollToBottom(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-sans font-semibold shadow-lg hover:shadow-xl transition-all cursor-pointer border border-blue-400/30"
              title="Click to scroll to latest AI response"
            >
              <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
              <span>↓ {t('chat.newResponse')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Input Field Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/90 dark:bg-zinc-950/90"
      >
        <div className="relative flex items-center">
          <input
            id="chat-analyst-input"
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={context ? `${t('chat.placeholder')} (${context.location.name})` : t('chat.placeholder')}
            disabled={isSending}
            className="w-full pl-3.5 pr-10 py-2.5 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 disabled:opacity-50 shadow-inner"
          />
          <button
            type="submit"
            disabled={!inputVal.trim() || isSending}
            title={t('chat.send')}
            className="absolute right-1.5 p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-bold shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
