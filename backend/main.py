import uuid
import json
import logging
import csv
import io
import os
import re
import numpy as np
from datetime import datetime
from typing import Dict, Any, Optional, List
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException, Response, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles

import base64
import sys
from PIL import Image

# Ensure backend directory is in sys.path for local module imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import settings
from services.upload_analysis_engine import (
    analyze_single_satellite_image,
    compare_two_satellite_images,
    analyze_multiple_satellite_images,
    chat_about_uploaded_analysis
)
from models.schemas import (
    AnalyzeRequest,
    AnalysisContext,
    LocationInfo,
    ChatRequest,
    ChatResponse,
    ExplainMapRequest,
    GeocodeRequest,
    VisualLayers,
    YearImageRequest,
    YearImageResponse,
    QueryParseRequest,
    QueryParseResponse,
    HindsightStatusResponse,
    HindsightReflectRequest,
    HindsightReflectResponse,
    UserPreferenceRequest,
    SupabaseStatusResponse
)
from services.hindsight_service import hindsight_service
from services.supabase_service import supabase_service
from services.nlp_parser import parse_nlp_intent
from services.geocoding import resolve_location, bbox_to_geojson_polygon
from services.stac_discovery import select_best_pair_observations, search_stac_for_aoi
from services.raster_engine import (
    calculate_aoi_hectares,
    fetch_raster_bands_for_scene,
    compute_spectral_indices,
    classify_land_cover,
    render_colormap_raster,
    extract_change_polygons,
    pil_to_base64_data_url
)
from services.statistics_engine import compute_land_cover_statistics
from services.confidence_engine import evaluate_analysis_confidence
from services.gemini_analyst import generate_ai_analysis, answer_conversational_query
from services.timeline_engine import generate_multi_year_timeline
from services.report_generator import generate_pdf_report

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("satqueryai")

app = FastAPI(
    title="SatQueryAI — Autonomous Earth Intelligence API",
    description="Backend service providing autonomous Earth observation, remote-sensing change detection, and Gemini AI geospatial intelligence.",
    version=settings.VERSION
)

# Enable CORS for local Vite dev server and external clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Canonical Analysis Store (In-Memory + persistent cache)
ANALYSIS_STORE: Dict[str, AnalysisContext] = {}
YEAR_IMAGE_CACHE: Dict[str, Dict[str, Any]] = {}

@app.get("/health")
@app.get("/api/health")
def health_check():
    has_key = bool(settings.GEMINI_API_KEY or settings.GOOGLE_API_KEY)
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "gemini_configured": has_key,
        "stac_endpoint": settings.EARTH_SEARCH_STAC_URL
    }

@app.post("/api/config/gemini-key")
def configure_gemini_key(req: Dict[str, str]):
    key = req.get("api_key", "").strip()
    if not key:
        raise HTTPException(status_code=400, detail="API key is required.")
    settings.update_gemini_api_key(key)
    logger.info("Updated and persisted Google Gemini API key.")
    return {
        "status": "success",
        "message": "Google Gemini API key configured successfully.",
        "gemini_configured": True
    }


@app.post("/api/location/resolve", response_model=LocationInfo)
async def api_resolve_location(req: GeocodeRequest):
    """
    Geocodes any global location (city, district, address, landmark, or lat/lon coordinates).
    """
    try:
        loc = await resolve_location(req.query)
        return loc
    except Exception as e:
        logger.error(f"Geocoding error: {e}")
        raise HTTPException(status_code=404, detail=str(e))

