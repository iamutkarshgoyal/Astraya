from urllib.parse import quote

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_current_admin
from app.database.session import get_db
from app.models.category import Category
from app.models.contact_message import ContactMessage
from app.models.newsletter import NewsletterSubscriber
from app.models.order import Order
from app.models.product import Product
from app.models.user import User
from app.schemas.admin import AdminStats, OrderStatusUpdate, OrderTrackingUpdate
from app.schemas.catalog import (
    CategoryCreate,
    CategoryRead,
    CategoryUpdate,
    ProductCreate,
    ProductRead,
    ProductUpdate,
)
from app.schemas.engagement import ContactMessageRead, NewsletterRead
from app.schemas.order import OrderRead
from app.schemas.user import UserRead
from app.services.admin_service import get_admin_stats
from app.services.catalog_service import (
    create_product,
    get_product_by_id,
    list_categories,
    product_query,
    update_product,
)
from app.services.order_notification_service import send_tracking_notifications
from app.services.order_service import cancel_and_restock_order

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/stats", response_model=AdminStats)
def read_stats(
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> AdminStats:
    return get_admin_stats(db)


@router.post("/categories", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
def create_category(
    payload: CategoryCreate,
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> Category:
    category = Category(**payload.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.get("/categories", response_model=list[CategoryRead])
def admin_read_categories(
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> list[Category]:
    return list_categories(db, active_only=False)


@router.patch("/categories/{category_id}", response_model=CategoryRead)
def update_category(
    category_id: int,
    payload: CategoryUpdate,
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> Category:
    category = db.get(Category, category_id)
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(category, key, value)
    db.commit()
    db.refresh(category)
    return category


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def deactivate_category(
    category_id: int,
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> None:
    category = db.get(Category, category_id)
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    category.is_active = False
    db.commit()


@router.post("/products", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
def admin_create_product(
    payload: ProductCreate,
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> Product:
    return create_product(db, payload)


@router.get("/products", response_model=list[ProductRead])
def admin_read_products(
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> list[Product]:
    return list(
        db.scalars(
            product_query(active_only=False).order_by(Product.created_at.desc(), Product.name.asc())
        )
    )


@router.patch("/products/{product_id}", response_model=ProductRead)
def admin_update_product(
    product_id: int,
    payload: ProductUpdate,
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> Product:
    product = get_product_by_id(db, product_id, active_only=False)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return update_product(db, product, payload)


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def deactivate_product(
    product_id: int,
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> None:
    product = get_product_by_id(db, product_id, active_only=False)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    product.is_active = False
    db.commit()


@router.get("/orders", response_model=list[OrderRead])
def admin_read_orders(
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> list[Order]:
    return list(
        db.scalars(
            select(Order)
            .options(selectinload(Order.items))
            .order_by(Order.created_at.desc())
        )
    )


@router.patch("/orders/{order_id}/status", response_model=OrderRead)
def admin_update_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> Order:
    order = db.scalar(
        select(Order).options(selectinload(Order.items)).where(Order.id == order_id)
    )
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    if payload.status == "cancelled":
        cancel_and_restock_order(db, order)
    else:
        order.status = payload.status
        db.commit()
    db.refresh(order)
    return order


@router.patch("/orders/{order_id}/tracking", response_model=OrderRead)
def admin_update_order_tracking(
    order_id: int,
    payload: OrderTrackingUpdate,
    background_tasks: BackgroundTasks,
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> Order:
    order = db.scalar(
        select(Order).options(selectinload(Order.items)).where(Order.id == order_id)
    )
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")

    encoded_number = quote(payload.tracking_number.strip(), safe="")
    if payload.tracking_url is not None:
        tracking_url = str(payload.tracking_url)
    elif payload.carrier == "dtdc":
        tracking_url = f"https://www.dtdc.in/tracking.asp?strCnno={encoded_number}"
    else:
        tracking_url = (
            "https://www.bluedart.com/trackdartresult?trackFor=0&trackNo="
            f"{encoded_number}"
        )

    order.tracking_carrier = payload.carrier
    order.tracking_number = payload.tracking_number.strip()
    order.tracking_url = tracking_url
    order.status = "shipped"
    order.tracking_email_notification_status = "pending"
    order.tracking_whatsapp_notification_status = "pending"
    order.tracking_sms_notification_status = "pending"
    db.commit()
    db.refresh(order)
    background_tasks.add_task(send_tracking_notifications, order.id)
    return order


@router.get("/customers", response_model=list[UserRead])
def admin_read_customers(
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> list[User]:
    return list(db.scalars(select(User).order_by(User.created_at.desc())))


@router.get("/contact-messages", response_model=list[ContactMessageRead])
def admin_read_contact_messages(
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> list[ContactMessage]:
    return list(db.scalars(select(ContactMessage).order_by(ContactMessage.created_at.desc())))


@router.get("/newsletter", response_model=list[NewsletterRead])
def admin_read_newsletter(
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> list[NewsletterSubscriber]:
    return list(
        db.scalars(select(NewsletterSubscriber).order_by(NewsletterSubscriber.created_at.desc()))
    )
