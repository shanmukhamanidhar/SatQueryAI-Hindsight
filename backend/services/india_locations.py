"""
Authoritative Indian Geospatial Registry for SatQueryAI
Contains all 28 States and 8 Union Territories of the Republic of India with
verified centroid coordinates, optimal Sentinel-2 analysis bounding boxes (~22,000 - 25,000 ha),
canonical administrative metadata, and authentic landmarks.
"""

from typing import Dict, Any, List, Optional
from models.schemas import LocationInfo, PlaceLandmark

# ---------------------------------------------------------------------------
# All 28 States of India
# ---------------------------------------------------------------------------
STATES_DATA: List[Dict[str, Any]] = [
    {
        "id": "andhra_pradesh",
        "name": "Andhra Pradesh",
        "type": "state",
        "capital": "Amaravati",
        "lat": 16.5130,
        "lon": 80.5150,
        "bbox": [80.4150, 16.4130, 80.6150, 16.6130],
        "tag": "CAPITAL REGION",
        "category": "urban",
        "focus": "Amaravati capital masterplan, Krishna River canal network & urban infrastructure",
        "description": "State AOI (Amaravati Capital Region & Krishna River Basin, Andhra Pradesh)",
        "landmarks": [
            {"name": "Amaravati Secretariat", "lon": 80.5180, "lat": 16.5120, "category": "landmark"},
            {"name": "Prakasam Barrage", "lon": 80.6042, "lat": 16.5065, "category": "landmark"},
            {"name": "Mangalagiri Hilltop", "lon": 80.5720, "lat": 16.4380, "category": "landmark"},
            {"name": "Krishna Riverbank Reach", "lon": 80.5500, "lat": 16.5200, "category": "waterbody"},
            {"name": "Tadepalle Corridor", "lon": 80.6010, "lat": 16.4850, "category": "suburb"},
        ]
    },
    {
        "id": "arunachal_pradesh",
        "name": "Arunachal Pradesh",
        "type": "state",
        "capital": "Itanagar",
        "lat": 27.0844,
        "lon": 93.6053,
        "bbox": [93.5050, 26.9840, 93.7050, 27.1840],
        "tag": "EASTERN HIMALAYA",
        "category": "forest",
        "focus": "Eastern Himalayan rainforest canopy, river valley hydrology & foothill urban growth",
        "description": "State AOI (Itanagar Capital Complex & Papum Pare Forest Basin, Arunachal Pradesh)",
        "landmarks": [
            {"name": "Ita Fort Heritage", "lon": 93.6210, "lat": 27.0980, "category": "landmark"},
            {"name": "Ganga Lake (Gyakar Sinyi)", "lon": 93.5780, "lat": 27.0850, "category": "waterbody"},
            {"name": "Donyi Polo Ecological Corridor", "lon": 93.6350, "lat": 27.1120, "category": "landmark"},
            {"name": "Naharlagun Urban Reach", "lon": 93.6920, "lat": 27.1050, "category": "suburb"},
        ]
    },
    {
        "id": "assam",
        "name": "Assam",
        "type": "state",
        "capital": "Dispur",
        "lat": 26.1445,
        "lon": 91.7898,
        "bbox": [91.6890, 26.0440, 91.8890, 26.2440],
        "tag": "BRAHMAPUTRA VALLEY",
        "category": "water",
        "focus": "Brahmaputra river sandbars, Guwahati urban expansion & Deepor Beel wetlands",
        "description": "State AOI (Guwahati Metropolitan & Brahmaputra Valley, Assam)",
        "landmarks": [
            {"name": "Brahmaputra River Corridor", "lon": 91.7520, "lat": 26.1920, "category": "waterbody"},
            {"name": "Kamakhya Hills Reserve", "lon": 91.7050, "lat": 26.1660, "category": "landmark"},
            {"name": "Dispur Capital Complex", "lon": 91.7890, "lat": 26.1430, "category": "district"},
            {"name": "Deepor Beel Wetland", "lon": 91.6580, "lat": 26.1280, "category": "waterbody"},
        ]
    },
    {
        "id": "bihar",
        "name": "Bihar",
        "type": "state",
        "capital": "Patna",
        "lat": 25.5941,
        "lon": 85.1376,
        "bbox": [85.0370, 25.4940, 85.2370, 25.6940],
        "tag": "GANGETIC PLAINS",
        "category": "urban",
        "focus": "Ganga riverine buffer, Patna urban expansion & fertile alluvial agriculture",
        "description": "State AOI (Patna Metropolitan & Gangetic Alluvial Corridor, Bihar)",
        "landmarks": [
            {"name": "Ganga Marine Drive Promenade", "lon": 85.1520, "lat": 25.6210, "category": "landmark"},
            {"name": "Gandhi Maidan Central", "lon": 85.1440, "lat": 25.6150, "category": "district"},
            {"name": "Danapur Cantonment Reach", "lon": 85.0420, "lat": 25.6320, "category": "suburb"},
            {"name": "Patliputra Industrial Sector", "lon": 85.1050, "lat": 25.6350, "category": "suburb"},
        ]
    },
    {
        "id": "chhattisgarh",
        "name": "Chhattisgarh",
        "type": "state",
        "capital": "Raipur",
        "lat": 21.2514,
        "lon": 81.6296,
        "bbox": [81.5290, 21.1510, 81.7290, 21.3510],
        "tag": "MINERAL & FOREST",
        "category": "urban",
        "focus": "Nava Raipur planned smart development, Kharun riverbank & industrial zones",
        "description": "State AOI (Raipur & Nava Raipur Capital Sector, Chhattisgarh)",
        "landmarks": [
            {"name": "Nava Raipur Mantralaya", "lon": 81.7850, "lat": 21.1620, "category": "district"},
            {"name": "Telibandha Lake Marine Drive", "lon": 81.6620, "lat": 21.2380, "category": "waterbody"},
            {"name": "Kharun River Basin", "lon": 81.5820, "lat": 21.2150, "category": "waterbody"},
            {"name": "Urla Industrial Belt", "lon": 81.5950, "lat": 21.3050, "category": "suburb"},
        ]
    },
    {
        "id": "goa",
        "name": "Goa",
        "type": "state",
        "capital": "Panaji",
        "lat": 15.4909,
        "lon": 73.8278,
        "bbox": [73.7270, 15.3900, 73.9270, 15.5900],
        "tag": "COASTAL ESTUARY",
        "category": "coastal",
        "focus": "Mandovi and Zuari estuaries, coastal tourism zones & mangrove conservation",
        "description": "State AOI (Panaji Capital & Mandovi Estuarine Corridor, Goa)",
        "landmarks": [
            {"name": "Mandovi River Promenade", "lon": 73.8320, "lat": 15.5010, "category": "waterbody"},
            {"name": "Miramar Coastal Strip", "lon": 73.8080, "lat": 15.4820, "category": "landmark"},
            {"name": "Mormugao Port Harbor", "lon": 73.7980, "lat": 15.4150, "category": "landmark"},
            {"name": "Old Goa Heritage Quarter", "lon": 73.9120, "lat": 15.5030, "category": "landmark"},
        ]
    },
    {
        "id": "gujarat",
        "name": "Gujarat",
        "type": "state",
        "capital": "Gandhinagar",
        "lat": 23.0225,
        "lon": 72.5714,
        "bbox": [72.4710, 22.9220, 72.6710, 23.1220],
        "tag": "INDUSTRIAL HUB",
        "category": "urban",
        "focus": "Sabarmati Riverfront, GIFT City financial corridor & Ahmedabad expansion",
        "description": "State AOI (Ahmedabad-Gandhinagar Capital Corridor, Gujarat)",
        "landmarks": [
            {"name": "Sabarmati Riverfront", "lon": 72.5710, "lat": 23.0300, "category": "waterbody"},
            {"name": "GIFT City Financial Zone", "lon": 72.6850, "lat": 23.1600, "category": "district"},
            {"name": "SG Highway Tech Corridor", "lon": 72.5180, "lat": 23.0450, "category": "suburb"},
            {"name": "Kankaria Lake Basin", "lon": 72.6020, "lat": 23.0060, "category": "waterbody"},
        ]
    },
    {
        "id": "haryana",
        "name": "Haryana",
        "type": "state",
        "capital": "Chandigarh",
        "lat": 28.4595,
        "lon": 77.0266,
        "bbox": [76.9260, 28.3590, 77.1260, 28.5590],
        "tag": "MILLENNIUM METRO",
        "category": "urban",
        "focus": "Cyber City corporate infrastructure, peri-urban agriculture & Aravalli buffer",
        "description": "State AOI (Gurugram NCR & Manesar Industrial Corridor, Haryana)",
        "landmarks": [
            {"name": "Cyber City Skyline", "lon": 77.0880, "lat": 28.4950, "category": "district"},
            {"name": "Sultanpur Lake Wetlands", "lon": 76.8920, "lat": 28.4620, "category": "waterbody"},
            {"name": "Golf Course Road", "lon": 77.1020, "lat": 28.4550, "category": "suburb"},
            {"name": "Manesar Industrial Belt", "lon": 76.9350, "lat": 28.3550, "category": "suburb"},
        ]
    },
    {
        "id": "himachal_pradesh",
        "name": "Himachal Pradesh",
        "type": "state",
        "capital": "Shimla",
        "lat": 31.1048,
        "lon": 77.1734,
        "bbox": [77.0730, 31.0040, 77.2730, 31.2040],
        "tag": "WESTERN HIMALAYA",
        "category": "forest",
        "focus": "Himalayan pine canopy, hillside infrastructure & agro-horticulture orchards",
        "description": "State AOI (Shimla Capital Ridge & Agro-Horticulture Valley, Himachal Pradesh)",
        "landmarks": [
            {"name": "The Ridge & Mall Road", "lon": 77.1750, "lat": 31.1050, "category": "landmark"},
            {"name": "Jakhoo Hill Reserve", "lon": 77.1850, "lat": 31.1010, "category": "landmark"},
            {"name": "Summer Hill Valley", "lon": 77.1380, "lat": 31.1120, "category": "suburb"},
            {"name": "Sanjauli Mountain Sector", "lon": 77.1980, "lat": 31.1020, "category": "suburb"},
        ]
    },
    {
        "id": "jharkhand",
        "name": "Jharkhand",
        "type": "state",
        "capital": "Ranchi",
        "lat": 23.3441,
        "lon": 85.3096,
        "bbox": [85.2090, 23.2440, 85.4090, 23.4440],
        "tag": "CHOTA NAGPUR",
        "category": "urban",
        "focus": "Chota Nagpur plateau vegetation, Subarnarekha river & industrial expansion",
        "description": "State AOI (Ranchi Plateau & Subarnarekha Basin, Jharkhand)",
        "landmarks": [
            {"name": "Dhurwa Dam Reservoir", "lon": 85.2750, "lat": 23.2980, "category": "waterbody"},
            {"name": "Ranchi Lake (Bada Talab)", "lon": 85.3210, "lat": 23.3680, "category": "waterbody"},
            {"name": "Subarnarekha River Reach", "lon": 85.3850, "lat": 23.3550, "category": "waterbody"},
            {"name": "HEC Heavy Engineering Sector", "lon": 85.2950, "lat": 23.3150, "category": "district"},
        ]
    },
    {
        "id": "karnataka",
        "name": "Karnataka",
        "type": "state",
        "capital": "Bengaluru",
        "lat": 12.9716,
        "lon": 77.5946,
        "bbox": [77.4940, 12.8710, 77.6940, 13.0710],
        "tag": "SILICON VALLEY",
        "category": "urban",
        "focus": "Electronic City, Whitefield tech corridor & peri-urban lake conversions",
        "description": "State AOI (Bengaluru Urban & Technology Corridor, Karnataka)",
        "landmarks": [
            {"name": "Electronic City Tech Zone", "lon": 77.6650, "lat": 12.8450, "category": "district"},
            {"name": "Bellandur Lake Catchment", "lon": 77.6750, "lat": 12.9350, "category": "waterbody"},
            {"name": "Whitefield IT Belt", "lon": 77.7500, "lat": 12.9700, "category": "suburb"},
            {"name": "Lalbagh Green Buffer", "lon": 77.5850, "lat": 12.9500, "category": "landmark"},
        ]
    },
    {
        "id": "kerala",
        "name": "Kerala",
        "type": "state",
        "capital": "Thiruvananthapuram",
        "lat": 9.9312,
        "lon": 76.2711,
        "bbox": [76.1710, 9.8310, 76.3710, 10.0310],
        "tag": "BACKWATERS & CANOPY",
        "category": "coastal",
        "focus": "Vembanad Lake estuary, Kochi port development & lush tropical canopy",
        "description": "State AOI (Kochi Coastal Metro & Vembanad Backwaters, Kerala)",
        "landmarks": [
            {"name": "Vembanad Lake Estuary", "lon": 76.3200, "lat": 9.8500, "category": "waterbody"},
            {"name": "Marine Drive Promenade", "lon": 76.2750, "lat": 9.9820, "category": "landmark"},
            {"name": "InfoPark Kakkanad IT Zone", "lon": 76.3580, "lat": 10.0120, "category": "district"},
            {"name": "Willingdon Island Port", "lon": 76.2680, "lat": 9.9450, "category": "landmark"},
        ]
    },
    {
        "id": "madhya_pradesh",
        "name": "Madhya Pradesh",
        "type": "state",
        "capital": "Bhopal",
        "lat": 23.2599,
        "lon": 77.4126,
        "bbox": [77.3120, 23.1590, 77.5120, 23.3590],
        "tag": "HEART OF INDIA",
        "category": "water",
        "focus": "Bhojtal (Upper Lake) Ramsar site, Malwa plateau agriculture & Bhopal urban core",
        "description": "State AOI (Bhopal City of Lakes & Malwa Agro-Ecology, Madhya Pradesh)",
        "landmarks": [
            {"name": "Bhojtal (Upper Lake)", "lon": 77.3450, "lat": 23.2500, "category": "waterbody"},
            {"name": "Lower Lake (Chhota Talab)", "lon": 77.4120, "lat": 23.2420, "category": "waterbody"},
            {"name": "Van Vihar National Corridor", "lon": 77.3680, "lat": 23.2320, "category": "landmark"},
            {"name": "BHEL Industrial Zone", "lon": 77.4850, "lat": 23.2650, "category": "suburb"},
        ]
    },
    {
        "id": "maharashtra",
        "name": "Maharashtra",
        "type": "state",
        "capital": "Mumbai",
        "lat": 19.0760,
        "lon": 72.8777,
        "bbox": [72.7770, 18.9760, 72.9770, 19.1760],
        "tag": "FINANCIAL CAPITAL",
        "category": "coastal",
        "focus": "Mumbai Coastal Road, harbour developments & Thane Creek mangrove buffer",
        "description": "State AOI (Mumbai Metropolitan Coastal Belt, Maharashtra)",
        "landmarks": [
            {"name": "Coastal Road Reclamation", "lon": 72.8120, "lat": 18.9850, "category": "landmark"},
            {"name": "Bandra Kurla Complex (BKC)", "lon": 72.8680, "lat": 19.0650, "category": "district"},
            {"name": "Sanjay Gandhi National Park", "lon": 72.9150, "lat": 19.2250, "category": "landmark"},
            {"name": "Thane Creek Mangrove Buffer", "lon": 72.9850, "lat": 19.1150, "category": "waterbody"},
        ]
    },
    {
        "id": "manipur",
        "name": "Manipur",
        "type": "state",
        "capital": "Imphal",
        "lat": 24.8170,
        "lon": 93.9368,
        "bbox": [93.8360, 24.7170, 94.0360, 24.9170],
        "tag": "JEWEL OF INDIA",
        "category": "water",
        "focus": "Imphal valley basin, Loktak lake catchment & hillside forest regeneration",
        "description": "State AOI (Imphal Valley & Loktak Lake Catchment, Manipur)",
        "landmarks": [
            {"name": "Kangla Fort Heritage", "lon": 93.9420, "lat": 24.8150, "category": "landmark"},
            {"name": "Imphal River Corridor", "lon": 93.9520, "lat": 24.8050, "category": "waterbody"},
            {"name": "Lamphelpat Wetland Buffer", "lon": 93.9120, "lat": 24.8280, "category": "waterbody"},
            {"name": "Singjamei Valley Reach", "lon": 93.9350, "lat": 24.7850, "category": "suburb"},
        ]
    },
    {
        "id": "meghalaya",
        "name": "Meghalaya",
        "type": "state",
        "capital": "Shillong",
        "lat": 25.5788,
        "lon": 91.8933,
        "bbox": [91.7930, 25.4780, 91.9930, 25.6780],
        "tag": "ABODE OF CLOUDS",
        "category": "forest",
        "focus": "Umiam Lake reservoir, subtropical pine canopy & Shillong hillside settlement",
        "description": "State AOI (Shillong Plateau & Umiam Lake Basin, Meghalaya)",
        "landmarks": [
            {"name": "Umiam Lake (Barapani)", "lon": 91.8950, "lat": 25.6650, "category": "waterbody"},
            {"name": "Shillong Peak Ridge", "lon": 91.8550, "lat": 25.5350, "category": "landmark"},
            {"name": "Ward's Lake Botanical Reach", "lon": 91.8880, "lat": 25.5750, "category": "waterbody"},
            {"name": "Police Bazar Central", "lon": 91.8820, "lat": 25.5780, "category": "district"},
        ]
    },
    {
        "id": "mizoram",
        "name": "Mizoram",
        "type": "state",
        "capital": "Aizawl",
        "lat": 23.7271,
        "lon": 92.7176,
        "bbox": [92.6170, 23.6270, 92.8170, 23.8270],
        "tag": "HIGHLAND CANOPY",
        "category": "forest",
        "focus": "Tlawng river valley, steep ridge urban topography & bamboo agro-forestry",
        "description": "State AOI (Aizawl Ridge & Tlawng River Corridor, Mizoram)",
        "landmarks": [
            {"name": "Tlawng River Valley Basin", "lon": 92.6750, "lat": 23.7320, "category": "waterbody"},
            {"name": "Durtlang Hills Crest", "lon": 92.7350, "lat": 23.7750, "category": "landmark"},
            {"name": "Bara Bazar Central Hub", "lon": 92.7180, "lat": 23.7310, "category": "district"},
            {"name": "Tuirial Hydroelectric Reach", "lon": 92.8250, "lat": 23.7150, "category": "waterbody"},
        ]
    },
    {
        "id": "nagaland",
        "name": "Nagaland",
        "type": "state",
        "capital": "Kohima",
        "lat": 25.6751,
        "lon": 94.1086,
        "bbox": [94.0080, 25.5750, 94.2080, 25.7750],
        "tag": "NAGA HILLS",
        "category": "forest",
        "focus": "Dzukou valley foothills, terrace cultivation & mountain ridge urban growth",
        "description": "State AOI (Kohima Ridge & Japfu Mountain Corridor, Nagaland)",
        "landmarks": [
            {"name": "Naga Heritage Village (Kisama)", "lon": 94.1150, "lat": 25.6050, "category": "landmark"},
            {"name": "Kohima War Cemetery Ridge", "lon": 94.1080, "lat": 25.6680, "category": "landmark"},
            {"name": "Dzukou Valley Northern Rim", "lon": 94.0450, "lat": 25.5650, "category": "landmark"},
            {"name": "Dimapur Valley Gateway", "lon": 93.7250, "lat": 25.9050, "category": "suburb"},
        ]
    },
    {
        "id": "odisha",
        "name": "Odisha",
        "type": "state",
        "capital": "Bhubaneswar",
        "lat": 20.2961,
        "lon": 85.8245,
        "bbox": [85.7240, 20.1960, 85.9240, 20.3960],
        "tag": "MAHANADI DELTA",
        "category": "urban",
        "focus": "Smart city expansion, Mahanadi/Daya river delta & Chandaka forest buffer",
        "description": "State AOI (Bhubaneswar Temple City & Mahanadi Delta, Odisha)",
        "landmarks": [
            {"name": "Daya River Floodplain", "lon": 85.8550, "lat": 20.2150, "category": "waterbody"},
            {"name": "Chandaka Elephant Forest Rim", "lon": 85.7450, "lat": 20.3450, "category": "landmark"},
            {"name": "Infocity IT Corridor", "lon": 85.8150, "lat": 20.3550, "category": "district"},
            {"name": "Kuakhai River Channel", "lon": 85.8850, "lat": 20.3150, "category": "waterbody"},
        ]
    },
    {
        "id": "punjab",
        "name": "Punjab",
        "type": "state",
        "capital": "Chandigarh",
        "lat": 30.9010,
        "lon": 75.8573,
        "bbox": [75.7570, 30.8010, 75.9570, 31.0010],
        "tag": "AGRI BREADBASKET",
        "category": "urban",
        "focus": "Sutlej alluvial plains, intensive double-cropping & Ludhiana industrial belt",
        "description": "State AOI (Ludhiana Industrial Metro & Sutlej Basin, Punjab)",
        "landmarks": [
            {"name": "Sutlej River Plains", "lon": 75.8750, "lat": 30.9850, "category": "waterbody"},
            {"name": "Focal Point Industrial Estate", "lon": 75.9120, "lat": 30.8850, "category": "district"},
            {"name": "Punjab Agricultural University", "lon": 75.8050, "lat": 30.9020, "category": "landmark"},
            {"name": "Buddha Nullah Channel", "lon": 75.8550, "lat": 30.9250, "category": "waterbody"},
        ]
    },
    {
        "id": "rajasthan",
        "name": "Rajasthan",
        "type": "state",
        "capital": "Jaipur",
        "lat": 26.9124,
        "lon": 75.7873,
        "bbox": [75.6870, 26.8120, 75.8870, 27.0120],
        "tag": "ARAVALLI REGION",
        "category": "urban",
        "focus": "Jaipur pink city expansion, Aravalli ridge conservation & Dravyavati riverfront",
        "description": "State AOI (Jaipur Metropolitan & Aravalli Foothills, Rajasthan)",
        "landmarks": [
            {"name": "Jal Mahal Lake Basin", "lon": 75.8450, "lat": 26.9550, "category": "waterbody"},
            {"name": "Amer Fort Aravalli Ridge", "lon": 75.8520, "lat": 26.9850, "category": "landmark"},
            {"name": "Dravyavati River Corridor", "lon": 75.7850, "lat": 26.8450, "category": "waterbody"},
            {"name": "Sitapura Industrial & IT Hub", "lon": 75.8250, "lat": 26.7850, "category": "district"},
        ]
    },
    {
        "id": "sikkim",
        "name": "Sikkim",
        "type": "state",
        "capital": "Gangtok",
        "lat": 27.3389,
        "lon": 88.6065,
        "bbox": [88.5060, 27.2380, 88.7060, 27.4380],
        "tag": "ORGANIC STATE",
        "category": "forest",
        "focus": "100% organic agro-ecological terraces, Teesta river gorge & Himalayan forests",
        "description": "State AOI (Gangtok Himalayan Ridge & Teesta Valley, Sikkim)",
        "landmarks": [
            {"name": "Teesta River Gorge Reach", "lon": 88.5250, "lat": 27.3150, "category": "waterbody"},
            {"name": "MG Marg Capital Central", "lon": 88.6120, "lat": 27.3280, "category": "district"},
            {"name": "Rumtek Monastery Valley", "lon": 88.5650, "lat": 27.2850, "category": "landmark"},
            {"name": "Tashi View Point Ridge", "lon": 88.6250, "lat": 27.3650, "category": "landmark"},
        ]
    },
    {
        "id": "tamil_nadu",
        "name": "Tamil Nadu",
        "type": "state",
        "capital": "Chennai",
        "lat": 13.0827,
        "lon": 80.2707,
        "bbox": [80.1700, 12.9820, 80.3700, 13.1820],
        "tag": "COROMANDEL COAST",
        "category": "coastal",
        "focus": "OMR IT expressway, Chennai port harbor & coastal mangrove preservation",
        "description": "State AOI (Chennai Metropolitan & Coromandel Coastal Corridor, Tamil Nadu)",
        "landmarks": [
            {"name": "Marina Beach Promenade", "lon": 80.2820, "lat": 13.0500, "category": "landmark"},
            {"name": "OMR IT Expressway Belt", "lon": 80.2280, "lat": 12.9350, "category": "district"},
            {"name": "Adyar Estuary Wetlands", "lon": 80.2580, "lat": 13.0070, "category": "waterbody"},
            {"name": "Guindy National Park", "lon": 80.2120, "lat": 13.0060, "category": "landmark"},
        ]
    },
    {
        "id": "telangana",
        "name": "Telangana",
        "type": "state",
        "capital": "Hyderabad",
        "lat": 17.3850,
        "lon": 78.4867,
        "bbox": [78.3860, 17.2850, 78.5860, 17.4850],
        "tag": "DECCAN TECH HUB",
        "category": "urban",
        "focus": "HITEC City expansion, Outer Ring Road growth & Hussain Sagar catchment",
        "description": "State AOI (Hyderabad Deccan Metropolitan Hub, Telangana)",
        "landmarks": [
            {"name": "HITEC City Cyberabad", "lon": 78.3780, "lat": 17.4480, "category": "district"},
            {"name": "Gachibowli Financial Hub", "lon": 78.3580, "lat": 17.4400, "category": "district"},
            {"name": "Hussain Sagar Lake Basin", "lon": 78.4740, "lat": 17.4239, "category": "waterbody"},
            {"name": "Charminar Old City", "lon": 78.4747, "lat": 17.3616, "category": "landmark"},
        ]
    },
    {
        "id": "tripura",
        "name": "Tripura",
        "type": "state",
        "capital": "Agartala",
        "lat": 23.8315,
        "lon": 91.2868,
        "bbox": [91.1860, 23.7310, 91.3860, 23.9310],
        "tag": "RUBBER & BAMBOO",
        "category": "forest",
        "focus": "Howrah river basin, rubber plantations & Agartala smart city expansion",
        "description": "State AOI (Agartala Basin & Howrah River Corridor, Tripura)",
        "landmarks": [
            {"name": "Ujjayanta Palace Complex", "lon": 91.2820, "lat": 23.8350, "category": "landmark"},
            {"name": "Howrah River Corridor", "lon": 91.2750, "lat": 23.8150, "category": "waterbody"},
            {"name": "College Tilla Lake Reach", "lon": 91.2980, "lat": 23.8220, "category": "waterbody"},
            {"name": "Heritage Park Green Buffer", "lon": 91.3050, "lat": 23.8550, "category": "landmark"},
        ]
    },
    {
        "id": "uttar_pradesh",
        "name": "Uttar Pradesh",
        "type": "state",
        "capital": "Lucknow",
        "lat": 26.8467,
        "lon": 80.9462,
        "bbox": [80.8460, 26.7460, 81.0460, 26.9460],
        "tag": "AWADH PLAINS",
        "category": "urban",
        "focus": "Gomti Riverfront development, Shaheed Path infrastructure & urban sprawl",
        "description": "State AOI (Lucknow Capital & Gomti River Basin, Uttar Pradesh)",
        "landmarks": [
            {"name": "Gomti Riverfront Promenade", "lon": 80.9650, "lat": 26.8550, "category": "waterbody"},
            {"name": "Shaheed Path Economic Belt", "lon": 81.0120, "lat": 26.7850, "category": "district"},
            {"name": "Hazratganj Central District", "lon": 80.9450, "lat": 26.8480, "category": "district"},
            {"name": "Kukrail Forest Reserve", "lon": 80.9850, "lat": 26.8950, "category": "landmark"},
        ]
    },
    {
        "id": "uttarakhand",
        "name": "Uttarakhand",
        "type": "state",
        "capital": "Dehradun",
        "lat": 30.3165,
        "lon": 78.0322,
        "bbox": [77.9320, 30.2160, 78.1320, 30.4160],
        "tag": "DOON VALLEY",
        "category": "forest",
        "focus": "Doon Valley forest cover, Shivalik foothills & Song/Rispana riverbanks",
        "description": "State AOI (Dehradun Valley & Shivalik Ecological Corridor, Uttarakhand)",
        "landmarks": [
            {"name": "Forest Research Institute (FRI)", "lon": 77.9950, "lat": 30.3420, "category": "landmark"},
            {"name": "Rispana River Channel", "lon": 78.0550, "lat": 30.3050, "category": "waterbody"},
            {"name": "Rajpur Road Foothill Belt", "lon": 78.0750, "lat": 30.3650, "category": "suburb"},
            {"name": "Clock Tower (Ghanta Ghar)", "lon": 78.0420, "lat": 30.3250, "category": "district"},
        ]
    },
    {
        "id": "west_bengal",
        "name": "West Bengal",
        "type": "state",
        "capital": "Kolkata",
        "lat": 22.5726,
        "lon": 88.3639,
        "bbox": [88.2630, 22.4720, 88.4630, 22.6720],
        "tag": "HOOGHLY METRO",
        "category": "coastal",
        "focus": "Hooghly river corridor, East Kolkata Wetlands Ramsar site & New Town tech hub",
        "description": "State AOI (Kolkata Metropolitan & East Wetlands, West Bengal)",
        "landmarks": [
            {"name": "Hooghly Riverfront Promenade", "lon": 88.3450, "lat": 22.5850, "category": "waterbody"},
            {"name": "East Kolkata Ramsar Wetlands", "lon": 88.4450, "lat": 22.5450, "category": "waterbody"},
            {"name": "Salt Lake Sector V IT Hub", "lon": 88.4320, "lat": 22.5750, "category": "district"},
            {"name": "New Town Smart City Belt", "lon": 88.4750, "lat": 22.5950, "category": "district"},
        ]
    },
]

