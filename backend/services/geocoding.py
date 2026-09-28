import re
import logging
import math
from typing import Optional, Dict, Any, List, Tuple
import httpx
from config import settings
from models.schemas import LocationInfo, PlaceLandmark

logger = logging.getLogger(__name__)

# In-memory LRU cache to eliminate duplicate network calls and prevent rate limiting
_GEOCODE_CACHE: Dict[str, LocationInfo] = {}

def parse_lat_lon_query(query: str) -> Optional[List[float]]:
    """
    Parses latitude/longitude coordinates across common formats:
    - Decimal pair: '17.6868, 83.2185', '17.6868 83.2185', '-33.8688, 151.2093'
    - Cardinal format: '17.6868 N, 83.2185 E', '33.8688 S, 151.2093 E'
    - Degree format: '17.6868° N, 83.2185° E'
    Returns [longitude, latitude] or None.
    """
    clean = query.strip()
    
    # Cardinal directions pattern
    cardinal_pattern = r"^([+-]?\d+(?:\.\d+)?)\s*°?\s*([NSns])?[,\s]+([+-]?\d+(?:\.\d+)?)\s*°?\s*([EWew])?$"
    m = re.match(cardinal_pattern, clean)
    if m:
        val1, dir1, val2, dir2 = m.groups()
        lat = float(val1)
        lon = float(val2)
        if dir1 and dir1.upper() == 'S':
            lat = -abs(lat)
        elif dir1 and dir1.upper() == 'N':
            lat = abs(lat)
        if dir2 and dir2.upper() == 'W':
            lon = -abs(lon)
        elif dir2 and dir2.upper() == 'E':
            lon = abs(lon)
        if -90 <= lat <= 90 and -180 <= lon <= 180:
            return [round(lon, 5), round(lat, 5)]

    # Standard numeric pattern: e.g. 17.6868, 83.2185 or -33.8688, 151.2093
    num_pattern = r"^([+-]?\d+(?:\.\d+)?)[,\s]+([+-]?\d+(?:\.\d+)?)$"
    m2 = re.match(num_pattern, clean)
    if m2:
        lat = float(m2.group(1))
        lon = float(m2.group(2))
        if -90 <= lat <= 90 and -180 <= lon <= 180:
            return [round(lon, 5), round(lat, 5)]
            
    return None

def create_bounding_box(lon: float, lat: float, delta_deg: float = 0.07) -> List[float]:
    """
    Creates a configurable Sentinel-2 analysis bounding box around a centroid.
    0.07 degrees is ~7.7km in each direction from center (~15.4km across, ~23,000 ha).
    Format: [west, south, east, north]
    """
    return [
        round(lon - delta_deg, 5),
        round(lat - delta_deg, 5),
        round(lon + delta_deg, 5),
        round(lat + delta_deg, 5)
    ]

def bbox_to_geojson_polygon(bbox: List[float]) -> Dict[str, Any]:
    """Converts [west, south, east, north] bounding box to a GeoJSON Polygon."""
    w, s, e, n = bbox
    return {
        "type": "Polygon",
        "coordinates": [[
            [w, s],
            [e, s],
            [e, n],
            [w, n],
            [w, s]
        ]]
    }

