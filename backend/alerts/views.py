from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.conf import settings

from .models import AlertLog
from .serializers import AlertLogSerializer, SendAlertRequestSerializer
from .twilio_service import send_sms_alert, send_whatsapp_alert, dispatch_crisis_alert
from zones.models import Zone

@api_view(['GET'])
def list_alert_logs(request):
    """
    GET /api/alerts/logs/ - Returns list of historical Twilio emergency alerts.
    """
    logs = AlertLog.objects.select_related('zone').all()[:100]
    serializer = AlertLogSerializer(logs, many=True)
    return Response({
        "status": "success",
        "count": len(serializer.data),
        "results": serializer.data
    })


@api_view(['POST'])
def trigger_alert(request):
    """
    POST /api/alerts/send/ - Dispatches SMS, WhatsApp, or Both via Twilio.
    """
    serializer = SendAlertRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({"status": "error", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data
    zone_id = data.get('zone_id')
    channel = data.get('channel', 'Both')
    custom_msg = data.get('message')
    recipient = data.get('recipient')
    risk_cat = data.get('risk_category', 'High')
    risk_score = data.get('risk_score', 75.0)

    zone = None
    if zone_id:
        try:
            zone = Zone.objects.get(id=zone_id)
        except Zone.DoesNotExist:
            return Response({"status": "error", "message": f"Zone with ID {zone_id} not found"}, status=status.HTTP_404_NOT_FOUND)
    else:
        zone = Zone.objects.first()
        if not zone:
            return Response({"status": "error", "message": "No zones found in database."}, status=status.HTTP_400_BAD_REQUEST)

    dispatches = []
    if channel in ['SMS', 'Both']:
        res = send_sms_alert(zone, risk_cat, risk_score, custom_msg, recipient)
        dispatches.append(res)

    if channel in ['WhatsApp', 'Both']:
        res = send_whatsapp_alert(zone, risk_cat, risk_score, custom_msg, recipient)
        dispatches.append(res)

    return Response({
        "status": "success",
        "message": f"Emergency alert dispatched for {zone.name} via {channel}",
        "dispatches": dispatches
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
def twilio_status(request):
    """
    GET /api/alerts/status/ - Checks Twilio integration status without exposing secrets.
    """
    account_sid = getattr(settings, 'TWILIO_ACCOUNT_SID', '')
    has_sid = bool(account_sid and not account_sid.startswith('AC_mock'))
    has_token = bool(getattr(settings, 'TWILIO_AUTH_TOKEN', '') and not getattr(settings, 'TWILIO_AUTH_TOKEN', '').startswith('mock'))
    phone = getattr(settings, 'TWILIO_PHONE_NUMBER', '')
    whatsapp = getattr(settings, 'TWILIO_WHATSAPP_NUMBER', '')
    recipient = getattr(settings, 'EMERGENCY_CONTACT_NUMBER', '')

    return Response({
        "status": "ready" if (has_sid and has_token) else "unconfigured",
        "is_configured": has_sid and has_token,
        "account_sid_present": has_sid,
        "auth_token_present": has_token,
        "sender_phone": phone[:6] + "..." if len(phone) > 6 else phone,
        "sender_whatsapp": whatsapp[:6] + "..." if len(whatsapp) > 6 else whatsapp,
        "emergency_contact": recipient[:6] + "..." if len(recipient) > 6 else recipient,
    })
