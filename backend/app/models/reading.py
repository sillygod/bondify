"""Reading Article database model."""

from sqlalchemy import Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class ReadingArticle(BaseModel):
    """Reading article model for storing user-imported articles."""

    __tablename__ = "reading_articles"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    source_url = Column(String(500), nullable=True)
    word_count = Column(Integer, nullable=False, default=0)
    difficulty_level = Column(
        String(20), default="intermediate", nullable=False
    )  # beginner, intermediate, advanced

    # Relationships
    user = relationship("User", backref="reading_articles")
