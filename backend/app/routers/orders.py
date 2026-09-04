import json

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_current_admin, get_optional_current_user
from app.database.session import get_db
from app.models.order import Order
from app.models.user import User
from app.schemas.order import (
    OrderCreate,
    OrderCreateResponse,
    OrderRead,
    OrderTrackingLookup,
    OrderTrackingRead,
    RazorpayPaymentVerification,
)
from app.services.order_notification_service import send_order_notifications
from app.services.order_service import cancel_and_restock_order, create_order, mark_order_paid
from app.services.payment_service import (
    create_razorpay_checkout,
    verify_razorpay_payment_signature,
    verify_razorpay_webhook_signature,
)

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("", response_model=OrderCreateResponse, status_code=status.HTTP_201_CREATED)
def place_order(
    payload: OrderCreate,
    background_tasks: BackgroundTasks,
    current_user: User | None = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
) -> OrderCreateResponse:
    try:
        order, _ = create_order(db, payload, current_user)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    if payload.payment_method == "online":
        try:
            checkout = create_razorpay_checkout(order)
            db.commit()
            db.refresh(order)
        except ValueError as exc:
            cancel_and_restock_order(db, order)
            raise HTTPException(status_code=503, detail=str(exc)) from exc
        return OrderCreateResponse(
            order=order,
            requires_payment=True,
            razorpay_checkout=checkout,
        )

    background_tasks.add_task(send_order_notifications, order.id)
    return OrderCreateResponse(
        order=order,
    )


@router.get("/me", response_model=list[OrderRead])
def my_orders(
    current_user: User | None = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
) -> list[Order]:
    if current_user is None:
        raise HTTPException(status_code=401, detail="Authentication required")
    return list(
        db.scalars(
            select(Order)
            .options(selectinload(Order.items))
            .where(Order.user_id == current_user.id)
            .order_by(Order.created_at.desc())
        )
    )


@router.post("/verify-payment", response_model=OrderCreateResponse)
def verify_payment(
    payload: RazorpayPaymentVerification,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
) -> OrderCreateResponse:
    order = db.scalar(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.order_number == payload.order_number)
    )
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    if not verify_razorpay_payment_signature(
        order,
        razorpay_order_id=payload.razorpay_order_id,
        razorpay_payment_id=payload.razorpay_payment_id,
        razorpay_signature=payload.razorpay_signature,
    ):
        raise HTTPException(status_code=400, detail="Payment verification failed")
    try:
        should_notify = mark_order_paid(db, order, payload.razorpay_payment_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    if should_notify:
        background_tasks.add_task(send_order_notifications, order.id)
    db.refresh(order)
    return OrderCreateResponse(order=order)


@router.post("/track", response_model=OrderTrackingRead)
def track_order(payload: OrderTrackingLookup, db: Session = Depends(get_db)) -> Order:
    order = db.scalar(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.order_number == payload.order_number.strip().upper())
    )
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    submitted_phone = "".join(character for character in payload.phone if character.isdigit())
    order_phone = "".join(character for character in order.phone if character.isdigit())
    if submitted_phone != order_phone:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.post("/payments/razorpay/webhook", status_code=status.HTTP_204_NO_CONTENT)
async def razorpay_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
) -> None:
    raw_body = await request.body()
    signature = request.headers.get("X-Razorpay-Signature")
    if not verify_razorpay_webhook_signature(raw_body, signature):
        raise HTTPException(status_code=401, detail="Invalid webhook signature")
    try:
        event = json.loads(raw_body)
        payload = event.get("payload", {})
        payment = payload.get("payment", {}).get("entity", {})
        gateway_order_id = payment.get("order_id")
        gateway_payment_id = payment.get("id")
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail="Invalid webhook payload") from None
    if event.get("event") not in {"payment.captured", "order.paid"}:
        return
    if not isinstance(gateway_order_id, str) or not isinstance(gateway_payment_id, str):
        return
    order = db.scalar(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.gateway_order_id == gateway_order_id)
    )
    if order is None:
        return
    try:
        should_notify = mark_order_paid(db, order, gateway_payment_id)
    except ValueError:
        return
    if should_notify:
        background_tasks.add_task(send_order_notifications, order.id)


@router.get("/{order_number}", response_model=OrderRead)
def read_order_for_admin(
    order_number: str,
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> Order:
    order = db.scalar(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.order_number == order_number)
    )
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return order