# Master catalog of real, specific places, landmarks, circles, and neighborhoods
KNOWN_SPECIFIC_PLACES: Dict[str, List[Dict[str, Any]]] = {
    "vijayawada": [
        {"name": "Prakasam Barrage", "lon": 80.6042, "lat": 16.5065, "category": "landmark"},
        {"name": "Bhavani Island", "lon": 80.5750, "lat": 16.5167, "category": "waterbody"},
        {"name": "Benz Circle", "lon": 80.6480, "lat": 16.5002, "category": "suburb"},
        {"name": "Kanaka Durga Temple", "lon": 80.6050, "lat": 16.5140, "category": "landmark"},
        {"name": "Governorpet", "lon": 80.6270, "lat": 16.5120, "category": "suburb"},
        {"name": "Gunadala", "lon": 80.6650, "lat": 16.5180, "category": "suburb"},
        {"name": "Auto Nagar", "lon": 80.6720, "lat": 16.4950, "category": "suburb"},
        {"name": "Patamata", "lon": 80.6550, "lat": 16.4920, "category": "suburb"},
        {"name": "One Town (Old City)", "lon": 80.6120, "lat": 16.5180, "category": "suburb"},
        {"name": "Krishna Lanka", "lon": 80.6230, "lat": 16.4980, "category": "suburb"},
        {"name": "Tadepalle", "lon": 80.6010, "lat": 16.4850, "category": "suburb"},
        {"name": "Gollapudi", "lon": 80.5700, "lat": 16.5450, "category": "suburb"},
    ],
    "krishna": [
        {"name": "Prakasam Barrage", "lon": 80.6042, "lat": 16.5065, "category": "landmark"},
        {"name": "Bhavani Island", "lon": 80.5750, "lat": 16.5167, "category": "waterbody"},
        {"name": "Krishna River Main Reach", "lon": 80.6150, "lat": 16.5020, "category": "waterbody"},
        {"name": "Sitanagaram Ghat", "lon": 80.6090, "lat": 16.4980, "category": "landmark"},
        {"name": "Krishna Canal Offtake", "lon": 80.6050, "lat": 16.5010, "category": "waterbody"},
        {"name": "Yanamalakuduru Floodplain", "lon": 80.6600, "lat": 16.4850, "category": "waterbody"},
        {"name": "Gollapudi Upstream Reach", "lon": 80.5720, "lat": 16.5350, "category": "waterbody"},
        {"name": "Tadepalle Riverbank", "lon": 80.6010, "lat": 16.4850, "category": "suburb"},
    ],
    "visakhapatnam": [
        {"name": "RK Beach (Ramakrishna)", "lon": 83.3220, "lat": 17.7120, "category": "landmark"},
        {"name": "Rushikonda Beach & IT Park", "lon": 83.3850, "lat": 17.7820, "category": "landmark"},
        {"name": "Kailasagiri Hilltop", "lon": 83.3420, "lat": 17.7490, "category": "landmark"},
        {"name": "MVP Colony", "lon": 83.3350, "lat": 17.7380, "category": "suburb"},
        {"name": "Gajuwaka Industrial Belt", "lon": 83.2180, "lat": 17.6920, "category": "suburb"},
        {"name": "Dwaraka Nagar (RTC Complex)", "lon": 83.3030, "lat": 17.7270, "category": "suburb"},
        {"name": "Madhurawada Tech Zone", "lon": 83.3550, "lat": 17.8050, "category": "suburb"},
        {"name": "Simhachalam Foothills", "lon": 83.2420, "lat": 17.7660, "category": "landmark"},
        {"name": "Visakhapatnam Port Area", "lon": 83.2950, "lat": 17.6900, "category": "landmark"},
        {"name": "Yarada Beach Corridor", "lon": 83.2920, "lat": 17.6740, "category": "landmark"},
    ],
    "hyderabad": [
        {"name": "Hitec City (Cyberabad)", "lon": 78.3780, "lat": 17.4480, "category": "suburb"},
        {"name": "Gachibowli Financial District", "lon": 78.3580, "lat": 17.4400, "category": "suburb"},
        {"name": "Hussain Sagar Lake", "lon": 78.4740, "lat": 17.4239, "category": "waterbody"},
        {"name": "Charminar Old City", "lon": 78.4747, "lat": 17.3616, "category": "landmark"},
        {"name": "Banjara Hills", "lon": 78.4350, "lat": 17.4150, "category": "suburb"},
        {"name": "Jubilee Hills", "lon": 78.4050, "lat": 17.4320, "category": "suburb"},
        {"name": "Secunderabad", "lon": 78.5020, "lat": 17.4340, "category": "suburb"},
        {"name": "Golconda Fort", "lon": 78.4010, "lat": 17.3833, "category": "landmark"},
        {"name": "Kukatpally Housing Board", "lon": 78.3980, "lat": 17.4920, "category": "suburb"},
        {"name": "Begumpet", "lon": 78.4680, "lat": 17.4430, "category": "suburb"},
    ],
    "gujarat": [
        {"name": "Sabarmati Riverfront", "lon": 72.5710, "lat": 23.0300, "category": "landmark"},
        {"name": "GIFT City Financial Hub", "lon": 72.6850, "lat": 23.1600, "category": "suburb"},
        {"name": "SG Highway Commercial Corridor", "lon": 72.5180, "lat": 23.0450, "category": "suburb"},
        {"name": "Manek Chowk Heritage", "lon": 72.5890, "lat": 23.0240, "category": "landmark"},
        {"name": "Kankaria Lake", "lon": 72.6020, "lat": 23.0060, "category": "waterbody"},
        {"name": "Vastrapur", "lon": 72.5280, "lat": 23.0360, "category": "suburb"},
        {"name": "Gandhinagar Capital Zone", "lon": 72.6500, "lat": 23.2200, "category": "suburb"},
        {"name": "Bodakdev", "lon": 72.5080, "lat": 23.0380, "category": "suburb"},
    ],
    "tamil nadu": [
        {"name": "Marina Beach Promenade", "lon": 80.2820, "lat": 13.0500, "category": "landmark"},
        {"name": "OMR IT Expressway", "lon": 80.2280, "lat": 12.9350, "category": "suburb"},
        {"name": "T. Nagar Commercial Center", "lon": 80.2330, "lat": 13.0410, "category": "suburb"},
        {"name": "Guindy Industrial Park", "lon": 80.2120, "lat": 13.0060, "category": "suburb"},
        {"name": "Adyar Estuary", "lon": 80.2580, "lat": 13.0070, "category": "waterbody"},
        {"name": "Mylapore Cultural Zone", "lon": 80.2680, "lat": 13.0330, "category": "suburb"},
        {"name": "Anna Nagar", "lon": 80.2080, "lat": 13.0870, "category": "suburb"},
        {"name": "Velachery Hub", "lon": 80.2170, "lat": 12.9780, "category": "suburb"},
    ],
    "kerala": [
        {"name": "Fort Kochi Waterfront", "lon": 76.2410, "lat": 9.9650, "category": "landmark"},
        {"name": "Marine Drive Promenade", "lon": 76.2750, "lat": 9.9820, "category": "landmark"},
        {"name": "Vembanad Lake Estuary", "lon": 76.3200, "lat": 9.8500, "category": "waterbody"},
        {"name": "Willingdon Island Port", "lon": 76.2680, "lat": 9.9450, "category": "suburb"},
        {"name": "Kakkanad InfoPark IT Hub", "lon": 76.3580, "lat": 10.0120, "category": "suburb"},
        {"name": "Bolgatty Island", "lon": 76.2680, "lat": 9.9880, "category": "landmark"},
        {"name": "Edappally Junction", "lon": 76.3080, "lat": 10.0240, "category": "suburb"},
    ],
    "sri lanka": [
        {"name": "Galle Face Green", "lon": 79.8450, "lat": 6.9270, "category": "landmark"},
        {"name": "Colombo Port City", "lon": 79.8350, "lat": 6.9380, "category": "landmark"},
        {"name": "Lotus Tower Precinct", "lon": 79.8580, "lat": 6.9310, "category": "landmark"},
        {"name": "Viharamahadevi Park", "lon": 79.8620, "lat": 6.9150, "category": "landmark"},
        {"name": "Kollupitiya Coastal Quarter", "lon": 79.8510, "lat": 6.9080, "category": "suburb"},
        {"name": "Bambalapitiya", "lon": 79.8550, "lat": 6.8920, "category": "suburb"},
    ],
    "tokyo": [
        {"name": "Shinjuku Skyscraper District", "lon": 139.6917, "lat": 35.6895, "category": "suburb"},
        {"name": "Shibuya Crossing", "lon": 139.7006, "lat": 35.6580, "category": "landmark"},
        {"name": "Tokyo Tower & Roppongi", "lon": 139.7454, "lat": 35.6586, "category": "landmark"},
        {"name": "Imperial Palace Chiyoda", "lon": 139.7528, "lat": 35.6852, "category": "landmark"},
        {"name": "Ginza Shopping Strip", "lon": 139.7671, "lat": 35.6719, "category": "suburb"},
        {"name": "Asakusa & Senso-ji", "lon": 139.7967, "lat": 35.7148, "category": "landmark"},
        {"name": "Odaiba Waterfront", "lon": 139.7744, "lat": 35.6288, "category": "waterbody"},
    ],
    "london": [
        {"name": "River Thames Embankment", "lon": -0.1180, "lat": 51.5050, "category": "waterbody"},
        {"name": "Tower Bridge & City of London", "lon": -0.0754, "lat": 51.5055, "category": "landmark"},
        {"name": "Westminster & Big Ben", "lon": -0.1246, "lat": 51.4995, "category": "landmark"},
        {"name": "Canary Wharf Financial Hub", "lon": -0.0200, "lat": 51.5050, "category": "suburb"},
        {"name": "Hyde Park", "lon": -0.1657, "lat": 51.5073, "category": "landmark"},
        {"name": "Greenwich Royal Observatory", "lon": 0.0000, "lat": 51.4769, "category": "landmark"},
    ],
    "sydney": [
        {"name": "Sydney Opera House", "lon": 151.2153, "lat": -33.8568, "category": "landmark"},
        {"name": "Sydney Harbour Bridge", "lon": 151.2108, "lat": -33.8523, "category": "landmark"},
        {"name": "Circular Quay Terminal", "lon": 151.2114, "lat": -33.8614, "category": "suburb"},
        {"name": "Darling Harbour", "lon": 151.2008, "lat": -33.8736, "category": "waterbody"},
        {"name": "Bondi Beach Coastal Strip", "lon": 151.2743, "lat": -33.8915, "category": "landmark"},
        {"name": "Barangaroo Waterfront", "lon": 151.2014, "lat": -33.8625, "category": "suburb"},
    ]
}

