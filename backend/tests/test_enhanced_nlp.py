import re
from typing import Dict, Any, Optional

DEFAULT_START_YEAR = 2021
DEFAULT_END_YEAR = 2026

KNOWN_GLOBAL_TARGETS = [
    ("Vijayawada", ["vijayawada", "vijaywada", "bezawada"]),
    ("Dubai", ["dubai"]),
    ("Hyderabad", ["hyderabad"]),
    ("Bengaluru", ["bengaluru", "bangalore"]),
    ("Krishna River", ["krishna river", "krishna"]),
    ("Krishna River in Vijayawada", ["krishna river in vijayawada", "krishna river vijayawada", "krishna in vijayawada"]),
    ("Visakhapatnam", ["visakhapatnam", "vizag", "waltair", "visakahaphatnam"]),
    ("Amazon Basin", ["amazon basin", "the amazon", "amazon rainforest", "amazon forest", "amazon"]),
    ("Tokyo", ["tokyo"]),
    ("Andhra Pradesh", ["andhra pradesh", "andhra"]),
    ("Greenland", ["greenland"]),
    ("New York", ["new york city", "new york", "nyc", "manhattan"]),
    ("Aral Sea", ["aral sea", "the aral sea"]),
    ("Mumbai", ["mumbai", "bombay"]),
    ("Gujarat Coast", ["gujarat coast", "gujarat"]),
    ("Congo Basin", ["congo basin", "congo rainforest", "congo"]),
    ("Nile Delta", ["nile delta", "nile"]),
    ("Mekong Delta", ["mekong delta", "mekong"]),
    ("Great Barrier Reef", ["great barrier reef", "barrier reef"]),
    ("Maldives", ["maldives", "male"]),
    ("San Francisco Bay", ["san francisco bay", "sf bay", "san francisco"]),
    ("Swiss Alps", ["swiss alps", "alps"]),
    ("Sahara Desert", ["sahara desert", "sahara"]),
    ("Las Vegas", ["las vegas", "vegas"]),
    ("Singapore", ["singapore"]),
    ("Shanghai", ["shanghai"]),
    ("Los Angeles", ["los angeles", "la"]),
    ("Bangkok", ["bangkok"]),
]

NON_EO_PATTERNS = [
    r"^(hi|hello|hey|greetings|good\s+morning|good\s+evening)\b",
    r"weather",
    r"forecast",
    r"joke",
    r"recipe",
    r"who\s+are\s+you",
    r"what\s+is\s+your\s+name",
    r"who\s+made\s+you",
    r"how\s+are\s+you",
    r"^(asdfgh|xyzabc|qwerty|test|foo|bar|12345)$"
]

AMBIGUOUS_LOCATIONS = {
    "washington": {
        "is_ambiguous": True,
        "question": "Which Washington location do you mean?",
        "options": [
            "Washington, D.C. (United States Capital District)",
            "Washington State (Pacific Northwest Region)"
        ]
    }
}

