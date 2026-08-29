import os
import sys
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import Client

client = Client()

print("=" * 70)
print("     NAGPUR URBAN CRISIS AI - STEP 3 BACKEND APIS VERIFICATION")
print("=" * 70)

tests = []

def run_test(name, func):
    try:
        success, msg = func()
        status = "[PASS]" if success else "[FAIL]"
        print(f"  {status} {name:<42} -> {msg}")
        tests.append((name, success))
    except Exception as e:
        print(f"  [FAIL] {name:<42} -> Exception: {e}")
        tests.append((name, False))

# 1. Health Check
def test_health():
    res = client.get('/api/health/')
    return res.status_code == 200, f"HTTP {res.status_code} ({res.json().get('status')})"

# 2. Zones Risk GeoJSON
def test_zones_risk():
    res = client.get('/api/zones/risk/')
    data = res.json()
    count = len(data.get('features', []))
    return res.status_code == 200 and count == 10, f"HTTP {res.status_code} ({count} GeoJSON Wards)"

# 3. Zone Dispatch Status Update
def test_zone_dispatch():
    res = client.patch('/api/zones/1/dispatch/', data=json.dumps({"dispatch_status": "Dispatched"}), content_type='application/json')
    return res.status_code == 200, f"HTTP {res.status_code} (Status: {res.json().get('dispatch_status')})"

# 4. Citizen Report Submission with CV Inference
def test_report_create():
    payload = {
        "latitude": 21.1475,
        "longitude": 79.0650,
        "description": "Heavy water accumulation and puddle blocking main road in Dharampeth",
    }
    res = client.post('/api/reports/', data=payload)
    data = res.json()
    rep_id = data.get('id')
    zone_name = data.get('zone_name')
    water_det = data.get('waterlogging_detected')
    return res.status_code == 201, f"HTTP {res.status_code} (Report #{rep_id} assigned to '{zone_name}', Waterlogging: {water_det})"

# 5. List Reports
def test_report_list():
    res = client.get('/api/reports/')
    count = len(res.json())
    return res.status_code == 200, f"HTTP {res.status_code} ({count} reports found)"

# 6. Verify Report
def test_report_verify():
    # Get latest report
    list_res = client.get('/api/reports/')
    latest_id = list_res.json()[0]['id']
    res = client.patch(f'/api/reports/{latest_id}/verify/', data=json.dumps({"verification_status": "Verified"}), content_type='application/json')
    return res.status_code == 200, f"HTTP {res.status_code} (Report #{latest_id} verified)"

# 7. Safe Route Calculation (A* Algorithm)
def test_safe_route():
    res = client.get('/api/route/?from=21.1475,79.0650&to=21.1524,79.0888')
    data = res.json()
    dist = data.get('safe_route', {}).get('distance_km', 0)
    return res.status_code == 200 and dist > 0, f"HTTP {res.status_code} (Safe route: {dist} km)"

# 8. Priority Queue
def test_priority_queue():
    res = client.get('/api/priority-queue/')
    data = res.json()
    count = len(data.get('queue', []))
    top_ward = data.get('queue', [{}])[0].get('zone_name')
    top_score = data.get('queue', [{}])[0].get('risk_score')
    return res.status_code == 200 and count == 10, f"HTTP {res.status_code} (Top: {top_ward} Score {top_score})"

# 9. 8-Stage Rain Simulation
def test_simulation():
    res = client.post('/api/simulate-rainfall/', data=json.dumps({"stage": 5}), content_type='application/json')
    data = res.json()
    stage_name = data.get('stage_name')
    wards_updated = data.get('wards_updated')
    return res.status_code == 200, f"HTTP {res.status_code} (Stage 5: '{stage_name}', {wards_updated} wards updated)"

# 10. Alerts Status
def test_alerts_status():
    res = client.get('/api/alerts/status/')
    return res.status_code == 200, f"HTTP {res.status_code} ({res.json().get('status')})"

# Run all tests
print("\n[EXECUTING STEP 3 BACKEND API TESTS]:")
run_test("1. GET  /api/health/", test_health)
run_test("2. GET  /api/zones/risk/", test_zones_risk)
run_test("3. PATCH /api/zones/<id>/dispatch/", test_zone_dispatch)
run_test("4. POST /api/reports/ (AI Vision + Match)", test_report_create)
run_test("5. GET  /api/reports/", test_report_list)
run_test("6. PATCH /api/reports/<id>/verify/", test_report_verify)
run_test("7. GET  /api/route/ (A* Pathfinding)", test_safe_route)
run_test("8. GET  /api/priority-queue/", test_priority_queue)
run_test("9. POST /api/simulate-rainfall/ (Stage 5)", test_simulation)
run_test("10. GET /api/alerts/status/", test_alerts_status)

passed = sum(1 for _, s in tests if s)
total = len(tests)

print("\n" + "=" * 70)
print(f"STEP 3 API RESULTS: {passed}/{total} ENDPOINTS PASSED")
print("=" * 70)

if passed == total:
    print(">>> STEP 3 BACKEND CORE LOGIC & REST APIS FULLY VERIFIED! <<<")
else:
    sys.exit(1)