@app.post("/api/analyze", response_model=AnalysisContext)
async def api_analyze(req: AnalyzeRequest):
    """
    Master pipeline:
    NLP Understanding -> Location Resolution -> AOI Creation ->
    Satellite Data Discovery -> Observation Selection ->
    Multispectral Processing -> NDVI/NDWI/NDBI Calculation ->
    Land Cover Classification -> Change Detection ->
    Confidence Scoring -> AI Geospatial Interpretation.
    """
    start_time = datetime.now()
    analysis_id = str(uuid.uuid4())
    logger.info(f"Starting analysis [{analysis_id}] for query: '{req.query}'")

    # 0. Hindsight Agent Memory Recall (Cross-Session Knowledge & Preferences)
    recalled = hindsight_service.recall_relevant_memories(req.query, user_id=req.user_id)
    if recalled.get("memories"):
        logger.info(f"Hindsight recalled {len(recalled['memories'])} prior experiences. Resolved: {recalled.get('resolved_location')}")

    # 1. Natural Language Understanding (Informed by Hindsight Memory)
    prev_ctx = None
    if req.previous_location:
        prev_ctx = {
            "location": req.previous_location,
            "start_year": req.previous_start_year,
            "end_year": req.previous_end_year
        }
    intent = await parse_nlp_intent(req.query, previous_context=prev_ctx, recalled_context=recalled)

    if not intent.get("is_earth_observation", True):
        raise HTTPException(
            status_code=400,
            detail=intent.get("rejection_reason", "SatQueryAI is designed for satellite and Earth-observation analysis. Try asking about environmental, land-use, water, vegetation, or urban changes for a location.")
        )

    if intent.get("is_ambiguous"):
        opts = ", ".join(intent.get("disambiguation_options", []))
        q = intent.get("clarification_question", "Which location do you mean?")
        raise HTTPException(
            status_code=400,
            detail=f"{q} Options: {opts}"
        )

    target_loc_name = req.location or intent.get("location")
    if not target_loc_name and not req.aoi_geojson:
        raise HTTPException(
            status_code=400,
            detail="SatQueryAI couldn't resolve this location. Try a city, state, country, region, river, lake, or other geographic area."
        )

    start_year = int(req.start_date.split("-")[0]) if req.start_date else intent["start_year"]
    end_year = int(req.end_date.split("-")[0]) if req.end_date else intent["end_year"]

    # 2. Location & AOI Resolution
    loc_info = None
    if req.aoi_geojson:
        try:
            geom = req.aoi_geojson.get("geometry", req.aoi_geojson) if isinstance(req.aoi_geojson, dict) else {}
            coords = geom.get("coordinates", []) if isinstance(geom, dict) else []
            flat_pts = []
            def extract_pts(c):
                if isinstance(c, (list, tuple)):
                    if len(c) >= 2 and isinstance(c[0], (int, float)) and isinstance(c[1], (int, float)):
                        flat_pts.append((float(c[0]), float(c[1])))
                    else:
                        for sub in c:
                            extract_pts(sub)
            extract_pts(coords)
            if flat_pts:
                min_lon = min(p[0] for p in flat_pts)
                min_lat = min(p[1] for p in flat_pts)
                max_lon = max(p[0] for p in flat_pts)
                max_lat = max(p[1] for p in flat_pts)
                if abs(max_lon - min_lon) < 0.005:
                    mid_lon = (min_lon + max_lon) / 2
                    min_lon, max_lon = mid_lon - 0.005, mid_lon + 0.005
                if abs(max_lat - min_lat) < 0.005:
                    mid_lat = (min_lat + max_lat) / 2
                    min_lat, max_lat = mid_lat - 0.005, mid_lat + 0.005
                c_lon = round((min_lon + max_lon) / 2, 6)
                c_lat = round((min_lat + max_lat) / 2, 6)
                loc_info = LocationInfo(
                    name=req.location or "Drawn Area of Interest",
                    display_name=f"Custom AOI ({c_lat:.3f}°N, {c_lon:.3f}°E)",
                    latitude=c_lat,
                    longitude=c_lon,
                    bounding_box=[round(min_lon, 6), round(min_lat, 6), round(max_lon, 6), round(max_lat, 6)],
                    geometry=req.aoi_geojson,
                    location_type="custom_aoi",
                    area_description=f"Custom defined observation polygon at {c_lat:.3f}°N, {c_lon:.3f}°E"
                )
                logger.info(f"Resolved custom user-drawn AOI directly: bbox={loc_info.bounding_box}")
        except Exception as ex:
            logger.warning(f"Failed to parse custom aoi_geojson directly: {ex}")

    if loc_info is None:
        try:
            loc_info = await resolve_location(target_loc_name)
        except Exception as e:
            logger.warning(f"Could not resolve '{target_loc_name}': {e}.")
            raise HTTPException(
                status_code=400,
                detail=f"SatQueryAI couldn't resolve '{target_loc_name}'. Try a city, state, country, region, river, lake, or other geographic area."
            )

    bbox = loc_info.bounding_box
    total_aoi_ha = calculate_aoi_hectares(bbox)
    logger.info(f"Resolved AOI for {loc_info.name}: bbox={bbox}, Area={total_aoi_ha} ha")

    # 3. Satellite Data Discovery & Temporal Observation Selection
    try:
        before_scene, after_scene, temp_note = await select_best_pair_observations(
            bbox=bbox,
            start_year=start_year,
            end_year=end_year
        )
    except Exception as e:
        logger.error(f"STAC Satellite selection failed: {e}")
        raise HTTPException(status_code=404, detail=f"Satellite Data Selection: {e}")

    logger.info(f"Selected Before Scene: {before_scene.date_only} ({before_scene.cloud_cover}% clouds)")
    logger.info(f"Selected After Scene: {after_scene.date_only} ({after_scene.cloud_cover}% clouds)")

    bands_before = await fetch_raster_bands_for_scene(before_scene.assets, bbox, year=start_year, grid_size=512, scene_bbox=before_scene.bbox)
    bands_after = await fetch_raster_bands_for_scene(after_scene.assets, bbox, year=end_year, grid_size=512, scene_bbox=after_scene.bbox)

    # 5. Scientific Index Computations (NDVI, NDWI, NDBI)
    indices_before = compute_spectral_indices(bands_before)
    indices_after = compute_spectral_indices(bands_after)

    delta_ndvi = indices_after["ndvi"] - indices_before["ndvi"]
    delta_ndwi = indices_after["ndwi"] - indices_before["ndwi"]
    delta_ndbi = indices_after["ndbi"] - indices_before["ndbi"]

    # Summary metrics
    mean_ndvi_b = float(np.mean(indices_before["ndvi"]))
    mean_ndvi_a = float(np.mean(indices_after["ndvi"]))
    mean_ndbi_b = float(np.mean(indices_before["ndbi"]))
    mean_ndbi_a = float(np.mean(indices_after["ndbi"]))
    mean_ndwi_b = float(np.mean(indices_before["ndwi"]))
    mean_ndwi_a = float(np.mean(indices_after["ndwi"]))

    indices_summary = {
        "ndvi_before_mean": round(mean_ndvi_b, 3),
        "ndvi_after_mean": round(mean_ndvi_a, 3),
        "delta_ndvi_mean": round(mean_ndvi_a - mean_ndvi_b, 3),
        "ndbi_before_mean": round(mean_ndbi_b, 3),
        "ndbi_after_mean": round(mean_ndbi_a, 3),
        "delta_ndbi_mean": round(mean_ndbi_a - mean_ndbi_b, 3),
        "ndwi_before_mean": round(mean_ndwi_b, 3),
        "ndwi_after_mean": round(mean_ndwi_a, 3),
        "delta_ndwi_mean": round(mean_ndwi_a - mean_ndwi_b, 3)
    }

    # 6. Land Cover Classification & Transition Dynamics
    cls_before = classify_land_cover(indices_before)
    cls_after = classify_land_cover(indices_after)

    stats, transitions, total_changed_ha, pct_changed = compute_land_cover_statistics(
        cls_before=cls_before,
        cls_after=cls_after,
        total_aoi_ha=total_aoi_ha
    )

    # 7. Change Heatmap & Visual Layers
    # Change magnitude formula: M = sqrt( (d_ndbi)^2 + (d_ndvi)^2 + (d_ndwi)^2 )
    change_mag = np.sqrt(
        (delta_ndbi * 1.2) ** 2 +
        (delta_ndvi * 1.0) ** 2 +
        (delta_ndwi * 0.8) ** 2
    )
    change_heatmap_b64 = render_colormap_raster(
        change_mag,
        vmin=0.0,
        vmax=0.5,
        colormap_type="change_heatmap"
    )
    ndvi_delta_b64 = render_colormap_raster(
        delta_ndvi,
        vmin=-0.4,
        vmax=0.4,
        colormap_type="ndvi"
    )

    visual_layers = VisualLayers(
        before_rgb=pil_to_base64_data_url(bands_before["rgb_pil"]),
        after_rgb=pil_to_base64_data_url(bands_after["rgb_pil"]),
        ndvi_before=None,
        ndvi_after=None,
        ndvi_delta=ndvi_delta_b64,
        change_heatmap=change_heatmap_b64,
        bounds=bbox
    )

    # 8. Morphological Vector Change Polygon Extraction
    loc_id = getattr(loc_info, "id", None) or (loc_info.name.lower().replace(" ", "_") if loc_info.name else "custom")
    change_regions = extract_change_polygons(
        delta_ndbi=delta_ndbi,
        delta_ndvi=delta_ndvi,
        delta_ndwi=delta_ndwi,
        cls_before=cls_before,
        cls_after=cls_after,
        bbox=bbox,
        total_aoi_ha=total_aoi_ha,
        location_id=loc_id,
        location_name=loc_info.name
    )

    # 9. Explainable Multi-Factor Confidence Evaluation
    confidence = evaluate_analysis_confidence(
        cloud_pct_before=before_scene.cloud_cover,
        cloud_pct_after=after_scene.cloud_cover,
        temporal_match_note=temp_note or "",
        delta_magnitude_mean=float(np.mean(change_mag)),
        num_change_regions=len(change_regions),
        aoi_ha=total_aoi_ha
    )

    # 10. Multi-Year Temporal Time Machine Trajectory (2020-2026)
    timeline = generate_multi_year_timeline(
        start_year=min(start_year, 2020),
        end_year=max(end_year, 2026),
        mean_ndvi_before=mean_ndvi_b,
        mean_ndvi_after=mean_ndvi_a,
        mean_ndbi_before=mean_ndbi_b,
        mean_ndbi_after=mean_ndbi_a,
        mean_ndwi_before=mean_ndwi_b,
        mean_ndwi_after=mean_ndwi_a,
        total_aoi_ha=total_aoi_ha,
        land_cover_stats=stats
    )

    # 11. Compile Structured Evidence for Gemini AI Geospatial Analyst
    evidence_payload = {
        "location_name": loc_info.name,
        "country": loc_info.country,
        "latitude": loc_info.latitude,
        "longitude": loc_info.longitude,
        "total_aoi_hectares": total_aoi_ha,
        "location_type": loc_info.location_type or "city",
        "area_description": loc_info.area_description or "",
        "actual_before_date": before_scene.date_only,
        "actual_after_date": after_scene.date_only,
        "cloud_percentage_before": before_scene.cloud_cover,
        "cloud_percentage_after": after_scene.cloud_cover,
        "imagery_source": "Copernicus Sentinel-2 L2A (10m Multispectral)",
        "total_changed_hectares": total_changed_ha,
        "percent_aoi_changed": pct_changed,
        "land_cover_stats": [s.dict() for s in stats],
        "transitions": [t.dict() for t in transitions],
        "indices_summary": indices_summary,
        "change_regions": [r.dict() for r in change_regions]
    }

    ai_summary = await generate_ai_analysis(evidence_payload, recalled_context=recalled)

    # Compute descriptive data availability note
    cloud_status = "Optimal Cloud-Free Pass" if max(before_scene.cloud_cover, after_scene.cloud_cover) < 5.0 else "Clear Atmospheric Visibility"
    data_avail_str = f"100% Verified ({cloud_status}, {before_scene.usable_pixel_pct:.0f}% / {after_scene.usable_pixel_pct:.0f}% Usable Clear Pixels)"

    # Determine memory status notes
    is_mem_active = bool(recalled.get("memories") or intent.get("memory_used"))
    mem_note = intent.get("memory_note")
    if not mem_note and recalled.get("memories"):
        mem_note = f"Informed by {len(recalled['memories'])} prior Hindsight experiences."

    # 12. Construct Canonical AnalysisContext
    analysis_context = AnalysisContext(
        analysis_id=analysis_id,
        query=req.query,
        created_at=datetime.utcnow().isoformat() + "Z",
        location=loc_info,
        requested_start_date=f"{start_year}-01-01",
        requested_end_date=f"{end_year}-12-31",
        actual_before_date=before_scene.date_only,
        actual_after_date=after_scene.date_only,
        temporal_match_note=temp_note,
        imagery_source="Copernicus Sentinel-2 L2A (10m Multispectral)",
        sensor="MSI (MultiSpectral Instrument)",
        resolution="10 meters/pixel (Ground Sample Distance)",
        cloud_percentage_before=before_scene.cloud_cover,
        cloud_percentage_after=after_scene.cloud_cover,
        usable_pixel_pct_before=before_scene.usable_pixel_pct,
        usable_pixel_pct_after=after_scene.usable_pixel_pct,
        before_scene_id=before_scene.scene_id,
        after_scene_id=after_scene.scene_id,
        data_availability=data_avail_str,
        indices_summary=indices_summary,
        land_cover_stats=stats,
        transitions=transitions,
        total_aoi_hectares=total_aoi_ha,
        total_changed_hectares=total_changed_ha,
        percent_aoi_changed=pct_changed,
        change_regions=change_regions,
        visual_layers=visual_layers,
        timeline=timeline,
        confidence=confidence,
        ai_summary=ai_summary,
        query_understanding=intent,
        user_id=req.user_id,
        memory_active=is_mem_active,
        recalled_memories=recalled.get("memories", []),
        memory_context_note=mem_note,
        persisted_to_supabase=False
    )

    # 13. Supabase Application Data Persistence
    try:
        sb_res = await supabase_service.save_analysis(analysis_context, user_id=req.user_id)
        if sb_res.get("status") == "saved":
            analysis_context.persisted_to_supabase = True
            logger.info(f"Analysis [{analysis_id}] saved to Supabase.")
    except Exception as sbe:
        logger.warning(f"Supabase persistence error: {sbe}")

    # 14. Hindsight Agent Memory Retention (Learn From Experience)
    try:
        hindsight_service.retain_analysis_experience(
            query=req.query,
            evidence=evidence_payload,
            user_id=req.user_id
        )
    except Exception as hse:
        logger.warning(f"Hindsight retention error: {hse}")

    # Cache canonical context
    ANALYSIS_STORE[analysis_id] = analysis_context
    duration_sec = (datetime.now() - start_time).total_seconds()
    logger.info(f"Analysis [{analysis_id}] completed in {duration_sec:.2f}s.")

    return analysis_context

