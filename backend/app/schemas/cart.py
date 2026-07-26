from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.catalog import ProductRead


class CartItemRequest(BaseModel):
    product_id: int
    quantity: int = Field(ge=1, le=99)


class CartItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    quantity: int
    product: ProductRead
    created_at: datetime
    updated_at: datetime | None = None


class CartRead(BaseModel):
    items: list[CartItemRead]
    item_count: int
    subtotal: float
