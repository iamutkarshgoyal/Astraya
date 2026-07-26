from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


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


class ProductListResponse(BaseModel):
    items: list[ProductRead]
    total: int