def enhanced_parse_intent(query: str, previous_context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    q_raw = query.strip()
    q_clean = q_raw.strip(" ?.,;!")
    q_lower = q_clean.lower()

    # 1. Check Non-Earth Observation / Conversational queries
    is_non_eo = False
    for pat in NON_EO_PATTERNS:
        if re.search(pat, q_lower):
            # But if a known target is explicitly in query, it might still be EO (e.g. "weather in Dubai" is non-EO)
            if any(w in q_lower for w in ["weather", "forecast", "joke", "recipe", "who are you", "what is your name", "who made you"]):
                is_non_eo = True
                break
            if re.match(r"^(asdfgh|xyzabc|qwerty|foo|bar)$", q_lower):
                is_non_eo = True
                break

    if is_non_eo:
        return {
            "is_earth_observation": False,
            "rejection_reason": "SatQueryAI is designed for satellite and Earth-observation analysis. Try asking about environmental, land-use, water, vegetation, or urban changes for a location.",
            "location": None,
            "start_year": DEFAULT_START_YEAR,
            "end_year": DEFAULT_END_YEAR,
            "focus_indicator": "all",
            "analysis_type": "multi_year_change",
            "user_intent": "invalid"
        }

    # 2. Check for Ambiguous Locations
    for ambig_key, ambig_data in AMBIGUOUS_LOCATIONS.items():
        if re.search(rf"\b{ambig_key}\b", q_lower) and not re.search(rf"\b({ambig_key}\s+d\.?c\.?|{ambig_key}\s+state)\b", q_lower):
            return {
                "is_earth_observation": True,
                "is_ambiguous": True,
                "clarification_question": ambig_data["question"],
                "disambiguation_options": ambig_data["options"],
                "location": None,
                "start_year": DEFAULT_START_YEAR,
                "end_year": DEFAULT_END_YEAR,
                "focus_indicator": "all",
                "analysis_type": "multi_year_change",
                "user_intent": "clarification_needed"
            }

    # 3. Temporal Extraction
    start_year = DEFAULT_START_YEAR
    end_year = DEFAULT_END_YEAR
    defaulted_dates = True
    year_warning = None

    # Match "since 2021" / "since 2022"
    m_since = re.search(r"\bsince\s+(201[5-9]|202[0-7])\b", q_lower)
    # Match "from 2020 to 2026" / "between 2021 and 2026" / "2020 vs 2026" / "compare 2020 and 2026"
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
            # Word-boundary check
            if re.search(rf"\b{re.escape(alias)}\b", q_lower):
                extracted_location = canonical_name
                break
        if extracted_location:
            break

    # If no known target, check if this is a follow-up query inheriting previous location
    is_followup = False
    if not extracted_location and previous_context and previous_context.get("location"):
        # If the query is asking about an indicator or year change without specifying a location
        # e.g. "What about vegetation?", "Show only water", "Compare only 2022 and 2026"
        followup_signals = ["vegetation", "water", "urban", "crops", "only", "what about", "show", "compare", "deforestation"]
        if any(sig in q_lower for sig in followup_signals) or not defaulted_dates:
            extracted_location = previous_context["location"]
            is_followup = True
            if defaulted_dates and previous_context.get("start_year"):
                start_year = previous_context["start_year"]
                end_year = previous_context.get("end_year", DEFAULT_END_YEAR)
                defaulted_dates = False

    # If still not found, try syntactic extraction
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
        loc_candidate = re.sub(r"\s+(since\s+\d{4}|from\s+\d{4}\s+to\s+\d{4}|between\s+\d{4}\s+and\s+\d{4}|in\s+\d{4}\s+and\s+\d{4}|\d{4}\s*(vs|-|and)\s*\d{4}|over\s+the\s+last\s+\d+\s+years?).*$", "", loc_candidate, flags=re.IGNORECASE).strip()
        loc_candidate = re.sub(r"^(the|along\s+the|along|in|around|near)\s+", "", loc_candidate, flags=re.IGNORECASE).strip(" ?.,;")
        
        if loc_candidate and len(loc_candidate) >= 3 and not re.match(r"^(what|how|where|when|why|tell|show|analyze|compare)$", loc_candidate, flags=re.IGNORECASE):
            extracted_location = loc_candidate

    return {
        "is_earth_observation": True,
        "is_followup": is_followup,
        "is_ambiguous": False,
        "location": extracted_location,
        "start_year": start_year,
        "end_year": end_year,
        "focus_indicator": focus_indicator,
        "analysis_type": analysis_type,
        "user_intent": user_intent,
        "defaulted_dates": defaulted_dates,
        "year_warning": year_warning,
        "query_text": q_raw,
        "data_used": {
            "satellite_imagery": "Copernicus Sentinel-2 & Esri Wayback",
            "period": f"{start_year}–{end_year}",
            "aoi": extracted_location or "Unresolved",
            "indicators": "NDVI / NDBI / NDWI",
            "change_detection": "Morphological Spectral Vector Classification"
        }
    }

if __name__ == "__main__":
    queries = [
        "What changed in Vijayawada since 2021?",
        "What changed in Dubai from 2020 to 2026?",
        "Compare Dubai in 2021 and 2026",
        "Show urban growth in Hyderabad between 2021 and 2026",
        "Has vegetation changed in Bengaluru since 2022?",
        "Show water changes in Krishna River from 2021 to 2026",
        "Show deforestation in the Amazon from 2021 to 2026",
        "What changed in Tokyo?",
        "Compare Andhra Pradesh from 2021 to 2026",
        "Show me changes in Greenland",
        "Show urban expansion in New York",
        "Show water changes in the Aral Sea",
        "Show changes in Washington",
        "asdfgh",
        "what is the weather?",
        "tell me a joke",
        "XYZABC"
    ]

    print("=" * 100)
    print("TESTING ENHANCED NLP INTENT & ENTITY EXTRACTION")
    print("=" * 100)
    for q in queries:
        r = enhanced_parse_intent(q)
        loc = str(r.get("location"))
        yrs = f"{r.get('start_year')}..{r.get('end_year')}"
        ind = r.get("focus_indicator")
        eo = r.get("is_earth_observation")
        ambig = r.get("is_ambiguous")
        print(f"[{'EO' if eo else 'INVALID':7}] {q:52} | Loc: {loc:22} | Yrs: {yrs:10} | Ind: {ind:12} | Ambig: {ambig}")

    print("\n" + "=" * 100)
    print("TESTING CONTEXTUAL FOLLOW-UP QUERIES")
    print("=" * 100)
    ctx_dubai = {"location": "Dubai", "start_year": 2020, "end_year": 2026}
    r1 = enhanced_parse_intent("What about vegetation?", previous_context=ctx_dubai)
    print(f"Follow-up: 'What about vegetation?'        -> Loc: {r1['location']:10} | Yrs: {r1['start_year']}..{r1['end_year']} | Ind: {r1['focus_indicator']}")

    r2 = enhanced_parse_intent("Compare only 2022 and 2026", previous_context=ctx_dubai)
    print(f"Follow-up: 'Compare only 2022 and 2026'     -> Loc: {r2['location']:10} | Yrs: {r2['start_year']}..{r2['end_year']} | Ind: {r2['focus_indicator']}")

    ctx_vja = {"location": "Vijayawada", "start_year": 2021, "end_year": 2026}
    r3 = enhanced_parse_intent("Show urban changes", previous_context=ctx_vja)
    print(f"Follow-up: 'Show urban changes'             -> Loc: {r3['location']:10} | Yrs: {r3['start_year']}..{r3['end_year']} | Ind: {r3['focus_indicator']}")
    print("=" * 100)

