from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_optional_current_user
from app.database.session import get_db
from app.models.order import Order
from app.models.user import User
from app.schemas.order import OrderCreate, OrderCreateResponse, OrderRead
from app.services.order_notification_service import send_order_notifications
from app.services.order_service import create_order

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("", response_model=OrderCreateResponse, status_code=status.HTTP_201_CREATED)
def place_order(
    payload: OrderCreate,
    background_tasks: BackgroundTasks,
    current_user: User | None = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
) -> OrderCreateResponse:
    try:
        order, whatsapp_url = create_order(db, payload, current_user)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    background_tasks.add_task(send_order_notifications, order.id)
    return OrderCreateResponse(
        order=order,
        whatsapp_url=whatsapp_url,
        whatsapp_message=order.whatsapp_message or "",
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


@router.get("/{order_number}", response_model=OrderRead)
def read_order(order_number: str, db: Session = Depends(get_db)) -> Order:
    order = db.scalar(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.order_number == order_number)
    )
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return order
