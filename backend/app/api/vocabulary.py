"""Vocabulary API endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.llm.factory import LLMServiceError
from app.services.vocabulary_service import VocabularyService
from app.schemas.vocabulary import (
    VocabularyLookupRequest,
    VocabularyLookupResponse,
)

router = APIRouter(prefix="/api/vocabulary", tags=["vocabulary"])


@router.post("/lookup", response_model=VocabularyLookupResponse)
async def lookup_word(
    request: VocabularyLookupRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Look up comprehensive information about a word.

    Returns detailed word information including:
    - Definition, part of speech, pronunciation
    - Word structure (prefix, root, suffix) and etymology
    - Multiple meanings with contexts and examples
    - Collocations and synonyms
    - Learning tips, visual tricks, memory phrases
    - Common mistakes to avoid

    Response includes 'source' field: "cache" (from DB) or "ai" (fresh lookup).
    """
    try:
        service = VocabularyService(db)
        result, source = await service.lookup_word(request.word)

        # Add source info to response
        response_data = {**result, "source": source}
        return VocabularyLookupResponse(**response_data)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": "VALIDATION_ERROR",
                "detail": str(e),
                "code": "VALIDATION_ERROR",
            },
        )
    except LLMServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "error": "LLM_SERVICE_ERROR",
                "detail": str(e.message),
                "code": "LLM_SERVICE_ERROR",
            },
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "INTERNAL_ERROR",
                "detail": "An unexpected error occurred",
                "code": "INTERNAL_ERROR",
            },
        )


@router.get("/cache-stats")
async def get_cache_stats(db: AsyncSession = Depends(get_db)):
    """Get vocabulary cache statistics."""
    service = VocabularyService(db)
    return await service.get_cache_stats()

