"""Pydantic schemas for wordlist API."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class WordlistEntryBase(BaseModel):
    """Base schema for wordlist entry."""

    notes: Optional[str] = Field(None, description="User's personal notes for this word")


class WordlistAddRequest(BaseModel):
    """Request to add a word to user's wordlist."""

    word: str = Field(..., min_length=1, max_length=100, description="Word to add")
    notes: Optional[str] = Field(None, description="Optional notes")


class WordlistUpdateRequest(BaseModel):
    """Request to update a wordlist entry."""

    notes: Optional[str] = Field(None, description="Updated notes")
    mastery_level: Optional[int] = Field(None, ge=0, le=100, description="Updated mastery level")


class WordlistEntryResponse(BaseModel):
    """Response for a single wordlist entry."""

    id: int
    word: str
    definition: str
    part_of_speech: str
    difficulty: Optional[int] = None
    added_at: datetime
    last_reviewed: Optional[datetime] = None
    review_count: int
    mastery_level: int
    notes: Optional[str] = None

    class Config:
        from_attributes = True


class WordlistResponse(BaseModel):
    """Response for user's wordlist."""

    total: int = Field(..., description="Total number of words in list")
    words: list[WordlistEntryResponse] = Field(..., description="List of words")


class WordlistStatsResponse(BaseModel):
    """Response for wordlist statistics."""

    total_words: int
    words_mastered: int  # mastery_level >= 80
    words_learning: int  # mastery_level 20-79
    words_new: int  # mastery_level < 20
    average_mastery: float


class RandomWordsRequest(BaseModel):
    """Request for random words from wordlist."""

    count: int = Field(5, ge=1, le=10, description="Number of words to return")
    topic: Optional[str] = Field(None, description="Optional topic for relevance filtering")
    min_mastery: Optional[int] = Field(None, ge=0, le=100, description="Minimum mastery level")
    max_mastery: Optional[int] = Field(None, ge=0, le=100, description="Maximum mastery level")
