import base64
from decimal import Decimal

import pytest
from pydantic import ValidationError

from app.core.config import settings
from app.models.order import Order, OrderItem
from app.routers.cart import customization_variant_key
from app.schemas.cart import CartItemRequest
from app.schemas.order import OrderCreate
from app.services import order_notification_service
from app.services.order_notification_service import (
    decode_preview_image,
    send_owner_whatsapp,
)


CUSTOMIZATION = {
    "wax_color": "#c94a55",
    "wax_color_name": "Ruby",
    "decoration": "hearts",
    "decoration_label": "Hearts",
    "decoration_color": "#ef7f98",
    "glitter": True,
}


def test_customization_variant_key_is_stable_and_distinct() -> None:
    first = CartItemRequest(
        product_id=1,
        quantity=1,
        customization=CUSTOMIZATION,
    )
    same = CartItemRequest(
        product_id=1,
        quantity=2,
        customization=CUSTOMIZATION,
    )
    different = CartItemRequest(
        product_id=1,
        quantity=1,
        customization={**CUSTOMIZATION, "glitter": False},
    )

    assert customization_variant_key(first) == customization_variant_key(same)
    assert customization_variant_key(first) != customization_variant_key(different)
    assert customization_variant_key(CartItemRequest(product_id=1, quantity=1)) == "standard"


def test_order_requires_valid_mobile_and_indian_pincode() -> None:
    payload = {
        "customer_name": "Astraya Customer",
        "phone": "+91 98765 43210",
        "email": "customer@example.com",
        "address": "12 Moon Street",
        "city": "Jaipur",
        "state": "Rajasthan",
        "pincode": "302001",
        "items": [{"product_id": 1, "quantity": 1}],
    }
    assert OrderCreate.model_validate(payload).pincode == "302001"

    with pytest.raises(ValidationError):
        OrderCreate.model_validate({**payload, "phone": "call me"})
    with pytest.raises(ValidationError):
        OrderCreate.model_validate({**payload, "pincode": "3020"})


def test_custom_preview_data_url_can_be_attached() -> None:
    image_bytes = b"astraya-preview"
    value = "data:image/jpeg;base64," + base64.b64encode(image_bytes).decode()

    decoded = decode_preview_image(value)

    assert decoded == (image_bytes, "jpeg", "jpg")
    assert decode_preview_image("/assets/astraya/product.jpg") is None


def test_whatsapp_uses_approved_template_when_configured(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    order = Order(
        order_number="AST-000002",
        customer_name="Astraya Customer",
        phone="9876543210",
        email="customer@example.com",
        address="12 Moon Street",
        city="Jaipur",
        state="Rajasthan",
        pincode="302001",
        subtotal=Decimal("799.00"),
        shipping_charge=Decimal("99.00"),
        tax_amount=Decimal("39.95"),
        discount_amount=Decimal("0.00"),
        grand_total=Decimal("937.95"),
        items=[
            OrderItem(
                product_id=1,
                product_name="HeartGlow Gel-Soy Mini Jar Candle",
                quantity=1,
                unit_price=Decimal("799.00"),
                line_total=Decimal("799.00"),
            )
        ],
    )
    payloads: list[dict[str, object]] = []
    monkeypatch.setattr(settings, "whatsapp_access_token", "test-token")
    monkeypatch.setattr(settings, "whatsapp_phone_number_id", "phone-id")
    monkeypatch.setattr(settings, "owner_whatsapp_phone", "918958383707")
    monkeypatch.setattr(settings, "whatsapp_order_template_name", "astraya_new_order")
    monkeypatch.setattr(
        order_notification_service,
        "_send_whatsapp_payload",
        payloads.append,
    )

    assert send_owner_whatsapp(order) == "sent"
    assert payloads[0]["type"] == "template"
    template = payloads[0]["template"]
    assert isinstance(template, dict)
    assert template["name"] == "astraya_new_order"
