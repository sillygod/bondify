"""Progress tracking API endpoints."""

from fastapi import APIRouter

from app.api.deps import CurrentUser, DbSession
from app.schemas.progress import (
    ActivityRequest,
    ActivityResponse,
    AchievementResponse,
    AchievementsListResponse,
    LearningStats,
    StreakData,
    StreakDay,
)
from app.services.progress_service import ProgressService
from app.services.achievement_service import AchievementService

router = APIRouter(prefix="/api/progress", tags=["progress"])


@router.get("/stats", response_model=LearningStats)
async def get_learning_stats(
    current_user: CurrentUser,
    db: DbSession,
) -> LearningStats:
    """Get comprehensive learning statistics for the current user."""
    progress_service = ProgressService(db)
    stats = await progress_service.get_learning_stats(current_user.id)
    return LearningStats(**stats)


@router.get("/streak", response_model=StreakData)
async def get_streak_data(
    current_user: CurrentUser,
    db: DbSession,
) -> StreakData:
    """Get streak data including 28-day history."""
    progress_service = ProgressService(db)
    streak_data = await progress_service.get_streak_data(current_user.id)
    
    # Convert history dicts to StreakDay models
    history = [StreakDay(**day) for day in streak_data["history"]]
    
    return StreakData(
        currentStreak=streak_data["currentStreak"],
        longestStreak=streak_data["longestStreak"],
        totalDaysActive=streak_data["totalDaysActive"],
        history=history,
    )



@router.post("/activity", response_model=ActivityResponse)
async def record_activity(
    request: ActivityRequest,
    current_user: CurrentUser,
    db: DbSession,
) -> ActivityResponse:
    """Record a learning activity and update progress."""
    progress_service = ProgressService(db)
    achievement_service = AchievementService(db)

    # Record the activity
    progress = await progress_service.record_activity(
        user_id=current_user.id,
        xp=request.xp,
        words_learned=request.wordsLearned,
        time_spent_minutes=request.timeSpentMinutes,
    )

    # Check for new achievements
    new_achievements = await achievement_service.check_and_unlock_achievements(current_user.id)
    achievement_names = [a.name for a in new_achievements]

    # Get current streak
    streak = await progress_service.get_or_create_streak(current_user.id)

    return ActivityResponse(
        success=True,
        xpEarned=progress.xp_earned,
        currentStreak=streak.current_streak,
        newAchievements=achievement_names,
    )


@router.get("/achievements", response_model=AchievementsListResponse)
async def get_achievements(
    current_user: CurrentUser,
    db: DbSession,
) -> AchievementsListResponse:
    """Get all achievements with user unlock status."""
    achievement_service = AchievementService(db)
    achievements = await achievement_service.get_user_achievements(current_user.id)
    
    return AchievementsListResponse(
        achievements=[AchievementResponse(**a) for a in achievements]
    )
