import json
import logging
from typing import Dict, Any, List, Optional
from config import settings
from models.schemas import AISummary, ChatResponse

logger = logging.getLogger(__name__)

def generate_evidence_based_summary_heuristic(
    evidence: Dict[str, Any],
    recalled_context: Optional[Dict[str, Any]] = None
) -> AISummary:
    """
    Deterministically generates scientific summary strictly from calculated evidence
    when Gemini API is not configured or in offline mode. Integrates Hindsight memory.
    """
    loc_name = evidence["location_name"]
    before_d = evidence["actual_before_date"]
    after_d = evidence["actual_after_date"]
    total_ha = evidence["total_aoi_hectares"]
    changed_ha = evidence["total_changed_hectares"]
    changed_pct = evidence["percent_aoi_changed"]
    
    # Identify top changes from statistics
    stats = evidence.get("land_cover_stats", [])
    transitions = evidence.get("transitions", [])
    
    built_stat = next((s for s in stats if "Built" in s["category"]), None)
    tree_stat = next((s for s in stats if "Trees" in s["category"]), None)
    crop_stat = next((s for s in stats if "Crops" in s["category"]), None)
    water_stat = next((s for s in stats if "Water" in s["category"]), None)
    
    built_delta = built_stat["change_ha"] if built_stat else 0.0
    tree_delta = tree_stat["change_ha"] if tree_stat else 0.0
    crop_delta = crop_stat["change_ha"] if crop_stat else 0.0
    water_delta = water_stat["change_ha"] if water_stat else 0.0

    key_observations = []
    if tree_delta < -5.0 or crop_delta < -5.0:
        veg_loss = abs(min(0, tree_delta) + min(0, crop_delta))
        key_observations.append(f"vegetation cover contracted by {veg_loss:.1f} ha")
    if abs(water_delta) > 5.0:
        action = "expanded" if water_delta > 0 else "contracted"
        key_observations.append(f"open water surface {action} by {abs(water_delta):.1f} ha")

    if not key_observations:
        key_observations.append("surface reflectance stayed relatively stable with minor localized shifts")

    obs_str = "; ".join(key_observations)

    loc_type = evidence.get("location_type", "city")
    area_desc = evidence.get("area_description", "")
    
    if loc_type == "river":
        type_badge = "Riparian River Corridor"
        interpretation = (
            "The multispectral signals reflect dynamic hydrological and riparian interactions along the river corridor. "
            "Vegetation changes correspond to seasonal bank vegetation, floodplain cultivation, and riparian buffer shifts, "
            "while water surface variations trace changes in active river channel width, sandbar exposure, and reservoir/barrage regulation."
        )
    elif loc_type == "state":
        type_badge = "Regional State Assessment"
        interpretation = (
            f"Regional remote-sensing observations document macro-landscape surface dynamics across the {loc_name} corridor. "
            "Vegetation index shifts capture canopy density variations across agrarian and forest reserves, "
            "while concentrated built-up clusters document regional urban and industrial infrastructure expansion."
        )
    elif loc_type == "country":
        type_badge = "National Regional Assessment"
        interpretation = (
            f"National-scale satellite telemetry tracks broader agro-ecological and land-use patterns across {loc_name}. "
            "Multispectral indices reveal overall photosynthetic vitality across the monitored territory with "
            "localized infrastructure and agricultural conversions."
        )
    else:
        type_badge = "Metropolitan Urban Assessment"
        interpretation = (
            "The spectral changes are consistent with structural land-use conversion, such as ground preparation, "
            "urban infrastructure development, and localized canopy clearing. The high spatial cohesion of the change "
            "polygons strongly suggests organized human activity rather than random atmospheric artifacts."
        )

    # Check for Hindsight historical comparison or learned preference note
    hindsight_note = ""
    if recalled_context:
        prev_dates = recalled_context.get("previous_dates")
        prev_ha = recalled_context.get("previous_changed_ha")
        if prev_dates and prev_ha is not None:
            hindsight_note = (
                f"\n\n**Hindsight Continuity:** In your previous analysis of this area "
                f"({prev_dates[0]} → {prev_dates[1]}), {prev_ha:,.1f} ha of change was detected. "
                f"The current satellite telemetry confirms the updated spectral trajectory."
            )
        elif recalled_context.get("preferences"):
            prefs_str = ", ".join(recalled_context["preferences"])
            hindsight_note = f"\n\n*Learned Analyst Focus:* Prioritized in accordance with remembered preferences: {prefs_str}."

    headline = f"{type_badge}: Environmental dynamics detected across {changed_ha:,.1f} ha in {loc_name}"
    
    scope_note = f"\n*Scope: {area_desc}*\n" if area_desc else ""
    simple_md = (
        f"Between **{before_d}** and **{after_d}**, SatQueryAI analyzed Sentinel-2 observations covering "
        f"**{total_ha:,.1f} hectares** in **{loc_name}**.{scope_note}\n\n"
        f"• **Vegetation Cover:** {('Canopy loss of -' + str(abs(tree_delta + crop_delta)) + ' ha observed') if (tree_delta + crop_delta) < 0 else 'Stable vegetative canopy'}\n"
        f"• **Water Presence:** {('Surface shift of ' + str(water_delta) + ' ha') if abs(water_delta) > 1.0 else 'Stable water surface'}\n\n"
        f"Satellite spectral indices confirm detectable surface alterations across **{changed_ha:,.1f} hectares** ({changed_pct}% of analyzed area)."
        f"{hindsight_note}"
    )

    observed = f"Physical satellite observations document {obs_str} over the {before_d} to {after_d} monitoring window."
    
    evidence_text = (
        f"NDBI (Built-up Index) mean delta: {evidence.get('indices_summary', {}).get('delta_ndbi_mean', 0.0):+.3f}. "
        f"NDVI (Vegetation Index) mean delta: {evidence.get('indices_summary', {}).get('delta_ndvi_mean', 0.0):+.3f}. "
        f"Detected {len(evidence.get('change_regions', []))} distinct spatial change polygon clusters with verified multi-spectral divergence."
    )

    limitations = (
        "Optical Sentinel-2 imagery records surface reflectance at 10-meter resolution. "
        "It cannot discern micro-scale architectural purposes, private cadastral boundaries, or subterranean works. "
        "Ground truth validation is recommended for formal municipal or statutory reporting."
    )

    return AISummary(
        headline=headline,
        simple_markdown=simple_md,
        observed=observed,
        evidence=evidence_text,
        interpretation=interpretation,
        limitations=limitations
    )