# ---------------------------------------------------------------------------
# All 8 Union Territories of India
# ---------------------------------------------------------------------------
UNION_TERRITORIES_DATA: List[Dict[str, Any]] = [
    {
        "id": "andaman_and_nicobar_islands",
        "name": "Andaman and Nicobar Islands",
        "type": "union_territory",
        "capital": "Port Blair",
        "lat": 11.6234,
        "lon": 92.7265,
        "bbox": [92.6260, 11.5230, 92.8260, 11.7230],
        "tag": "ISLAND TERRITORY",
        "category": "coastal",
        "focus": "Tropical coral reefs, coastal mangrove buffers & Port Blair harbor development",
        "description": "Union Territory AOI (Port Blair Harbor & South Andaman Island Arc)",
        "landmarks": [
            {"name": "Cellular Jail Coastal Ridge", "lon": 92.7480, "lat": 11.6740, "category": "landmark"},
            {"name": "Port Blair Harbor & Docks", "lon": 92.7350, "lat": 11.6650, "category": "landmark"},
            {"name": "Corbyn's Cove Beach Buffer", "lon": 92.7450, "lat": 11.6380, "category": "waterbody"},
            {"name": "Mount Harriet Forest Crest", "lon": 92.7350, "lat": 11.7180, "category": "landmark"},
        ]
    },
    {
        "id": "chandigarh",
        "name": "Chandigarh",
        "type": "union_territory",
        "capital": "Chandigarh",
        "lat": 30.7333,
        "lon": 76.7794,
        "bbox": [76.6790, 30.6330, 76.8790, 30.8330],
        "tag": "PLANNED CAPITAL",
        "category": "urban",
        "focus": "Le Corbusier green grid, Sukhna lake catchment & Shivalik ecological buffer",
        "description": "Union Territory AOI (Chandigarh Urban Grid & Sukhna Lake Catchment)",
        "landmarks": [
            {"name": "Sukhna Lake Wetland", "lon": 76.8150, "lat": 30.7420, "category": "waterbody"},
            {"name": "Capitol Complex Heritage", "lon": 76.8020, "lat": 30.7580, "category": "landmark"},
            {"name": "Sector 17 Central Plaza", "lon": 76.7820, "lat": 30.7400, "category": "district"},
            {"name": "Rock Garden Buffer", "lon": 76.8050, "lat": 30.7520, "category": "landmark"},
        ]
    },
    {
        "id": "dadra_and_nagar_haveli_and_daman_and_diu",
        "name": "Dadra and Nagar Haveli and Daman and Diu",
        "type": "union_territory",
        "capital": "Daman",
        "lat": 20.3974,
        "lon": 72.8397,
        "bbox": [72.7390, 20.2970, 72.9390, 20.4970],
        "tag": "WEST COAST UT",
        "category": "coastal",
        "focus": "Daman Ganga estuarine dynamics, industrial belt growth & Arabian Sea coast",
        "description": "Union Territory AOI (Daman Ganga Estuary & Daman Coastal Basin)",
        "landmarks": [
            {"name": "Daman Ganga River Mouth", "lon": 72.8250, "lat": 20.4150, "category": "waterbody"},
            {"name": "Moti Daman Coastal Fort", "lon": 72.8320, "lat": 20.4120, "category": "landmark"},
            {"name": "Devka Beach Coastal Belt", "lon": 72.8350, "lat": 20.4450, "category": "landmark"},
            {"name": "Silvassa Industrial Reach", "lon": 73.0150, "lat": 20.2750, "category": "district"},
        ]
    },
    {
        "id": "delhi",
        "name": "Delhi (NCT)",
        "type": "union_territory",
        "capital": "New Delhi",
        "lat": 28.7041,
        "lon": 77.1025,
        "bbox": [77.0020, 28.6040, 77.2020, 28.8040],
        "tag": "NATIONAL CAPITAL",
        "category": "urban",
        "focus": "Yamuna floodplain ecology, Central Vista urban core & peri-urban conversions",
        "description": "Union Territory AOI (National Capital Territory & Yamuna River Corridor)",
        "landmarks": [
            {"name": "Yamuna River Corridor", "lon": 77.2450, "lat": 28.6550, "category": "waterbody"},
            {"name": "Central Vista Capitol Core", "lon": 77.2150, "lat": 28.6140, "category": "district"},
            {"name": "Aravalli Biodiversity Park", "lon": 77.1450, "lat": 28.5550, "category": "landmark"},
            {"name": "Rohini Urban Expansion", "lon": 77.0850, "lat": 28.7150, "category": "suburb"},
        ]
    },
    {
        "id": "jammu_and_kashmir",
        "name": "Jammu and Kashmir",
        "type": "union_territory",
        "capital": "Srinagar",
        "lat": 34.0837,
        "lon": 74.7973,
        "bbox": [74.6970, 33.9830, 74.8970, 34.1830],
        "tag": "KASHMIR VALLEY",
        "category": "water",
        "focus": "Dal Lake aquatic dynamics, Jhelum river floodplain & Himalayan alpine orchards",
        "description": "Union Territory AOI (Srinagar Valley, Dal Lake & Jhelum River Corridor)",
        "landmarks": [
            {"name": "Dal Lake Aquatic Catchment", "lon": 74.8650, "lat": 34.1150, "category": "waterbody"},
            {"name": "Jhelum River Promenade", "lon": 74.8050, "lat": 34.0750, "category": "waterbody"},
            {"name": "Zabarwan Foothill Buffer", "lon": 74.8850, "lat": 34.0850, "category": "landmark"},
            {"name": "Lal Chowk Central", "lon": 74.8120, "lat": 34.0680, "category": "district"},
        ]
    },
    {
        "id": "ladakh",
        "name": "Ladakh",
        "type": "union_territory",
        "capital": "Leh",
        "lat": 34.1526,
        "lon": 77.5771,
        "bbox": [77.4770, 34.0520, 77.6770, 34.2520],
        "tag": "HIGH ALTITUDE",
        "category": "forest",
        "focus": "Indus river valley oasis, glacial melt hydrology & high-altitude cold desert",
        "description": "Union Territory AOI (Leh Indus Valley & High-Altitude Cold Desert Corridor)",
        "landmarks": [
            {"name": "Indus River Valley Oasis", "lon": 77.5450, "lat": 34.1150, "category": "waterbody"},
            {"name": "Leh Palace Mountain Ridge", "lon": 77.5850, "lat": 34.1650, "category": "landmark"},
            {"name": "Spituk Monastery Valley", "lon": 77.5250, "lat": 34.1280, "category": "landmark"},
            {"name": "Shanti Stupa Crest", "lon": 77.5750, "lat": 34.1720, "category": "landmark"},
        ]
    },
    {
        "id": "lakshadweep",
        "name": "Lakshadweep",
        "type": "union_territory",
        "capital": "Kavaratti",
        "lat": 10.5667,
        "lon": 72.6417,
        "bbox": [72.5410, 10.4660, 72.7410, 10.6660],
        "tag": "CORAL ATOLL",
        "category": "coastal",
        "focus": "Coral atoll lagoon dynamics, coconut palm canopy & marine biodiversity",
        "description": "Union Territory AOI (Kavaratti Coral Atoll & Marine Lagoon Sanctuary)",
        "landmarks": [
            {"name": "Kavaratti Marine Lagoon", "lon": 72.6350, "lat": 10.5750, "category": "waterbody"},
            {"name": "Coral Reef Barrier Rim", "lon": 72.6250, "lat": 10.5650, "category": "waterbody"},
            {"name": "Kavaratti Island Capital Reach", "lon": 72.6420, "lat": 10.5660, "category": "district"},
            {"name": "Light House Coastal Tip", "lon": 72.6550, "lat": 10.5520, "category": "landmark"},
        ]
    },
    {
        "id": "puducherry",
        "name": "Puducherry",
        "type": "union_territory",
        "capital": "Puducherry",
        "lat": 11.9416,
        "lon": 79.8083,
        "bbox": [79.7080, 11.8410, 79.9080, 12.0410],
        "tag": "FRENCH COASTAL",
        "category": "coastal",
        "focus": "Bay of Bengal coastline, Auroville ecological green belt & Ousteri wetland",
        "description": "Union Territory AOI (Puducherry Promenade & Auroville Coastal Buffer)",
        "landmarks": [
            {"name": "Promenade Beach Coastal Strip", "lon": 79.8350, "lat": 11.9350, "category": "landmark"},
            {"name": "Auroville Green Belt Rim", "lon": 79.8120, "lat": 12.0050, "category": "landmark"},
            {"name": "Ousteri Lake Ramsar Catchment", "lon": 79.7450, "lat": 11.9520, "category": "waterbody"},
            {"name": "Chunnambar River Estuary", "lon": 79.8050, "lat": 11.8850, "category": "waterbody"},
        ]
    }
]

