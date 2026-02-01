"""LLM API endpoints."""

from fastapi import APIRouter, Header, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List

from app.llm.factory import LLMFactory, LLMServiceError
from app.schemas.llm import ModelsListResponse, ModelInfo

router = APIRouter(prefix="/api/llm", tags=["llm"])

class ModelsRequest(BaseModel):
    provider: str
    api_key: str

@router.post("/models", response_model=ModelsListResponse)
async def list_available_models(request: ModelsRequest):
    """
    List available models for the specified provider using the provided API key.
    """
    if not request.api_key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="API Key is required"
        )
        
    try:
        models = LLMFactory.list_models(request.provider, request.api_key)
        return ModelsListResponse(
            models=[ModelInfo(**m) for m in models]
        )
    except LLMServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e)
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
