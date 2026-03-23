"""Add user_id to clients

Revision ID: 0002
Revises: 0001
Create Date: 2024-01-02 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "clients",
        sa.Column("user_id", sa.Integer(), nullable=True),
    )
    op.create_foreign_key(
        "fk_clients_user_id",
        "clients",
        "users",
        ["user_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_unique_constraint("uq_clients_user_id", "clients", ["user_id"])


def downgrade() -> None:
    op.drop_constraint("uq_clients_user_id", "clients", type_="unique")
    op.drop_constraint("fk_clients_user_id", "clients", type_="foreignkey")
    op.drop_column("clients", "user_id")
