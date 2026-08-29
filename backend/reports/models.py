from django.db import models
from django.conf import settings
from zones.models import Zone

# Check if GeoDjango is active
if getattr(settings, 'HAS_GEODJANGO', False):
    from django.contrib.gis.db import models as geomodels
    PointFieldClass = geomodels.PointField
else:
    PointFieldClass = models.JSONField

class Report(models.Model):
    VERIFICATION_CHOICES = [
        ('Pending', 'Pending'),
        ('Verified', 'Verified'),
        ('Rejected', 'Rejected'),
        ('Resolved', 'Resolved'),
    ]

    reporter_location = PointFieldClass(blank=True, null=True, help_text="GPS coordinates of the hazard")
    latitude = models.FloatField(blank=True, null=True, help_text="Latitude coordinate")
    longitude = models.FloatField(blank=True, null=True, help_text="Longitude coordinate")
    photo = models.ImageField(upload_to='reports/', blank=True, null=True, help_text="Uploaded image of road condition")
    description = models.TextField(blank=True, help_text="Citizen incident notes or commentary")
    zone = models.ForeignKey(Zone, on_delete=models.SET_NULL, null=True, blank=True, related_name='reports', help_text="Auto-assigned zone")
    pothole_detected = models.BooleanField(default=False, help_text="True if Hugging Face AI confirms pothole presence")
    pothole_confidence = models.FloatField(default=0.0, help_text="Confidence score of pothole detection model (0.0-1.0)")
    waterlogging_detected = models.BooleanField(default=False, help_text="True if Hugging Face AI confirms waterlogging presence")
    waterlogging_confidence = models.FloatField(default=0.0, help_text="Confidence score of waterlogging detection model (0.0-1.0)")
    verification_status = models.CharField(max_length=20, choices=VERIFICATION_CHOICES, default='Pending', help_text="Administrative review state")
    created_at = models.DateTimeField(auto_now_add=True, help_text="Submission timestamp")

    def __str__(self):
        zone_name = self.zone.name if self.zone else "Unknown Zone"
        return f"Report #{self.id} - {zone_name} ({self.verification_status})"

    class Meta:
        ordering = ['-created_at']
