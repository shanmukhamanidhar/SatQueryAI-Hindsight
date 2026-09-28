import asyncio
import uuid
from datetime import datetime
from fastapi.testclient import TestClient

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app
from services.hindsight_service import hindsight_service
from services.supabase_service import supabase_service
from services.nlp_parser import parse_nlp_intent, heuristic_parse_intent

client = TestClient(app)

def test_hindsight_retention_and_bank_isolation():
    """
    Verifies Hindsight Agent Memory retains analysis experiences and isolates user memory banks.
    """
    user_alpha = f"judge_test_alpha_{uuid.uuid4().hex[:6]}"
    user_beta = f"judge_test_beta_{uuid.uuid4().hex[:6]}"
    
    bank_alpha = hindsight_service.get_bank_id(user_alpha)
    bank_beta = hindsight_service.get_bank_id(user_beta)
    
    assert bank_alpha == f"satquery-user-{user_alpha}"
    assert bank_beta == f"satquery-user-{user_beta}"
    assert bank_alpha != bank_beta

    # Retain experience in user Alpha bank
    evidence = {
        "location_name": "Visakhapatnam",
        "actual_before_date": "2021-02-14",
        "actual_after_date": "2026-03-01",
        "total_aoi_hectares": 13120.0,
        "total_changed_hectares": 842.5,
        "percent_aoi_changed": 6.42,
        "focus_indicator": "vegetation",
        "indices_summary": {
            "delta_ndvi_mean": -0.045,
            "delta_ndbi_mean": 0.038,
            "delta_ndwi_mean": -0.012
        },
        "change_regions": [{"id": "r1"}, {"id": "r2"}]
    }

    ret_res = hindsight_service.retain_analysis_experience(
        query="Analyze vegetation in Visakhapatnam between 2021 and 2026",
        evidence=evidence,
        user_id=user_alpha
    )
    assert ret_res["status"] in ("retained", "retained_local")
    assert ret_res["location"] == "Visakhapatnam"

    # Retain user preference in user Alpha bank
    pref_res = hindsight_service.retain_user_preference(
        preference_text="Focus on agricultural parcel changes",
        user_id=user_alpha,
        category="agriculture"
    )
    assert pref_res["status"] in ("retained", "retained_local")

    # Verify user Alpha can recall its memories
    recall_alpha = hindsight_service.recall_relevant_memories("that area", user_id=user_alpha)
    assert recall_alpha["resolved_location"] == "Visakhapatnam"
    assert "Focus on agricultural parcel changes" in recall_alpha["preferences"]

    # Verify user Beta bank does NOT contain user Alpha's isolated memories
    recall_beta = hindsight_service.recall_relevant_memories("that area", user_id=user_beta)
    assert recall_beta["resolved_location"] is None


def test_hindsight_anaphora_resolution_and_preference_steering():
    """
    Verifies that NLP query understanding resolves indirect anaphora ('that area')
    using Hindsight memory and applies learned analyst preferences.
    """
    user_id = f"judge_test_anaphora_{uuid.uuid4().hex[:6]}"
    
    # Seed memory bank with prior Visakhapatnam analysis
    hindsight_service.retain_analysis_experience(
        query="Examine Visakhapatnam",
        evidence={
            "location_name": "Visakhapatnam",
            "actual_before_date": "2021-01-01",
            "actual_after_date": "2026-01-01",
            "total_aoi_hectares": 12000.0,
            "total_changed_hectares": 500.0,
            "percent_aoi_changed": 4.1,
            "indices_summary": {}
        },
        user_id=user_id
    )

    # RECALL: query has NO location name
    recalled = hindsight_service.recall_relevant_memories("Analyze that area again with focus on agriculture", user_id=user_id)
    assert recalled["resolved_location"] == "Visakhapatnam"

    # Heuristic NLP parse with recalled context
    intent = heuristic_parse_intent(
        query="Analyze that area again with focus on agriculture",
        recalled_context=recalled
    )
    assert intent["location"] == "Visakhapatnam", "Must resolve 'that area' to Visakhapatnam from Hindsight memory"
    assert intent["memory_used"] is True, "Must flag memory_used"
    assert "Visakhapatnam" in (intent.get("memory_note") or "")


def test_supabase_persistence_and_history_api():
    """
    Verifies Supabase persistence status and history API endpoints.
    """
    # 1. Supabase status endpoint
    status_resp = client.get("/api/supabase/status")
    assert status_resp.status_code == 200
    s_data = status_resp.json()
    assert "connected" in s_data
    assert "mode" in s_data

    # 2. History endpoint
    hist_resp = client.get("/api/history")
    assert hist_resp.status_code == 200
    h_data = hist_resp.json()
    assert "analyses" in h_data
    assert isinstance(h_data["analyses"], list)