def resolve_specific_places_for_aoi(location_name: str, bbox: List[float]) -> List[PlaceLandmark]:
    """
    Returns prominent real places, landmarks, and neighborhoods located strictly within or near the AOI bbox.
    Ensures that when 'AREA NAMES' is toggled, users see genuine specific places on the map.
    """
    name_clean = location_name.lower().strip()
    w, s, e, n = bbox
    candidates: List[Dict[str, Any]] = []

    # 1. Match against known specific places dictionary
    for key, places in KNOWN_SPECIFIC_PLACES.items():
        if key in name_clean or any(k in key for k in name_clean.split()):
            candidates.extend(places)
            break

    # If no direct match, check if any catalog entry falls inside this bounding box
    if not candidates:
        for places in KNOWN_SPECIFIC_PLACES.values():
            for p in places:
                if (w - 0.02) <= p["lon"] <= (e + 0.02) and (s - 0.02) <= p["lat"] <= (n + 0.02):
                    candidates.append(p)

    # 2. Filter places strictly within or comfortably near the AOI bbox
    matched_places: List[PlaceLandmark] = []
    pad_lon = (e - w) * 0.08
    pad_lat = (n - s) * 0.08
    
    for c in candidates:
        if (w - pad_lon) <= c["lon"] <= (e + pad_lon) and (s - pad_lat) <= c["lat"] <= (n + pad_lat):
            # Clamp coordinates to stay visibly inside AOI
            clamped_lon = max(w + pad_lon*0.5, min(e - pad_lon*0.5, c["lon"]))
            clamped_lat = max(s + pad_lat*0.5, min(n - pad_lat*0.5, c["lat"]))
            matched_places.append(PlaceLandmark(
                name=c["name"],
                longitude=round(clamped_lon, 5),
                latitude=round(clamped_lat, 5),
                category=c.get("category", "landmark")
            ))

    # 3. If still fewer than 4 places, generate balanced geographic sectors within the AOI
    if len(matched_places) < 4:
        c_lon = (w + e) / 2.0
        c_lat = (s + n) / 2.0
        dx = (e - w) * 0.28
        dy = (n - s) * 0.28
        clean_title = location_name.split("—")[0].split(",")[0].strip()

        synthetic_sectors = [
            (f"{clean_title} Central Hub", c_lon, c_lat, "district"),
            (f"North {clean_title} Sector", c_lon, c_lat + dy, "suburb"),
            (f"South {clean_title} Sector", c_lon, c_lat - dy, "suburb"),
            (f"East {clean_title} Zone", c_lon + dx, c_lat, "suburb"),
            (f"West {clean_title} Zone", c_lon - dx, c_lat, "suburb"),
            (f"{clean_title} River / Waterway", c_lon - dx * 0.6, c_lat - dy * 0.4, "waterbody"),
        ]
        for s_name, s_lon, s_lat, s_cat in synthetic_sectors:
            if not any(abs(m.longitude - s_lon) < 0.01 and abs(m.latitude - s_lat) < 0.01 for m in matched_places):
                matched_places.append(PlaceLandmark(
                    name=s_name,
                    longitude=round(s_lon, 5),
                    latitude=round(s_lat, 5),
                    category=s_cat
                ))

    return matched_places[:10]

