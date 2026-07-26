from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.database.session import get_db
from app.models.category import Category
from app.schemas.catalog import CategoryRead, ProductListResponse, ProductRead
from app.services.catalog_service import get_product_by_slug, list_categories, list_products

router = APIRouter(tags=["catalog"])


@router.get("/categories", response_model=list[CategoryRead])
def read_categories(db: Session = Depends(get_db)) -> list[Category]:
    return list_categories(db)


@router.get("/categories/{slug}", response_model=CategoryRead)
def read_category(slug: str, db: Session = Depends(get_db)) -> Category:
    category = db.scalar(
        select(Category)
        .options(selectinload(Category.products))
        .where(Category.slug == slug, Category.is_active.is_(True))
    )
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@router.get("/products", response_model=ProductListResponse)
def read_products(
    category: str | None = Query(default=None),
    search: str | None = Query(default=None),
    featured: bool | None = Query(default=None),
    best_seller: bool | None = Query(default=None),
    db: Session = Depends(get_db),
) -> ProductListResponse:
    items, total = list_products(
        db=db,
        category_slug=category,
        search=search,
        featured=featured,
        best_seller=best_seller,
    )
    return ProductListResponse(items=items, total=total)


@router.get("/products/{slug}", response_model=ProductRead)
def read_product(slug: str, db: Session = Depends(get_db)):
    product = get_product_by_slug(db, slug)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product
