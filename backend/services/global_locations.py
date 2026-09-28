import math
import re
from typing import List, Dict, Any, Optional
from models.schemas import LocationInfo, PlaceLandmark

GLOBAL_CATALOG: List[Dict[str, Any]] = [
    # -------------------------------------------------------------------------
    # 🏙 URBAN / MEGACITIES
    # -------------------------------------------------------------------------
    {
        "id": "dubai",
        "name": "Dubai",
        "display_name": "Dubai, United Arab Emirates",
        "country": "United Arab Emirates",
        "target_type": "city",
        "category": "urban",
        "flag": "🇦🇪",
        "lat": 25.2048,
        "lon": 55.2708,
        "bbox": [55.1000, 24.9500, 55.4500, 25.3500],
        "tag": "GLOBAL MEGACITY",
        "focus": "Urban expansion, Palm Jumeirah coastal modifications, Downtown towers & desert greening",
        "description": "Metropolitan Urban AOI (Dubai & Arabian Gulf Coastal Buffer, UAE)",
        "landmarks": [
            {"name": "Burj Khalifa & Downtown", "lon": 55.2744, "lat": 25.1972, "category": "landmark"},
            {"name": "Palm Jumeirah Archipelago", "lon": 55.1360, "lat": 25.1124, "category": "landmark"},
            {"name": "Dubai Creek Waterway", "lon": 55.3270, "lat": 25.2580, "category": "waterbody"},
            {"name": "Dubai Marina Sector", "lon": 55.1403, "lat": 25.0805, "category": "suburb"},
            {"name": "Business Bay Canal Reach", "lon": 55.2620, "lat": 25.1850, "category": "suburb"}
        ]
    },
    {
        "id": "tokyo",
        "name": "Tokyo",
        "display_name": "Tokyo, Japan",
        "country": "Japan",
        "target_type": "city",
        "category": "urban",
        "flag": "🇯🇵",
        "lat": 35.6895,
        "lon": 139.6917,
        "bbox": [139.5500, 35.5500, 139.9000, 35.8500],
        "tag": "GLOBAL MEGACITY",
        "focus": "High-density metropolitan development, Tokyo Bay land reclamation & urban park canopies",
        "description": "Metropolitan Urban AOI (Greater Tokyo & Tokyo Bay Coastal Zone, Japan)",
        "landmarks": [
            {"name": "Tokyo Station & Marunouchi", "lon": 139.7671, "lat": 35.6812, "category": "district"},
            {"name": "Shinjuku Skyscraper Center", "lon": 139.6917, "lat": 35.6895, "category": "district"},
            {"name": "Odaiba Coastal Sector", "lon": 139.7750, "lat": 35.6280, "category": "suburb"},
            {"name": "Sumida River Corridor", "lon": 139.7900, "lat": 35.6980, "category": "waterbody"},
            {"name": "Imperial Palace Gardens", "lon": 139.7528, "lat": 35.6852, "category": "landmark"}
        ]
    },
    {
        "id": "singapore",
        "name": "Singapore",
        "display_name": "Singapore",
        "country": "Singapore",
        "target_type": "city",
        "category": "urban",
        "flag": "🇸🇬",
        "lat": 1.3521,
        "lon": 103.8198,
        "bbox": [103.6000, 1.2000, 104.0500, 1.4800],
        "tag": "GARDEN CITY",
        "focus": "Biophilic city greening, Jurong Island coastal reclamation & Marina Bay water catchment",
        "description": "Island City-State AOI (Singapore & Coastal Straits Buffer)",
        "landmarks": [
            {"name": "Marina Bay & Gardens by the Bay", "lon": 103.8636, "lat": 1.2816, "category": "landmark"},
            {"name": "Jurong Industrial Estuary", "lon": 103.7000, "lat": 1.2800, "category": "district"},
            {"name": "Singapore River Reach", "lon": 103.8500, "lat": 1.2900, "category": "waterbody"},
            {"name": "Central Catchment Nature Reserve", "lon": 103.8100, "lat": 1.3600, "category": "landmark"},
            {"name": "Changi Coastal Infrastructure", "lon": 103.9900, "lat": 1.3644, "category": "suburb"}
        ]
    },
    {
        "id": "new_york",
        "name": "New York City",
        "display_name": "New York City, USA",
        "country": "United States",
        "target_type": "city",
        "category": "urban",
        "flag": "🇺🇸",
        "lat": 40.7128,
        "lon": -74.0060,
        "bbox": [-74.2600, 40.4900, -73.7000, 40.9200],
        "tag": "GLOBAL METROPOLIS",
        "focus": "Hudson-East River waterfront resilience, Central Park canopy health & urban density",
        "description": "Metropolitan Urban AOI (Five Boroughs & New York Harbor, USA)",
        "landmarks": [
            {"name": "Manhattan Midtown Center", "lon": -73.9855, "lat": 40.7580, "category": "district"},
            {"name": "Central Park Canopy", "lon": -73.9665, "lat": 40.7829, "category": "landmark"},
            {"name": "Hudson River Corridor", "lon": -74.0150, "lat": 40.7300, "category": "waterbody"},
            {"name": "Brooklyn DUMBO Waterfront", "lon": -73.9900, "lat": 40.7030, "category": "suburb"},
            {"name": "Governor's Island Buffer", "lon": -74.0180, "lat": 40.6900, "category": "landmark"}
        ]
    },
    {
        "id": "shanghai",
        "name": "Shanghai",
        "display_name": "Shanghai, China",
        "country": "China",
        "target_type": "city",
        "category": "urban",
        "flag": "🇨🇳",
        "lat": 31.2304,
        "lon": 121.4737,
        "bbox": [121.2000, 31.0000, 121.7500, 31.4500],
        "tag": "RIVER DELTA METROPOLIS",
        "focus": "Pudong urban expansion, Yangtze river estuary sediment dynamics & port industrialization",
        "description": "Metropolitan Urban AOI (Huangpu River & Yangtze Delta Reach, Shanghai, China)",
        "landmarks": [
            {"name": "Lujiazui Financial Center (Pudong)", "lon": 121.5030, "lat": 31.2400, "category": "district"},
            {"name": "The Bund Historic Waterfront", "lon": 121.4900, "lat": 31.2400, "category": "landmark"},
            {"name": "Huangpu River Channel", "lon": 121.4950, "lat": 31.2300, "category": "waterbody"},
            {"name": "Yangshan Deepwater Terminal", "lon": 121.6500, "lat": 31.1000, "category": "suburb"}
        ]
    },
    {
        "id": "los_angeles",
        "name": "Los Angeles",
        "display_name": "Los Angeles, USA",
        "country": "United States",
        "target_type": "city",
        "category": "urban",
        "flag": "🇺🇸",
        "lat": 34.0522,
        "lon": -118.2437,
        "bbox": [-118.6700, 33.7000, -118.1500, 34.3400],
        "tag": "PACIFIC METROPOLIS",
        "focus": "Metropolitan sprawl, Mediterranean chaparral wildfire zones & port infrastructure",
        "description": "Metropolitan Urban AOI (Los Angeles Basin & Coastal Santa Monica Bay, USA)",
        "landmarks": [
            {"name": "Downtown Los Angeles Hub", "lon": -118.2468, "lat": 34.0537, "category": "district"},
            {"name": "Griffith Park Mountain Buffer", "lon": -118.2940, "lat": 34.1365, "category": "landmark"},
            {"name": "Port of Los Angeles", "lon": -118.2600, "lat": 33.7400, "category": "suburb"},
            {"name": "Santa Monica Coastal Strip", "lon": -118.4900, "lat": 34.0150, "category": "waterbody"}
        ]
    },
    {
        "id": "bangkok",
        "name": "Bangkok",
        "display_name": "Bangkok, Thailand",
        "country": "Thailand",
        "target_type": "city",
        "category": "urban",
        "flag": "🇹🇭",
        "lat": 13.7563,
        "lon": 100.5018,
        "bbox": [100.3500, 13.5500, 100.8500, 13.9500],
        "tag": "RIVER DELTA CAPITAL",
        "focus": "Chao Phraya delta flood dynamics, rapid urban expansion & agricultural conversion",
        "description": "Metropolitan Urban AOI (Chao Phraya River Basin & Gulf of Thailand Coastal Buffer)",
        "landmarks": [
            {"name": "Grand Palace Cultural Sanctuary", "lon": 100.4913, "lat": 13.7500, "category": "landmark"},
            {"name": "Chao Phraya Main Channel", "lon": 100.5100, "lat": 13.7300, "category": "waterbody"},
            {"name": "Sukhumvit Commercial Spine", "lon": 100.5600, "lat": 13.7400, "category": "district"},
            {"name": "Bang Kachao Green Lung", "lon": 100.5700, "lat": 13.6950, "category": "landmark"}
        ]
    },

    # -------------------------------------------------------------------------
    # 🌳 FORESTS / BIOMES
    # -------------------------------------------------------------------------
    {
        "id": "amazon_basin",
        "name": "Amazon Basin",
        "display_name": "Amazon Basin, South America",
        "country": "Brazil",
        "target_type": "region",
        "category": "forest",
        "flag": "🇧🇷",
        "lat": -4.0000,
        "lon": -64.0000,
        "bbox": [-70.0000, -7.0000, -58.0000, -1.0000],
        "tag": "EQUATORIAL RAINFOREST",
        "focus": "Primary rainforest canopy loss, agricultural arc of deforestation & river sediment shifts",
        "description": "Continental Biome AOI (Central Amazon River Basin & Rainforest Core, Brazil)",
        "landmarks": [
            {"name": "Rio Negro & Amazon Confluence", "lon": -60.0200, "lat": -3.1300, "category": "waterbody"},
            {"name": "Anavilhanas Archipelago", "lon": -60.7500, "lat": -2.7500, "category": "waterbody"},
            {"name": "Jau National Park Core", "lon": -62.5000, "lat": -2.3000, "category": "landmark"},
            {"name": "Arc of Deforestation Front", "lon": -62.0000, "lat": -5.5000, "category": "district"}
        ]
    },
    {
        "id": "congo_basin",
        "name": "Congo Basin",
        "display_name": "Congo Basin, Central Africa",
        "country": "DR Congo",
        "target_type": "region",
        "category": "forest",
        "flag": "🇨🇩",
        "lat": 0.0000,
        "lon": 21.0000,
        "bbox": [16.0000, -3.0000, 26.0000, 3.0000],
        "tag": "PEATLAND RAINFOREST",
        "focus": "Dense equatorial peatland forest preservation, selective logging & riverine hydrology",
        "description": "Continental Forest AOI (Congo River Meander & Cuvette Centrale Peatlands)",
        "landmarks": [
            {"name": "Congo River Main Flow", "lon": 20.5000, "lat": 0.5000, "category": "waterbody"},
            {"name": "Salonga National Park North", "lon": 21.5000, "lat": -1.5000, "category": "landmark"},
            {"name": "Lac Tumba Ecological Basin", "lon": 18.0000, "lat": -0.8000, "category": "waterbody"},
            {"name": "Mbandaka River Port", "lon": 18.2600, "lat": 0.0400, "category": "district"}
        ]
    },

    # -------------------------------------------------------------------------
    # 💧 WATER / INLAND SEAS / DELTAS
    # -------------------------------------------------------------------------
    {
        "id": "aral_sea",
        "name": "Aral Sea",
        "display_name": "Aral Sea, Central Asia",
        "country": "Kazakhstan/Uzbekistan",
        "target_type": "lake",
        "category": "water",
        "flag": "🇰🇿",
        "lat": 45.2500,
        "lon": 59.7500,
        "bbox": [58.0000, 44.0000, 61.5000, 46.5000],
        "tag": "INLAND ENDORHEIC BASIN",
        "focus": "Long-term water surface desiccation, Aralkum desertification & North Aral water recovery",
        "description": "Endorheic Lake AOI (North Aral Dam, South Basin Bed & Syr Darya Mouth)",
        "landmarks": [
            {"name": "Kokaral Dike Reservoir", "lon": 60.7500, "lat": 46.1000, "category": "waterbody"},
            {"name": "Syr Darya River Delta", "lon": 61.2000, "lat": 46.2000, "category": "waterbody"},
            {"name": "Vozrozhdeniya Former Island", "lon": 59.3000, "lat": 45.1000, "category": "landmark"},
            {"name": "Aralsk Historic Harbor Bed", "lon": 61.6600, "lat": 46.8000, "category": "district"}
        ]
    },
    {
        "id": "nile_delta",
        "name": "Nile Delta",
        "display_name": "Nile Delta, Egypt",
        "country": "Egypt",
        "target_type": "delta",
        "category": "water",
        "flag": "🇪🇬",
        "lat": 30.9000,
        "lon": 31.0000,
        "bbox": [29.8000, 30.2000, 32.2000, 31.6000],
        "tag": "MEDITERRANEAN DELTA",
        "focus": "Alluvial cropland intensification, Mediterranean coastal erosion & Cairo peri-urban sprawl",
        "description": "River Delta AOI (Lower Nile Alluvial Fan & Mediterranean Coastal Fringe, Egypt)",
        "landmarks": [
            {"name": "Rosetta Promontory Branch", "lon": 30.4000, "lat": 31.4500, "category": "waterbody"},
            {"name": "Damietta Promontory Branch", "lon": 31.8500, "lat": 31.5000, "category": "waterbody"},
            {"name": "Lake Manzala Lagoon", "lon": 31.9000, "lat": 31.2500, "category": "waterbody"},
            {"name": "Tanta Central Agricultural Hub", "lon": 31.0000, "lat": 30.7900, "category": "district"}
        ]
    },
    {
        "id": "mekong_delta",
        "name": "Mekong Delta",
        "display_name": "Mekong Delta, Vietnam",
        "country": "Vietnam",
        "target_type": "delta",
        "category": "water",
        "flag": "🇻🇳",
        "lat": 10.0000,
        "lon": 105.8000,
        "bbox": [104.8000, 9.2000, 106.8000, 10.8000],
        "tag": "RICE BOWL DELTA",
        "focus": "Mangrove restoration, triple-crop rice paddy inundation & coastal saltwater intrusion",
        "description": "River Delta AOI (Nine Dragons Estuary & Ca Mau Mangrove Peninsula, Vietnam)",
        "landmarks": [
            {"name": "Can Tho River Intersection", "lon": 105.7800, "lat": 10.0300, "category": "district"},
            {"name": "Tien Giang Main Channel", "lon": 106.3500, "lat": 10.3500, "category": "waterbody"},
            {"name": "Hau Giang Estuarine Mouth", "lon": 106.2500, "lat": 9.6500, "category": "waterbody"},
            {"name": "Ca Mau Mangrove Biosphere", "lon": 105.0000, "lat": 8.7000, "category": "landmark"}
        ]
    },

    # -------------------------------------------------------------------------
    # 🌊 COASTAL / ISLANDS / REEFS
    # -------------------------------------------------------------------------
    {
        "id": "great_barrier_reef",
        "name": "Great Barrier Reef",
        "display_name": "Great Barrier Reef, Australia",
        "country": "Australia",
        "target_type": "region",
        "category": "coastal",
        "flag": "🇦🇺",
        "lat": -17.5000,
        "lon": 147.0000,
        "bbox": [144.0000, -21.0000, 150.0000, -14.0000],
        "tag": "MARINE ECOSYSTEM",
        "focus": "Coral reef marine clarity, Queensland coastal runoff & lagoon bathymetry",
        "description": "Coral Reef Marine AOI (Cairns & Townsville Outer Reef Barrier, Coral Sea)",
        "landmarks": [
            {"name": "Arlington Reef Lagoon", "lon": 146.0500, "lat": -16.7200, "category": "waterbody"},
            {"name": "Whitsunday Passage Reach", "lon": 148.9500, "lat": -20.2500, "category": "waterbody"},
            {"name": "Ribbon Reef Northern System", "lon": 145.8000, "lat": -15.1000, "category": "landmark"},
            {"name": "Cairns Coastal Gateway", "lon": 145.7700, "lat": -16.9200, "category": "district"}
        ]
    },
    {
        "id": "maldives",
        "name": "Maldives",
        "display_name": "Maldives",
        "country": "Maldives",
        "target_type": "island_group",
        "category": "coastal",
        "flag": "🇲🇻",
        "lat": 3.2000,
        "lon": 73.2000,
        "bbox": [72.5000, -0.7000, 73.8000, 7.2000],
        "tag": "CORAL ATOLL NATION",
        "focus": "Coral atoll geomorphology, turquoise lagoon clarity & coastal elevation exposure",
        "description": "Archipelago AOI (North & South Male Atolls and Central Coral Ring)",
        "landmarks": [
            {"name": "Male Urban Island", "lon": 73.5093, "lat": 4.1755, "category": "district"},
            {"name": "Hulhumale Reclaimed City", "lon": 73.5350, "lat": 4.2150, "category": "suburb"},
            {"name": "Ari Atoll Outer Rim", "lon": 72.8500, "lat": 3.8000, "category": "landmark"},
            {"name": "Vaadhoo Bioluminescent Reach", "lon": 73.4500, "lat": 4.1200, "category": "waterbody"}
        ]
    },
    {
        "id": "san_francisco_bay",
        "name": "San Francisco Bay",
        "display_name": "San Francisco Bay, USA",
        "country": "United States",
        "target_type": "bay",
        "category": "coastal",
        "flag": "🇺🇸",
        "lat": 37.7500,
        "lon": -122.3500,
        "bbox": [-122.6000, 37.4000, -122.1000, 38.1000],
        "tag": "PACIFIC ESTUARY",
        "focus": "Estuary tidal salt marsh restoration, Silicon Valley urban expansion & port dynamics",
        "description": "Coastal Estuary AOI (San Francisco Bay, Golden Gate & South Bay Marshes)",
        "landmarks": [
            {"name": "Golden Gate Strait", "lon": -122.4783, "lat": 37.8199, "category": "waterbody"},
            {"name": "San Francisco Waterfront", "lon": -122.3900, "lat": 37.7900, "category": "district"},
            {"name": "Oakland Estuary Harbor", "lon": -122.2800, "lat": 37.7950, "category": "district"},
            {"name": "Alviso Salt Ponds Restoration", "lon": -122.0000, "lat": 37.4300, "category": "waterbody"}
        ]
    },

    # -------------------------------------------------------------------------
    # ❄ CLIMATE / GLACIERS / ICE
    # -------------------------------------------------------------------------
    {
        "id": "greenland",
        "name": "Greenland",
        "display_name": "Greenland",
        "country": "Greenland",
        "target_type": "territory",
        "category": "climate",
        "flag": "🇬🇱",
        "lat": 72.0000,
        "lon": -40.0000,
        "bbox": [-54.0000, 60.0000, -20.0000, 83.0000],
        "tag": "ARCTIC ICE SHEET",
        "focus": "Inland ice sheet albedo changes, outlet tidewater glacier calving & bedrock exposure",
        "description": "Arctic Ice Sheet AOI (Jakobshavn Glacier & Central Ice Plateau, Greenland)",
        "landmarks": [
            {"name": "Ilulissat Icefjord (Sermeq Kujalleq)", "lon": -50.5000, "lat": 69.1500, "category": "waterbody"},
            {"name": "Nuuk Coastal Fjord System", "lon": -51.7200, "lat": 64.1800, "category": "district"},
            {"name": "Summit Station Ice Core Core", "lon": -38.4500, "lat": 72.5800, "category": "landmark"},
            {"name": "Disko Island Basalt Cliffs", "lon": -53.5000, "lat": 69.8000, "category": "landmark"}
        ]
    },
    {
        "id": "swiss_alps",
        "name": "Swiss Alps",
        "display_name": "Swiss Alps, Switzerland",
        "country": "Switzerland",
        "target_type": "mountain",
        "category": "climate",
        "flag": "🇨🇭",
        "lat": 46.5000,
        "lon": 8.5000,
        "bbox": [6.8000, 45.8000, 10.5000, 47.0000],
        "tag": "ALPINE CRYO-SYSTEM",
        "focus": "Glacial terminus retreat, winter snowline elevation dynamics & subalpine vegetation expansion",
        "description": "Alpine Mountain AOI (Bernese Oberland, Aletsch Glacier & Rhone Valley)",
        "landmarks": [
            {"name": "Great Aletsch Glacier Basin", "lon": 8.0300, "lat": 46.5000, "category": "waterbody"},
            {"name": "Jungfraujoch Observatory", "lon": 7.9800, "lat": 46.5475, "category": "landmark"},
            {"name": "Matterhorn Glacial Cirque", "lon": 7.6586, "lat": 45.9763, "category": "landmark"},
            {"name": "Interlaken Valley Lakes", "lon": 7.8600, "lat": 46.6800, "category": "waterbody"}
        ]
    },

    # -------------------------------------------------------------------------
    # 🏜 DRYLAND / DESERT
    # -------------------------------------------------------------------------
    {
        "id": "sahara_desert",
        "name": "Sahara Desert",
        "display_name": "Sahara Desert, North Africa",
        "country": "North Africa",
        "target_type": "desert",
        "category": "dryland",
        "flag": "🌍",
        "lat": 24.0000,
        "lon": 10.0000,
        "bbox": [-5.0000, 18.0000, 25.0000, 30.0000],
        "tag": "HYPER-ARID ERG",
        "focus": "Sahelian desert boundary fluctuation, sand dune migration & oasis agriculture",
        "description": "Continental Hyper-Arid AOI (Grand Erg Oriental & Ahaggar Mountains)",
        "landmarks": [
            {"name": "Ahaggar Volcanic Massif", "lon": 5.5000, "lat": 23.3000, "category": "landmark"},
            {"name": "Grand Erg Oriental Sand Sea", "lon": 8.0000, "lat": 31.0000, "category": "district"},
            {"name": "Tassili n'Ajjer Plateau", "lon": 9.5000, "lat": 25.5000, "category": "landmark"},
            {"name": "Tamanrasset Oasis Crossroads", "lon": 5.5200, "lat": 22.7800, "category": "district"}
        ]
    },
    {
        "id": "las_vegas",
        "name": "Las Vegas",
        "display_name": "Las Vegas, USA",
        "country": "United States",
        "target_type": "city",
        "category": "dryland",
        "flag": "🇺🇸",
        "lat": 36.1699,
        "lon": -115.1398,
        "bbox": [-115.3500, 36.0000, -115.0000, 36.3000],
        "tag": "DESERT EXPANSION",
        "focus": "Mojave desert urban expansion, Lake Mead water shoreline shifts & residential turf reduction",
        "description": "Desert Urban AOI (Las Vegas Valley & Lake Mead Western Shoreline, USA)",
        "landmarks": [
            {"name": "Las Vegas Boulevard Strip", "lon": -115.1728, "lat": 36.1147, "category": "district"},
            {"name": "Lake Mead Boulder Basin", "lon": -114.7500, "lat": 36.0500, "category": "waterbody"},
            {"name": "Red Rock Canyon Escarpment", "lon": -115.4200, "lat": 36.1300, "category": "landmark"},
            {"name": "Summerlin West Masterplan", "lon": -115.3300, "lat": 36.1800, "category": "suburb"}
        ]
    },

    # -------------------------------------------------------------------------
    # 🇮🇳 PRESERVED KEY INDIAN CITIES / REGIONS
    # -------------------------------------------------------------------------
    {
        "id": "visakhapatnam",
        "name": "Visakhapatnam",
        "display_name": "Visakhapatnam, Andhra Pradesh, India",
        "country": "India",
        "target_type": "city",
        "category": "coastal",
        "flag": "🇮🇳",
        "lat": 17.6868,
        "lon": 83.2185,
        "bbox": [83.1500, 17.6000, 83.4000, 17.8500],
        "tag": "COASTAL INDUSTRIAL",
        "focus": "Port expansion, coastal hills preservation & peri-urban development",
        "description": "Coastal City AOI (Visakhapatnam Port & Rushikonda Shoreline, AP, India)",
        "landmarks": [
            {"name": "Dolphin's Nose Promontory", "lon": 83.2921, "lat": 17.6740, "category": "landmark"},
            {"name": "Rushikonda Tech Hill", "lon": 83.3850, "lat": 17.7820, "category": "suburb"},
            {"name": "Visakhapatnam Port Channel", "lon": 83.2900, "lat": 17.6900, "category": "waterbody"},
            {"name": "Kailasagiri Green Ridge", "lon": 83.3420, "lat": 17.7480, "category": "landmark"}
        ]
    },
    {
        "id": "vijayawada",
        "name": "Vijayawada",
        "display_name": "Vijayawada, Andhra Pradesh, India",
        "country": "India",
        "target_type": "city",
        "category": "urban",
        "flag": "🇮🇳",
        "lat": 16.5062,
        "lon": 80.6480,
        "bbox": [80.5500, 16.4500, 80.7200, 16.5800],
        "tag": "COMMERCIAL CITY",
        "focus": "Commercial density, Krishna riverbank infrastructure & canal network",
        "description": "City AOI (Vijayawada Urban Reach & Krishna Riverfront, AP, India)",
        "landmarks": [
            {"name": "Prakasam Barrage", "lon": 80.6042, "lat": 16.5065, "category": "landmark"},
            {"name": "Bhavani Island River Reach", "lon": 80.5750, "lat": 16.5167, "category": "waterbody"},
            {"name": "Benz Circle Corridor", "lon": 80.6480, "lat": 16.5002, "category": "suburb"},
            {"name": "Gunadala Hill Sanctuary", "lon": 16.5180, "lat": 80.6650, "category": "landmark"}
        ]
    },
    {
        "id": "krishna_river",
        "name": "Krishna River (Vijayawada)",
        "display_name": "Krishna River Corridor, Andhra Pradesh, India",
        "country": "India",
        "target_type": "river",
        "category": "water",
        "flag": "🇮🇳",
        "lat": 16.5100,
        "lon": 80.6000,
        "bbox": [80.4500, 16.4000, 80.7500, 16.6500],
        "tag": "RIVER CORRIDOR",
        "focus": "River discharge variability, sandbar morphology, barrage retention & riparian buffers",
        "description": "Riparian Corridor AOI (Krishna River Main Flow & Canal Headworks, AP, India)",
        "landmarks": [
            {"name": "Prakasam Barrage Headworks", "lon": 80.6042, "lat": 16.5065, "category": "landmark"},
            {"name": "Bhavani Island Ecotourism Reach", "lon": 80.5750, "lat": 16.5167, "category": "waterbody"},
            {"name": "Sitanagaram Ghat Reach", "lon": 80.6090, "lat": 16.4980, "category": "landmark"},
            {"name": "Eluru Canal Takeoff", "lon": 80.6180, "lat": 16.5120, "category": "waterbody"}
        ]
    },
    {
        "id": "hyderabad",
        "name": "Hyderabad",
        "display_name": "Hyderabad, Telangana, India",
        "country": "India",
        "target_type": "city",
        "category": "urban",
        "flag": "🇮🇳",
        "lat": 17.3850,
        "lon": 78.4867,
        "bbox": [78.2500, 17.2500, 78.6000, 17.5500],
        "tag": "TECH METROPOLIS",
        "focus": "Hitec City expansion, Financial District growth & peri-urban ring road development",
        "description": "Metropolitan Urban AOI (Greater Hyderabad & Outer Ring Road Corridor, India)",
        "landmarks": [
            {"name": "HITEC City IT Hub", "lon": 78.3780, "lat": 17.4470, "category": "district"},
            {"name": "Hussain Sagar Lake", "lon": 78.4740, "lat": 17.4230, "category": "waterbody"},
            {"name": "Financial District Gachibowli", "lon": 78.3480, "lat": 17.4180, "category": "suburb"},
            {"name": "Charminar Heritage Sector", "lon": 78.4747, "lat": 17.3616, "category": "landmark"}
        ]
    },
    {
        "id": "bengaluru",
        "name": "Bengaluru",
        "display_name": "Bengaluru, Karnataka, India",
        "country": "India",
        "target_type": "city",
        "category": "urban",
        "flag": "🇮🇳",
        "lat": 12.9716,
        "lon": 77.5946,
        "bbox": [77.4500, 12.8500, 77.7500, 13.1500],
        "tag": "TECH CAPITAL",
        "focus": "Electronic City & Whitefield growth, urban lake system degradation & peripheral canopy changes",
        "description": "Metropolitan Urban AOI (Greater Bengaluru & Peripheral IT Corridors, India)",
        "landmarks": [
            {"name": "Whitefield Tech Cluster", "lon": 77.7499, "lat": 12.9698, "category": "district"},
            {"name": "Bellandur Lake Catchment", "lon": 77.6740, "lat": 12.9360, "category": "waterbody"},
            {"name": "Electronic City Phase 1", "lon": 77.6650, "lat": 12.8450, "category": "suburb"},
            {"name": "Cubbon Park Green Core", "lon": 77.5920, "lat": 12.9760, "category": "landmark"}
        ]
    },
    {
        "id": "mumbai",
        "name": "Mumbai",
        "display_name": "Mumbai, Maharashtra, India",
        "country": "India",
        "target_type": "city",
        "category": "coastal",
        "flag": "🇮🇳",
        "lat": 19.0760,
        "lon": 72.8777,
        "bbox": [72.7500, 18.8800, 73.0500, 19.2800],
        "tag": "FINANCIAL CAPITAL",
        "focus": "Coastal Road reclamation, Bandra-Kurla Complex expansion & Sanjay Gandhi National Park canopy",
        "description": "Island City AOI (Mumbai Peninsula, Thane Creek & Arabian Sea Coastline, India)",
        "landmarks": [
            {"name": "Bandra-Kurla Complex (BKC)", "lon": 72.8680, "lat": 19.0650, "category": "district"},
            {"name": "Gateway of India & South Mumbai", "lon": 72.8347, "lat": 18.9220, "category": "landmark"},
            {"name": "Sanjay Gandhi National Park", "lon": 72.9100, "lat": 19.2200, "category": "landmark"},
            {"name": "Thane Creek Flamingo Sanctuary", "lon": 72.9800, "lat": 19.1200, "category": "waterbody"}
        ]
    },
    {
        "id": "gujarat_coast",
        "name": "Gujarat Coast",
        "display_name": "Gulf of Khambhat & Gujarat Coast, India",
        "country": "India",
        "target_type": "region",
        "category": "coastal",
        "flag": "🇮🇳",
        "lat": 21.6500,
        "lon": 71.1500,
        "bbox": [69.5000, 20.5000, 72.8000, 22.8000],
        "tag": "COASTAL ECOSYSTEM",
        "focus": "Gulf of Khambhat mudflats, tidal salt marshes, industrial ports & mangrove stabilization",
        "description": "Coastal Macro-Region AOI (Saurashtra Coast & Gulf of Khambhat, Gujarat, India)",
        "landmarks": [
            {"name": "Gulf of Khambhat Estuary", "lon": 72.3000, "lat": 21.5000, "category": "waterbody"},
            {"name": "Alang Ship Recycling Coast", "lon": 72.1800, "lat": 21.4100, "category": "district"},
            {"name": "Dahej Petroleum Industrial Complex", "lon": 72.5800, "lat": 21.7100, "category": "suburb"},
            {"name": "Gopnath Point Marine Reserve", "lon": 72.1100, "lat": 21.2000, "category": "landmark"}
        ]
    }
]

