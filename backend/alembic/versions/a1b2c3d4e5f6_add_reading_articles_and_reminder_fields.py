"""add reading articles and reminder fields

Revision ID: a1b2c3d4e5f6
Revises: cef8d9add7b0
Create Date: 2026-01-19 22:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, None] = "8f3d2e1a9b7c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create reading_articles table
    op.create_table(
        "reading_articles",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("source_url", sa.String(length=500), nullable=True),
        sa.Column("word_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column(
            "difficulty_level",
            sa.String(length=20),
            nullable=False,
            server_default="intermediate",
        ),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_reading_articles_id"), "reading_articles", ["id"], unique=False
    )
    op.create_index(
        op.f("ix_reading_articles_user_id"), "reading_articles", ["user_id"], unique=False
    )

    # Add reminder fields to users table
    op.add_column(
        "users",
        sa.Column("reminder_enabled", sa.Boolean(), nullable=False, server_default="0"),
    )
    op.add_column(
        "users",
        sa.Column(
            "reminder_time", sa.String(length=5), nullable=True, server_default="09:00"
        ),
    )


def downgrade() -> None:
    # Remove reminder fields from users table
    op.drop_column("users", "reminder_time")
    op.drop_column("users", "reminder_enabled")

    # Drop reading_articles table
    op.drop_index(op.f("ix_reading_articles_user_id"), table_name="reading_articles")
    op.drop_index(op.f("ix_reading_articles_id"), table_name="reading_articles")
    op.drop_table("reading_articles")
