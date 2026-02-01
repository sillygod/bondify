"""Vocabulary API endpoints."""

from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.vocabulary_service import VocabularyService
from app.schemas.vocabulary import (
    VocabularyLookupRequest,
    VocabularyLookupResponse,
)
from app.database import get_db
from app.llm.factory import LLMFactory, LLMServiceError

router = APIRouter(prefix="/api/vocabulary", tags=["vocabulary"])


@router.post("/lookup", response_model=VocabularyLookupResponse)
async def lookup_word(
    request: VocabularyLookupRequest,
    db: AsyncSession = Depends(get_db),
    provider: Optional[str] = Header(None, alias="X-Bondify-AI-Provider"),
    api_key: Optional[str] = Header(None, alias="X-Bondify-AI-Key"),
    model: Optional[str] = Header(None, alias="X-Bondify-AI-Model"),
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
    
    Supports BYOK (Bring Your Own Key) via X-Bondify-AI-* headers.
    """
    try:
        service = VocabularyService(db)
        
        # If user provides custom API key, create LLM instance (BYOK)
        custom_llm = None
        if api_key:
            custom_llm = LLMFactory.create(provider=provider, api_key=api_key, model=model)
        
        result, source = await service.lookup_word(request.word, custom_llm=custom_llm)

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
