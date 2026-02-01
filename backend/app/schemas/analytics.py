"""Analytics Pydantic schemas."""

from typing import List, Optional

from pydantic import BaseModel, Field


class PartOfSpeechStats(BaseModel):
    """Statistics for a specific part of speech."""

    partOfSpeech: str
    totalAnswers: int = Field(ge=0)
    correctAnswers: int = Field(ge=0)
    accuracy: float = Field(ge=0.0, le=1.0)
    errorRate: float = Field(ge=0.0, le=1.0)


class WeakWord(BaseModel):
    """A word the user struggles with."""

    word: str
    partOfSpeech: Optional[str]
    totalAttempts: int = Field(ge=0)
    correctCount: int = Field(ge=0)
    accuracy: float = Field(ge=0.0, le=1.0)
    errorRate: float = Field(ge=0.0, le=1.0)


class GameTypeStats(BaseModel):
    """Statistics for a specific game type."""

    gameType: str
    totalAnswers: int = Field(ge=0)
    correctAnswers: int = Field(ge=0)
    accuracy: float = Field(ge=0.0, le=1.0)


class WeaknessAnalysisResponse(BaseModel):
    """Response with weakness analysis data."""

    totalAnswers: int = Field(ge=0)
    correctAnswers: int = Field(default=0, ge=0)
    overallAccuracy: float = Field(ge=0.0, le=1.0)
    byPartOfSpeech: List[PartOfSpeechStats]
    topWeakWords: List[WeakWord]
    byGameType: List[GameTypeStats]
    periodDays: int = Field(ge=1)


class RecordAnswerRequest(BaseModel):
    """Request to record an answer."""

    word: str = Field(..., min_length=1)
    gameType: str = Field(..., min_length=1)
    isCorrect: bool
    partOfSpeech: Optional[str] = None
    questionType: Optional[str] = None
    userAnswer: Optional[str] = None
    correctAnswer: Optional[str] = None


class RecordAnswerResponse(BaseModel):
    """Response after recording an answer."""

    success: bool
    recordId: int
