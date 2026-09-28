export interface PlaceLandmark {
  name: string;
  latitude: number;
  longitude: number;
  category?: string;
}

export interface LocationInfo {
  id?: string;
  name: string;
  display_name: string;
  latitude: number;
  longitude: number;
  bounding_box: [number, number, number, number]; // [west, south, east, north]
  country?: string;
  admin_region?: string;
  geometry?: any;
  location_type?: 'city' | 'state' | 'country' | 'river' | 'landmark' | 'region';
  area_description?: string;
  landmarks?: PlaceLandmark[];
}

export interface ChangeRegion {
  id: string;
  location_id?: string;
  location_name?: string;
  indicator_number?: number;
  category: string;
  user_label: string;
  color: string;
  area_hectares: number;
  centroid: [number, number];
  delta_ndvi: number;
  delta_ndbi: number;
  delta_ndwi: number;
  confidence_pct: number;
  severity_level?: 'high' | 'medium' | 'low' | 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' | string;
  simple_explanation: string;
  technical_evidence: string;
  geometry: any;
}

export interface LandCoverStats {
  category: string;
  before_ha: number;
  after_ha: number;
  change_ha: number;
  change_pct: number;
  color: string;
}

export interface TransitionRecord {
  from_class: string;
  to_class: string;
  area_ha: number;
  description: string;
}

export interface ConfidenceFactor {
  name: string;
  status: 'positive' | 'neutral' | 'warning';
  text: string;
}

export interface ConfidenceBreakdown {
  overall_score: number;
  rating: string;
  factors: ConfidenceFactor[];
  limitations: string[];
}

export interface AISummary {
  headline: string;
  simple_markdown: string;
  observed: string;
  evidence: string;
  interpretation: string;
  limitations: string;
}

export interface TimelinePoint {
  year: number;
  date: string;
  mean_ndvi: number;
  mean_ndwi: number;
  mean_ndbi: number;
  vegetation_ha: number;
  built_ha: number;
  water_ha: number;
}

export interface VisualLayers {
  before_rgb: string;
  after_rgb: string;
  ndvi_before?: string;
  ndvi_after?: string;
  ndvi_delta?: string;
  change_heatmap?: string;
  bounds: [number, number, number, number];
}

export interface AnalysisContext {
  analysis_id: string;
  query: string;
  created_at: string;
  location: LocationInfo;
  
  requested_start_date: string;
  requested_end_date: string;
  actual_before_date: string;
  actual_after_date: string;
  temporal_match_note?: string;
  
  imagery_source: string;
  sensor: string;
  resolution: string;
  cloud_percentage_before: number;
  cloud_percentage_after: number;
  usable_pixel_pct_before: number;
  usable_pixel_pct_after: number;
  before_scene_id?: string;
  after_scene_id?: string;
  data_availability?: string;
  
  indices_summary: {
    ndvi_before_mean: number;
    ndvi_after_mean: number;
    delta_ndvi_mean: number;
    ndbi_before_mean: number;
    ndbi_after_mean: number;
    delta_ndbi_mean: number;
    ndwi_before_mean: number;
    ndwi_after_mean: number;
    delta_ndwi_mean: number;
  };
  
  land_cover_stats: LandCoverStats[];
  transitions: TransitionRecord[];
  total_aoi_hectares: number;
  total_changed_hectares: number;
  percent_aoi_changed: number;
  
  change_regions: ChangeRegion[];
  visual_layers: VisualLayers;
  timeline: TimelinePoint[];
  confidence: ConfidenceBreakdown;
  ai_summary: AISummary;
  query_understanding?: QueryUnderstanding;

  // Hindsight Agent Memory & Supabase Persistence
  user_id?: string;
  memory_active?: boolean;
  recalled_memories?: Array<{ id?: string; text: string; metadata?: any; tags?: string[] }>;
  memory_context_note?: string;
  persisted_to_supabase?: boolean;
}

export interface HindsightMemoryItem {
  id: string;
  text: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface HindsightStatus {
  connected: boolean;
  url?: string;
  version?: string;
  bank_id: string;
  mode: string;
  message: string;
}

export interface SupabaseStatus {
  connected: boolean;
  configured: boolean;
  url?: string;
  mode: string;
  message: string;
}

export interface SavedAnalysisSummary {
  id: string;
  query: string;
  location_name: string;
  total_aoi_ha: number;
  total_changed_ha: number;
  percent_aoi_changed: number;
  confidence_score?: number;
  headline?: string;
  created_at: string;
  actual_before_date?: string;
  actual_after_date?: string;
}

export interface QueryUnderstanding {
  is_earth_observation: boolean;
  rejection_reason?: string | null;
  is_ambiguous: boolean;
  clarification_question?: string | null;
  disambiguation_options?: string[];
  location?: string | null;
  target_type?: string | null;
  start_year: number;
  end_year: number;
  focus_indicator: string;
  analysis_type: string;
  user_intent: string;
  defaulted_dates: boolean;
  year_warning?: string | null;
  query_text: string;
  data_used?: {
    satellite_imagery?: string;
    period?: string;
    aoi?: string;
    indicators?: string;
    change_detection?: string;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  suggestedActions?: string[];
}

export interface ChatResponse {
  reply: string;
  analysis_id: string;
  suggested_actions?: string[];
  highlight_region_ids?: string[];
  filter_category?: string | null;
  zoom_to?: [number, number, number] | null;
  selected_region_id?: string | null;
}
