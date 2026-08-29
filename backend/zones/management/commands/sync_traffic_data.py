from django.core.management.base import BaseCommand
from zones.traffic_service import sync_all_wards_traffic
from risk.services import recalculate_all_zones_risk

class Command(BaseCommand):
    help = "Ingest real-time traffic flow telemetry from TomTom Traffic API (or simulated fallback) for all Nagpur wards."

    def handle(self, *args, **options):
        self.stdout.write("Calling TomTom Traffic Flow API for Nagpur municipal wards...")
        results = sync_all_wards_traffic()
        
        tomtom_count = sum(1 for r in results if r["source"] == "tomtom_api")
        sim_count = sum(1 for r in results if r["source"] == "simulated")
        
        self.stdout.write(self.style.SUCCESS(
            f"Successfully recorded traffic readings for {len(results)} wards ({tomtom_count} TomTom API, {sim_count} Simulated Fallback)."
        ))

        for r in results:
            self.stdout.write(f"  - {r['zone']}: Congestion {r['congestion_level']}% [{r['source']}] (Speed: {r['speed']})")

        recalculate_all_zones_risk(trigger_alert=False)
        self.stdout.write(self.style.SUCCESS("Recalculated zone risk scores with updated traffic congestion."))
