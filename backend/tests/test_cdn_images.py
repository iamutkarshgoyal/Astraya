from datetime import datetime
from decimal import Decimal

from app.models.category import Category
from app.models.product import Product
from app.models.product_image import ProductImage
from app.schemas.catalog import ProductRead
from app.utils.cdn_images import get_product_image_urls


def test_get_product_image_urls_uses_configured_cdn_shape() -> None:
    assert get_product_image_urls("lavender-candle", 3) == [
        "https://cdn.jsdelivr.net/gh/iamutkarshgoyal/Astraya@main/images/products/lavender-candle/1.jpg",
        "https://cdn.jsdelivr.net/gh/iamutkarshgoyal/Astraya@main/images/products/lavender-candle/2.jpg",
        "https://cdn.jsdelivr.net/gh/iamutkarshgoyal/Astraya@main/images/products/lavender-candle/3.jpg",
    ]


def test_product_read_rewrites_database_image_rows_to_cdn_urls() -> None:
    created_at = datetime(2026, 7, 26)
    category = Category(
        id=1,
        name="Signature Collection",
        slug="signature-collection",
        description="Signature candles",
        image_url="/images/categories/signature-collection.png",
        display_order=1,
        is_active=True,
        created_at=created_at,
    )
    product = Product(
        id=1,
        category_id=1,
        name="Lavender Candle",
        slug="lavender-candle",
        sku="AST-LAVENDER",
        short_description="Soft lavender candle.",
        description="A calming lavender candle for evening rituals.",
        price=Decimal("1299.00"),
        discount_price=None,
        stock_quantity=5,
        burn_time_minutes=1200,
        wax_type="Soy wax",
        fragrance="Lavender",
        ingredients="Soy wax, cotton wick",
        weight_grams=220,
        dimensions="8 cm x 9 cm",
        is_featured=True,
        is_best_seller=False,
        is_active=True,
        created_at=created_at,
        updated_at=None,
        category=category,
    )
    category.products = [product]
    product.images = [
        ProductImage(
            id=10,
            image_url="/images/products/lavender-candle.png",
            alt_text="Lavender Candle product image",
            display_order=0,
            is_primary=True,
        ),
        ProductImage(
            id=11,
            image_url="/images/products/lavender-candle-detail.png",
            alt_text="Lavender Candle detail image",
            display_order=1,
            is_primary=False,
        ),
    ]
    product.reviews = []

    payload = ProductRead.model_validate(product)

    assert payload.primary_image_url.endswith("/lavender-candle/1.jpg")
    assert [image.image_url for image in payload.images] == [
        "https://cdn.jsdelivr.net/gh/iamutkarshgoyal/Astraya@main/images/products/lavender-candle/1.jpg",
        "https://cdn.jsdelivr.net/gh/iamutkarshgoyal/Astraya@main/images/products/lavender-candle/2.jpg",
    ]
