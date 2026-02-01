"""merge heads

Revision ID: 785d93fb6ead
Revises: 55b63103687b, a1b2c3d4e5f6
Create Date: 2026-02-01 13:42:07.331949

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '785d93fb6ead'
down_revision: Union[str, Sequence[str], None] = ('55b63103687b', 'a1b2c3d4e5f6')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
