"""Base model class with common functionality."""

from datetime import datetime

from sqlalchemy import Column, DateTime, Integer
from sqlalchemy.orm import declared_attr

from app.database import Base


class BaseModel(Base):
    """Abstract base model with common fields."""

    __abstract__ = True

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    @declared_attr
    def __tablename__(cls) -> str:
        """Generate table name from class name."""
        return cls.__name__.lower() + "s"
