import requests
import json
import sys

print("=" * 65)
print("     NAGPUR URBAN CRISIS AI - LOCALHOST VERIFICATION")
print("=" * 65)

# 1. Test Next.js Frontend Routes
frontend_routes = ["/", "/map", "/routes", "/login", "/admin", "/report"]
print("\n[1/2] TESTING FRONTEND ROUTES (http://localhost:3000):")
frontend_passed = 0
for r in frontend_routes:
    url = f"http://localhost:3000{r}"
    try:
        res = requests.get(url, timeout=10)
        symbol = "[PASS]" if res.status_code == 200 else "[FAIL]"
        print(f"  {symbol} {r:<14} -> HTTP {res.status_code} (Size: {len(res.content):,} bytes)")
        if res.status_code == 200:
            frontend_passed += 1
    except Exception as e:
        print(f"  [FAIL] {r:<14} -> Failed: {e}")

# 2. Test Django Backend APIs
backend_apis = [
    ("/api/health/", "Health Check"),
    ("/api/zones/risk/", "GeoJSON Ward Polygons & Risk"),
    ("/api/alerts/status/", "Twilio SMS/WhatsApp Status"),
    ("/api/alerts/logs/", "Disaster Alert Audit Logs")
]
print("\n[2/2] TESTING BACKEND APIS (http://127.0.0.1:8000):")
backend_passed = 0
for endpoint, label in backend_apis:
    url = f"http://127.0.0.1:8000{endpoint}"
    try:
        res = requests.get(url, timeout=10)
        symbol = "[PASS]" if res.status_code == 200 else "[FAIL]"
        data = res.json()
        extra = ""
        if "features" in data:
            extra = f"({len(data['features'])} GeoJSON Wards)"
        elif "status" in data:
            extra = f"(Status: {data['status']})"
        elif isinstance(data, list):
            extra = f"({len(data)} items)"
        print(f"  {symbol} {endpoint:<22} -> HTTP {res.status_code} {extra:<24} [{label}]")
        if res.status_code == 200:
            backend_passed += 1
    except Exception as e:
        print(f"  [FAIL] {endpoint:<22} -> Failed: {e}")

print("\n" + "=" * 65)
print(f"SUMMARY: Frontend {frontend_passed}/{len(frontend_routes)} Passed | Backend {backend_passed}/{len(backend_apis)} Passed")
print("=" * 65)

if frontend_passed == len(frontend_routes) and backend_passed == len(backend_apis):
    print(">>> ALL LOCALHOST SERVICES ARE FULLY OPERATIONAL AND VERIFIED! <<<")
else:
    sys.exit(1)
