from django.urls import path
from .views import PriorityQueueView, SimulateRainfallView

urlpatterns = [
    path('priority-queue/', PriorityQueueView.as_view(), name='priority-queue'),
    path('simulate-rainfall/', SimulateRainfallView.as_view(), name='simulate-rainfall'),
]