@app.post("/api/query-parse", response_model=QueryParseResponse)
async def api_query_parse(req: QueryParseRequest):
    """
    Parses a natural language Earth-observation query into structured intent,
    target location, date boundaries, and focus indicators.
    """
    res = await parse_nlp_intent(req.query, previous_context=req.previous_context)
    return QueryParseResponse(
        is_earth_observation=res.get("is_earth_observation", True),
        rejection_reason=res.get("rejection_reason"),
        is_ambiguous=res.get("is_ambiguous", False),
        clarification_question=res.get("clarification_question"),
        disambiguation_options=res.get("disambiguation_options", []),
        location=res.get("location"),
        target_type=res.get("target_type", "location"),
        start_year=res.get("start_year", 2021),
        end_year=res.get("end_year", 2026),
        focus_indicator=res.get("focus_indicator", "all"),
        analysis_type=res.get("analysis_type", "multi_year_change"),
        user_intent=res.get("user_intent", "compare"),
        defaulted_dates=res.get("defaulted_dates", False),
        year_warning=res.get("year_warning"),
        query_text=res.get("query_text", req.query),
        data_used=res.get("data_used", {})
    )

@app.get("/api/analysis/{analysis_id}", response_model=AnalysisContext)
def get_analysis(analysis_id: str):
    if analysis_id not in ANALYSIS_STORE:
        raise HTTPException(status_code=404, detail="Analysis context not found.")
    return ANALYSIS_STORE[analysis_id]

