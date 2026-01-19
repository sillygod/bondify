"""User wordlist database model."""

from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class UserWordlist(BaseModel):
    """User's personal vocabulary word list."""

    __tablename__ = "user_wordlist"

    # Foreign keys
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    vocabulary_cache_id = Column(
        Integer, ForeignKey("vocabulary_cache.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # User-specific data
    added_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    last_reviewed = Column(DateTime, nullable=True)
    review_count = Column(Integer, default=0, nullable=False)
    mastery_level = Column(Integer, default=0, nullable=False)  # 0-100
    notes = Column(Text, nullable=True)  # User's personal notes

    # FSRS (Free Spaced Repetition Scheduler) fields
    fsrs_card_json = Column(Text, nullable=True)  # Serialized FSRS Card object
    fsrs_due = Column(DateTime, nullable=True, index=True)  # Next review datetime
    fsrs_state = Column(String(20), nullable=True)  # New, Learning, Review, Relearning

    # Relationships
    user = relationship("User", back_populates="wordlist")
    vocabulary = relationship("VocabularyCache", lazy="joined")

    # Ensure a user can only add a word once
    __table_args__ = (
        UniqueConstraint("user_id", "vocabulary_cache_id", name="uq_user_vocabulary"),
    )

    def __repr__(self) -> str:
        return f"<UserWordlist(user_id={self.user_id}, vocab_id={self.vocabulary_cache_id})>"
