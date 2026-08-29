from django.urls import path
from .views import SafeRouteView, ConstructionZoneListCreateView, ConstructionZoneDetailView

urlpatterns = [
    path('route/', SafeRouteView.as_view(), name='safe-route'),
    path('construction/', ConstructionZoneListCreateView.as_view(), name='construction-list-create'),
    path('construction/<int:pk>/', ConstructionZoneDetailView.as_view(), name='construction-detail'),
]
