from django.core.management.base import BaseCommand
from routing.incident_service import sync_all_construction_zones
from routing.models import ConstructionZone

class Command(BaseCommand):
    help = "Sync roadwork and construction incidents from TomTom Traffic Incidents API and seed manual public works projects."

    def handle(self, *args, **options):
        self.stdout.write("Initiating Construction Zone Ingestion Job for Nagpur...")
        res = sync_all_construction_zones()
        
        tomtom_res = res["tomtom_result"]
        self.stdout.write(f"  - TomTom Incidents API Status: {'SUCCESS' if tomtom_res['success'] else 'FAILED'}")
        self.stdout.write(f"  - Details: {tomtom_res['reason']}")
        self.stdout.write(self.style.SUCCESS(
            f"Total Active Construction Zones: {res['total_active_zones']} (Manual seeded projects: {res['manual_seeded']})"
        ))

        for cz in ConstructionZone.objects.filter(active=True):
            self.stdout.write(f"    • [{cz.source}] {cz.name} ({cz.latitude:.4f}, {cz.longitude:.4f}) +{cz.delay_mins}m delay")
