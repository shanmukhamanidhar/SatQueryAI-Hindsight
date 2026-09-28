import asyncio
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.geocoding import resolve_location
from services.india_locations import STATES_DATA, UNION_TERRITORIES_DATA

ALL_28_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
]

ALL_8_UTS = [
    "Andaman and Nicobar Islands", "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu", "Delhi (NCT)",
    "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
]

async def test_all_36_locations():
    assert len(ALL_28_STATES) == 28, f"Expected 28 states, got {len(ALL_28_STATES)}"
    assert len(ALL_8_UTS) == 8, f"Expected 8 UTs, got {len(ALL_8_UTS)}"

    print("=================================================================")
    print("Testing All 28 States of India Resolution:")
    print("=================================================================")
    for i, state in enumerate(ALL_28_STATES, 1):
        loc = await resolve_location(state)
        assert loc.name == state, f"Expected name '{state}', got '{loc.name}'"
        assert loc.country == "India", f"Expected India, got '{loc.country}'"
        assert len(loc.bounding_box) == 4, f"Invalid bbox: {loc.bounding_box}"
        assert loc.latitude != 0 and loc.longitude != 0
        assert len(loc.landmarks) >= 3, f"Expected at least 3 landmarks for {state}, got {len(loc.landmarks)}"
        print(f"[{i:02d}/28] State PASS: {loc.name:<25} ({loc.latitude:.3f}°N, {loc.longitude:.3f}°E) | BBox: {loc.bounding_box} | {len(loc.landmarks)} Landmarks")

    print("\n=================================================================")
    print("Testing All 8 Union Territories of India Resolution:")
    print("=================================================================")
    for j, ut in enumerate(ALL_8_UTS, 1):
        loc = await resolve_location(ut)
        assert loc.name == ut, f"Expected name '{ut}', got '{loc.name}'"
        assert loc.country == "India", f"Expected India, got '{loc.country}'"
        assert len(loc.bounding_box) == 4, f"Invalid bbox: {loc.bounding_box}"
        assert loc.latitude != 0 and loc.longitude != 0
        assert len(loc.landmarks) >= 3, f"Expected at least 3 landmarks for {ut}, got {len(loc.landmarks)}"
        print(f"[{j:02d}/08] UT    PASS: {loc.name:<35} ({loc.latitude:.3f}°N, {loc.longitude:.3f}°E) | BBox: {loc.bounding_box} | {len(loc.landmarks)} Landmarks")

    print("\nSUCCESS: All 36 Indian States & Union Territories resolved flawlessly!")

if __name__ == '__main__':
    asyncio.run(test_all_36_locations())
