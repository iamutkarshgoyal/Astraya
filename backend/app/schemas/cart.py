from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.catalog import ProductRead
from app.schemas.customization import CandleCustomization, CustomizableItem


class CartItemRequest(CustomizableItem):
    product_id: int
    quantity: int = Field(ge=1, le=99)


class CartItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    quantity: int
    variant_key: str
    customization: CandleCustomization | None = None
    preview_image: str | None = None
    product: ProductRead
    created_at: datetime
    updated_at: datetime | None = None


class CartRead(BaseModel):
    items: list[CartItemRead]
    item_count: int
    subtotal: float
