import re
import json
import logging
from typing import Dict, Any, Optional, List
from config import settings

logger = logging.getLogger(__name__)

DEFAULT_START_YEAR = 2021
DEFAULT_END_YEAR = 2026

# Comprehensive catalog of known canonical targets and all natural language aliases
KNOWN_GLOBAL_TARGETS = [
    # Key Indian Hubs & Corridors
    ("Krishna River in Vijayawada", ["krishna river in vijayawada", "krishna river vijayawada", "krishna in vijayawada", "krishna river near vijayawada"]),
    ("Krishna River", ["krishna river", "krishna"]),
    ("Vijayawada", ["vijayawada", "vijaywada", "bezawada"]),
    ("Visakhapatnam", ["visakhapatnam", "vizag", "waltair", "visakahaphatnam"]),
    ("Hyderabad", ["hyderabad", "cyberabad", "secunderabad"]),
    ("Bengaluru", ["bengaluru", "bangalore"]),
    ("Mumbai", ["mumbai", "bombay"]),
    ("Gujarat Coast", ["gujarat coast"]),
    
    # 19 Global Curated Targets
    ("Dubai", ["dubai", "uae"]),
    ("Tokyo", ["tokyo", "tokyo bay"]),
    ("Singapore", ["singapore"]),
    ("New York", ["new york city", "new york", "nyc", "manhattan"]),
    ("Shanghai", ["shanghai"]),
    ("Los Angeles", ["los angeles", "la"]),
    ("Bangkok", ["bangkok"]),
    ("Amazon Basin", ["amazon basin", "the amazon", "amazon rainforest", "amazon forest", "amazon"]),
    ("Congo Basin", ["congo basin", "congo rainforest", "congo"]),
    ("Aral Sea", ["aral sea", "the aral sea"]),
    ("Nile Delta", ["nile delta", "the nile"]),
    ("Mekong Delta", ["mekong delta", "mekong"]),
    ("Great Barrier Reef", ["great barrier reef", "barrier reef"]),
    ("Maldives", ["maldives", "male"]),
    ("San Francisco Bay", ["san francisco bay", "sf bay", "san francisco"]),
    ("Greenland", ["greenland"]),
    ("Swiss Alps", ["swiss alps", "the alps", "alps"]),
    ("Sahara Desert", ["sahara desert", "the sahara", "sahara"]),
    ("Las Vegas", ["las vegas", "vegas"]),

    # Indian States (all 28)
    ("Andhra Pradesh", ["andhra pradesh", "andhra"]),
    ("Arunachal Pradesh", ["arunachal pradesh"]),
    ("Assam", ["assam"]),
    ("Bihar", ["bihar"]),
    ("Chhattisgarh", ["chhattisgarh"]),
    ("Goa", ["goa"]),
    ("Gujarat", ["gujarat"]),
    ("Haryana", ["haryana"]),
    ("Himachal Pradesh", ["himachal pradesh"]),
    ("Jharkhand", ["jharkhand"]),
    ("Karnataka", ["karnataka"]),
    ("Kerala", ["kerala"]),
    ("Madhya Pradesh", ["madhya pradesh"]),
    ("Maharashtra", ["maharashtra"]),
    ("Manipur", ["manipur"]),
    ("Meghalaya", ["meghalaya"]),
    ("Mizoram", ["mizoram"]),
    ("Nagaland", ["nagaland"]),
    ("Odisha", ["odisha", "orissa"]),
    ("Punjab", ["punjab"]),
    ("Rajasthan", ["rajasthan"]),
    ("Sikkim", ["sikkim"]),
    ("Tamil Nadu", ["tamil nadu"]),
    ("Telangana", ["telangana"]),
    ("Tripura", ["tripura"]),
    ("Uttar Pradesh", ["uttar pradesh"]),
    ("Uttarakhand", ["uttarakhand"]),
    ("West Bengal", ["west bengal"]),

    # Union Territories (8)
    ("Andaman and Nicobar", ["andaman and nicobar", "andaman", "nicobar"]),
    ("Chandigarh", ["chandigarh"]),
    ("Dadra and Nagar Haveli and Daman and Diu", ["dadra and nagar haveli", "daman and diu"]),
    ("Delhi", ["delhi", "new delhi", "ncr"]),
    ("Jammu and Kashmir", ["jammu and kashmir", "jammu", "kashmir"]),
    ("Ladakh", ["ladakh", "leh"]),
    ("Lakshadweep", ["lakshadweep"]),
    ("Puducherry", ["puducherry", "pondicherry"]),
]

