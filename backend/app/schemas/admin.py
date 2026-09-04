from typing import Literal

from pydantic import BaseModel, Field, HttpUrl, model_validator


class AdminStats(BaseModel):
    total_customers: int
    total_orders: int
    total_products: int
    pending_orders: int
    revenue: float
    newsletter_subscribers: int


class OrderStatusUpdate(BaseModel):
    status: str


class OrderTrackingUpdate(BaseModel):
    carrier: Literal["dtdc", "blue_dart", "other"]
    tracking_number: str = Field(min_length=3, max_length=120)
    tracking_url: HttpUrl | None = None

    @model_validator(mode="after")
    def require_custom_tracking_url(self) -> "OrderTrackingUpdate":
        if self.carrier == "other" and self.tracking_url is None:
            raise ValueError("Provide a tracking link for Other delivery partner")
        return self
