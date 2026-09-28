import httpx

with httpx.Client(base_url="http://127.0.0.1:8000", timeout=10.0) as client:
    health = client.get("/health")
    print("Health Status:", health.status_code)

    r1 = client.post("/api/query-parse", json={"query": "What changed in Vijayawada since 2021?"})
    print("R1 Vijayawada:", r1.status_code, r1.json()["location"], r1.json()["start_year"], r1.json()["end_year"])

    r2 = client.post("/api/query-parse", json={
        "query": "What about vegetation?",
        "previous_context": {"location": "Dubai", "start_year": 2020, "end_year": 2026}
    })
    print("R2 Followup:", r2.status_code, r2.json()["location"], r2.json()["focus_indicator"])

    r3 = client.post("/api/query-parse", json={"query": "asdfgh"})
    print("R3 Invalid:", r3.status_code, r3.json()["is_earth_observation"], r3.json()["rejection_reason"])

    r4 = client.post("/api/query-parse", json={"query": "Show changes in Washington"})
    print("R4 Ambiguous:", r4.status_code, r4.json()["is_ambiguous"], r4.json()["disambiguation_options"])