NON_EO_PATTERNS = [
    r"^(hi|hello|hey|greetings|good\s+morning|good\s+evening)\b",
    r"\b(weather|forecast|rain\s+today|temperature)\b",
    r"\b(joke|funny|laugh)\b",
    r"\b(recipe|cook|food)\b",
    r"\b(who\s+are\s+you|what\s+is\s+your\s+name|who\s+made\s+you)\b",
    r"\b(how\s+are\s+you)\b",
    r"^(asdfgh|xyzabc|qwerty|test|foo|bar|12345)$"
]

AMBIGUOUS_LOCATIONS = {
    "washington": {
        "question": "Which Washington location do you mean?",
        "options": [
            "Washington, D.C. (United States Capital District)",
            "Washington State (Pacific Northwest Region)"
        ]
    }
}

def normalize_known_aliases(text: str) -> str:
    """
    Normalizes common spelling mistakes, colloquial aliases, and abbreviations.
    """
    normalized = text
    alias_map = [
        (r"\bvisakahaphatnam\b", "Visakhapatnam"),
        (r"\bvisakhapatnam\b", "Visakhapatnam"),
        (r"\bvizag\b", "Visakhapatnam"),
        (r"\bwaltair\b", "Visakhapatnam"),
        (r"\bvijaywada\b", "Vijayawada"),
        (r"\bbezawada\b", "Vijayawada"),
        (r"\bkrishna\s+river\s+(in|around|near|along|in/around)?\s*vijayawada\b", "Krishna River in Vijayawada"),
        (r"\bkrishna\s+river\s+vijayawada\b", "Krishna River in Vijayawada"),
        (r"\bkrishna\s+in\s+vijayawada\b", "Krishna River in Vijayawada"),
        (r"\bthe\s+amazon\b", "Amazon Basin"),
        (r"\bthe\s+aral\s+sea\b", "Aral Sea"),
    ]
    for pattern, replacement in alias_map:
        normalized = re.sub(pattern, replacement, normalized, flags=re.IGNORECASE)
    return normalized