# Combined master registry of all 36 administrative entities
ALL_INDIA_ITEMS = STATES_DATA + UNION_TERRITORIES_DATA

# Create lookup dictionary with aliases
_INDIA_CATALOG: Dict[str, Dict[str, Any]] = {}

for item in ALL_INDIA_ITEMS:
    key_name = item["name"].lower().strip()
    key_id = item["id"].lower().strip()
    _INDIA_CATALOG[key_name] = item
    _INDIA_CATALOG[key_id] = item
    _INDIA_CATALOG[f"{key_name}, india"] = item
    _INDIA_CATALOG[f"state of {key_name}"] = item

# Specific alias bindings
_INDIA_CATALOG["delhi"] = _INDIA_CATALOG["delhi (nct)"]
_INDIA_CATALOG["delhi nct"] = _INDIA_CATALOG["delhi (nct)"]
_INDIA_CATALOG["nct of delhi"] = _INDIA_CATALOG["delhi (nct)"]
_INDIA_CATALOG["national capital territory of delhi"] = _INDIA_CATALOG["delhi (nct)"]
_INDIA_CATALOG["andaman"] = _INDIA_CATALOG["andaman and nicobar islands"]
_INDIA_CATALOG["andaman & nicobar"] = _INDIA_CATALOG["andaman and nicobar islands"]
_INDIA_CATALOG["andaman and nicobar"] = _INDIA_CATALOG["andaman and nicobar islands"]
_INDIA_CATALOG["andaman & nicobar islands"] = _INDIA_CATALOG["andaman and nicobar islands"]
_INDIA_CATALOG["dadra and nagar haveli"] = _INDIA_CATALOG["dadra and nagar haveli and daman and diu"]
_INDIA_CATALOG["daman and diu"] = _INDIA_CATALOG["dadra and nagar haveli and daman and diu"]
_INDIA_CATALOG["daman & diu"] = _INDIA_CATALOG["dadra and nagar haveli and daman and diu"]
_INDIA_CATALOG["jammu & kashmir"] = _INDIA_CATALOG["jammu and kashmir"]
_INDIA_CATALOG["j&k"] = _INDIA_CATALOG["jammu and kashmir"]
_INDIA_CATALOG["pondicherry"] = _INDIA_CATALOG["puducherry"]
_INDIA_CATALOG["orissa"] = _INDIA_CATALOG["odisha"]
_INDIA_CATALOG["uttaranchal"] = _INDIA_CATALOG["uttarakhand"]