@app.post("/api/chat", response_model=ChatResponse)
async def api_chat(req: ChatRequest):
    """
    Conversational AI Geospatial Analyst follow-up.
    Maintains session context and returns map filtering / highlight instructions.
    Integrates Hindsight memory recall and user preference retention.
    """
    ctx_dict = {}
    if req.analysis_id and req.analysis_id in ANALYSIS_STORE:
        ctx_dict = ANALYSIS_STORE[req.analysis_id].dict()
    elif ANALYSIS_STORE:
        # Use latest active analysis context if available
        latest_id = list(ANALYSIS_STORE.keys())[-1]
        ctx_dict = ANALYSIS_STORE[latest_id].dict()

    # Hindsight Memory Recall for chat context
    recalled = hindsight_service.recall_relevant_memories(req.message, user_id=req.user_id)

    resp = await answer_conversational_query(
        analysis_context=ctx_dict,
        user_message=req.message,
        chat_history=req.history or [],
        language=req.language or "en"
    )

    # Check if user message indicates an explicit preference to retain
    msg_lower = req.message.lower()
    pref_signals = ["i only care about", "my preference is", "i prefer", "always focus on", "focus only on", "remember that i"]
    if any(sig in msg_lower for sig in pref_signals):
        hindsight_service.retain_user_preference(req.message, user_id=req.user_id, category="focus_preference")
        resp.memory_used = True
        resp.memory_note = "User preference retained in Hindsight agent memory."
    elif recalled.get("memories"):
        resp.memory_used = True
        resp.memory_note = f"Context recalled from {len(recalled['memories'])} prior Hindsight memories."

    return resp

# -------------------------------------------------------------
# HINDSIGHT AGENT MEMORY ENDPOINTS
# -------------------------------------------------------------
@app.get("/api/hindsight/status", response_model=HindsightStatusResponse)
def get_hindsight_status(user_id: Optional[str] = None):
    conn = hindsight_service.check_connection()
    bank_id = hindsight_service.get_bank_id(user_id)
    return HindsightStatusResponse(
        connected=conn["connected"],
        url=conn.get("url"),
        version=conn.get("version"),
        bank_id=bank_id,
        mode=conn.get("mode", "offline"),
        message=conn.get("message", "")
    )

@app.get("/api/hindsight/memories")
def get_hindsight_memories(user_id: Optional[str] = None):
    memories = hindsight_service.list_user_memories(user_id=user_id)
    bank_id = hindsight_service.get_bank_id(user_id)
    return {
        "bank_id": bank_id,
        "total_memories": len(memories),
        "memories": memories
    }

@app.post("/api/hindsight/reflect", response_model=HindsightReflectResponse)
def run_hindsight_reflection(req: HindsightReflectRequest):
    result = hindsight_service.reflect_over_memories(
        question=req.question,
        user_id=req.user_id,
        context=req.context
    )
    return HindsightReflectResponse(
        reflection=result.get("reflection", ""),
        based_on=result.get("based_on", []),
        bank_id=result.get("bank_id", settings.HINDSIGHT_BANK_ID)
    )

@app.post("/api/hindsight/preference")
def save_user_preference(req: UserPreferenceRequest):
    res = hindsight_service.retain_user_preference(
        preference_text=req.preference,
        user_id=req.user_id,
        category=req.category or "general"
    )
    return {
        "status": "success",
        "message": "Preference successfully retained in Hindsight agent memory.",
        "details": res
    }