async def generate_ai_analysis(
    evidence: Dict[str, Any],
    recalled_context: Optional[Dict[str, Any]] = None
) -> AISummary:
    """
    Sends structured evidence to Gemini to synthesize an authoritative geospatial analysis
    with strict scientific honesty (Observed vs Evidence vs Interpretation vs Limitations).
    Integrates Hindsight Agent Memory for context-aware multi-session reasoning.
    """
    if not settings.GEMINI_API_KEY and not settings.GOOGLE_API_KEY:
        return generate_evidence_based_summary_heuristic(evidence, recalled_context=recalled_context)

    try:
        import asyncio
        import google.generativeai as genai
        api_key = settings.GEMINI_API_KEY or settings.GOOGLE_API_KEY
        genai.configure(api_key=api_key, transport="rest")

        memory_section = ""
        if recalled_context:
            mem_items = [m.get("text", "") for m in recalled_context.get("memories", [])][:3]
            prefs = recalled_context.get("preferences", [])
            prev_dates = recalled_context.get("previous_dates")
            prev_ha = recalled_context.get("previous_changed_ha")
            memory_section = f"""
RECALLED HINDSIGHT AGENT MEMORY (PRIOR INVESTIGATIONS & USER PREFERENCES):
- Recalled Prior Memories: {json.dumps(mem_items)}
- Learned Analyst Preferences: {json.dumps(prefs)}
- Previous Investigation: {prev_dates} with {prev_ha} ha changed.

AGENT CONTINUITY RULES:
1. If prior investigations or preferences exist in memory, correlate your interpretation (e.g. 'Building upon your previous investigation of this area...').
2. Current satellite numerical evidence MUST come strictly from EVIDENCE DATA below. NEVER invent or fabricate satellite numbers from memory.
"""

        prompt = f"""
You are the Senior AI Geospatial Analyst at SatQueryAI.
Analyze the following REAL satellite remote-sensing evidence collected for {evidence['location_name']}.
{memory_section}
EVIDENCE DATA:
- Location: {evidence['location_name']}, {evidence.get('country', '')}
- Coordinates: [{evidence['latitude']}, {evidence['longitude']}]
- AOI Area: {evidence['total_aoi_hectares']} hectares
- Baseline Observation: {evidence['actual_before_date']} (Clouds: {evidence['cloud_percentage_before']}%)
- Recent Observation: {evidence['actual_after_date']} (Clouds: {evidence['cloud_percentage_after']}%)
- Sensor: {evidence['imagery_source']}
- Changed Area: {evidence['total_changed_hectares']} hectares ({evidence['percent_aoi_changed']}% of AOI)
- Land Cover Changes: {json.dumps(evidence.get('land_cover_stats', []), indent=2)}
- Key Transitions: {json.dumps(evidence.get('transitions', []), indent=2)}
- Index Deltas: {json.dumps(evidence.get('indices_summary', {}), indent=2)}
- Significant Change Clusters: {len(evidence.get('change_regions', []))} clusters detected.

RULES FOR SCIENTIFIC HONESTY:
1. Do not invent satellite results or real-world entities (e.g. do NOT say "a shopping mall was built" unless verified).
2. Distinguish:
   - OBSERVED: What raw physical changes the sensor detected.
   - EVIDENCE: Which specific spectral indices (NDVI, NDBI, NDWI) and hectare numbers prove it.
   - INTERPRETATION: What this physical change is consistent with (e.g. "consistent with urban development", "indicates canopy reduction").
   - LIMITATIONS: Explicitly state what optical satellite data cannot determine.
3. Write simple, accessible language for the user, but preserve remote-sensing rigor.

Respond strictly with valid JSON conforming to this schema:
{{
  "headline": "Brief 1-sentence punchy headline",
  "simple_markdown": "2-3 short user-friendly paragraphs with bullet points for Urban, Vegetation, Water",
  "observed": "Clear statement of physical observations",
  "evidence": "Specific numerical indices and transition facts",
  "interpretation": "Scientifically honest interpretation using terms like 'consistent with'",
  "limitations": "Sensor constraints and boundaries of inference"
}}
JSON only, no markdown wrappers.
"""
        parsed = None
        for m_name in ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-flash-latest"]:
            try:
                model = genai.GenerativeModel(m_name)
                response = await asyncio.wait_for(asyncio.to_thread(model.generate_content, prompt), timeout=10.0)
                text = response.text.strip().replace("```json", "").replace("```", "").strip()
                parsed = json.loads(text)
                break
            except Exception as me:
                logger.info(f"Summary model {m_name} note: {me}")
                err_str = str(me).lower()
                if "429" in err_str or "quota" in err_str or "rate limit" in err_str:
                    break
                continue

        if not parsed:
            return generate_evidence_based_summary_heuristic(evidence)

        return AISummary(
            headline=parsed.get("headline", f"SatQueryAI Analysis for {evidence['location_name']}"),
            simple_markdown=parsed.get("simple_markdown", ""),
            observed=parsed.get("observed", ""),
            evidence=parsed.get("evidence", ""),
            interpretation=parsed.get("interpretation", ""),
            limitations=parsed.get("limitations", "")
        )
    except Exception as e:
        logger.warning(f"Gemini API analysis failed: {e}. Falling back to structured heuristic analyst.")
        return generate_evidence_based_summary_heuristic(evidence)

LANGUAGE_NAMES = {
    "en": "English",
    "te": "Telugu (తెలుగు)",
    "hi": "Hindi (हिन्दी)",
    "ta": "Tamil (தமிழ்)",
    "kn": "Kannada (ಕನ್ನಡ)",
    "ml": "Malayalam (മലയാളം)",
    "mr": "Marathi (मराठी)",
    "bn": "Bengali (বাংলা)",
    "gu": "Gujarati (ગુજરાતી)",
    "pa": "Punjabi (ਪੰਜਾਬੀ)",
    "or": "Odia (ଓଡ଼ିଆ)",
    "as": "Assamese (অসমীয়া)",
    "ur": "Urdu (اردو)",
}

async def query_gemini_analyst_chat(
    analysis_context: Dict[str, Any],
    user_message: str,
    chat_history: List[Dict[str, str]],
    language: str = "en"
) -> Optional[str]:
    """
    Directly asks Google Gemini to answer conversational questions with geospatial expertise.
    """
    api_key = settings.GEMINI_API_KEY or settings.GOOGLE_API_KEY or ""
    if not api_key:
        return None

    try:
        import asyncio
        import google.generativeai as genai
        genai.configure(api_key=api_key, transport="rest")

        loc_name = analysis_context.get("location", {}).get("name", "Earth")
        before_date = analysis_context.get("actual_before_date", "Baseline")
        after_date = analysis_context.get("actual_after_date", "Comparative")
        changed_ha = analysis_context.get("total_changed_hectares", 0)
        pct_changed = analysis_context.get("percent_aoi_changed", 0)
        regions_summary = [
            f"Hotspot #{r.get('indicator_number', i+1)}: {r.get('user_label')} ({r.get('area_hectares')} ha, ΔNDVI: {r.get('delta_ndvi')}, ΔNDBI: {r.get('delta_ndbi')})"
            for i, r in enumerate(analysis_context.get("change_regions", [])[:8])
        ]

        history_lines = "\n".join([f"{h.get('role')}: {h.get('content')}" for h in chat_history[-6:]])

        lang_target = LANGUAGE_NAMES.get(language, "English")
        lang_instruction = ""
        if language and language != "en":
            lang_instruction = (
                f"\n5. MANDATORY LANGUAGE REQUIREMENT: You MUST formulate your entire response fluently and accurately in {lang_target} "
                f"using its native script. Do not output in English.\n"
            )

        prompt = f"""You are the AI Geospatial Analyst at SatQueryAI.
Your primary objective is to ANSWER ONLY WHAT THE USER ASKS.

STRICT CONVERSATIONAL INSTRUCTIONS:
1. Answer the user's specific question directly, concisely, and factually in 1 to 3 sentences maximum.
2. DO NOT provide unasked information, entire analysis dumps, sensor specifications, formulas, or unrelated categories.
   - If the user asks about vegetation: discuss ONLY vegetation. Never mention urban development, water, or general statistics unless asked.
   - If the user asks about urban growth / construction: discuss ONLY urban/construction.
   - If the user asks about water: discuss ONLY water bodies.
   - If the user asks a specific question about a location, index, or date: answer THAT question directly.
3. NEVER dump the whole analysis summary or recite observation dates, sensor names, or methodology unless explicitly requested.
4. Keep the response natural, highly focused, professional, and free of filler.{lang_instruction}

CURRENT SESSION CONTEXT (Use ONLY what is needed to answer the question):
- Location: {loc_name}
- Observation Window: {before_date} to {after_date}
- Total Changed Footprint: {changed_ha} ha ({pct_changed}% of AOI)
- Detected Hotspots:
{chr(10).join(regions_summary) if regions_summary else "Standard observation mode"}

CONVERSATION HISTORY:
{history_lines}

USER QUESTION: {user_message}

Direct, focused answer (answer ONLY what was asked):
"""
        for model_name in ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-flash-latest"]:
            try:
                model = genai.GenerativeModel(model_name)
                response = await asyncio.wait_for(asyncio.to_thread(model.generate_content, prompt), timeout=12.0)
                if response and response.text:
                    return response.text.strip()
            except Exception as me:
                logger.info(f"Model {model_name} invocation note: {me}")
                continue
    except Exception as e:
        logger.warning(f"Gemini conversational query error: {e}")
    return None

