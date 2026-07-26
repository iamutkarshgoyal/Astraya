from sqlalchemy import Select, func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.models.category import Category
from app.models.product import Product
from app.models.product_image import ProductImage
from app.schemas.catalog import ProductCreate, ProductUpdate


def product_options() -> tuple:
    return (
        selectinload(Product.category).selectinload(Category.products),
        selectinload(Product.images),
        selectinload(Product.reviews),
    )


def list_categories(db: Session, active_only: bool = True) -> list[Category]:
    statement = select(Category).options(selectinload(Category.products))
    if active_only:
        statement = statement.where(Category.is_active.is_(True))
    return list(db.scalars(statement.order_by(Category.display_order, Category.name)))


def product_query(active_only: bool = True) -> Select[tuple[Product]]:
    statement = select(Product).options(*product_options())
    if active_only:
        statement = statement.where(Product.is_active.is_(True))
    return statement


def list_products(
    db: Session,
    category_slug: str | None = None,
    search: str | None = None,
    featured: bool | None = None,
    best_seller: bool | None = None,
) -> tuple[list[Product], int]:
    statement = product_query()
    if category_slug:
        statement = statement.join(Product.category).where(Category.slug == category_slug)
    if search:
        search_term = f"%{search.strip()}%"
        statement = statement.where(
            or_(
                Product.name.ilike(search_term),
                Product.short_description.ilike(search_term),
                Product.fragrance.ilike(search_term),
            )
        )
    if featured is not None:
        statement = statement.where(Product.is_featured.is_(featured))
    if best_seller is not None:
        statement = statement.where(Product.is_best_seller.is_(best_seller))

    count_statement = select(func.count()).select_from(statement.order_by(None).subquery())
    total = db.scalar(count_statement) or 0
    items = list(
        db.scalars(
            statement.order_by(Product.is_featured.desc(), Product.name.asc()),
        )
    )
    return items, total


def get_product_by_slug(
    db: Session,
    slug: str,
    active_only: bool = True,
) -> Product | None:
    return db.scalar(product_query(active_only=active_only).where(Product.slug == slug))


def get_product_by_id(
    db: Session,
    product_id: int,
    active_only: bool = True,
) -> Product | None:
    return db.scalar(product_query(active_only=active_only).where(Product.id == product_id))


def create_product(db: Session, payload: ProductCreate) -> Product:
    image_payloads = payload.images
    product = Product(**payload.model_dump(exclude={"images"}))
    product.images = [ProductImage(**image.model_dump()) for image in image_payloads]
    db.add(product)
    db.commit()
    db.refresh(product)
    return get_product_by_id(db, product.id) or product


def update_product(db: Session, product: Product, payload: ProductUpdate) -> Product:
    data = payload.model_dump(exclude_unset=True)
    images = data.pop("images", None)
    for key, value in data.items():
        setattr(product, key, value)
    if images is not None:
        product.images = [ProductImage(**image) for image in images]
    db.commit()
    db.refresh(product)
    return get_product_by_id(db, product.id) or product
