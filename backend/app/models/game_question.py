"""Game question database model."""

from sqlalchemy import Boolean, Column, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB

from app.models.base import BaseModel


class GameQuestion(BaseModel):
    """AI-generated game questions stored in database."""

    __tablename__ = "game_questions"

    game_type = Column(String(50), index=True, nullable=False)
    question_json = Column(Text, nullable=False)
    difficulty = Column(String(20), default="medium", nullable=False)
    is_reviewed = Column(Boolean, default=False, nullable=False)
    usage_count = Column(Integer, default=0, nullable=False)

    def __repr__(self) -> str:
        return f"<GameQuestion(type='{self.game_type}', reviewed={self.is_reviewed})>"
