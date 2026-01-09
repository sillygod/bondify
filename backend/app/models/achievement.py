"""Achievement database models."""

from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class Achievement(BaseModel):
    """Achievement definitions."""

    __tablename__ = "achievements"

    name = Column(String(100), unique=True, nullable=False)
    description = Column(String(500), nullable=False)
    criteria_type = Column(String(50), nullable=False)  # words, streak, lessons, time
    criteria_value = Column(Integer, nullable=False)

    # Relationships
    user_achievements = relationship("UserAchievement", back_populates="achievement")


class UserAchievement(BaseModel):
    """User achievement unlocks."""

    __tablename__ = "user_achievements"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    achievement_id = Column(Integer, ForeignKey("achievements.id"), nullable=False)
    unlocked_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="achievements")
    achievement = relationship("Achievement", back_populates="user_achievements")
