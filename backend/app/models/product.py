from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.models.mixins import TimestampMixin

if TYPE_CHECKING:
    from app.models.cart import CartItem
    from app.models.category import Category
    from app.models.order import OrderItem
    from app.models.product_image import ProductImage
    from app.models.review import Review
    from app.models.wishlist import Wishlist


class Product(TimestampMixin, Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"))
    name: Mapped[str] = mapped_column(String(180), index=True)
    slug: Mapped[str] = mapped_column(String(220), unique=True, index=True)
    sku: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    short_description: Mapped[str] = mapped_column(String(300))
    description: Mapped[str] = mapped_column(Text)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    discount_price: Mapped[Decimal | None] = mapped_column(Numeric(10, 2))
    stock_quantity: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    burn_time_minutes: Mapped[int | None] = mapped_column(Integer)
    wax_type: Mapped[str | None] = mapped_column(String(120))
    fragrance: Mapped[str | None] = mapped_column(String(160))
    ingredients: Mapped[str | None] = mapped_column(Text)
    weight_grams: Mapped[int | None] = mapped_column(Integer)
    dimensions: Mapped[str | None] = mapped_column(String(120))
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_best_seller: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    category: Mapped["Category"] = relationship(back_populates="products")
    images: Mapped[list["ProductImage"]] = relationship(
        back_populates="product",
        cascade="all, delete-orphan",
    )
    order_items: Mapped[list["OrderItem"]] = relationship(back_populates="product")
    wishlist_items: Mapped[list["Wishlist"]] = relationship(back_populates="product")
    cart_items: Mapped[list["CartItem"]] = relationship(back_populates="product")
    reviews: Mapped[list["Review"]] = relationship(back_populates="product")

    @property
    def primary_image_url(self) -> str | None:
        primary = next((image for image in self.images if image.is_primary), None)
        if primary:
            return primary.image_url
        if self.images:
            return sorted(self.images, key=lambda image: image.display_order)[0].image_url
        return None

    @property
    def review_count(self) -> int:
        return len([review for review in self.reviews if review.is_approved])

    @property
    def average_rating(self) -> float:
        approved_reviews = [review for review in self.reviews if review.is_approved]
        if not approved_reviews:
            return 0.0
        return round(
            sum(review.rating for review in approved_reviews) / len(approved_reviews),
            1,
        )