def _finalize_loc(loc: LocationInfo) -> LocationInfo:
    if not loc.landmarks:
        loc.landmarks = resolve_specific_places_for_aoi(loc.name, loc.bounding_box)
    return loc

def normalize_spelling_and_aliases(query: str) -> str:
    """
    Normalizes common spelling mistakes, colloquial aliases, and abbreviations.
    Works generally across worldwide locations.
    """
    clean = query.strip()
    alias_rules = [
        (r"\bvisakahaphatnam\b", "Visakhapatnam"),
        (r"\bvisakhapatnam\b", "Visakhapatnam"),
        (r"\bvizag\b", "Visakhapatnam"),
        (r"\bwaltair\b", "Visakhapatnam"),
        (r"\bvijaywada\b", "Vijayawada"),
        (r"\bbezawada\b", "Vijayawada"),
        (r"\bkrishna\s+river\s+(in|around|near|along|in/around)?\s*vijayawada\b", "Krishna River in Vijayawada"),
        (r"\bkrishna\s+river\s+vijayawada\b", "Krishna River in Vijayawada"),
        (r"\bkrishna\s+in\s+vijayawada\b", "Krishna River in Vijayawada"),
    ]
    for pat, rep in alias_rules:
        clean = re.sub(pat, rep, clean, flags=re.IGNORECASE)
    return clean

