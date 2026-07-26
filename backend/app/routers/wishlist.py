from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_current_user
from app.database.session import get_db
from app.models.product import Product
from app.models.user import User
from app.models.wishlist import Wishlist
from app.schemas.catalog import ProductRead

router = APIRouter(prefix="/wishlist", tags=["wishlist"])


def wishlist_products(db: Session, user: User) -> list[Product]:
    return list(
        db.scalars(
            select(Product)
            .join(Wishlist)
            .options(
                selectinload(Product.category),
                selectinload(Product.images),
                selectinload(Product.reviews),
            )
            .where(Wishlist.user_id == user.id)
            .order_by(Product.name)
        )
    )


@router.get("", response_model=list[ProductRead])
def get_wishlist(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[Product]:
    return wishlist_products(db, current_user)


@router.post("/{product_id}", response_model=list[ProductRead], status_code=status.HTTP_201_CREATED)
def add_to_wishlist(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[Product]:
    product = db.get(Product, product_id)
    if product is None or not product.is_active:
        raise HTTPException(status_code=404, detail="Product not found")

    exists = db.scalar(
        select(Wishlist).where(
            Wishlist.user_id == current_user.id,
            Wishlist.product_id == product_id,
        )
    )
    if exists is None:
        db.add(Wishlist(user_id=current_user.id, product_id=product_id))
        db.commit()
    return wishlist_products(db, current_user)


@router.delete("/{product_id}", response_model=list[ProductRead])
def remove_from_wishlist(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[Product]:
    item = db.scalar(
        select(Wishlist).where(
            Wishlist.user_id == current_user.id,
            Wishlist.product_id == product_id,
        )
    )
    if item:
        db.delete(item)
        db.commit()
    return wishlist_products(db, current_user)
