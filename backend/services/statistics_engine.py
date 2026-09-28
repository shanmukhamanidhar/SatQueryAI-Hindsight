import logging
from typing import Dict, Any, List, Tuple
import numpy as np

from models.schemas import LandCoverStats, TransitionRecord
from services.raster_engine import (
    CLASS_WATER,
    CLASS_TREES,
    CLASS_CROPS,
    CLASS_BUILT,
    CLASS_BARE,
    CLASS_NAMES,
    CLASS_COLORS
)

logger = logging.getLogger(__name__)

def compute_land_cover_statistics(
    cls_before: np.ndarray,
    cls_after: np.ndarray,
    total_aoi_ha: float
) -> Tuple[List[LandCoverStats], List[TransitionRecord], float, float]:
    """
    Calculates exact land-cover hectares, change percentages,
    and the full pixel transition matrix between before and after observations.
    """
    total_pixels = float(cls_before.size)
    pixel_ha = total_aoi_ha / max(1.0, total_pixels)

    stats: List[LandCoverStats] = []
    classes = [CLASS_BUILT, CLASS_TREES, CLASS_CROPS, CLASS_WATER, CLASS_BARE]

    for c in classes:
        c_name = CLASS_NAMES[c]
        c_color = CLASS_COLORS[c]

        cnt_before = int(np.count_nonzero(cls_before == c))
        cnt_after = int(np.count_nonzero(cls_after == c))

        ha_before = round(cnt_before * pixel_ha, 2)
        ha_after = round(cnt_after * pixel_ha, 2)
        delta_ha = round(ha_after - ha_before, 2)

        pct_change = round((delta_ha / max(0.1, ha_before)) * 100.0, 1) if ha_before > 0 else 0.0

        stats.append(LandCoverStats(
            category=c_name,
            before_ha=ha_before,
            after_ha=ha_after,
            change_ha=delta_ha,
            change_pct=pct_change,
            color=c_color
        ))

    # Calculate Transition Matrix
    transitions: List[TransitionRecord] = []
    
    # Significant transition pairs to highlight
    notable_transitions = [
        (CLASS_TREES, CLASS_BUILT, "Deforestation / Urban Expansion"),
        (CLASS_CROPS, CLASS_BUILT, "Farmland conversion to Built-up"),
        (CLASS_BARE, CLASS_BUILT, "Vacant land development"),
        (CLASS_WATER, CLASS_BARE, "Water body recession / drying"),
        (CLASS_BARE, CLASS_WATER, "Water body expansion / flooding"),
        (CLASS_BARE, CLASS_TREES, "Vegetation greening / afforestation"),
        (CLASS_BARE, CLASS_CROPS, "Agricultural expansion"),
        (CLASS_TREES, CLASS_BARE, "Tree cover clearing / disturbance")
    ]

    for from_c, to_c, desc in notable_transitions:
        mask = (cls_before == from_c) & (cls_after == to_c)
        count = int(np.count_nonzero(mask))
        ha = round(count * pixel_ha, 2)
        if ha >= 0.5:  # Only report transitions supported by significant area
            transitions.append(TransitionRecord(
                from_class=CLASS_NAMES[from_c],
                to_class=CLASS_NAMES[to_c],
                area_ha=ha,
                description=desc
            ))

    # Overall Changed Area
    changed_mask = cls_before != cls_after
    total_changed_ha = round(int(np.count_nonzero(changed_mask)) * pixel_ha, 2)
    percent_changed = round((total_changed_ha / max(1.0, total_aoi_ha)) * 100.0, 1)

    return stats, transitions, total_changed_ha, percent_changed
