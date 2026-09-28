"""
Unit and Integration Tests for SatQueryAI Upload Analysis Engine
Tests Single Image Analysis, Two Image Comparison, Multiple Image Timeline, and Upload Chat
"""

import asyncio
import os
import sys
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services.upload_analysis_engine import (
    analyze_single_satellite_image,
    compare_two_satellite_images,
    analyze_multiple_satellite_images,
    chat_about_uploaded_analysis,
    _pil_to_base64
)

def create_synthetic_satellite_image(pattern: str = "vegetation") -> str:
    """Generates synthetic RGB satellite imagery array for testing."""
    arr = np.zeros((100, 100, 3), dtype=np.uint8)
    if pattern == "vegetation":
        # Green canopy (high green, lower red/blue)
        arr[:, :] = [30, 180, 50]
    elif pattern == "urban":
        # Neutral gray/bright (concrete/built)
        arr[:, :] = [170, 168, 165]
    elif pattern == "water":
        # Deep blue
        arr[:, :] = [10, 60, 190]
    elif pattern == "mixed":
        # Top half vegetation, bottom half urban
        arr[:50, :] = [30, 175, 45]
        arr[50:, :] = [180, 175, 170]
    img = Image.fromarray(arr, "RGB")
    return _pil_to_base64(img, "PNG")

async def test_all_upload_workflows():
    print("=== 1. Testing Single Image Analysis ===")
    veg_b64 = create_synthetic_satellite_image("vegetation")
    single_res = await analyze_single_satellite_image(
        image_data=veg_b64,
        filename="test_vegetation.png",
        custom_label="Test Forest Scene"
    )
    assert single_res["mode"] == "single"
    assert "vegetation_pct" in single_res["metrics"]
    assert single_res["metrics"]["vegetation_pct"] > 80.0
    assert "masks" in single_res
    assert "segmentation" in single_res["masks"]
    assert single_res["masks"]["segmentation"].startswith("data:image/png;base64,")
    assert "estimated_area" in single_res
    print(f"[OK] Single Image Analysis passed! Veg={single_res['metrics']['vegetation_pct']}%, Area='{single_res['estimated_area']['name']}'")

    print("\n=== 2. Testing Two Image Comparison ===")
    urban_b64 = create_synthetic_satellite_image("urban")
    comp_res = await compare_two_satellite_images(
        image1_data=veg_b64,
        image2_data=urban_b64,
        label1="2021 Forest",
        label2="2026 Urban Expansion"
    )
    assert comp_res["mode"] == "comparison"
    assert "delta_metrics" in comp_res
    # Vegetation converted to urban -> urban_delta should be positive, veg_delta negative
    assert comp_res["delta_metrics"]["urban_delta_pct"] > 50.0
    assert comp_res["delta_metrics"]["vegetation_delta_pct"] < -50.0
    assert comp_res["change_heatmap_url"].startswith("data:image/png;base64,")
    assert len(comp_res["hotspots"]) > 0
    print(f"[OK] Two Image Comparison passed! Urban Delta={comp_res['delta_metrics']['urban_delta_pct']}%, Hotspots={len(comp_res['hotspots'])}")

    print("\n=== 3. Testing Multiple Image Analysis (Timeline) ===")
    water_b64 = create_synthetic_satellite_image("water")
    images_list = [
        {"label": "Pass 1: Water", "image_data": water_b64},
        {"label": "Pass 2: Vegetation", "image_data": veg_b64},
        {"label": "Pass 3: Urban", "image_data": urban_b64},
    ]
    multi_res = await analyze_multiple_satellite_images(images_list)
    assert multi_res["mode"] == "multiple"
    assert multi_res["total_frames"] == 3
    assert len(multi_res["frames"]) == 3
    assert "trends" in multi_res
    assert len(multi_res["trends"]["urban_series"]) == 3
    print(f"[OK] Multiple Image Analysis passed! Frames={multi_res['total_frames']}, Urban Net={multi_res['trends']['urban_net']}%")

    print("\n=== 4. Testing Upload Chat Assistant ===")
    chat_reply_veg = await chat_about_uploaded_analysis(
        analysis_data=single_res,
        user_message="What is the vegetation percentage?",
        chat_history=[]
    )
    assert "Vegetation" in chat_reply_veg
    print(f"[OK] Upload Chat (Single): '{chat_reply_veg}'")

    chat_reply_comp = await chat_about_uploaded_analysis(
        analysis_data=comp_res,
        user_message="Where did the biggest change happen?",
        chat_history=[]
    )
    assert "Hotspot" in chat_reply_comp or "difference" in chat_reply_comp.lower()
    print(f"[OK] Upload Chat (Compare): '{chat_reply_comp}'")

    print("\nALL UPLOAD ENGINE TESTS PASSED PERFECTLY!")

if __name__ == "__main__":
    asyncio.run(test_all_upload_workflows())
