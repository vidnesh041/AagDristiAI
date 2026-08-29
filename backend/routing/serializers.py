from rest_framework import serializers
from .models import ConstructionZone

class ConstructionZoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConstructionZone
        fields = '__all__'
