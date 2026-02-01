"""Admin API endpoints."""

from typing import List, Optional

from fastapi import APIRouter, Body, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentUser, DbSession, get_current_admin_user
from app.database import get_db
from app.llm.factory import LLMServiceError
from app.models.user import User
from app.schemas.notification import BroadcastRequest
from app.services.game_question_service import GameQuestionService
from app.services.notification_service import NotificationService
from app.services.vocabulary_service import VocabularyService

router = APIRouter(prefix="/api/admin", tags=["admin"], dependencies=[Depends(get_current_admin_user)])


# =============================================================================
# Game Questions
# =============================================================================

class GenerateQuestionsRequest(BaseModel):
    """Request to generate new game questions."""

    game_type: str = Field(
        ..., description="Type of game: clarity, transitions, brevity, context, diction, punctuation, listening, speed_reading, word_parts, rocket, rephrase, recall, attention"
    )
    count: int = Field(default=5, ge=1, le=20, description="Number of questions")
    difficulty: str = Field(default="medium", description="Difficulty level")


class GenerateQuestionsResponse(BaseModel):
    """Response from question generation."""

    generated: int
    game_type: str
    questions: list


@router.post("/questions/generate", response_model=GenerateQuestionsResponse)
async def generate_questions(
    request: GenerateQuestionsRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Generate new game questions using AI.
    """
    try:
        service = GameQuestionService(db)
        questions = await service.generate_questions(
            game_type=request.game_type,
            count=request.count,
            difficulty=request.difficulty,
        )

        return GenerateQuestionsResponse(
            generated=len(questions),
            game_type=request.game_type,
            questions=questions,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "VALIDATION_ERROR", "detail": str(e)},
        )
    except LLMServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"error": "LLM_SERVICE_ERROR", "detail": str(e.message)},
        )


@router.get("/questions/stats")
async def get_question_stats(db: AsyncSession = Depends(get_db)):
    """Get statistics about stored questions."""
    service = GameQuestionService(db)
    stats = await service.get_question_stats()
    return {"stats": stats}


@router.patch("/questions/{question_id}/review")
async def mark_question_reviewed(
    question_id: int,
    reviewed: bool = Query(default=True),
    db: AsyncSession = Depends(get_db),
):
    """Mark a question as reviewed (or unreviewed)."""
    service = GameQuestionService(db)
    success = await service.mark_reviewed(question_id, reviewed)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "NOT_FOUND", "detail": "Question not found"},
        )

    return {"success": True, "question_id": question_id, "is_reviewed": reviewed}


@router.delete("/questions/{question_id}")
async def delete_question(
    question_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Delete a generated question."""
    service = GameQuestionService(db)
    success = await service.delete_question(question_id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "NOT_FOUND", "detail": "Question not found"},
        )

    return {"success": True, "question_id": question_id}


@router.patch("/questions/{question_id}")
async def update_question(
    question_id: int,
    updates: dict = Body(...),
    db: AsyncSession = Depends(get_db),
):
    """Update a generated question."""
    service = GameQuestionService(db)
    updated_question = await service.update_question(question_id, updates)

    if not updated_question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "NOT_FOUND", "detail": "Question not found"},
        )

    return updated_question


# =============================================================================
# Notifications
# =============================================================================

@router.post("/notifications/broadcast")
async def broadcast_notification(
    request: BroadcastRequest,
    db: DbSession,
) -> dict:
    """Broadcast a notification to multiple users."""
    service = NotificationService(db)
    count = await service.broadcast(
        notification_type=request.type,
        title=request.title,
        message=request.message,
        user_ids=request.user_ids,
    )
    return {"success": True, "notificationsSent": count}


# =============================================================================
# Vocabulary
# =============================================================================

@router.get("/vocabulary/cache-stats")
async def get_cache_stats(db: AsyncSession = Depends(get_db)):
    """Get vocabulary cache statistics."""
    service = VocabularyService(db)
    return await service.get_cache_stats()


# =============================================================================
# AI Settings
# =============================================================================

class CreateProviderRequest(BaseModel):
    """Request to create a new AI provider."""
    name: str = Field(..., min_length=1, max_length=100)
    provider_type: str = Field(..., pattern="^(gemini|mistral)$")
    api_key: str = Field(..., min_length=1)
    model: Optional[str] = None
    set_active: bool = False


