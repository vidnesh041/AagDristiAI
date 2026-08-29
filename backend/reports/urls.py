from django.urls import path
from .views import ReportListCreateView, ReportVerifyView

urlpatterns = [
    path('', ReportListCreateView.as_view(), name='report-list-create'),
    path('<int:pk>/verify/', ReportVerifyView.as_view(), name='report-verify'),
]
