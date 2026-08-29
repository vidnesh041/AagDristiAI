from rest_framework import serializers
from .models import AlertLog
from zones.models import Zone

class AlertLogSerializer(serializers.ModelSerializer):
    zone_name = serializers.CharField(source='zone.name', read_only=True)

    class Meta:
        model = AlertLog
        fields = [
            'id', 'zone', 'zone_name', 'risk_category_at_send', 
            'risk_score_at_send', 'channel', 'recipient', 
            'message_body', 'status', 'sent_at'
        ]


class SendAlertRequestSerializer(serializers.Serializer):
    zone_id = serializers.IntegerField(required=False)
    channel = serializers.ChoiceField(choices=['SMS', 'WhatsApp', 'Both'], default='Both')
    message = serializers.CharField(required=False, allow_blank=True)
    recipient = serializers.CharField(required=False, allow_blank=True)
    risk_category = serializers.ChoiceField(choices=['High', 'Severe', 'Medium', 'Low'], default='High')
    risk_score = serializers.FloatField(required=False)
