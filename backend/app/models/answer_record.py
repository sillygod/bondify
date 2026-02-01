"""Answer record model for tracking quiz/game answers."""

from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Boolean, Text
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class AnswerRecord(BaseModel):
    """Tracks user answers in games and SRS reviews for weakness analysis."""

    __tablename__ = "answer_records"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    word = Column(String(100), nullable=False, index=True)
    part_of_speech = Column(String(20), nullable=True, index=True)  # noun, verb, adjective, etc.
    game_type = Column(String(50), nullable=False, index=True)  # rocket, recall, context, srs, etc.
    is_correct = Column(Boolean, nullable=False)
    answered_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    # Optional context
    question_type = Column(String(50), nullable=True)  # synonym, antonym, definition, etc.
    user_answer = Column(Text, nullable=True)
    correct_answer = Column(Text, nullable=True)

    # Relationships
    user = relationship("User", back_populates="answer_records")
