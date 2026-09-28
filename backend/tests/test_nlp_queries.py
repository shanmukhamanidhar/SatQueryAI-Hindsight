import sys
sys.path.insert(0, 'backend')
from services.nlp_parser import heuristic_parse_intent

test_queries = [
    'What changed in Vijayawada since 2021?',
    'What changed in Dubai from 2020 to 2026?',
    'Compare Dubai in 2021 and 2026',
    'Show urban growth in Hyderabad between 2021 and 2026',
    'Has vegetation changed in Bengaluru since 2022?',
    'Show water changes in Krishna River from 2021 to 2026',
    'Show deforestation in the Amazon from 2021 to 2026',
    'What changed in Tokyo?',
    'Compare Andhra Pradesh from 2021 to 2026',
    'Show me changes in Greenland',
    'Show urban expansion in New York',
    'Show water changes in the Aral Sea',
    'over the last 5 years in Mumbai',
    'asdfgh',
    'what is the weather?',
    'tell me a joke',
    'XYZABC',
    'Show changes in Washington'
]

for q in test_queries:
    res = heuristic_parse_intent(q)
    print(f"QUERY: {q}")
    print(f"  -> Loc: {res.get('location')!r} | Yrs: {res.get('start_year')}..{res.get('end_year')} | Type: {res.get('analysis_type')} | Focus: {res.get('focus_indicator')}")
