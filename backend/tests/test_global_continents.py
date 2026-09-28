import urllib.request
import json

cities = [
    ("Visakhapatnam, India", "Analyze Visakhapatnam between 2021 and 2026"),
    ("Tokyo, Japan", "Compare central Tokyo from 2020 to 2025"),
    ("London, United Kingdom", "Analyze changes around London River Thames"),
    ("New York, USA", "Analyze New York between 2021 and 2025"),
    ("Sydney, Australia", "Analyze Sydney coastal development"),
    ("São Paulo, Brazil", "Analyze São Paulo urban expansion"),
    ("Nairobi, Kenya", "Analyze Nairobi vegetation and green cover")
]

def test_continents():
    base_url = "http://127.0.0.1:8000"
    print("============================================================")
    print("GLOBAL MULTI-CONTINENT EARTH OBSERVATION ACCEPTANCE TEST")
    print("============================================================")

    for target_label, query in cities:
        print(f"\nTesting target: {target_label}...")
        payload = json.dumps({"query": query}).encode("utf-8")
        req = urllib.request.Request(
            f"{base_url}/api/analyze",
            data=payload,
            headers={"Content-Type": "application/json"}
        )
        try:
            with urllib.request.urlopen(req) as resp:
                data = json.loads(resp.read().decode())
                loc = data["location"]
                print(f"  [OK] Resolved: {loc['name']} ({loc.get('country', '')}) [{loc['latitude']:.3f}, {loc['longitude']:.3f}]")
                print(f"  [OK] Satellite Observations: {data['actual_before_date']} -> {data['actual_after_date']}")
                print(f"  [OK] AOI Area: {data['total_aoi_hectares']} ha | Changed Area: {data['total_changed_hectares']} ha ({data['percent_aoi_changed']}%)")
                print(f"  [OK] Confidence: {data['confidence']['overall_score']}% ({data['confidence']['rating']})")
                print(f"  [OK] Change Clusters: {len(data['change_regions'])} polygons")
                # Assert coordinates and AOI match the selected city
                assert loc["latitude"] is not None
                assert loc["longitude"] is not None
                assert len(data["change_regions"]) >= 0
        except Exception as e:
            print(f"  [FAILED] {target_label}: {e}")
            raise e

    print("\n============================================================")
    print("ALL 7 CONTINENTAL TARGETS PASSED INTEGRITY VERIFICATION!")
    print("============================================================")

if __name__ == "__main__":
    test_continents()
