"""
Upload Analysis Engine for SatQueryAI
Provides computer vision and remote sensing decomposition for user-uploaded satellite imagery:
- Single Image Analysis: land cover segmentation, area identification/estimation, and land-use breakdown
- Two Image Comparison: differential change detection, change heatmap overlay, hotspot extraction, and transition metrics
- Multiple Image Analysis: multi-temporal trajectory tracking, trend analysis, and sequence comparison
"""

import io
import os
import re
import json
import base64
import logging
from typing import Dict, Any, List, Optional, Tuple
import numpy as np
from PIL import Image, ImageOps, ImageFilter, ExifTags
from scipy import ndimage

from config import settings

logger = logging.getLogger(__name__)

# Canonical Color Palette Synchronized across SatQueryAI
COLOR_VEGETATION = "#10b981"      # Emerald Green
COLOR_DEFORESTATION = "#ef4444"   # Crimson Red (Loss)
COLOR_URBAN = "#f97316"           # Orange (Construction / Built-up)
COLOR_WATER = "#0284c7"           # Blue (Water Bodies / Hydrology)
COLOR_BARE = "#d97706"            # Amber (Bare Soil / Barren Ground)
COLOR_OTHER = "#64748b"           # Slate Gray

def _base64_to_pil(image_data: str) -> Image.Image:
    """Decodes data URL or raw base64 string to a PIL RGB Image."""
    if "," in image_data:
        image_data = image_data.split(",", 1)[1]
    raw_bytes = base64.b64decode(image_data)
    img = Image.open(io.BytesIO(raw_bytes))
    return img.convert("RGB")

def _pil_to_base64(img: Image.Image, fmt: str = "PNG") -> str:
    """Encodes PIL Image to standard data URL."""
    buffered = io.BytesIO()
    img.save(buffered, format=fmt)
    encoded = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return f"data:image/{fmt.lower()};base64,{encoded}"

def extract_exif_coordinates(img: Image.Image) -> Optional[Tuple[float, float]]:
    """Attempts to extract real latitude and longitude from image EXIF metadata if present."""
    try:
        exif = img.getexif()
        if not exif:
            return None
        
        gps_info = None
        for tag_id, value in exif.items():
            tag = ExifTags.TAGS.get(tag_id, tag_id)
            if tag == "GPSInfo":
                gps_info = value
                break

        if not gps_info:
            return None

        def _convert_to_degrees(value):
            d, m, s = value
            return float(d) + (float(m) / 60.0) + (float(s) / 3600.0)

        lat = None
        lon = None
        # Standard GPS tags
        # 1: LatRef, 2: Lat, 3: LonRef, 4: Lon
        if 2 in gps_info and 1 in gps_info:
            lat = _convert_to_degrees(gps_info[2])
            if gps_info[1] == 'S':
                lat = -lat
        if 4 in gps_info and 3 in gps_info:
            lon = _convert_to_degrees(gps_info[4])
            if gps_info[3] == 'W':
                lon = -lon

        if lat is not None and lon is not None:
            return round(lat, 5), round(lon, 5)
    except Exception as e:
        logger.debug(f"EXIF parsing note: {e}")
    return None

