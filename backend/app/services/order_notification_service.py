import base64
import binascii
import re
import smtplib
from email.message import EmailMessage

import requests
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.database.session import SessionLocal
from app.models.order import Order
from app.services.order_service import (
    build_customer_order_message,
    build_tracking_message,
    build_whatsapp_message,
)

DATA_IMAGE_PATTERN = re.compile(
    r"^data:image/(?P<kind>jpeg|png|webp);base64,(?P<data>.+)$",
    re.DOTALL,
)


def decode_preview_image(value: str | None) -> tuple[bytes, str, str] | None:
    if not value:
        return None
    match = DATA_IMAGE_PATTERN.match(value)
    if not match:
        return None
    image_kind = match.group("kind")
    try:
        image_bytes = base64.b64decode(match.group("data"), validate=True)
    except (ValueError, binascii.Error):
        return None
    subtype = "jpeg" if image_kind == "jpeg" else image_kind
    extension = "jpg" if image_kind == "jpeg" else image_kind
    return image_bytes, subtype, extension


def send_owner_email(order: Order) -> str:
    recipient = settings.notification_email
    sender = (
        settings.smtp_from_email
        or settings.smtp_username
        or settings.notification_email
    ).strip()
    if not settings.smtp_host.strip() or not recipient or not sender:
        return "not_configured"

    message = EmailMessage()
    message["Subject"] = (
        f"New Astraya order {order.order_number} - {order.customer_name}"
    )
    message["From"] = sender
    message["To"] = recipient
    message.set_content(build_whatsapp_message(order))

    for index, item in enumerate(order.items, start=1):
        preview = decode_preview_image(item.preview_image)
        if preview is None:
            continue
        image_bytes, subtype, extension = preview
        message.add_attachment(
            image_bytes,
            maintype="image",
            subtype=subtype,
            filename=f"{order.order_number}-item-{index}.{extension}",
        )

    if settings.smtp_use_ssl:
        with smtplib.SMTP_SSL(
            settings.smtp_host,
            settings.smtp_port,
            timeout=20,
        ) as smtp:
            if settings.smtp_username:
                smtp.login(settings.smtp_username, settings.smtp_password)
            smtp.send_message(message)
    else:
        with smtplib.SMTP(
            settings.smtp_host,
            settings.smtp_port,
            timeout=20,
        ) as smtp:
            if settings.smtp_use_tls:
                smtp.starttls()
            if settings.smtp_username:
                smtp.login(settings.smtp_username, settings.smtp_password)
            smtp.send_message(message)
    return "sent"


def _whatsapp_endpoint(path: str) -> str:
    version = settings.whatsapp_api_version.strip().lstrip("v")
    return (
        f"https://graph.facebook.com/v{version}/"
        f"{settings.whatsapp_phone_number_id.strip()}/{path}"
    )


def _send_whatsapp_payload(payload: dict[str, object]) -> None:
    response = requests.post(
        _whatsapp_endpoint("messages"),
        headers={
            "Authorization": f"Bearer {settings.whatsapp_access_token}",
            "Content-Type": "application/json",
        },
        json=payload,
        timeout=20,
    )
    response.raise_for_status()


def _upload_whatsapp_preview(
    image_bytes: bytes,
    subtype: str,
    filename: str,
) -> str:
    response = requests.post(
        _whatsapp_endpoint("media"),
        headers={"Authorization": f"Bearer {settings.whatsapp_access_token}"},
        data={"messaging_product": "whatsapp"},
        files={"file": (filename, image_bytes, f"image/{subtype}")},
        timeout=20,
    )
    response.raise_for_status()
    media_id = response.json().get("id")
    if not media_id:
        raise RuntimeError("WhatsApp media upload returned no media id")
    return str(media_id)


def send_owner_whatsapp(order: Order) -> str:
    recipient = settings.owner_whatsapp_phone.strip().replace("+", "")
    if not (
        settings.whatsapp_access_token.strip()
        and settings.whatsapp_phone_number_id.strip()
        and recipient
    ):
        return "not_configured"

    base_payload: dict[str, object] = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": recipient,
    }
    summary = build_whatsapp_message(order)
    if settings.whatsapp_order_template_name.strip():
        _send_whatsapp_payload(
            {
                **base_payload,
                "type": "template",
                "template": {
                    "name": settings.whatsapp_order_template_name.strip(),
                    "language": {
                        "code": settings.whatsapp_template_language.strip() or "en_US"
                    },
                    "components": [
                        {
                            "type": "body",
                            "parameters": [
                                {
                                    "type": "text",
                                    "text": summary[:1024],
                                }
                            ],
                        }
                    ],
                },
            }
        )
    else:
        _send_whatsapp_payload(
            {
                **base_payload,
                "type": "text",
                "text": {
                    "body": summary[:4096],
                    "preview_url": False,
                },
            }
        )

    for index, item in enumerate(order.items, start=1):
        preview = decode_preview_image(item.preview_image)
        if preview is not None:
            image_bytes, subtype, extension = preview
            media_id = _upload_whatsapp_preview(
                image_bytes,
                subtype,
                f"{order.order_number}-item-{index}.{extension}",
            )
            image_payload: dict[str, object] = {
                "id": media_id,
                "caption": f"{item.product_name} custom preview",
            }
        elif item.preview_image and item.preview_image.startswith("https://"):
            image_payload = {
                "link": item.preview_image,
                "caption": f"{item.product_name} custom preview",
            }
        else:
            continue

        _send_whatsapp_payload(
            {
                **base_payload,
                "type": "image",
                "image": image_payload,
            }
        )
    return "sent"


