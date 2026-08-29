from django.db import models
from zones.models import Zone

class RiskScore(models.Model):
    CATEGORY_CHOICES = [
        ('Low', 'Low (0-25)'),
        ('Medium', 'Medium (26-50)'),
        ('High', 'High (51-75)'),
        ('Severe', 'Severe (76-100)'),
    ]

    zone = models.ForeignKey(Zone, on_delete=models.CASCADE, related_name='risk_scores')
    score = models.FloatField(help_text="Calculated weighted risk index (0-100)")
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, help_text="Classification level")
    is_photo_confirmed = models.BooleanField(
        default=False, 
        help_text="Flagged as photo-confirmed if citizen report with waterlogging_detected=True exists"
    )
    computed_at = models.DateTimeField(auto_now_add=True, help_text="Calculation timestamp")

    def __str__(self):
        confirmed_tag = " [Photo-Confirmed]" if self.is_photo_confirmed else ""
        return f"{self.zone.name}: Score {self.score:.1f} ({self.category}){confirmed_tag} at {self.computed_at}"

    class Meta:
        ordering = ['-computed_at']
