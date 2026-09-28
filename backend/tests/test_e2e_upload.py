import requests
import json
import base64
from PIL import Image
import io

BASE_URL = 'http://127.0.0.1:8000/api/upload'

def create_image_data_url(r: int, g: int, b: int) -> str:
    img = Image.new('RGB', (128, 128), (r, g, b))
    buf = io.BytesIO()
    img.save(buf, format='JPEG')
    return 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode('utf-8')

def main():
    print("--- 1. Testing /samples endpoint ---")
    r = requests.get(f'{BASE_URL}/samples')
    assert r.status_code == 200, f"Failed: {r.text}"
    samples = r.json()
    print(f"PASS: /samples returned {len(samples['single_samples'])} single, {len(samples['compare_samples'])} compare, {len(samples['multiple_samples'])} multi presets")

    print("\n--- 2. Testing /single endpoint ---")
    green_data = create_image_data_url(25, 145, 35)
    r = requests.post(f'{BASE_URL}/single', json={'image_data': green_data, 'filename': 'test_forest.jpg'})
    assert r.status_code == 200, f"Failed: {r.text}"
    single_res = r.json()
    print(f"PASS: /single - Vegetation: {single_res['metrics']['vegetation_pct']}% | Estimated Area: {single_res['estimated_area']['name']}")

    print("\n--- 3. Testing /compare endpoint ---")
    urban_data = create_image_data_url(185, 140, 115)
    r = requests.post(f'{BASE_URL}/compare', json={
        'image1_data': green_data,
        'image2_data': urban_data,
        'label1': '2020 Baseline',
        'label2': '2026 Developed'
    })
    assert r.status_code == 200, f"Failed: {r.text}"
    comp_res = r.json()
    print(f"PASS: /compare - Urban Delta: {comp_res['delta_metrics']['urban_delta_pct']}% | Hotspots: {len(comp_res['hotspots'])}")

    print("\n--- 4. Testing /multiple endpoint ---")
    water_data = create_image_data_url(20, 55, 185)
    frames = [
        {'image_data': green_data, 'label': 'Phase 1 - Natural'},
        {'image_data': water_data, 'label': 'Phase 2 - Wetland'},
        {'image_data': urban_data, 'label': 'Phase 3 - Built'}
    ]
    r = requests.post(f'{BASE_URL}/multiple', json={'images': frames})
    assert r.status_code == 200, f"Failed: {r.text}"
    multi_res = r.json()
    print(f"PASS: /multiple - Total frames: {multi_res['total_frames']} | Urban net change: {multi_res['trends']['urban_net']}%")

    print("\n--- 5. Testing /chat endpoint ---")
    r = requests.post(f'{BASE_URL}/chat', json={
        'analysis_data': single_res,
        'message': 'What is the vegetation percentage?'
    })
    assert r.status_code == 200, f"Failed: {r.text}"
    chat_res = r.json()
    print(f"PASS: /chat - AI Reply: {chat_res['reply']}")

    print("\nALL 5 UPLOAD PIPELINE SUITES PASSED FLAWLESSLY!")

if __name__ == '__main__':
    main()
