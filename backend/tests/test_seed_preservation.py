from decimal import Decimal

from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from app.database.base import Base
from app.database.seed import seed_admin, seed_categories, seed_products
from app.models.category import Category
from app.models.product import Product
from app.models.product_image import ProductImage


def test_repeated_seed_preserves_admin_catalog_and_inventory():
    engine = create_engine('sqlite://')
    Base.metadata.create_all(engine)
    with Session(engine) as db:
        admin = seed_admin(db)
        categories = seed_categories(db)
        seed_products(db, categories, admin)
        db.commit()
        product = db.scalar(select(Product).limit(1))
        product.name = 'Owner edited name'
        product.price = Decimal('123.00')
        product.stock_quantity = 7
        product.is_active = False
        product.images = [ProductImage(image_url='https://example.com/owner.jpg', alt_text='Owner photo', display_order=0, is_primary=True)]
        category = next(iter(categories.values()))
        category.name = 'Owner collection'
        category.is_active = False
        custom_category = Category(name='Custom', slug='custom', is_active=True)
        db.add(custom_category)
        db.flush()
        custom = Product(category_id=custom_category.id, name='Custom product', slug='custom-product', sku='CUSTOM', short_description='Custom', description='Custom', price=Decimal('150'), stock_quantity=10, is_active=True)
        db.add(custom)
        db.commit()
        product_id, category_id, custom_id = product.id, category.id, custom.id
        count_before = len(list(db.scalars(select(Product))))
        seed_products(db, seed_categories(db), admin)
        db.commit()
        db.expire_all()
        saved = db.get(Product, product_id)
        assert (saved.name, saved.price, saved.stock_quantity, saved.is_active) == ('Owner edited name', Decimal('123'), 7, False)
        assert [i.image_url for i in saved.images] == ['https://example.com/owner.jpg']
        assert db.get(Category, category_id).name == 'Owner collection'
        assert db.get(Category, category_id).is_active is False
        assert db.get(Product, custom_id).is_active is True
        assert db.get(Category, custom_category.id).is_active is True
        assert len(list(db.scalars(select(Product)))) == count_before
    engine.dispose()