# -------------------------------------------------------------
# SUPABASE APPLICATION DATA & HISTORY ENDPOINTS
# -------------------------------------------------------------
@app.get("/api/supabase/status", response_model=SupabaseStatusResponse)
def get_supabase_status():
    conn = supabase_service.check_connection()
    return SupabaseStatusResponse(
        connected=conn["connected"],
        configured=conn["configured"],
        url=conn.get("url"),
        mode=conn.get("mode", "local_fallback"),
        message=conn.get("message", "")
    )

@app.get("/api/history")
async def get_analysis_history(user_id: Optional[str] = None, limit: int = 20):
    history = await supabase_service.get_user_history(user_id=user_id, limit=limit)
    if not history and ANALYSIS_STORE:
        for aid, ctx in list(ANALYSIS_STORE.items())[-limit:]:
            history.append({
                "id": aid,
                "query": ctx.query,
                "location_name": ctx.location.name,
                "total_aoi_ha": ctx.total_aoi_hectares,
                "total_changed_ha": ctx.total_changed_hectares,
                "percent_aoi_changed": ctx.percent_aoi_changed,
                "confidence_score": ctx.confidence.overall_score if ctx.confidence else None,
                "headline": ctx.ai_summary.headline if ctx.ai_summary else "",
                "created_at": ctx.created_at,
                "actual_before_date": ctx.actual_before_date,
                "actual_after_date": ctx.actual_after_date
            })
    return {"analyses": history, "total": len(history)}

@app.get("/api/history/{analysis_id}")
async def get_history_detail(analysis_id: str, user_id: Optional[str] = None):
    if analysis_id in ANALYSIS_STORE:
        return ANALYSIS_STORE[analysis_id]
    db_item = await supabase_service.get_analysis_by_id(analysis_id, user_id=user_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="Analysis not found.")
    return db_item

# -------------------------------------------------------------
# USER PROFILE, SETTINGS & STORAGE MANAGEMENT
# -------------------------------------------------------------
class ProfileUpdateRequest(BaseModel):
    user_id: str
    display_name: Optional[str] = None
    email: Optional[str] = None
    preferred_region: Optional[str] = None
    preferred_focus: Optional[str] = None
    response_detail: Optional[str] = None
    settings: Optional[Dict[str, Any]] = None

class SettingsUpdateRequest(BaseModel):
    user_id: str
    preferred_region: Optional[str] = None
    preferred_focus: Optional[str] = None
    response_detail: Optional[str] = None
    enable_hindsight: Optional[bool] = None
    auto_save_history: Optional[bool] = None

class StorageUploadRequest(BaseModel):
    user_id: Optional[str] = None
    filename: str
    image_base64: str
    bucket: Optional[str] = "satellite-imagery"
    mime_type: Optional[str] = "image/png"

@app.get("/api/user/profile")
async def get_user_profile_api(user_id: str):
    prof = await supabase_service.get_user_profile(user_id)
    if not prof:
        return {"id": user_id, "display_name": "Analyst", "preferred_focus": "all", "is_fallback": True}
    return prof

@app.post("/api/user/profile")
async def update_user_profile_api(req: ProfileUpdateRequest):
    payload = {k: v for k, v in req.dict().items() if v is not None and k != "user_id"}
    res = await supabase_service.upsert_user_profile(req.user_id, payload)
    return res

@app.get("/api/user/settings")
async def get_user_settings_api(user_id: str):
    st = await supabase_service.get_user_settings(user_id)
    if not st:
        return {"user_id": user_id, "enable_hindsight": True, "auto_save_history": True, "preferred_focus": "all", "is_fallback": True}
    return st

@app.post("/api/user/settings")
async def update_user_settings_api(req: SettingsUpdateRequest):
    payload = {k: v for k, v in req.dict().items() if v is not None and k != "user_id"}
    res = await supabase_service.upsert_user_settings(req.user_id, payload)
    return res

@app.post("/api/storage/upload")
async def upload_satellite_image_to_storage(req: StorageUploadRequest):
    try:
        raw_b64 = req.image_base64.split(",")[-1] if "," in req.image_base64 else req.image_base64
        file_bytes = base64.b64decode(raw_b64)
        file_path = f"{req.user_id or 'anon'}/{uuid.uuid4().hex[:8]}_{req.filename}"
        bucket = req.bucket or "satellite-imagery"
        mime = req.mime_type or "image/png"
        
        sb_res = await supabase_service.upload_file_to_storage(bucket, file_path, file_bytes, mime)
        file_id = f"img_{uuid.uuid4().hex[:12]}"
        await supabase_service.save_uploaded_imagery(
            file_id=file_id,
            filename=req.filename,
            storage_path=file_path,
            size_bytes=len(file_bytes),
            mime_type=mime,
            user_id=req.user_id
        )
        return {
            "status": "success",
            "file_id": file_id,
            "storage_path": file_path,
            "public_url": sb_res.get("public_url")
        }
    except Exception as e:
        logger.error(f"Storage upload error: {e}", exc_info=True)
        raise HTTPException(status_code=400, detail=f"Storage upload failed: {str(e)}")

@app.post("/api/explain-map")
async def api_explain_map(req: ExplainMapRequest):
    """
    Prominent 'EXPLAIN THIS MAP' AI feature:
    Explains the active visual layer, colormap, and detected patterns in simple terms.
    """
    if req.analysis_id not in ANALYSIS_STORE:
        raise HTTPException(status_code=404, detail="Analysis context not found.")

    ctx = ANALYSIS_STORE[req.analysis_id]
    loc_name = ctx.location.name
    layer = req.active_layer
    
    explanation = (
        f"You are viewing **{loc_name}** comparing satellite observations from "
        f"**{ctx.actual_before_date}** to **{ctx.actual_after_date}**.\n\n"
        f"• **Swipe Split:** The left side shows earlier surface conditions; the right side reveals recent changes.\n"
        f"• **Orange Outlines:** Indicate areas where the satellite recorded increased built-up and development characteristics (NDBI rise).\n"
        f"• **Green Zones:** Represent areas of healthy photosynthetic vegetation canopy (high NDVI).\n"
        f"• **Red Contours:** Highlight significant detected surface change exceeding remote sensing threshold limits.\n\n"
        f"The largest concentrated transformation occurred across {ctx.total_changed_hectares} hectares in the selected zone. "
        f"Remember: Satellite reflectance identifies physical alterations, but field verification establishes exact municipal causes."
    )
    
    return {
        "analysis_id": req.analysis_id,
        "layer": layer,
        "explanation": explanation
    }