def heuristic_parse_intent(
    query: str,
    previous_context: Optional[Dict[str, Any]] = None,
    recalled_context: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Full-featured NLP query understanding engine for Earth-observation requests.
    Extracts location, time period, analysis type, user intent, and data used.
    Integrates Hindsight Agent Memory to resolve indirect references ('that area',
    'same location', 'previous analysis') and apply learned user preferences.
    """
    q_raw = query.strip()
    q_clean = q_raw.strip(" ?.,;!")
    q_lower = q_clean.lower()

    # 1. Non-Earth Observation / Conversational Check
    is_non_eo = False
    for pat in NON_EO_PATTERNS:
        if re.search(pat, q_lower):
            # If weather/joke/recipe/gibberish is detected
            if any(w in q_lower for w in ["weather", "forecast", "joke", "recipe", "who are you", "what is your name", "who made you"]):
                is_non_eo = True
                break
            if re.match(r"^(asdfgh|xyzabc|qwerty|foo|bar|12345)$", q_lower):
                is_non_eo = True
                break

    if is_non_eo:
        return {
            "is_earth_observation": False,
            "rejection_reason": "SatQueryAI is designed for satellite and Earth-observation analysis. Try asking about environmental, land-use, water, vegetation, or urban changes for a location.",
            "location": None,
            "target_type": None,
            "start_year": DEFAULT_START_YEAR,
            "end_year": DEFAULT_END_YEAR,
            "focus_indicator": "all",
            "analysis_type": "multi_year_change",
            "user_intent": "invalid",
            "query_text": q_raw,
        }

    # 2. Ambiguity Detection
    for ambig_key, ambig_data in AMBIGUOUS_LOCATIONS.items():
        if re.search(rf"\b{ambig_key}\b", q_lower) and not re.search(rf"\b({ambig_key}\s*d\.?c\.?|{ambig_key}\s*state)\b", q_lower):
            return {
                "is_earth_observation": True,
                "is_ambiguous": True,
                "clarification_question": ambig_data["question"],
                "disambiguation_options": ambig_data["options"],
                "location": None,
                "target_type": "ambiguous",
                "start_year": DEFAULT_START_YEAR,
                "end_year": DEFAULT_END_YEAR,
                "focus_indicator": "all",
                "analysis_type": "multi_year_change",
                "user_intent": "clarification_needed",
                "query_text": q_raw,
            }

    # 3. Temporal Extraction
    start_year = DEFAULT_START_YEAR
    end_year = DEFAULT_END_YEAR
    defaulted_dates = True
    year_warning = None

    # Match "since 2021" / "since 2022"
    m_since = re.search(r"\bsince\s+(201[5-9]|202[0-7])\b", q_lower)
    # Match "from 2020 to 2026" / "between 2021 and 2026" / "in 2020 and 2026" / "2020 vs 2026" / "compare 2020 and 2026"
    m_range = re.search(r"\b(from|between|in)?\s*(201[5-9]|202[0-7])\s*(to|and|vs|-)\s*(201[5-9]|202[0-7])\b", q_lower)
    # Match "over the last 5 years" / "past 5 years"
    m_last_n = re.search(r"\b(over\s+the\s+last|past)\s+(\d+)\s+years?\b", q_lower)

    if m_since:
        start_year = int(m_since.group(1))
        end_year = DEFAULT_END_YEAR
        defaulted_dates = False
    elif m_range:
        y1 = int(m_range.group(2))
        y2 = int(m_range.group(4))
        start_year = min(y1, y2)
        end_year = max(y1, y2)
        defaulted_dates = False
    elif m_last_n:
        n_years = int(m_last_n.group(2))
        start_year = max(2016, DEFAULT_END_YEAR - n_years)
        end_year = DEFAULT_END_YEAR
        defaulted_dates = False
    else:
        # Check any standalone year
        all_years = [int(y) for y in re.findall(r"\b(201[5-9]|202[0-7])\b", q_lower)]
        if len(all_years) >= 2:
            start_year = min(all_years[0], all_years[1])
            end_year = max(all_years[0], all_years[1])
            defaulted_dates = False
        elif len(all_years) == 1:
            if all_years[0] <= 2022:
                start_year = all_years[0]
                end_year = DEFAULT_END_YEAR
            else:
                start_year = DEFAULT_START_YEAR
                end_year = all_years[0]
            defaulted_dates = False

    # Check for requested years outside operational satellite coverage (e.g. 1990, 2010)
    out_of_range_years = [int(y) for y in re.findall(r"\b(19\d\d|200\d|201[0-4]|203\d)\b", q_lower)]
    if out_of_range_years:
        bad_y = out_of_range_years[0]
        year_warning = f"{bad_y} satellite imagery is not available for this target. Available Copernicus Sentinel-2 & Wayback imagery covers 2016 to 2026."

    # 4. Focus Indicator & Analysis Type
    focus_indicator = "all"
    analysis_type = "multi_year_change"
    user_intent = "compare"

    if any(re.search(rf"\b{k}", q_lower) for k in ["deforest", "canopy loss", "tree loss", "forest loss", "clearing"]):
        focus_indicator = "deforestation"
        analysis_type = "deforestation"
    elif any(re.search(rf"\b{k}", q_lower) for k in ["urban", "built", "city", "construction", "expansion", "road", "infrastructure"]):
        focus_indicator = "urban"
        analysis_type = "urban_growth"
    elif any(re.search(rf"\b{k}\b", q_lower) for k in ["vegetation", "greenery", "canopy", "crops", "farm", "biomass", "ndvi", "greening", "green cover"]):
        focus_indicator = "vegetation"
        analysis_type = "vegetation_change"
    elif any(re.search(rf"\b{k}", q_lower) for k in ["water", "river", "lake", "reservoir", "coast", "flood", "sea", "ocean", "ndwi"]):
        focus_indicator = "water"
        analysis_type = "water_change"

    # 5. Extract Location
    extracted_location = None
    target_type = "location"

    # Check known global / state targets first
    for canonical_name, aliases in KNOWN_GLOBAL_TARGETS:
        for alias in aliases:
            if re.search(rf"\b{re.escape(alias)}\b", q_lower):
                extracted_location = canonical_name
                break
        if extracted_location:
            break

    # Anaphoric / Indirect reference triggers
    anaphoric_phrases = [
        "that area", "that region", "that city", "same area", "same region", "same location",
        "the same area", "the same region", "previous analysis", "my previous analysis",
        "earlier analysis", "last analysis", "previous location", "earlier region",
        "compare with my previous", "compare with the last", "check again", "what changed there"
    ]
    has_anaphora = any(phrase in q_lower for phrase in anaphoric_phrases)

    memory_used = False
    memory_note = None

    # Step 5a: Hindsight Agent Memory Resolution (Priority for cross-session continuity)
    if (not extracted_location or has_anaphora) and recalled_context:
        recalled_loc = recalled_context.get("resolved_location")
        if recalled_loc:
            extracted_location = recalled_loc
            memory_used = True
            memory_note = f"Resolved '{recalled_loc}' from prior Hindsight agent memory."
            logger.info(f"Hindsight memory resolved location '{extracted_location}' for query '{query}'")

    # Step 5b: Apply learned user preferences from Hindsight
    if recalled_context and recalled_context.get("preferences"):
        for pref in recalled_context["preferences"]:
            p_lower = str(pref).lower()
            if any(term in p_lower for term in ["agri", "crop", "farm"]) and focus_indicator == "all":
                focus_indicator = "vegetation"
                analysis_type = "vegetation_change"
                memory_used = True
                memory_note = (memory_note or "") + " Prioritized agricultural vegetation from learned preferences."
            elif "water" in p_lower and focus_indicator == "all":
                focus_indicator = "water"
                analysis_type = "water_change"
                memory_used = True
            elif "urban" in p_lower and focus_indicator == "all":
                focus_indicator = "urban"
                analysis_type = "urban_growth"
                memory_used = True

    # Step 5c: Ephemeral in-session fallback
    is_followup = False
    if not extracted_location and previous_context and previous_context.get("location"):
        followup_signals = ["vegetation", "water", "urban", "crops", "only", "what about", "show", "compare", "deforestation"]
        if any(sig in q_lower for sig in followup_signals) or not defaulted_dates:
            extracted_location = previous_context["location"]
            is_followup = True
            if defaulted_dates and previous_context.get("start_year"):
                start_year = previous_context["start_year"]
                end_year = previous_context.get("end_year", DEFAULT_END_YEAR)
                defaulted_dates = False

    # Syntactic extraction fallback if still not resolved
    if not extracted_location:
        loc_candidate = q_raw
        prefixes = [
            r"^what\s+changed\s+(around|in|near|along\s+the|along|of)?\s*",
            r"^has\s+(vegetation|urbanization|water)\s+(changed|increased|decreased)\s+(around|in|near|along\s+the|along|of)?\s*",
            r"^show\s+(me\s+)?(what\s+changed|changes|urban\s+growth|urban\s+expansion|vegetation\s+loss|vegetation\s+growth|vegetation\s+changes|vegetation|deforestation|water\s+changes|water)\s+(around|in|near|along\s+the|along|of)?\s*",
            r"^analyze\s+(changes\s+in|the\s+area\s+around|the\s+region\s+around|in|around|near|along\s+the|along|of)?\s*",
            r"^compare\s+(changes\s+in|central\s+|the\s+area\s+around|the\s+)?\s*",
            r"^where\s+did\s+(urban\s+expansion|deforestation|change)\s+happen\s+(in|around|near)?\s*",
            r"^how\s+has\s+(the\s+)?(coastline|vegetation|city|river)\s+changed\s+(in|around|near)?\s*"
        ]
        for p in prefixes:
            loc_candidate = re.sub(p, "", loc_candidate, flags=re.IGNORECASE).strip()

        # Remove temporal clauses
        loc_candidate = re.sub(
            r"\s+(since\s+\d{4}|from\s+\d{4}\s+to\s+\d{4}|between\s+\d{4}\s+and\s+\d{4}|in\s+\d{4}\s+and\s+\d{4}|\d{4}\s*(vs|-|and)\s*\d{4}|over\s+the\s+last\s+\d+\s+years?).*$",
            "",
            loc_candidate,
            flags=re.IGNORECASE
        ).strip()
        loc_candidate = re.sub(r"^(the|along\s+the|along|in|around|near)\s+", "", loc_candidate, flags=re.IGNORECASE).strip(" ?.,;")
        
        if loc_candidate and len(loc_candidate) >= 3 and not re.match(r"^(what|how|where|when|why|tell|show|analyze|compare)$", loc_candidate, flags=re.IGNORECASE):
            extracted_location = loc_candidate

    return {
        "is_earth_observation": True,
        "is_followup": is_followup,
        "is_ambiguous": False,
        "location": extracted_location,
        "target_type": target_type,
        "start_year": start_year,
        "end_year": end_year,
        "start_date": f"{start_year}-01-01",
        "end_date": f"{end_year}-12-31",
        "focus_indicator": focus_indicator,
        "analysis_type": analysis_type,
        "user_intent": user_intent,
        "defaulted_dates": defaulted_dates,
        "year_warning": year_warning,
        "query_text": q_raw,
        "memory_used": memory_used,
        "memory_note": memory_note,
        "data_used": {
            "satellite_imagery": "Copernicus Sentinel-2 & Esri Wayback",
            "period": f"{start_year}–{end_year}",
            "aoi": extracted_location or "Unresolved",
            "indicators": "NDVI / NDBI / NDWI",
            "change_detection": "Morphological Spectral Vector Classification"
        }
    }

async def parse_nlp_intent(
    query: str,
    previous_context: Optional[Dict[str, Any]] = None,
    recalled_context: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Parses natural language Earth-observation query with high accuracy heuristic rules,
    falling back to Gemini when ambiguous or needed. Integrates Hindsight Agent Memory.
    """
    heuristic_res = heuristic_parse_intent(
        query,
        previous_context=previous_context,
        recalled_context=recalled_context
    )
    
    # If the heuristic parser already resolved the query definitively, return immediately
    if not heuristic_res.get("is_earth_observation"):
        return heuristic_res
    if heuristic_res.get("is_ambiguous"):
        return heuristic_res
    if heuristic_res.get("location"):
        return heuristic_res

    if not settings.GEMINI_API_KEY and not settings.GOOGLE_API_KEY:
        return heuristic_res

    # Use Gemini LLM when heuristic did not isolate a location
    try:
        import asyncio
        import google.generativeai as genai
        api_key = settings.GEMINI_API_KEY or settings.GOOGLE_API_KEY
        genai.configure(api_key=api_key, transport="rest")

        prompt = f"""
You are an Earth Observation Analyst NLP engine.
Extract the target location name, requested start year, requested end year, and focus indicator from this query:
"{query}"

Respond strictly with valid JSON conforming to this schema:
{{
  "location": "Name of city/region/landmark or null",
  "start_year": 2021,
  "end_year": 2026,
  "focus_indicator": "all" | "vegetation" | "urban" | "water" | "deforestation",
  "analysis_type": "multi_year_change" | "urban_growth" | "vegetation_change" | "water_change" | "deforestation"
}}
If no years are mentioned, default start_year to 2021 and end_year to 2026.
JSON only, no markdown formatting.
"""

        parsed = None
        for m_name in ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-flash-latest"]:
            try:
                model = genai.GenerativeModel(m_name)
                response = await asyncio.wait_for(asyncio.to_thread(model.generate_content, prompt), timeout=6.0)
                text = response.text.strip().replace("```json", "").replace("```", "").strip()
                parsed = json.loads(text)
                break
            except Exception as me:
                logger.info(f"NLP model {m_name} note: {me}")
                continue

        if not parsed:
            return heuristic_res
        
        start_y = int(parsed.get("start_year", heuristic_res["start_year"]))
        end_y = int(parsed.get("end_year", heuristic_res["end_year"]))
        loc = parsed.get("location") or heuristic_res.get("location")
        
        heuristic_res.update({
            "location": loc,
            "start_year": start_y,
            "end_year": end_y,
            "start_date": f"{start_y}-01-01",
            "end_date": f"{end_y}-12-31",
            "focus_indicator": parsed.get("focus_indicator", heuristic_res["focus_indicator"]),
            "analysis_type": parsed.get("analysis_type", heuristic_res["analysis_type"]),
            "data_used": {
                "satellite_imagery": "Copernicus Sentinel-2 & Esri Wayback",
                "period": f"{start_y}–{end_y}",
                "aoi": loc or "Unresolved",
                "indicators": "NDVI / NDBI / NDWI",
                "change_detection": "Morphological Spectral Vector Classification"
            }
        })
        return heuristic_res
    except Exception as e:
        logger.warning(f"Gemini NLP intent parsing exception: {e}. Using heuristic parsing.")
        return heuristic_res
