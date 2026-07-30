from app.database.seed import sync_seed_product_images
from app.models.product import Product
from app.models.product_image import ProductImage


def test_sync_seed_product_images_updates_rows_and_adds_missing_image() -> None:
    product = Product(name="Lunar Bloom Soy Candle", slug="lunar-bloom-soy-candle")
    product.images = [
        ProductImage(
            image_url="legacy.jpg",
            alt_text="Legacy image",
            display_order=4,
            is_primary=False,
        )
    ]

    sync_seed_product_images(product, product.name, product.slug)

    assert len(product.images) == 2
    images = sorted(product.images, key=lambda image: image.display_order)
    assert images[0].image_url == "lunar-bloom-soy-candle/1.jpg"
    assert images[0].alt_text == "Lunar Bloom Soy Candle product image"
    assert images[0].is_primary is True
    assert images[1].image_url == "lunar-bloom-soy-candle/2.jpg"
    assert images[1].is_primary is False

    sync_seed_product_images(product, product.name, product.slug)

    assert len(product.images) == 2