STATE_ADMINISTRATIVE_BBOXES: Dict[str, List[float]] = {
    "andhra_pradesh": [76.7600, 12.6200, 84.7700, 19.1500],
    "arunachal_pradesh": [91.5000, 26.6300, 97.4200, 29.5000],
    "assam": [89.6900, 24.1300, 96.0200, 27.9700],
    "bihar": [83.3200, 24.2800, 88.3000, 27.5200],
    "chhattisgarh": [80.2400, 17.7800, 84.4000, 24.1100],
    "goa": [73.6800, 14.9000, 74.3400, 15.8000],
    "gujarat": [68.1200, 20.1200, 74.4800, 24.7100],
    "haryana": [74.4600, 27.6500, 77.6000, 30.9200],
    "himachal_pradesh": [75.7900, 30.3800, 79.0700, 33.2600],
    "jharkhand": [83.3200, 21.9700, 87.9500, 25.3500],
    "karnataka": [74.0900, 11.5900, 78.5900, 18.4500],
    "kerala": [74.8600, 8.2900, 77.4100, 12.7900],
    "madhya_pradesh": [74.0400, 21.0800, 82.8100, 26.8700],
    "maharashtra": [72.6000, 15.6000, 80.8900, 22.0300],
    "manipur": [93.0300, 23.8300, 94.7800, 25.6800],
    "meghalaya": [89.8200, 25.0300, 92.8000, 26.1200],
    "mizoram": [92.2600, 21.9700, 93.4400, 24.5200],
    "nagaland": [93.3300, 25.1000, 95.2500, 27.0700],
    "odisha": [81.3800, 17.8200, 87.5200, 22.5700],
    "punjab": [73.8800, 29.5300, 76.9300, 32.5000],
    "rajasthan": [69.5000, 23.0500, 78.2800, 30.2000],
    "sikkim": [88.0100, 27.0800, 88.9200, 28.1300],
    "tamil_nadu": [76.2400, 8.0800, 80.3500, 13.5600],
    "telangana": [77.2400, 15.8300, 81.3200, 19.9200],
    "tripura": [91.1500, 22.9400, 92.3400, 24.5300],
    "uttar_pradesh": [77.1000, 23.8700, 84.6400, 30.4000],
    "uttarakhand": [77.5800, 28.7200, 81.0400, 31.4600],
    "west_bengal": [85.8200, 21.5200, 89.8800, 27.2200],
    "andaman_nicobar": [92.2000, 6.7500, 94.0000, 13.7000],
    "chandigarh": [76.7100, 30.6800, 76.8400, 30.7900],
    "dadra_nagar_haveli_daman_diu": [72.8000, 20.0600, 73.2300, 20.7300],
    "delhi": [76.8400, 28.4000, 77.3500, 28.8800],
    "jammu_kashmir": [73.7600, 32.2800, 76.7900, 35.1500],
    "ladakh": [75.5000, 32.5000, 79.5000, 36.0000],
    "lakshadweep": [71.5000, 8.2000, 74.0000, 12.5000],
    "puducherry": [79.7500, 11.8500, 79.8800, 12.0200]
}

