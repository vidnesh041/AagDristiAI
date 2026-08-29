import logging
import requests
from datetime import datetime
from django.utils import timezone
from django.conf import settings
from .models import Zone, WeatherReading

logger = logging.getLogger(__name__)

# Nagpur Geographic Coordinates: 21.1458° N, 79.0882° E
NAGPUR_LAT = 21.1458
NAGPUR_LON = 79.0882

def fetch_live_rainfall(latitude=NAGPUR_LAT, longitude=NAGPUR_LON):
    """
    Fetches real-time rainfall and past 3-hour precipitation data from Open-Meteo / IMD API.
    Open-Meteo is free and does not require an API key, providing live satellite/radar feeds for Nagpur.
    """
    base_url = getattr(settings, 'OPEN_METEO_BASE_URL', 'https://api.open-meteo.com/v1/forecast')
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": ["precipitation", "rain", "showers"],
        "hourly": ["precipitation", "rain"],
        "forecast_days": 1,
        "timezone": "Asia/Kolkata",
    }

    try:
        response = requests.get(base_url, params=params, timeout=5)
        if response.status_code == 200:
            data = response.json()
            current_rain = data.get("current", {}).get("precipitation", 0.0) or 0.0
            
            # Calculate last 3-hour rainfall sum if hourly is available
            hourly_rain = data.get("hourly", {}).get("precipitation", [])
            last_3hr_sum = sum(hourly_rain[:3]) if len(hourly_rain) >= 3 else current_rain * 3.0

            return {
                "success": True,
                "current_rainfall_mm": float(current_rain),
                "last_3hr_rainfall_mm": float(last_3hr_sum),
                "source": "open_meteo_live",
                "timestamp": timezone.now(),
            }
    except Exception as e:
        logger.warning(f"Live Weather API call failed: {e}. Using fallback telemetry.")

    # Fallback if external API is unreachable
    return {
        "success": False,
        "current_rainfall_mm": 28.5,
        "last_3hr_rainfall_mm": 45.0,
        "source": "simulated",
        "timestamp": timezone.now(),
    }


def sync_all_wards_weather():
    """
    Fetches live rainfall telemetry and records new WeatherReading entries for all 10 Nagpur wards.
    """
    zones = Zone.objects.all()
    results = []
    
    # Fetch base city weather
    city_weather = fetch_live_rainfall()
    base_rain = city_weather["last_3hr_rainfall_mm"]
    source = "imd_api" if city_weather["success"] else "simulated"

    now = timezone.now()
    for zone in zones:
        # Slight localized variance per ward drainage basin
        variance = (1.0 - zone.elevation_factor * 0.2)
        ward_rain = round(max(0.0, base_rain * variance), 1)

        reading = WeatherReading.objects.create(
            zone=zone,
            rainfall_intensity_mm=ward_rain,
            source=source,
            recorded_at=now
        )
        results.append({
            "zone_id": zone.id,
            "zone_name": zone.name,
            "rainfall_mm": ward_rain,
            "source": source
        })

    return {
        "synced_at": now.isoformat(),
        "total_wards_updated": len(results),
        "source": source,
        "wards": results
    }
