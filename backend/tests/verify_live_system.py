import urllib.request
import json

def verify_live():
    base_url = "http://127.0.0.1:8000"
    
    print("1. Testing /api/health...")
    with urllib.request.urlopen(f"{base_url}/api/health") as response:
        health = json.loads(response.read().decode())
        print(f"   Status: {health['status']}, Service: {health['service']}")
        assert health["status"] == "online"

    print("\n2. Testing /api/location/resolve for 'Tokyo'...")
    req_data = json.dumps({"query": "Tokyo"}).encode("utf-8")
    req = urllib.request.Request(f"{base_url}/api/location/resolve", data=req_data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as response:
        loc = json.loads(response.read().decode())
        print(f"   Resolved: {loc['name']}, [{loc['latitude']}, {loc['longitude']}]")
        assert loc["name"] is not None

    print("\n3. Testing /api/analyze for 'Visakhapatnam 2021 to 2026'...")
    analyze_data = json.dumps({"query": "Analyze Visakhapatnam between 2021 and 2026"}).encode("utf-8")
    req = urllib.request.Request(f"{base_url}/api/analyze", data=analyze_data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as response:
        analysis = json.loads(response.read().decode())
        analysis_id = analysis["analysis_id"]
        print(f"   Analysis ID: {analysis_id}")
        print(f"   Location: {analysis['location']['name']}")
        print(f"   Dates: {analysis['actual_before_date']} -> {analysis['actual_after_date']}")
        print(f"   Total Changed: {analysis['total_changed_hectares']} ha ({analysis['percent_aoi_changed']}%)")
        print(f"   Confidence: {analysis['confidence']['overall_score']}% ({analysis['confidence']['rating']})")
        assert analysis_id is not None

    print("\n4. Testing /api/explain-map...")
    explain_data = json.dumps({"analysis_id": analysis_id, "active_layer": "Heatmap"}).encode("utf-8")
    req = urllib.request.Request(f"{base_url}/api/explain-map", data=explain_data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as response:
        explanation = json.loads(response.read().decode())
        print(f"   Explanation received ({len(explanation['explanation'])} chars)")
        assert "explanation" in explanation

    print("\n5. Testing /api/chat follow-up ('Where did most changes happen?')...")
    chat_data = json.dumps({
        "analysis_id": analysis_id,
        "message": "Where did most changes happen?"
    }).encode("utf-8")
    req = urllib.request.Request(f"{base_url}/api/chat", data=chat_data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as response:
        chat_resp = json.loads(response.read().decode())
        print(f"   AI Reply: {chat_resp['reply'][:120]}...")
        assert "reply" in chat_resp

    print("\n6. Testing GeoJSON & CSV Exports...")
    with urllib.request.urlopen(f"{base_url}/api/analysis/{analysis_id}/geojson") as response:
        geojson = json.loads(response.read().decode())
        print(f"   GeoJSON Features: {len(geojson.get('features', []))} change polygons exported")
        assert len(geojson.get("features", [])) > 0

    with urllib.request.urlopen(f"{base_url}/api/analysis/{analysis_id}/csv") as response:
        csv_text = response.read().decode()
        print(f"   CSV Rows: {len(csv_text.splitlines())} lines exported")
        assert len(csv_text.splitlines()) > 5

    print("\n7. Testing PDF Report Generation (/api/report/pdf)...")
    pdf_data = json.dumps({"analysis_id": analysis_id}).encode("utf-8")
    req = urllib.request.Request(f"{base_url}/api/report/pdf", data=pdf_data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as response:
        pdf_bytes = response.read()
        print(f"   PDF Report Generated ({len(pdf_bytes)} bytes)")
        assert len(pdf_bytes) > 1000

    print("\n=== ALL LIVE ENDPOINT VERIFICATIONS PASSED 100%! ===")

if __name__ == "__main__":
    verify_live()
