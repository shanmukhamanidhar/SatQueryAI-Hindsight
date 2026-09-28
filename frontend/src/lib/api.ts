import { AnalysisContext, LocationInfo, QueryUnderstanding } from './types';
const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) || '/api';

export async function checkHealth(): Promise<{ status: string; gemini_configured: boolean }> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Backend offline');
  return res.json();
}

export async function parseQuery(payload: {
  query: string;
  previous_context?: any;
}): Promise<QueryUnderstanding> {
  const res = await fetch(`${API_BASE}/query-parse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Query understanding failed');
  }
  return res.json();
}

export async function resolveLocation(query: string): Promise<LocationInfo> {
  const res = await fetch(`${API_BASE}/location/resolve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to resolve location');
  }
  return res.json();
}

export async function runAnalysis(payload: {
  query: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  aoi_geojson?: any;
  previous_location?: string;
  previous_start_year?: number;
  previous_end_year?: number;
  user_id?: string;
}): Promise<AnalysisContext> {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Analysis request failed');
  }
  return res.json();
}

export async function sendChatMessage(payload: {
  analysis_id: string;
  message: string;
  history?: Array<{ role: string; content: string }>;
  language?: string;
  user_id?: string;
}) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Chat query failed');
  }
  return res.json();
}

export async function fetchAnalysisHistory(userId?: string) {
  const q = userId ? `?user_id=${encodeURIComponent(userId)}` : '';
  const res = await fetch(`${API_BASE}/history${q}`);
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
}

export async function fetchAnalysisById(analysisId: string): Promise<AnalysisContext> {
  const res = await fetch(`${API_BASE}/history/${analysisId}`);
  if (!res.ok) throw new Error('Analysis not found');
  return res.json();
}

export async function explainMap(payload: {
  analysis_id: string;
  active_layer: string;
}) {
  const res = await fetch(`${API_BASE}/explain-map`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Explain map failed');
  }
  return res.json();
}

export function getGeoJsonUrl(analysisId: string): string {
  return `${API_BASE}/analysis/${analysisId}/geojson`;
}

export function getCsvUrl(analysisId: string): string {
  return `${API_BASE}/analysis/${analysisId}/csv`;
}

export async function downloadPdfReport(analysisId: string, locationName: string): Promise<void> {
  const res = await fetch(`${API_BASE}/report/pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ analysis_id: analysisId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Failed to generate PDF report (HTTP ${res.status})`);
  }
  const blob = await res.blob();
  if (blob.size === 0) {
    throw new Error('Generated PDF report is empty (0 bytes).');
  }
  const cleanName = (locationName || 'AOI')
    .replace(/[^a-zA-Z0-9_\-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `SatQueryAI_Report_${cleanName || 'Analysis'}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export async function getYearSatelliteImage(payload: {
  analysis_id?: string;
  bbox: number[];
  year: number;
}): Promise<{
  year: number;
  date: string;
  image_url: string;
  cloud_cover_pct: number;
  satellite: string;
  scene_id?: string;
}> {
  const res = await fetch(`${API_BASE}/analysis/year-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Failed to fetch satellite imagery for year ${payload.year}`);
  }
  return res.json();
}

export async function configureGeminiKey(apiKey: string): Promise<{ status: string; message: string; gemini_configured: boolean }> {
  const res = await fetch(`${API_BASE}/config/gemini-key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: apiKey }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to configure Google Gemini API key');
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// Dedicated Upload Studio API Methods
// ---------------------------------------------------------------------------
export async function uploadSingleImage(payload: {
  image_data: string;
  filename?: string;
  custom_label?: string;
}): Promise<any> {
  const res = await fetch(`${API_BASE}/upload/single`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Single image analysis failed');
  }
  return res.json();
}

export async function uploadCompareImages(payload: {
  image1_data: string;
  image2_data: string;
  label1?: string;
  label2?: string;
  filename1?: string;
  filename2?: string;
}): Promise<any> {
  const res = await fetch(`${API_BASE}/upload/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Image comparison failed');
  }
  return res.json();
}

export async function uploadMultipleImages(payload: {
  images: Array<{ image_data: string; label?: string; filename?: string }>;
}): Promise<any> {
  const res = await fetch(`${API_BASE}/upload/multiple`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Multiple image analysis failed');
  }
  return res.json();
}

export async function uploadChat(payload: {
  analysis_data: any;
  message: string;
  history?: any[];
}): Promise<{ reply: string }> {
  const res = await fetch(`${API_BASE}/upload/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Upload chat query failed');
  }
  return res.json();
}

export async function getUploadSamples(): Promise<{
  single_samples: any[];
  compare_samples: any[];
  multiple_samples: any[];
}> {
  const res = await fetch(`${API_BASE}/upload/samples`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to fetch upload samples');
  }
  return res.json();
}

