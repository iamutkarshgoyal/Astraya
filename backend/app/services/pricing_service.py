from decimal import Decimal, ROUND_HALF_UP

from app.core.config import settings


def money(value: Decimal | int | float) -> Decimal:
    return Decimal(str(value)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def calculate_totals(subtotal: Decimal, coupon_code: str | None = None) -> dict[str, Decimal]:
    discount = Decimal("0.00")
    if coupon_code and coupon_code.strip().upper() == "ASTRAYA10":
        discount = money(subtotal * Decimal("0.10"))

    taxable = max(subtotal - discount, Decimal("0.00"))
    shipping = Decimal("0.00") if taxable >= Decimal("2500.00") else money(settings.default_shipping_charge)
    tax = money(taxable * Decimal(settings.tax_rate_percent) / Decimal("100"))
    grand_total = money(taxable + shipping + tax)

    return {
        "subtotal": money(subtotal),
        "discount_amount": discount,
        "shipping_charge": shipping,
        "tax_amount": tax,
        "grand_total": grand_total,
    }
