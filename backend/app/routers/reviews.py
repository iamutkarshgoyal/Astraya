from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_current_user
from app.database.session import get_db
from app.models.product import Product
from app.models.review import Review
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewRead

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.get("/product/{product_id}", response_model=list[ReviewRead])
def read_product_reviews(product_id: int, db: Session = Depends(get_db)) -> list[Review]:
    return list(
        db.scalars(
            select(Review)
            .options(selectinload(Review.user))
            .where(Review.product_id == product_id, Review.is_approved.is_(True))
            .order_by(Review.created_at.desc())
        )
    )


@router.post("", response_model=ReviewRead, status_code=status.HTTP_201_CREATED)
def create_review(
    payload: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Review:
    product = db.get(Product, payload.product_id)
    if product is None or not product.is_active:
        raise HTTPException(status_code=404, detail="Product not found")

    review = Review(
        product_id=payload.product_id,
        user_id=current_user.id,
        rating=payload.rating,
        title=payload.title,
        comment=payload.comment,
        is_approved=current_user.role == "admin",
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review
