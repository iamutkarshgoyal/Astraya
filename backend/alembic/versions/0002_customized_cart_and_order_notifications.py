"""persist customized candles and notification delivery state

Revision ID: 0002_customized_cart
Revises: 0001_initial_schema
Create Date: 2026-07-31 00:00:00.000000
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "0002_customized_cart"
down_revision: str | None = "0001_initial_schema"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "cart_items",
        sa.Column(
            "variant_key",
            sa.String(length=80),
            server_default="standard",
            nullable=False,
        ),
    )
    op.add_column("cart_items", sa.Column("customization", sa.JSON(), nullable=True))
    op.add_column("cart_items", sa.Column("preview_image", sa.Text(), nullable=True))
    op.drop_constraint(
        "uq_cart_items_user_product",
        "cart_items",
        type_="unique",
    )
    op.create_unique_constraint(
        "uq_cart_items_user_product_variant",
        "cart_items",
        ["user_id", "product_id", "variant_key"],
    )

    op.add_column("order_items", sa.Column("customization", sa.JSON(), nullable=True))
    op.add_column("order_items", sa.Column("preview_image", sa.Text(), nullable=True))
    op.add_column(
        "orders",
        sa.Column(
            "email_notification_status",
            sa.String(length=40),
            server_default="not_attempted",
            nullable=False,
        ),
    )
    op.add_column(
        "orders",
        sa.Column(
            "whatsapp_notification_status",
            sa.String(length=40),
            server_default="not_attempted",
            nullable=False,
        ),
    )
    op.add_column("orders", sa.Column("notification_error", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("orders", "notification_error")
    op.drop_column("orders", "whatsapp_notification_status")
    op.drop_column("orders", "email_notification_status")
    op.drop_column("order_items", "preview_image")
    op.drop_column("order_items", "customization")

    op.drop_constraint(
        "uq_cart_items_user_product_variant",
        "cart_items",
        type_="unique",
    )
    op.create_unique_constraint(
        "uq_cart_items_user_product",
        "cart_items",
        ["user_id", "product_id"],
    )
    op.drop_column("cart_items", "preview_image")
    op.drop_column("cart_items", "customization")
    op.drop_column("cart_items", "variant_key")
