from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_current_user
from app.database.session import get_db
from app.models.cart import CartItem
from app.models.product import Product
from app.models.user import User
from app.schemas.cart import CartItemRequest, CartRead
from app.services.pricing_service import money

router = APIRouter(prefix="/cart", tags=["cart"])


def read_user_cart(db: Session, user: User) -> list[CartItem]:
    return list(
        db.scalars(
            select(CartItem)
            .options(
                selectinload(CartItem.product).selectinload(Product.category),
                selectinload(CartItem.product).selectinload(Product.images),
                selectinload(CartItem.product).selectinload(Product.reviews),
            )
            .where(CartItem.user_id == user.id)
            .order_by(CartItem.created_at.desc())
        )
    )


def cart_response(items: list[CartItem]) -> CartRead:
    subtotal = Decimal("0.00")
    item_count = 0
    for item in items:
        unit_price = item.product.discount_price or item.product.price
        subtotal += unit_price * item.quantity
        item_count += item.quantity
    return CartRead(items=items, item_count=item_count, subtotal=float(money(subtotal)))


@router.get("", response_model=CartRead)
def get_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CartRead:
    return cart_response(read_user_cart(db, current_user))


@router.post("/items", response_model=CartRead, status_code=status.HTTP_201_CREATED)
def add_cart_item(
    payload: CartItemRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CartRead:
    product = db.get(Product, payload.product_id)
    if product is None or not product.is_active:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.stock_quantity < payload.quantity:
        raise HTTPException(status_code=400, detail="Requested quantity is unavailable")

    item = db.scalar(
        select(CartItem).where(
            CartItem.user_id == current_user.id,
            CartItem.product_id == payload.product_id,
        )
    )
    if item:
        item.quantity = min(item.quantity + payload.quantity, product.stock_quantity)
    else:
        db.add(
            CartItem(
                user_id=current_user.id,
                product_id=payload.product_id,
                quantity=payload.quantity,
            )
        )
    db.commit()
    return cart_response(read_user_cart(db, current_user))


@router.patch("/items/{product_id}", response_model=CartRead)
def update_cart_item(
    product_id: int,
    payload: CartItemRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CartRead:
    item = db.scalar(
        select(CartItem).where(
            CartItem.user_id == current_user.id,
            CartItem.product_id == product_id,
        )
    )
    if item is None:
        raise HTTPException(status_code=404, detail="Cart item not found")
    item.quantity = payload.quantity
    db.commit()
    return cart_response(read_user_cart(db, current_user))


@router.delete("/items/{product_id}", response_model=CartRead)
def remove_cart_item(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CartRead:
    item = db.scalar(
        select(CartItem).where(
            CartItem.user_id == current_user.id,
            CartItem.product_id == product_id,
        )
    )
    if item:
        db.delete(item)
        db.commit()
    return cart_response(read_user_cart(db, current_user))


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def clear_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    for item in read_user_cart(db, current_user):
        db.delete(item)
    db.commit()
