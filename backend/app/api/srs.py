"""Spaced Repetition API endpoints."""

from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.services.srs_service import SpacedRepetitionService


router = APIRouter(prefix="/srs", tags=["Spaced Repetition"])


class ReviewRequest(BaseModel):
    """Request body for recording a review."""
    word_id: int = Field(..., description="UserWordlist entry ID")
    rating: int = Field(..., ge=1, le=4, description="1=Again, 2=Hard, 3=Good, 4=Easy")


class ReviewResponse(BaseModel):
    """Response after recording a review."""
    id: int
    word: str
    state: str
    due: str | None
    masteryLevel: int
    reviewCount: int


class DueWord(BaseModel):
    """A word due for review."""
    id: int
    word: str
    definition: str
    partOfSpeech: str
    pronunciation: str
    examples: list[str]
    state: str
    due: str | None


class DueWordsResponse(BaseModel):
    """Response for due words query."""
    words: list[DueWord]
    total: int


class SRSStats(BaseModel):
    """SRS statistics."""
    totalCards: int
    dueToday: int
    newCards: int
    learningCards: int
    reviewCards: int
    relearningCards: int
    averageRetention: float


class ForecastDay(BaseModel):
    """Review forecast for a single day."""
    date: str
    count: int


class ForecastResponse(BaseModel):
    """Review forecast response."""
    forecast: list[ForecastDay]


@router.get("/due", response_model=DueWordsResponse)
async def get_due_words(
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get words due for review.

    Returns words that are due for review now, plus new words
    that haven't started the SRS process yet.
    """
    service = SpacedRepetitionService(db)
    words = await service.get_due_words(current_user.id, limit)
    return DueWordsResponse(words=words, total=len(words))


@router.post("/review", response_model=ReviewResponse)
async def record_review(
    request: ReviewRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Record a review result.

    Rating scale:
    - 1 (Again): Complete blackout, didn't remember at all
    - 2 (Hard): Remembered with serious difficulty
    - 3 (Good): Remembered after a hesitation
    - 4 (Easy): Remembered instantly
    """
    service = SpacedRepetitionService(db)
    try:
        result = await service.record_review(
            current_user.id,
            request.word_id,
            request.rating,
        )
        return ReviewResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/stats", response_model=SRSStats)
async def get_srs_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get SRS statistics for the current user."""
    service = SpacedRepetitionService(db)
    stats = await service.get_srs_stats(current_user.id)
    return SRSStats(**stats)


@router.get("/forecast", response_model=ForecastResponse)
async def get_review_forecast(
    days: int = 7,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get review forecast for the next N days.

    Shows how many cards will be due for review each day.
    """
    service = SpacedRepetitionService(db)
    forecast = await service.get_review_forecast(current_user.id, days)
    return ForecastResponse(forecast=forecast)
