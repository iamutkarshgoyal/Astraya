from decimal import Decimal

from app.services.pricing_service import calculate_totals, money


def test_money_rounds_half_up() -> None:
    assert money(Decimal("10.235")) == Decimal("10.24")


def test_calculate_totals_with_coupon_and_shipping() -> None:
    totals = calculate_totals(Decimal("2198.00"), "ASTRAYA10")

    assert totals["subtotal"] == Decimal("2198.00")
    assert totals["discount_amount"] == Decimal("219.80")
    assert totals["shipping_charge"] == Decimal("99.00")
    assert totals["tax_amount"] == Decimal("98.91")
    assert totals["grand_total"] == Decimal("2176.11")


def test_calculate_totals_uses_free_shipping_threshold() -> None:
    totals = calculate_totals(Decimal("2500.00"))

    assert totals["shipping_charge"] == Decimal("0.00")
    assert totals["tax_amount"] == Decimal("125.00")
    assert totals["grand_total"] == Decimal("2625.00")
