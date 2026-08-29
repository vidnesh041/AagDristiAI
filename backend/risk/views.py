import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from zones.models import Zone, WeatherReading, TrafficReading
from .models import RiskScore
from .services import calculate_zone_risk, recalculate_all_zones_risk

logger = logging.getLogger(__name__)

# 8-Stage Rain Simulation Definitions (PDF Section 6 & 8)
SIMULATION_STAGES = {
    1: {"name": "Dry & Clear", "base_rain": 2.0, "traffic_mult": 0.3, "desc": "Normal baseline conditions across all wards."},
    2: {"name": "Scattered Showers", "base_rain": 15.0, "traffic_mult": 0.5, "desc": "Light monsoon showers starting in west Nagpur."},
    3: {"name": "Moderate Rainfall", "base_rain": 35.0, "traffic_mult": 0.7, "desc": "Water accumulation begins in low-elevation wards."},
    4: {"name": "Heavy Downpour", "base_rain": 60.0, "traffic_mult": 0.85, "desc": "Intense rainfall across Dharampeth, Somalwada, and Sitabuldi."},
    5: {"name": "Cloudburst & Inundation", "base_rain": 95.0, "traffic_mult": 1.0, "desc": "Severe flash flood warning. Drainage systems overwhelmed."},
    6: {"name": "Peak Crisis Gridlock", "base_rain": 85.0, "traffic_mult": 0.95, "desc": "High traffic congestion and submerged road corridors."},
    7: {"name": "Drainage Runoff & Receding", "base_rain": 30.0, "traffic_mult": 0.6, "desc": "Rain subsiding, municipal pumps engaged."},
    8: {"name": "Normalized & Safe", "base_rain": 0.0, "traffic_mult": 0.3, "desc": "All floodwaters drained, traffic corridors restored."},
}

class PriorityQueueView(APIView):
    """
    GET /api/priority-queue/
    Returns all 10 Nagpur municipal wards sorted strictly descending by current risk score.
    Used by Municipal Disaster Command Hub for dispatch coordination.
    """
    def get(self, request):
        zones = Zone.objects.all()
        queue = []

        for z in zones:
            latest_risk = z.risk_scores.first()
            latest_weather = z.weather_readings.first()
            latest_traffic = z.traffic_readings.first()
            unresolved_reports = z.reports.filter(verification_status__in=['Pending', 'Verified']).count()
            photo_waterlogging = z.reports.filter(waterlogging_detected=True).exists()

            score = latest_risk.score if latest_risk else 20.0
            category = latest_risk.category if latest_risk else 'Low'
            is_confirmed = latest_risk.is_photo_confirmed if latest_risk else photo_waterlogging

            queue.append({
                "zone_id": z.id,
                "zone_name": z.name,
                "risk_score": score,
                "category": category,
                "is_photo_confirmed": is_confirmed,
                "elevation_factor": z.elevation_factor,
                "drainage_capacity": z.drainage_capacity,
                "dispatch_status": z.dispatch_status,
                "rainfall_mm": latest_weather.rainfall_intensity_mm if latest_weather else 0.0,
                "congestion_level": latest_traffic.congestion_level if latest_traffic else 30,
                "unresolved_reports_count": unresolved_reports,
            })

        # Sort descending by risk score (Highest emergency first)
        queue.sort(key=lambda x: x["risk_score"], reverse=True)

        return Response({
            "status": "success",
            "timestamp": timezone.now().isoformat(),
            "total_wards": len(queue),
            "severe_count": sum(1 for q in queue if q["category"] == "Severe"),
            "high_count": sum(1 for q in queue if q["category"] == "High"),
            "queue": queue
        })


class SimulateRainfallView(APIView):
    """
    POST /api/simulate-rainfall/
    Triggers 8-stage disaster simulation curve for demonstrations and testing.
    Body parameter: { "stage": 1..8 } or default advances to heavy rain (stage 4/5).
    """
    def post(self, request):
        stage_num = request.data.get('stage', 5)
        try:
            stage_num = int(stage_num)
            if stage_num not in SIMULATION_STAGES:
                stage_num = 5
        except (ValueError, TypeError):
            stage_num = 5

        stage_info = SIMULATION_STAGES[stage_num]
        base_rain = stage_info["base_rain"]
        traffic_factor = stage_info["traffic_mult"]
        now = timezone.now()

        zones = Zone.objects.all()
        updated_wards = []

        for z in zones:
            # Low elevation zones (high elevation_factor) receive heavier relative rainfall
            basin_multiplier = 1.0 + (z.elevation_factor * 0.3)
            ward_rain = round(base_rain * basin_multiplier, 1)
            ward_traffic = min(98, int(30 + 65 * traffic_factor * (z.elevation_factor or 0.8)))

            # Save weather & traffic telemetry
            WeatherReading.objects.create(
                zone=z,
                rainfall_intensity_mm=ward_rain,
                source='simulated',
                recorded_at=now
            )
            TrafficReading.objects.create(
                zone=z,
                congestion_level=ward_traffic,
                recorded_at=now
            )

            # Recompute Risk Score
            risk_obj = calculate_zone_risk(z, trigger_alert=(stage_num in [4, 5]))

            updated_wards.append({
                "zone_id": z.id,
                "zone_name": z.name,
                "rainfall_mm": ward_rain,
                "congestion_level": ward_traffic,
                "risk_score": risk_obj.score,
                "category": risk_obj.category,
                "is_photo_confirmed": risk_obj.is_photo_confirmed
            })

        # Sort results
        updated_wards.sort(key=lambda x: x["risk_score"], reverse=True)

        return Response({
            "status": "success",
            "stage": stage_num,
            "stage_name": stage_info["name"],
            "description": stage_info["desc"],
            "simulated_at": now.isoformat(),
            "wards_updated": len(updated_wards),
            "priority_queue": updated_wards
        })