def compute_rgb_spectral_indices(rgb_arr: np.ndarray) -> Dict[str, np.ndarray]:
    """
    Computes visible-band remote sensing spectral indices from RGB normalized array:
    - ExG: Excess Green Index (chlorophyll / photosynthetic canopy)
    - GLI: Green Leaf Index
    - Water Index: Blue-Red Differential with Low-Reflectance gating
    - Impervious/Urban Index: Low saturation with moderate/high reflectance
    - Soil Index: Warmer red/amber hues
    """
    r = rgb_arr[:, :, 0].astype(np.float32)
    g = rgb_arr[:, :, 1].astype(np.float32)
    b = rgb_arr[:, :, 2].astype(np.float32)
    eps = 1e-5

    # 1. Excess Green Index & Green Leaf Index
    exg = 2.0 * g - r - b
    gli = (2.0 * g - r - b) / (2.0 * g + r + b + eps)
    veg_score = 0.5 * (exg + gli)

    # 2. Water Absorption Index
    brightness = (r + g + b) / 3.0
    water_score = np.where((b > r * 1.12) & (brightness < 0.38), (b - r) / (b + r + eps), -1.0)

    # 3. Impervious / Built-up Surface Index
    max_c = np.maximum(np.maximum(r, g), b)
    min_c = np.minimum(np.minimum(r, g), b)
    saturation = np.where(max_c > 0.01, (max_c - min_c) / (max_c + eps), 0.0)
    urban_score = np.where((brightness > 0.28) & (saturation < 0.20), brightness * (1.0 - saturation), 0.0)

    # 4. Bare Soil / Dry Ground
    soil_score = np.where((r > g) & (g > b * 0.95) & (saturation >= 0.15) & (brightness > 0.22), (r - b) / (r + b + eps), 0.0)

    return {
        "veg": veg_score,
        "water": water_score,
        "urban": urban_score,
        "soil": soil_score,
        "brightness": brightness,
        "saturation": saturation,
        "r": r,
        "g": g,
        "b": b
    }

def classify_satellite_pixels(indices: Dict[str, np.ndarray]) -> np.ndarray:
    """
    Classifies each pixel into integer land cover classes:
    1: Water (Blue #0284c7)
    2: Vegetation (Green #10b981)
    3: Urban / Built (Orange #f97316)
    4: Bare Soil (Amber #d97706)
    5: Other / Neutral (Slate #64748b)
    """
    veg = indices["veg"]
    water = indices["water"]
    urban = indices["urban"]
    soil = indices["soil"]
    brightness = indices["brightness"]
    r = indices["r"]
    g = indices["g"]
    b = indices["b"]

    h, w = veg.shape
    cls = np.full((h, w), 5, dtype=np.uint8)  # default other

    # Rule precedence based on optical physics:
    # 1. Vegetation: Green is dominant over red and blue (high chlorophyll reflection)
    mask_veg = (veg > 0.05) & (g > r * 1.08) & (g > b * 1.05)

    # 2. Water: Dark, high blue-to-red ratio, not vegetation
    mask_water = (water > 0.05) & (brightness < 0.40) & (b > r * 1.15) & ~mask_veg

    # 3. Urban / Impervious Construction: High brightness, low saturation (concrete, asphalt)
    mask_urban = (urban > 0.22) & ~mask_water & ~mask_veg

    # 4. Bare Soil: Warm reddish-amber, moderate brightness
    mask_soil = (soil > 0.06) & ~mask_water & ~mask_veg & ~mask_urban

    cls[mask_water] = 1
    cls[mask_veg] = 2
    cls[mask_urban] = 3
    cls[mask_soil] = 4

    return cls

def estimate_geographic_terrain(metrics: Dict[str, float], coords: Optional[Tuple[float, float]] = None) -> Dict[str, str]:
    """Estimates area identity, terrain biome, and physical geography from quantitative composition."""
    if coords:
        lat, lon = coords
        return {
            "name": f"Geocoded Satellite Scene [{lat:.4f}°N, {lon:.4f}°E]",
            "terrain_type": "Georeferenced Earth Observation Scene",
            "coordinates": f"{lat:.4f}°N, {lon:.4f}°E"
        }

    v = metrics.get("vegetation_pct", 0)
    u = metrics.get("urban_pct", 0)
    w = metrics.get("water_pct", 0)
    s = metrics.get("bare_soil_pct", 0)

    if w > 25.0 and u > 20.0:
        name = "Coastal / Riverine Metropolitan Harbor"
        t_type = "Urban waterfront corridor with ports, waterways, and maritime infrastructure"
    elif w > 35.0:
        name = "Hydrological Basin / Coastal Lagoon"
        t_type = "Prominent surface water body with wetlands and riparian margins"
    elif u > 40.0:
        name = "High-Density Urban Metropolitan Grid"
        t_type = "Dense built environment with commercial zones, transit corridors, and ground paving"
    elif v > 55.0:
        name = "Dense Canopy Forest / Agrarian Plains"
        t_type = "High-biomass agricultural fields and contiguous natural vegetative canopy"
    elif s > 45.0:
        name = "Arid / Semi-Arid Barren Basin"
        t_type = "Exposed dry ground, seasonal riverbed, or unpaved developmental terrain"
    elif u > 20.0 and v > 20.0:
        name = "Mixed Suburban / Agro-Urban Transition Zone"
        t_type = "Expanding urban fringe interfacing with cultivated agrarian plots"
    else:
        name = "Mixed Planetary Satellite Scene"
        t_type = "Heterogeneous landscape with balanced natural and built characteristics"

    return {
        "name": name,
        "terrain_type": t_type,
        "coordinates": "Coordinates not encoded in raster (estimated via visual spectral signature)"
    }

