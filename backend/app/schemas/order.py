from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.schemas.customization import CandleCustomization, CustomizableItem


class OrderItemCreate(CustomizableItem):
    product_id: int
    quantity: int = Field(ge=1, le=99)


class OrderCreate(BaseModel):
    customer_name: str = Field(min_length=2, max_length=150)
    phone: str = Field(min_length=7, max_length=30)
    email: EmailStr
    address: str = Field(min_length=8)
    city: str = Field(min_length=2, max_length=100)
    state: str = Field(min_length=2, max_length=100)
    pincode: str = Field(pattern=r"^[1-9][0-9]{5}$")
    special_instructions: str | None = None
    coupon_code: str | None = Field(default=None, max_length=40)
    items: list[OrderItemCreate] = Field(min_length=1)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str) -> str:
        digits = "".join(character for character in value if character.isdigit())
        allowed_characters = set("+0123456789 ()-")
        if (
            any(character not in allowed_characters for character in value)
            or not 7 <= len(digits) <= 15
        ):
            raise ValueError("Enter a valid mobile number")
        return value.strip()


class OrderItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int | None
    product_name: str
    customization: CandleCustomization | None = None
    preview_image: str | None = None
    quantity: int
    unit_price: Decimal
    line_total: Decimal


class OrderRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_number: str
    customer_name: str
    phone: str
    email: EmailStr
    address: str
    city: str
    state: str
    pincode: str
    special_instructions: str | None
    subtotal: Decimal
    shipping_charge: Decimal
    tax_amount: Decimal
    discount_amount: Decimal
    grand_total: Decimal
    status: str
    email_notification_status: str
    whatsapp_notification_status: str
    notification_error: str | None
    items: list[OrderItemRead]
    created_at: datetime


class OrderCreateResponse(BaseModel):
    order: OrderRead
    whatsapp_url: str
    whatsapp_message: str
