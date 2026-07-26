from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.newsletter import NewsletterSubscriber
from app.models.order import Order
from app.models.product import Product
from app.models.user import User
from app.schemas.admin import AdminStats


def get_admin_stats(db: Session) -> AdminStats:
    return AdminStats(
        total_customers=db.scalar(select(func.count()).select_from(User)) or 0,
        total_orders=db.scalar(select(func.count()).select_from(Order)) or 0,
        total_products=db.scalar(select(func.count()).select_from(Product)) or 0,
        pending_orders=(
            db.scalar(
                select(func.count())
                .select_from(Order)
                .where(Order.status == "pending_whatsapp")
            )
            or 0
        ),
        revenue=float(db.scalar(select(func.coalesce(func.sum(Order.grand_total), 0))) or 0),
        newsletter_subscribers=(
            db.scalar(
                select(func.count())
                .select_from(NewsletterSubscriber)
                .where(NewsletterSubscriber.is_active.is_(True))
            )
            or 0
        ),
    )