def test_judge_demo_3_step_workflow_e2e():
    """
    Executes the exact 3-step Judge Mode Demonstration:
      Step 1: "Analyze vegetation in Visakhapatnam between 2021 and 2026"
              -> Satellite analysis -> Hindsight retains experience.
      Step 2: "Analyze that area again with focus on agriculture"
              -> Hindsight recalls "Visakhapatnam" without user input -> Analyzes.
      Step 3: "Compare with my previous analysis"
              -> Hindsight + Supabase contextual comparison.
    """
    judge_session_user = f"judge_demo_session_{uuid.uuid4().hex[:8]}"

    # =========================================================
    # STEP 1: Cold-start query for Visakhapatnam
    # =========================================================
    q1 = "Analyze vegetation in Visakhapatnam between 2021 and 2026"
    resp1 = client.post("/api/analyze", json={
        "query": q1,
        "user_id": judge_session_user
    })
    assert resp1.status_code == 200, f"Step 1 failed: {resp1.text}"
    data1 = resp1.json()
    assert data1["location"]["name"] == "Visakhapatnam"
    assert data1["total_aoi_hectares"] > 1000
    assert data1["total_changed_hectares"] > 0
    assert len(data1["change_regions"]) > 0
    analysis1_id = data1["analysis_id"]

    # Verify memory is listed in Hindsight for this user
    memories_resp = client.get(f"/api/hindsight/memories?user_id={judge_session_user}")
    assert memories_resp.status_code == 200
    mems = memories_resp.json().get("memories", [])
    assert len(mems) >= 1
    assert "Visakhapatnam" in mems[0]["text"]

    # =========================================================
    # STEP 2: Anaphoric query: "Analyze that area again"
    # User does NOT mention Visakhapatnam!
    # =========================================================
    q2 = "Analyze that area again with focus on agriculture"
    resp2 = client.post("/api/analyze", json={
        "query": q2,
        "user_id": judge_session_user
    })
    assert resp2.status_code == 200, f"Step 2 failed: {resp2.text}"
    data2 = resp2.json()
    # Verified: Resolved to Visakhapatnam purely via Hindsight memory!
    assert data2["location"]["name"] == "Visakhapatnam", "Step 2 must resolve 'that area' to Visakhapatnam"
    assert data2["memory_active"] is True, "Step 2 must show active agent memory"
    assert "Visakhapatnam" in (data2.get("memory_context_note") or "")

    # =========================================================
    # STEP 3: Multi-Session Synthesis & Comparison
    # =========================================================
    q3 = "Compare with my previous analysis"
    resp3 = client.post("/api/analyze", json={
        "query": q3,
        "user_id": judge_session_user
    })
    assert resp3.status_code == 200, f"Step 3 failed: {resp3.text}"
    data3 = resp3.json()
    assert data3["location"]["name"] == "Visakhapatnam"
    assert data3["memory_active"] is True

    # =========================================================
    # REFLECTIVE REASONING SYNTHESIS
    # =========================================================
    reflect_resp = client.post("/api/hindsight/reflect", json={
        "question": "What land dynamics and user preferences have been observed across sessions?",
        "user_id": judge_session_user
    })
    assert reflect_resp.status_code == 200
    ref_data = reflect_resp.json()
    assert "reflection" in ref_data
    assert len(ref_data["reflection"]) > 20
    assert "Visakhapatnam" in ref_data["reflection"]

    # =========================================================
    # PERSISTENCE & HISTORY RETRIEVAL
    # =========================================================
    hist_resp = client.get(f"/api/history?user_id={judge_session_user}")
    assert hist_resp.status_code == 200
    hist_data = hist_resp.json()
    assert hist_data["total"] >= 1

    # Load individual history record
    load_resp = client.get(f"/api/history/{analysis1_id}?user_id={judge_session_user}")
    assert load_resp.status_code == 200
    loaded = load_resp.json()
    assert loaded["analysis_id"] == analysis1_id or loaded.get("id") == analysis1_id


if __name__ == "__main__":
    print("\n=======================================================")
    print("RUNNING HINDSIGHT + SUPABASE E2E INTEGRATION TESTS")
    print("=======================================================")
    print("\n[1/4] Testing Hindsight Retention & Bank Isolation...")
    test_hindsight_retention_and_bank_isolation()
    print("[OK] PASSED: Memory retention and multi-tenant bank isolation verified.")

    print("\n[2/4] Testing Anaphora Resolution & Preference Steering...")
    test_hindsight_anaphora_resolution_and_preference_steering()
    print("[OK] PASSED: 'That area' successfully resolved to Visakhapatnam via Hindsight.")

    print("\n[3/4] Testing Supabase Persistence & History API...")
    test_supabase_persistence_and_history_api()
    print("[OK] PASSED: Supabase status and history endpoints operational.")

    print("\n[4/4] Testing Full 3-Step Judge Demo Workflow...")
    test_judge_demo_3_step_workflow_e2e()
    print("[OK] PASSED: Step 1 -> Step 2 -> Step 3 -> Reflect verified end-to-end.")

    print("\nALL HINDSIGHT + SUPABASE TESTS PASSED SUCCESSFULLY!\n")