_GLOBAL_LOOKUP: Dict[str, Dict[str, Any]] = {}
for _item in GLOBAL_CATALOG:
    _GLOBAL_LOOKUP[_item["id"]] = _item
    _GLOBAL_LOOKUP[_item["name"].lower()] = _item
    # Add alias variations
    clean_n = re.sub(r'[^a-zA-Z0-9]', '', _item["name"].lower())
    _GLOBAL_LOOKUP[clean_n] = _item

def get_global_location(query: str) -> Optional[LocationInfo]:
    """
    Matches queries against the curated Global Observations catalog.
    Returns authoritative LocationInfo with exact bounding box, target type, and landmarks.
    """
    clean = query.lower().strip()
    
    # Strip common query prefixes
    for pfx in ["analyze ", "show changes in ", "changes in ", "city of ", "lake of ", "basin of "]:
        if clean.startswith(pfx):
            clean = clean[len(pfx):].strip()
            
    # Strip temporal ranges
    clean = re.sub(r'\b(?:between|from)\s+\d{4}\s+(?:and|to)\s+\d{4}\b', '', clean, flags=re.IGNORECASE)
    clean = re.sub(r'\b\d{4}\s*[-–]\s*\d{4}\b', '', clean)
    clean = re.sub(r'\b(?:in|during|for)\s+\d{4}\b', '', clean, flags=re.IGNORECASE)
    clean = re.sub(r'[,.]', '', clean).strip()
    clean = re.sub(r'\s+', ' ', clean).strip()
    
    # Direct match
    if clean in _GLOBAL_LOOKUP:
        item = _GLOBAL_LOOKUP[clean]
    else:
        # Check if query contains any catalog key or vice-versa
        item = None
        for key, candidate in _GLOBAL_LOOKUP.items():
            if len(key) >= 4 and (key in clean or clean in key):
                item = candidate
                break
                
    if not item:
        return None
        
    bbox = item["bbox"]
    w, s, e, n = bbox
    poly = {
        "type": "Polygon",
        "coordinates": [[
            [w, s],
            [e, s],
            [e, n],
            [w, n],
            [w, s]
        ]]
    }
    
    landmarks = [
        PlaceLandmark(
            name=lm["name"],
            longitude=lm["lon"],
            latitude=lm["lat"],
            category=lm.get("category", "landmark")
        )
        for lm in item.get("landmarks", [])
    ]
    
    return LocationInfo(
        id=item["id"],
        name=item["name"],
        display_name=item["display_name"],
        latitude=item["lat"],
        longitude=item["lon"],
        bounding_box=bbox,
        country=item["country"],
        admin_region=item["country"],
        location_type=item["target_type"],
        area_description=item["description"],
        geometry=poly,
        landmarks=landmarks
    )
