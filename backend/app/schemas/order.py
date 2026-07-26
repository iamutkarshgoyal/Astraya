from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(ge=1, le=99)


class OrderCreate(BaseModel):
    customer_name: str = Field(min_length=2, max_length=150)
    phone: str = Field(min_length=7, max_length=30)
    email: EmailStr
    address: str = Field(min_length=8)
    city: str = Field(min_length=2, max_length=100)
    state: str = Field(min_length=2, max_length=100)
    pincode: str = Field(min_length=4, max_length=20)
    special_instructions: str | None = None
    coupon_code: str | None = Field(default=None, max_length=40)
    items: list[OrderItemCreate] = Field(min_length=1)


class OrderItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int | None
    product_name: str
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
    items: list[OrderItemRead]
    created_at: datetime


class OrderCreateResponse(BaseModel):
    order: OrderRead
    whatsapp_url: str
    whatsapp_message: str
