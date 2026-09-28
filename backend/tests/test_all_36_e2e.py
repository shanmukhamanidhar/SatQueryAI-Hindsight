"""
Comprehensive End-to-End Test for all 28 States and 8 Union Territories of India
Tests all 36 locations one by one against the SatQueryAI /api/analyze endpoint.
"""

import sys
import time
import requests

STATES = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
]

UNION_TERRITORIES = [
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi (NCT)",
    "Jammu and Kashmir",
    "Ladakh",
    "Lakshadweep",
    "Puducherry",
]

ALL_36_LOCATIONS = [(s, "State") for s in STATES] + [(ut, "Union Territory") for ut in UNION_TERRITORIES]

BASE_URL = "http://127.0.0.1:8000"

def test_single_location(index: int, total: int, name: str, loc_type: str):
    url = f"{BASE_URL}/api/analyze"
    payload = {
        "query": f"Analyze {name}, India between 2021 and 2026",
        "location": name,
        "start_date": "2021-01-01",
        "end_date": "2026-01-01"
    }

    t0 = time.time()
    try:
        resp = requests.post(url, json=payload, timeout=60.0)
    except Exception as exc:
        print(f"[{index:02d}/{total:02d}] FAIL: {name} ({loc_type}) - Connection error: {exc}", flush=True)
        return False, str(exc), 0.0, 0, 0

    elapsed = time.time() - t0

    if resp.status_code != 200:
        print(f"[{index:02d}/{total:02d}] FAIL: {name} ({loc_type}) - HTTP {resp.status_code}: {resp.text[:200]}", flush=True)
        return False, f"HTTP {resp.status_code}", elapsed, 0, 0

    data = resp.json()

    # Validations
    loc_obj = data.get("location", {})
    resolved_name = loc_obj.get("name", "")
    aoi_ha = data.get("total_aoi_hectares", 0)
    bbox = loc_obj.get("bounding_box", [])
    change_regions = data.get("change_regions", [])
    vlayers = data.get("visual_layers", {})
    before_img = vlayers.get("before_rgb", "")
    after_img = vlayers.get("after_rgb", "")
    headline = data.get("ai_summary", {}).get("headline", "")

    has_images = bool(before_img and after_img)
    has_bbox = len(bbox) == 4
    has_ha = aoi_ha > 0

    if not (has_images and has_bbox and has_ha):
        print(f"[{index:02d}/{total:02d}] FAIL: {name} ({loc_type}) - Incomplete payload (images={has_images}, bbox={has_bbox}, ha={aoi_ha})", flush=True)
        return False, "Incomplete payload", elapsed, aoi_ha, len(change_regions)

    print(
        f"[{index:02d}/{total:02d}] PASS: {name:<36} | Type: {loc_type:<15} | "
        f"AOI: {aoi_ha:>7,.0f} ha | Indicators: {len(change_regions):>2} | "
        f"Time: {elapsed:>5.1f}s | Headline: {headline[:35]}...",
        flush=True
    )
    return True, "OK", elapsed, aoi_ha, len(change_regions)

def main():
    print("=" * 110, flush=True)
    print("INDIA-WIDE SATELLITE SYSTEM VALIDATION: TESTING ALL 28 STATES & 8 UNION TERRITORIES (36 TOTAL)", flush=True)
    print("=" * 110, flush=True)

    # Health check
    try:
        h = requests.get(f"{BASE_URL}/api/health", timeout=5)
        print(f"Backend Server Health: HTTP {h.status_code} - {h.json()}", flush=True)
    except Exception as e:
        print(f"CRITICAL: Backend server at {BASE_URL} is not reachable: {e}", flush=True)
        sys.exit(1)

    print(f"Starting sequential validation of {len(ALL_36_LOCATIONS)} locations...\n", flush=True)

    results = []
    passed = 0
    failed = 0
    total_time = 0.0

    for idx, (name, loc_type) in enumerate(ALL_36_LOCATIONS, start=1):
        success, msg, elapsed, ha, num_changes = test_single_location(idx, len(ALL_36_LOCATIONS), name, loc_type)
        total_time += elapsed
        results.append({
            "name": name,
            "type": loc_type,
            "success": success,
            "message": msg,
            "elapsed": elapsed,
            "ha": ha,
            "indicators": num_changes
        })
        if success:
            passed += 1
        else:
            failed += 1

    print("\n" + "=" * 110, flush=True)
    print(f"VALIDATION SUMMARY: {passed}/{len(ALL_36_LOCATIONS)} PASSED, {failed} FAILED in {total_time:.1f}s", flush=True)
    print("=" * 110, flush=True)

    if failed > 0:
        print("\nFailed locations:", flush=True)
        for r in results:
            if not r["success"]:
                print(f"  - {r['name']} ({r['type']}): {r['message']}", flush=True)
        sys.exit(1)
    else:
        print("\nALL 28 STATES AND 8 UNION TERRITORIES VALIDATED SUCCESSFULLY END-TO-END!", flush=True)
        sys.exit(0)

if __name__ == "__main__":
    main()
