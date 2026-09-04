import hashlib
import hmac
from decimal import Decimal

import requests

from app.core.config import settings
from app.models.order import Order
from app.schemas.order import RazorpayCheckout


RAZORPAY_ORDERS_URL = "https://api.razorpay.com/v1/orders"


def razorpay_is_configured() -> bool:
    return bool(settings.razorpay_key_id and settings.razorpay_key_secret)


def create_razorpay_checkout(order: Order) -> RazorpayCheckout:
    if not razorpay_is_configured():
        raise ValueError("Online payments are not configured yet")

    amount = int(Decimal(order.grand_total) * 100)
    response = requests.post(
        RAZORPAY_ORDERS_URL,
        auth=(settings.razorpay_key_id, settings.razorpay_key_secret),
        json={
            "amount": amount,
            "currency": "INR",
            "receipt": order.order_number,
            "notes": {"astraya_order_number": order.order_number},
        },
        timeout=20,
    )
    if not response.ok:
        raise ValueError("Unable to start the secure payment. Please try again.")

    payload = response.json()
    gateway_order_id = payload.get("id")
    if not isinstance(gateway_order_id, str) or not gateway_order_id:
        raise ValueError("Payment gateway returned an invalid order reference")

    order.gateway_order_id = gateway_order_id
    return RazorpayCheckout(
        key_id=settings.razorpay_key_id,
        order_id=gateway_order_id,
        amount=amount,
        currency="INR",
    )


def verify_razorpay_payment_signature(
    order: Order,
    *,
    razorpay_order_id: str,
    razorpay_payment_id: str,
    razorpay_signature: str,
) -> bool:
    if not razorpay_is_configured() or not order.gateway_order_id:
        return False
    if not hmac.compare_digest(order.gateway_order_id, razorpay_order_id):
        return False

    body = f"{order.gateway_order_id}|{razorpay_payment_id}".encode()
    expected_signature = hmac.new(
        settings.razorpay_key_secret.encode(),
        body,
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected_signature, razorpay_signature)


def verify_razorpay_webhook_signature(raw_body: bytes, signature: str | None) -> bool:
    if not settings.razorpay_webhook_secret or not signature:
        return False
    expected_signature = hmac.new(
        settings.razorpay_webhook_secret.encode(),
        raw_body,
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected_signature, signature)
