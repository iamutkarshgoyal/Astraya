from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import get_password_hash
from app.database.session import SessionLocal
from app.models.category import Category
from app.models.product import Product
from app.models.product_image import ProductImage
from app.models.review import Review
from app.models.user import User


SEED_CATEGORIES = [
    {
        "name": "Luxury Collection",
        "slug": "luxury-collection",
        "description": "Polished glass jars, layered fragrances, and gift-ready finishes.",
        "image_url": "/images/categories/luxury-collection.png",
        "display_order": 1,
    },
    {
        "name": "Festive Collection",
        "slug": "festive-collection",
        "description": "Warm celebration scents designed for gifting and gatherings.",
        "image_url": "/images/categories/festive-collection.png",
        "display_order": 2,
    },
    {
        "name": "Wedding Collection",
        "slug": "wedding-collection",
        "description": "Elegant favors and ceremony candles for intimate celebrations.",
        "image_url": "/images/categories/wedding-collection.png",
        "display_order": 3,
    },
    {
        "name": "Gift Boxes",
        "slug": "gift-boxes",
        "description": "Curated candle sets wrapped for effortless premium gifting.",
        "image_url": "/images/categories/gift-boxes.png",
        "display_order": 4,
    },
    {
        "name": "Aromatherapy",
        "slug": "aromatherapy",
        "description": "Clean, calming blends for rituals, rest, and quiet evenings.",
        "image_url": "/images/categories/aromatherapy.png",
        "display_order": 5,
    },
    {
        "name": "Signature Collection",
        "slug": "signature-collection",
        "description": "Astraya's core celestial scents for everyday luxury.",
        "image_url": "/images/categories/signature-collection.png",
        "display_order": 6,
    },
]


SEED_PRODUCTS = [
    {
        "category_slug": "signature-collection",
        "name": "Lunar Bloom Soy Candle",
        "slug": "lunar-bloom-soy-candle",
        "sku": "AST-LUNAR-BLOOM",
        "short_description": "A soft jasmine, sandalwood, and moonflower blend in ivory wax.",
        "description": "Lunar Bloom is poured for slow evenings and quiet rituals. The fragrance opens with moonflower and jasmine, settles into creamy sandalwood, and finishes with a soft vanilla warmth.",
        "price": Decimal("1299.00"),
        "discount_price": Decimal("1099.00"),
        "stock_quantity": 36,
        "burn_time_minutes": 2520,
        "wax_type": "Soy wax",
        "fragrance": "Moonflower, jasmine, sandalwood",
        "ingredients": "Soy wax, cotton wick, phthalate-free fragrance oil",
        "weight_grams": 220,
        "dimensions": "8 cm x 9 cm",
        "is_featured": True,
        "is_best_seller": True,
    },
    {
        "category_slug": "luxury-collection",
        "name": "Celestial Oud Jar Candle",
        "slug": "celestial-oud-jar-candle",
        "sku": "AST-CELESTIAL-OUD",
        "short_description": "Deep oud, amber, and saffron in a premium navy glass jar.",
        "description": "Celestial Oud is a richly layered luxury candle with amber resin, polished oud, and a measured saffron top note. It is designed for dinner settings, gifting, and dramatic interiors.",
        "price": Decimal("1899.00"),
        "discount_price": None,
        "stock_quantity": 24,
        "burn_time_minutes": 3000,
        "wax_type": "Coconut soy wax",
        "fragrance": "Oud, amber, saffron",
        "ingredients": "Coconut soy wax, wooden wick, premium fragrance oil",
        "weight_grams": 260,
        "dimensions": "8.5 cm x 10 cm",
        "is_featured": True,
        "is_best_seller": False,
    },
    {
        "category_slug": "festive-collection",
        "name": "Solstice Spice Candle",
        "slug": "solstice-spice-candle",
        "sku": "AST-SOLSTICE-SPICE",
        "short_description": "Cardamom, clove, orange peel, and golden amber for celebrations.",
        "description": "Solstice Spice brings a festive glow without overpowering the room. Citrus lifts the opening, cardamom and clove add warmth, and amber keeps the finish refined.",
        "price": Decimal("1499.00"),
        "discount_price": Decimal("1299.00"),
        "stock_quantity": 30,
        "burn_time_minutes": 2700,
        "wax_type": "Soy wax",
        "fragrance": "Cardamom, clove, orange peel",
        "ingredients": "Soy wax, cotton wick, essential and fragrance oil blend",
        "weight_grams": 240,
        "dimensions": "8 cm x 9.5 cm",
        "is_featured": True,
        "is_best_seller": True,
    },
    {
        "category_slug": "wedding-collection",
        "name": "Eternal Vow Candle Pair",
        "slug": "eternal-vow-candle-pair",
        "sku": "AST-ETERNAL-VOW",
        "short_description": "A pair of pearl-toned candles with rose, musk, and white tea.",
        "description": "Eternal Vow is designed for ceremony tables, proposal setups, and premium wedding favors. The pair pairs rose petals with white tea and a clean musk finish.",
        "price": Decimal("2199.00"),
        "discount_price": Decimal("1999.00"),
        "stock_quantity": 18,
        "burn_time_minutes": 2400,
        "wax_type": "Soy beeswax blend",
        "fragrance": "Rose, white tea, soft musk",
        "ingredients": "Soy wax, beeswax, cotton wick, fine fragrance oil",
        "weight_grams": 300,
        "dimensions": "Pair of 7 cm x 8 cm",
        "is_featured": False,
        "is_best_seller": False,
    },
    {
        "category_slug": "gift-boxes",
        "name": "Astral Gift Box",
        "slug": "astral-gift-box",
        "sku": "AST-ASTRAL-GIFT",
        "short_description": "Three mini candles with complementary celestial fragrances.",
        "description": "Astral Gift Box includes three refined mini candles: Lunar Bloom, Solstice Spice, and Quiet Nebula. It is wrapped for birthdays, thank-you gestures, and festive gifting.",
        "price": Decimal("2499.00"),
        "discount_price": None,
        "stock_quantity": 20,
        "burn_time_minutes": 3600,
        "wax_type": "Soy wax",
        "fragrance": "Assorted celestial fragrance trio",
        "ingredients": "Soy wax, cotton wick, phthalate-free fragrance oils",
        "weight_grams": 360,
        "dimensions": "24 cm x 12 cm x 8 cm",
        "is_featured": True,
        "is_best_seller": True,
    },
    {
        "category_slug": "aromatherapy",
        "name": "Quiet Nebula Aromatherapy Candle",
        "slug": "quiet-nebula-aromatherapy-candle",
        "sku": "AST-QUIET-NEBULA",
        "short_description": "Lavender, cedar, and vetiver for calm night rituals.",
        "description": "Quiet Nebula is blended for decompression after long days. Lavender softens the room, cedar adds grounding depth, and vetiver gives the finish a clean mineral calm.",
        "price": Decimal("1399.00"),
        "discount_price": Decimal("1199.00"),
        "stock_quantity": 28,
        "burn_time_minutes": 2580,
        "wax_type": "Soy wax",
        "fragrance": "Lavender, cedar, vetiver",
        "ingredients": "Soy wax, cotton wick, essential oil blend",
        "weight_grams": 220,
        "dimensions": "8 cm x 9 cm",
        "is_featured": False,
        "is_best_seller": True,
    },
]


