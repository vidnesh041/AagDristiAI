import logging
import urllib.request
import json
import ssl
import random
from django.utils import timezone
from django.conf import settings
from .models import Zone, TrafficReading

logger = logging.getLogger(__name__)

# Known Centroids for Nagpur Municipal Wards
ZONE_CENTROIDS = {
    "Dharampeth (Zone 2)": (21.1475, 79.0650),
    "Sitabuldi (Zone 4)": (21.1465, 79.0880),
    "Sadar (Zone 3)": (21.1635, 79.0825),
    "Mahal (Zone 5)": (21.1450, 79.1050),
    "Dhantoli (Zone 4)": (21.1325, 79.0825),
    "Laxmi Nagar (Zone 1)": (21.1275, 79.0575),
    "Somalwada (Zone 9)": (21.0975, 79.0650),
    "Gandhibagh (Zone 6)": (21.1600, 79.1100),
    "Mangalwari (Zone 10)": (21.1850, 79.0750),
    "Hanuman Nagar (Zone 8)": (21.1200, 79.1100),
}


def get_zone_centroid(zone: Zone):
    """
    Computes or retrieves geographic centroid (lat, lon) for a ward.
    """
    if zone.name in ZONE_CENTROIDS:
        return ZONE_CENTROIDS[zone.name]

    coords = zone.get_polygon_coords()
    if coords and len(coords) > 0:
        ring = coords[0] if isinstance(coords[0][0], (list, tuple)) else coords
        lats = [pt[1] for pt in ring]
        lons = [pt[0] for pt in ring]
        if lats and lons:
            return sum(lats) / len(lats), sum(lons) / len(lons)

    return 21.1458, 79.0882


def fetch_tomtom_traffic_flow(lat: float, lon: float):
    """
    Calls TomTom Traffic Flow API for a given coordinate.
    Returns dict with congestion_level, current_speed, free_flow_speed, source.
    """
    api_key = getattr(settings, 'TOMTOM_API_KEY', '')
    if not api_key:
        logger.warning("TomTom API key not configured in settings. Falling back to simulated traffic.")
        return None

    url = f"https://api.tomtom.com/traffic/services/4/flowSegmentData/relative0/10/json?point={lat:.6f},{lon:.6f}&key={api_key}"

    try:
        ctx = ssl._create_unverified_context()
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "NagDrishtiAI/1.0"}
        )
        with urllib.request.urlopen(req, timeout=5, context=ctx) as resp:
            if resp.status == 200:
                data = json.loads(resp.read().decode())
                flow = data.get("flowSegmentData", {})
                current_speed = float(flow.get("currentSpeed", 30))
                free_flow_speed = float(flow.get("freeFlowSpeed", 40))

                # Calculate congestion percentage (0 = free flow, 100 = gridlock)
                if free_flow_speed > 0:
                    delay_ratio = max(0.0, (free_flow_speed - current_speed) / free_flow_speed)
                    congestion_level = int(round(delay_ratio * 100))
                else:
                    congestion_level = 30

                congestion_level = max(5, min(98, congestion_level))

                return {
                    "success": True,
                    "congestion_level": congestion_level,
                    "current_speed_kmh": current_speed,
                    "free_flow_speed_kmh": free_flow_speed,
                    "source": "tomtom_api",
                }
    except Exception as e:
        logger.warning(f"TomTom Traffic API call failed for ({lat}, {lon}): {e}. Falling back to simulated reading.")

    return None


def sync_all_wards_traffic():
    """
    Scheduled ingestion job: Calls TomTom Traffic Flow API for each seeded zone's centroid
    and records TrafficReading with source='tomtom_api' (or source='simulated' on failure).
    Never crashes silently.
    """
    zones = Zone.objects.all()
    now = timezone.now()
    results = []

    for zone in zones:
        lat, lon = get_zone_centroid(zone)
        flow_data = fetch_tomtom_traffic_flow(lat, lon)

        if flow_data and flow_data.get("success"):
            reading = TrafficReading.objects.create(
                zone=zone,
                congestion_level=flow_data["congestion_level"],
                current_speed_kmh=flow_data["current_speed_kmh"],
                free_flow_speed_kmh=flow_data["free_flow_speed_kmh"],
                source="tomtom_api",
                recorded_at=now,
            )
            results.append({
                "zone": zone.name,
                "congestion_level": flow_data["congestion_level"],
                "source": "tomtom_api",
                "speed": f"{flow_data['current_speed_kmh']}/{flow_data['free_flow_speed_kmh']} km/h",
            })
        else:
            # High-fidelity simulated fallback with realistic city variance
            latest = zone.traffic_readings.first()
            prev_congestion = latest.congestion_level if latest else 45
            delta = random.randint(-8, 10)
            sim_congestion = max(10, min(95, prev_congestion + delta))
            sim_free_flow = 45.0
            sim_current_speed = round(sim_free_flow * (1.0 - (sim_congestion / 120.0)), 1)

            reading = TrafficReading.objects.create(
                zone=zone,
                congestion_level=sim_congestion,
                current_speed_kmh=sim_current_speed,
                free_flow_speed_kmh=sim_free_flow,
                source="simulated",
                recorded_at=now,
            )
            results.append({
                "zone": zone.name,
                "congestion_level": sim_congestion,
                "source": "simulated",
                "speed": f"{sim_current_speed}/{sim_free_flow} km/h (fallback)",
            })

    return results
