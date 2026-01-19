"""add_fsrs_fields_to_user_wordlist

Revision ID: 8f3d2e1a9b7c
Revises: cef8d9add7b0
Create Date: 2026-01-19 12:55:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8f3d2e1a9b7c'
down_revision: Union[str, Sequence[str], None] = 'cef8d9add7b0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add FSRS fields to user_wordlist table."""
    with op.batch_alter_table('user_wordlist', schema=None) as batch_op:
        # FSRS Card JSON - stores the full FSRS card state
        batch_op.add_column(
            sa.Column('fsrs_card_json', sa.Text(), nullable=True)
        )
        # Convenience field for querying due words
        batch_op.add_column(
            sa.Column('fsrs_due', sa.DateTime(), nullable=True)
        )
        # Card state: New, Learning, Review, Relearning
        batch_op.add_column(
            sa.Column('fsrs_state', sa.String(length=20), nullable=True)
        )
        # Create index on fsrs_due for efficient due word queries
        batch_op.create_index('ix_user_wordlist_fsrs_due', ['fsrs_due'])


def downgrade() -> None:
    """Remove FSRS fields from user_wordlist table."""
    with op.batch_alter_table('user_wordlist', schema=None) as batch_op:
        batch_op.drop_index('ix_user_wordlist_fsrs_due')
        batch_op.drop_column('fsrs_state')
        batch_op.drop_column('fsrs_due')
        batch_op.drop_column('fsrs_card_json')
