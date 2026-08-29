import logging
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Report
from .serializers import ReportSerializer
from .hf_service import find_matching_zone, run_huggingface_vision_inference
from risk.services import calculate_zone_risk

logger = logging.getLogger(__name__)

class ReportListCreateView(generics.ListCreateAPIView):
    """
    POST /api/reports/ - Citizen report submission with photo upload & AI inference.
    GET /api/reports/ - List all hazard reports with optional filters.
    """
    queryset = Report.objects.all()
    serializer_class = ReportSerializer

    def get_queryset(self):
        qs = Report.objects.all().select_related('zone')
        status_param = self.request.query_params.get('status')
        zone_param = self.request.query_params.get('zone')
        hazard_param = self.request.query_params.get('hazard')

        if status_param:
            qs = qs.filter(verification_status__iexact=status_param)
        if zone_param:
            qs = qs.filter(zone__name__icontains=zone_param)
        if hazard_param == 'waterlogging':
            qs = qs.filter(waterlogging_detected=True)
        elif hazard_param == 'pothole':
            qs = qs.filter(pothole_detected=True)

        return qs

    def perform_create(self, serializer):
        req = self.request
        lat = req.data.get('latitude')
        lon = req.data.get('longitude')
        description = req.data.get('description', '')
        photo_file = req.FILES.get('photo')

        # Convert coordinates if strings
        try:
            lat = float(lat) if lat is not None else 21.1458
            lon = float(lon) if lon is not None else 79.0882
        except (ValueError, TypeError):
            lat, lon = 21.1458, 79.0882

        # 1. Spatial point-in-polygon matching
        assigned_zone = find_matching_zone(lat, lon)

        # 2. Hugging Face Computer Vision inference
        cv_result = run_huggingface_vision_inference(photo_file, description=description)

        # 3. Save report record
        report_instance = serializer.save(
            latitude=lat,
            longitude=lon,
            zone=assigned_zone,
            pothole_detected=cv_result["pothole_detected"],
            pothole_confidence=cv_result["pothole_confidence"],
            waterlogging_detected=cv_result["waterlogging_detected"],
            waterlogging_confidence=cv_result["waterlogging_confidence"],
            verification_status='Pending'
        )

        # 4. Automatically trigger risk recalculation for the affected ward
        if assigned_zone:
            calculate_zone_risk(assigned_zone, trigger_alert=True)

        return report_instance


class ReportVerifyView(APIView):
    """
    PATCH /api/reports/<pk>/verify/
    Admin updates verification status ('Verified', 'Rejected', 'Resolved', or 'Pending').
    """
    def patch(self, request, pk):
        report = get_object_or_404(Report, pk=pk)
        new_status = request.data.get('verification_status') or request.data.get('status')

        valid_choices = ['Verified', 'Rejected', 'Pending', 'Resolved']
        if new_status not in valid_choices:
            return Response(
                {"error": f"Invalid verification_status. Choose one of {valid_choices}."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Enforce rule: must be Verified before it can be marked Resolved
        if new_status == 'Resolved' and report.verification_status != 'Verified':
            return Response(
                {"error": "Report must be 'Verified' before it can be marked as 'Resolved'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        report.verification_status = new_status
        report.save()

        # Recalculate zone risk whenever status changes
        if report.zone:
            calculate_zone_risk(report.zone, trigger_alert=(new_status == 'Verified'))

        serializer = ReportSerializer(report, context={'request': request})
        return Response({
            "status": "success",
            "message": f"Report #{report.id} marked as {new_status}",
            "report": serializer.data
        })
