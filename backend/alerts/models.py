from django.db import models
from zones.models import Zone

class AlertLog(models.Model):
    CHANNEL_CHOICES = [
        ('SMS', 'SMS (Twilio)'),
        ('WhatsApp', 'WhatsApp (Twilio)'),
    ]

    STATUS_CHOICES = [
        ('Sent', 'Sent'),
        ('Delivered', 'Delivered'),
        ('Failed', 'Failed'),
    ]

    zone = models.ForeignKey(Zone, on_delete=models.CASCADE, related_name='alert_logs')
    risk_category_at_send = models.CharField(max_length=20, help_text="Risk category at the moment the notification fired (High or Severe)")
    risk_score_at_send = models.FloatField(blank=True, null=True, help_text="Risk score at the moment of alert")
    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES, default='SMS')
    recipient = models.CharField(max_length=50, blank=True, help_text="Phone number or WhatsApp target")
    twilio_sid = models.CharField(max_length=64, blank=True, null=True, help_text="Twilio Message SID")
    message_body = models.TextField(blank=True, help_text="Alert payload sent via Twilio")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Sent')
    sent_at = models.DateTimeField(auto_now_add=True, help_text="Dispatch timestamp")

    def __str__(self):
        return f"Alert to {self.zone.name} via {self.channel} ({self.status}) at {self.sent_at}"

    class Meta:
        ordering = ['-sent_at']
