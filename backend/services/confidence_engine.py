import logging
from typing import Dict, Any, List
from models.schemas import ConfidenceBreakdown

logger = logging.getLogger(__name__)

def evaluate_analysis_confidence(
    cloud_pct_before: float,
    cloud_pct_after: float,
    temporal_match_note: str,
    delta_magnitude_mean: float,
    num_change_regions: int,
    aoi_ha: float
) -> ConfidenceBreakdown:
    """
    Computes explainable, transparent multi-factor confidence rating
    based on actual remote sensing parameters.
    """
    score = 100
    factors: List[Dict[str, Any]] = []
    limitations: List[str] = []

    # 1. Cloud Coverage Evaluation
    max_cloud = max(cloud_pct_before, cloud_pct_after)
    if max_cloud < 10.0:
        factors.append({
            "name": "Cloud Clarity",
            "status": "positive",
            "text": f"Sub-10% cloud coverage across both passes (Before: {cloud_pct_before}%, After: {cloud_pct_after}%)."
        })
    elif max_cloud < 25.0:
        score -= 8
        factors.append({
            "name": "Moderate Clouds",
            "status": "neutral",
            "text": f"Acceptable cloud clearance (Before: {cloud_pct_before}%, After: {cloud_pct_after}%)."
        })
    else:
        score -= 22
        factors.append({
            "name": "Elevated Cloud Presence",
            "status": "warning",
            "text": f"Higher cloud volume observed ({max_cloud}%). Some ground pixels may have diffuse cloud shadow interference."
        })
        limitations.append("Cloud shadows or thin cirrus haze may reduce classification accuracy in localized patches.")

    # 2. Spectral Signal Strength
    if delta_magnitude_mean >= 0.20:
        factors.append({
            "name": "Spectral Difference Strength",
            "status": "positive",
            "text": "Pronounced multi-spectral divergence observed across Red, NIR, and SWIR bands."
        })
    elif delta_magnitude_mean >= 0.10:
        score -= 5
        factors.append({
            "name": "Spectral Contrast",
            "status": "neutral",
            "text": "Moderate spectral signal shifts identified across land-use boundary clusters."
        })
    else:
        score -= 15
        factors.append({
            "name": "Subtle Spectral Shift",
            "status": "warning",
            "text": "Subtle index gradients detected; change signals are closer to baseline sensor noise floor."
        })
        limitations.append("Subtle spectral changes can be influenced by slight seasonal moisture variations rather than structural land-cover transitions.")

    # 3. Seasonal & Temporal Comparability
    if not temporal_match_note:
        factors.append({
            "name": "Seasonal Alignment",
            "status": "positive",
            "text": "Observations matched within identical annual seasonal windows, minimizing phenological vegetation bias."
        })
    else:
        score -= 7
        factors.append({
            "name": "Temporal Shift",
            "status": "neutral",
            "text": f"Off-season observation required for cloud-free coverage: {temporal_match_note}"
        })
        limitations.append("Phenological agricultural cycles or natural seasonal drying may account for part of the observed vegetation delta.")

    # 4. Spatial Geometry & Resolution
    if aoi_ha <= 25000:
        factors.append({
            "name": "Spatial Fidelity",
            "status": "positive",
            "text": "Copernicus Sentinel-2 10-meter Ground Sample Distance (GSD) provides high geometric precision for this AOI."
        })
    else:
        score -= 5
        factors.append({
            "name": "Regional Scale",
            "status": "neutral",
            "text": "Large geographic AOI; localized micro-structures (<10m) aggregated."
        })

    # Ensure rating bounds
    score = max(50, min(97, score))
    
    if score >= 82:
        rating = "High Confidence"
    elif score >= 68:
        rating = "Moderate Confidence"
    else:
        rating = "Preliminary Screening"

    # Always include fundamental scientific limitation
    limitations.append("Satellite reflectance identifies physical surface alterations, but cannot definitively prove intent, zoning, or specific building usage without ground truth.")

    return ConfidenceBreakdown(
        overall_score=score,
        rating=rating,
        factors=factors,
        limitations=limitations
    )
