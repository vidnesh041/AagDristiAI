from django.contrib import admin
from .models import Report

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'zone', 'verification_status', 'pothole_detected', 
        'waterlogging_detected', 'created_at'
    )
    list_filter = ('verification_status', 'pothole_detected', 'waterlogging_detected', 'zone')
    search_fields = ('description', 'zone__name')
    list_editable = ('verification_status',)
