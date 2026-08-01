import hashlib
import json
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_current_user
from app.database.session import get_db
from app.models.cart import CartItem
from app.models.product import Product
from app.models.user import User
from app.schemas.cart import CartItemRequest, CartRead
from app.services.pricing_service import money

router = APIRouter(prefix="/cart", tags=["cart"])


def customization_variant_key(payload: CartItemRequest) -> str:
    if payload.customization is None:
        return "standard"
    stable_payload = json.dumps(
        payload.customization.model_dump(),
        sort_keys=True,
        separators=(",", ":"),
    )
    return f"custom-{hashlib.sha256(stable_payload.encode()).hexdigest()[:24]}"


def product_quantity_in_cart(
    db: Session,
    user_id: int,
    product_id: int,
    *,
    excluding_item_id: int | None = None,
) -> int:
    query = select(func.coalesce(func.sum(CartItem.quantity), 0)).where(
        CartItem.user_id == user_id,
        CartItem.product_id == product_id,
    )
    if excluding_item_id is not None:
        query = query.where(CartItem.id != excluding_item_id)
    return int(db.scalar(query) or 0)


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
    current_quantity = product_quantity_in_cart(
        db,
        current_user.id,
        payload.product_id,
    )
    if current_quantity + payload.quantity > product.stock_quantity:
        raise HTTPException(status_code=400, detail="Requested quantity is unavailable")

    variant_key = customization_variant_key(payload)
    item = db.scalar(
        select(CartItem).where(
            CartItem.user_id == current_user.id,
            CartItem.product_id == payload.product_id,
            CartItem.variant_key == variant_key,
        )
    )
    if item:
        item.quantity += payload.quantity
        if payload.preview_image:
            item.preview_image = payload.preview_image
    else:
        db.add(
            CartItem(
                user_id=current_user.id,
                product_id=payload.product_id,
                quantity=payload.quantity,
                variant_key=variant_key,
                customization=(
                    payload.customization.model_dump()
                    if payload.customization
                    else None
                ),
                preview_image=payload.preview_image,
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
    product = item.product
    other_quantity = product_quantity_in_cart(
        db,
        current_user.id,
        product_id,
        excluding_item_id=item.id,
    )
    if other_quantity + payload.quantity > product.stock_quantity:
        raise HTTPException(status_code=400, detail="Requested quantity is unavailable")
    item.quantity = payload.quantity
    db.commit()
    return cart_response(read_user_cart(db, current_user))


@router.patch("/lines/{item_id}", response_model=CartRead)
def update_cart_line(
    item_id: int,
    payload: CartItemRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CartRead:
    item = db.scalar(
        select(CartItem)
        .options(selectinload(CartItem.product))
        .where(
            CartItem.id == item_id,
            CartItem.user_id == current_user.id,
        )
    )
    if item is None:
        raise HTTPException(status_code=404, detail="Cart item not found")
    if payload.product_id != item.product_id:
        raise HTTPException(status_code=400, detail="Cart line product cannot be changed")

    other_quantity = product_quantity_in_cart(
        db,
        current_user.id,
        item.product_id,
        excluding_item_id=item.id,
    )
    if other_quantity + payload.quantity > item.product.stock_quantity:
        raise HTTPException(status_code=400, detail="Requested quantity is unavailable")

    item.quantity = payload.quantity
    db.commit()
    return cart_response(read_user_cart(db, current_user))


@router.delete("/lines/{item_id}", response_model=CartRead)
def remove_cart_line(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CartRead:
    item = db.scalar(
        select(CartItem).where(
            CartItem.id == item_id,
            CartItem.user_id == current_user.id,
        )
    )
    if item:
        db.delete(item)
        db.commit()
    return cart_response(read_user_cart(db, current_user))


@router.delete("/items/{product_id}", response_model=CartRead)
def remove_cart_item(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CartRead:
    items = list(
        db.scalars(
        select(CartItem).where(
            CartItem.user_id == current_user.id,
            CartItem.product_id == product_id,
        )
        )
    )
    for item in items:
        db.delete(item)
    if items:
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
