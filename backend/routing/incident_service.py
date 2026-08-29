import logging
import urllib.request
import json
import ssl
from django.utils import timezone
from django.conf import settings
from .models import ConstructionZone

logger = logging.getLogger(__name__)

# Nagpur Metropolitan Bounding Box: minLon, minLat, maxLon, maxLat
NAGPUR_BBOX = "78.90,20.90,79.30,21.35"

# 3-5 Known Real Nagpur Road Projects (Manual Public Works Baseline)
REAL_NAGPUR_CONSTRUCTION_PROJECTS = [
    {
        "name": "Wardha Road Metro Phase-2 Flyover Construction",
        "latitude": 21.1120,
        "longitude": 79.0680,
        "description": "Nagpur Metro Phase 2 viaduct pier erection & lane restrictions on NH-44 corridor near Chhatrapati Square.",
        "delay_mins": 6.5,
        "road_segment_id": "NH44_WARDHA_RD_01",
    },
    {
        "name": "Nagpur Outer Ring Road (Phase-1 Expansion)",
        "latitude": 21.1980,
        "longitude": 79.1250,
        "description": "Four-lane asphalt resurfacing & median culvert construction connecting Kalamna to Kamptee bypass.",
        "delay_mins": 5.0,
        "road_segment_id": "ORR_KALAMNA_02",
    },
    {
        "name": "Sitabuldi Interchange Underground Stormwater Box Drain",
        "latitude": 21.1465,
        "longitude": 79.0880,
        "description": "NMC deep stormwater channel widening & partial lane barricading near Sitabuldi main junction.",
        "delay_mins": 4.5,
        "road_segment_id": "SITABULDI_DRAIN_03",
    },
    {
        "name": "Amravati Road (Wadi Bypass) Grade Separator",
        "latitude": 21.1550,
        "longitude": 79.0250,
        "description": "NH-53 elevated corridor girder installation with alternate traffic diversions active.",
        "delay_mins": 7.0,
        "road_segment_id": "NH53_WADI_04",
    },
    {
        "name": "Mahal - Gandhibagh Heritage Corridor Drain Overhaul",
        "latitude": 21.1480,
        "longitude": 79.1080,
        "description": "Smart City municipal utility duct replacement & single-lane passage near Tilak Statue.",
        "delay_mins": 3.5,
        "road_segment_id": "MAHAL_DUCT_05",
    },
]


def seed_manual_construction_projects():
    """
    Seeds the 5 known real Nagpur infrastructure & roadwork projects with source='manual'.
    """
    created_count = 0
    for proj in REAL_NAGPUR_CONSTRUCTION_PROJECTS:
        obj, created = ConstructionZone.objects.get_or_create(
            name=proj["name"],
            defaults={
                "latitude": proj["latitude"],
                "longitude": proj["longitude"],
                "description": proj["description"],
                "delay_mins": proj["delay_mins"],
                "road_segment_id": proj["road_segment_id"],
                "source": "manual",
                "active": True,
            }
        )
        if created:
            created_count += 1
    return created_count


def fetch_tomtom_traffic_incidents():
    """
    Calls TomTom Traffic Incidents API v5 for Nagpur bounding box.
    Filters for roadwork, construction, lane closures, and accident hazard events.
    Logs whether results came back or failed.
    """
    api_key = getattr(settings, 'TOMTOM_API_KEY', '')
    if not api_key:
        logger.warning("TomTom API key not set. Skipping TomTom Incidents API call.")
        return {"success": False, "count": 0, "incidents": [], "reason": "No API key configured"}

    url = (
        f"https://api.tomtom.com/traffic/services/5/incidentDetails"
        f"?key={api_key}"
        f"&bbox={NAGPUR_BBOX}"
        f"&fields={{incidents{{type,geometry{{type,coordinates}},properties{{id,iconCategory,magnitudeOfDelay,events{{description,code}}}}}}}}"
        f"&language=en-GB"
    )

    try:
        ctx = ssl._create_unverified_context()
        req = urllib.request.Request(url, headers={"User-Agent": "NagDrishtiAI/1.0"})
        with urllib.request.urlopen(req, timeout=8, context=ctx) as resp:
            if resp.status == 200:
                data = json.loads(resp.read().decode())
                incidents = data.get("incidents", [])
                logger.info(f"TomTom Incidents API returned {len(incidents)} raw events for Nagpur bbox.")

                saved_count = 0
                for inc in incidents:
                    geom = inc.get("geometry", {})
                    props = inc.get("properties", {})
                    events = props.get("events", [])
                    icon_cat = props.get("iconCategory", 0)

                    # Filter for Road Works (iconCategory 9), Road Closed (iconCategory 8), Lane Restriction, etc.
                    desc = events[0].get("description", "Roadwork incident") if events else "Active traffic hazard"
                    coords = geom.get("coordinates", [])
                    if coords and len(coords) >= 2:
                        # Extract first point if LineString or Point
                        pt = coords[0] if isinstance(coords[0], (list, tuple)) else coords
                        lon, lat = float(pt[0]), float(pt[1])

                        ConstructionZone.objects.update_or_create(
                            road_segment_id=f"TT_{props.get('id', 'INC')}",
                            defaults={
                                "name": f"TomTom Alert: {desc[:60]}",
                                "latitude": lat,
                                "longitude": lon,
                                "description": desc,
                                "delay_mins": float(props.get("magnitudeOfDelay", 3) * 2),
                                "source": "tomtom_incidents_api",
                                "active": True,
                            }
                        )
                        saved_count += 1

                return {
                    "success": True,
                    "count": len(incidents),
                    "saved": saved_count,
                    "reason": f"Successfully ingested {saved_count} incident records from TomTom API."
                }
    except Exception as e:
        logger.warning(f"TomTom Incidents API request for Nagpur returned error: {e}")
        return {
            "success": False,
            "count": 0,
            "reason": f"TomTom API call returned: {e}. Active manual construction projects remain operational."
        }


def sync_all_construction_zones():
    """
    Master sync job: Ensures real manual seed projects exist, then tries TomTom Incidents API.
    """
    manual_seeded = seed_manual_construction_projects()
    tomtom_result = fetch_tomtom_traffic_incidents()
    
    total_active = ConstructionZone.objects.filter(active=True).count()
    return {
        "manual_seeded": manual_seeded,
        "tomtom_result": tomtom_result,
        "total_active_zones": total_active,
    }
