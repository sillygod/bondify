"""Wordlist API endpoints."""

from typing import Optional
from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.wordlist import (
    RandomWordsRequest,
    WordlistAddRequest,
    WordlistEntryResponse,
    WordlistResponse,
    WordlistStatsResponse,
    WordlistUpdateRequest,
)
from app.services.wordlist_service import WordlistService
from app.llm.factory import LLMFactory

router = APIRouter(prefix="/api/wordlist", tags=["wordlist"])


@router.get("", response_model=WordlistResponse)
async def get_wordlist(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get user's complete word list with definitions."""
    service = WordlistService(db)
    words = await service.get_user_wordlist(current_user.id)

    return WordlistResponse(
        total=len(words),
        words=[WordlistEntryResponse(**w) for w in words],
    )


@router.post("", response_model=WordlistEntryResponse, status_code=status.HTTP_201_CREATED)
async def add_word(
    request: WordlistAddRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    provider: Optional[str] = Header(None, alias="X-Bondify-AI-Provider"),
    api_key: Optional[str] = Header(None, alias="X-Bondify-AI-Key"),
    model: Optional[str] = Header(None, alias="X-Bondify-AI-Model"),
):
    """
    Add a word to user's word list.

    If the word hasn't been looked up before, it will be fetched from AI.
    Supports BYOK (Bring Your Own Key) via X-Bondify-AI-* headers.
    """
    service = WordlistService(db)

    # Create custom LLM if user provides API key (BYOK)
    custom_llm = None
    if api_key:
        custom_llm = LLMFactory.create(provider=provider, api_key=api_key, model=model)

    try:
        entry = await service.add_word(
            user_id=current_user.id,
            word=request.word,
            notes=request.notes,
            custom_llm=custom_llm,
        )
        return WordlistEntryResponse(**entry)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"error": "DUPLICATE_WORD", "detail": str(e)},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "ADD_FAILED", "detail": str(e)},
        )



@router.delete("/{word}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_word(
    word: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Remove a word from user's word list."""
    service = WordlistService(db)
    removed = await service.remove_word(current_user.id, word)

    if not removed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "WORD_NOT_FOUND", "detail": f"Word '{word}' not in your list"},
        )


@router.patch("/{word}", response_model=WordlistEntryResponse)
async def update_word(
    word: str,
    request: WordlistUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a word list entry (notes, mastery level)."""
    service = WordlistService(db)
    entry = await service.update_entry(
        user_id=current_user.id,
        word=word,
        notes=request.notes,
        mastery_level=request.mastery_level,
    )

    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "WORD_NOT_FOUND", "detail": f"Word '{word}' not in your list"},
        )

    return WordlistEntryResponse(**entry)


@router.get("/stats", response_model=WordlistStatsResponse)
async def get_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get wordlist statistics."""
    service = WordlistService(db)
    stats = await service.get_stats(current_user.id)
    return WordlistStatsResponse(**stats)


@router.post("/random")
async def get_random_words(
    request: RandomWordsRequest = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get random words from user's word list for practice.

    Useful for conversation practice and other games.
    """
    count = request.count if request else 5
    min_mastery = request.min_mastery if request else None
    max_mastery = request.max_mastery if request else None

    service = WordlistService(db)
    words = await service.get_random_words(
        user_id=current_user.id,
        count=count,
        min_mastery=min_mastery,
        max_mastery=max_mastery,
    )

    return {"words": words}
