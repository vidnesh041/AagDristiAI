from django.db import models
from django.conf import settings

# Check if GeoDjango is active
if getattr(settings, 'HAS_GEODJANGO', False):
    from django.contrib.gis.db import models as geomodels
    PolygonFieldClass = geomodels.PolygonField
    PointFieldClass = geomodels.PointField
else:
    # High-compatibility spatial fallback for environments without OSGeo/GDAL C-libs
    PolygonFieldClass = models.JSONField
    PointFieldClass = models.JSONField

class Zone(models.Model):
    DISPATCH_CHOICES = [
        ('Unassigned', 'Unassigned'),
        ('Dispatched', 'Dispatched'),
        ('Resolved', 'Resolved'),
    ]

    name = models.CharField(max_length=100, unique=True, help_text="Name of the ward (e.g., Dharampeth, Sitabuldi)")
    boundary = PolygonFieldClass(help_text="Spatial boundary polygon outlining the geographic ward area")
    boundary_geojson = models.JSONField(blank=True, null=True, help_text="GeoJSON geometry representation for API/Map")
    elevation_factor = models.FloatField(default=1.0, help_text="Relative elevation indicator (identifies low-lying drainage basins)")
    drainage_capacity = models.FloatField(default=50.0, help_text="Stormwater and sewer runoff capacity rating (0-100)")
    dispatch_status = models.CharField(max_length=20, choices=DISPATCH_CHOICES, default='Unassigned', help_text="Civic response tracking")

    def get_polygon_coords(self):
        """
        Returns the [ [ [lon, lat], ... ] ] coordinate array from boundary_geojson or boundary field.
        """
        if self.boundary_geojson and isinstance(self.boundary_geojson, dict):
            return self.boundary_geojson.get('coordinates', [])
        if isinstance(self.boundary, dict):
            return self.boundary.get('coordinates', [])
        if hasattr(self.boundary, 'coords'):
            return list(self.boundary.coords)
        return []

    def __str__(self):
        return f"{self.name} ({self.dispatch_status})"

    class Meta:
        ordering = ['name']


class WeatherReading(models.Model):
    SOURCE_CHOICES = [
        ('imd_api', 'IMD API / Live Feed'),
        ('simulated', 'Simulated'),
    ]

    zone = models.ForeignKey(Zone, on_delete=models.CASCADE, related_name='weather_readings')
    rainfall_intensity_mm = models.FloatField(help_text="Rainfall volume in millimeters (mm)")
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default='simulated')
    recorded_at = models.DateTimeField(help_text="Timestamp when the rainfall measurement was recorded")

    def __str__(self):
        return f"{self.zone.name} - {self.rainfall_intensity_mm}mm ({self.source}) at {self.recorded_at}"

    class Meta:
        ordering = ['-recorded_at']


class TrafficReading(models.Model):
    SOURCE_CHOICES = [
        ('tomtom_api', 'TomTom Traffic API'),
        ('simulated', 'Simulated'),
    ]

    zone = models.ForeignKey(Zone, on_delete=models.CASCADE, related_name='traffic_readings')
    congestion_level = models.IntegerField(help_text="Traffic index (0 = free-flowing traffic, 100 = gridlock)")
    current_speed_kmh = models.FloatField(blank=True, null=True, help_text="Current observed road speed (km/h)")
    free_flow_speed_kmh = models.FloatField(blank=True, null=True, help_text="Normal free-flow speed (km/h)")
    source = models.CharField(max_length=30, choices=SOURCE_CHOICES, default='simulated', help_text="Data ingestion source")
    recorded_at = models.DateTimeField(help_text="Timestamp when the congestion level was recorded")

    def __str__(self):
        return f"{self.zone.name} - Congestion {self.congestion_level}% ({self.source}) at {self.recorded_at}"

    class Meta:
        ordering = ['-recorded_at']
