from decimal import Decimal, ROUND_HALF_UP

from app.core.config import settings


def money(value: Decimal | int | float) -> Decimal:
    return Decimal(str(value)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


PRIORITY_SHIPPING_STATES = {
    "assam",
    "delhi",
    "jammu and kashmir",
    "jammu & kashmir",
    "jammu kashmir",
    "jammu-kashmir",
    "j&k",
    "nct of delhi",
    "new delhi",
    "u.p.",
    "up",
    "uttar pradesh",
}


def shipping_charge_for_state(state: str) -> Decimal:
    normalized_state = " ".join(state.casefold().strip().split())
    if normalized_state in PRIORITY_SHIPPING_STATES:
        return money(settings.shipping_charge_priority_states)
    return money(settings.shipping_charge_standard_states)


def calculate_totals(
    subtotal: Decimal,
    coupon_code: str | None = None,
    *,
    state: str,
    payment_method: str,
) -> dict[str, Decimal]:
    discount = Decimal("0.00")
    if coupon_code and coupon_code.strip().upper() == "ASTRAYA10":
        discount = money(subtotal * Decimal("0.10"))

    taxable = max(subtotal - discount, Decimal("0.00"))
    shipping = shipping_charge_for_state(state)
    cod_charge = (
        money(settings.cod_charge)
        if payment_method.casefold().strip() == "cod"
        else Decimal("0.00")
    )
    tax = money(taxable * Decimal(settings.tax_rate_percent) / Decimal("100"))
    grand_total = money(taxable + shipping + cod_charge + tax)

    return {
        "subtotal": money(subtotal),
        "discount_amount": discount,
        "shipping_charge": shipping,
        "cod_charge": cod_charge,
        "tax_amount": tax,
        "grand_total": grand_total,
    }
