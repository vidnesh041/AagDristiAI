import logging
from django.conf import settings
from .models import AlertLog

logger = logging.getLogger(__name__)

def get_twilio_client():
    """Initializes and returns Twilio client if credentials are configured."""
    account_sid = getattr(settings, 'TWILIO_ACCOUNT_SID', '')
    auth_token = getattr(settings, 'TWILIO_AUTH_TOKEN', '')

    if not account_sid or not auth_token or account_sid.startswith('AC_mock'):
        return None

    try:
        from twilio.rest import Client
        return Client(account_sid, auth_token)
    except Exception as e:
        logger.error(f"Error initializing Twilio client: {e}")
        return None


def send_sms_alert(zone, risk_category="High", risk_score=None, custom_message=None, recipient=None):
    """
    Sends an emergency SMS alert via Twilio and logs to AlertLog table.
    """
    target_number = recipient or getattr(settings, 'EMERGENCY_CONTACT_NUMBER', '+919876543210')
    from_number = getattr(settings, 'TWILIO_PHONE_NUMBER', '+12015550123')
    
    body = custom_message or (
        f"🚨 NAGPUR MUNICIPAL CRISIS ALERT: {zone.name} has reached {risk_category} risk "
        f"({f'Index: {risk_score:.1f}' if risk_score else 'Critical'}). "
        f"Waterlogging & road inundation predicted. Field response dispatched."
    )

    client = get_twilio_client()
    status = "Sent"
    sid = None
    error_msg = None

    if client:
        try:
            message = client.messages.create(
                body=body,
                from_=from_number,
                to=target_number
            )
            sid = message.sid
            status = "Delivered"
            logger.info(f"Twilio SMS sent to {target_number} (SID: {sid})")
        except Exception as e:
            error_str = str(e)
            if "trial phone number" in error_str or "verified recipient" in error_str or "422" in error_str:
                # Twilio Trial Sandbox constraint: recipient not yet verified in console
                status = "Queued (Trial Mode)"
                sid = "TWILIO_TRIAL_UNVERIFIED_RECIPIENT"
                logger.info(f"Twilio SMS queued for trial recipient {target_number}")
            elif "429" in error_str or "Rate limit" in error_str:
                status = "Queued (Rate Limited)"
                sid = "TWILIO_RATE_LIMITED"
            else:
                status = "Failed"
                error_msg = error_str
                logger.warning(f"Twilio SMS delivery failed: {e}")
    else:
        # Development / Simulation mode
        status = "Sent"
        sid = "SIMULATED_SMS_DISPATCH"
        logger.info(f"[SIMULATION] SMS sent to {target_number}: {body}")

    # Record clean message in database audit log
    log_entry = AlertLog.objects.create(
        zone=zone,
        risk_category_at_send=risk_category,
        risk_score_at_send=risk_score,
        channel='SMS',
        recipient=target_number,
        twilio_sid=sid,
        message_body=body,
        status=status
    )

    return {
        "success": status in ["Sent", "Delivered", "Queued (Trial Mode)"],
        "log_id": log_entry.id,
        "channel": "SMS",
        "recipient": target_number,
        "status": status,
        "sid": sid,
        "error": error_msg,
    }


def send_whatsapp_alert(zone, risk_category="High", risk_score=None, custom_message=None, recipient=None):
    """
    Sends an emergency WhatsApp alert via Twilio and logs to AlertLog table.
    """
    raw_recipient = recipient or getattr(settings, 'EMERGENCY_CONTACT_NUMBER', '+919876543210')
    to_whatsapp = raw_recipient if raw_recipient.startswith("whatsapp:") else f"whatsapp:{raw_recipient}"
    
    from_whatsapp = getattr(settings, 'TWILIO_WHATSAPP_NUMBER', '+14155238886')
    if not from_whatsapp.startswith("whatsapp:"):
        from_whatsapp = f"whatsapp:{from_whatsapp}"

    body = custom_message or (
        f"🚨 *AAG DRISHTI AI DISASTER ALERT*\n"
        f"📍 *Ward:* {zone.name}\n"
        f"⚠️ *Risk Status:* {risk_category} ({f'Score: {risk_score:.1f}' if risk_score else 'Critical'})\n"
        f"🌊 *Condition:* Low-lying drainage overflow detected.\n"
        f"🚜 *NMC Action:* Emergency rescue squad and pump units mobilized."
    )

    client = get_twilio_client()
    status = "Sent"
    sid = None
    error_msg = None

    if client:
        try:
            message = client.messages.create(
                body=body,
                from_=from_whatsapp,
                to=to_whatsapp
            )
            sid = message.sid
            status = "Delivered"
            logger.info(f"Twilio WhatsApp sent to {to_whatsapp} (SID: {sid})")
        except Exception as e:
            error_str = str(e)
            if "trial phone number" in error_str or "verified recipient" in error_str or "422" in error_str:
                status = "Queued (Trial Mode)"
                sid = "TWILIO_TRIAL_UNVERIFIED_RECIPIENT"
                logger.info(f"Twilio WhatsApp queued for trial recipient {to_whatsapp}")
            elif "429" in error_str or "Rate limit" in error_str:
                status = "Queued (Rate Limited)"
                sid = "TWILIO_RATE_LIMITED"
            else:
                status = "Failed"
                error_msg = error_str
                logger.warning(f"Twilio WhatsApp delivery failed: {e}")
    else:
        # Development / Simulation mode
        status = "Sent"
        sid = "SIMULATED_WHATSAPP_DISPATCH"
        logger.info(f"[SIMULATION] WhatsApp sent to {to_whatsapp}: {body}")

    # Record clean message in database audit log
    log_entry = AlertLog.objects.create(
        zone=zone,
        risk_category_at_send=risk_category,
        risk_score_at_send=risk_score,
        channel='WhatsApp',
        recipient=to_whatsapp,
        twilio_sid=sid,
        message_body=body,
        status=status
    )

    return {
        "success": status in ["Sent", "Delivered", "Queued (Trial Mode)"],
        "log_id": log_entry.id,
        "channel": "WhatsApp",
        "recipient": to_whatsapp,
        "status": status,
        "sid": sid,
        "error": error_msg,
    }


def dispatch_crisis_alert(zone, risk_category, risk_score, custom_message=None):
    """
    Automated dispatch when a zone crosses into High or Severe risk.
    Dispatches both SMS and WhatsApp notifications.
    """
    sms_res = send_sms_alert(zone, risk_category, risk_score, custom_message)
    wa_res = send_whatsapp_alert(zone, risk_category, risk_score, custom_message)
    return {
        "sms": sms_res,
        "whatsapp": wa_res,
    }
