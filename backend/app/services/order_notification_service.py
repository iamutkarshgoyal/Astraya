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
from app.services.order_service import build_whatsapp_message

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

        order.notification_error = " | ".join(errors)[:2000] or None
        db.commit()
