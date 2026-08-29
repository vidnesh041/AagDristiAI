from django.contrib import admin
from .models import RiskScore

@admin.register(RiskScore)
class RiskScoreAdmin(admin.ModelAdmin):
    list_display = ('id', 'zone', 'score', 'category', 'is_photo_confirmed', 'computed_at')
    list_filter = ('category', 'is_photo_confirmed', 'zone')
    date_hierarchy = 'computed_at'