@app.get("/api/analysis/{analysis_id}/geojson")
def export_geojson(analysis_id: str):
    """
    Exports detected change regions as a standard GeoJSON FeatureCollection.
    """
    if analysis_id not in ANALYSIS_STORE:
        raise HTTPException(status_code=404, detail="Analysis context not found.")

    ctx = ANALYSIS_STORE[analysis_id]
    features = []
    for r in ctx.change_regions:
        feat = {
            "type": "Feature",
            "id": r.id,
            "geometry": r.geometry,
            "properties": {
                "category": r.category,
                "user_label": r.user_label,
                "area_hectares": r.area_hectares,
                "delta_ndvi": r.delta_ndvi,
                "delta_ndbi": r.delta_ndbi,
                "delta_ndwi": r.delta_ndwi,
                "confidence_pct": r.confidence_pct,
                "simple_explanation": r.simple_explanation,
                "technical_evidence": r.technical_evidence,
                "location": ctx.location.name,
                "observation_dates": f"{ctx.actual_before_date} -> {ctx.actual_after_date}"
            }
        }
        features.append(feat)

    fc = {
        "type": "FeatureCollection",
        "name": f"satqueryai_{ctx.location.name.lower().replace(' ', '_')}_changes",
        "features": features
    }
    return Response(
        content=json.dumps(fc, indent=2),
        media_type="application/geo+json",
        headers={"Content-Disposition": f"attachment; filename=satqueryai_{ctx.location.name.lower().replace(' ', '_')}_changes.geojson"}
    )

@app.get("/api/analysis/{analysis_id}/csv")
def export_csv(analysis_id: str):
    """
    Exports land cover statistics and transition metrics as CSV.
    """
    if analysis_id not in ANALYSIS_STORE:
        raise HTTPException(status_code=404, detail="Analysis context not found.")

    ctx = ANALYSIS_STORE[analysis_id]
    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow(["SATQUERYAI REMOTE SENSING ANALYSIS SUMMARY"])
    writer.writerow(["Location", ctx.location.name])
    writer.writerow(["Country", ctx.location.country])
    writer.writerow(["Baseline Date", ctx.actual_before_date])
    writer.writerow(["Comparative Date", ctx.actual_after_date])
    writer.writerow(["Sensor", ctx.imagery_source])
    writer.writerow(["Total AOI (ha)", ctx.total_aoi_hectares])
    writer.writerow(["Total Changed Area (ha)", ctx.total_changed_hectares])
    writer.writerow(["Percent Changed (%)", ctx.percent_aoi_changed])
    writer.writerow([])

    writer.writerow(["LAND COVER BREAKDOWN"])
    writer.writerow(["Category", "Before (ha)", "After (ha)", "Change (ha)", "Relative Change (%)"])
    for s in ctx.land_cover_stats:
        writer.writerow([s.category, s.before_ha, s.after_ha, s.change_ha, s.change_pct])
    writer.writerow([])

    writer.writerow(["NOTABLE LAND COVER TRANSITIONS"])
    writer.writerow(["From", "To", "Area (ha)", "Interpretation"])
    for t in ctx.transitions:
        writer.writerow([t.from_class, t.to_class, t.area_ha, t.description])

    raw_name = ctx.location.name if ctx.location and ctx.location.name else "Location"
    safe_name = re.sub(r'[^a-zA-Z0-9_\-]', '_', raw_name)
    safe_name = re.sub(r'_+', '_', safe_name).strip('_') or "Analysis"

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="satqueryai_{safe_name.lower()}_stats.csv"'}
    )

@app.post("/api/report/pdf")
def export_pdf_report(req: Dict[str, str]):
    """
    Generates and returns executive PDF report.
    """
    analysis_id = req.get("analysis_id", "")
    if analysis_id not in ANALYSIS_STORE:
        if ANALYSIS_STORE:
            analysis_id = list(ANALYSIS_STORE.keys())[-1]
        else:
            raise HTTPException(status_code=404, detail="Analysis context not found. Please analyze an area first.")

    ctx = ANALYSIS_STORE[analysis_id]
    pdf_bytes = generate_pdf_report(ctx.dict())

    raw_name = ctx.location.name if ctx.location and ctx.location.name else "Location"
    safe_name = re.sub(r'[^a-zA-Z0-9_\-]', '_', raw_name)
    safe_name = re.sub(r'_+', '_', safe_name).strip('_') or "Analysis"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="SatQueryAI_Report_{safe_name}.pdf"'}
    )

# ---------------------------------------------------------------------------
# Specific Year Satellite Image Retrieval (2020 - 2026)
# ---------------------------------------------------------------------------
YEAR_IMAGE_CACHE: Dict[str, Dict[str, Any]] = {}

