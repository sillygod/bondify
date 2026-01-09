"""Vocabulary API endpoints."""

from fastapi import APIRouter, HTTPException, status

from app.llm.factory import LLMServiceError
from app.llm.vocabulary_agent import get_vocabulary_agent
from app.schemas.vocabulary import (
    VocabularyLookupRequest,
    VocabularyLookupResponse,
)

router = APIRouter(prefix="/api/vocabulary", tags=["vocabulary"])


@router.post("/lookup", response_model=VocabularyLookupResponse)
async def lookup_word(request: VocabularyLookupRequest):
    """
    Look up comprehensive information about a word.

    Returns detailed word information including:
    - Definition, part of speech, pronunciation
    - Word structure (prefix, root, suffix) and etymology
    - Multiple meanings with contexts and examples
    - Collocations and synonyms
    - Learning tips, visual tricks, memory phrases
    - Common mistakes to avoid
    """
    try:
        agent = get_vocabulary_agent()
        result = await agent.lookup_word(request.word)

        return VocabularyLookupResponse(**result)

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
