import httpx
import json

targets = [
    'Andhra Pradesh',
    'Dubai',
    'Amazon Basin',
    'Tokyo',
    'Greenland',
    'Aral Sea',
    'Maldives',
    'Visakhapatnam',
    'Krishna River in Vijayawada',
    'Sahara Desert',
    'Swiss Alps'
]

print("=" * 80)
print("VERIFYING STATE-LEVEL & GLOBAL TARGET ANALYSIS ON LIVE BACKEND")
print("=" * 80)

with httpx.Client(base_url='http://127.0.0.1:8000', timeout=40.0) as client:
    for t in targets:
        resp = client.post('/api/analyze', json={'query': f'Analyze {t} between 2021 and 2026', 'start_year': 2021, 'end_year': 2026})
        if resp.status_code == 200:
            data = resp.json()
            loc = data['location']
            loc_type = loc.get('location_type')
            bbox = loc.get('bounding_box')
            area = data.get('total_aoi_hectares', 0)
            geom_type = loc.get('geometry', {}).get('type', 'N/A')
            print(f"[PASS] {t:28} | Type: {loc_type:10} | Area: {area:12,.0f} ha | Geom: {geom_type}")
        else:
            print(f"[FAIL] {t:28} | HTTP {resp.status_code}: {resp.text[:100]}")

print("=" * 80)
