from decimal import Decimal
from urllib.parse import quote

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.config import settings
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.user import User
from app.schemas.order import OrderCreate
from app.services.pricing_service import calculate_totals, money


def create_order_number(db: Session) -> str:
    next_id = (db.scalar(select(Order.id).order_by(Order.id.desc()).limit(1)) or 0) + 1
    return f"AST-{next_id:06d}"


def build_whatsapp_message(order: Order) -> str:
    lines = [
        "Astraya Order",
        f"Order Number: {order.order_number}",
        f"Customer Name: {order.customer_name}",
        f"Phone: {order.phone}",
        "",
        "Products:",
    ]
    for item in order.items:
        lines.append(
            f"- {item.product_name} | Qty: {item.quantity} | "
            f"Price: Rs {item.unit_price} | Subtotal: Rs {item.line_total}"
        )

    lines.extend(
        [
            "",
            f"Subtotal: Rs {order.subtotal}",
            f"Shipping: Rs {order.shipping_charge}",
            f"Tax: Rs {order.tax_amount}",
            f"Discount: Rs {order.discount_amount}",
            f"Grand Total: Rs {order.grand_total}",
            "",
            f"Address: {order.address}, {order.city}, {order.state} - {order.pincode}",
        ]
    )
    if order.special_instructions:
        lines.append(f"Special Notes: {order.special_instructions}")
    return "\n".join(lines)


def build_whatsapp_url(message: str) -> str:
    phone = settings.owner_whatsapp_phone.strip().replace("+", "")
    return f"https://wa.me/{phone}?text={quote(message)}"


def create_order(
    db: Session,
    payload: OrderCreate,
    user: User | None = None,
) -> tuple[Order, str]:
    product_ids = [item.product_id for item in payload.items]
    products = {
        product.id: product
        for product in db.scalars(
            select(Product)
            .options(selectinload(Product.images), selectinload(Product.category))
            .where(Product.id.in_(product_ids), Product.is_active.is_(True))
        )
    }

    if len(products) != len(set(product_ids)):
        missing_ids = sorted(set(product_ids) - set(products))
        raise ValueError(f"Products unavailable: {missing_ids}")

    order_items: list[OrderItem] = []
    subtotal = Decimal("0.00")
    for item in payload.items:
        product = products[item.product_id]
        if product.stock_quantity < item.quantity:
            raise ValueError(f"{product.name} has only {product.stock_quantity} available")

        unit_price = product.discount_price or product.price
        line_total = money(unit_price * item.quantity)
        subtotal += line_total
        product.stock_quantity -= item.quantity
        order_items.append(
            OrderItem(
                product_id=product.id,
                product_name=product.name,
                quantity=item.quantity,
                unit_price=money(unit_price),
                line_total=line_total,
            )
        )

    totals = calculate_totals(subtotal, payload.coupon_code)
    order = Order(
        order_number=create_order_number(db),
        user_id=user.id if user else None,
        customer_name=payload.customer_name,
        phone=payload.phone,
        email=payload.email.lower(),
        address=payload.address,
        city=payload.city,
        state=payload.state,
        pincode=payload.pincode,
        special_instructions=payload.special_instructions,
        subtotal=totals["subtotal"],
        shipping_charge=totals["shipping_charge"],
        tax_amount=totals["tax_amount"],
        discount_amount=totals["discount_amount"],
        grand_total=totals["grand_total"],
        items=order_items,
    )
    db.add(order)
    db.flush()
    order.whatsapp_message = build_whatsapp_message(order)
    db.commit()
    db.refresh(order)

    hydrated_order = db.scalar(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.id == order.id)
    )
    final_order = hydrated_order or order
    return final_order, build_whatsapp_url(final_order.whatsapp_message or "")