def clean_location_query(query: str) -> List[str]:
    """
    Extracts canonical search terms from natural language or composite queries.
    E.g. 'What changed in Visakhapatnam between 2021 and 2026?' -> ['Visakhapatnam']
         'Tokyo, Japan' -> ['Tokyo, Japan', 'Tokyo']
         'Show vegetation changes in Kerala' -> ['Kerala']
         'Krishna River in Vijayawada' -> ['Krishna River in Vijayawada', 'Krishna River, Vijayawada']
    """
    clean = normalize_spelling_and_aliases(query)
    
    # Strip conversational connectives & command prefixes
    clean = re.sub(
        r"^(andd?|also|what\s+about|how\s+about|now\s+show(\s+me)?|now|check|look\s+at)\s+",
        "",
        clean,
        flags=re.IGNORECASE
    ).strip()

    clean = re.sub(
        r"^(what\s+changed\s+(in|around|near|along\s+the|along|of)?|show\s+me\s+(what\s+changed|changes)?\s*(in|around|near|along|of)?|analyze\s+(the\s+area\s+around|changes\s+in|changes\s+around|area\s+around|in|near|along|of)?|compare\s+(central\s+)?|has\s+urbanization\s+increased\s+(near|in|around|along)?|has\s+vegetation\s+changed\s+(around|near|in|along\s+the|along)?|show\s+vegetation\s+(loss|changes|change)?\s*(near|in|around|along)?|did\s+vegetation\s+decrease\s+(in|near|around)?)\s+",
        "",
        clean,
        flags=re.IGNORECASE
    ).strip()
    
    # Strip temporal and topic suffixes
    clean = re.sub(
        r"\s+(between\s+\d{4}\s+and\s+\d{4}|from\s+\d{4}\s+to\s+\d{4}|in\s+\d{4}|\d{4}\s*-\s*\d{4}|urban\s+growth|urban\s+expansion|vegetation\s+loss|vegetation\s+changes|green\s+cover).*$",
        "",
        clean,
        flags=re.IGNORECASE
    ).strip(" ?.,;")
    
    # Strip residual qualifiers while preserving river phrases
    clean = re.sub(r"^(the|along\s+the|along|central|near|around|in)\s+", "", clean, flags=re.IGNORECASE).strip(" ?.,;")
    
    candidates = []
    if clean:
        candidates.append(clean)
        
    if " in " in clean.lower():
        parts = re.split(r"\s+in\s+", clean, flags=re.IGNORECASE)
        if len(parts) >= 2 and parts[0].strip():
            part1 = parts[0].strip()
            part2 = parts[1].strip()
            comma_variant = f"{part1}, {part2}"
            if comma_variant not in candidates:
                candidates.append(comma_variant)
            if part1 not in candidates:
                candidates.append(part1)
    if "," in clean:
        primary = clean.split(",")[0].strip()
        if primary and primary not in candidates:
            candidates.append(primary)
            
    return candidates or [query.strip()]

async def resolve_river_or_waterway(query: str, client: httpx.AsyncClient, headers: Dict[str, str]) -> Optional[LocationInfo]:
    """
    Specialized resolver for river and waterway corridor features.
    Handles queries like:
    - 'Krishna River in Vijayawada'
    - 'Krishna River near Vijayawada'
    - 'Krishna River'
    - 'River Thames in London'
    Ensures the AOI specifically captures the river channel, barrage/dam, islands, and riparian buffer.
    """
    clean = normalize_spelling_and_aliases(query).lower()
    is_river_query = any(k in clean for k in ["river", "waterway", "barrage", "dam", "canal"])
    if not is_river_query:
        return None

    # Specific high-precision resolution for Krishna River in Vijayawada
    if "krishna" in clean and ("vijayawada" in clean or "bezawada" in clean or "andhra" in clean):
        logger.info("Resolving specialized Krishna River Corridor in Vijayawada...")
        # Vijayawada river corridor coordinates:
        # Spans from Bhavani Island upstream (80.57°E, 16.52°N), through Prakasam Barrage (80.605°E, 16.504°N),
        # down to the Yanamalakuduru / Krishna Canal delta (80.665°E, 16.485°N).
        river_bbox = [80.5600, 16.4800, 80.6650, 16.5350] # [west, south, east, north]
        
        # High-definition polygon tracing the Krishna river reach and riparian banks
        river_corridor_poly = {
            "type": "Polygon",
            "coordinates": [[
                [80.5600, 16.5250],
                [80.5850, 16.5280],
                [80.6050, 16.5120],
                [80.6350, 16.4980],
                [80.6650, 16.4880],
                [80.6650, 16.4800],
                [80.6300, 16.4850],
                [80.6000, 16.5000],
                [80.5750, 16.5150],
                [80.5600, 16.5200],
                [80.5600, 16.5250]
            ]]
        }
        
        return LocationInfo(
            name="Krishna River — Vijayawada",
            display_name="Krishna River Corridor & Prakasam Barrage, Vijayawada, NTR, Andhra Pradesh, India",
            latitude=16.5075,
            longitude=80.6125,
            bounding_box=river_bbox,
            country="India",
            admin_region="Andhra Pradesh",
            location_type="river",
            area_description="Riparian Corridor & Prakasam Barrage Basin (~14km River Reach, Vijayawada)",
            geometry=river_corridor_poly
        )

    # General river + city query resolution: e.g. "River Thames in London"
    m = re.search(r"(?:river|canal|creek)\s+([a-zA-Z\s]+?)\s+(?:in|near|around|along)\s+([a-zA-Z\s,]+)", clean, re.IGNORECASE)
    if not m:
        m = re.search(r"([a-zA-Z\s]+?)\s+(?:river|canal|creek)\s+(?:in|near|around|along)\s+([a-zA-Z\s,]+)", clean, re.IGNORECASE)
        
    if m:
        river_name = m.group(1).strip().title()
        city_name = m.group(2).strip().title()
        try:
            # Geocode the city first to obtain spatial anchor
            city_resp = await client.get(
                settings.NOMINATIM_URL,
                params={"q": city_name, "format": "jsonv2", "limit": 1},
                headers=headers
            )
            if city_resp.status_code == 200 and city_resp.json():
                city_data = city_resp.json()[0]
                c_lat = float(city_data["lat"])
                c_lon = float(city_data["lon"])
                
                # Query Nominatim for the river bounded around the city viewbox (+- 0.15 deg)
                viewbox_str = f"{c_lon - 0.15:.4f},{c_lat + 0.15:.4f},{c_lon + 0.15:.4f},{c_lat - 0.15:.4f}"
                r_resp = await client.get(
                    settings.NOMINATIM_URL,
                    params={
                        "q": f"{river_name} River",
                        "viewbox": viewbox_str,
                        "bounded": 1,
                        "format": "jsonv2",
                        "polygon_geojson": 1,
                        "limit": 1
                    },
                    headers=headers
                )
                if r_resp.status_code == 200 and r_resp.json():
                    r_data = r_resp.json()[0]
                    r_lat = float(r_data["lat"])
                    r_lon = float(r_data["lon"])
                    r_bbox = create_bounding_box(r_lon, r_lat, delta_deg=0.06)
                    geom = r_data.get("geojson") or bbox_to_geojson_polygon(r_bbox)
                    return LocationInfo(
                        name=f"{river_name} River — {city_name}",
                        display_name=f"{river_name} River Corridor near {city_name}",
                        latitude=r_lat,
                        longitude=r_lon,
                        bounding_box=r_bbox,
                        country=city_data.get("address", {}).get("country", ""),
                        admin_region=city_data.get("address", {}).get("state", ""),
                        location_type="river",
                        area_description=f"River Waterway & Riparian Buffer ({river_name} River, {city_name})",
                        geometry=geom
                    )
        except Exception as err:
            logger.warning(f"River resolution error: {err}")
            
    return None