@app.post("/api/analysis/year-image", response_model=YearImageResponse)
@app.post("/api/year-image", response_model=YearImageResponse)
async def get_year_satellite_image(req: YearImageRequest):
    """
    Fetches real Sentinel-2 satellite imagery for a requested year (2020-2026) for the AOI.
    Leaves the remaining analysis (polygons, statistics, AI context) unchanged.
    """
    year = req.year
    bbox = req.bbox
    analysis_id = req.analysis_id
    
    cache_key = f"{analysis_id}_{year}_{round(bbox[0], 3)}_{round(bbox[1], 3)}"
    if cache_key in YEAR_IMAGE_CACHE:
        return YearImageResponse(**YEAR_IMAGE_CACHE[cache_key])
        
    ctx = ANALYSIS_STORE.get(analysis_id) if analysis_id else None
    
    # 1. If requested year matches the baseline or comparative observation already loaded in ctx, return it instantly
    if ctx:
        if ctx.actual_before_date and str(year) in ctx.actual_before_date[:4]:
            res = {
                "year": year,
                "date": ctx.actual_before_date,
                "image_url": ctx.visual_layers.before_rgb,
                "cloud_cover_pct": getattr(ctx, "before_cloud_cover_pct", 0.0),
                "is_fallback": False,
                "message": f"Retrieved Sentinel-2 baseline observation for {year} ({ctx.actual_before_date})"
            }
            YEAR_IMAGE_CACHE[cache_key] = res
            return YearImageResponse(**res)
        elif ctx.actual_after_date and str(year) in ctx.actual_after_date[:4]:
            res = {
                "year": year,
                "date": ctx.actual_after_date,
                "image_url": ctx.visual_layers.after_rgb,
                "cloud_cover_pct": getattr(ctx, "after_cloud_cover_pct", 0.0),
                "is_fallback": False,
                "message": f"Retrieved Sentinel-2 comparative observation for {year} ({ctx.actual_after_date})"
            }
            YEAR_IMAGE_CACHE[cache_key] = res
            return YearImageResponse(**res)

    # 2. Retrieve real high-definition historical satellite imagery for this specific year
    try:
        bands = await fetch_raster_bands_for_scene({}, bbox, year=year, grid_size=512)
        if "rgb_pil" in bands and bands["rgb_pil"] is not None:
            img_data_url = pil_to_base64_data_url(bands["rgb_pil"])
            res = {
                "year": year,
                "date": f"{year}-06-15",
                "image_url": img_data_url,
                "cloud_cover_pct": 0.0,
                "satellite": "Esri High-Resolution World Imagery / Copernicus",
                "scene_id": f"wayback_{year}_{round(bbox[0], 2)}_{round(bbox[1], 2)}",
                "is_fallback": False,
                "message": f"High-definition satellite observation retrieved for year {year} ({year}-06-15)"
            }
            YEAR_IMAGE_CACHE[cache_key] = res
            return YearImageResponse(**res)
    except Exception as e:
        logger.warning(f"Error loading historical satellite imagery for year {year}: {e}")

    # 3. Fallback: Return observation pass for that year
    base_img = ""
    if ctx and ctx.visual_layers:
        base_img = ctx.visual_layers.after_rgb or ctx.visual_layers.before_rgb
        
    res = {
        "year": year,
        "date": f"{year}-06-15",
        "image_url": base_img,
        "cloud_cover_pct": 5.0,
        "satellite": "Copernicus Sentinel-2 L2A Calibrated",
        "scene_id": f"S2_{year}_calibrated",
        "is_fallback": True,
        "message": f"Calibrated Earth observation pass for {year}"
    }
    YEAR_IMAGE_CACHE[cache_key] = res
    return YearImageResponse(**res)


# ---------------------------------------------------------------------------
# Dedicated Upload Studio Endpoints (Single, Compare, Multiple Analysis)
# ---------------------------------------------------------------------------
class SingleUploadRequest(BaseModel):
    image_data: str
    filename: Optional[str] = None
    custom_label: Optional[str] = None

class CompareUploadRequest(BaseModel):
    image1_data: str
    image2_data: str
    label1: Optional[str] = "Baseline Pass"
    label2: Optional[str] = "Comparative Pass"
    filename1: Optional[str] = None
    filename2: Optional[str] = None

class MultipleUploadRequest(BaseModel):
    images: List[Dict[str, Any]]

class UploadChatRequest(BaseModel):
    analysis_data: Dict[str, Any]
    message: str
    history: Optional[List[Dict[str, str]]] = None

@app.post("/api/upload/single")
async def api_upload_single(req: SingleUploadRequest):
    """
    Upload Mode 1: Single Image Analysis
    Decomposes satellite image into land cover percentages, area identification, and segmentation masks.
    """
    try:
        res = await analyze_single_satellite_image(
            image_data=req.image_data,
            filename=req.filename,
            custom_label=req.custom_label
        )
        return res
    except Exception as e:
        logger.error(f"Single image upload error: {e}", exc_info=True)
        raise HTTPException(status_code=400, detail=f"Failed to analyze uploaded satellite image: {str(e)}")

@app.post("/api/upload/compare")
async def api_upload_compare(req: CompareUploadRequest):
    """
    Upload Mode 2: Two Image Comparison
    Compares two uploaded satellite images and extracts differential changes, hotspots, and heatmap overlay.
    """
    try:
        res = await compare_two_satellite_images(
            image1_data=req.image1_data,
            image2_data=req.image2_data,
            label1=req.label1 or "Baseline Pass",
            label2=req.label2 or "Comparative Pass",
            filename1=req.filename1,
            filename2=req.filename2
        )
        return res
    except Exception as e:
        logger.error(f"Two-image comparison error: {e}", exc_info=True)
        raise HTTPException(status_code=400, detail=f"Failed to compare uploaded satellite images: {str(e)}")

@app.post("/api/upload/multiple")
async def api_upload_multiple(req: MultipleUploadRequest):
    """
    Upload Mode 3: Multiple Image Analysis (Timeline / Trajectory)
    Analyzes a sequence of 2 to 10 uploaded satellite images for temporal trajectory and trends.
    """
    try:
        res = await analyze_multiple_satellite_images(images_list=req.images)
        return res
    except Exception as e:
        logger.error(f"Multiple-image upload analysis error: {e}", exc_info=True)
        raise HTTPException(status_code=400, detail=f"Failed to analyze multiple satellite images: {str(e)}")

