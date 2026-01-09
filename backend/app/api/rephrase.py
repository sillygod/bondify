"""Rephrase API endpoints."""

from fastapi import APIRouter, HTTPException, status

from app.llm.factory import LLMServiceError
from app.llm.rephrase_agent import get_rephrase_agent
from app.schemas.rephrase import (
    RephraseAnalyzeRequest,
    RephraseAnalyzeResponse,
)

router = APIRouter(prefix="/api/rephrase", tags=["rephrase"])


@router.post("/analyze", response_model=RephraseAnalyzeResponse)
async def analyze_sentence(request: RephraseAnalyzeRequest):
    """
    Analyze a sentence for grammar issues and provide rephrasing options.

    Returns detailed analysis including:
    - Original sentence
    - Grammar and clarity issues with explanations
    - Multiple rephrased options (formal, casual, concise)
    - Key takeaways for learning
    - Best recommendation
    """
    try:
        agent = get_rephrase_agent()
        result = await agent.analyze(request.sentence)

        return RephraseAnalyzeResponse(**result)

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
