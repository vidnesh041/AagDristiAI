import random
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.conf import settings

from zones.models import Zone, WeatherReading, TrafficReading
from reports.models import Report
from risk.models import RiskScore
from alerts.models import AlertLog

# 10 Representative Municipal Wards of Nagpur with approximate boundary coordinates [lng, lat]
NAGPUR_WARDS = [
    {
        "name": "Dharampeth (Zone 2)",
        "elevation_factor": 0.88,  # Low-lying area prone to Nag river overflow
        "drainage_capacity": 38.0,  # 38 mm/hr
        "dispatch_status": "Dispatched",
        "center": [21.1475, 79.0650],
        "coordinates": [
            [79.0550, 21.1400],
            [79.0750, 21.1400],
            [79.0750, 21.1550],
            [79.0550, 21.1550],
            [79.0550, 21.1400],
        ],
        "initial_rain": 58.5,
        "traffic": 85,
        "risk_score": 84.2,
        "risk_cat": "Severe",
        "photo_confirmed": True,
    },
    {
        "name": "Sitabuldi (Zone 4)",
        "elevation_factor": 0.82,  # Commercial hub, high runoff
        "drainage_capacity": 42.0,
        "dispatch_status": "Unassigned",
        "center": [21.1460, 79.0850],
        "coordinates": [
            [79.0750, 21.1400],
            [79.0950, 21.1400],
            [79.0950, 21.1520],
            [79.0750, 21.1520],
            [79.0750, 21.1400],
        ],
        "initial_rain": 46.0,
        "traffic": 78,
        "risk_score": 71.0,
        "risk_cat": "High",
        "photo_confirmed": False,
    },
    {
        "name": "Somalwada (Zone 9)",
        "elevation_factor": 0.75,  # South Nagpur catchment basin
        "drainage_capacity": 40.0,
        "dispatch_status": "Dispatched",
        "center": [21.0975, 79.0650],
        "coordinates": [
            [79.0500, 21.0850],
            [79.0800, 21.0850],
            [79.0800, 21.1100],
            [79.0500, 21.1100],
            [79.0500, 21.0850],
        ],
        "initial_rain": 52.0,
        "traffic": 72,
        "risk_score": 76.5,
        "risk_cat": "Severe",
        "photo_confirmed": True,
    },
    {
        "name": "Mahal (Zone 5)",
        "elevation_factor": 0.55,  # Moderate elevation
        "drainage_capacity": 55.0,
        "dispatch_status": "Unassigned",
        "center": [21.1475, 79.1075],
        "coordinates": [
            [79.0950, 21.1400],
            [79.1200, 21.1400],
            [79.1200, 21.1550],
            [79.0950, 21.1550],
            [79.0950, 21.1400],
        ],
        "initial_rain": 31.0,
        "traffic": 60,
        "risk_score": 44.0,
        "risk_cat": "Medium",
        "photo_confirmed": False,
    },
    {
        "name": "Gandhibagh (Zone 6)",
        "elevation_factor": 0.60,
        "drainage_capacity": 50.0,
        "dispatch_status": "Unassigned",
        "center": [21.1625, 79.1100],
        "coordinates": [
            [79.0950, 21.1550],
            [79.1250, 21.1550],
            [79.1250, 21.1700],
            [79.0950, 21.1700],
            [79.0950, 21.1550],
        ],
        "initial_rain": 34.0,
        "traffic": 65,
        "risk_score": 48.2,
        "risk_cat": "Medium",
        "photo_confirmed": False,
    },
    {
        "name": "Dhantoli (Zone 4)",
        "elevation_factor": 0.70,
        "drainage_capacity": 48.0,
        "dispatch_status": "Resolved",
        "center": [21.1325, 79.0825],
        "coordinates": [
            [79.0700, 21.1250],
            [79.0950, 21.1250],
            [79.0950, 21.1400],
            [79.0700, 21.1400],
            [79.0700, 21.1250],
        ],
        "initial_rain": 24.0,
        "traffic": 45,
        "risk_score": 36.0,
        "risk_cat": "Medium",
        "photo_confirmed": False,
    },
    {
        "name": "Sadar (Zone 3)",
        "elevation_factor": 0.35,  # Higher plateau
        "drainage_capacity": 75.0,
        "dispatch_status": "Unassigned",
        "center": [21.1635, 79.0825],
        "coordinates": [
            [79.0700, 21.1520],
            [79.0950, 21.1520],
            [79.0950, 21.1750],
            [79.0700, 21.1750],
            [79.0700, 21.1520],
        ],
        "initial_rain": 14.0,
        "traffic": 35,
        "risk_score": 18.5,
        "risk_cat": "Low",
        "photo_confirmed": False,
    },
    {
        "name": "Mangalwari (Zone 10)",
        "elevation_factor": 0.40,
        "drainage_capacity": 70.0,
        "dispatch_status": "Unassigned",
        "center": [21.1875, 79.0775],
        "coordinates": [
            [79.0600, 21.1750],
            [79.0950, 21.1750],
            [79.0950, 21.2000],
            [79.0600, 21.2000],
            [79.0600, 21.1750],
        ],
        "initial_rain": 12.0,
        "traffic": 30,
        "risk_score": 15.0,
        "risk_cat": "Low",
        "photo_confirmed": False,
    },
    {
        "name": "Hanuman Nagar (Zone 8)",
        "elevation_factor": 0.45,
        "drainage_capacity": 65.0,
        "dispatch_status": "Unassigned",
        "center": [21.1225, 79.1100],
        "coordinates": [
            [79.0950, 21.1100],
            [79.1250, 21.1100],
            [79.1250, 21.1350],
            [79.0950, 21.1350],
            [79.0950, 21.1100],
        ],
        "initial_rain": 18.0,
        "traffic": 40,
        "risk_score": 22.0,
        "risk_cat": "Low",
        "photo_confirmed": False,
    },
    {
        "name": "Laxmi Nagar (Zone 1)",
        "elevation_factor": 0.50,
        "drainage_capacity": 60.0,
        "dispatch_status": "Resolved",
        "center": [21.1275, 79.0575],
        "coordinates": [
            [79.0450, 21.1150],
            [79.0700, 21.1150],
            [79.0700, 21.1400],
            [79.0450, 21.1400],
            [79.0450, 21.1150],
        ],
        "initial_rain": 20.0,
        "traffic": 42,
        "risk_score": 24.5,
        "risk_cat": "Low",
        "photo_confirmed": False,
    },
]

