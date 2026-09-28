import asyncio
import json
import httpx
import sys

BASE_URL = "http://127.0.0.1:8000"

async def test_agent_system_evaluation():
    async with httpx.AsyncClient(timeout=30.0) as client:
        print("\n" + "="*70)
        print("🌍 SATQUERY AI AGENT EVALUATION & CORE STRESS TEST")
        print("="*70)

        # -------------------------------------------------------------
        # Part 1: Worldwide General-Purpose Test
        # -------------------------------------------------------------
        test_queries = [
            "What changed in Hyderabad between 2021 and 2026?",
            "Has urbanization increased near Hyderabad?",
            "Show vegetation loss near Hyderabad",
            "Compare central Tokyo from 2020 to 2025",
            "Show vegetation changes near Nairobi",
            "What changed along the River Thames?"
        ]

        print("\n--- TEST 1: WORLDWIDE LOCATIONS & INTENTS ---")
        for q in test_queries:
            print(f"\n[Query] \"{q}\"")
            resp = await client.post(f"{BASE_URL}/api/analyze", json={"query": q})
            if resp.status_code != 200:
                print(f"FAILED: {resp.status_code} - {resp.text}")
                sys.exit(1)
            
            data = resp.json()
            loc = data["location"]["name"]
            coords = [data["location"]["latitude"], data["location"]["longitude"]]
            dates = f"{data['actual_before_date']} -> {data['actual_after_date']}"
            changed_ha = data["total_changed_hectares"]
            pct = data["percent_aoi_changed"]
            conf = data["confidence"]["overall_score"]
            clusters = len(data["change_regions"])
            
            print(f"  -> Resolved Target: {loc} ({coords[0]:.4f} N, {coords[1]:.4f} E)")
            print(f"  -> Passes: {dates} | Confidence: {conf}%")
            print(f"  -> Changed Surface: {changed_ha:,.2f} ha ({pct}% of AOI)")
            print(f"  -> Clusters Extracted: {clusters} polygons")
            assert changed_ha > 0, "Changed hectares must be > 0"
            assert conf >= 50, "Confidence must be >= 50"
            assert clusters > 0, "Change clusters must be detected"

        # -------------------------------------------------------------
        # Part 2: Ask -> Map -> Answer & Multi-Turn Context Follow-ups
        # -------------------------------------------------------------
        print("\n--- TEST 2: MULTI-TURN ASK -> MAP -> ANSWER DIALOGUE ---")
        print("\n[Base Query] \"What changed in Visakhapatnam?\"")
        resp = await client.post(f"{BASE_URL}/api/analyze", json={"query": "What changed in Visakhapatnam?"})
        assert resp.status_code == 200
        vizag_context = resp.json()
        analysis_id = vizag_context["analysis_id"]
        print(f"  -> Baseline Analysis loaded. ID: {analysis_id}")
        print(f"  -> Total Changed: {vizag_context['total_changed_hectares']} ha | Clusters: {len(vizag_context['change_regions'])}")

        chat_history = []

        # Follow-up 1: Where did the biggest change happen?
        q1 = "Where did the biggest change happen?"
        print(f"\n[User Follow-up 1] \"{q1}\"")
        chat_resp1 = await client.post(
            f"{BASE_URL}/api/chat",
            json={"analysis_id": analysis_id, "message": q1, "history": chat_history}
        )
        assert chat_resp1.status_code == 200
        res1 = chat_resp1.json()
        print(f"  -> AI Answer:\n{res1['reply']}")
        print(f"  -> Map Action (zoom_to): {res1.get('zoom_to')}")
        print(f"  -> Map Action (highlight_region_ids): {res1.get('highlight_region_ids')}")
        print(f"  -> Map Action (selected_region_id): {res1.get('selected_region_id')}")
        assert res1.get("zoom_to") is not None, "Must return zoom_to coordinates"
        assert res1.get("selected_region_id") is not None, "Must return selected_region_id"
        assert res1.get("highlight_region_ids"), "Must highlight cluster"
        
        chat_history.append({"role": "user", "content": q1})
        chat_history.append({"role": "assistant", "content": res1["reply"]})

        # Follow-up 2: Was it urban development?
        q2 = "Was it urban development?"
        print(f"\n[User Follow-up 2] \"{q2}\"")
        chat_resp2 = await client.post(
            f"{BASE_URL}/api/chat",
            json={"analysis_id": analysis_id, "message": q2, "history": chat_history}
        )
        assert chat_resp2.status_code == 200
        res2 = chat_resp2.json()
        print(f"  -> AI Answer:\n{res2['reply']}")
        assert "urban" in res2["reply"].lower() or "development" in res2["reply"].lower() or "vegetation" in res2["reply"].lower()
        
        chat_history.append({"role": "user", "content": q2})
        chat_history.append({"role": "assistant", "content": res2["reply"]})

        # Follow-up 3: When did it happen?
        q3 = "When did it happen?"
        print(f"\n[User Follow-up 3] \"{q3}\"")
        chat_resp3 = await client.post(
            f"{BASE_URL}/api/chat",
            json={"analysis_id": analysis_id, "message": q3, "history": chat_history}
        )
        assert chat_resp3.status_code == 200
        res3 = chat_resp3.json()
        print(f"  -> AI Answer:\n{res3['reply']}")
        assert "baseline" in res3["reply"].lower() or "2021" in res3["reply"] or "monitoring" in res3["reply"].lower()

        chat_history.append({"role": "user", "content": q3})
        chat_history.append({"role": "assistant", "content": res3["reply"]})

        # Follow-up 4: Show only vegetation loss
        q4 = "Show only vegetation loss"
        print(f"\n[User Follow-up 4] \"{q4}\"")
        chat_resp4 = await client.post(
            f"{BASE_URL}/api/chat",
            json={"analysis_id": analysis_id, "message": q4, "history": chat_history}
        )
        assert chat_resp4.status_code == 200
        res4 = chat_resp4.json()
        print(f"  -> AI Answer:\n{res4['reply']}")
        print(f"  -> Filter Category: {res4.get('filter_category')}")
        assert res4.get("filter_category") == "Vegetation loss", "Filter category must be Vegetation loss"

        # Follow-up 5: Why 85% confidence?
        q5 = "Why 85% confidence?"
        print(f"\n[User Follow-up 5] \"{q5}\"")
        chat_resp5 = await client.post(
            f"{BASE_URL}/api/chat",
            json={"analysis_id": analysis_id, "message": q5, "history": chat_history}
        )
        assert chat_resp5.status_code == 200
        res5 = chat_resp5.json()
        print(f"  -> AI Answer:\n{res5['reply']}")
        assert "sentinel-2" in res5["reply"].lower()
        assert "cloud" in res5["reply"].lower()

        print("\n" + "="*70)
        print("ALL SATQUERY AI AGENT EVALUATION & STRESS TESTS PASSED WITH 100% SUCCESS!")
        print("="*70 + "\n")

if __name__ == "__main__":
    asyncio.run(test_agent_system_evaluation())
