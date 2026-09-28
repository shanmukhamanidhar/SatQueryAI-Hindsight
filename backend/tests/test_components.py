import asyncio
import numpy as np
from backend.services.nlp_parser import heuristic_parse_intent
from backend.services.geocoding import resolve_location, parse_lat_lon_query
from backend.services.raster_engine import compute_spectral_indices, classify_land_cover, calculate_aoi_hectares
from backend.services.statistics_engine import compute_land_cover_statistics
from backend.services.confidence_engine import evaluate_analysis_confidence

async def test_all():
    print("=== 1. Testing NLP Intent Parser ===")
    q1 = "Analyze Visakhapatnam between 2021 and 2026"
    res1 = heuristic_parse_intent(q1)
    assert res1["location"] == "Visakhapatnam", f"Failed location: {res1}"
    assert res1["start_year"] == 2021, f"Failed start_year: {res1}"
    assert res1["end_year"] == 2026, f"Failed end_year: {res1}"
    print(f"[OK] Parsed query: '{q1}' -> Location='{res1['location']}', Years={res1['start_year']}-{res1['end_year']}")

    q2 = "Has urbanization increased near Hyderabad?"
    res2 = heuristic_parse_intent(q2)
    assert res2["focus_indicator"] == "urbanization"
    print(f"[OK] Parsed focus query: '{q2}' -> Focus='{res2['focus_indicator']}', Location='{res2['location']}'")

    print("\n=== 2. Testing Global Geocoding across Continents ===")
    test_locations = ["Visakhapatnam", "Tokyo", "London", "New York", "Sydney", "São Paulo", "Nairobi"]
    for loc in test_locations:
        loc_info = await resolve_location(loc)
        assert loc_info.latitude is not None and loc_info.longitude is not None
        assert len(loc_info.bounding_box) == 4
        print(f"[OK] Geocoded '{loc}' -> [{loc_info.latitude:.4f}, {loc_info.longitude:.4f}], Country={loc_info.country}")

    print("\n=== 3. Testing Coordinate Input Parsing ===")
    c_res = parse_lat_lon_query("17.6868, 83.2185")
    assert c_res == [83.2185, 17.6868]
    print(f"[OK] Coordinate parser verified for 17.6868, 83.2185")

    print("\n=== 4. Testing Raster Calculations & Scientific Indices ===")
    # Create synthetic calibrated multispectral bands (10x10)
    # NIR high, Red low -> High NDVI (Vegetation)
    bands = {
        "red": np.full((10, 10), 0.1, dtype=np.float32),
        "green": np.full((10, 10), 0.3, dtype=np.float32),
        "blue": np.full((10, 10), 0.1, dtype=np.float32),
        "nir": np.full((10, 10), 0.7, dtype=np.float32),
        "swir": np.full((10, 10), 0.2, dtype=np.float32)
    }
    indices = compute_spectral_indices(bands)
    expected_ndvi = (0.7 - 0.1) / (0.7 + 0.1)
    np.testing.assert_almost_equal(indices["ndvi"][0, 0], expected_ndvi, decimal=3)
    print(f"[OK] NDVI calculation verified: {indices['ndvi'][0, 0]:.3f} (expected {expected_ndvi:.3f})")

    cls = classify_land_cover(indices)
    assert cls[0, 0] == 2  # Dense vegetation (Trees)
    print(f"[OK] Land cover classification verified: class={cls[0, 0]} (Trees)")

    print("\n=== 5. Testing Statistics & Transition Matrix ===")
    cls_after = cls.copy()
    # Convert half to built-up
    cls_after[:5, :] = 4
    stats, transitions, ch_ha, pct_ch = compute_land_cover_statistics(cls, cls_after, total_aoi_ha=100.0)
    assert pct_ch > 0
    assert len(transitions) > 0
    print(f"[OK] Computed transition: {transitions[0].description} ({transitions[0].area_ha} ha)")

    print("\n=== 6. Testing Explainable Confidence Rating ===")
    conf = evaluate_analysis_confidence(
        cloud_pct_before=5.0,
        cloud_pct_after=8.0,
        temporal_match_note="",
        delta_magnitude_mean=0.25,
        num_change_regions=8,
        aoi_ha=5000.0
    )
    assert conf.overall_score >= 80
    assert len(conf.factors) >= 3
    print(f"[OK] Confidence score: {conf.overall_score}% ({conf.rating}) with {len(conf.factors)} factors and {len(conf.limitations)} limitations")

    print("\nALL TEST SUITES PASSED PERFECTLY!")

if __name__ == "__main__":
    asyncio.run(test_all())