class UpdateProviderRequest(BaseModel):
    """Request to update an AI provider."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    api_key: Optional[str] = Field(None, min_length=1)
    model: Optional[str] = None


class TestConnectionRequest(BaseModel):
    """Request to test AI provider connection."""
    provider_type: str = Field(..., pattern="^(gemini|mistral)$")
    api_key: str = Field(..., min_length=1)


@router.get("/ai-providers")
async def list_providers(db: AsyncSession = Depends(get_db)):
    """List all AI providers."""
    from app.services.ai_settings_service import AISettingsService
    service = AISettingsService(db)
    providers = await service.get_providers()
    return {
        "providers": [service.provider_to_dict(p) for p in providers],
    }


@router.post("/ai-providers")
async def create_provider(
    request: CreateProviderRequest,
    db: AsyncSession = Depends(get_db),
):
    """Create a new AI provider configuration."""
    from app.services.ai_settings_service import AISettingsService
    service = AISettingsService(db)
    
    provider = await service.create_provider(
        name=request.name,
        provider_type=request.provider_type,
        api_key=request.api_key,
        model=request.model,
        set_active=request.set_active,
    )
    
    return {
        "success": True,
        "provider": service.provider_to_dict(provider),
    }


@router.get("/ai-providers/status")
async def get_provider_status(db: AsyncSession = Depends(get_db)):
    """Get current AI provider status."""
    from app.services.ai_settings_service import AISettingsService
    service = AISettingsService(db)
    return await service.get_provider_status()


@router.post("/ai-providers/test")
async def test_connection(
    request: TestConnectionRequest,
    db: AsyncSession = Depends(get_db),
):
    """Test connection to an AI provider."""
    from app.services.ai_settings_service import AISettingsService
    service = AISettingsService(db)
    return await service.test_connection(request.provider_type, request.api_key)


@router.get("/ai-providers/{provider_id}")
async def get_provider(
    provider_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Get a specific AI provider."""
    from app.services.ai_settings_service import AISettingsService
    service = AISettingsService(db)
    
    provider = await service.get_provider(provider_id)
    if not provider:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "NOT_FOUND", "detail": "Provider not found"},
        )
    
    return service.provider_to_dict(provider)


@router.patch("/ai-providers/{provider_id}")
async def update_provider(
    provider_id: int,
    request: UpdateProviderRequest,
    db: AsyncSession = Depends(get_db),
):
    """Update an AI provider configuration."""
    from app.services.ai_settings_service import AISettingsService
    service = AISettingsService(db)
    
    provider = await service.update_provider(
        provider_id=provider_id,
        name=request.name,
        api_key=request.api_key,
        model=request.model,
    )
    
    if not provider:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "NOT_FOUND", "detail": "Provider not found"},
        )
    
    return {
        "success": True,
        "provider": service.provider_to_dict(provider),
    }


@router.delete("/ai-providers/{provider_id}")
async def delete_provider(
    provider_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Delete an AI provider."""
    from app.services.ai_settings_service import AISettingsService
    service = AISettingsService(db)
    
    success = await service.delete_provider(provider_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "NOT_FOUND", "detail": "Provider not found"},
        )
    
    return {"success": True, "provider_id": provider_id}


@router.post("/ai-providers/{provider_id}/activate")
async def activate_provider(
    provider_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Set a provider as the active one."""
    from app.services.ai_settings_service import AISettingsService
    service = AISettingsService(db)
    
    provider = await service.set_active_provider(provider_id)
    if not provider:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "NOT_FOUND", "detail": "Provider not found"},
        )
    
    return {
        "success": True,
        "provider": service.provider_to_dict(provider),
    }


@router.get("/ai-providers/{provider_id}/usage")
async def get_provider_usage(
    provider_id: int,
    days: int = Query(default=30, ge=1, le=365),
    db: AsyncSession = Depends(get_db),
):
    """Get usage statistics for a provider."""
    from app.services.ai_settings_service import AISettingsService
    service = AISettingsService(db)
    
    provider = await service.get_provider(provider_id)
    if not provider:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "NOT_FOUND", "detail": "Provider not found"},
        )
    
    stats = await service.get_usage_stats(provider_id, days)
    return stats