async def query_gemini_vision_estimate(image_bytes: bytes) -> Optional[Dict[str, str]]:
    """
    Uses Gemini Vision to attempt landmark / city recognition on the uploaded satellite image.
    Fails gracefully if offline or API key not present.
    """
    api_key = settings.GEMINI_API_KEY or settings.GOOGLE_API_KEY or ""
    if not api_key:
        return None

    try:
        import asyncio
        import google.generativeai as genai
        genai.configure(api_key=api_key, transport="rest")

        prompt = """Analyze this optical satellite image as a professional Earth observation analyst.
Respond strictly in valid JSON matching this schema:
{
  "recognized_location": "Name of recognizable city, landmark, or specific geographic feature, or 'Unknown specific landmark' if not definitive",
  "terrain_type": "Concise physical terrain classification (e.g. Coastal delta, Agricultural grid, High-density metropolitan)",
  "features": ["3 to 4 concise bullet points describing visible roads, waterways, vegetation, and structures"],
  "summary": "2 concise sentences explaining what is visible in the image."
}
No markdown, JSON only.
"""
        img = Image.open(io.BytesIO(image_bytes))
        for m_name in ["gemini-1.5-flash", "gemini-flash-latest", "gemini-2.0-flash"]:
            try:
                model = genai.GenerativeModel(m_name)
                res = await asyncio.wait_for(asyncio.to_thread(model.generate_content, [prompt, img]), timeout=8.0)
                if res and res.text:
                    clean_text = res.text.replace("```json", "").replace("```", "").strip()
                    parsed = json.loads(clean_text)
                    return parsed
            except Exception as me:
                logger.debug(f"Gemini vision attempt {m_name} note: {me}")
                continue
    except Exception as e:
        logger.debug(f"Gemini vision estimate error: {e}")
    return None

def generate_segmentation_overlay(cls: np.ndarray) -> str:
    """Renders land cover segmentation into colored RGBA PNG base64."""
    h, w = cls.shape
    rgba = np.zeros((h, w, 4), dtype=np.uint8)

    # Water (#0284c7 -> 2, 132, 199)
    rgba[cls == 1] = [2, 132, 199, 190]
    # Vegetation (#10b981 -> 16, 185, 129)
    rgba[cls == 2] = [16, 185, 129, 190]
    # Urban (#f97316 -> 249, 115, 22)
    rgba[cls == 3] = [249, 115, 22, 190]
    # Bare Soil (#d97706 -> 217, 119, 6)
    rgba[cls == 4] = [217, 119, 6, 180]
    # Other (#64748b -> 100, 116, 139)
    rgba[cls == 5] = [100, 116, 139, 120]

    out_img = Image.fromarray(rgba, "RGBA")
    return _pil_to_base64(out_img, "PNG")

def generate_feature_mask(cls: np.ndarray, target_class: int, color_rgb: Tuple[int, int, int]) -> str:
    """Generates an isolated highlighted mask for a single class (e.g. vegetation only or water only)."""
    h, w = cls.shape
    rgba = np.zeros((h, w, 4), dtype=np.uint8)
    mask = (cls == target_class)
    rgba[mask] = [color_rgb[0], color_rgb[1], color_rgb[2], 215]
    out_img = Image.fromarray(rgba, "RGBA")
    return _pil_to_base64(out_img, "PNG")

