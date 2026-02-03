"""Pydantic schemas for Reading API."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ArticleCreateRequest(BaseModel):
    """Request schema for creating a new article."""

    title: str = Field(..., min_length=1, max_length=255, description="Article title")
    content: str = Field(..., min_length=1, description="Article content text")
    source_url: Optional[str] = Field(
        None, max_length=500, description="Optional source URL"
    )


class ArticleUpdateRequest(BaseModel):
    """Request schema for updating an article."""

    title: Optional[str] = Field(None, min_length=1, max_length=255)
    content: Optional[str] = Field(None, min_length=1)


class ArticleResponse(BaseModel):
    """Response schema for a single article."""

    id: int
    title: str
    content: str
    source_url: Optional[str]
    word_count: int
    difficulty_level: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ArticleListResponse(BaseModel):
    """Response schema for listing articles."""

    total: int
    articles: list[ArticleResponse]


class ArticleSummary(BaseModel):
    """Summary response for article list (without full content)."""

    id: int
    title: str
    word_count: int
    difficulty_level: str
    source_url: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class ArticleListSummaryResponse(BaseModel):
    """Response schema for listing article summaries."""

    total: int
    articles: list[ArticleSummary]


class UrlImportRequest(BaseModel):
    """Request schema for importing article from URL."""

    url: str = Field(..., description="URL to extract article content from")


class UrlImportResponse(BaseModel):
    """Response schema for URL import preview."""

    title: str
    content: str
    source_url: str
    word_count: int


# =============================================================================
# AI Analysis Schemas
# =============================================================================


class SuggestedWord(BaseModel):
    """A vocabulary word suggested for learning."""

    word: str = Field(..., description="The vocabulary word")
    definition: str = Field(..., description="Clear, concise definition")
    contextSentence: str = Field(
        ..., description="Sentence from the article where this word appears"
    )


class KeyConcept(BaseModel):
    """A key concept extracted from the article."""

    concept: str = Field(..., description="Main idea or concept name")
    explanation: str = Field(
        ..., description="Simple explanation in easy-to-understand English"
    )


class GrammarHighlight(BaseModel):
    """A notable grammar pattern found in the article."""

    sentence: str = Field(..., description="The sentence from the article")
    pattern: str = Field(..., description="Grammar pattern name")
    explanation: str = Field(
        ..., description="Brief explanation of why this structure is notable"
    )


class ReadingAnalysisResponse(BaseModel):
    """Response schema for AI reading analysis."""

    summary: str = Field(..., description="2-3 sentence summary of the article")
    suggestedWords: list[SuggestedWord] = Field(
        default_factory=list, description="Vocabulary words to learn"
    )
    keyConcepts: list[KeyConcept] = Field(
        default_factory=list, description="Key concepts from the article"
    )
    grammarHighlights: list[GrammarHighlight] = Field(
        default_factory=list, description="Notable grammar patterns"
    )
    cached: bool = Field(
        default=False, description="Whether this analysis was loaded from cache"
    )
