"""Analytics API endpoints."""

from fastapi import APIRouter

from app.api.deps import CurrentUser, DbSession
from app.schemas.analytics import (
    RecordAnswerRequest,
    RecordAnswerResponse,
    WeaknessAnalysisResponse,
    PartOfSpeechStats,
    WeakWord,
    GameTypeStats,
)
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/weakness", response_model=WeaknessAnalysisResponse)
async def get_weakness_analysis(
    current_user: CurrentUser,
    db: DbSession,
    days: int = 30,
) -> WeaknessAnalysisResponse:
    """
    Get weakness analysis report for the current user.
    
    Shows breakdown by part of speech, top weak words, and game performance.
    
    Args:
        days: Number of days to analyze (default: 30, max: 90)
    """
    days = min(max(days, 7), 90)
    
    analytics_service = AnalyticsService(db)
    analysis = await analytics_service.get_weakness_analysis(
        user_id=current_user.id,
        days=days,
    )
    
    return WeaknessAnalysisResponse(
        totalAnswers=analysis["totalAnswers"],
        correctAnswers=analysis.get("correctAnswers", 0),
        overallAccuracy=analysis["overallAccuracy"],
        byPartOfSpeech=[PartOfSpeechStats(**pos) for pos in analysis["byPartOfSpeech"]],
        topWeakWords=[WeakWord(**w) for w in analysis["topWeakWords"]],
        byGameType=[GameTypeStats(**g) for g in analysis["byGameType"]],
        periodDays=analysis["periodDays"],
    )


@router.post("/record", response_model=RecordAnswerResponse)
async def record_answer(
    request: RecordAnswerRequest,
    current_user: CurrentUser,
    db: DbSession,
) -> RecordAnswerResponse:
    """
    Record an answer from a game or SRS review.
    
    This data is used for weakness analysis.
    """
    analytics_service = AnalyticsService(db)
    record = await analytics_service.record_answer(
        user_id=current_user.id,
        word=request.word,
        game_type=request.gameType,
        is_correct=request.isCorrect,
        part_of_speech=request.partOfSpeech,
        question_type=request.questionType,
        user_answer=request.userAnswer,
        correct_answer=request.correctAnswer,
    )
    
    await db.commit()
    
    return RecordAnswerResponse(
        success=True,
        recordId=record.id,
    )
