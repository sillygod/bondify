"""Progress tracking Pydantic schemas."""

from typing import List, Optional

from pydantic import BaseModel, Field


class StreakDay(BaseModel):
    """Single day in streak history."""

    date: str
    hasActivity: bool
    intensity: int = Field(ge=0, le=4)
    xp: int = Field(ge=0)


class StreakData(BaseModel):
    """Streak information response."""

    currentStreak: int = Field(ge=0)
    longestStreak: int = Field(ge=0)
    totalDaysActive: int = Field(ge=0)
    history: List[StreakDay]


class LearningStats(BaseModel):
    """Learning statistics response."""

    wordsLearned: int = Field(ge=0)
    accuracyRate: float = Field(ge=0.0, le=1.0)
    currentStreak: int = Field(ge=0)
    totalXp: int = Field(ge=0)
    lessonsDone: int = Field(ge=0)
    timeSpentHours: float = Field(ge=0.0)
    bestStreak: int = Field(ge=0)
    # Today's changes (for displaying delta values on dashboard)
    todayWordsLearned: int = Field(default=0, ge=0)
    todayXp: int = Field(default=0, ge=0)


class ActivityRequest(BaseModel):
    """Request to record a learning activity."""

    xp: int = Field(default=0, ge=0)
    wordsLearned: int = Field(default=0, ge=0)
    timeSpentMinutes: int = Field(default=0, ge=0)


class ActivityResponse(BaseModel):
    """Response after recording an activity."""

    success: bool
    xpEarned: int
    currentStreak: int
    newAchievements: List[str] = []


class AchievementResponse(BaseModel):
    """Achievement information."""

    name: str
    description: str
    unlocked: bool
    unlockedAt: Optional[str] = None


class AchievementsListResponse(BaseModel):
    """List of achievements response."""

    achievements: List[AchievementResponse]
