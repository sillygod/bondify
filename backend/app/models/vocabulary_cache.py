"""Vocabulary cache database model."""

from sqlalchemy import Column, Integer, String, Text

from app.models.base import BaseModel


class VocabularyCache(BaseModel):
    """Cache for AI-generated vocabulary definitions."""

    __tablename__ = "vocabulary_cache"

    word = Column(String(100), unique=True, index=True, nullable=False)
    definition_json = Column(Text, nullable=False)
    lookup_count = Column(Integer, default=1, nullable=False)

    def __repr__(self) -> str:
        return f"<VocabularyCache(word='{self.word}', lookups={self.lookup_count})>"
