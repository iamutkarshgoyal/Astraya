from datetime import datetime
from decimal import Decimal
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.utils.cdn_images import get_product_image_urls


class CategoryBase(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    slug: str = Field(min_length=2, max_length=140)
    description: str | None = None
    image_url: str | None = None
    display_order: int = 0
    is_active: bool = True


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=120)
    slug: str | None = Field(default=None, min_length=2, max_length=140)
    description: str | None = None
    image_url: str | None = None
    display_order: int | None = None
    is_active: bool | None = None


class CategoryRead(CategoryBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_count: int = 0
    created_at: datetime


class ProductImageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    image_url: str
    alt_text: str
    display_order: int
    is_primary: bool


class ProductImageCreate(BaseModel):
    image_url: str = Field(min_length=1, max_length=500)
    alt_text: str = Field(min_length=1, max_length=180)
    display_order: int = 0
    is_primary: bool = False


class ProductBase(BaseModel):
    category_id: int
    name: str = Field(min_length=2, max_length=180)
    slug: str = Field(min_length=2, max_length=220)
    sku: str = Field(min_length=2, max_length=80)
    short_description: str = Field(min_length=8, max_length=300)
    description: str = Field(min_length=20)
    price: Decimal = Field(gt=0)
    discount_price: Decimal | None = Field(default=None, gt=0)
    stock_quantity: int = Field(ge=0)
    burn_time_minutes: int | None = Field(default=None, ge=1)
    wax_type: str | None = None
    fragrance: str | None = None
    ingredients: str | None = None
    weight_grams: int | None = Field(default=None, ge=1)
    dimensions: str | None = None
    is_featured: bool = False
    is_best_seller: bool = False
    is_active: bool = True


class ProductCreate(ProductBase):
    images: list[ProductImageCreate] = Field(default_factory=list)


class ProductUpdate(BaseModel):
    category_id: int | None = None
    name: str | None = Field(default=None, min_length=2, max_length=180)
    slug: str | None = Field(default=None, min_length=2, max_length=220)
    sku: str | None = Field(default=None, min_length=2, max_length=80)
    short_description: str | None = Field(default=None, min_length=8, max_length=300)
    description: str | None = Field(default=None, min_length=20)
    price: Decimal | None = Field(default=None, gt=0)
    discount_price: Decimal | None = Field(default=None, gt=0)
    stock_quantity: int | None = Field(default=None, ge=0)
    burn_time_minutes: int | None = Field(default=None, ge=1)
    wax_type: str | None = None
    fragrance: str | None = None
    ingredients: str | None = None
    weight_grams: int | None = Field(default=None, ge=1)
    dimensions: str | None = None
    is_featured: bool | None = None
    is_best_seller: bool | None = None
    is_active: bool | None = None
    images: list[ProductImageCreate] | None = None


class ProductRead(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    category: CategoryRead
    images: list[ProductImageRead]
    primary_image_url: str | None = None
    average_rating: float = 0
    review_count: int = 0
    created_at: datetime
    updated_at: datetime | None = None

    @model_validator(mode="before")
    @classmethod
    def apply_cdn_image_urls(cls, value: Any) -> Any:
        slug = _read_attr(value, "slug")
        if not slug:
            return value

        images = sorted(
            list(_read_attr(value, "images", []) or []),
            key=lambda image: _read_attr(image, "display_order", 0),
        )
        cdn_urls = get_product_image_urls(str(slug), len(images))
        image_payloads = [
            _product_image_payload(image, cdn_urls[index])
            for index, image in enumerate(images)
        ]

        if not image_payloads:
            image_payloads = [
                {
                    "id": 0,
                    "image_url": cdn_urls[0],
                    "alt_text": f"{_read_attr(value, 'name', 'Astraya candle')} product image",
                    "display_order": 0,
                    "is_primary": True,
                }
            ]

        primary_index = next(
            (
                index
                for index, image in enumerate(image_payloads)
                if image.get("is_primary")
            ),
            0,
        )

        return {
            "id": _read_attr(value, "id"),
            "category_id": _read_attr(value, "category_id"),
            "name": _read_attr(value, "name"),
            "slug": slug,
            "sku": _read_attr(value, "sku"),
            "short_description": _read_attr(value, "short_description"),
            "description": _read_attr(value, "description"),
            "price": _read_attr(value, "price"),
            "discount_price": _read_attr(value, "discount_price"),
            "stock_quantity": _read_attr(value, "stock_quantity"),
            "burn_time_minutes": _read_attr(value, "burn_time_minutes"),
            "wax_type": _read_attr(value, "wax_type"),
            "fragrance": _read_attr(value, "fragrance"),
            "ingredients": _read_attr(value, "ingredients"),
            "weight_grams": _read_attr(value, "weight_grams"),
            "dimensions": _read_attr(value, "dimensions"),
            "is_featured": _read_attr(value, "is_featured"),
            "is_best_seller": _read_attr(value, "is_best_seller"),
            "is_active": _read_attr(value, "is_active"),
            "category": _read_attr(value, "category"),
            "images": image_payloads,
            "primary_image_url": image_payloads[primary_index]["image_url"],
            "average_rating": _read_attr(value, "average_rating", 0),
            "review_count": _read_attr(value, "review_count", 0),
            "created_at": _read_attr(value, "created_at"),
            "updated_at": _read_attr(value, "updated_at"),
        }


class ProductListResponse(BaseModel):
    items: list[ProductRead]
    total: int


def _read_attr(value: Any, name: str, default: Any = None) -> Any:
    if isinstance(value, dict):
        return value.get(name, default)
    return getattr(value, name, default)


def _product_image_payload(image: Any, cdn_url: str) -> dict[str, Any]:
    return {
        "id": _read_attr(image, "id"),
        "image_url": cdn_url,
        "alt_text": _read_attr(image, "alt_text", "Astraya candle product image"),
        "display_order": _read_attr(image, "display_order", 0),
        "is_primary": _read_attr(image, "is_primary", False),
    }
