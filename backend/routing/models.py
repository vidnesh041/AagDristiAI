from django.db import models
from django.conf import settings

# Check if GeoDjango is active
if getattr(settings, 'HAS_GEODJANGO', False):
    from django.contrib.gis.db import models as geomodels
    PointFieldClass = geomodels.PointField
else:
    PointFieldClass = models.JSONField


class ConstructionZone(models.Model):
    SOURCE_CHOICES = [
        ('tomtom_incidents_api', 'TomTom Incidents API'),
        ('manual', 'Manual Admin Entry'),
    ]

    name = models.CharField(max_length=200, help_text="Project or site name (e.g. Wardha Road Metro Corridor)")
    latitude = models.FloatField(help_text="Latitude coordinate")
    longitude = models.FloatField(help_text="Longitude coordinate")
    location = PointFieldClass(blank=True, null=True, help_text="Geo point of construction site")
    road_segment_id = models.CharField(max_length=100, blank=True, null=True, help_text="Associated road segment ID")
    source = models.CharField(max_length=30, choices=SOURCE_CHOICES, default='manual', help_text="Origin source of the incident/roadwork")
    description = models.TextField(blank=True, help_text="Details of construction or lane restrictions")
    delay_mins = models.FloatField(default=3.0, help_text="Estimated traffic delay in minutes")
    active = models.BooleanField(default=True, help_text="Whether this roadwork project is actively disrupting flow")
    added_at = models.DateTimeField(auto_now_add=True, help_text="Timestamp when construction zone was added")

    def __str__(self):
        return f"{self.name} [{self.source}] ({'Active' if self.active else 'Inactive'})"

    class Meta:
        ordering = ['-added_at']