class Command(BaseCommand):
    help = "Seeds database with Nagpur ward boundaries, weather telemetry, traffic, reports, and risk scores."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Initializing Nagpur Spatial Seed Data..."))

        now = timezone.now()
        has_geodjango = getattr(settings, 'HAS_GEODJANGO', False)

        for ward_info in NAGPUR_WARDS:
            geojson_geom = {
                "type": "Polygon",
                "coordinates": [ward_info["coordinates"]],
            }

            if has_geodjango:
                from django.contrib.gis.geos import Polygon
                boundary_obj = Polygon(ward_info["coordinates"])
            else:
                boundary_obj = geojson_geom

            zone, created = Zone.objects.update_or_create(
                name=ward_info["name"],
                defaults={
                    "boundary": boundary_obj,
                    "boundary_geojson": geojson_geom,
                    "elevation_factor": ward_info["elevation_factor"],
                    "drainage_capacity": ward_info["drainage_capacity"],
                    "dispatch_status": ward_info["dispatch_status"],
                }
            )

            action_text = "Created" if created else "Updated"
            self.stdout.write(f" - [{action_text}] Ward: {zone.name}")

            # 1. Seed weather readings (last 3 hours and 3 days of historical intervals)
            for hours_ago in [0, 1, 2, 6, 12, 24, 48]:
                reading_time = now - timedelta(hours=hours_ago)
                rain_val = max(0.0, ward_info["initial_rain"] * random.uniform(0.7, 1.2) - (hours_ago * 1.5))
                WeatherReading.objects.create(
                    zone=zone,
                    rainfall_intensity_mm=round(rain_val, 1),
                    source="imd_api" if hours_ago <= 2 else "simulated",
                    recorded_at=reading_time,
                )

            # 2. Seed traffic readings
            for hours_ago in [0, 1, 3, 6, 12]:
                reading_time = now - timedelta(hours=hours_ago)
                traffic_val = max(10, min(100, int(ward_info["traffic"] + random.randint(-10, 10))))
                TrafficReading.objects.create(
                    zone=zone,
                    congestion_level=traffic_val,
                    recorded_at=reading_time,
                )

            # 3. Seed initial RiskScore
            RiskScore.objects.create(
                zone=zone,
                score=ward_info["risk_score"],
                category=ward_info["risk_cat"],
                is_photo_confirmed=ward_info["photo_confirmed"],
                computed_at=now,
            )

            # 4. Seed citizen reports for high/severe risk zones
            if ward_info["risk_cat"] in ["High", "Severe"]:
                lat, lng = ward_info["center"]
                Report.objects.create(
                    reporter_location={"type": "Point", "coordinates": [lng, lat]} if not has_geodjango else None,
                    latitude=lat,
                    longitude=lng,
                    description=f"Severe water accumulation observed near {zone.name} main arterial road junction.",
                    zone=zone,
                    pothole_detected=True,
                    pothole_confidence=0.89,
                    waterlogging_detected=ward_info["photo_confirmed"],
                    waterlogging_confidence=0.94 if ward_info["photo_confirmed"] else 0.40,
                    verification_status="Verified" if ward_info["photo_confirmed"] else "Pending",
                )

                # 5. Seed emergency AlertLog for high/severe zones
                AlertLog.objects.create(
                    zone=zone,
                    risk_category_at_send=ward_info["risk_cat"],
                    risk_score_at_send=ward_info["risk_score"],
                    channel="SMS" if ward_info["name"].startswith("Dharampeth") else "WhatsApp",
                    recipient="+919876543210",
                    message_body=f"CRITICAL DISASTER ALERT: {zone.name} risk level is {ward_info['risk_cat']} ({ward_info['risk_score']}). Waterlogging confirmed. Immediate action required.",
                    status="Sent",
                )

        # 6. Seed Demo Test Accounts (Citizen & Official Admin)
        from django.contrib.auth.models import User
        from rest_framework.authtoken.models import Token

        # A. Citizen Account
        citizen_user, _ = User.objects.get_or_create(
            username="citizen_demo",
            defaults={"email": "citizen@nagpur.gov.in", "first_name": "Nagpur", "last_name": "Citizen", "is_staff": False}
        )
        citizen_user.set_password("citizen123")
        citizen_user.is_staff = False
        citizen_user.save()
        Token.objects.get_or_create(user=citizen_user)

        # B. Municipal Admin Account
        admin_user, _ = User.objects.get_or_create(
            username="nmc_admin",
            defaults={"email": "disaster_hq@nmc.gov.in", "first_name": "NMC Command", "last_name": "Admin", "is_staff": True}
        )
        admin_user.set_password("admin123")
        admin_user.is_staff = True
        admin_user.save()
        Token.objects.get_or_create(user=admin_user)

        self.stdout.write(self.style.SUCCESS("[OK] Demo Accounts seeded: 'citizen_demo' (Citizen) & 'nmc_admin' (Admin)"))
        self.stdout.write(self.style.SUCCESS("Successfully seeded Nagpur spatial datasets, telemetry, and initial risk records."))