STATE_ADMINISTRATIVE_GEOMETRIES: Dict[str, Dict[str, Any]] = {
    "andhra_pradesh": {
        "type": "Polygon",
        "coordinates": [[
            [76.7600, 14.1500],
            [77.1000, 13.7500],
            [78.2000, 13.0000],
            [79.2000, 13.1500],
            [79.8000, 13.4000],
            [80.1500, 14.0000],
            [80.3000, 15.5000],
            [81.0000, 16.2000],
            [82.2000, 16.9000],
            [83.3000, 17.7000],
            [84.7700, 19.1500],
            [83.8000, 18.8000],
            [83.2000, 18.2000],
            [81.5000, 17.7000],
            [80.5000, 17.1000],
            [79.5000, 16.5000],
            [78.2000, 16.0000],
            [77.4000, 15.2000],
            [76.7600, 14.1500]
        ]]
    },
    "andaman_nicobar": {
        "type": "MultiPolygon",
        "coordinates": [
            [[[92.7, 11.5], [93.0, 11.5], [93.0, 13.5], [92.7, 13.5], [92.7, 11.5]]],
            [[[93.5, 6.8], [94.0, 6.8], [94.0, 9.3], [93.5, 9.3], [93.5, 6.8]]]
        ]
    },
    "lakshadweep": {
        "type": "MultiPolygon",
        "coordinates": [
            [[[71.8, 10.5], [72.5, 10.5], [72.5, 11.2], [71.8, 11.2], [71.8, 10.5]]],
            [[[72.8, 8.2], [73.2, 8.2], [73.2, 8.6], [72.8, 8.6], [72.8, 8.2]]]
        ]
    }
}