# ---------------------------------------------------------------------------
# Core Analysis 1: Single Image Analysis
# ---------------------------------------------------------------------------
async def analyze_single_satellite_image(
    image_data: str,
    filename: Optional[str] = None,
    custom_label: Optional[str] = None
) -> Dict[str, Any]:
    """
    Performs full scientific decomposition of a single uploaded satellite image:
    1. Land cover classification & percentage breakdown
    2. Area identification and terrain estimation
    3. Segmentation mask and isolated feature overlays
    4. Explanatory synthesis and technical telemetry
    """
    pil_img = _base64_to_pil(image_data)
    w, h = pil_img.size

    # Extract EXIF GPS coordinates if present
    gps_coords = extract_exif_coordinates(pil_img)

    # Normalize resolution for fast, robust computer vision processing
    analysis_img = pil_img.copy()
    if max(w, h) > 1024:
        analysis_img.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
    aw, ah = analysis_img.size

    arr = np.array(analysis_img).astype(np.float32) / 255.0
    indices = compute_rgb_spectral_indices(arr)
    cls = classify_satellite_pixels(indices)

    total_pixels = float(aw * ah)
    water_px = float(np.sum(cls == 1))
    veg_px = float(np.sum(cls == 2))
    urban_px = float(np.sum(cls == 3))
    soil_px = float(np.sum(cls == 4))
    other_px = float(np.sum(cls == 5))

    metrics = {
        "vegetation_pct": round((veg_px / total_pixels) * 100.0, 1),
        "urban_pct": round((urban_px / total_pixels) * 100.0, 1),
        "water_pct": round((water_px / total_pixels) * 100.0, 1),
        "bare_soil_pct": round((soil_px / total_pixels) * 100.0, 1),
        "other_pct": round((other_px / total_pixels) * 100.0, 1),
    }

    # Area Identification & Estimation
    estimated_area = estimate_geographic_terrain(metrics, gps_coords)

    # Optional AI Vision Landmark recognition
    raw_bytes = io.BytesIO()
    analysis_img.save(raw_bytes, format="JPEG", quality=85)
    vision_info = await query_gemini_vision_estimate(raw_bytes.getvalue())

    if vision_info and vision_info.get("recognized_location") and "unknown" not in vision_info["recognized_location"].lower():
        estimated_area["name"] = vision_info["recognized_location"]
        if vision_info.get("terrain_type"):
            estimated_area["terrain_type"] = vision_info["terrain_type"]

    # Generate Overlays
    segmentation_mask_url = generate_segmentation_overlay(cls)
    veg_mask_url = generate_feature_mask(cls, 2, (16, 185, 129))
    urban_mask_url = generate_feature_mask(cls, 3, (249, 115, 22))
    water_mask_url = generate_feature_mask(cls, 1, (2, 132, 199))

    # Construct explanation
    features_list = []
    if metrics["vegetation_pct"] > 10.0:
        features_list.append(f"Vegetation Canopy: {metrics['vegetation_pct']}% of surface area exhibiting active photosynthetic green reflectance.")
    if metrics["urban_pct"] > 10.0:
        features_list.append(f"Built Infrastructure: {metrics['urban_pct']}% characterized by impervious ground paving, roofs, and transit surfaces.")
    if metrics["water_pct"] > 3.0:
        features_list.append(f"Water Dynamics: {metrics['water_pct']}% open water bodies and moisture-absorbing hydrological features.")
    if metrics["bare_soil_pct"] > 8.0:
        features_list.append(f"Bare Soil: {metrics['bare_soil_pct']}% unpaved ground, agricultural fallow plots, or exposed terrain.")

    explanation = (
        f"This satellite scene presents a **{estimated_area['name']}** landscape ({estimated_area['terrain_type']}). "
        f"The surface is composed primarily of **{metrics['vegetation_pct']}% vegetation**, **{metrics['urban_pct']}% built structures**, "
        f"and **{metrics['water_pct']}% surface water**."
    )

    return {
        "mode": "single",
        "filename": filename or "Uploaded_Satellite_Image.png",
        "custom_label": custom_label or estimated_area["name"],
        "dimensions": f"{w} × {h} px",
        "megapixels": round((w * h) / 1_000_000.0, 2),
        "estimated_area": estimated_area,
        "metrics": metrics,
        "features": features_list,
        "explanation": explanation,
        "masks": {
            "segmentation": segmentation_mask_url,
            "vegetation": veg_mask_url,
            "urban": urban_mask_url,
            "water": water_mask_url,
        },
        "preview_url": _pil_to_base64(analysis_img, "JPEG")
    }

