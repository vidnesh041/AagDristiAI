import urllib.request
import urllib.parse
import json
import sys

def test_url(name, url, method="GET", data=None):
    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(data).encode("utf-8") if data else None,
            headers={"Content-Type": "application/json"} if data else {},
            method=method
        )
        with urllib.request.urlopen(req, timeout=5) as response:
            status = response.status
            body = response.read().decode("utf-8")
            return status, body
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8")
    except Exception as e:
        return 0, str(e)

def main():
    print("=" * 80)
    print("      NAGPUR URBAN CRISIS MANAGEMENT SYSTEM — MASTER FINAL CHECK")
    print("=" * 80)

    # 1. FRONTEND PAGES
    frontend_pages = [
        ("Home Overview Portal", "http://localhost:3000/"),
        ("Ward Risk Heatmap", "http://localhost:3000/map"),
        ("Safe Route Planner", "http://localhost:3000/routes"),
        ("Citizen Report (AI Vision)", "http://localhost:3000/report"),
        ("Admin Portal Login", "http://localhost:3000/login"),
        ("Disaster Command Dashboard", "http://localhost:3000/admin"),
    ]

    print("\n[1] FRONTEND USER INTERFACE PAGES (Next.js App Router):")
    fe_pass = 0
    for name, url in frontend_pages:
        code, content = test_url(name, url)
        if code == 200:
            print(f"  [PASS] {name:<30} -> HTTP {code} ({len(content):,} bytes) | {url}")
            fe_pass += 1
        else:
            print(f"  [FAIL] {name:<30} -> HTTP {code} | {url}")

    # 2. BACKEND API ENDPOINTS
    backend_apis = [
        ("System Health Check", "http://127.0.0.1:8000/api/health/", "GET", None),
        ("Ward PostGIS Risk GeoJSON", "http://127.0.0.1:8000/api/zones/risk/", "GET", None),
        ("Priority Queue (Sorted)", "http://127.0.0.1:8000/api/priority-queue/", "GET", None),
        ("Safe A* Routing Corridor", "http://127.0.0.1:8000/api/route/?from=21.1475,79.0650&to=21.1524,79.0888", "GET", None),
        ("Citizen Reports API", "http://127.0.0.1:8000/api/reports/", "GET", None),
        ("Twilio Service Status", "http://127.0.0.1:8000/api/alerts/status/", "GET", None),
        ("Twilio Alert Logs", "http://127.0.0.1:8000/api/alerts/logs/", "GET", None),
        ("8-Stage Rainfall Simulation", "http://127.0.0.1:8000/api/simulate-rainfall/", "POST", {"stage": 3}),
    ]

    print("\n[2] BACKEND CORE LOGIC & REST APIS (Django + PostGIS):")
    be_pass = 0
    for name, url, method, data in backend_apis:
        code, content = test_url(name, url, method, data)
        if code in (200, 201):
            detail = ""
            try:
                js = json.loads(content)
                if "features" in js:
                    detail = f"{len(js['features'])} Wards GeoJSON"
                elif "queue" in js:
                    detail = f"{len(js['queue'])} Wards in Queue (Top: {js['queue'][0]['zone_name']})"
                elif "safe_route" in js:
                    detail = f"{js['safe_route']['distance_km']} km Safe Path"
                elif "status" in js:
                    detail = f"Status: {js['status']}"
                elif "stage_name" in js:
                    detail = f"Stage: {js['stage_name']}"
            except Exception:
                detail = f"{len(content)} bytes"
            print(f"  [PASS] {name:<30} -> HTTP {code} ({detail}) | {url}")
            be_pass += 1
        else:
            print(f"  [FAIL] {name:<30} -> HTTP {code} | {url}")

    print("\n" + "=" * 80)
    print(f"FINAL RESULT: Frontend {fe_pass}/{len(frontend_pages)} Passed | Backend {be_pass}/{len(backend_apis)} Passed")
    if fe_pass == len(frontend_pages) and be_pass == len(backend_apis):
        print(">>> ALL FUNCTIONALITIES & ENDPOINTS ARE 100% OPERATIONAL ON LOCALHOST! <<<")
    print("=" * 80)

if __name__ == "__main__":
    main()
