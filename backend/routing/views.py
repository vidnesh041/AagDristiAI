from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import ConstructionZone
from .serializers import ConstructionZoneSerializer
from .services import calculate_safe_route


class SafeRouteView(APIView):
    """
    GET /api/route/?from=21.1475,79.0650&to=21.1524,79.0888
    Calculates A* safe route avoiding flooded and construction-blocked road segments.
    """
    def get(self, request):
        from_param = request.query_params.get('from', '21.1475,79.0650')
        to_param = request.query_params.get('to', '21.1524,79.0888')

        try:
            from_lat, from_lon = map(float, from_param.split(','))
            to_lat, to_lon = map(float, to_param.split(','))
        except Exception:
            return Response(
                {"error": "Invalid format. Expected '?from=lat,lng&to=lat,lng'"},
                status=status.HTTP_400_BAD_REQUEST
            )

        result = calculate_safe_route(from_lat, from_lon, to_lat, to_lon)
        return Response(result)


class ConstructionZoneListCreateView(generics.ListCreateAPIView):
    """
    GET /api/construction/ - List all active construction zones.
    POST /api/construction/ - Admin adds new manual roadwork/project.
    """
    serializer_class = ConstructionZoneSerializer

    def get_queryset(self):
        qs = ConstructionZone.objects.all()
        active_only = self.request.query_params.get('active')
        if active_only is not None:
            is_active = active_only.lower() in ['true', '1', 'yes']
            qs = qs.filter(active=is_active)
        return qs


class ConstructionZoneDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET/PUT/PATCH/DELETE /api/construction/<id>/ - Edit or deactivate a construction zone.
    """
    queryset = ConstructionZone.objects.all()
    serializer_class = ConstructionZoneSerializer
