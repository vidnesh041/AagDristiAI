from django.contrib import admin
from .models import Zone, WeatherReading, TrafficReading

@admin.register(Zone)
class ZoneAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'elevation_factor', 'drainage_capacity', 'dispatch_status')
    list_filter = ('dispatch_status',)
    search_fields = ('name',)
    list_editable = ('dispatch_status',)

@admin.register(WeatherReading)
class WeatherReadingAdmin(admin.ModelAdmin):
    list_display = ('id', 'zone', 'rainfall_intensity_mm', 'source', 'recorded_at')
    list_filter = ('source', 'zone')
    date_hierarchy = 'recorded_at'

@admin.register(TrafficReading)
class TrafficReadingAdmin(admin.ModelAdmin):
    list_display = ('id', 'zone', 'congestion_level', 'recorded_at')
    list_filter = ('zone',)
    date_hierarchy = 'recorded_at'
