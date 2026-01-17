"""Progress tracking service."""

from datetime import date, timedelta
from typing import List, Optional

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.progress import UserProgress, UserStreak


class ProgressService:
    """Service for managing user learning progress."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_or_create_streak(self, user_id: int) -> UserStreak:
        """Get or create user streak record."""
        result = await self.db.execute(
            select(UserStreak).where(UserStreak.user_id == user_id)
        )
        streak = result.scalar_one_or_none()
        
        if not streak:
            streak = UserStreak(user_id=user_id, current_streak=0, longest_streak=0)
            self.db.add(streak)
            await self.db.flush()
            await self.db.refresh(streak)
        return streak

    async def get_today_progress(self, user_id: int) -> Optional[UserProgress]:
        """Get today's progress record for a user."""
        today = date.today()
        result = await self.db.execute(
            select(UserProgress).where(
                UserProgress.user_id == user_id,
                UserProgress.date == today
            )
        )
        return result.scalar_one_or_none()

    async def get_or_create_today_progress(self, user_id: int) -> UserProgress:
        """Get or create today's progress record."""
        progress = await self.get_today_progress(user_id)
        if not progress:
            progress = UserProgress(
                user_id=user_id,
                date=date.today(),
                xp_earned=0,
                words_learned=0,
                time_spent_minutes=0,
                activities_completed=0,
            )
            self.db.add(progress)
            await self.db.flush()
            await self.db.refresh(progress)
        return progress


    async def record_activity(
        self,
        user_id: int,
        xp: int = 0,
        words_learned: int = 0,
        time_spent_minutes: int = 0,
    ) -> UserProgress:
        """Record a learning activity and update progress."""
        # Update daily progress
        progress = await self.get_or_create_today_progress(user_id)
        progress.xp_earned += xp
        progress.words_learned += words_learned
        progress.time_spent_minutes += time_spent_minutes
        progress.activities_completed += 1

        # Update streak
        await self._update_streak(user_id)

        await self.db.flush()
        await self.db.refresh(progress)
        return progress

    async def _update_streak(self, user_id: int) -> UserStreak:
        """Update user streak based on activity."""
        streak = await self.get_or_create_streak(user_id)
        today = date.today()

        if streak.last_activity_date is None:
            # First activity ever
            streak.current_streak = 1
            streak.longest_streak = 1
        elif streak.last_activity_date == today:
            # Already recorded activity today, no change
            pass
        elif streak.last_activity_date == today - timedelta(days=1):
            # Consecutive day - increment streak
            streak.current_streak += 1
            if streak.current_streak > streak.longest_streak:
                streak.longest_streak = streak.current_streak
        else:
            # Missed a day - reset streak
            streak.current_streak = 1

        streak.last_activity_date = today
        await self.db.flush()
        await self.db.refresh(streak)
        return streak

    async def get_streak_data(self, user_id: int) -> dict:
        """Get streak data including 28-day history."""
        streak = await self.get_or_create_streak(user_id)
        history = await self._get_streak_history(user_id, days=28)
        total_days_active = await self._count_active_days(user_id)

        return {
            "currentStreak": streak.current_streak,
            "longestStreak": streak.longest_streak,
            "totalDaysActive": total_days_active,
            "history": history,
        }


    async def _get_streak_history(self, user_id: int, days: int = 28) -> List[dict]:
        """Get activity history for the last N days."""
        today = date.today()
        start_date = today - timedelta(days=days - 1)

        # Get all progress records in the date range
        result = await self.db.execute(
            select(UserProgress).where(
                UserProgress.user_id == user_id,
                UserProgress.date >= start_date,
                UserProgress.date <= today,
            )
        )
        progress_records = result.scalars().all()

        # Create a map of date to progress
        progress_map = {p.date: p for p in progress_records}

        # Build history for each day
        history = []
        for i in range(days):
            current_date = start_date + timedelta(days=i)
            progress = progress_map.get(current_date)

            if progress:
                xp = progress.xp_earned
                has_activity = True
                # Calculate intensity (0-4) based on XP
                intensity = min(4, xp // 25) if xp > 0 else 0
            else:
                xp = 0
                has_activity = False
                intensity = 0

            history.append({
                "date": current_date.isoformat(),
                "hasActivity": has_activity,
                "intensity": intensity,
                "xp": xp,
            })

        return history

    async def _count_active_days(self, user_id: int) -> int:
        """Count total days with activity."""
        result = await self.db.execute(
            select(func.count(UserProgress.id)).where(UserProgress.user_id == user_id)
        )
        count = result.scalar()
        return count or 0

    async def get_learning_stats(self, user_id: int) -> dict:
        """Get comprehensive learning statistics."""
        streak = await self.get_or_create_streak(user_id)

        # Aggregate stats from all progress records
        result = await self.db.execute(
            select(
                func.sum(UserProgress.xp_earned).label("total_xp"),
                func.sum(UserProgress.words_learned).label("words_learned"),
                func.sum(UserProgress.time_spent_minutes).label("time_spent"),
                func.sum(UserProgress.activities_completed).label("lessons_done"),
            ).where(UserProgress.user_id == user_id)
        )
        stats = result.one()

        total_xp = stats.total_xp or 0
        words_learned = stats.words_learned or 0
        time_spent = stats.time_spent or 0
        lessons_done = stats.lessons_done or 0

        # Get today's progress for delta display
        today_progress = await self.get_today_progress(user_id)
        today_words = today_progress.words_learned if today_progress else 0
        today_xp = today_progress.xp_earned if today_progress else 0

        # Calculate accuracy rate (placeholder - would need actual tracking)
        accuracy_rate = 0.85 if lessons_done > 0 else 0.0

        return {
            "wordsLearned": words_learned,
            "accuracyRate": accuracy_rate,
            "currentStreak": streak.current_streak,
            "totalXp": total_xp,
            "lessonsDone": lessons_done,
            "timeSpentHours": round(time_spent / 60, 1),
            "bestStreak": streak.longest_streak,
            "todayWordsLearned": today_words,
            "todayXp": today_xp,
        }