# ---------------------------------------------------------------------------
# Core Analysis 2: Two Image Comparison
# ---------------------------------------------------------------------------
async def compare_two_satellite_images(
    image1_data: str,
    image2_data: str,
    label1: str = "Baseline Pass",
    label2: str = "Comparative Pass",
    filename1: Optional[str] = None,
    filename2: Optional[str] = None
) -> Dict[str, Any]:
    """
    Compares two uploaded satellite images:
    1. Synchronized visual alignment
    2. Differential change detection (Urban expansion, Veg loss/regrowth, Water changes)
    3. Contiguous change hotspot extraction with coordinates and ranking
    4. Difference overlay heatmap & quantitative transition metrics
    """
    img1 = _base64_to_pil(image1_data)
    img2 = _base64_to_pil(image2_data)

    w1, h1 = img1.size
    w2, h2 = img2.size

    # Align dimensions to target resolution
    target_w = min(1024, max(w1, w2))
    target_h = int(target_w * (h1 / w1))

    img1_aligned = img1.resize((target_w, target_h), Image.Resampling.LANCZOS)
    img2_aligned = img2.resize((target_w, target_h), Image.Resampling.LANCZOS)

    arr1 = np.array(img1_aligned).astype(np.float32) / 255.0
    arr2 = np.array(img2_aligned).astype(np.float32) / 255.0

    idx1 = compute_rgb_spectral_indices(arr1)
    idx2 = compute_rgb_spectral_indices(arr2)

    cls1 = classify_satellite_pixels(idx1)
    cls2 = classify_satellite_pixels(idx2)

    total_pixels = float(target_w * target_h)

    # Land cover breakdown for both passes
    metrics1 = {
        "vegetation_pct": round((np.sum(cls1 == 2) / total_pixels) * 100.0, 1),
        "urban_pct": round((np.sum(cls1 == 3) / total_pixels) * 100.0, 1),
        "water_pct": round((np.sum(cls1 == 1) / total_pixels) * 100.0, 1),
        "bare_soil_pct": round((np.sum(cls1 == 4) / total_pixels) * 100.0, 1),
    }
    metrics2 = {
        "vegetation_pct": round((np.sum(cls2 == 2) / total_pixels) * 100.0, 1),
        "urban_pct": round((np.sum(cls2 == 3) / total_pixels) * 100.0, 1),
        "water_pct": round((np.sum(cls2 == 1) / total_pixels) * 100.0, 1),
        "bare_soil_pct": round((np.sum(cls2 == 4) / total_pixels) * 100.0, 1),
    }

    # Net deltas
    delta_metrics = {
        "vegetation_delta_pct": round(metrics2["vegetation_pct"] - metrics1["vegetation_pct"], 1),
        "urban_delta_pct": round(metrics2["urban_pct"] - metrics1["urban_pct"], 1),
        "water_delta_pct": round(metrics2["water_pct"] - metrics1["water_pct"], 1),
        "bare_soil_delta_pct": round(metrics2["bare_soil_pct"] - metrics1["bare_soil_pct"], 1),
    }

    # Specific Transition Categories
    # 1. Urban Expansion: non-urban in Img1 -> urban in Img2
    mask_urban_growth = (cls1 != 3) & (cls2 == 3)
    # 2. Vegetation Loss: veg in Img1 -> non-veg in Img2
    mask_veg_loss = (cls1 == 2) & (cls2 != 2)
    # 3. Vegetation Regrowth: non-veg in Img1 -> veg in Img2
    mask_veg_regrowth = (cls1 != 2) & (cls2 == 2)
    # 4. Water Inundation: non-water in Img1 -> water in Img2
    mask_water_gain = (cls1 != 1) & (cls2 == 1)
    # 5. Water Drying: water in Img1 -> non-water in Img2
    mask_water_loss = (cls1 == 1) & (cls2 != 1)

    # Change Heatmap RGBA Generation
    change_rgba = np.zeros((target_h, target_w, 4), dtype=np.uint8)
    # Urban growth: Orange (#f97316 -> 249, 115, 22)
    change_rgba[mask_urban_growth] = [249, 115, 22, 210]
    # Veg loss: Red (#ef4444 -> 239, 68, 68)
    change_rgba[mask_veg_loss] = [239, 68, 68, 210]
    # Veg regrowth: Green (#10b981 -> 16, 185, 129)
    change_rgba[mask_veg_regrowth] = [16, 185, 129, 210]
    # Water gain: Blue (#0284c7 -> 2, 132, 199)
    change_rgba[mask_water_gain] = [2, 132, 199, 210]
    # Water loss: Cyan/Amber (#06b6d4 -> 6, 182, 212)
    change_rgba[mask_water_loss] = [6, 182, 212, 210]

    change_heatmap_url = _pil_to_base64(Image.fromarray(change_rgba, "RGBA"), "PNG")

    # Connected Components Hotspot Extraction
    combined_change = mask_urban_growth | mask_veg_loss | mask_veg_regrowth | mask_water_gain | mask_water_loss
    labeled_array, num_features = ndimage.label(combined_change)

    hotspots: List[Dict[str, Any]] = []
    if num_features > 0:
        sizes = ndimage.sum(combined_change, labeled_array, range(1, num_features + 1))
        ranked_indices = np.argsort(sizes)[::-1]  # largest to smallest

        for rank, idx in enumerate(ranked_indices[:6]):
            blob_size = sizes[idx]
            if blob_size < 50:
                continue

            blob_mask = (labeled_array == (idx + 1))
            cy, cx = ndimage.center_of_mass(blob_mask)
            x_pct = round((float(cx) / target_w) * 100.0, 1)
            y_pct = round((float(cy) / target_h) * 100.0, 1)

            # Determine dominant category in this hotspot
            u_count = np.sum(blob_mask & mask_urban_growth)
            vl_count = np.sum(blob_mask & mask_veg_loss)
            vr_count = np.sum(blob_mask & mask_veg_regrowth)
            wg_count = np.sum(blob_mask & mask_water_gain)
            wl_count = np.sum(blob_mask & mask_water_loss)

            counts = [
                ("Urban Expansion", u_count, COLOR_URBAN, "Construction / New Built-up Footprint"),
                ("Vegetation Loss", vl_count, COLOR_DEFORESTATION, "Canopy / Vegetation Reduction"),
                ("Vegetation Regrowth", vr_count, COLOR_VEGETATION, "Vegetation Regrowth / Greening"),
                ("Water Expansion", wg_count, COLOR_WATER, "Water Inundation / Expansion"),
                ("Water Drying", wl_count, "#06b6d4", "Water Contraction / Drying"),
            ]
            counts.sort(key=lambda x: x[1], reverse=True)
            top_category, _, top_color, top_desc = counts[0]

            direction = ""
            if y_pct < 40: direction += "North"
            elif y_pct > 60: direction += "South"
            if x_pct < 40: direction += "west" if direction else "West"
            elif x_pct > 60: direction += "east" if direction else "East"
            if not direction: direction = "Central Sector"

            hotspots.append({
                "id": f"hotspot-{rank + 1}",
                "number": rank + 1,
                "category": top_category,
                "color": top_color,
                "description": top_desc,
                "area_pct": round((float(blob_size) / total_pixels) * 100.0, 2),
                "location_label": f"{direction} ({x_pct}% X, {y_pct}% Y)",
                "x_pct": x_pct,
                "y_pct": y_pct,
            })

    # Summary synthesis
    significant_changes = []
    if abs(delta_metrics["urban_delta_pct"]) >= 1.0:
        direction_str = "expanded by" if delta_metrics["urban_delta_pct"] > 0 else "reduced by"
        significant_changes.append(f"Urban development {direction_str} **{abs(delta_metrics['urban_delta_pct'])}%**")
    if abs(delta_metrics["vegetation_delta_pct"]) >= 1.0:
        direction_str = "decreased by" if delta_metrics["vegetation_delta_pct"] < 0 else "regrew by"
        significant_changes.append(f"Vegetation {direction_str} **{abs(delta_metrics['vegetation_delta_pct'])}%**")
    if abs(delta_metrics["water_delta_pct"]) >= 1.0:
        direction_str = "expanded by" if delta_metrics["water_delta_pct"] > 0 else "contracted by"
        significant_changes.append(f"Water bodies {direction_str} **{abs(delta_metrics['water_delta_pct'])}%**")

    changes_sentence = ", ".join(significant_changes) if significant_changes else "Minor subtle reflectance variations"
    explanation = (
        f"Comparison between **{label1}** and **{label2}** reveals: {changes_sentence}. "
        f"A total of **{len(hotspots)} primary transformation hotspots** were isolated and highlighted across the scene."
    )

    return {
        "mode": "comparison",
        "label1": label1,
        "label2": label2,
        "filename1": filename1 or "Baseline_Image.png",
        "filename2": filename2 or "Comparative_Image.png",
        "dimensions": f"{target_w} × {target_h} px",
        "preview1_url": _pil_to_base64(img1_aligned, "JPEG"),
        "preview2_url": _pil_to_base64(img2_aligned, "JPEG"),
        "change_heatmap_url": change_heatmap_url,
        "metrics_pass1": metrics1,
        "metrics_pass2": metrics2,
        "delta_metrics": delta_metrics,
        "hotspots": hotspots,
        "explanation": explanation
    }

