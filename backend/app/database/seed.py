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
        "name": "Flower Candles",
        "slug": "flower-candles",
        "description": "Hand-poured floral candles for bright, thoughtful gifting.",
        "image_url": "/assets/astraya/products/daisy-fragrance-candle/colour-detail.jpg",
        "display_order": 1,
    },
    {
        "name": "T-light Candles",
        "slug": "t-light-candles",
        "description": "Small decorative T-lights for celebrations, tables, and gifting.",
        "image_url": "/assets/astraya/products/pink-heart-t-light-candle/heart-detail.jpg",
        "display_order": 2,
    },
    {
        "name": "Acrylic Jar Candles",
        "slug": "acrylic-jar-candles",
        "description": "Mini acrylic jar candles with colourful hand-finished details.",
        "image_url": "/assets/astraya/products/two-inch-mini-acrylic-jar-candle/available-designs.jpg",
        "display_order": 3,
    },
    {
        "name": "Sweet Candles",
        "slug": "sweet-candles",
        "description": "Playful dessert-inspired candle boxes for festive gifting.",
        "image_url": "/assets/astraya/products/motichoor-laddu-candle/four-piece-detail.jpg",
        "display_order": 4,
    },
    {
        "name": "Sculptural Candles",
        "slug": "sculptural-candles",
        "description": "Modern statement candles in playful, gift-ready forms.",
        "image_url": "/assets/astraya/products/pastel-bubble-cube-candle/box.jpg",
        "display_order": 5,
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
        "category_slug": "signature-collection",
        "name": "HeartGlow Gel-Soy Mini Jar Candle",
        "slug": "heartglow-gel-soy-mini-jar-candle",
        "sku": "AST-HEARTGLOW-MINI",
        "short_description": "A playful gel-soy mini candle with hand-finished wax hearts.",
        "description": "HeartGlow pairs a clear mini jar with creamy soy wax, jewel-toned gel details, and hand-shaped hearts. Choose the wax colour and top finish to create a small-batch candle made for gifting, tablescapes, and warm everyday moments.",
        "price": Decimal("899.00"),
        "discount_price": Decimal("799.00"),
        "stock_quantity": 42,
        "burn_time_minutes": 1320,
        "wax_type": "Gel-soy wax blend",
        "fragrance": "Rose nectar, lychee, soft vanilla",
        "ingredients": "Soy wax, candle gel, cotton wick, phthalate-free fragrance oil",
        "weight_grams": 120,
        "dimensions": "6.5 cm x 7 cm",
        "is_featured": True,
        "is_best_seller": True,
        "image_count": 8,
    },
    {
        "category_slug": "t-light-candles",
        "name": "Sage Green Star T-light Candle Box",
        "slug": "sage-green-star-t-light-candle-box",
        "sku": "AST-STAR-TLIGHT-SAGE-BOX",
        "short_description": "A gift-ready box of three sage-green star T-light candles.",
        "description": "A white window box containing three handmade sage-green star T-light candles, finished with green glitter accents. Each box is ready to gift or style as a small celestial detail.",
        "price": Decimal("150.00"),
        "discount_price": None,
        "stock_quantity": 2,
        "wax_type": "Wax blend",
        "fragrance": "Colour: Sage Green",
        "ingredients": "Wax, cotton wick, glitter accents",
        "is_featured": True,
        "is_best_seller": False,
        "image_specs": [
            {
                "image_url": "/assets/astraya/products/star-t-lights/sage-green-box.jpg",
                "alt_text": "Sage green Star T-light candle box with three candles",
                "display_order": 0,
                "is_primary": True,
            },
            {
                "image_url": "/assets/astraya/products/star-t-lights/sage-green-single.jpg",
                "alt_text": "Single sage green Star T-light candle",
                "display_order": 1,
                "is_primary": False,
            },
        ],
    },
    {
        "category_slug": "t-light-candles",
        "name": "Sky Blue Star T-light Candle Box",
        "slug": "sky-blue-star-t-light-candle-box",
        "sku": "AST-STAR-TLIGHT-SKYBLUE-BOX",
        "short_description": "A gift-ready box of three sky-blue star T-light candles.",
        "description": "A white window box containing three handmade sky-blue star T-light candles, finished with blue glitter accents. Each box is ready to gift or style as a small celestial detail.",
        "price": Decimal("150.00"),
        "discount_price": None,
        "stock_quantity": 2,
        "wax_type": "Wax blend",
        "fragrance": "Colour: Sky Blue",
        "ingredients": "Wax, cotton wick, glitter accents",
        "is_featured": True,
        "is_best_seller": False,
        "image_specs": [
            {
                "image_url": "/assets/astraya/products/star-t-lights/skyblue-box.jpg",
                "alt_text": "Sky-blue Star T-light candle box with three candles",
                "display_order": 0,
                "is_primary": True,
            },
            {
                "image_url": "/assets/astraya/products/star-t-lights/skyblue-single.jpg",
                "alt_text": "Single sky-blue Star T-light candle",
                "display_order": 1,
                "is_primary": False,
            },
        ],
    },
    {
        "category_slug": "t-light-candles",
        "name": "Assorted Butterfly T-light Candle Box",
        "slug": "assorted-butterfly-t-light-candle-box",
        "sku": "AST-BUTTERFLY-TLIGHT-ASSORTED-BOX",
        "short_description": "A gift-ready box of four glitter-finished butterfly T-light candles.",
        "description": "A white window box containing four handmade butterfly-shaped T-light candles in assorted lavender, orange, mint, and yellow colours. Each four-piece box comes in clear butterfly holders with glitter accents and is ready for gifting or colourful table styling.",
        "price": Decimal("150.00"),
        "discount_price": None,
        "stock_quantity": 10,
        "wax_type": "Wax blend",
        "fragrance": "Assorted colours",
        "ingredients": "Wax, cotton wick, clear butterfly holder, glitter accents",
        "is_featured": True,
        "is_best_seller": False,
        "image_specs": [
            {
                "image_url": "/assets/astraya/products/assorted-butterfly-t-light-candle-box/box.jpg",
                "alt_text": "Assorted Butterfly T-light Candle Box with four candles",
                "display_order": 0,
                "is_primary": True,
            },
            {
                "image_url": "/assets/astraya/products/assorted-butterfly-t-light-candle-box/colour-grid.jpg",
                "alt_text": "Lavender, orange, mint, and yellow butterfly T-light candles",
                "display_order": 1,
                "is_primary": False,
            },
            {
                "image_url": "/assets/astraya/products/assorted-butterfly-t-light-candle-box/collection.jpg",
                "alt_text": "Assorted glitter butterfly T-light candle collection",
                "display_order": 2,
                "is_primary": False,
            },
        ],
    },
    {
        "category_slug": "t-light-candles",
        "name": "Floral Round T-light Candle Box",
        "slug": "floral-round-t-light-candle-box",
        "sku": "AST-FLORAL-ROUND-TLIGHT-BOX",
        "short_description": "A gift-ready box of ten round T-light candles with mini floral details.",
        "description": "A white window box containing ten handmade round T-light candles in green and golden-orange wax, each finished with a colourful mini flower detail. This ten-piece box is designed for gifting, festive decor, and bright table settings.",
        "price": Decimal("200.00"),
        "discount_price": None,
        "stock_quantity": 10,
        "wax_type": "Wax blend",
        "fragrance": "Assorted colours",
        "ingredients": "Wax, cotton wick, round T-light cup, mini wax flower decoration",
        "is_featured": True,
        "is_best_seller": False,
        "image_specs": [
            {
                "image_url": "/assets/astraya/products/floral-round-t-light-candle-box/box.jpg",
                "alt_text": "Floral Round T-light Candle Box with ten candles",
                "display_order": 0,
                "is_primary": True,
            },
            {
                "image_url": "/assets/astraya/products/floral-round-t-light-candle-box/styled-collection.jpg",
                "alt_text": "Green and golden-orange round T-light candles with mini flowers",
                "display_order": 1,
                "is_primary": False,
            },
        ],
    },
    {
        "category_slug": "sweet-candles",
        "name": "Motichoor Laddu Candle Box",
        "slug": "motichoor-laddu-candle-box",
        "sku": "AST-MOTICHOOR-LADDU-BOX",
        "short_description": "A festive pink box of four Motichoor Laddu-shaped candles.",
        "description": "A festive pink box holding four Motichoor Laddu-inspired wax candles, each finished with a cotton wick and silver foil-style accents. This four-piece box is handmade for gifting and celebrations.",
        "price": Decimal("180.00"),
        "discount_price": Decimal("150.00"),
        "stock_quantity": 2,
        "wax_type": "Wax blend",
        "fragrance": "Motichoor Laddu-inspired",
        "ingredients": "Wax, cotton wick, silver foil-style decorative accents",
        "is_featured": True,
        "is_best_seller": False,
        "image_specs": [
            {
                "image_url": "/assets/astraya/products/motichoor-laddu-candle/box.jpg",
                "alt_text": "Motichoor Laddu candle box with four candles",
                "display_order": 0,
                "is_primary": True,
            },
            {
                "image_url": "/assets/astraya/products/motichoor-laddu-candle/four-piece-detail.jpg",
                "alt_text": "Four Motichoor Laddu-shaped candles",
                "display_order": 1,
                "is_primary": False,
            },
        ],
    },
    {
        "category_slug": "flower-candles",
        "name": "Rose Fragrance Candle Box",
        "slug": "rose-fragrance-candle-box",
        "sku": "AST-ROSE-FRAGRANCE-BOX",
        "short_description": "A white window box of three rose-fragrance candles.",
        "description": "A white window box holding three hand-poured rose-fragrance wax candles in soft pink and peach tones. This three-piece box is handmade for gifting and celebrations.",
        "price": Decimal("180.00"),
        "discount_price": Decimal("150.00"),
        "stock_quantity": 1,
        "wax_type": "Wax blend",
        "fragrance": "Rose",
        "ingredients": "Wax, cotton wick, rose fragrance oil",
        "is_featured": True,
        "is_best_seller": False,
        "image_specs": [
            {
                "image_url": "/assets/astraya/products/rose-fragrance-candle/box.jpg",
                "alt_text": "Rose Fragrance Candle Box with three rose candles",
                "display_order": 0,
                "is_primary": True,
            },
            {
                "image_url": "/assets/astraya/products/rose-fragrance-candle/three-piece-detail.jpg",
                "alt_text": "Three Rose Fragrance candles in pink and peach",
                "display_order": 1,
                "is_primary": False,
            },
        ],
    },
    {
        "category_slug": "sculptural-candles",
        "name": "Pastel Bubble Cube Candle Box",
        "slug": "pastel-bubble-cube-candle-box",
        "sku": "AST-PASTEL-BUBBLE-CUBE-BOX",
        "short_description": "A bright pink gift box of four pastel bubble-cube candles.",
        "description": "A bright pink box holding four hand-poured pastel bubble-cube candles in orange, yellow, pink, and mint green. This four-piece box is handmade for gifting and celebrations.",
        "price": Decimal("240.00"),
        "discount_price": Decimal("200.00"),
        "stock_quantity": 1,
        "wax_type": "Wax blend",
        "fragrance": "Pastel colour assortment",
        "ingredients": "Wax, cotton wick",
        "is_featured": True,
        "is_best_seller": False,
        "image_specs": [
            {
                "image_url": "/assets/astraya/products/pastel-bubble-cube-candle/box.jpg",
                "alt_text": "Pastel Bubble Cube Candle Box with four candles",
                "display_order": 0,
                "is_primary": True,
            },
            {
                "image_url": "/assets/astraya/products/pastel-bubble-cube-candle/colour-detail.jpg",
                "alt_text": "Pink and blue Pastel Bubble Cube candles",
                "display_order": 1,
                "is_primary": False,
            },
        ],
    },
    {
        "category_slug": "flower-candles",
        "name": "Daisy Fragrance Candle Box",
        "slug": "daisy-fragrance-candle-box",
        "sku": "AST-DAISY-FRAGRANCE-BOX",
        "short_description": "A white window box of three colourful daisy fragrance candles.",
        "description": "A white window box holding three hand-poured daisy-shaped candles in orange, green, and pink. This three-piece scented box is handmade for gifting and celebrations.",
        "price": Decimal("180.00"),
        "discount_price": Decimal("150.00"),
        "stock_quantity": 3,
        "wax_type": "Soy wax",
        "fragrance": "Daisy fragrance",
        "ingredients": "Soy wax, cotton wick, fragrance oil",
        "is_featured": True,
        "is_best_seller": False,
        "image_specs": [
            {
                "image_url": "/assets/astraya/products/daisy-fragrance-candle/box.jpg",
                "alt_text": "Daisy Fragrance Candle Box with three colourful candles",
                "display_order": 0,
                "is_primary": True,
            },
            {
                "image_url": "/assets/astraya/products/daisy-fragrance-candle/colour-detail.jpg",
                "alt_text": "Colourful Daisy Fragrance candle assortment",
                "display_order": 1,
                "is_primary": False,
            },
        ],
    },
    {
        "category_slug": "acrylic-jar-candles",
        "name": "1-Inch Mini Acrylic Jar Candle Box with Mini Flowers",
        "slug": "mini-acrylic-jar-candle-box",
        "sku": "AST-MINI-ACRYLIC-JAR-FLOWER-BOX",
        "short_description": "A white window box of three 1-inch mini acrylic jar candles with tiny flower decorations.",
        "description": "A white window box holding three 1-inch mini acrylic jar candles filled with white wax and finished with tiny peach and purple flower decorations. This three-piece fragranced box is handmade for gifting and celebrations.",
        "price": Decimal("180.00"),
        "discount_price": Decimal("150.00"),
        "stock_quantity": 3,
        "wax_type": "Wax blend",
        "fragrance": "Fragranced",
        "ingredients": "Wax, cotton wick, mini wax flower decorations, fragrance oil",
        "dimensions": "1 inch height",
        "is_featured": True,
        "is_best_seller": False,
        "image_specs": [
            {
                "image_url": "/assets/astraya/products/mini-acrylic-jar-candle/box.jpg",
                "alt_text": "1-Inch Mini Acrylic Jar Candle Box with three jars",
                "display_order": 0,
                "is_primary": True,
            },
            {
                "image_url": "/assets/astraya/products/mini-acrylic-jar-candle/jar-detail.jpg",
                "alt_text": "Mini Acrylic Jar Candle with peach and purple mini flowers",
                "display_order": 1,
                "is_primary": False,
            },
        ],
    },
    {
        "category_slug": "t-light-candles",
        "name": "Pink Heart T-light Candle Box",
        "slug": "pink-heart-t-light-candle-box",
        "sku": "AST-PINK-HEART-TLIGHT-BOX",
        "short_description": "A white window box of ten pink heart T-light candles.",
        "description": "A white window box containing ten handmade pink heart-shaped T-light candles in clear heart cups. This ten-piece box is made for gifting, celebrations, and romantic table settings.",
        "price": Decimal("264.00"),
        "discount_price": Decimal("220.00"),
        "stock_quantity": 3,
        "wax_type": "Wax blend",
        "fragrance": "Colour: Pink",
        "ingredients": "Wax, cotton wick, clear heart cup",
        "is_featured": True,
        "is_best_seller": False,
        "image_specs": [
            {
                "image_url": "/assets/astraya/products/pink-heart-t-light-candle/box.jpg",
                "alt_text": "Pink Heart T-light Candle Box with ten candles",
                "display_order": 0,
                "is_primary": True,
            },
            {
                "image_url": "/assets/astraya/products/pink-heart-t-light-candle/heart-detail.jpg",
                "alt_text": "Two pink heart T-light candles in clear cups",
                "display_order": 1,
                "is_primary": False,
            },
        ],
    },
    {
        "category_slug": "acrylic-jar-candles",
        "name": "2-Inch Mini Acrylic Jar Candle Assorted Pair Box",
        "slug": "two-inch-mini-acrylic-jar-candle-assorted-pair-box",
        "sku": "AST-2IN-MINI-ACRYLIC-JAR-PAIR",
        "short_description": "A two-piece box of 2-inch mini acrylic jar candles, assorted by availability.",
        "description": "A gift-ready box of two 2-inch mini acrylic jar candles selected from the available colourful flower, heart, rose, butterfly, and glitter designs. Each box contains any two available designs; the exact pair is chosen at packing time.",
        "price": Decimal("180.00"),
        "discount_price": Decimal("150.00"),
        "stock_quantity": 3,
        "wax_type": "Wax blend",
        "fragrance": "Assorted fragranced designs",
        "ingredients": "Wax, cotton wick, acrylic jar, wax decorations, fragrance oil",
        "dimensions": "2 inch height",
        "is_featured": True,
        "is_best_seller": False,
        "image_specs": [
            {
                "image_url": "/assets/astraya/products/two-inch-mini-acrylic-jar-candle/box.jpg",
                "alt_text": "2-Inch Mini Acrylic Jar Candle Assorted Pair Box",
                "display_order": 0,
                "is_primary": True,
            },
            {
                "image_url": "/assets/astraya/products/two-inch-mini-acrylic-jar-candle/available-designs.jpg",
                "alt_text": "Available designs for the 2-Inch Mini Acrylic Jar Candle pair",
                "display_order": 1,
                "is_primary": False,
            },
        ],
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


def sync_seed_product_images(
    product: Product,
    product_name: str,
    product_slug: str,
    image_count: int = 2,
    image_specs: list[dict[str, object]] | None = None,
) -> None:
    images = sorted(product.images, key=lambda image: image.display_order)
    if image_specs is None:
        image_specs = [
            {
                "image_url": f"{product_slug}/{image_index}.jpg",
                "alt_text": (
                    f"{product_name} product image"
                    if image_index == 1
                    else f"{product_name} colour view {image_index}"
                ),
                "display_order": image_index - 1,
                "is_primary": image_index == 1,
            }
            for image_index in range(1, image_count + 1)
        ]

    for image in images:
        image.is_primary = False

    for index, image_spec in enumerate(image_specs):
        if index < len(images):
            image = images[index]
            for field, value in image_spec.items():
                setattr(image, field, value)
        else:
            product.images.append(ProductImage(**image_spec))


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
    active_payloads = [
        payload
        for payload in SEED_PRODUCTS
        if payload["category_slug"] in categories
    ]
    for index, payload in enumerate(active_payloads, start=1):
        product_data = payload.copy()
        category_slug = str(product_data.pop("category_slug"))
        image_count = int(product_data.pop("image_count", 2))
        image_specs = product_data.pop("image_specs", None)
        product = db.scalar(select(Product).where(Product.slug == product_data["slug"]))
        if product:
            # Admin-managed catalog values must survive application restarts.
            continue

        product = Product(category_id=categories[category_slug].id, **product_data)
        sync_seed_product_images(
            product,
            str(product_data["name"]),
            str(product_data["slug"]),
            image_count,
            image_specs,
        )
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
