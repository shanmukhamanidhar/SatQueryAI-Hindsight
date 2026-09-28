import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  Layers, 
  Sparkles, 
  ArrowRight, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Sliders, 
  Eye, 
  EyeOff, 
  Bot, 
  Send, 
  Play, 
  Pause, 
  RotateCcw, 
  TrendingUp, 
  MapPin, 
  Compass, 
  FileText, 
  Maximize2, 
  Info,
  ChevronRight,
  SplitSquareVertical,
  Columns,
  Flame,
  HelpCircle,
  Satellite,
  X
} from 'lucide-react';
import { 
  uploadSingleImage, 
  uploadCompareImages, 
  uploadMultipleImages, 
  uploadChat, 
  getUploadSamples 
} from '../lib/api';

// Canonical category color system (strictly synchronized across all components)
const CANONICAL_COLORS: Record<string, string> = {
  vegetation: '#10b981',   // Emerald Green
  urban: '#f97316',        // Vibrant Orange
  water: '#0284c7',        // Sky/Ocean Blue
  bare_soil: '#d97706',    // Amber / Earthy
  loss: '#ef4444',         // Crimson Red
  unclassified: '#64748b'  // Slate Gray
};

export const UploadStudio: React.FC<{
  onClose?: () => void;
  onOpenLiveStudio?: () => void;
}> = ({ onClose, onOpenLiveStudio }) => {
  // Main sub-mode tab: 'single' | 'compare' | 'multiple'
  const [subMode, setSubMode] = useState<'single' | 'compare' | 'multiple'>('single');

  // Sample presets loaded from backend
  const [samples, setSamples] = useState<any>(null);
  const [isLoadingSamples, setIsLoadingSamples] = useState(false);

  // Global loading and error states
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // -------------------------------------------------------------------------
  // SUB-MODE 1: SINGLE IMAGE STATE
  // -------------------------------------------------------------------------
  const [singleImageFile, setSingleImageFile] = useState<File | null>(null);
  const [singleImageDataUrl, setSingleImageDataUrl] = useState<string | null>(null);
  const [singleAnalysis, setSingleAnalysis] = useState<any>(null);
  const [singleActiveOverlay, setSingleActiveOverlay] = useState<'original' | 'segmentation' | 'vegetation' | 'urban' | 'water'>('segmentation');
  const [singleOverlayOpacity, setSingleOverlayOpacity] = useState<number>(75);

  // -------------------------------------------------------------------------
  // SUB-MODE 2: TWO IMAGE COMPARISON STATE
  // -------------------------------------------------------------------------
  const [compareImage1, setCompareImage1] = useState<{ file?: File; dataUrl: string; label: string } | null>(null);
  const [compareImage2, setCompareImage2] = useState<{ file?: File; dataUrl: string; label: string } | null>(null);
  const [compareAnalysis, setCompareAnalysis] = useState<any>(null);
  const [compareViewMode, setCompareViewMode] = useState<'swipe' | 'side-by-side' | 'heatmap'>('swipe');
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [selectedHotspot, setSelectedHotspot] = useState<any>(null);
  const [showHotspotPins, setShowHotspotPins] = useState<boolean>(true);

  // -------------------------------------------------------------------------
  // SUB-MODE 3: MULTIPLE IMAGE TIMELINE STATE
  // -------------------------------------------------------------------------
  const [timelineImages, setTimelineImages] = useState<Array<{ file?: File; dataUrl: string; label: string }>>([]);
  const [multipleAnalysis, setMultipleAnalysis] = useState<any>(null);
  const [activeFrameIndex, setActiveFrameIndex] = useState<number>(0);
  const [isPlayingTimeline, setIsPlayingTimeline] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1500); // ms per step

  // -------------------------------------------------------------------------
  // CHATBOT STATE (Focused concise chatbot for active analysis)
  // -------------------------------------------------------------------------
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isChatSending, setIsChatSending] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const chatLogContainerRef = useRef<HTMLDivElement>(null);
  const compareChatLogContainerRef = useRef<HTMLDivElement>(null);

  // Load sample presets on mount
  useEffect(() => {
    setIsLoadingSamples(true);
    getUploadSamples()
      .then(res => setSamples(res))
      .catch(err => console.warn('Could not load samples', err))
      .finally(() => setIsLoadingSamples(false));
  }, []);

  // Scroll chat messages to bottom within their own isolated scroll container
  // Strictly prevent window or page scroll jumps
  useEffect(() => {
    if (chatLogContainerRef.current) {
      chatLogContainerRef.current.scrollTop = chatLogContainerRef.current.scrollHeight;
    }
    if (compareChatLogContainerRef.current) {
      compareChatLogContainerRef.current.scrollTop = compareChatLogContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Autoplay loop for timeline
  useEffect(() => {
    const totalF = multipleAnalysis?.total_frames || multipleAnalysis?.frames_count || multipleAnalysis?.frames?.length || 0;
    if (!isPlayingTimeline || totalF < 2) return;
    const interval = setInterval(() => {
      setActiveFrameIndex((prev) => (prev + 1) % totalF);
    }, playbackSpeed);
    return () => clearInterval(interval);
  }, [isPlayingTimeline, multipleAnalysis, playbackSpeed]);

  // Helper: Read a File into a Data URL
  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Helper: Fetch a sample URL and convert to Data URL
  const fetchUrlAsDataUrl = async (url: string): Promise<string> => {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // -------------------------------------------------------------------------
  // HANDLERS: SUB-MODE 1 (SINGLE IMAGE)
  // -------------------------------------------------------------------------
  const handleSingleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setErrorMessage(null);
      setSingleImageFile(file);
      const dataUrl = await readFileAsDataUrl(file);
      setSingleImageDataUrl(dataUrl);
      await runSingleAnalysis(dataUrl, file.name);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to read image file');
    }
  };

  const runSingleAnalysis = async (dataUrl: string, filename?: string) => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const result = await uploadSingleImage({
        image_data: dataUrl,
        filename: filename || 'uploaded_satellite.png'
      });
      setSingleAnalysis(result);
      const metrics = result.metrics || result.land_cover || {};
      setChatMessages([
        {
          role: 'assistant',
          content: `Analysis complete. Identified ${result.estimated_area?.name || 'satellite raster'} with ${metrics.vegetation_pct ?? 0}% vegetation and ${metrics.urban_pct ?? 0}% urban cover. Ask me any specific question about this image.`
        }
      ]);
    } catch (err: any) {
      setErrorMessage(err.message || 'Analysis failed. Please ensure the file is an optical satellite image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const loadSingleSample = async (sample: any) => {
    try {
      setIsProcessing(true);
      setErrorMessage(null);
      const dataUrl = sample.image_data || (sample.sample_image_url ? await fetchUrlAsDataUrl(sample.sample_image_url) : null);
      if (!dataUrl) throw new Error("Could not extract sample image data");
      setSingleImageDataUrl(dataUrl);
      setSingleImageFile(null);
      await runSingleAnalysis(dataUrl, sample.title);
    } catch (err: any) {
      setErrorMessage('Failed to load sample: ' + err.message);
      setIsProcessing(false);
    }
  };

  // -------------------------------------------------------------------------
  // HANDLERS: SUB-MODE 2 (TWO IMAGE COMPARISON)
  // -------------------------------------------------------------------------
  const handleCompareUpload1 = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    setCompareImage1({ file, dataUrl, label: file.name.replace(/\.[^/.]+$/, "") });
  };

  const handleCompareUpload2 = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    setCompareImage2({ file, dataUrl, label: file.name.replace(/\.[^/.]+$/, "") });
  };

  const runComparison = async () => {
    if (!compareImage1 || !compareImage2) {
      setErrorMessage('Please upload both Before and After satellite images to compare.');
      return;
    }
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const result = await uploadCompareImages({
        image1_data: compareImage1.dataUrl,
        image2_data: compareImage2.dataUrl,
        label1: compareImage1.label || 'Before',
        label2: compareImage2.label || 'After',
        filename1: compareImage1.file?.name,
        filename2: compareImage2.file?.name
      });
      setCompareAnalysis(result);
      setSelectedHotspot(result.hotspots?.[0] || null);
      const deltas = result.delta_metrics || result.deltas || {};
      setChatMessages([
        {
          role: 'assistant',
          content: `Differential change analysis ready: Urban change is ${deltas.urban_delta_pct > 0 ? '+' : ''}${deltas.urban_delta_pct}%, Vegetation change is ${deltas.vegetation_delta_pct > 0 ? '+' : ''}${deltas.vegetation_delta_pct}%. Detected ${result.hotspots?.length || 0} focal change hotspots. Ask me anything about these differences.`
        }
      ]);
    } catch (err: any) {
      setErrorMessage(err.message || 'Comparison failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const loadCompareSample = async (sample: any) => {
    try {
      setIsProcessing(true);
      setErrorMessage(null);
      const dataUrl1 = sample.image1_data || (sample.image1_url ? await fetchUrlAsDataUrl(sample.image1_url) : null);
      const dataUrl2 = sample.image2_data || (sample.image2_url ? await fetchUrlAsDataUrl(sample.image2_url) : null);
      if (!dataUrl1 || !dataUrl2) throw new Error("Missing sample compare image data");

      setCompareImage1({ dataUrl: dataUrl1, label: sample.label1 || 'Before' });
      setCompareImage2({ dataUrl: dataUrl2, label: sample.label2 || 'After' });
      
      const result = await uploadCompareImages({
        image1_data: dataUrl1,
        image2_data: dataUrl2,
        label1: sample.label1 || 'Before',
        label2: sample.label2 || 'After',
        filename1: sample.filename1 || 'sample_before.jpg',
        filename2: sample.filename2 || 'sample_after.jpg'
      });
      setCompareAnalysis(result);
      setSelectedHotspot(result.hotspots?.[0] || null);
      const deltas = result.delta_metrics || result.deltas || {};
      setChatMessages([
        {
          role: 'assistant',
          content: `Loaded sample comparison: ${sample.title}. Urban net delta is ${deltas.urban_delta_pct > 0 ? '+' : ''}${deltas.urban_delta_pct}%. Ask any specific question.`
        }
      ]);
    } catch (err: any) {
      setErrorMessage('Failed to load sample: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // -------------------------------------------------------------------------
  // HANDLERS: SUB-MODE 3 (MULTIPLE IMAGE TIMELINE)
  // -------------------------------------------------------------------------
  const handleTimelineUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      const newItems: Array<{ file: File; dataUrl: string; label: string }> = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const dataUrl = await readFileAsDataUrl(file);
        newItems.push({
          file,
          dataUrl,
          label: `Frame ${timelineImages.length + i + 1} (${file.name.replace(/\.[^/.]+$/, "")})`
        });
      }
      setTimelineImages(prev => [...prev, ...newItems]);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to read image files');
    }
  };

  const removeTimelineFrame = (index: number) => {
    setTimelineImages(prev => prev.filter((_, idx) => idx !== index));
  };

  const runTimelineAnalysis = async () => {
    if (timelineImages.length < 2) {
      setErrorMessage('Please upload at least 2 or more sequential images to build a multi-temporal timeline.');
      return;
    }
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const payload = {
        images: timelineImages.map((item, idx) => ({
          image_data: item.dataUrl,
          label: item.label || `Stage ${idx + 1}`,
          filename: item.file?.name || `frame_${idx + 1}.png`
        }))
      };
      const result = await uploadMultipleImages(payload);
      setMultipleAnalysis(result);
      setActiveFrameIndex(0);
      const trends = result.trends || result.net_changes || {};
      setChatMessages([
        {
          role: 'assistant',
          content: `Timeline analysis evaluated across ${result.total_frames || result.frames_count} temporal stages. Net Urban delta: ${trends.urban_net > 0 ? '+' : ''}${trends.urban_net}%, Net Vegetation delta: ${trends.vegetation_net > 0 ? '+' : ''}${trends.vegetation_net}%. Ask me any focused question about this time-series.`
        }
      ]);
    } catch (err: any) {
      setErrorMessage(err.message || 'Timeline analysis failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const loadMultipleSample = async (sample: any) => {
    try {
      setIsProcessing(true);
      setErrorMessage(null);
      const sampleFrames = sample.images || sample.frames || [];
      const loadedFrames = await Promise.all(
        sampleFrames.map(async (f: any) => {
          const dataUrl = f.image_data || (f.url ? await fetchUrlAsDataUrl(f.url) : '');
          return { dataUrl, label: f.label };
        })
      );
      setTimelineImages(loadedFrames);
      const payload = {
        images: loadedFrames.map(f => ({
          image_data: f.dataUrl,
          label: f.label,
          filename: 'sample_frame.jpg'
        }))
      };
      const result = await uploadMultipleImages(payload);
      setMultipleAnalysis(result);
      setActiveFrameIndex(0);
      const trends = result.trends || result.net_changes || {};
      setChatMessages([
        {
          role: 'assistant',
          content: `Loaded ${sample.title} with ${result.total_frames || result.frames_count} time steps. Urban change: ${trends.urban_net > 0 ? '+' : ''}${trends.urban_net}%. Feel free to ask specific questions about this timeline.`
        }
      ]);
    } catch (err: any) {
      setErrorMessage('Failed to load timeline sample: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // -------------------------------------------------------------------------
  // HANDLERS: FOCUSED UPLOAD CHAT
  // -------------------------------------------------------------------------
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatSending) return;

    const userText = chatInput.trim();
    setChatInput('');
    const updatedMessages = [...chatMessages, { role: 'user' as const, content: userText }];
    setChatMessages(updatedMessages);
    setIsChatSending(true);

    const activeAnalysisData = 
      subMode === 'single' ? singleAnalysis :
      subMode === 'compare' ? compareAnalysis :
      multipleAnalysis;

    try {
      const res = await uploadChat({
        analysis_data: activeAnalysisData,
        message: userText,
        history: updatedMessages.slice(-6)
      });
      setChatMessages(prev => [...prev, { role: 'assistant', content: res.reply }]);
    } catch (err: any) {
      setChatMessages(prev => [
        ...prev, 
        { role: 'assistant', content: 'Could not process query: ' + (err.message || 'Server error') }
      ]);
    } finally {
      setIsChatSending(false);
    }
  };

  // -------------------------------------------------------------------------
  // RENDER HELPERS
  // -------------------------------------------------------------------------

  // Returns active overlay data url for single mode
  const getSingleOverlayUrl = () => {
    const masks = singleAnalysis?.masks || singleAnalysis?.overlays;
    if (!masks) return singleImageDataUrl;
    switch (singleActiveOverlay) {
      case 'segmentation': return masks.segmentation || masks.segmentation_mask;
      case 'vegetation': return masks.vegetation || masks.vegetation_mask;
      case 'urban': return masks.urban || masks.urban_mask;
      case 'water': return masks.water || masks.water_mask;
      case 'original':
      default: return singleAnalysis?.preview_url || masks.original || singleImageDataUrl;
    }
  };

  // Normalize single mode metrics
  const singleMetrics = singleAnalysis?.metrics || singleAnalysis?.land_cover || {};

  // Normalize compare mode metrics
  const compareDeltas = compareAnalysis?.delta_metrics || compareAnalysis?.deltas || {};
  const compareCover1 = compareAnalysis?.metrics_pass1 || compareAnalysis?.before_cover || {};
  const compareCover2 = compareAnalysis?.metrics_pass2 || compareAnalysis?.after_cover || {};
  const comparePreview1 = compareAnalysis?.preview1_url || compareAnalysis?.overlays?.before_image || compareImage1?.dataUrl;
  const comparePreview2 = compareAnalysis?.preview2_url || compareAnalysis?.overlays?.after_image || compareImage2?.dataUrl;
  const compareHeatmap = compareAnalysis?.change_heatmap_url || compareAnalysis?.overlays?.change_heatmap;
  const compareSummary = compareAnalysis?.explanation || compareAnalysis?.ai_comparison_summary;

  // Normalize multiple mode metrics
  const multipleTotalFrames = multipleAnalysis?.total_frames || multipleAnalysis?.frames_count || multipleAnalysis?.frames?.length || 0;
  const multipleTrends = multipleAnalysis?.trends || multipleAnalysis?.trajectory || {};
  const multipleSummary = multipleAnalysis?.explanation || multipleAnalysis?.timeline_summary;

  return (
    <div className="flex-1 w-full flex flex-col bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-100 min-h-0 overflow-y-auto">
      {/* Top Banner Ribbon */}
      <div className="border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/80 px-4 lg:px-8 py-3.5 sticky top-0 z-30 shadow-xs backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-mono text-[10px] uppercase font-bold tracking-wider">
                INDEPENDENT UPLOAD PIPELINE
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
                <Upload className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span>Satellite Imagery Upload Studio</span>
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Direct raster analysis for existing satellite imagery. Extract land cover, compute differential changes, and explore temporal trajectories.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shrink-0 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setSubMode('single')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono flex items-center space-x-1.5 transition-all ${
                subMode === 'single'
                  ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>1. Single Image</span>
            </button>

            <button
              type="button"
              onClick={() => setSubMode('compare')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono flex items-center space-x-1.5 transition-all ${
                subMode === 'compare'
                  ? 'bg-white dark:bg-zinc-800 text-orange-600 dark:text-orange-400 shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
              <span>2. Two-Image Compare</span>
            </button>

            <button
              type="button"
              onClick={() => setSubMode('multiple')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono flex items-center space-x-1.5 transition-all ${
                subMode === 'multiple'
                  ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>3. Multiple Timeline</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 self-start md:self-auto">
            {onOpenLiveStudio && (
              <button
                type="button"
                onClick={onOpenLiveStudio}
                className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-mono font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs"
                title="Return to Live Planetary Satellite Studio"
              >
                <Satellite className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>LIVE STUDIO</span>
              </button>
            )}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Restore map"
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-slate-200 text-xs font-mono font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs"
                title="Exit Upload Studio and return to Home (Esc)"
              >
                <X className="w-3.5 h-3.5" />
                <span>RESTORE (ESC)</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Sample Presets Ribbon */}
        {samples && (
          <div className="max-w-7xl mx-auto mt-3 pt-2.5 border-t border-slate-100 dark:border-zinc-800/80 flex items-center gap-2 overflow-x-auto text-[11px] no-scrollbar">
            <span className="font-mono text-slate-500 dark:text-zinc-400 uppercase tracking-wider flex items-center space-x-1 shrink-0 font-bold">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Instant Test Presets:</span>
            </span>

            {subMode === 'single' && samples.single_samples?.map((s: any) => (
              <button
                key={s.id}
                type="button"
                onClick={() => loadSingleSample(s)}
                disabled={isProcessing}
                className="shrink-0 px-2.5 py-1 rounded-md bg-slate-50 dark:bg-zinc-900 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all font-sans font-medium text-xs disabled:opacity-50"
              >
                {s.title}
              </button>
            ))}

            {subMode === 'compare' && samples.compare_samples?.map((s: any) => (
              <button
                key={s.id}
                type="button"
                onClick={() => loadCompareSample(s)}
                disabled={isProcessing}
                className="shrink-0 px-2.5 py-1 rounded-md bg-slate-50 dark:bg-zinc-900 hover:bg-orange-50 dark:hover:bg-orange-950/40 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-orange-600 dark:hover:text-orange-400 transition-all font-sans font-medium text-xs disabled:opacity-50"
              >
                {s.title}
              </button>
            ))}

            {subMode === 'multiple' && samples.multiple_samples?.map((s: any) => (
              <button
                key={s.id}
                type="button"
                onClick={() => loadMultipleSample(s)}
                disabled={isProcessing}
                className="shrink-0 px-2.5 py-1 rounded-md bg-slate-50 dark:bg-zinc-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all font-sans font-medium text-xs disabled:opacity-50"
              >
                {s.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Error Alert Banner */}
      {errorMessage && (
        <div className="max-w-7xl mx-auto w-full px-4 mt-4">
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-600 hover:underline font-mono text-[11px]"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Container */}
      <div className="max-w-7xl mx-auto w-full px-4 lg:px-8 py-6 space-y-6">

        {/* ================================================================= */}
        {/* SUB-MODE 1: SINGLE SATELLITE IMAGE ANALYSIS                       */}
        {/* ================================================================= */}
        {subMode === 'single' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Visual Canvas & Overlays (8 cols) */}
            <div className="lg:col-span-8 flex flex-col space-y-4">
              {/* Drop / Upload Zone */}
              {!singleImageDataUrl ? (
                <div className="relative border-2 border-dashed border-slate-300 dark:border-zinc-700 rounded-2xl p-10 bg-white dark:bg-zinc-900/60 hover:bg-slate-50/50 dark:hover:bg-zinc-900 transition-all flex flex-col items-center justify-center text-center group cursor-pointer shadow-sm">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSingleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="h-16 w-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 group-hover:scale-105 transition-transform">
                    <Upload className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-white">
                    Drop a satellite image here or click to browse
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-md">
                    Supports optical satellite imagery (GeoTIFF, PNG, JPEG, WebP). The system will automatically decompose visible land cover, vegetation, water, and built-up structures.
                  </p>
                  <span className="mt-4 px-3.5 py-1.5 rounded-lg bg-blue-600 text-white font-mono text-xs font-semibold">
                    Select Satellite File
                  </span>
                </div>
              ) : (
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex flex-col space-y-3">
                  {/* Layer Selector Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
                    <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
                      <span className="text-[11px] font-mono text-slate-500 uppercase font-bold mr-1">Layer:</span>
                      <button
                        type="button"
                        onClick={() => setSingleActiveOverlay('original')}
                        className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-all ${
                          singleActiveOverlay === 'original'
                            ? 'bg-slate-800 text-white dark:bg-white dark:text-zinc-900 shadow-xs'
                            : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300'
                        }`}
                      >
                        Optical RGB
                      </button>

                      <button
                        type="button"
                        onClick={() => setSingleActiveOverlay('segmentation')}
                        className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-all ${
                          singleActiveOverlay === 'segmentation'
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300'
                        }`}
                      >
                        Full Land Cover
                      </button>

                      <button
                        type="button"
                        onClick={() => setSingleActiveOverlay('vegetation')}
                        className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-all flex items-center space-x-1 ${
                          singleActiveOverlay === 'vegetation'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400'
                        }`}
                      >
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span>Vegetation</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSingleActiveOverlay('urban')}
                        className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-all flex items-center space-x-1 ${
                          singleActiveOverlay === 'urban'
                            ? 'bg-orange-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-zinc-800 text-orange-700 dark:text-orange-400'
                        }`}
                      >
                        <span className="h-2 w-2 rounded-full bg-orange-500" />
                        <span>Urban / Built</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSingleActiveOverlay('water')}
                        className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-all flex items-center space-x-1 ${
                          singleActiveOverlay === 'water'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-zinc-800 text-blue-700 dark:text-blue-400'
                        }`}
                      >
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                        <span>Water</span>
                      </button>
                    </div>

                    {/* Change / Replace File */}
                    <label className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-mono shrink-0 flex items-center space-x-1">
                      <Upload className="w-3 h-3" />
                      <span>Replace Image</span>
                      <input type="file" accept="image/*" onChange={handleSingleFileUpload} className="hidden" />
                    </label>
                  </div>

                  {/* Visual Canvas Display */}
                  <div className="relative w-full h-[420px] sm:h-[480px] bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200 dark:border-zinc-800 shadow-inner group">
                    {/* Base Optical Image */}
                    <img
                      src={singleImageDataUrl}
                      alt="Base Optical Satellite"
                      className="absolute inset-0 w-full h-full object-contain select-none"
                    />

                    {/* Classified Segmentation Overlay (Blended) */}
                    {singleActiveOverlay !== 'original' && (
                      <img
                        src={getSingleOverlayUrl()}
                        alt="Classified Mask Overlay"
                        className="absolute inset-0 w-full h-full object-contain pointer-events-none transition-opacity duration-150 select-none"
                        style={{ opacity: singleOverlayOpacity / 100 }}
                      />
                    )}

                    {/* Telemetry Corner Badges */}
                    {singleAnalysis && (
                      <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 text-white font-mono text-[10px] space-x-2 flex items-center z-10">
                        <span>RES: {singleAnalysis.dimensions?.width || singleAnalysis.dimensions || '512x512'}</span>
                        <span>•</span>
                        <span className="text-emerald-400">{singleMetrics.vegetation_pct ?? 0}% VEG</span>
                        <span>•</span>
                        <span className="text-orange-400">{singleMetrics.urban_pct ?? 0}% URBAN</span>
                      </div>
                    )}

                    {/* Blend Opacity Slider Floating Widget */}
                    {singleActiveOverlay !== 'original' && (
                      <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/15 text-white font-mono text-xs flex items-center space-x-2 z-10 shadow-lg">
                        <span className="text-[10px] text-zinc-400 uppercase">Mask Opacity:</span>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={singleOverlayOpacity}
                          onChange={(e) => setSingleOverlayOpacity(Number(e.target.value))}
                          className="w-24 accent-blue-500 cursor-pointer h-1.5 bg-zinc-700 rounded-lg"
                        />
                        <span className="text-[11px] font-bold w-7 text-right">{singleOverlayOpacity}%</span>
                      </div>
                    )}
                  </div>

                  {/* Standardized Legend Ribbon */}
                  <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono">
                    <span className="text-slate-500 uppercase font-bold text-[11px]">Class Legend:</span>
                    <div className="flex items-center space-x-1 text-slate-700 dark:text-zinc-300">
                      <span className="h-3 w-3 rounded-xs" style={{ backgroundColor: CANONICAL_COLORS.vegetation }} />
                      <span>Vegetation ({singleMetrics.vegetation_pct ?? 0}%)</span>
                    </div>
                    <div className="flex items-center space-x-1 text-slate-700 dark:text-zinc-300">
                      <span className="h-3 w-3 rounded-xs" style={{ backgroundColor: CANONICAL_COLORS.urban }} />
                      <span>Urban / Built ({singleMetrics.urban_pct ?? 0}%)</span>
                    </div>
                    <div className="flex items-center space-x-1 text-slate-700 dark:text-zinc-300">
                      <span className="h-3 w-3 rounded-xs" style={{ backgroundColor: CANONICAL_COLORS.water }} />
                      <span>Water ({singleMetrics.water_pct ?? 0}%)</span>
                    </div>
                    <div className="flex items-center space-x-1 text-slate-700 dark:text-zinc-300">
                      <span className="h-3 w-3 rounded-xs" style={{ backgroundColor: CANONICAL_COLORS.bare_soil }} />
                      <span>Bare Soil ({singleMetrics.bare_soil_pct ?? 0}%)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Estimated Area, Land Cover Bars & Dedicated Chat (4 cols) */}
            <div className="lg:col-span-4 flex flex-col space-y-4">
              {/* Estimated Area / Biome Card */}
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>ESTIMATED AREA & BIOME</span>
                  </span>
                  {(singleAnalysis?.estimated_area?.confidence_score || singleAnalysis?.estimated_area?.confidence) && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-[10px] font-mono font-bold">
                      {singleAnalysis.estimated_area.confidence_score || singleAnalysis.estimated_area.confidence}% Match
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {singleAnalysis?.estimated_area?.name || 'Awaiting image upload...'}
                  </h3>
                  <div className="inline-block mt-1 px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-mono">
                    Terrain: {singleAnalysis?.estimated_area?.terrain_type || singleAnalysis?.estimated_area?.biome || 'Terrain classification pending'}
                  </div>
                </div>

                {(singleAnalysis?.estimated_area?.gps?.formatted || singleAnalysis?.estimated_area?.geotag?.formatted) && (
                  <div className="text-xs font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 p-2 rounded-lg border border-blue-200 dark:border-blue-900 flex items-center space-x-1.5">
                    <Compass className="w-3.5 h-3.5" />
                    <span>GPS: {singleAnalysis.estimated_area.gps?.formatted || singleAnalysis.estimated_area.geotag?.formatted}</span>
                  </div>
                )}

                {/* Key visible features list */}
                {(singleAnalysis?.estimated_area?.detected_features || singleAnalysis?.estimated_area?.features) && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Visible Terrain Breakdown:</span>
                    {(singleAnalysis.estimated_area.detected_features || singleAnalysis.estimated_area.features).map((feat: string, idx: number) => (
                      <div key={idx} className="flex items-start space-x-2 text-xs text-slate-600 dark:text-zinc-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Canonical Land Cover Percentages Progress Bars */}
                {singleMetrics.vegetation_pct !== undefined && (
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Land Cover Composition:</span>

                    {/* Vegetation */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Vegetation</span>
                        <span>{singleMetrics.vegetation_pct}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${singleMetrics.vegetation_pct}%`, backgroundColor: CANONICAL_COLORS.vegetation }}
                        />
                      </div>
                    </div>

                    {/* Urban */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-orange-600 dark:text-orange-400 font-semibold">Urban / Construction</span>
                        <span>{singleMetrics.urban_pct}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${singleMetrics.urban_pct}%`, backgroundColor: CANONICAL_COLORS.urban }}
                        />
                      </div>
                    </div>

                    {/* Water */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-blue-600 dark:text-blue-400 font-semibold">Water Bodies</span>
                        <span>{singleMetrics.water_pct}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${singleMetrics.water_pct}%`, backgroundColor: CANONICAL_COLORS.water }}
                        />
                      </div>
                    </div>

                    {/* Bare Soil */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-amber-600 dark:text-amber-400 font-semibold">Bare Soil</span>
                        <span>{singleMetrics.bare_soil_pct}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${singleMetrics.bare_soil_pct}%`, backgroundColor: CANONICAL_COLORS.bare_soil }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Dedicated Upload Chatbot Card */}
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex-1 flex flex-col min-h-[320px]">
                <div className="flex items-center space-x-2 pb-2.5 border-b border-slate-100 dark:border-zinc-800">
                  <Bot className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100">Focused Image Analyst</span>
                  <span className="text-[10px] text-slate-400 font-mono ml-auto">Concise replies</span>
                </div>

                {/* Message Log */}
                <div ref={chatLogContainerRef} className="flex-1 overflow-y-auto space-y-2.5 py-3 pr-1 max-h-[220px] text-xs">
                  {chatMessages.length === 0 ? (
                    <div className="text-center text-slate-400 dark:text-zinc-500 py-6 text-xs font-sans">
                      Upload an image to ask focused questions (e.g., &quot;How much vegetation is present?&quot;).
                    </div>
                  ) : (
                    chatMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={`p-2.5 rounded-xl text-xs ${
                          msg.role === 'user'
                            ? 'bg-purple-600 text-white ml-6 font-sans'
                            : 'bg-slate-100 dark:bg-zinc-800/90 text-slate-800 dark:text-zinc-200 mr-6 font-sans border border-slate-200 dark:border-zinc-700'
                        }`}
                      >
                        {msg.content}
                      </div>
                    ))
                  )}
                  {isChatSending && (
                    <div className="flex items-center space-x-2 text-xs text-purple-600 dark:text-purple-400 font-mono italic">
                      <Activity className="w-3.5 h-3.5 animate-spin" />
                      <span>Analyzing query against raster data...</span>
                    </div>
                  )}
                  <div ref={chatBottomRef} />
                </div>

                {/* Prompt Quick Starters */}
                {singleAnalysis && (
                  <div className="pt-2 pb-2 flex gap-1.5 overflow-x-auto no-scrollbar text-[10.5px]">
                    <button
                      type="button"
                      onClick={() => setChatInput("What is the percentage of vegetation?")}
                      className="shrink-0 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-purple-600"
                    >
                      Vegetation %
                    </button>
                    <button
                      type="button"
                      onClick={() => setChatInput("Is there water or a river in this image?")}
                      className="shrink-0 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-purple-600"
                    >
                      Water bodies?
                    </button>
                    <button
                      type="button"
                      onClick={() => setChatInput("What type of area does this represent?")}
                      className="shrink-0 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-purple-600"
                    >
                      Area type?
                    </button>
                  </div>
                )}

                {/* Input Form */}
                <form onSubmit={handleSendChat} className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center space-x-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask a specific question..."
                    disabled={!singleAnalysis || isChatSending}
                    className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim() || isChatSending || !singleAnalysis}
                    className="p-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-40"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* SUB-MODE 2: TWO-IMAGE COMPARISON                                  */}
        {/* ================================================================= */}
        {subMode === 'compare' && (
          <div className="space-y-6">
            {/* Upload Dual Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Image 1: Before / Baseline */}
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-slate-700 dark:text-zinc-300 flex items-center space-x-1.5">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    <span>Observation 1 (Baseline / Before)</span>
                  </span>
                  {compareImage1 && (
                    <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">Ready</span>
                  )}
                </div>

                {!compareImage1 ? (
                  <div className="relative border-2 border-dashed border-slate-300 dark:border-zinc-700 rounded-xl p-8 bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-100/50">
                    <input type="file" accept="image/*" onChange={handleCompareUpload1} className="absolute inset-0 opacity-0 cursor-pointer" />
                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                    <p className="text-xs font-bold text-slate-700 dark:text-zinc-200">Upload Baseline Image</p>
                    <p className="text-[11px] text-slate-400">Prior satellite observation</p>
                  </div>
                ) : (
                  <div className="relative h-44 rounded-xl overflow-hidden bg-black flex items-center justify-center border border-slate-200 dark:border-zinc-800">
                    <img src={compareImage1.dataUrl} alt="Before Observation" className="h-full w-full object-contain" />
                    <label className="absolute bottom-2 right-2 px-2.5 py-1 bg-black/80 hover:bg-black text-white text-[11px] rounded-md cursor-pointer font-mono">
                      Change
                      <input type="file" accept="image/*" onChange={handleCompareUpload1} className="hidden" />
                    </label>
                  </div>
                )}
                {compareImage1 && (
                  <input
                    type="text"
                    value={compareImage1.label}
                    onChange={(e) => setCompareImage1({ ...compareImage1, label: e.target.value })}
                    placeholder="Label (e.g. 2021 Survey)"
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-lg text-xs"
                  />
                )}
              </div>

              {/* Image 2: After / Follow-up */}
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-slate-700 dark:text-zinc-300 flex items-center space-x-1.5">
                    <span className="h-2 w-2 rounded-full bg-orange-500" />
                    <span>Observation 2 (Follow-up / After)</span>
                  </span>
                  {compareImage2 && (
                    <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">Ready</span>
                  )}
                </div>

                {!compareImage2 ? (
                  <div className="relative border-2 border-dashed border-slate-300 dark:border-zinc-700 rounded-xl p-8 bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-100/50">
                    <input type="file" accept="image/*" onChange={handleCompareUpload2} className="absolute inset-0 opacity-0 cursor-pointer" />
                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                    <p className="text-xs font-bold text-slate-700 dark:text-zinc-200">Upload Follow-up Image</p>
                    <p className="text-[11px] text-slate-400">Recent satellite observation</p>
                  </div>
                ) : (
                  <div className="relative h-44 rounded-xl overflow-hidden bg-black flex items-center justify-center border border-slate-200 dark:border-zinc-800">
                    <img src={compareImage2.dataUrl} alt="After Observation" className="h-full w-full object-contain" />
                    <label className="absolute bottom-2 right-2 px-2.5 py-1 bg-black/80 hover:bg-black text-white text-[11px] rounded-md cursor-pointer font-mono">
                      Change
                      <input type="file" accept="image/*" onChange={handleCompareUpload2} className="hidden" />
                    </label>
                  </div>
                )}
                {compareImage2 && (
                  <input
                    type="text"
                    value={compareImage2.label}
                    onChange={(e) => setCompareImage2({ ...compareImage2, label: e.target.value })}
                    placeholder="Label (e.g. 2026 Survey)"
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-lg text-xs"
                  />
                )}
              </div>
            </div>

            {/* Run Comparison Button */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={runComparison}
                disabled={!compareImage1 || !compareImage2 || isProcessing}
                className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-mono font-bold text-xs rounded-xl transition-all shadow-md disabled:opacity-40 flex items-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    <span>CALCULATING DIFFERENTIAL CHANGE...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>RUN COMPARATIVE CHANGE DETECTION</span>
                  </>
                )}
              </button>
            </div>

            {/* Comparison Results Section */}
            {compareAnalysis && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Differential Change Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Urban Delta */}
                  <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
                    <div className="text-[10px] font-mono text-slate-500 uppercase font-bold flex items-center justify-between">
                      <span>Urban Development</span>
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: CANONICAL_COLORS.urban }} />
                    </div>
                    <div className={`text-xl font-black mt-1 font-mono ${compareDeltas.urban_delta_pct > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-slate-700 dark:text-zinc-300'}`}>
                      {compareDeltas.urban_delta_pct > 0 ? '+' : ''}{compareDeltas.urban_delta_pct}%
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {compareCover1.urban_pct ?? 0}% → {compareCover2.urban_pct ?? 0}%
                    </div>
                  </div>

                  {/* Vegetation Delta */}
                  <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
                    <div className="text-[10px] font-mono text-slate-500 uppercase font-bold flex items-center justify-between">
                      <span>Vegetation Cover</span>
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: CANONICAL_COLORS.vegetation }} />
                    </div>
                    <div className={`text-xl font-black mt-1 font-mono ${compareDeltas.vegetation_delta_pct < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {compareDeltas.vegetation_delta_pct > 0 ? '+' : ''}{compareDeltas.vegetation_delta_pct}%
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {compareCover1.vegetation_pct ?? 0}% → {compareCover2.vegetation_pct ?? 0}%
                    </div>
                  </div>

                  {/* Water Delta */}
                  <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
                    <div className="text-[10px] font-mono text-slate-500 uppercase font-bold flex items-center justify-between">
                      <span>Water Bodies</span>
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: CANONICAL_COLORS.water }} />
                    </div>
                    <div className="text-xl font-black mt-1 font-mono text-blue-600 dark:text-blue-400">
                      {compareDeltas.water_delta_pct > 0 ? '+' : ''}{compareDeltas.water_delta_pct}%
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {compareCover1.water_pct ?? 0}% → {compareCover2.water_pct ?? 0}%
                    </div>
                  </div>

                  {/* Hotspots Detected */}
                  <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
                    <div className="text-[10px] font-mono text-slate-500 uppercase font-bold flex items-center justify-between">
                      <span>Detected Hotspots</span>
                      <Flame className="w-3.5 h-3.5 text-orange-500" />
                    </div>
                    <div className="text-xl font-black mt-1 font-mono text-slate-900 dark:text-white">
                      {compareAnalysis.hotspots?.length || 0}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                      Impact: {compareAnalysis.net_change_severity || 'Active Focus'}
                    </div>
                  </div>
                </div>

                {/* Interactive Visualizer Canvas & Hotspot Pins */}
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm space-y-4">
                  {/* View Mode Switcher Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-mono text-slate-500 uppercase font-bold">Compare Mode:</span>
                      <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800">
                        <button
                          type="button"
                          onClick={() => setCompareViewMode('swipe')}
                          className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition-all ${
                            compareViewMode === 'swipe'
                              ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs'
                              : 'text-slate-600 dark:text-zinc-400'
                          }`}
                        >
                          Split Swipe Slider
                        </button>
                        <button
                          type="button"
                          onClick={() => setCompareViewMode('side-by-side')}
                          className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition-all ${
                            compareViewMode === 'side-by-side'
                              ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs'
                              : 'text-slate-600 dark:text-zinc-400'
                          }`}
                        >
                          Side-by-Side Dual
                        </button>
                        <button
                          type="button"
                          onClick={() => setCompareViewMode('heatmap')}
                          className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition-all ${
                            compareViewMode === 'heatmap'
                              ? 'bg-white dark:bg-zinc-900 text-orange-600 dark:text-orange-400 shadow-xs'
                              : 'text-slate-600 dark:text-zinc-400'
                          }`}
                        >
                          Change Heatmap
                        </button>
                      </div>
                    </div>

                    {/* Hotspot pin visibility toggle */}
                    <button
                      type="button"
                      onClick={() => setShowHotspotPins(!showHotspotPins)}
                      className={`px-2.5 py-1 rounded-md text-xs font-mono border transition-all flex items-center space-x-1.5 ${
                        showHotspotPins
                          ? 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300'
                          : 'bg-slate-100 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-500'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Pins ({compareAnalysis.hotspots?.length || 0})</span>
                    </button>
                  </div>

                  {/* Mode 1: Swipe Split Slider */}
                  {compareViewMode === 'swipe' && (
                    <div className="relative w-full h-[460px] sm:h-[540px] bg-black rounded-xl overflow-hidden select-none border border-slate-200 dark:border-zinc-800 group">
                      {/* After Image (Full background) */}
                      <img
                        src={comparePreview2}
                        alt="After Survey"
                        className="absolute inset-0 w-full h-full object-contain"
                      />

                      {/* Before Image (Clipped by slider position) */}
                      <div
                        className="absolute inset-y-0 left-0 overflow-hidden"
                        style={{ width: `${sliderPosition}%` }}
                      >
                        <img
                          src={comparePreview1}
                          alt="Before Survey"
                          className="absolute inset-y-0 left-0 h-full max-w-none object-contain"
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      </div>

                      {/* Vertical Divider Handle */}
                      <div
                        className="absolute inset-y-0 w-1 bg-white shadow-2xl cursor-ew-resize z-20 flex items-center justify-center"
                        style={{ left: `${sliderPosition}%` }}
                      >
                        <div className="h-8 w-8 rounded-full bg-white text-slate-800 border-2 border-slate-900 flex items-center justify-center shadow-2xl text-[10px] font-bold select-none pointer-events-none">
                          ↔
                        </div>
                      </div>

                      {/* Interactive Drag input overlaid */}
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={sliderPosition}
                        onChange={(e) => setSliderPosition(Number(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                      />

                      {/* Hotspot Pins overlaid on canvas */}
                      {showHotspotPins && compareAnalysis.hotspots?.map((hs: any, idx: number) => {
                        const hsNumber = hs.number || hs.id || (idx + 1);
                        const hsX = hs.x_pct ?? hs.coords_pct?.x_pct ?? 50;
                        const hsY = hs.y_pct ?? hs.coords_pct?.y_pct ?? 50;
                        return (
                          <div
                            key={hs.id || idx}
                            onClick={() => setSelectedHotspot(hs)}
                            className="absolute z-40 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-125"
                            style={{
                              left: `${hsX}%`,
                              top: `${hsY}%`
                            }}
                          >
                            <div
                              className="h-6 w-6 rounded-full flex items-center justify-center font-mono text-[10.5px] font-bold text-white shadow-lg border-2 border-white animate-pulse"
                              style={{ backgroundColor: hs.color || CANONICAL_COLORS.urban }}
                            >
                              {hsNumber}
                            </div>
                          </div>
                        );
                      })}

                      {/* Labels */}
                      <div className="absolute top-3 left-3 bg-black/80 px-2.5 py-1 rounded-md text-white font-mono text-[11px] z-10">
                        {compareAnalysis.label1 || compareAnalysis.label_before || 'Before'}
                      </div>
                      <div className="absolute top-3 right-3 bg-black/80 px-2.5 py-1 rounded-md text-white font-mono text-[11px] z-10">
                        {compareAnalysis.label2 || compareAnalysis.label_after || 'After'}
                      </div>
                    </div>
                  )}

                  {/* Mode 2: Side-by-Side Dual View */}
                  {compareViewMode === 'side-by-side' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: Before */}
                      <div className="relative h-[380px] bg-black rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800">
                        <img src={comparePreview1} alt="Before" className="w-full h-full object-contain" />
                        <span className="absolute top-3 left-3 bg-black/80 text-white font-mono text-[11px] px-2 py-0.5 rounded">
                          {compareAnalysis.label1 || compareAnalysis.label_before || 'Before'}
                        </span>
                      </div>
                      {/* Right: After */}
                      <div className="relative h-[380px] bg-black rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800">
                        <img src={comparePreview2} alt="After" className="w-full h-full object-contain" />
                        <span className="absolute top-3 left-3 bg-black/80 text-white font-mono text-[11px] px-2 py-0.5 rounded">
                          {compareAnalysis.label2 || compareAnalysis.label_after || 'After'}
                        </span>
                        {/* Pins on after */}
                        {showHotspotPins && compareAnalysis.hotspots?.map((hs: any, idx: number) => {
                          const hsNumber = hs.number || hs.id || (idx + 1);
                          const hsX = hs.x_pct ?? hs.coords_pct?.x_pct ?? 50;
                          const hsY = hs.y_pct ?? hs.coords_pct?.y_pct ?? 50;
                          return (
                            <div
                              key={hs.id || idx}
                              onClick={() => setSelectedHotspot(hs)}
                              className="absolute z-40 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-125"
                              style={{
                                left: `${hsX}%`,
                                top: `${hsY}%`
                              }}
                            >
                              <div
                                className="h-6 w-6 rounded-full flex items-center justify-center font-mono text-[10.5px] font-bold text-white shadow-lg border-2 border-white"
                                style={{ backgroundColor: hs.color || CANONICAL_COLORS.urban }}
                              >
                                {hsNumber}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Mode 3: Change Heatmap View */}
                  {compareViewMode === 'heatmap' && (
                    <div className="relative w-full h-[460px] sm:h-[540px] bg-black rounded-xl overflow-hidden select-none border border-slate-200 dark:border-zinc-800 flex items-center justify-center">
                      <img
                        src={compareHeatmap}
                        alt="Change Heatmap"
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute top-3 left-3 bg-black/80 px-2.5 py-1 rounded-md text-white font-mono text-[11px] z-10 flex items-center space-x-2">
                        <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                        <span>Differential Change Mask Overlay</span>
                      </div>
                    </div>
                  )}

                  {/* Selected Hotspot Card (Click-to-inspect) */}
                  {selectedHotspot && (
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center space-x-3">
                        <div
                          className="h-8 w-8 rounded-full flex items-center justify-center font-mono font-bold text-white shadow-xs shrink-0"
                          style={{ backgroundColor: selectedHotspot.color || CANONICAL_COLORS.urban }}
                        >
                          #{selectedHotspot.number || selectedHotspot.id}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                            <span>{selectedHotspot.category || selectedHotspot.type}</span>
                            <span className="text-[10px] font-mono text-slate-400">
                              ({selectedHotspot.area_pct || selectedHotspot.pct_of_frame}% of image)
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-zinc-300 mt-0.5">
                            {selectedHotspot.description || selectedHotspot.location_label}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedHotspot(null)}
                        className="text-[11px] font-mono text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 self-end sm:self-auto"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}

                  {/* Hotspots Quick Pill Selector */}
                  {compareAnalysis.hotspots?.length > 0 && (
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
                      <span className="text-[11px] font-mono text-slate-400 uppercase font-bold shrink-0">
                        Hotspots:
                      </span>
                      {compareAnalysis.hotspots.map((hs: any, idx: number) => {
                        const hsNumber = hs.number || hs.id || (idx + 1);
                        return (
                          <button
                            key={hs.id || idx}
                            type="button"
                            onClick={() => setSelectedHotspot(hs)}
                            className={`shrink-0 px-2.5 py-1 rounded-md text-xs font-mono flex items-center space-x-1.5 transition-all ${
                              selectedHotspot === hs
                                ? 'bg-slate-900 dark:bg-white text-white dark:text-zinc-900 font-bold'
                                : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                            }`}
                          >
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: hs.color || CANONICAL_COLORS.urban }} />
                            <span>#{hsNumber} {hs.category}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* AI Comparative Summary & Upload Chat */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* AI Summary */}
                  <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3">
                    <span className="text-[11px] font-mono text-orange-600 dark:text-orange-400 font-bold uppercase tracking-wider flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI COMPARATIVE SYNTHESIS</span>
                    </span>
                    <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
                      {compareSummary}
                    </p>
                  </div>

                  {/* Dedicated Chat */}
                  <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm flex flex-col min-h-[260px]">
                    <div className="flex items-center space-x-2 pb-2 border-b border-slate-100 dark:border-zinc-800">
                      <Bot className="w-4 h-4 text-orange-500" />
                      <span className="text-xs font-bold">Ask about this comparison</span>
                    </div>
                    <div ref={compareChatLogContainerRef} className="flex-1 overflow-y-auto space-y-2 py-3 text-xs max-h-[160px]">
                      {chatMessages.map((m, i) => (
                        <div
                          key={i}
                          className={`p-2 rounded-lg ${m.role === 'user' ? 'bg-orange-600 text-white ml-6' : 'bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 mr-6'}`}
                        >
                          {m.content}
                        </div>
                      ))}
                      <div ref={chatBottomRef} />
                    </div>
                    <form onSubmit={handleSendChat} className="flex items-center space-x-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="e.g. Which area had the biggest vegetation loss?"
                        className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-lg text-xs"
                      />
                      <button type="submit" disabled={!chatInput.trim() || isChatSending} className="p-1.5 bg-orange-600 text-white rounded-lg">
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* SUB-MODE 3: MULTIPLE IMAGE TIMELINE                               */}
        {/* ================================================================= */}
        {subMode === 'multiple' && (
          <div className="space-y-6">
            {/* Multi-Image Sequence Upload Bar */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Upload Temporal Sequence (2+ Satellite Frames)</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    Order your imagery chronologically to chart long-term environmental and infrastructure trajectories.
                  </p>
                </div>

                <label className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-bold rounded-lg cursor-pointer flex items-center space-x-1.5 self-start sm:self-auto shrink-0 shadow-xs">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Add Images</span>
                  <input type="file" accept="image/*" multiple onChange={handleTimelineUpload} className="hidden" />
                </label>
              </div>

              {/* Uploaded Frames Strip */}
              {timelineImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                  {timelineImages.map((frame, idx) => (
                    <div key={idx} className="relative group bg-black rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 h-28 flex flex-col justify-end">
                      <img src={frame.dataUrl} alt={frame.label} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      <div className="relative z-10 bg-black/80 px-2 py-1 text-[10.5px] font-mono text-white flex items-center justify-between">
                        <span className="truncate">{frame.label}</span>
                        <button
                          type="button"
                          onClick={() => removeTimelineFrame(idx)}
                          className="text-rose-400 hover:text-rose-300 ml-1"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Run Timeline Analysis Button */}
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={runTimelineAnalysis}
                  disabled={timelineImages.length < 2 || isProcessing}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-mono font-bold text-xs rounded-xl transition-all shadow-md disabled:opacity-40 flex items-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <Activity className="w-4 h-4 animate-spin" />
                      <span>SYNTHESIZING TEMPORAL TIMELINE...</span>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4" />
                      <span>RUN MULTI-TEMPORAL TIMELINE ANALYSIS</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Timeline Results */}
            {multipleAnalysis && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Net Change Cumulative Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Net Urban Growth</span>
                    <div className="text-xl font-black mt-1 font-mono text-orange-600 dark:text-orange-400">
                      {multipleTrends.urban_net > 0 ? '+' : ''}{multipleTrends.urban_net}%
                    </div>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Net Vegetation Shift</span>
                    <div className={`text-xl font-black mt-1 font-mono ${multipleTrends.vegetation_net < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {multipleTrends.vegetation_net > 0 ? '+' : ''}{multipleTrends.vegetation_net}%
                    </div>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Net Water Dynamics</span>
                    <div className="text-xl font-black mt-1 font-mono text-blue-600 dark:text-blue-400">
                      {multipleTrends.water_net > 0 ? '+' : ''}{multipleTrends.water_net}%
                    </div>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-sm">
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Total Time Steps</span>
                    <div className="text-xl font-black mt-1 font-mono text-slate-900 dark:text-white">
                      {multipleTotalFrames} Frames
                    </div>
                  </div>
                </div>

                {/* Interactive Player & Trajectory Graph Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left: Frame Scrubber & Player (7 cols) */}
                  <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => setIsPlayingTimeline(!isPlayingTimeline)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-mono font-bold flex items-center space-x-1"
                        >
                          {isPlayingTimeline ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          <span>{isPlayingTimeline ? 'PAUSE' : 'PLAY'}</span>
                        </button>
                        <span className="text-xs font-mono text-slate-500">
                          Frame {activeFrameIndex + 1} of {multipleTotalFrames}
                        </span>
                      </div>

                      <div className="text-xs font-mono font-bold text-slate-700 dark:text-zinc-200">
                        {multipleAnalysis.frames[activeFrameIndex]?.label}
                      </div>
                    </div>

                    {/* Active Frame Canvas */}
                    <div className="relative h-[360px] bg-black rounded-xl overflow-hidden flex items-center justify-center border border-slate-200 dark:border-zinc-800">
                      <img
                        src={multipleAnalysis.frames[activeFrameIndex]?.preview_url || multipleAnalysis.frames[activeFrameIndex]?.image}
                        alt="Current timeline frame"
                        className="w-full h-full object-contain"
                      />
                      {/* Frame Land Cover Breakdown Overlay */}
                      <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-white font-mono text-xs flex items-center space-x-3 border border-white/10">
                        <span className="text-emerald-400">
                          VEG: {(multipleAnalysis.frames[activeFrameIndex]?.metrics || multipleAnalysis.frames[activeFrameIndex]?.land_cover)?.vegetation_pct ?? 0}%
                        </span>
                        <span className="text-orange-400">
                          URBAN: {(multipleAnalysis.frames[activeFrameIndex]?.metrics || multipleAnalysis.frames[activeFrameIndex]?.land_cover)?.urban_pct ?? 0}%
                        </span>
                        <span className="text-blue-400">
                          WATER: {(multipleAnalysis.frames[activeFrameIndex]?.metrics || multipleAnalysis.frames[activeFrameIndex]?.land_cover)?.water_pct ?? 0}%
                        </span>
                      </div>
                    </div>

                    {/* Timeline Range Scrubber Slider */}
                    <div className="space-y-1 pt-1">
                      <input
                        type="range"
                        min="0"
                        max={multipleTotalFrames - 1}
                        value={activeFrameIndex}
                        onChange={(e) => setActiveFrameIndex(Number(e.target.value))}
                        className="w-full accent-emerald-600 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] font-mono text-slate-400">
                        {multipleAnalysis.frames.map((f: any, i: number) => (
                          <span
                            key={i}
                            onClick={() => setActiveFrameIndex(i)}
                            className={`cursor-pointer ${activeFrameIndex === i ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}`}
                          >
                            {f.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Multi-Temporal Trajectory Graph (5 cols) */}
                  <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
                    <div>
                      <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider flex items-center space-x-1.5">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>MULTI-TEMPORAL TRAJECTORY GRAPH</span>
                      </span>
                      <p className="text-xs text-slate-500 mt-1">
                        Percentage coverage shifts across the timeline sequence.
                      </p>
                    </div>

                    {/* SVG Trajectory Chart */}
                    <div className="w-full h-52 bg-slate-50 dark:bg-zinc-950 rounded-xl p-3 border border-slate-200 dark:border-zinc-800 flex flex-col justify-between">
                      <svg viewBox="0 0 300 120" className="w-full h-full overflow-visible">
                        {/* Grid lines */}
                        <line x1="0" y1="20" x2="300" y2="20" stroke="currentColor" strokeOpacity="0.1" />
                        <line x1="0" y1="60" x2="300" y2="60" stroke="currentColor" strokeOpacity="0.1" />
                        <line x1="0" y1="100" x2="300" y2="100" stroke="currentColor" strokeOpacity="0.1" />

                        {/* Urban Curve (Orange) */}
                        {multipleTrends.urban_series && (
                          <polyline
                            fill="none"
                            stroke={CANONICAL_COLORS.urban}
                            strokeWidth="2.5"
                            points={multipleTrends.urban_series
                              .map((val: number, i: number) => {
                                const x = (i / Math.max(1, multipleTotalFrames - 1)) * 300;
                                const y = 120 - (val / 100) * 120;
                                return `${x},${y}`;
                              })
                              .join(' ')}
                          />
                        )}

                        {/* Vegetation Curve (Green) */}
                        {multipleTrends.vegetation_series && (
                          <polyline
                            fill="none"
                            stroke={CANONICAL_COLORS.vegetation}
                            strokeWidth="2.5"
                            points={multipleTrends.vegetation_series
                              .map((val: number, i: number) => {
                                const x = (i / Math.max(1, multipleTotalFrames - 1)) * 300;
                                const y = 120 - (val / 100) * 120;
                                return `${x},${y}`;
                              })
                              .join(' ')}
                          />
                        )}

                        {/* Water Curve (Blue) */}
                        {multipleTrends.water_series && (
                          <polyline
                            fill="none"
                            stroke={CANONICAL_COLORS.water}
                            strokeWidth="2.5"
                            points={multipleTrends.water_series
                              .map((val: number, i: number) => {
                                const x = (i / Math.max(1, multipleTotalFrames - 1)) * 300;
                                const y = 120 - (val / 100) * 120;
                                return `${x},${y}`;
                              })
                              .join(' ')}
                          />
                        )}
                      </svg>
                    </div>

                    {/* Chart Legend */}
                    <div className="flex items-center justify-between text-xs font-mono pt-1">
                      <div className="flex items-center space-x-1.5 text-emerald-600">
                        <span className="h-2 w-4 rounded-xs bg-emerald-500" />
                        <span>Vegetation</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-orange-600">
                        <span className="h-2 w-4 rounded-xs bg-orange-500" />
                        <span>Urban</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-blue-600">
                        <span className="h-2 w-4 rounded-xs bg-blue-500" />
                        <span>Water</span>
                      </div>
                    </div>

                    {/* Timeline Summary Text */}
                    <div className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                      {multipleSummary}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
