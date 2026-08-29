from django.urls import path
from . import views

urlpatterns = [
    path('risk/', views.get_zones_risk_geojson, name='zones-risk-geojson'),
    path('refresh/', views.refresh_telemetry, name='zones-refresh-telemetry'),
    path('weather/live/', views.get_live_weather, name='zone-live-weather'),
    path('<int:pk>/dispatch/', views.update_dispatch_status, name='zone-dispatch-update'),
    path('', views.get_zones_risk_geojson, name='zones-list'),
]
