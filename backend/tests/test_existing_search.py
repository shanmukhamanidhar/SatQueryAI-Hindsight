import requests

def test_location_search():
    res = requests.post('http://127.0.0.1:8000/api/analyze', json={'query': 'Visakhapatnam'})
    assert res.status_code == 200, f"Error: {res.text}"
    data = res.json()
    print(f"PASS: Existing location search confirmed working: {data['location']['name']}, {len(data['change_regions'])} change regions.")

if __name__ == '__main__':
    test_location_search()
