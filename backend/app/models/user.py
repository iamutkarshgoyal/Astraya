from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.models.mixins import TimestampMixin

if TYPE_CHECKING:
    from app.models.cart import CartItem
    from app.models.order import Order
    from app.models.review import Review
    from app.models.wishlist import Wishlist


class User(TimestampMixin, Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(150))
    hashed_password: Mapped[str | None] = mapped_column(String(255))
    google_sub: Mapped[str | None] = mapped_column(String(255), unique=True, index=True)
    phone: Mapped[str | None] = mapped_column(String(30))
    role: Mapped[str] = mapped_column(String(30), default="customer", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    password_reset_token_hash: Mapped[str | None] = mapped_column(String(255))
    password_reset_expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
    )

    orders: Mapped[list["Order"]] = relationship(back_populates="user")
    wishlist_items: Mapped[list["Wishlist"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )
    cart_items: Mapped[list["CartItem"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )
    reviews: Mapped[list["Review"]] = relationship(back_populates="user")
