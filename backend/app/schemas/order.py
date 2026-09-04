from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator

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
    payment_method: Literal["cod", "online"] = "cod"
    policy_accepted: bool
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

    @model_validator(mode="after")
    def require_policy_acceptance(self) -> "OrderCreate":
        if not self.policy_accepted:
            raise ValueError("Please accept the no-return and exchange policy")
        return self


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
    cod_charge: Decimal
    tax_amount: Decimal
    discount_amount: Decimal
    grand_total: Decimal
    payment_method: str
    payment_status: str
    gateway_order_id: str | None
    gateway_payment_id: str | None
    payment_expires_at: datetime | None
    policy_accepted: bool
    policy_accepted_at: datetime | None
    status: str
    tracking_carrier: str | None
    tracking_number: str | None
    tracking_url: str | None
    email_notification_status: str
    whatsapp_notification_status: str
    customer_email_notification_status: str
    customer_whatsapp_notification_status: str
    customer_sms_notification_status: str
    tracking_email_notification_status: str
    tracking_whatsapp_notification_status: str
    tracking_sms_notification_status: str
    notification_error: str | None
    items: list[OrderItemRead]
    created_at: datetime


class RazorpayCheckout(BaseModel):
    key_id: str
    order_id: str
    amount: int
    currency: str = "INR"


class OrderCreateResponse(BaseModel):
    order: OrderRead
    requires_payment: bool = False
    razorpay_checkout: RazorpayCheckout | None = None


class RazorpayPaymentVerification(BaseModel):
    order_number: str = Field(min_length=4, max_length=40)
    razorpay_order_id: str = Field(min_length=4, max_length=120)
    razorpay_payment_id: str = Field(min_length=4, max_length=120)
    razorpay_signature: str = Field(min_length=32, max_length=256)


class OrderTrackingLookup(BaseModel):
    order_number: str = Field(min_length=4, max_length=40)
    phone: str = Field(min_length=7, max_length=30)

    @field_validator("phone")
    @classmethod
    def validate_tracking_phone(cls, value: str) -> str:
        digits = "".join(character for character in value if character.isdigit())
        if not 7 <= len(digits) <= 15:
            raise ValueError("Enter the phone number used at checkout")
        return value.strip()


class OrderTrackingItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    product_name: str
    quantity: int


class OrderTrackingRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    order_number: str
    status: str
    payment_method: str
    payment_status: str
    tracking_carrier: str | None
    tracking_number: str | None
    tracking_url: str | None
    items: list[OrderTrackingItemRead]
    created_at: datetime
