from collections import defaultdict
from datetime import datetime, timedelta, timezone
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


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _restore_order_inventory(db: Session, order: Order) -> None:
    for item in order.items:
        if item.product_id is None:
            continue
        product = db.scalar(
            select(Product).where(Product.id == item.product_id).with_for_update()
        )
        if product is not None:
            product.stock_quantity += item.quantity


def expire_pending_payment_orders(db: Session) -> None:
    expired_orders = list(
        db.scalars(
            select(Order)
            .options(selectinload(Order.items))
            .where(
                Order.payment_method == "online",
                Order.payment_status == "pending",
                Order.payment_expires_at.is_not(None),
                Order.payment_expires_at < _utc_now(),
            )
            .with_for_update()
        )
    )
    for order in expired_orders:
        _restore_order_inventory(db, order)
        order.payment_status = "expired"
        order.status = "cancelled"
    if expired_orders:
        db.commit()


def build_whatsapp_message(order: Order) -> str:
    lines = [
        "Astraya Order",
        f"Order Number: {order.order_number}",
        (
            f"Order Date: {order.created_at.strftime('%d %b %Y, %I:%M %p UTC')}"
            if order.created_at
            else "Order Date: Just placed"
        ),
        f"Payment: {order.payment_method or 'cod'} ({order.payment_status or 'pending'})",
        f"Customer Name: {order.customer_name}",
        f"Phone: {order.phone}",
        f"Email: {order.email}",
        f"Address: {order.address}, {order.city}, {order.state} - {order.pincode}",
        "",
        "Products:",
    ]
    for item in order.items:
        lines.append(
            f"- {item.product_name} | Qty: {item.quantity} | "
            f"Price: Rs {item.unit_price} | Subtotal: Rs {item.line_total}"
        )
        if item.customization:
            lines.append(
                "  Customisation: "
                f"{item.customization.get('wax_color_name', 'Custom')} wax, "
                f"{item.customization.get('decoration_label', 'No')} add-on, "
                f"{'fine glitter' if item.customization.get('glitter') else 'no glitter'}"
            )
        if item.preview_image:
            lines.append("  Preview: included with owner notification")

    lines.extend(
        [
            "",
            f"Subtotal: Rs {order.subtotal}",
            f"Shipping: Rs {order.shipping_charge}",
        ]
    )
    if order.cod_charge:
        lines.append(f"COD charge: Rs {order.cod_charge}")
    lines.extend(
        [
            f"Tax: Rs {order.tax_amount}",
            f"Discount: Rs {order.discount_amount}",
            f"Grand Total: Rs {order.grand_total}",
        ]
    )
    if order.special_instructions:
        lines.append(f"Special Notes: {order.special_instructions}")
    return "\n".join(lines)


def build_whatsapp_url(message: str) -> str:
    phone = settings.owner_whatsapp_phone.strip().replace("+", "")
    return f"https://wa.me/{phone}?text={quote(message)}"


def build_customer_order_message(order: Order) -> str:
    return (
        f"Astraya order {order.order_number} is confirmed. "
        f"Total: Rs {order.grand_total}. "
        "We will share tracking as soon as your order ships."
    )


def build_tracking_message(order: Order) -> str:
    partner = (order.tracking_carrier or "delivery partner").replace("_", " ").title()
    return (
        f"Astraya order {order.order_number} is on its way with {partner}. "
        f"Tracking number: {order.tracking_number}. "
        f"Track here: {order.tracking_url}"
    )


def create_order(
    db: Session,
    payload: OrderCreate,
    user: User | None = None,
) -> tuple[Order, str]:
    expire_pending_payment_orders(db)
    product_ids = [item.product_id for item in payload.items]
    products = {
        product.id: product
        for product in db.scalars(
            select(Product)
            .options(selectinload(Product.images), selectinload(Product.category))
            .where(Product.id.in_(product_ids), Product.is_active.is_(True))
            .with_for_update()
        )
    }

    if len(products) != len(set(product_ids)):
        missing_ids = sorted(set(product_ids) - set(products))
        raise ValueError(f"Products unavailable: {missing_ids}")

    requested_quantities: dict[int, int] = defaultdict(int)
    for item in payload.items:
        requested_quantities[item.product_id] += item.quantity

    for product_id, requested_quantity in requested_quantities.items():
        product = products[product_id]
        if product.stock_quantity < requested_quantity:
            raise ValueError(
                f"{product.name} has only {product.stock_quantity} available"
            )

    order_items: list[OrderItem] = []
    subtotal = Decimal("0.00")
    for item in payload.items:
        product = products[item.product_id]

        unit_price = product.discount_price or product.price
        line_total = money(unit_price * item.quantity)
        subtotal += line_total
        order_items.append(
            OrderItem(
                product_id=product.id,
                product_name=product.name,
                quantity=item.quantity,
                unit_price=money(unit_price),
                line_total=line_total,
                customization=(
                    item.customization.model_dump()
                    if item.customization
                    else None
                ),
                preview_image=item.preview_image,
            )
        )

    for product_id, requested_quantity in requested_quantities.items():
        products[product_id].stock_quantity -= requested_quantity

    totals = calculate_totals(
        subtotal,
        payload.coupon_code,
        state=payload.state,
        payment_method=payload.payment_method,
    )
    is_online = payload.payment_method == "online"
    now = _utc_now()
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
        cod_charge=totals["cod_charge"],
        tax_amount=totals["tax_amount"],
        discount_amount=totals["discount_amount"],
        grand_total=totals["grand_total"],
        payment_method=payload.payment_method,
        payment_status="pending" if is_online else "cod_due",
        payment_expires_at=(
            now + timedelta(minutes=settings.online_payment_hold_minutes)
            if is_online
            else None
        ),
        policy_accepted=True,
        policy_accepted_at=now,
        status="payment_pending" if is_online else "confirmed",
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


def mark_order_paid(
    db: Session,
    order: Order,
    gateway_payment_id: str,
) -> bool:
    if order.payment_status == "paid":
        return False
    if order.payment_method != "online" or order.payment_status != "pending":
        raise ValueError("This order is not awaiting an online payment")

    order.payment_status = "paid"
    order.gateway_payment_id = gateway_payment_id
    order.payment_expires_at = None
    order.status = "confirmed"
    db.commit()
    return True


def cancel_and_restock_order(db: Session, order: Order) -> None:
    if order.status == "cancelled":
        return
    _restore_order_inventory(db, order)
    order.status = "cancelled"
    if order.payment_status == "pending":
        order.payment_status = "cancelled"
    db.commit()
