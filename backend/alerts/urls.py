from django.urls import path
from . import views

urlpatterns = [
    path('logs/', views.list_alert_logs, name='alert-logs'),
    path('send/', views.trigger_alert, name='send-alert'),
    path('status/', views.twilio_status, name='twilio-status'),
]
