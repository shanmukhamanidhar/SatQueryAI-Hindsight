import sys
import json
import urllib.request
import urllib.parse

BACKEND_URL = "http://127.0.0.1:8000"

def post_json(endpoint, data):
    url = f"{BACKEND_URL}{endpoint}"
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(body)
        except:
            return e.code, {"raw_error": body}
    except Exception as e:
        return 500, {"error": str(e)}

def test_query_parse():
    print("\n--- 1. Testing /api/query-parse ---")
    queries = [
        ("What changed in Vijayawada since 2021?", None),
        ("Compare Dubai from 2020 to 2026", None),
        ("What about vegetation?", {"location": "Vijayawada", "start_year": 2021, "end_year": 2026}),
        ("Show changes in Washington", None),
        ("what is the weather?", None),
        ("asdfgh", None),
        ("What changed in XYZABC123?", None)
    ]
    
    for q, prev in queries:
        payload = {"query": q, "previous_context": prev}
        status, res = post_json("/api/query-parse", payload)
        print(f"\nQuery: '{q}' (Prev: {prev})")
        print(f"Status: {status}")
        print(f"EO Query?: {res.get('is_earth_observation')}")
        print(f"Location: {res.get('location_name')}")
        print(f"Years: {res.get('start_year')} -> {res.get('end_year')}")
        print(f"Indicator: {res.get('focus_indicator')}")
        print(f"Ambiguous: {res.get('is_ambiguous')} (Options: {res.get('disambiguation_options')})")
        if res.get('rejection_reason'):
            print(f"Rejection: {res.get('rejection_reason')}")
        if res.get('year_warning'):
            print(f"Year Warning: {res.get('year_warning')}")
        assert status == 200, f"Expected 200, got {status}"

def test_analyze_with_understanding():
    print("\n--- 2. Testing /api/analyze with NLP Query Understanding ---")
    payload = {
        "query": "What changed in Vijayawada since 2021?",
    }
    status, res = post_json("/api/analyze", payload)
    print(f"Status: {status}")
    assert status == 200, f"Expected 200, got {status}"
    assert "query_understanding" in res, "Expected query_understanding in response"
    qu = res["query_understanding"]
    print(f"Grounded Location: {res['location']['name']}")
    print(f"QU Location: {qu.get('location_name')}")
    print(f"QU Years: {qu.get('start_year')} - {qu.get('end_year')}")
    print(f"Change regions count: {len(res.get('change_regions', []))}")
    print(f"Total changed ha: {res.get('total_changed_hectares')}")
    print(f"AI Summary Headline: {res.get('ai_summary', {}).get('headline')}")
    print("SUCCESS!")

if __name__ == "__main__":
    try:
        test_query_parse()
        test_analyze_with_understanding()
        print("\nALL SUITE TESTS PASSED SUCCESSFULLY!")
    except Exception as e:
        print(f"\nTEST FAILED: {e}")
        sys.exit(1)