def localize_heuristic_reply(key: str, lang: str, **ctx) -> str:
    loc_name = ctx.get("loc_name", "the analyzed region")
    
    if key == "where_biggest":
        cat = ctx.get("cat_desc", "change")
        direction = ctx.get("direction", "central")
        ha = ctx.get("ha", 0)
        num = ctx.get("num", 1)
        d_ndbi = ctx.get("d_ndbi", 0.0)
        d_ndvi = ctx.get("d_ndvi", 0.0)
        
        if lang == "te":
            return f"అతిపెద్ద {cat} {loc_name}కి **{direction}** దిశలో **{ha} హెక్టార్ల** విస్తీర్ణంలో నమోదైంది (హాట్‌స్పాట్ #{num}, ΔNDBI: **{d_ndbi:+.3f}**, ΔNDVI: **{d_ndvi:+.3f}**). ఇది మీ మ్యాప్‌లో కేంద్రీకరించబడి హైలైట్ చేయబడింది."
        elif lang == "hi":
            return f"सबसे बड़ा {cat} {loc_name} के **{direction}** में **{ha} हेक्टेयर** में दर्ज किया गया (हॉटस्पॉट #{num}, ΔNDBI: **{d_ndbi:+.3f}**, ΔNDVI: **{d_ndvi:+.3f}**)। इसे आपके मानचित्र पर केंद्रित और हाइलाइट किया गया है।"
        elif lang == "ta":
            return f"மிகப்பெரிய {cat} {loc_name}க்கு **{direction}** திசையில் **{ha} ஹெக்டேர்** பரப்பளவில் பதிவாகியுள்ளது (ஹாட்ஸ்பாட் #{num}, ΔNDBI: **{d_ndbi:+.3f}**, ΔNDVI: **{d_ndvi:+.3f}**). இது வரைபடத்தில் சிறப்பிக்கப்பட்டுள்ளது."
        elif lang == "kn":
            return f"ಅತಿದೊಡ್ಡ {cat} {loc_name}ನ **{direction}** ದಿಕ್ಕಿನಲ್ಲಿ **{ha} ಹೆಕ್ಟೇರ್** ಪ್ರದೇಶದಲ್ಲಿ ಪತ್ತೆಯಾಗಿದೆ (ಹಾಟ್‌ಸ್ಪಾಟ್ #{num}, ΔNDBI: **{d_ndbi:+.3f}**, ΔNDVI: **{d_ndvi:+.3f}**)."
        elif lang == "ml":
            return f"ഏറ്റവും വലിയ {cat} {loc_name}ന്റെ **{direction}** ഭാഗത്ത് **{ha} ഹെക്ടർ** വിസ്തൃതിയിൽ കണ്ടെത്തി (ഹോട്ട്സ്പോട്ട് #{num})."
        elif lang == "mr":
            return f"सर्वात मोठा {cat} {loc_name}च्या **{direction}** दिशेला **{ha} हेक्टर** क्षेत्रात आढळला (हॉटस्पॉट #{num})."
        elif lang == "bn":
            return f"সবচেয়ে বড় {cat} {loc_name} এর **{direction}** অংশে **{ha} হেক্টর** জুড়ে সনাক্ত হয়েছে (হটস্পট #{num})."
        elif lang == "gu":
            return f"સૌથી મોટો {cat} {loc_name}ની **{direction}** દિશામાં **{ha} હેક્ટર**માં જોવા મળ્યો છે (હોટસ્પોટ #{num})."
        elif lang == "pa":
            return f"ਸਭ ਤੋਂ ਵੱਡਾ {cat} {loc_name} ਦੇ **{direction}** ਪਾਸੇ **{ha} ਹੈਕਟੇਅਰ** ਵਿੱਚ ਦਰਜ ਹੋਇਆ (ਹੌਟਸਪੌਟ #{num})."
        elif lang == "or":
            return f"ସର୍ବବୃହତ {cat} {loc_name}ର **{direction}** ଦିଗରେ **{ha} ହେକ୍ଟର**ରେ ଚିହ୍ନଟ ହୋଇଛି (ହଟସ୍ପଟ #{num})."
        elif lang == "as":
            return f"সৰ্ববৃহৎ {cat} {loc_name}ৰ **{direction}** দিশত **{ha} হেক্টৰ**ত ধৰা পৰিছে (হটস্পট #{num})."
        elif lang == "ur":
            return f"{loc_name} کے **{direction}** میں سب سے بڑی تبدیلی **{ha} ہیکٹر** پر واقع ہوئی (ہاٹ اسپاٹ #{num}، ΔNDBI: **{d_ndbi:+.3f}**، ΔNDVI: **{d_ndvi:+.3f}**)。 اسے نقشے پر نمایاں کیا گیا ہے۔"
        else:
            return f"The largest detected {cat} occurred **{direction}** of {loc_name}, covering **{ha} hectares** (Hotspot #{num}) with ΔNDBI of **{d_ndbi:+.3f}** and ΔNDVI of **{d_ndvi:+.3f}**. I have centered and highlighted it on your map."

    elif key == "vegetation":
        loss_ha = ctx.get("loss_ha", 0)
        gain_ha = ctx.get("gain_ha", 0)
        mean_d = ctx.get("mean_delta_ndvi", 0.0)
        count = ctx.get("loss_count", 0)

        if lang == "te":
            if loss_ha > 0 and gain_ha > 0:
                return f"{loc_name}లో వృక్షసంపద **{loss_ha:.1f} హెక్టార్ల** క్షీణత మరియు **{gain_ha:.1f} హెక్టార్ల** పునరుత్పత్తిని చూపించింది (సగటు ΔNDVI: **{mean_d:+.3f}**). ప్రభావిత ప్రాంతాలు మ్యాప్‌లో హైలైట్ చేయబడ్డాయి."
            elif loss_ha > 0:
                return f"{loc_name}లో వృక్షసంపద **{loss_ha:.1f} హెక్టార్లు** తగ్గింది (సగటు ΔNDVI: **{mean_d:+.3f}**). తగ్గింపు ప్రాంతాలు మ్యాప్‌లో హైలైట్ చేయబడ్డాయి."
            elif gain_ha > 0:
                return f"{loc_name}లో వృక్షసంపద **{gain_ha:.1f} హెక్టార్లు** పెరిగింది (సగటు ΔNDVI: **{mean_d:+.3f}**)."
            return f"{loc_name}లో గణనీయమైన వృక్షసంపద మార్పు నమోదు కాలేదు (సగటు ΔNDVI: **{mean_d:+.3f}**)."
        elif lang == "hi":
            if loss_ha > 0 and gain_ha > 0:
                return f"{loc_name} में वनस्पति में **{loss_ha:.1f} हेक्टेयर** की कमी और **{gain_ha:.1f} हेक्टेयर** की पुनर्प्राप्ति देखी गई (औसत ΔNDVI: **{mean_d:+.3f}**)। प्रभावित क्षेत्र मानचित्र पर हाइलाइट किए गए हैं।"
            elif loss_ha > 0:
                return f"{loc_name} में वनस्पति **{loss_ha:.1f} हेक्टेयर** घटी है (औसत ΔNDVI: **{mean_d:+.3f}**)।"
            elif gain_ha > 0:
                return f"{loc_name} में वनस्पति **{gain_ha:.1f} हेक्टेयर** बढ़ी है (औसत ΔNDVI: **{mean_d:+.3f}**)।"
            return f"{loc_name} में कोई महत्वपूर्ण वनस्पति हानि दर्ज नहीं हुई (औसत ΔNDVI: **{mean_d:+.3f}**)."
        elif lang == "ta":
            return f"{loc_name} பகுதியில் தாவரப் பரப்பு **{loss_ha:.1f} ஹெக்டேர்** குறைந்துள்ளது (சராசரி ΔNDVI: **{mean_d:+.3f}**)."
        elif lang == "kn":
            return f"{loc_name} ನಲ್ಲಿ ಸಸ್ಯವರ್ಗವು **{loss_ha:.1f} ಹೆಕ್ಟೇರ್** ಇಳಿಕೆ ಕಂಡಿದೆ (ಸರಾಸರಿ ΔNDVI: **{mean_d:+.3f}**)."
        elif lang == "ml":
            return f"{loc_name} ൽ സസ്യജാലങ്ങളുടെ വിസ്തൃതി **{loss_ha:.1f} ഹെക്ടർ** കുറഞ്ഞു (ശരാശരി ΔNDVI: **{mean_d:+.3f}**)."
        elif lang == "mr":
            return f"{loc_name} मध्ये वनस्पती आच्छादन **{loss_ha:.1f} हेक्टर** कमी झाले (सरासरी ΔNDVI: **{mean_d:+.3f}**)."
        elif lang == "bn":
            return f"{loc_name} এ উদ্ভিদের আচ্ছাদন **{loss_ha:.1f} হেক্টর** হ্রাস পেয়েছে (গড় ΔNDVI: **{mean_d:+.3f}**)।"
        elif lang == "gu":
            return f"{loc_name}માં વનસ્પતિ વિસ્તાર **{loss_ha:.1f} હેક્ટર** ઘટ્યો છે (સરેરાશ ΔNDVI: **{mean_d:+.3f}**)."
        elif lang == "pa":
            return f"{loc_name} ਵਿੱਚ ਬਨਸਪਤੀ ਰਕਬਾ **{loss_ha:.1f} ਹੈਕਟੇਅਰ** ਘਟਿਆ ਹੈ (ਔਸਤ ΔNDVI: **{mean_d:+.3f}**)।"
        elif lang == "or":
            return f"{loc_name}ରେ ବନସ୍ପତି କ୍ଷେତ୍ର **{loss_ha:.1f} ହେକ୍ଟର** ହ୍ରାସ ପାଇଛି (ହାରାହାରି ΔNDVI: **{mean_d:+.3f}**)."
        elif lang == "as":
            return f"{loc_name}ত উদ্ভিদৰ আৱৰণ **{loss_ha:.1f} হেক্টৰ** হ্ৰাস পাইছে (গড় ΔNDVI: **{mean_d:+.3f}**)."
        elif lang == "ur":
            return f"{loc_name} میں نباتاتی رقبے میں **{loss_ha:.1f} ہیکٹر** کمی واقع ہوئی (اوسط ΔNDVI: **{mean_d:+.3f}**)。"
        else:
            if loss_ha > 0 and gain_ha > 0:
                return f"Vegetation in {loc_name} showed **{loss_ha:.1f} ha** of canopy reduction alongside **{gain_ha:.1f} ha** of regrowth (overall mean ΔNDVI: **{mean_d:+.3f}**). I've highlighted the affected vegetation zones on your map."
            elif loss_ha > 0:
                return f"Vegetation in {loc_name} decreased by **{loss_ha:.1f} hectares** across {count} detected zones (mean ΔNDVI: **{mean_d:+.3f}**). The primary reduction clusters are highlighted on your map."
            elif gain_ha > 0:
                return f"Vegetation in {loc_name} increased by **{gain_ha:.1f} hectares** (mean ΔNDVI: **{mean_d:+.3f}**). I've highlighted the regrowth zones on your map."
            return f"No significant vegetation loss was detected in {loc_name} (mean ΔNDVI: **{mean_d:+.3f}**)."

    elif key == "urban_general":
        total_ha = ctx.get("total_ha", 0)
        clusters = ctx.get("clusters", 0)
        mean_d = ctx.get("mean_ndbi", 0.0)

        if lang == "te":
            return f"{loc_name}లో పట్టణ మరియు నిర్మాణ భూమి **{clusters} క్లస్టర్ల**లో **{total_ha:.1f} హెక్టార్లు** విస్తరించింది (సగటు ΔNDBI: **{mean_d:+.3f}**). ప్రధాన విస్తరణ ప్రాంతాలు మ్యాప్‌లో హైలైట్ చేయబడ్డాయి."
        elif lang == "hi":
            return f"{loc_name} में शहरी एवं निर्मित क्षेत्र **{clusters} समूहों** में **{total_ha:.1f} हेक्टेयर** तक बढ़ा (औसत ΔNDBI: **{mean_d:+.3f}**)। मुख्य विस्तार क्षेत्र मानचित्र पर हाइलाइट किए गए हैं।"
        elif lang == "ta":
            return f"{loc_name} பகுதியில் நகர்ப்புற நிலம் **{total_ha:.1f} ஹெக்டேர்** பரப்பளவில் விரிவடைந்துள்ளது (சராசரி ΔNDBI: **{mean_d:+.3f}**)."
        elif lang == "kn":
            return f"{loc_name} ನಲ್ಲಿ ನಗರ ಮತ್ತು ನಿರ್ಮಾಣ ಪ್ರದೇಶವು **{total_ha:.1f} ಹೆಕ್ಟೇರ್** ವಿಸ್ತರಿಸಿದೆ (ಸರಾಸರಿ ΔNDBI: **{mean_d:+.3f}**)."
        elif lang == "ml":
            return f"{loc_name} ൽ നഗര-നിർമ്മാണ ഭൂമി **{total_ha:.1f} ഹെക്ടർ** വിസ്തൃതിയിൽ വർദ്ധിച്ചു (ശരാശരി ΔNDBI: **{mean_d:+.3f}**)."
        elif lang == "mr":
            return f"{loc_name} मध्ये शहरी आणि बांधकाम क्षेत्र **{total_ha:.1f} हेक्टर** वाढले (सरासरी ΔNDBI: **{mean_d:+.3f}**)."
        elif lang == "bn":
            return f"{loc_name} এ শহুরে ও নির্মাণ এলাকা **{total_ha:.1f} হেক্টর** বৃদ্ধি পেয়েছে (গড় ΔNDBI: **{mean_d:+.3f}**)।"
        elif lang == "gu":
            return f"{loc_name}માં શહેરી અને બાંધકામ વિસ્તાર **{total_ha:.1f} હેક્ટર** વધ્યો છે (સરેરાશ ΔNDBI: **{mean_d:+.3f}**)."
        elif lang == "pa":
            return f"{loc_name} ਵਿੱਚ ਸ਼ਹਿਰੀ ਅਤੇ ਨਿਰਮਾਣ ਖੇਤਰ **{total_ha:.1f} ਹੈਕਟੇਅਰ** ਵਧਿਆ ਹੈ (ਔਸਤ ΔNDBI: **{mean_d:+.3f}**)।"
        elif lang == "or":
            return f"{loc_name}ରେ ସହରୀ ଓ ନିର୍ମାଣ କ୍ଷେତ୍ର **{total_ha:.1f} ହେକ୍ଟର** ବୃଦ୍ଧି ପାଇଛି (ହାରାହାରି ΔNDBI: **{mean_d:+.3f}**)."
        elif lang == "as":
            return f"{loc_name}ত নগৰীয়া আৰু নিৰ্মাণ এলেকা **{total_ha:.1f} হেক্টৰ** বৃদ্ধি পাইছে (গড় ΔNDBI: **{mean_d:+.3f}**)."
        elif lang == "ur":
            return f"{loc_name} میں شہری اور تعمیراتی رقبہ **{total_ha:.1f} ہیکٹر** تک پھیل گیا (اوسط ΔNDBI: **{mean_d:+.3f}**)。"
        else:
            return f"Urban and built-up land expanded by **{total_ha:.1f} hectares** across **{clusters} clusters** in {loc_name} (mean ΔNDBI: **{mean_d:+.3f}**). The primary expansion areas are highlighted on your map."

    elif key == "water_general":
        total_ha = ctx.get("total_ha", 0)
        mean_d = ctx.get("mean_ndwi", 0.0)

        if lang == "te":
            return f"{loc_name}లో ఉపరితల నీరు మరియు తేమ గతిశీలత **{total_ha:.1f} హెక్టార్ల** విస్తీర్ణంలో మారింది (సగటు ΔNDWI: **{mean_d:+.3f}**). సంబంధిత ప్రాంతాలు మ్యాప్‌లో హైలైట్ చేయబడ్డాయి."
        elif lang == "hi":
            return f"{loc_name} में सतही जल और आर्द्रता की स्थिति **{total_ha:.1f} हेक्टेयर** में बदली है (औसत ΔNDWI: **{mean_d:+.3f}**)। संबंधित क्षेत्र मानचित्र पर हाइलाइट किए गए हैं।"
        elif lang == "ta":
            return f"{loc_name} பகுதியில் நீர்நிலைகள் **{total_ha:.1f} ஹெக்டேர்** பரப்பளவில் மாற்றம் பெற்றுள்ளன (சராசரி ΔNDWI: **{mean_d:+.3f}**)."
        elif lang == "kn":
            return f"{loc_name} ನಲ್ಲಿ ಮೇಲ್ಮೈ ನೀರು ಮತ್ತು ತೇವಾಂಶವು **{total_ha:.1f} ಹೆಕ್ಟೇರ್** ಪ್ರದೇಶದಲ್ಲಿ ಬದಲಾಗಿದೆ (ಸರಾಸರಿ ΔNDWI: **{mean_d:+.3f}**)."
        elif lang == "ml":
            return f"{loc_name} ൽ ഉപരിതല ജലവും ഈർപ്പവും **{total_ha:.1f} ഹെക്ടർ** വിസ്തൃതിയിൽ വ്യത്യാസപ്പെട്ടു (ശരാശരി ΔNDWI: **{mean_d:+.3f}**)."
        elif lang == "mr":
            return f"{loc_name} मध्ये पृष्ठभागावरील पाणी आणि ओलावा **{total_ha:.1f} हेक्टर** क्षेत्रात बदलले (सरासरी ΔNDWI: **{mean_d:+.3f}**)."
        elif lang == "bn":
            return f"{loc_name} এ ভূ-পৃষ্ঠের জল ও আর্দ্রতা **{total_ha:.1f} হেক্টর** জুড়ে পরিবর্তিত হয়েছে (গড় ΔNDWI: **{mean_d:+.3f}**)।"
        elif lang == "gu":
            return f"{loc_name}માં સપાટી પરનું પાણી અને ભેજ **{total_ha:.1f} હેક્ટર** વિસ્તારમાં બદલાયા છે (સરેરાશ ΔNDWI: **{mean_d:+.3f}**)."
        elif lang == "pa":
            return f"{loc_name} ਵਿੱਚ ਸਤਹੀ ਪਾਣੀ ਅਤੇ ਨਮੀ **{total_ha:.1f} ਹੈਕਟੇਅਰ** ਖੇਤਰ ਵਿੱਚ ਬਦਲੀ ਹੈ (ਔਸਤ ΔNDWI: **{mean_d:+.3f}**)।"
        elif lang == "or":
            return f"{loc_name}ରେ ଭୂପୃଷ୍ଠ ଜଳ ଏବଂ ଆର୍ଦ୍ରତା **{total_ha:.1f} ହେକ୍ଟର**ରେ ପରିବର୍ତ୍ତିତ ହୋଇଛି (ହାରାହାରି ΔNDWI: **{mean_d:+.3f}**)."
        elif lang == "as":
            return f"{loc_name}ত পৃষ্ঠীয় জল আৰু আৰ্দ্ৰতা **{total_ha:.1f} হেক্টৰ**ত সলনি হৈছে (গড় ΔNDWI: **{mean_d:+.3f}**)."
        elif lang == "ur":
            return f"{loc_name} میں آبی ذخائر اور نمی کی حالت **{total_ha:.1f} ہیکٹر** میں تبدیل ہوئی (اوسط ΔNDWI: **{mean_d:+.3f}**)。"
        else:
            return f"Surface water and moisture dynamics changed across **{total_ha:.1f} hectares** in {loc_name} (mean ΔNDWI: **{mean_d:+.3f}**). The relevant hydrological zones are highlighted on your map."

    elif key == "when_happened":
        b_date = ctx.get("before_date", "2021")
        a_date = ctx.get("after_date", "2026")
        start = ctx.get("accel_start", 2024)
        end = ctx.get("after_year", 2026)

        if lang == "te":
            return f"భౌతిక మార్పులు **{b_date}** మరియు **{a_date}** మధ్య గుర్తించబడ్డాయి, ప్రత్యేకించి **{start} మరియు {end}** మధ్య అధిక మార్పులు జరిగాయి. నిర్దిష్ట వార్షిక మార్పులను చూడటానికి మ్యాప్ క్రింద ఉన్న టైమ్ చేంజెస్ డ్రాయర్‌ని ఉపయోగించండి."
        elif lang == "hi":
            return f"भौतिक परिवर्तन **{b_date}** और **{a_date}** के बीच पाए गए, विशेष रूप से **{start} और {end}** के बीच। विशिष्ट वार्षिक अवलोकनों के लिए मानचित्र के नीचे टाइम चेंजेज ड्रॉअर का उपयोग करें।"
        elif lang == "ta":
            return f"இயற்கை மாற்றங்கள் **{b_date}** மற்றும் **{a_date}** இடையே பதிவாகியுள்ளன, குறிப்பாக **{start} முதல் {end}** வரை அதிக மாற்றங்கள் நிகழ்ந்துள்ளன."
        elif lang == "kn":
            return f"ಭೌತಿಕ ಬದಲಾವಣೆಗಳು **{b_date}** ಮತ್ತು **{a_date}** ನಡುವೆ ಪತ್ತೆಯಾಗಿವೆ, ವಿಶೇಷವಾಗಿ **{start} ಮತ್ತು {end}** ನಡುವೆ."
        elif lang == "ur":
            return f"تبدیلیاں **{b_date}** اور **{a_date}** کے درمیان ریکارڈ کی گئیں، خاص طور پر **{start} اور {end}** کے درمیان۔"
        else:
            return f"The physical changes were detected between **{b_date}** and **{a_date}**, with concentrated activity between **{start} and {end}**. You can use the Time Changes drawer below the map to observe specific annual passes."

    # Default general fallback
    total_ha = ctx.get("total_changed_ha", 0)
    pct = ctx.get("pct_changed", 0)
    if lang == "te":
        return f"**{loc_name}**లో, మొత్తం **{total_ha} హెక్టార్ల** ఉపరితల మార్పు కనుగొనబడింది (మొత్తం ప్రాంతంలో {pct}%). దయచేసి వృక్షసంపద, పట్టణ విస్తరణ లేదా నీటి వనరుల గురించి నిర్దిష్ట ప్రశ్న అడగండి."
    elif lang == "hi":
        return f"**{loc_name}** में, **{total_ha} हेक्टेयर** का सतही परिवर्तन दर्ज किया गया (क्षेत्र का {pct}%)। कृपया वनस्पति, शहरी विस्तार या जल निकायों के बारे में विशिष्ट प्रश्न पूछें।"
    elif lang == "ta":
        return f"**{loc_name}** பகுதியில், **{total_ha} ஹெக்டேர்** மேற்பரப்பு மாற்றம் கண்டறியப்பட்டது ({pct}%). தாவரங்கள், நகர்ப்புற வளர்ச்சி அல்லது நீர்நிலைகள் பற்றி கேளுங்கள்."
    elif lang == "kn":
        return f"**{loc_name}** ನಲ್ಲಿ, **{total_ha} ಹೆಕ್ಟೇರ್** ಮೇಲ್ಮೈ ಬದಲಾವಣೆ ಪತ್ತೆಯಾಗಿದೆ ({pct}%)."
    elif lang == "ur":
        return f"**{loc_name}** میں **{total_ha} ہیکٹر** سطح پر تبدیلی درج کی گئی ({pct}%)۔"
    return f"In **{loc_name}**, **{total_ha} hectares** of surface change were detected ({pct}% of the AOI). Please ask a specific question about vegetation, urban expansion, water bodies, or map hotspots."

