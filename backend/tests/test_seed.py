from decimal import Decimal

from app.database.seed import SEED_CATEGORIES, SEED_PRODUCTS, sync_seed_product_images
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


def test_current_catalog_seed_uses_only_active_product_categories_and_sale_prices() -> None:
    category_slugs = {category["slug"] for category in SEED_CATEGORIES}
    products = [
        product
        for product in SEED_PRODUCTS
        if product["category_slug"] in category_slugs
    ]

    assert category_slugs == {
        "flower-candles",
        "t-light-candles",
        "acrylic-jar-candles",
        "sweet-candles",
        "sculptural-candles",
    }
    assert {product["slug"] for product in products} == {
        "sage-green-star-t-light-candle-box",
        "sky-blue-star-t-light-candle-box",
        "assorted-butterfly-t-light-candle-box",
        "floral-round-t-light-candle-box",
        "motichoor-laddu-candle-box",
        "rose-fragrance-candle-box",
        "pastel-bubble-cube-candle-box",
        "daisy-fragrance-candle-box",
        "mini-acrylic-jar-candle-box",
        "pink-heart-t-light-candle-box",
        "two-inch-mini-acrylic-jar-candle-assorted-pair-box",
    }
    no_discount_prices = {
        "sage-green-star-t-light-candle-box": Decimal("150.00"),
        "sky-blue-star-t-light-candle-box": Decimal("150.00"),
        "assorted-butterfly-t-light-candle-box": Decimal("150.00"),
        "floral-round-t-light-candle-box": Decimal("200.00"),
    }
    assert all(
        product["price"] == product["discount_price"] * Decimal("1.20")
        if product["discount_price"] is not None
        else product["price"] == no_discount_prices[product["slug"]]
        for product in products
    )

    assorted_pair = next(
        product
        for product in products
        if product["slug"] == "two-inch-mini-acrylic-jar-candle-assorted-pair-box"
    )
    assert assorted_pair["stock_quantity"] == 3
    assert "any two available designs" in assorted_pair["description"]


def test_t_light_box_prices_quantities_and_images() -> None:
    products = {product["slug"]: product for product in SEED_PRODUCTS}

    for slug in (
        "sage-green-star-t-light-candle-box",
        "sky-blue-star-t-light-candle-box",
        "assorted-butterfly-t-light-candle-box",
    ):
        assert products[slug]["price"] == Decimal("150.00")
        assert products[slug]["discount_price"] is None

    butterfly = products["assorted-butterfly-t-light-candle-box"]
    assert butterfly["stock_quantity"] == 10
    assert "four" in butterfly["short_description"].lower()
    assert len(butterfly["image_specs"]) == 3

    round_t_lights = products["floral-round-t-light-candle-box"]
    assert round_t_lights["price"] == Decimal("200.00")
    assert round_t_lights["discount_price"] is None
    assert round_t_lights["stock_quantity"] == 10
    assert "ten" in round_t_lights["short_description"].lower()
    assert len(round_t_lights["image_specs"]) == 2
