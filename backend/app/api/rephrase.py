"""Rephrase API endpoints."""

from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.llm.factory import LLMContext, LLMFactory, LLMServiceError, get_active_llm_config
from app.llm.rephrase_agent import RephraseAgent
from app.schemas.rephrase import (
    RephraseAnalyzeRequest,
    RephraseAnalyzeResponse,
)

router = APIRouter(prefix="/api/rephrase", tags=["rephrase"])


@router.post("/analyze", response_model=RephraseAnalyzeResponse)
async def analyze_sentence(
    request: RephraseAnalyzeRequest,
    db: AsyncSession = Depends(get_db),
    provider: Optional[str] = Header(None, alias="X-Bondify-AI-Provider"),
    api_key: Optional[str] = Header(None, alias="X-Bondify-AI-Key"),
    model: Optional[str] = Header(None, alias="X-Bondify-AI-Model"),
):
    """
    Analyze a sentence for grammar issues and provide rephrasing options.

    Returns detailed analysis including:
    - Original sentence
    - Grammar and clarity issues with explanations
    - Multiple rephrased options (formal, casual, concise)
    - Key takeaways for learning
    - Best recommendation
    
    Supports BYOK (Bring Your Own Key) via X-Bondify-AI-* headers.
    """
    try:
        # If user provides custom API key, use that (BYOK)
        if api_key:
            llm = LLMFactory.create(provider=provider, api_key=api_key, model=model)
            agent = RephraseAgent(llm=llm)
            result = await agent.analyze(request.sentence)
        else:
            # Use DB-configured provider with usage logging
            async with LLMContext(db, endpoint="rephrase_analyze") as ctx:
                agent = RephraseAgent(llm=ctx.llm)
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
