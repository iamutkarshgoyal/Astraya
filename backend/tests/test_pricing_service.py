from decimal import Decimal

from app.services.pricing_service import calculate_totals, money, shipping_charge_for_state


def test_money_rounds_half_up() -> None:
    assert money(Decimal("10.235")) == Decimal("10.24")


def test_calculate_totals_with_coupon_and_shipping() -> None:
    totals = calculate_totals(
        Decimal("2198.00"),
        "ASTRAYA10",
        state="Uttar Pradesh",
        payment_method="cod",
    )

    assert totals["subtotal"] == Decimal("2198.00")
    assert totals["discount_amount"] == Decimal("219.80")
    assert totals["shipping_charge"] == Decimal("100.00")
    assert totals["cod_charge"] == Decimal("29.00")
    assert totals["tax_amount"] == Decimal("98.91")
    assert totals["grand_total"] == Decimal("2206.11")


def test_calculate_totals_uses_standard_shipping_and_no_online_payment_fee() -> None:
    totals = calculate_totals(
        Decimal("2500.00"),
        state="Rajasthan",
        payment_method="online",
    )

    assert totals["shipping_charge"] == Decimal("160.00")
    assert totals["cod_charge"] == Decimal("0.00")
    assert totals["tax_amount"] == Decimal("125.00")
    assert totals["grand_total"] == Decimal("2785.00")


def test_priority_shipping_states_are_charged_one_hundred_rupees() -> None:
    for state in ("UP", "Delhi", "Assam", "Jammu & Kashmir"):
        assert shipping_charge_for_state(state) == Decimal("100.00")
