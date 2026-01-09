"""Progress tracking database models."""

from datetime import date

from sqlalchemy import Column, Date, ForeignKey, Integer
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class UserProgress(BaseModel):
    """Daily progress tracking for users."""

    __tablename__ = "user_progress"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    xp_earned = Column(Integer, default=0, nullable=False)
    words_learned = Column(Integer, default=0, nullable=False)
    time_spent_minutes = Column(Integer, default=0, nullable=False)
    activities_completed = Column(Integer, default=0, nullable=False)

    # Relationships
    user = relationship("User", back_populates="progress")


class UserStreak(BaseModel):
    """Streak tracking for users."""

    __tablename__ = "user_streaks"

    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    current_streak = Column(Integer, default=0, nullable=False)
    longest_streak = Column(Integer, default=0, nullable=False)
    last_activity_date = Column(Date, nullable=True)

    # Relationships
    user = relationship("User", back_populates="streak")