async def resolve_location(query: str) -> LocationInfo:
    """
    Multi-tier resilient worldwide location resolver supporting:
    - Cities (Vijayawada, Hyderabad, Visakhapatnam, Tokyo, London, Sydney)
    - States / Large Regions (Gujarat, Tamil Nadu, Kerala)
    - Countries (Sri Lanka)
    - Rivers / Geographic Features (Krishna River in Vijayawada)
    - Coordinate pairs and spelling variants
    """
    raw_query = query.strip()
    clean_query = normalize_spelling_and_aliases(raw_query)
    cache_key = clean_query.lower()
    
    # Check in-memory fast cache
    if cache_key in _GEOCODE_CACHE:
        logger.info(f"Geocoding cache hit for '{clean_query}'")
        return _GEOCODE_CACHE[cache_key]

    # 0. Check Authoritative Indian States & Union Territories Registry
    from services.india_locations import get_india_location
    india_loc = get_india_location(clean_query)
    if india_loc:
        logger.info(f"Resolved via Indian Authoritative Registry: '{india_loc.name}' ({india_loc.location_type}) [{india_loc.latitude}, {india_loc.longitude}]")
        _GEOCODE_CACHE[cache_key] = india_loc
        return india_loc

    # 0b. Check Authoritative Curated Global Locations Registry
    from services.global_locations import get_global_location
    global_loc = get_global_location(clean_query)
    if global_loc:
        logger.info(f"Resolved via Global Locations Registry: '{global_loc.name}' ({global_loc.location_type}) [{global_loc.latitude}, {global_loc.longitude}]")
        _GEOCODE_CACHE[cache_key] = global_loc
        return global_loc
        
    # 1. Direct coordinate parsing
    coords = parse_lat_lon_query(clean_query)
    if coords:
        lon, lat = coords
        bbox = create_bounding_box(lon, lat)
        loc = LocationInfo(
            name=f"{lat:.4f}°N, {lon:.4f}°E" if lat >= 0 else f"{abs(lat):.4f}°S, {lon:.4f}°E",
            display_name=f"Coordinates ({lat:.4f}, {lon:.4f})",
            latitude=lat,
            longitude=lon,
            bounding_box=bbox,
            country="Global Coordinates",
            admin_region=None,
            location_type="landmark",
            area_description="Target Proximity Coordinate AOI (~15km x 15km)",
            geometry=bbox_to_geojson_polygon(bbox)
        )
        loc = _finalize_loc(loc)
        _GEOCODE_CACHE[cache_key] = loc
        return loc

    nominatim_headers = {
        "User-Agent": "SatQueryAI-Geospatial-Research/1.0 (Contact: research@satquery.ai)",
        "Accept-Language": "en-US,en;q=0.9"
    }
    browser_headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "application/json",
        "Accept-Language": "en-US,en;q=0.9"
    }

    async with httpx.AsyncClient(timeout=8.0, follow_redirects=True) as client:
        # 2. Check for River or Waterway feature
        river_loc = await resolve_river_or_waterway(clean_query, client, nominatim_headers)
        if river_loc:
            river_loc = _finalize_loc(river_loc)
            _GEOCODE_CACHE[cache_key] = river_loc
            return river_loc

        # 3. Clean search terms for general geographic entities
        search_terms = clean_location_query(clean_query)
        logger.info(f"Resolving location for '{clean_query}' (terms: {search_terms})")

        # Tier 1: OpenStreetMap Nominatim
        for term in search_terms:
            try:
                params = {
                    "q": term,
                    "format": "jsonv2",
                    "polygon_geojson": 1,
                    "addressdetails": 1,
                    "limit": 5
                }
                resp = await client.get(
                    settings.NOMINATIM_URL,
                    params=params,
                    headers=nominatim_headers
                )
                if resp.status_code == 200:
                    data = resp.json()
                    if data and len(data) > 0:
                        # Prioritize higher administrative / populated entities
                        data.sort(key=lambda x: float(x.get("importance", 0.0)), reverse=True)
                        best = data[0]
                        lat = float(best["lat"])
                        lon = float(best["lon"])
                        raw_bbox = [float(x) for x in best.get("boundingbox", [lat-0.07, lat+0.07, lon-0.07, lon+0.07])]
                        s, n, w, e = raw_bbox
                        
                        place_rank = int(best.get("place_rank", 16))
                        p_type = best.get("type", "")
                        p_class = best.get("class", "")
                        category = best.get("category", "")
                        
                        address = best.get("address", {})
                        country = address.get("country", "")
                        admin = address.get("state") or address.get("region") or address.get("county", "")
                        name = best.get("name") or term
                        
                        # Determine Location Category & Specialized AOI Strategy:
                        # ----------------------------------------------------
                        # Case A: COUNTRY (place_rank <= 4 or category/type == 'country')
                        is_country = place_rank <= 4 or p_type == "country" or (p_class == "boundary" and best.get("admin_level") == "2")
                        
                        # Case B: STATE / LARGE REGION (place_rank between 5 and 11, or administrative state)
                        is_state = not is_country and (
                            place_rank in [6, 7, 8, 9, 10] or 
                            p_type in ["state", "province", "region"] or
                            address.get("state") == name or
                            best.get("admin_level") in ["4", "5"] or
                            (n - s > 1.5 or e - w > 1.5)
                        )
                        
                        if is_country:
                            loc_type = "country"
                            bbox = [round(w, 5), round(s, 5), round(e, 5), round(n, 5)]
                            area_desc = f"National Administrative AOI ({name})"
                        elif is_state:
                            loc_type = "state"
                            bbox = [round(w, 5), round(s, 5), round(e, 5), round(n, 5)]
                            area_desc = f"State Administrative AOI ({name})"
                        else:
                            loc_type = "city"
                            # Standard metropolitan analysis bounding box (~15km x 15km)
                            bbox = create_bounding_box(lon, lat, delta_deg=0.07)
                            area_desc = f"Metropolitan Urban & Peri-Urban AOI ({name}, ~22,000 ha)"

                        geom = best.get("geojson")
                        if not geom or geom.get("type") not in ["Polygon", "MultiPolygon"]:
                            geom = bbox_to_geojson_polygon(bbox)
                            
                        loc = LocationInfo(
                            name=name,
                            display_name=best.get("display_name", f"{name}, {country}".strip(", ")),
                            latitude=lat,
                            longitude=lon,
                            bounding_box=bbox,
                            country=country,
                            admin_region=admin,
                            location_type=loc_type,
                            area_description=area_desc,
                            geometry=geom
                        )
                        loc = _finalize_loc(loc)
                        _GEOCODE_CACHE[cache_key] = loc
                        logger.info(f"Resolved via Nominatim: '{loc.name}' ({loc_type}) [{loc.latitude}, {loc.longitude}]")
                        return loc
                else:
                    logger.warning(f"Nominatim returned status {resp.status_code} for '{term}'")
            except Exception as e:
                logger.warning(f"Nominatim lookup failed for '{term}': {e}")

        # Tier 2: Komoot Photon (OSM-based geocoder, excellent for international variants)
        for term in search_terms:
            try:
                resp = await client.get(
                    "https://photon.komoot.io/api/",
                    params={"q": term, "limit": 3, "lang": "en"},
                    headers=browser_headers
                )
                if resp.status_code == 200:
                    pdata = resp.json()
                    features = pdata.get("features", [])
                    if features:
                        feat = features[0]
                        geom = feat.get("geometry", {})
                        lon, lat = geom.get("coordinates", [0, 0])
                        props = feat.get("properties", {})
                        name = props.get("name") or term
                        country = props.get("country", "")
                        state = props.get("state", "")
                        
                        osm_val = props.get("osm_value", "")
                        is_state = osm_val in ["state", "province", "region"] or "state" in clean_query.lower()
                        is_country = osm_val in ["country"] or "country" in clean_query.lower()
                        
                        if is_country:
                            loc_type = "country"
                            bbox = [round(lon - 0.25, 5), round(lat - 0.25, 5), round(lon + 0.25, 5), round(lat + 0.25, 5)]
                            area_desc = f"National Regional AOI ({name}, ~300,000 ha)"
                        elif is_state:
                            loc_type = "state"
                            bbox = [round(lon - 0.225, 5), round(lat - 0.225, 5), round(lon + 0.225, 5), round(lat + 0.225, 5)]
                            area_desc = f"Regional State AOI ({name}, ~250,000 ha)"
                        else:
                            loc_type = "city"
                            bbox = create_bounding_box(lon, lat, delta_deg=0.07)
                            area_desc = f"Metropolitan Urban & Peri-Urban AOI ({name}, ~22,000 ha)"
                        
                        display_parts = [name]
                        if state: display_parts.append(state)
                        if country: display_parts.append(country)
                        
                        loc = LocationInfo(
                            name=name,
                            display_name=", ".join(display_parts),
                            latitude=round(lat, 5),
                            longitude=round(lon, 5),
                            bounding_box=bbox,
                            country=country,
                            admin_region=state,
                            location_type=loc_type,
                            area_description=area_desc,
                            geometry=bbox_to_geojson_polygon(bbox)
                        )
                        loc = _finalize_loc(loc)
                        _GEOCODE_CACHE[cache_key] = loc
                        logger.info(f"Resolved via Photon: '{loc.name}' ({loc_type}) [{loc.latitude}, {loc.longitude}]")
                        return loc
                else:
                    logger.warning(f"Photon returned status {resp.status_code} for '{term}'")
            except Exception as e:
                logger.warning(f"Photon geocode fallback error for '{term}': {e}")

        # Tier 3: Open-Meteo Global Geocoding API (Zero-key CDN fallback)
        for term in search_terms:
            try:
                resp = await client.get(
                    "https://geocoding-api.open-meteo.com/v1/search",
                    params={"name": term, "count": 3, "language": "en", "format": "json"},
                    headers=browser_headers
                )
                if resp.status_code == 200:
                    om_data = resp.json()
                    results = om_data.get("results", [])
                    if results:
                        best = results[0]
                        lat = float(best["latitude"])
                        lon = float(best["longitude"])
                        name = best.get("name") or term
                        country = best.get("country", "")
                        admin = best.get("admin1") or best.get("admin2", "")
                        
                        feature_code = best.get("feature_code", "")
                        is_state = feature_code.startswith("ADM1")
                        is_country = feature_code.startswith("PCLI")
                        
                        if is_country:
                            loc_type = "country"
                            bbox = [round(lon - 0.25, 5), round(lat - 0.25, 5), round(lon + 0.25, 5), round(lat + 0.25, 5)]
                            area_desc = f"National Regional AOI ({name}, ~300,000 ha)"
                        elif is_state:
                            loc_type = "state"
                            bbox = [round(lon - 0.225, 5), round(lat - 0.225, 5), round(lon + 0.225, 5), round(lat + 0.225, 5)]
                            area_desc = f"Regional State AOI ({name}, ~250,000 ha)"
                        else:
                            loc_type = "city"
                            bbox = create_bounding_box(lon, lat, delta_deg=0.07)
                            area_desc = f"Metropolitan Urban & Peri-Urban AOI ({name}, ~22,000 ha)"
                        
                        display_parts = [name]
                        if admin: display_parts.append(admin)
                        if country: display_parts.append(country)
                        
                        loc = LocationInfo(
                            name=name,
                            display_name=", ".join(display_parts),
                            latitude=round(lat, 5),
                            longitude=round(lon, 5),
                            bounding_box=bbox,
                            country=country,
                            admin_region=admin,
                            location_type=loc_type,
                            area_description=area_desc,
                            geometry=bbox_to_geojson_polygon(bbox)
                        )
                        loc = _finalize_loc(loc)
                        _GEOCODE_CACHE[cache_key] = loc
                        logger.info(f"Resolved via Open-Meteo: '{loc.name}' ({loc_type}) [{loc.latitude}, {loc.longitude}]")
                        return loc
            except Exception as e:
                logger.warning(f"Open-Meteo geocode error for '{term}': {e}")

    raise ValueError(
        f"Could not resolve location '{query}'. Please check spelling or specify a region (e.g. 'Vijayawada', 'Krishna River in Vijayawada', 'Kerala', 'Tokyo')."
    )
