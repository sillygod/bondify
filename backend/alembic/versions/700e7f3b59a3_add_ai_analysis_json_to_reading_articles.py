"""add_ai_analysis_json_to_reading_articles

Revision ID: 700e7f3b59a3
Revises: 785d93fb6ead
Create Date: 2026-02-03 06:08:36.459143

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '700e7f3b59a3'
down_revision: Union[str, Sequence[str], None] = '785d93fb6ead'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    with op.batch_alter_table('reading_articles', schema=None) as batch_op:
        batch_op.add_column(sa.Column('ai_analysis_json', sa.Text(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table('reading_articles', schema=None) as batch_op:
        batch_op.drop_column('ai_analysis_json')
