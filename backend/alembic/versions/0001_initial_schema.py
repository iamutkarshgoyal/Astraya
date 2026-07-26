"""initial Astraya schema

Revision ID: 0001_initial_schema
Revises:
Create Date: 2026-07-26 00:00:00.000000
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "0001_initial_schema"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "categories",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("slug", sa.String(length=140), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("image_url", sa.String(length=500), nullable=True),
        sa.Column("display_order", sa.Integer(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_categories")),
        sa.UniqueConstraint("name", name=op.f("uq_categories_name")),
        sa.UniqueConstraint("slug", name=op.f("uq_categories_slug")),
    )
    op.create_index(op.f("ix_categories_id"), "categories", ["id"], unique=False)
    op.create_index(op.f("ix_categories_name"), "categories", ["name"], unique=False)
    op.create_index(op.f("ix_categories_slug"), "categories", ["slug"], unique=False)

    op.create_table(
        "contact_messages",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=150), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("phone", sa.String(length=30), nullable=True),
        sa.Column("subject", sa.String(length=180), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("is_read", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_contact_messages")),
    )
    op.create_index(op.f("ix_contact_messages_email"), "contact_messages", ["email"], unique=False)
    op.create_index(op.f("ix_contact_messages_id"), "contact_messages", ["id"], unique=False)

    op.create_table(
        "newsletter",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_newsletter")),
        sa.UniqueConstraint("email", name=op.f("uq_newsletter_email")),
    )
    op.create_index(op.f("ix_newsletter_email"), "newsletter", ["email"], unique=False)
    op.create_index(op.f("ix_newsletter_id"), "newsletter", ["id"], unique=False)

    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("full_name", sa.String(length=150), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=True),
        sa.Column("google_sub", sa.String(length=255), nullable=True),
        sa.Column("phone", sa.String(length=30), nullable=True),
        sa.Column("role", sa.String(length=30), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("is_verified", sa.Boolean(), nullable=False),
        sa.Column("password_reset_token_hash", sa.String(length=255), nullable=True),
        sa.Column("password_reset_expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_users")),
        sa.UniqueConstraint("email", name=op.f("uq_users_email")),
        sa.UniqueConstraint("google_sub", name=op.f("uq_users_google_sub")),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=False)
    op.create_index(op.f("ix_users_google_sub"), "users", ["google_sub"], unique=False)
    op.create_index(op.f("ix_users_id"), "users", ["id"], unique=False)

    op.create_table(
        "products",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("category_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=180), nullable=False),
        sa.Column("slug", sa.String(length=220), nullable=False),
        sa.Column("sku", sa.String(length=80), nullable=False),
        sa.Column("short_description", sa.String(length=300), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("price", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column("discount_price", sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column("stock_quantity", sa.Integer(), nullable=False),
        sa.Column("burn_time_minutes", sa.Integer(), nullable=True),
        sa.Column("wax_type", sa.String(length=120), nullable=True),
        sa.Column("fragrance", sa.String(length=160), nullable=True),
        sa.Column("ingredients", sa.Text(), nullable=True),
        sa.Column("weight_grams", sa.Integer(), nullable=True),
        sa.Column("dimensions", sa.String(length=120), nullable=True),
        sa.Column("is_featured", sa.Boolean(), nullable=False),
        sa.Column("is_best_seller", sa.Boolean(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["category_id"], ["categories.id"], name=op.f("fk_products_category_id_categories")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_products")),
        sa.UniqueConstraint("sku", name=op.f("uq_products_sku")),
        sa.UniqueConstraint("slug", name=op.f("uq_products_slug")),
    )
    op.create_index(op.f("ix_products_id"), "products", ["id"], unique=False)
    op.create_index(op.f("ix_products_name"), "products", ["name"], unique=False)
    op.create_index(op.f("ix_products_sku"), "products", ["sku"], unique=False)
    op.create_index(op.f("ix_products_slug"), "products", ["slug"], unique=False)

    op.create_table(
        "orders",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("order_number", sa.String(length=40), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("customer_name", sa.String(length=150), nullable=False),
        sa.Column("phone", sa.String(length=30), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("address", sa.Text(), nullable=False),
        sa.Column("city", sa.String(length=100), nullable=False),
        sa.Column("state", sa.String(length=100), nullable=False),
        sa.Column("pincode", sa.String(length=20), nullable=False),
        sa.Column("special_instructions", sa.Text(), nullable=True),
        sa.Column("subtotal", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column("shipping_charge", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column("tax_amount", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column("discount_amount", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column("grand_total", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column("status", sa.String(length=40), nullable=False),
        sa.Column("whatsapp_message", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name=op.f("fk_orders_user_id_users")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_orders")),
        sa.UniqueConstraint("order_number", name=op.f("uq_orders_order_number")),
    )
    op.create_index(op.f("ix_orders_id"), "orders", ["id"], unique=False)
    op.create_index(op.f("ix_orders_order_number"), "orders", ["order_number"], unique=False)
    op.create_index(op.f("ix_orders_status"), "orders", ["status"], unique=False)
    op.create_index(op.f("ix_orders_user_id"), "orders", ["user_id"], unique=False)

    op.create_table(
        "product_images",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("image_url", sa.String(length=500), nullable=False),
        sa.Column("alt_text", sa.String(length=180), nullable=False),
        sa.Column("display_order", sa.Integer(), nullable=False),
        sa.Column("is_primary", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], name=op.f("fk_product_images_product_id_products"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_product_images")),
    )
    op.create_index(op.f("ix_product_images_id"), "product_images", ["id"], unique=False)
    op.create_index(op.f("ix_product_images_product_id"), "product_images", ["product_id"], unique=False)

    op.create_table(
        "reviews",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("rating", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=150), nullable=True),
        sa.Column("comment", sa.Text(), nullable=False),
        sa.Column("is_approved", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint("rating >= 1 AND rating <= 5", name=op.f("ck_reviews_rating_range")),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], name=op.f("fk_reviews_product_id_products"), ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name=op.f("fk_reviews_user_id_users"), ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_reviews")),
    )
    op.create_index(op.f("ix_reviews_id"), "reviews", ["id"], unique=False)
    op.create_index(op.f("ix_reviews_product_id"), "reviews", ["product_id"], unique=False)
    op.create_index(op.f("ix_reviews_user_id"), "reviews", ["user_id"], unique=False)

    op.create_table(
        "wishlist",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], name=op.f("fk_wishlist_product_id_products"), ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name=op.f("fk_wishlist_user_id_users"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_wishlist")),
        sa.UniqueConstraint("user_id", "product_id", name="uq_wishlist_user_product"),
    )
    op.create_index(op.f("ix_wishlist_id"), "wishlist", ["id"], unique=False)
    op.create_index(op.f("ix_wishlist_product_id"), "wishlist", ["product_id"], unique=False)
    op.create_index(op.f("ix_wishlist_user_id"), "wishlist", ["user_id"], unique=False)

    op.create_table(
        "cart_items",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], name=op.f("fk_cart_items_product_id_products"), ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name=op.f("fk_cart_items_user_id_users"), ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_cart_items")),
        sa.UniqueConstraint("user_id", "product_id", name="uq_cart_items_user_product"),
    )
    op.create_index(op.f("ix_cart_items_id"), "cart_items", ["id"], unique=False)
    op.create_index(op.f("ix_cart_items_product_id"), "cart_items", ["product_id"], unique=False)
    op.create_index(op.f("ix_cart_items_user_id"), "cart_items", ["user_id"], unique=False)

    op.create_table(
        "order_items",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("order_id", sa.Integer(), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=True),
        sa.Column("product_name", sa.String(length=180), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("unit_price", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column("line_total", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["order_id"], ["orders.id"], name=op.f("fk_order_items_order_id_orders"), ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], name=op.f("fk_order_items_product_id_products"), ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_order_items")),
    )
    op.create_index(op.f("ix_order_items_id"), "order_items", ["id"], unique=False)
    op.create_index(op.f("ix_order_items_order_id"), "order_items", ["order_id"], unique=False)
    op.create_index(op.f("ix_order_items_product_id"), "order_items", ["product_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_order_items_product_id"), table_name="order_items")
    op.drop_index(op.f("ix_order_items_order_id"), table_name="order_items")
    op.drop_index(op.f("ix_order_items_id"), table_name="order_items")
    op.drop_table("order_items")
    op.drop_index(op.f("ix_cart_items_user_id"), table_name="cart_items")
    op.drop_index(op.f("ix_cart_items_product_id"), table_name="cart_items")
    op.drop_index(op.f("ix_cart_items_id"), table_name="cart_items")
    op.drop_table("cart_items")
    op.drop_index(op.f("ix_wishlist_user_id"), table_name="wishlist")
    op.drop_index(op.f("ix_wishlist_product_id"), table_name="wishlist")
    op.drop_index(op.f("ix_wishlist_id"), table_name="wishlist")
    op.drop_table("wishlist")
    op.drop_index(op.f("ix_reviews_user_id"), table_name="reviews")
    op.drop_index(op.f("ix_reviews_product_id"), table_name="reviews")
    op.drop_index(op.f("ix_reviews_id"), table_name="reviews")
    op.drop_table("reviews")
    op.drop_index(op.f("ix_product_images_product_id"), table_name="product_images")
    op.drop_index(op.f("ix_product_images_id"), table_name="product_images")
    op.drop_table("product_images")
    op.drop_index(op.f("ix_orders_user_id"), table_name="orders")
    op.drop_index(op.f("ix_orders_status"), table_name="orders")
    op.drop_index(op.f("ix_orders_order_number"), table_name="orders")
    op.drop_index(op.f("ix_orders_id"), table_name="orders")
    op.drop_table("orders")
    op.drop_index(op.f("ix_products_slug"), table_name="products")
    op.drop_index(op.f("ix_products_sku"), table_name="products")
    op.drop_index(op.f("ix_products_name"), table_name="products")
    op.drop_index(op.f("ix_products_id"), table_name="products")
    op.drop_table("products")
    op.drop_index(op.f("ix_users_id"), table_name="users")
    op.drop_index(op.f("ix_users_google_sub"), table_name="users")
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")
    op.drop_index(op.f("ix_newsletter_id"), table_name="newsletter")
    op.drop_index(op.f("ix_newsletter_email"), table_name="newsletter")
    op.drop_table("newsletter")
    op.drop_index(op.f("ix_contact_messages_id"), table_name="contact_messages")
    op.drop_index(op.f("ix_contact_messages_email"), table_name="contact_messages")
    op.drop_table("contact_messages")
    op.drop_index(op.f("ix_categories_slug"), table_name="categories")
    op.drop_index(op.f("ix_categories_name"), table_name="categories")
    op.drop_index(op.f("ix_categories_id"), table_name="categories")
    op.drop_table("categories")