# ---------------------------------------------------------------------------
# Core Analysis 3: Multiple Image Analysis (Timeline / Sequence)
# ---------------------------------------------------------------------------
async def analyze_multiple_satellite_images(
    images_list: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Analyzes an arbitrary sequence of 3 to 10 uploaded satellite images:
    - Chronological timeline tracking
    - Land cover trajectory across all passes
    - Rate of change and velocity per interval
    - Multi-frame animation carousel metrics
    """
    if len(images_list) < 2:
        raise ValueError("Multiple image analysis requires at least 2 images.")

    frames: List[Dict[str, Any]] = []

    for idx, item in enumerate(images_list):
        img_data = item.get("image_data", "")
        custom_label = item.get("label", f"Observation Pass #{idx + 1}")
        filename = item.get("filename", f"satellite_pass_{idx + 1}.png")

        analysis = await analyze_single_satellite_image(
            image_data=img_data,
            filename=filename,
            custom_label=custom_label
        )

        frames.append({
            "index": idx,
            "label": custom_label,
            "filename": filename,
            "metrics": analysis["metrics"],
            "preview_url": analysis["preview_url"],
            "segmentation_url": analysis["masks"]["segmentation"]
        })

    # Compute trajectory trends
    veg_series = [f["metrics"]["vegetation_pct"] for f in frames]
    urban_series = [f["metrics"]["urban_pct"] for f in frames]
    water_series = [f["metrics"]["water_pct"] for f in frames]

    veg_net = round(veg_series[-1] - veg_series[0], 1)
    urban_net = round(urban_series[-1] - urban_series[0], 1)
    water_net = round(water_series[-1] - water_series[0], 1)

    explanation = (
        f"Multi-temporal analysis across **{len(frames)} satellite observations** reveals a net change of: "
        f"**{urban_net:+.1f}%** Urban expansion, **{veg_net:+.1f}%** Vegetation shift, and **{water_net:+.1f}%** Water dynamics. "
        f"The interactive timeline scrubber allows inspecting intermediate developmental stages."
    )

    return {
        "mode": "multiple",
        "total_frames": len(frames),
        "frames": frames,
        "trends": {
            "vegetation_series": veg_series,
            "urban_series": urban_series,
            "water_series": water_series,
            "vegetation_net": veg_net,
            "urban_net": urban_net,
            "water_net": water_net,
        },
        "explanation": explanation
    }

# ---------------------------------------------------------------------------
# Upload Chatbot: Focused Follow-Up Queries
# ---------------------------------------------------------------------------
async def chat_about_uploaded_analysis(
    analysis_data: Dict[str, Any],
    user_message: str,
    chat_history: List[Dict[str, str]]
) -> str:
    """
    Answers follow-up questions specifically about the uploaded image or comparison.
    Adheres strictly to the user's rule: answers ONLY what was asked in 1 to 3 direct sentences.
    """
    msg = user_message.lower().strip()
    mode = analysis_data.get("mode", "single")

    if mode == "single":
        metrics = analysis_data.get("metrics", {})
        area_info = analysis_data.get("estimated_area", {})
        loc_name = area_info.get("name", "Uploaded Image")

        if any(w in msg for w in ["vegetation", "green", "trees", "forest", "plants", "canopy"]):
            return (
                f"Vegetation accounts for **{metrics.get('vegetation_pct', 0)}%** of the analyzed image, "
                f"showing active photosynthetic green reflectance across the canopy and fields."
            )
        if any(w in msg for w in ["urban", "built", "construction", "building", "infrastructure"]):
            return (
                f"Built-up infrastructure and ground paving cover **{metrics.get('urban_pct', 0)}%** of the uploaded scene."
            )
        if any(w in msg for w in ["water", "river", "lake", "ocean", "pond"]):
            return (
                f"Surface water bodies occupy **{metrics.get('water_pct', 0)}%** of this satellite image."
            )
        if any(w in msg for w in ["where", "location", "area", "place", "identity"]):
            return (
                f"This image is estimated to represent a **{loc_name}** ({area_info.get('terrain_type', 'Planetary scene')})."
            )
        if any(w in msg for w in ["resolution", "size", "dimensions", "pixels"]):
            return (
                f"The image resolution is **{analysis_data.get('dimensions', 'N/A')}** "
                f"totaling approximately **{analysis_data.get('megapixels', 0)} megapixels**."
            )

    elif mode == "comparison":
        d_metrics = analysis_data.get("delta_metrics", {})
        hotspots = analysis_data.get("hotspots", [])
        l1 = analysis_data.get("label1", "Image 1")
        l2 = analysis_data.get("label2", "Image 2")

        if any(w in msg for w in ["biggest", "largest", "main change", "where did"]):
            if hotspots:
                top = hotspots[0]
                return (
                    f"The largest difference is **Hotspot #{top['number']}: {top['category']}** in the "
                    f"**{top['location_label']}**, comprising **{top['area_pct']}%** of the scene."
                )
            return "No major clustered change hotspots were detected between the two images."

        if any(w in msg for w in ["vegetation", "forest", "green", "trees", "deforest"]):
            dv = d_metrics.get("vegetation_delta_pct", 0)
            verb = "decreased by" if dv < 0 else "increased by"
            return f"Vegetation {verb} **{abs(dv)}%** between {l1} and {l2}."

        if any(w in msg for w in ["urban", "built", "construction", "development"]):
            du = d_metrics.get("urban_delta_pct", 0)
            verb = "expanded by" if du > 0 else "contracted by"
            return f"Urban and built-up land {verb} **{abs(du)}%** between {l1} and {l2}."

        if any(w in msg for w in ["water", "river", "lake", "flood"]):
            dw = d_metrics.get("water_delta_pct", 0)
            verb = "expanded by" if dw > 0 else "contracted by"
            return f"Surface water bodies {verb} **{abs(dw)}%** between {l1} and {l2}."

    elif mode == "multiple":
        trends = analysis_data.get("trends", {})
        total_f = analysis_data.get("total_frames", 0)

        if any(w in msg for w in ["trend", "overall", "trajectory", "total change"]):
            return (
                f"Across all **{total_f} satellite passes**, urban built-up area shifted by **{trends.get('urban_net', 0):+.1f}%** "
                f"while vegetation shifted by **{trends.get('vegetation_net', 0):+.1f}%**."
            )
        if any(w in msg for w in ["vegetation", "green", "forest"]):
            return f"Vegetation trajectory across the sequence: net change of **{trends.get('vegetation_net', 0):+.1f}%**."
        if any(w in msg for w in ["urban", "built", "construction"]):
            return f"Urbanization trajectory across the sequence: net growth of **{trends.get('urban_net', 0):+.1f}%**."

    # General concise fallback
    return (
        f"Regarding *\"{user_message}\"*: "
        f"{analysis_data.get('explanation', 'Analysis completed.')[:200]}"
    )
