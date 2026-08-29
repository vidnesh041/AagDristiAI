import logging
from django.utils import timezone
from datetime import timedelta
from zones.models import Zone, WeatherReading
from reports.models import Report
from .models import RiskScore

logger = logging.getLogger(__name__)

# Weight coefficients specified in PDF Section 3 & 4
W_RAINFALL = 0.35
W_DRAINAGE = 0.25
W_ELEVATION = 0.15
W_INCIDENTS = 0.15
W_DENSITY = 0.10


def calculate_zone_risk(zone: Zone, trigger_alert: bool = True) -> RiskScore:
    """
    Computes the normalized 0-100 risk score for a single Nagpur municipal ward using
    the weighted multi-factor disaster equation:
    Risk = 0.35*Rain + 0.25*DrainageDeficit + 0.15*Elevation + 0.15*Incidents + 0.10*Density
    """
    now = timezone.now()
    cutoff_24h = now - timedelta(hours=24)

    # 1. Rainfall Factor (Last 3 hours precipitation in mm, normalized to 100mm max baseline)
    latest_weather = zone.weather_readings.order_by('-recorded_at').first()
    rain_mm = latest_weather.rainfall_intensity_mm if latest_weather else 0.0
    rain_score = min(100.0, (rain_mm / 80.0) * 100.0)

    # 2. Drainage Deficit Factor (100 - drainage capacity)
    drainage_deficit = max(0.0, 100.0 - float(zone.drainage_capacity))

    # 3. Elevation Factor (Inundation vulnerability, zone.elevation_factor 0.0 - 1.0)
    elevation_score = float(zone.elevation_factor) * 100.0

    # 4. Incident Frequency Factor (Verified reports in last 24h, normalized against 10 incidents)
    verified_count = zone.reports.filter(
        created_at__gte=cutoff_24h,
        verification_status='Verified'
    ).count()
    incident_score = min(100.0, (verified_count / 8.0) * 100.0)

    # 5. Citizen Report Density Factor (Total recent reports, normalized against 15 reports)
    total_recent_reports = zone.reports.filter(created_at__gte=cutoff_24h).count()
    density_score = min(100.0, (total_recent_reports / 12.0) * 100.0)

    # Weighted Composite Equation
    raw_score = (
        W_RAINFALL * rain_score +
        W_DRAINAGE * drainage_deficit +
        W_ELEVATION * elevation_score +
        W_INCIDENTS * incident_score +
        W_DENSITY * density_score
    )
    final_score = round(max(0.0, min(100.0, raw_score)), 1)

    # Category Classification (Section 4)
    if final_score <= 25.0:
        category = 'Low'
    elif final_score <= 50.0:
        category = 'Medium'
    elif final_score <= 75.0:
        category = 'High'
    else:
        category = 'Severe'

    # Check if there are active Verified citizen photo reports of waterlogging
    has_photo_waterlogging = zone.reports.filter(
        waterlogging_detected=True,
        verification_status='Verified'
    ).exists()

    # Persist calculation
    risk_obj = RiskScore.objects.create(
        zone=zone,
        score=final_score,
        category=category,
        is_photo_confirmed=has_photo_waterlogging
    )

    # Trigger emergency alert if High or Severe (>= 51)
    if trigger_alert and final_score >= 51.0:
        try:
            from alerts.twilio_service import dispatch_crisis_alert
            alert_msg = (
                f"🚨 [NMC CRISIS ALERT] {zone.name} reached {category.upper()} Risk ({final_score}/100). "
                f"Rainfall: {rain_mm}mm, Drainage Deficit: {drainage_deficit:.0f}%. "
                f"{'Photo Confirmed.' if has_photo_waterlogging else ''}"
            )
            dispatch_crisis_alert(
                zone=zone,
                risk_category=category,
                risk_score=final_score,
                custom_message=alert_msg
            )
        except Exception as e:
            logger.error(f"Automatic Twilio alert trigger failed for {zone.name}: {e}")

    return risk_obj


def recalculate_all_zones_risk(trigger_alert: bool = False):
    """
    Recalculates current risk scores for all 10 Nagpur municipal wards.
    """
    zones = Zone.objects.all()
    results = []
    for zone in zones:
        risk_obj = calculate_zone_risk(zone, trigger_alert=trigger_alert)
        results.append({
            "zone_id": zone.id,
            "zone_name": zone.name,
            "score": risk_obj.score,
            "category": risk_obj.category,
            "is_photo_confirmed": risk_obj.is_photo_confirmed,
            "computed_at": risk_obj.computed_at.isoformat()
        })
    return results
