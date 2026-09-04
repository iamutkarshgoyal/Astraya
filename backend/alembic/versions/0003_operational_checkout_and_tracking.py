"""add checkout payment, notification, and tracking fields

Revision ID: 0003_operational_checkout
Revises: 0002_customized_cart
Create Date: 2026-09-04
"""

from alembic import op
import sqlalchemy as sa


revision = "0003_operational_checkout"
down_revision = "0002_customized_cart"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "orders",
        sa.Column("cod_charge", sa.Numeric(10, 2), nullable=False, server_default="0"),
    )
    op.add_column(
        "orders",
        sa.Column("payment_method", sa.String(length=30), nullable=False, server_default="cod"),
    )
    op.add_column(
        "orders",
        sa.Column("payment_status", sa.String(length=30), nullable=False, server_default="cod_due"),
    )
    op.create_index("ix_orders_payment_status", "orders", ["payment_status"])
    op.add_column("orders", sa.Column("gateway_order_id", sa.String(length=120), nullable=True))
    op.create_unique_constraint("uq_orders_gateway_order_id", "orders", ["gateway_order_id"])
    op.add_column("orders", sa.Column("gateway_payment_id", sa.String(length=120), nullable=True))
    op.create_unique_constraint("uq_orders_gateway_payment_id", "orders", ["gateway_payment_id"])
    op.add_column("orders", sa.Column("payment_expires_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column(
        "orders",
        sa.Column("policy_accepted", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.add_column("orders", sa.Column("policy_accepted_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("orders", sa.Column("tracking_carrier", sa.String(length=60), nullable=True))
    op.add_column("orders", sa.Column("tracking_number", sa.String(length=120), nullable=True))
    op.add_column("orders", sa.Column("tracking_url", sa.Text(), nullable=True))
    op.add_column(
        "orders",
        sa.Column(
            "customer_email_notification_status",
            sa.String(length=40),
            nullable=False,
            server_default="pending",
        ),
    )
    op.add_column(
        "orders",
        sa.Column(
            "customer_whatsapp_notification_status",
            sa.String(length=40),
            nullable=False,
            server_default="pending",
        ),
    )
    op.add_column(
        "orders",
        sa.Column(
            "customer_sms_notification_status",
            sa.String(length=40),
            nullable=False,
            server_default="pending",
        ),
    )
    op.add_column(
        "orders",
        sa.Column(
            "tracking_email_notification_status",
            sa.String(length=40),
            nullable=False,
            server_default="not_sent",
        ),
    )
    op.add_column(
        "orders",
        sa.Column(
            "tracking_whatsapp_notification_status",
            sa.String(length=40),
            nullable=False,
            server_default="not_sent",
        ),
    )
    op.add_column(
        "orders",
        sa.Column(
            "tracking_sms_notification_status",
            sa.String(length=40),
            nullable=False,
            server_default="not_sent",
        ),
    )


def downgrade() -> None:
    for column in (
        "tracking_sms_notification_status",
        "tracking_whatsapp_notification_status",
        "tracking_email_notification_status",
        "customer_sms_notification_status",
        "customer_whatsapp_notification_status",
        "customer_email_notification_status",
        "tracking_url",
        "tracking_number",
        "tracking_carrier",
        "policy_accepted_at",
        "policy_accepted",
        "payment_expires_at",
    ):
        op.drop_column("orders", column)
    op.drop_constraint("uq_orders_gateway_payment_id", "orders", type_="unique")
    op.drop_column("orders", "gateway_payment_id")
    op.drop_constraint("uq_orders_gateway_order_id", "orders", type_="unique")
    op.drop_column("orders", "gateway_order_id")
    op.drop_index("ix_orders_payment_status", table_name="orders")
    op.drop_column("orders", "payment_status")
    op.drop_column("orders", "payment_method")
    op.drop_column("orders", "cod_charge")
