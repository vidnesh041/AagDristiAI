from django.contrib import admin
from .models import ConstructionZone

@admin.register(ConstructionZone)
class ConstructionZoneAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'source', 'delay_mins', 'active', 'added_at')
    list_filter = ('active', 'source')
    search_fields = ('name', 'description')
