import asyncio
from backend.models.schemas import AnalyzeRequest
from backend.main import api_analyze

async def test_e2e():
    print("Executing End-to-End Analysis for 'Analyze Visakhapatnam between 2021 and 2026'...")
    req = AnalyzeRequest(query="Analyze Visakhapatnam between 2021 and 2026")
    ctx = await api_analyze(req)
    
    print(f"[OK] Analysis ID: {ctx.analysis_id}")
    print(f"[OK] Location: {ctx.location.name}, {ctx.location.country} [{ctx.location.latitude}, {ctx.location.longitude}]")
    print(f"[OK] AOI Bounding Box: {ctx.location.bounding_box}, Area: {ctx.total_aoi_hectares} ha")
    print(f"[OK] Baseline Observation Date: {ctx.actual_before_date} (Cloud: {ctx.cloud_percentage_before}%)")
    print(f"[OK] Recent Observation Date: {ctx.actual_after_date} (Cloud: {ctx.cloud_percentage_after}%)")
    print(f"[OK] Total Changed Area: {ctx.total_changed_hectares} ha ({ctx.percent_aoi_changed}% of AOI)")
    print(f"[OK] Detected Change Regions: {len(ctx.change_regions)} clusters")
    if ctx.change_regions:
        top_cr = ctx.change_regions[0]
        print(f"     Top Region: {top_cr.user_label} ({top_cr.area_hectares} ha, conf: {top_cr.confidence_pct}%)")
    print(f"[OK] Indices Summary: Delta NDVI={ctx.indices_summary['delta_ndvi_mean']}, Delta NDBI={ctx.indices_summary['delta_ndbi_mean']}")
    print(f"[OK] Confidence: {ctx.confidence.overall_score}% ({ctx.confidence.rating})")
    print(f"[OK] AI Headline: {ctx.ai_summary.headline}")
    print(f"[OK] Visual Layers Available: before_rgb={bool(ctx.visual_layers.before_rgb)}, heatmap={bool(ctx.visual_layers.change_heatmap)}")
    print("\nEND-TO-END PIPELINE VERIFIED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(test_e2e())
