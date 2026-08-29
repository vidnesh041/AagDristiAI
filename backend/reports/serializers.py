from rest_framework import serializers
from .models import Report
from zones.models import Zone

class ZoneSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Zone
        fields = ['id', 'name', 'dispatch_status', 'elevation_factor', 'drainage_capacity']

class ReportSerializer(serializers.ModelSerializer):
    zone_name = serializers.CharField(source='zone.name', read_only=True)
    photo_url = serializers.SerializerMethodField()

    class Meta:
        model = Report
        fields = [
            'id',
            'latitude',
            'longitude',
            'photo',
            'photo_url',
            'description',
            'zone',
            'zone_name',
            'pothole_detected',
            'pothole_confidence',
            'waterlogging_detected',
            'waterlogging_confidence',
            'verification_status',
            'created_at',
        ]
        read_only_fields = [
            'id',
            'zone',
            'zone_name',
            'pothole_detected',
            'pothole_confidence',
            'waterlogging_detected',
            'waterlogging_confidence',
            'created_at',
        ]

    def get_photo_url(self, obj):
        if obj.photo:
            try:
                request = self.context.get('request')
                return request.build_absolute_uri(obj.photo.url) if request else obj.photo.url
            except Exception:
                return str(obj.photo)
        return None
