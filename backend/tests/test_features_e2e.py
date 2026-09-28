import urllib.request
import json
import base64
import sys
import io

def run_tests():
    print("==================================================")
    print("SATQUERYAI COMPREHENSIVE FEATURE VERIFICATION TEST")
    print("==================================================")
    
    # 1. Health check
    print("\n1. Testing Backend Health...")
    req = urllib.request.Request("http://127.0.0.1:8000/api/health")
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        data = json.loads(resp.read().decode())
        print(f"   [PASS] Health online: {data}")

    # 2. Custom AOI Polygon Analysis
    print("\n2. Testing Custom User-Drawn AOI Analysis with aoi_geojson...")
    # A 5km x 5km box near Visakhapatnam
    test_polygon = {
        "type": "Polygon",
        "coordinates": [
            [
                [83.2100, 17.7100],
                [83.2500, 17.7100],
                [83.2500, 17.7500],
                [83.2100, 17.7500],
                [83.2100, 17.7100]
            ]
        ]
    }
    payload = json.dumps({
        "query": "Analyze custom drawn area of interest (~1800 ha)",
        "aoi_geojson": test_polygon,
        "start_date": "2021-01-01",
        "end_date": "2026-01-01"
    }).encode()
    req = urllib.request.Request(
        "http://127.0.0.1:8000/api/analyze",
        data=payload,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        analysis = json.loads(resp.read().decode())
        loc_name = analysis["location"]["name"]
        bbox = analysis["location"]["bounding_box"]
        aoi_ha = analysis["total_aoi_hectares"]
        num_regions = len(analysis["change_regions"])
        has_before_rgb = bool(analysis["visual_layers"]["before_rgb"])
        has_after_rgb = bool(analysis["visual_layers"]["after_rgb"])
        print(f"   [PASS] Custom AOI resolved: {loc_name}")
        print(f"          BBox: {bbox}")
        print(f"          Calculated Area: {aoi_ha:.1f} ha")
        print(f"          Change Regions: {num_regions}")
        print(f"          Sentinel-2 Imagery: Before={has_before_rgb}, After={has_after_rgb}")
        assert aoi_ha > 0, "AOI hectares must be > 0"
        assert has_before_rgb and has_after_rgb, "Must produce visual layers"

    # 3. PDF Report Export
    print("\n3. Testing Executive PDF Report Export...")
    rep_payload = json.dumps({"analysis_id": analysis["analysis_id"]}).encode()
    req = urllib.request.Request(
        "http://127.0.0.1:8000/api/report/pdf",
        data=rep_payload,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        pdf_bytes = resp.read()
        print(f"   [PASS] PDF Report Generated: {len(pdf_bytes)} bytes (starts with {pdf_bytes[:4].decode('latin-1')})")
        assert pdf_bytes.startswith(b"%PDF"), "Response must be valid PDF"

    # 4. Upload Mode — Single Image Analysis
    print("\n4. Testing Upload Mode — Single Image Analysis...")
    # Create minimal 128x128 sample image
    from PIL import Image
    im = Image.new('RGB', (128, 128), color=(40, 120, 60))
    buf = io.BytesIO()
    im.save(buf, format='JPEG')
    img_b64 = "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()
    
    upload_payload = json.dumps({
        "image_data": img_b64,
        "filename": "sentinel2_sample.jpg"
    }).encode()
    req = urllib.request.Request(
        "http://127.0.0.1:8000/api/upload/single",
        data=upload_payload,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        up_res = json.loads(resp.read().decode())
        print(f"   [PASS] Upload Single Analysis Successful:")
        print(f"          Title: {up_res.get('analysis_title')}")
        print(f"          Dominant Cover: {up_res.get('dominant_cover')}")
        print(f"          Land Cover: {up_res.get('land_cover_breakdown')}")

    # 5. Upload Mode — Two Image Comparison
    print("\n5. Testing Upload Mode — Two Image Comparison...")
    im2 = Image.new('RGB', (128, 128), color=(180, 100, 50))
    buf2 = io.BytesIO()
    im2.save(buf2, format='JPEG')
    img2_b64 = "data:image/jpeg;base64," + base64.b64encode(buf2.getvalue()).decode()

    comp_payload = json.dumps({
        "image1_data": img_b64,
        "image2_data": img2_b64,
        "label1": "2021 Baseline",
        "label2": "2026 Target"
    }).encode()
    req = urllib.request.Request(
        "http://127.0.0.1:8000/api/upload/compare",
        data=comp_payload,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        assert resp.status == 200
        comp_res = json.loads(resp.read().decode())
        print(f"   [PASS] Upload Two-Image Comparison Successful:")
        print(f"          Headline: {comp_res.get('headline')}")
        print(f"          Detected Changes: {len(comp_res.get('detected_changes', []))} items")

    print("\n==================================================")
    print("ALL 5 ADVANCED FEATURE TESTS PASSED WITH ZERO ERRORS!")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
