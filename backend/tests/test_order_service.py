from decimal import Decimal

from app.models.order import Order, OrderItem
from app.services.order_service import build_whatsapp_message, build_whatsapp_url


def test_build_whatsapp_message_contains_order_summary() -> None:
    order = Order(
        order_number="AST-000001",
        customer_name="Astraya Customer",
        phone="9876543210",
        email="customer@example.com",
        address="12 Moon Street",
        city="Jaipur",
        state="Rajasthan",
        pincode="302001",
        subtotal=Decimal("1099.00"),
        shipping_charge=Decimal("99.00"),
        tax_amount=Decimal("54.95"),
        discount_amount=Decimal("0.00"),
        grand_total=Decimal("1252.95"),
        status="pending_whatsapp",
        items=[
            OrderItem(
                product_id=1,
                product_name="Lunar Bloom Soy Candle",
                quantity=1,
                unit_price=Decimal("1099.00"),
                line_total=Decimal("1099.00"),
            )
        ],
    )

    message = build_whatsapp_message(order)
    whatsapp_url = build_whatsapp_url(message)

    assert "Order Number: AST-000001" in message
    assert "Lunar Bloom Soy Candle" in message
    assert "Grand Total: Rs 1252.95" in message
    assert whatsapp_url.startswith("https://wa.me/")
    assert "AST-000001" in whatsapp_url