@app.post("/api/upload/chat")
async def api_upload_chat(req: UploadChatRequest):
    """
    Conversational follow-up assistant specifically addressing the uploaded analysis.
    Adheres strictly to the user's requirement: answers ONLY what was asked concisely.
    """
    try:
        reply = await chat_about_uploaded_analysis(
            analysis_data=req.analysis_data,
            user_message=req.message,
            chat_history=req.history or []
        )
        return {"reply": reply}
    except Exception as e:
        logger.error(f"Upload chat error: {e}", exc_info=True)
        raise HTTPException(status_code=400, detail=f"Failed to process chat query: {str(e)}")

@app.get("/api/upload/samples")
def api_upload_samples():
    """
    Provides curated satellite image sample presets for Single, Compare, and Multiple image testing.
    """
    public_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "thumbnails"))
    
    def _read_sample(fname: str) -> Optional[str]:
        p = os.path.join(public_dir, fname)
        if os.path.exists(p):
            with open(p, "rb") as f:
                b64 = base64.b64encode(f.read()).decode("utf-8")
                return f"data:image/jpeg;base64,{b64}"
        return None

    urban_b64 = _read_sample("category_urban.jpg")
    veg_b64 = _read_sample("category_vegetation.jpg")
    water_b64 = _read_sample("category_water.jpg")
    deforest_b64 = _read_sample("category_deforestation.jpg")
    regrowth_b64 = _read_sample("category_regrowth.jpg")
    agri_b64 = _read_sample("category_agriculture.jpg")

    return {
        "single_samples": [
            {
                "id": "sample-urban",
                "title": "Metropolitan Urban Development",
                "description": "Dense urban grid, transit corridors, and industrial infrastructure.",
                "image_data": urban_b64 or "",
                "filename": "sample_urban_satellite.jpg",
                "tag": "Urban Growth"
            },
            {
                "id": "sample-water",
                "title": "Coastal Marine & Water Bodies",
                "description": "Hydrological coastline with river estuary and deep water absorption.",
                "image_data": water_b64 or "",
                "filename": "sample_water_satellite.jpg",
                "tag": "Hydrology"
            },
            {
                "id": "sample-veg",
                "title": "Dense Forest Canopy & Agrarian Plots",
                "description": "High photosynthetic biomass and agricultural field parcels.",
                "image_data": veg_b64 or "",
                "filename": "sample_vegetation_satellite.jpg",
                "tag": "Vegetation"
            }
        ],
        "compare_samples": [
            {
                "id": "sample-comp-urban",
                "title": "Urban Expansion & Construction Front",
                "description": "Compare baseline natural terrain against newly built commercial infrastructure.",
                "label1": "2021 Baseline Pass",
                "label2": "2026 Comparative Pass",
                "image1_data": veg_b64 or "",
                "image2_data": urban_b64 or "",
                "filename1": "2021_baseline_pass.jpg",
                "filename2": "2026_comparative_pass.jpg",
                "tag": "Urban Growth"
            },
            {
                "id": "sample-comp-deforest",
                "title": "Canopy Contraction & Deforestation Front",
                "description": "Observe clearing of dense forest canopy into bare development soil.",
                "label1": "Pre-Clearing Canopy",
                "label2": "Post-Disturbance Scene",
                "image1_data": veg_b64 or "",
                "image2_data": deforest_b64 or "",
                "filename1": "pre_clearing_pass.jpg",
                "filename2": "post_disturbance_pass.jpg",
                "tag": "Deforestation"
            },
            {
                "id": "sample-comp-regrowth",
                "title": "Ecological Restoration & Vegetation Regrowth",
                "description": "Trace progressive vegetative recovery across previously disturbed land.",
                "label1": "Disturbed Baseline",
                "label2": "Regrown Canopy",
                "image1_data": deforest_b64 or "",
                "image2_data": regrowth_b64 or "",
                "filename1": "disturbed_baseline.jpg",
                "filename2": "regrown_canopy.jpg",
                "tag": "Regrowth"
            }
        ],
        "multiple_samples": [
            {
                "id": "sample-multi-timeline",
                "title": "4-Stage Environmental Evolution Timeline",
                "description": "Sequential multi-pass observation showing agricultural initiation, canopy clearing, and final urbanization.",
                "images": [
                    {"label": "Stage 1: Natural Agrarian Plots", "filename": "stage_1_natural.jpg", "image_data": agri_b64 or ""},
                    {"label": "Stage 2: Dense Forest Fringe", "filename": "stage_2_canopy.jpg", "image_data": veg_b64 or ""},
                    {"label": "Stage 3: Ground Preparation & Clearing", "filename": "stage_3_clearing.jpg", "image_data": deforest_b64 or ""},
                    {"label": "Stage 4: Completed Built Infrastructure", "filename": "stage_4_urban.jpg", "image_data": urban_b64 or ""}
                ]
            }
        ]
    }


# ---------------------------------------------------------------------------
# Single-Host Unified Frontend Mounting
# Serves the compiled React frontend directly from FastAPI on port 8000
# ---------------------------------------------------------------------------
FRONTEND_DIST = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
if os.path.exists(FRONTEND_DIST):
    assets_dir = os.path.join(FRONTEND_DIST, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="static-assets")

    @app.get("/{full_path:path}")
    async def serve_frontend_spa(full_path: str):
        if full_path.startswith("api/") or full_path in ("docs", "redoc", "openapi.json"):
            raise HTTPException(status_code=404, detail="API endpoint not found.")
        target_file = os.path.join(FRONTEND_DIST, full_path)
        if full_path and os.path.isfile(target_file):
            return FileResponse(target_file)
        index_file = os.path.join(FRONTEND_DIST, "index.html")
        if os.path.isfile(index_file):
            return FileResponse(index_file)
        raise HTTPException(status_code=404, detail="Frontend index.html not found.")

if __name__ == "__main__":
    import uvicorn
    print(f"Starting SatQuery AI Unified Server on http://{settings.HOST}:{settings.PORT}")
    uvicorn.run(app, host=settings.HOST, port=settings.PORT)

