from pydantic import BaseModel


class AdminStats(BaseModel):
    total_customers: int
    total_orders: int
    total_products: int
    pending_orders: int
    revenue: float
    newsletter_subscribers: int


class OrderStatusUpdate(BaseModel):
    status: str