REVIEW_COPY = [
    ("Gift-ready and elegant", "The fragrance feels premium without being heavy. The packaging looked beautiful on arrival.", 5),
    ("Burns very clean", "The wax pool was even and the scent stayed soft through the evening.", 5),
    ("A lovely ritual candle", "It makes my desk and evening reading corner feel calm and polished.", 4),
]


def seed_admin(db: Session) -> User:
    admin = db.scalar(select(User).where(User.email == settings.admin_email.lower()))
    if admin:
        admin.role = "admin"
        return admin

    admin = User(
        email=settings.admin_email.lower(),
        full_name="Astraya Admin",
        hashed_password=get_password_hash(settings.admin_password),
        role="admin",
        is_active=True,
        is_verified=True,
    )
    db.add(admin)
    db.flush()
    return admin


def seed_categories(db: Session) -> dict[str, Category]:
    categories: dict[str, Category] = {}
    for payload in SEED_CATEGORIES:
        category = db.scalar(select(Category).where(Category.slug == payload["slug"]))
        if not category:
            category = Category(**payload)
            db.add(category)
            db.flush()
        categories[category.slug] = category
    return categories


def seed_products(db: Session, categories: dict[str, Category], admin: User) -> None:
    for index, payload in enumerate(SEED_PRODUCTS, start=1):
        product_data = payload.copy()
        category_slug = str(product_data.pop("category_slug"))
        product = db.scalar(select(Product).where(Product.slug == product_data["slug"]))
        if product:
            continue

        product = Product(category_id=categories[category_slug].id, **product_data)
        product.images = [
            ProductImage(
                image_url=f"/images/products/{product_data['slug']}.png",
                alt_text=f"{product_data['name']} product image",
                display_order=0,
                is_primary=True,
            ),
            ProductImage(
                image_url=f"/images/products/{product_data['slug']}-detail.png",
                alt_text=f"{product_data['name']} detail image",
                display_order=1,
                is_primary=False,
            ),
        ]
        db.add(product)
        db.flush()

        review_title, review_comment, rating = REVIEW_COPY[(index - 1) % len(REVIEW_COPY)]
        db.add(
            Review(
                product_id=product.id,
                user_id=admin.id,
                rating=rating,
                title=review_title,
                comment=review_comment,
                is_approved=True,
            )
        )


def run_seed() -> None:
    db = SessionLocal()
    try:
        admin = seed_admin(db)
        categories = seed_categories(db)
        seed_products(db, categories, admin)
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
