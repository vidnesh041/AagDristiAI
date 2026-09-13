"""
URL configuration for Nagpur Urban Crisis Management System project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.response import Response
from rest_framework.decorators import api_view
from risk.views import PriorityQueueView, SimulateRainfallView

@api_view(['GET'])
def health_check(request):
    return Response({
        "status": "healthy",
        "system": "NagDrishtiAI — Nagpur Urban Crisis Management System Backend",
        "version": "1.0.0",
        "postgis_enabled": getattr(settings, 'HAS_GEODJANGO', False),
    })

# Customize Django Built-in Admin Site Header & Titles
admin.site.site_header = "NagDrishtiAI — Database Admin"
admin.site.site_title = "NagDrishtiAI Disaster DB Admin"
admin.site.index_title = "Nagpur Municipal Database Records & GIS Tables"

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health_check, name='health-check'),
    path('api/auth/', include('authentication.urls')),
    path('api/zones/', include('zones.urls')),
    path('api/reports/', include('reports.urls')),
    path('api/risk/', include('risk.urls')),
    path('api/priority-queue/', PriorityQueueView.as_view(), name='api-priority-queue'),
    path('api/simulate-rainfall/', SimulateRainfallView.as_view(), name='api-simulate-rainfall'),
    path('api/', include('routing.urls')),
    path('api/alerts/', include('alerts.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
