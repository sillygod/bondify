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