def get_india_location(query: str) -> Optional[LocationInfo]:
    """
    Looks up an Indian State or Union Territory from the authoritative registry.
    Returns LocationInfo with authoritative state-level administrative bounding box, centroid, and authentic landmarks.
    """
    import re
    clean = query.lower().strip()

    # Strip common query affixes
    for prefix in ["analyze ", "show changes in ", "changes in ", "state of ", "ut of ", "union territory of "]:
        if clean.startswith(prefix):
            clean = clean[len(prefix):].strip()

    # Strip temporal ranges: e.g. 'between 2021 and 2026', 'from 2020 to 2026', '2021-2026', etc.
    clean = re.sub(r'\b(?:between|from)\s+\d{4}\s+(?:and|to)\s+\d{4}\b', '', clean, flags=re.IGNORECASE)
    clean = re.sub(r'\b\d{4}\s*[-–]\s*\d{4}\b', '', clean)
    clean = re.sub(r'\b(?:in|during|for)\s+\d{4}\b', '', clean, flags=re.IGNORECASE)
    clean = clean.replace(', india', '').replace(' india', '').strip()
    clean = re.sub(r'\s+', ' ', clean).strip()

    item = _INDIA_CATALOG.get(clean)
    if not item:
        # Check catalog keys where key is inside clean or clean inside key
        # Sort keys by length descending so longer specific names match first (e.g. 'andaman and nicobar islands' before 'andaman')
        sorted_keys = sorted(_INDIA_CATALOG.keys(), key=lambda x: len(x), reverse=True)
        for k in sorted_keys:
            if k == clean or (len(k) >= 3 and k in clean) or (len(clean) >= 4 and clean in k):
                item = _INDIA_CATALOG[k]
                break

    if not item:
        return None

    # Use authoritative administrative bounding box
    bbox = STATE_ADMINISTRATIVE_BBOXES.get(item["id"], item["bbox"])
    w, s, e, n = bbox
    poly = STATE_ADMINISTRATIVE_GEOMETRIES.get(item["id"]) or {
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
        for lm in item["landmarks"]
    ]

    area_description = f"State Administrative AOI (Complete {item['name']} Boundary & Regional Terrain)" if item["type"] == "state" else f"Union Territory Administrative AOI ({item['name']})"

    return LocationInfo(
        id=item["id"],
        name=item["name"],
        display_name=f"{item['name']}, India",
        latitude=item["lat"],
        longitude=item["lon"],
        bounding_box=bbox,
        country="India",
        admin_region=item["name"],
        location_type="state" if item["type"] == "state" else "union_territory",
        area_description=area_description,
        geometry=poly,
        landmarks=landmarks
    )