def _send_simple_email(recipient: str, subject: str, body: str) -> str:
    sender = (
        settings.smtp_from_email
        or settings.smtp_username
        or settings.notification_email
    ).strip()
    if not settings.smtp_host.strip() or not recipient or not sender:
        return "not_configured"

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = sender
    message["To"] = recipient
    message.set_content(body)
    if settings.smtp_use_ssl:
        with smtplib.SMTP_SSL(settings.smtp_host, settings.smtp_port, timeout=20) as smtp:
            if settings.smtp_username:
                smtp.login(settings.smtp_username, settings.smtp_password)
            smtp.send_message(message)
    else:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=20) as smtp:
            if settings.smtp_use_tls:
                smtp.starttls()
            if settings.smtp_username:
                smtp.login(settings.smtp_username, settings.smtp_password)
            smtp.send_message(message)
    return "sent"


def send_customer_email(order: Order, body: str | None = None) -> str:
    subject = f"Astraya order update: {order.order_number}"
    return _send_simple_email(order.email, subject, body or build_customer_order_message(order))


def send_customer_whatsapp(order: Order, body: str, template_name: str) -> str:
    recipient = "".join(character for character in order.phone if character.isdigit())
    if recipient.startswith("0"):
        recipient = recipient.lstrip("0")
    if len(recipient) == 10:
        recipient = f"91{recipient}"
    if not (
        settings.whatsapp_access_token.strip()
        and settings.whatsapp_phone_number_id.strip()
        and template_name.strip()
        and recipient
    ):
        return "not_configured"

    _send_whatsapp_payload(
        {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": recipient,
            "type": "template",
            "template": {
                "name": template_name.strip(),
                "language": {"code": settings.whatsapp_template_language.strip() or "en_US"},
                "components": [
                    {
                        "type": "body",
                        "parameters": [{"type": "text", "text": body[:1024]}],
                    }
                ],
            },
        }
    )
    return "sent"


def send_customer_sms(order: Order, body: str) -> str:
    if settings.sms_provider.casefold() != "twilio":
        return "not_configured"
    if not (
        settings.twilio_account_sid.strip()
        and settings.twilio_auth_token.strip()
        and settings.twilio_from_phone.strip()
    ):
        return "not_configured"
    response = requests.post(
        (
            "https://api.twilio.com/2010-04-01/Accounts/"
            f"{settings.twilio_account_sid.strip()}/Messages.json"
        ),
        auth=(settings.twilio_account_sid.strip(), settings.twilio_auth_token),
        data={
            "To": order.phone,
            "From": settings.twilio_from_phone.strip(),
            "Body": body[:1500],
        },
        timeout=20,
    )
    response.raise_for_status()
    return "sent"


def send_order_notifications(order_id: int) -> None:
    with SessionLocal() as db:
        order = db.scalar(
            select(Order)
            .options(selectinload(Order.items))
            .where(Order.id == order_id)
        )
        if order is None:
            return

        errors: list[str] = []
        try:
            order.email_notification_status = send_owner_email(order)
        except Exception as exc:
            order.email_notification_status = "failed"
            errors.append(f"Email: {exc}")

        try:
            order.whatsapp_notification_status = send_owner_whatsapp(order)
        except Exception as exc:
            order.whatsapp_notification_status = "failed"
            errors.append(f"WhatsApp: {exc}")

        customer_message = build_customer_order_message(order)
        try:
            order.customer_email_notification_status = send_customer_email(
                order,
                customer_message,
            )
        except Exception as exc:
            order.customer_email_notification_status = "failed"
            errors.append(f"Customer email: {exc}")

        try:
            order.customer_whatsapp_notification_status = send_customer_whatsapp(
                order,
                customer_message,
                settings.whatsapp_customer_order_template_name,
            )
        except Exception as exc:
            order.customer_whatsapp_notification_status = "failed"
            errors.append(f"Customer WhatsApp: {exc}")

        try:
            order.customer_sms_notification_status = send_customer_sms(order, customer_message)
        except Exception as exc:
            order.customer_sms_notification_status = "failed"
            errors.append(f"Customer SMS: {exc}")

        order.notification_error = " | ".join(errors)[:2000] or None
        db.commit()


def send_tracking_notifications(order_id: int) -> None:
    with SessionLocal() as db:
        order = db.scalar(
            select(Order)
            .options(selectinload(Order.items))
            .where(Order.id == order_id)
        )
        if order is None or not order.tracking_number or not order.tracking_url:
            return

        message = build_tracking_message(order)
        errors: list[str] = []
        try:
            order.tracking_email_notification_status = send_customer_email(order, message)
        except Exception as exc:
            order.tracking_email_notification_status = "failed"
            errors.append(f"Tracking email: {exc}")
        try:
            order.tracking_whatsapp_notification_status = send_customer_whatsapp(
                order,
                message,
                settings.whatsapp_customer_tracking_template_name,
            )
        except Exception as exc:
            order.tracking_whatsapp_notification_status = "failed"
            errors.append(f"Tracking WhatsApp: {exc}")
        try:
            order.tracking_sms_notification_status = send_customer_sms(order, message)
        except Exception as exc:
            order.tracking_sms_notification_status = "failed"
            errors.append(f"Tracking SMS: {exc}")
        if errors:
            existing_error = order.notification_error or ""
            order.notification_error = f"{existing_error} | {' | '.join(errors)}".strip(" | ")[:2000]
        db.commit()
