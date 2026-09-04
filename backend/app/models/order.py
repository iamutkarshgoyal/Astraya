from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, JSON, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.models.mixins import TimestampMixin

if TYPE_CHECKING:
    from app.models.product import Product
    from app.models.user import User


class Order(TimestampMixin, Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    order_number: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), index=True)
    customer_name: Mapped[str] = mapped_column(String(150))
    phone: Mapped[str] = mapped_column(String(30))
    email: Mapped[str] = mapped_column(String(255))
    address: Mapped[str] = mapped_column(Text)
    city: Mapped[str] = mapped_column(String(100))
    state: Mapped[str] = mapped_column(String(100))
    pincode: Mapped[str] = mapped_column(String(20))
    special_instructions: Mapped[str | None] = mapped_column(Text)
    subtotal: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    shipping_charge: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0)
    cod_charge: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0)
    tax_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0)
    discount_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0)
    grand_total: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    payment_method: Mapped[str] = mapped_column(String(30), default="cod", nullable=False)
    payment_status: Mapped[str] = mapped_column(
        String(30),
        default="cod_due",
        nullable=False,
        index=True,
    )
    gateway_order_id: Mapped[str | None] = mapped_column(String(120), unique=True)
    gateway_payment_id: Mapped[str | None] = mapped_column(String(120), unique=True)
    payment_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    policy_accepted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    policy_accepted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    status: Mapped[str] = mapped_column(
        String(40),
        default="confirmed",
        nullable=False,
        index=True,
    )
    tracking_carrier: Mapped[str | None] = mapped_column(String(60))
    tracking_number: Mapped[str | None] = mapped_column(String(120))
    tracking_url: Mapped[str | None] = mapped_column(Text)
    whatsapp_message: Mapped[str | None] = mapped_column(Text)
    email_notification_status: Mapped[str] = mapped_column(
        String(40),
        default="pending",
        nullable=False,
    )
    whatsapp_notification_status: Mapped[str] = mapped_column(
        String(40),
        default="pending",
        nullable=False,
    )
    customer_email_notification_status: Mapped[str] = mapped_column(
        String(40),
        default="pending",
        nullable=False,
    )
    customer_whatsapp_notification_status: Mapped[str] = mapped_column(
        String(40),
        default="pending",
        nullable=False,
    )
    customer_sms_notification_status: Mapped[str] = mapped_column(
        String(40),
        default="pending",
        nullable=False,
    )
    tracking_email_notification_status: Mapped[str] = mapped_column(
        String(40),
        default="not_sent",
        nullable=False,
    )
    tracking_whatsapp_notification_status: Mapped[str] = mapped_column(
        String(40),
        default="not_sent",
        nullable=False,
    )
    tracking_sms_notification_status: Mapped[str] = mapped_column(
        String(40),
        default="not_sent",
        nullable=False,
    )
    notification_error: Mapped[str | None] = mapped_column(Text)

    user: Mapped["User | None"] = relationship(back_populates="orders")
    items: Mapped[list["OrderItem"]] = relationship(
        back_populates="order",
        cascade="all, delete-orphan",
    )


class OrderItem(TimestampMixin, Base):
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    order_id: Mapped[int] = mapped_column(
        ForeignKey("orders.id", ondelete="CASCADE"),
        index=True,
    )
    product_id: Mapped[int | None] = mapped_column(
        ForeignKey("products.id", ondelete="SET NULL"),
        index=True,
    )
    product_name: Mapped[str] = mapped_column(String(180))
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    line_total: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    customization: Mapped[dict[str, object] | None] = mapped_column(JSON)
    preview_image: Mapped[str | None] = mapped_column(Text)

    order: Mapped[Order] = relationship(back_populates="items")
    product: Mapped["Product | None"] = relationship(back_populates="order_items")
