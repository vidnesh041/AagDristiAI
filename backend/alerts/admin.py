from django.contrib import admin
from .models import AlertLog

@admin.register(AlertLog)
class AlertLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'zone', 'risk_category_at_send', 'channel', 'status', 'sent_at')
    list_filter = ('risk_category_at_send', 'channel', 'status', 'zone')
    date_hierarchy = 'sent_at'