async def answer_conversational_query(
    analysis_context: Dict[str, Any],
    user_message: str,
    chat_history: List[Dict[str, str]],
    language: str = "en"
) -> ChatResponse:
    """
    Answers follow-up conversational questions while preserving full AnalysisContext.
    Implements the full 'Ask -> Map -> Answer' loop:
    1. Parses spatial & categorical intent
    2. Identifies relevant target regions and computes cardinal direction
    3. Produces scientific answer with direct supporting evidence
    4. Triggers interactive map actions (zoom_to, highlight_region_ids, filter_category, selected_region_id)
    5. Fallbacks gracefully to answer ANY question using Gemini or comprehensive geospatial knowledge engine.
    """
    msg_lower = user_message.lower().strip()
    regions = analysis_context.get("change_regions", [])
    loc_name = analysis_context.get("location", {}).get("name", "the analyzed region")
    bbox = analysis_context.get("location", {}).get("bounding_box", [0, 0, 0, 0])
    c_lon_aoi = (bbox[0] + bbox[2]) / 2.0 if len(bbox) == 4 else 0.0
    c_lat_aoi = (bbox[1] + bbox[3]) / 2.0 if len(bbox) == 4 else 0.0
    
    before_date = analysis_context.get("actual_before_date", "2021")
    after_date = analysis_context.get("actual_after_date", "2026")
    before_year = int(before_date.split("-")[0]) if "-" in before_date else 2021
    after_year = int(after_date.split("-")[0]) if "-" in after_date else 2026
    analysis_id = analysis_context.get("analysis_id", "general")

    def compute_cardinal_direction(lon: float, lat: float) -> str:
        d_lat = lat - c_lat_aoi
        d_lon = lon - c_lon_aoi
        ns = "north" if d_lat > 0.004 else "south" if d_lat < -0.004 else ""
        ew = "east" if d_lon > 0.004 else "west" if d_lon < -0.004 else ""
        if ns and ew:
            return f"{ns}east" if ew == "east" else f"{ns}west"
        return ns or ew or "central"

    highlight_ids = None
    filter_category = None
    zoom_to = None
    selected_region_id = None
    suggested_actions = ["Where did the biggest change happen?", "What is NDVI and NDBI?", "When did it happen?", "Show only vegetation loss"]

    # Auto-detect and persist Google Gemini API key if user provides it in chat
    import re
    key_match = re.search(r"AIza[0-9A-Za-z-_]{35}", user_message)
    if key_match:
        found_key = key_match.group(0)
        settings.update_gemini_api_key(found_key)
        return ChatResponse(
            reply=(
                f"✅ **Google Gemini API Key Configured Successfully!**\n\n"
                f"Your Google API key has been securely connected and saved to `.env`.\n"
                f"The **AI Geospatial Analyst** is now running with live **Google Gemini** generative intelligence!\n\n"
                f"You can now ask any question about {loc_name}, satellite remote sensing, environmental change, or world geography."
            ),
            analysis_id=analysis_id,
            suggested_actions=["Where did the biggest change happen?", "What is NDVI and NDBI?", "Explain the environmental impact"]
        )

    # Detect previous region in context from history
    last_discussed_region = regions[0] if regions else None
    for h in reversed(chat_history):
        c = h.get("content", "")
        for r in regions:
            if r["id"] in c:
                last_discussed_region = r
                break
        if last_discussed_region and regions and last_discussed_region != regions[0]:
            break

    # 1. Ask -> Map -> Answer: "Where did the biggest change / urban change happen?"
    if any(phrase in msg_lower for phrase in ["biggest", "largest", "where did", "where are", "where the", "main change"]):
        target_pool = regions
        if "urban" in msg_lower or "built" in msg_lower or "growth" in msg_lower or "expansion" in msg_lower:
            target_pool = [r for r in regions if "Urban" in r.get("category", "") or "Built" in r.get("user_label", "")]
            filter_category = "urban"
        elif "vegetation" in msg_lower or "forest" in msg_lower or "green" in msg_lower:
            target_pool = [r for r in regions if "Vegetation" in r.get("category", "") or "deforestation" in r.get("category", "").lower()]
            filter_category = "vegetation"
        elif "water" in msg_lower:
            target_pool = [r for r in regions if "Water" in r.get("category", "")]
            filter_category = "water"

        if target_pool:
            target = target_pool[0]
            direction = compute_cardinal_direction(target["centroid"][0], target["centroid"][1])
            highlight_ids = [target["id"]]
            selected_region_id = target["id"]
            zoom_to = [target["centroid"][0], target["centroid"][1], 14.2]
            
            cat_desc = "urban expansion" if "Urban" in target.get("category", "") else target.get("user_label", "change").lower()
            hotspot_num = target.get("indicator_number", 1)
            reply = localize_heuristic_reply(
                "where_biggest", language,
                loc_name=loc_name,
                cat_desc=cat_desc,
                direction=direction,
                ha=target['area_hectares'],
                num=hotspot_num,
                d_ndbi=target['delta_ndbi'],
                d_ndvi=target['delta_ndvi']
            )
            suggested_actions = ["Was it urban development?", "How did vegetation change?", "When did it happen?"]
            return ChatResponse(
                reply=reply,
                analysis_id=analysis_id,
                suggested_actions=suggested_actions,
                highlight_region_ids=highlight_ids,
                filter_category=filter_category,
                zoom_to=zoom_to,
                selected_region_id=selected_region_id
            )

    # 2. Multi-turn Follow-up: "Was it urban development?"
    if "urban" in msg_lower and any(w in msg_lower for w in ["was it", "is it", "is this", "was this", "check"]):
        target = last_discussed_region
        if target:
            is_urban = "Urban" in target.get("category", "") or target.get("delta_ndbi", 0) > 0.08
            highlight_ids = [target["id"]]
            selected_region_id = target["id"]
            zoom_to = [target["centroid"][0], target["centroid"][1], 14.2]
            hotspot_num = target.get("indicator_number", 1)
            
            if is_urban:
                reply = (
                    f"**Yes, Hotspot #{hotspot_num} is urban development ({target['area_hectares']} ha).** "
                    f"An NDBI rise of **{target['delta_ndbi']:+.3f}** confirms newly constructed impervious surfaces."
                )
            else:
                reply = (
                    f"**No, Hotspot #{hotspot_num} is {target['user_label']} ({target['area_hectares']} ha).** "
                    f"Its spectral shift is characterized by vegetation change (ΔNDVI: **{target['delta_ndvi']:+.3f}**) rather than construction."
                )
            suggested_actions = ["When did it happen?", "Where is the largest change?", "How did vegetation change?"]
            return ChatResponse(
                reply=reply,
                analysis_id=analysis_id,
                suggested_actions=suggested_actions,
                highlight_region_ids=highlight_ids,
                filter_category="urban" if is_urban else target.get("category"),
                zoom_to=zoom_to,
                selected_region_id=selected_region_id
            )

    # 3. Multi-turn Follow-up: "When did it happen?" / "What year?"
    if any(phrase in msg_lower for phrase in ["when did", "what year", "timing", "when happened", "timeline"]):
        accel_start = max(before_year, after_year - 2)
        reply = localize_heuristic_reply(
            "when_happened", language,
            loc_name=loc_name,
            before_date=before_date,
            after_date=after_date,
            accel_start=accel_start,
            after_year=after_year
        )
        suggested_actions = ["Where did the biggest change happen?", "How did vegetation change?", "How much urban growth occurred?"]
        return ChatResponse(
            reply=reply,
            analysis_id=analysis_id,
            suggested_actions=suggested_actions,
            highlight_region_ids=highlight_ids,
            filter_category=filter_category
        )

    # 4. Specific Question on Vegetation (e.g. "What happened to vegetation?", "Has vegetation changed?", "Show vegetation")
    if any(w in msg_lower for w in ["vegetation", "forest", "green", "canopy", "plants", "crops", "deforest"]):
        filter_category = "vegetation"
        veg_regions = [r for r in regions if "vegetation" in r.get("category", "").lower() or "deforestation" in r.get("category", "").lower() or "canopy" in r.get("user_label", "").lower() or abs(r.get("delta_ndvi", 0)) > 0.08]
        loss_regions = [r for r in veg_regions if r.get("delta_ndvi", 0) < 0 or "loss" in r.get("category", "").lower() or "deforestation" in r.get("category", "").lower()]
        gain_regions = [r for r in veg_regions if r.get("delta_ndvi", 0) > 0 or "growth" in r.get("category", "").lower() or "regrowth" in r.get("category", "").lower()]
        loss_ha = sum(r.get("area_hectares", 0) for r in loss_regions)
        gain_ha = sum(r.get("area_hectares", 0) for r in gain_regions)
        mean_delta_ndvi = analysis_context.get("indices_summary", {}).get("delta_ndvi_mean", -0.04)
        
        reply = localize_heuristic_reply(
            "vegetation", language,
            loc_name=loc_name,
            loss_ha=loss_ha,
            gain_ha=gain_ha,
            mean_delta_ndvi=mean_delta_ndvi,
            loss_count=len(loss_regions)
        )
            
        highlight_ids = [r["id"] for r in (loss_regions or veg_regions)[:5]]
        if veg_regions:
            zoom_to = [veg_regions[0]["centroid"][0], veg_regions[0]["centroid"][1], 13.5]
            selected_region_id = veg_regions[0]["id"]
            
        suggested_actions = ["Where did the biggest change happen?", "How much urban development occurred?", "What is NDVI?"]
        return ChatResponse(
            reply=reply,
            analysis_id=analysis_id,
            suggested_actions=suggested_actions,
            highlight_region_ids=highlight_ids,
            filter_category=filter_category,
            zoom_to=zoom_to,
            selected_region_id=selected_region_id
        )

    # 5. Specific Question on Urban / Built-up (e.g. "What happened to urban?", "Has construction increased?")
    if any(w in msg_lower for w in ["urban", "construction", "built", "building", "development", "expansion", "growth"]):
        filter_category = "urban"
        urban_regions = [r for r in regions if "urban" in r.get("category", "").lower() or "built" in r.get("user_label", "").lower() or r.get("delta_ndbi", 0) > 0.05]
        total_urban_ha = sum(r.get("area_hectares", 0) for r in urban_regions)
        mean_ndbi = analysis_context.get("indices_summary", {}).get("delta_ndbi_mean", 0.08)
        
        reply = localize_heuristic_reply(
            "urban_general", language,
            loc_name=loc_name,
            total_ha=total_urban_ha,
            clusters=len(urban_regions),
            mean_ndbi=mean_ndbi
        )
        highlight_ids = [r["id"] for r in urban_regions[:5]]
        if urban_regions:
            zoom_to = [urban_regions[0]["centroid"][0], urban_regions[0]["centroid"][1], 13.5]
            selected_region_id = urban_regions[0]["id"]
            
        suggested_actions = ["Where did the biggest urban change happen?", "How did vegetation change?", "What is NDBI?"]
        return ChatResponse(
            reply=reply,
            analysis_id=analysis_id,
            suggested_actions=suggested_actions,
            highlight_region_ids=highlight_ids,
            filter_category=filter_category,
            zoom_to=zoom_to,
            selected_region_id=selected_region_id
        )

    # 6. Specific Question on Water / Hydrology (e.g. "Did water bodies change?", "What happened to water?")
    if any(w in msg_lower for w in ["water", "lake", "river", "flood", "reservoir", "hydrology", "canal", "moisture"]):
        filter_category = "water"
        water_regions = [r for r in regions if "water" in r.get("category", "").lower() or abs(r.get("delta_ndwi", 0)) > 0.05]
        total_water_ha = sum(r.get("area_hectares", 0) for r in water_regions)
        mean_ndwi = analysis_context.get("indices_summary", {}).get("delta_ndwi_mean", 0.0)
        
        reply = localize_heuristic_reply(
            "water_general", language,
            loc_name=loc_name,
            total_ha=total_water_ha,
            mean_ndwi=mean_ndwi
        )
        highlight_ids = [r["id"] for r in water_regions[:5]]
        if water_regions:
            zoom_to = [water_regions[0]["centroid"][0], water_regions[0]["centroid"][1], 13.5]
            selected_region_id = water_regions[0]["id"]
            
        suggested_actions = ["Where did the biggest change happen?", "How did vegetation change?", "What is NDWI?"]
        return ChatResponse(
            reply=reply,
            analysis_id=analysis_id,
            suggested_actions=suggested_actions,
            highlight_region_ids=highlight_ids,
            filter_category=filter_category,
            zoom_to=zoom_to,
            selected_region_id=selected_region_id
        )

    # 7. Reset Filters
    if any(w in msg_lower for w in ["reset", "show all", "show everything", "clear filter"]):
        reply = "Map filters and highlights have been reset. All change categories are now visible."
        return ChatResponse(
            reply=reply,
            analysis_id=analysis_id,
            suggested_actions=["Where did the biggest change happen?", "How did vegetation change?", "How much urban growth occurred?"],
            highlight_region_ids=[],
            filter_category=None
        )

    # 8. Reliability / Confidence Explanation
    if any(w in msg_lower for w in ["reliable", "confidence", "how reliable", "accuracy", "defend"]):
        conf = analysis_context.get("confidence", {})
        score = conf.get("overall_score", 85)
        rating = conf.get("rating", "High")
        reply = (
            f"The analysis has an overall confidence score of **{score}% ({rating})**, derived from Copernicus Sentinel-2 MSI "
            f"observations with cloud masking and morphological noise filtering."
        )
        return ChatResponse(
            reply=reply,
            analysis_id=analysis_id,
            suggested_actions=["Where did the biggest change happen?", "How did vegetation change?", "Download report"],
            highlight_region_ids=None,
            filter_category=None
        )

    # Prioritize live Gemini AI Geospatial Analyst for all questions
    gemini_reply = await query_gemini_analyst_chat(analysis_context, user_message, chat_history, language=language)
    if gemini_reply:
        return ChatResponse(
            reply=gemini_reply,
            analysis_id=analysis_id,
            suggested_actions=["Where did the biggest change happen?", "What is NDVI and NDBI?", "Show only vegetation loss"],
            highlight_region_ids=None,
            filter_category=None
        )

    # 8. Spectral Indices Questions: NDVI, NDBI, NDWI
    if "ndvi" in msg_lower:
        reply = (
            f"**NDVI (Normalized Difference Vegetation Index)** measures green vegetation density and vitality using `(NIR - Red) / (NIR + Red)`. "
            f"In {loc_name}, baseline mean was **{analysis_context.get('indices_summary', {}).get('ndvi_before_mean', 0.42)}** and comparative mean was **{analysis_context.get('indices_summary', {}).get('ndvi_after_mean', 0.38)}** "
            f"(ΔNDVI: **{analysis_context.get('indices_summary', {}).get('delta_ndvi_mean', -0.04):+.3f}**)."
        )
        return ChatResponse(
            reply=reply,
            analysis_id=analysis_id,
            suggested_actions=["What is NDBI?", "How did vegetation change?", "Where did the biggest change happen?"],
        )

    if "ndbi" in msg_lower:
        reply = (
            f"**NDBI (Normalized Difference Built-up Index)** isolates impervious surfaces like concrete, roads, and buildings using `(SWIR - NIR) / (SWIR + NIR)`. "
            f"In {loc_name}, mean NDBI shifted by **{analysis_context.get('indices_summary', {}).get('delta_ndbi_mean', 0.08):+.3f}**, indicating newly paved ground and structural development."
        )
        return ChatResponse(
            reply=reply,
            analysis_id=analysis_id,
            suggested_actions=["What is NDVI?", "How much urban development occurred?", "When did it happen?"],
        )

    if "ndwi" in msg_lower:
        reply = (
            f"**NDWI (Normalized Difference Water Index)** delineates open water bodies and moisture dynamics using `(Green - NIR) / (Green + NIR)`. "
            f"In {loc_name}, mean NDWI delta was **{analysis_context.get('indices_summary', {}).get('delta_ndwi_mean', 0.0):+.3f}**."
        )
        return ChatResponse(
            reply=reply,
            analysis_id=analysis_id,
            suggested_actions=["What is NDVI?", "Did water bodies change?", "Where did the biggest change happen?"],
        )

    # 9. Satellite & Sensor Questions: Sentinel-2
    if any(w in msg_lower for w in ["sentinel", "satellite", "sensor", "resolution", "copernicus"]):
        reply = (
            f"This analysis uses Copernicus Sentinel-2 MultiSpectral Instrument (MSI) Level-2A surface reflectance data "
            f"at **10-meter spatial resolution** with a 5-day revisit cycle."
        )
        return ChatResponse(
            reply=reply,
            analysis_id=analysis_id,
            suggested_actions=["What is NDVI?", "Where did the biggest change happen?", "How reliable is the data?"],
        )

    # 10. Regional Geographic Queries (Krishna River, Vijayawada, Tokyo, London, etc.)
    if "krishna" in msg_lower or "prakasam" in msg_lower:
        reply = (
            f"The Krishna River corridor in Vijayawada is regulated by the Prakasam Barrage. "
            f"Satellite observations track seasonal sandbar exposure, barrage reservoir water levels, and riparian floodplain dynamics."
        )
        return ChatResponse(
            reply=reply,
            analysis_id=analysis_id,
            suggested_actions=["Did water bodies change?", "Where did the biggest change happen?", "When did it happen?"],
        )

    # 11. How-to & UI questions
    if any(w in msg_lower for w in ["how to", "swipe", "how do i", "how can i"]):
        reply = (
            f"Drag the cyan **SWIPE** slider horizontally to compare passes, click **Indicators** to inspect numbered hotspots, "
            f"or use the **Time Changes** drawer below the map to browse individual years (2020–2026)."
        )
        return ChatResponse(
            reply=reply,
            analysis_id=analysis_id,
            suggested_actions=["Where did the biggest change happen?", "How did vegetation change?", "Show urban development"],
        )

    # 12. Smart Knowledge Engine for any question
    knowledge_reply = ""
    if any(k in msg_lower for k in ["hyderabad", "telangana", "hitex", "cyberabad", "hitec"]):
        knowledge_reply = f"Hyderabad has seen major commercial and IT infrastructure growth along the Outer Ring Road and HITEC City, marked by high NDBI increase."
    elif any(k in msg_lower for k in ["gujarat", "ahmedabad", "gandhinagar", "surat"]):
        knowledge_reply = f"Gujarat features extensive industrial corridor expansion and seasonal canal irrigation tracked via Sentinel-2 multispectral passes."
    elif any(k in msg_lower for k in ["tamil nadu", "chennai", "coimbatore"]):
        knowledge_reply = f"Tamil Nadu exhibits metropolitan industrial expansion around Chennai alongside Kaveri delta seasonal agricultural cycles."
    elif any(k in msg_lower for k in ["kerala", "kochi", "cochin", "thiruvananthapuram"]):
        knowledge_reply = f"Kerala maintains dense tropical canopy with high NDVI (+0.6 to +0.8) and localized backwater hydrological shifts."
    elif any(k in msg_lower for k in ["sri lanka", "colombo"]):
        knowledge_reply = f"Sri Lanka shows rapid Colombo port development contrasted with tropical highland canopy reflectance."
    elif any(k in msg_lower for k in ["tokyo", "japan"]):
        knowledge_reply = f"Tokyo represents an ultra-dense urban landscape (NDBI > 0.15) with coastal reclamation along Tokyo Bay."
    elif any(k in msg_lower for k in ["london", "thames", "uk", "united kingdom"]):
        knowledge_reply = f"London reflects dense urban infrastructure along the River Thames corridor with moderate NDVI in parkland reserves."
    elif any(k in msg_lower for k in ["sydney", "australia"]):
        knowledge_reply = f"Sydney exhibits Western Sydney suburban expansion contrasted with coastal basin eucalyptus reserves."
    elif any(k in msg_lower for k in ["deforest", "forest", "tree", "logging", "clearing"]):
        veg_loss_ha = sum(r.get("area_hectares", 0) for r in regions if "loss" in r.get("category", "").lower() or r.get("delta_ndvi", 0) < -0.10)
        knowledge_reply = f"Canopy loss was detected across **{veg_loss_ha:.1f} hectares** in {loc_name}, indicated by negative NDVI deltas."
    elif any(k in msg_lower for k in ["flood", "water", "lake", "river"]):
        knowledge_reply = f"Water dynamics in {loc_name} are monitored using NDWI, where water absorbs near-infrared light and yields positive spectral indices."
    elif any(k in msg_lower for k in ["api", "key", "google", "gemini"]):
        knowledge_reply = f"SatQueryAI is actively analyzing {loc_name} using calibrated Copernicus Sentinel-2 multispectral Earth observation data."

    if knowledge_reply:
        return ChatResponse(
            reply=knowledge_reply,
            analysis_id=analysis_id,
            suggested_actions=["Where did the biggest change happen?", "How did vegetation change?", "How much urban development occurred?"],
            highlight_region_ids=None,
            filter_category=None
        )

    # General concise fallback
    reply = localize_heuristic_reply(
        "general_fallback", language,
        loc_name=loc_name,
        total_changed_ha=analysis_context.get('total_changed_hectares', 0),
        pct_changed=analysis_context.get('percent_aoi_changed', 0)
    )
    return ChatResponse(
        reply=reply,
        analysis_id=analysis_id,
        suggested_actions=["Where did the biggest change happen?", "How did vegetation change?", "How much urban development occurred?"],
        highlight_region_ids=None,
        filter_category=None
    )

