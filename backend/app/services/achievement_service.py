"""Achievement service for managing user achievements."""

from datetime import datetime
from typing import List

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.achievement import Achievement, UserAchievement
from app.models.progress import UserProgress, UserStreak


DEFAULT_ACHIEVEMENTS = [
    {
        "name": "First Steps",
        "description": "Complete your first learning activity",
        "criteria_type": "lessons",
        "criteria_value": 1,
    },
    {
        "name": "Word Master",
        "description": "Learn 100 new words",
        "criteria_type": "words",
        "criteria_value": 100,
    },
    {
        "name": "Week Warrior",
        "description": "Maintain a 7-day learning streak",
        "criteria_type": "streak",
        "criteria_value": 7,
    },
    {
        "name": "Speed Reader",
        "description": "Spend 10 hours learning",
        "criteria_type": "time",
        "criteria_value": 600,
    },
]


class AchievementService:
    """Service for managing achievements."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def seed_achievements(self) -> None:
        """Seed default achievements if they don't exist."""
        for achievement_data in DEFAULT_ACHIEVEMENTS:
            result = await self.db.execute(
                select(Achievement).where(
                    Achievement.name == achievement_data["name"]
                )
            )
            existing = result.scalar_one_or_none()
            if not existing:
                achievement = Achievement(**achievement_data)
                self.db.add(achievement)
        await self.db.flush()

    async def get_all_achievements(self) -> List[Achievement]:
        """Get all available achievements."""
        result = await self.db.execute(select(Achievement))
        return result.scalars().all()

    async def get_user_achievements(self, user_id: int) -> List[dict]:
        """Get all achievements with user unlock status."""
        await self.seed_achievements()
        achievements = await self.get_all_achievements()
        result = await self.db.execute(
            select(UserAchievement).where(UserAchievement.user_id == user_id)
        )
        user_unlocks = result.scalars().all()
        unlock_map = {ua.achievement_id: ua for ua in user_unlocks}

        result_list = []
        for achievement in achievements:
            unlock = unlock_map.get(achievement.id)
            result_list.append({
                "name": achievement.name,
                "description": achievement.description,
                "unlocked": unlock is not None,
                "unlockedAt": unlock.unlocked_at.isoformat() if unlock else None,
            })
        return result_list

    async def check_and_unlock_achievements(self, user_id: int) -> List[Achievement]:
        """Check user progress and unlock any earned achievements."""
        await self.seed_achievements()
        stats = await self._get_user_stats(user_id)
        achievements = await self.get_all_achievements()
        newly_unlocked = []

        for achievement in achievements:
            result = await self.db.execute(
                select(UserAchievement).where(
                    UserAchievement.user_id == user_id,
                    UserAchievement.achievement_id == achievement.id,
                )
            )
            existing = result.scalar_one_or_none()
            if existing:
                continue

            if self._check_criteria(achievement, stats):
                user_achievement = UserAchievement(
                    user_id=user_id,
                    achievement_id=achievement.id,
                    unlocked_at=datetime.utcnow(),
                )
                self.db.add(user_achievement)
                newly_unlocked.append(achievement)

        if newly_unlocked:
            await self.db.flush()
        return newly_unlocked

    async def _get_user_stats(self, user_id: int) -> dict:
        """Get user stats for achievement checking."""
        result = await self.db.execute(
            select(
                func.sum(UserProgress.words_learned).label("words"),
                func.sum(UserProgress.time_spent_minutes).label("time"),
                func.sum(UserProgress.activities_completed).label("lessons"),
            ).where(UserProgress.user_id == user_id)
        )
        progress_stats = result.one()

        result = await self.db.execute(
            select(UserStreak).where(UserStreak.user_id == user_id)
        )
        streak = result.scalar_one_or_none()

        return {
            "words": progress_stats.words or 0 if progress_stats else 0,
            "time": progress_stats.time or 0 if progress_stats else 0,
            "lessons": progress_stats.lessons or 0 if progress_stats else 0,
            "streak": streak.current_streak if streak else 0,
        }

    def _check_criteria(self, achievement: Achievement, stats: dict) -> bool:
        """Check if achievement criteria is met."""
        criteria_type = achievement.criteria_type
        criteria_value = achievement.criteria_value

        if criteria_type == "words":
            return stats["words"] >= criteria_value
        elif criteria_type == "time":
            return stats["time"] >= criteria_value
        elif criteria_type == "lessons":
            return stats["lessons"] >= criteria_value
        elif criteria_type == "streak":
            return stats["streak"] >= criteria_value
        return False
