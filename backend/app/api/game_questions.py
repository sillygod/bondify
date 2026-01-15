"""Game Questions API endpoints."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.llm.factory import LLMServiceError
from app.services.game_question_service import GameQuestionService

router = APIRouter(prefix="/api/game-questions", tags=["game-questions"])


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


@router.post("/generate", response_model=GenerateQuestionsResponse)
async def generate_questions(
    request: GenerateQuestionsRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Generate new game questions using AI.

    This endpoint calls the LLM to generate new questions and saves them to the database.
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


@router.get("/{game_type}")
async def get_questions(
    game_type: str,
    limit: int = Query(default=10, ge=1, le=50),
    only_reviewed: bool = Query(default=False),
    random_order: bool = Query(default=True),
    db: AsyncSession = Depends(get_db),
):
    """
    Get game questions for a specific game type.

    Returns questions from the database. Use only_reviewed=true for production use.
    """
    valid_types = [
        "clarity", "transitions", "brevity", "context",
        "diction", "punctuation", "listening", "speed_reading",
        "word_parts", "rocket", "rephrase", "recall", "attention"
    ]
    if game_type not in valid_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "INVALID_GAME_TYPE", "detail": f"Valid types: {valid_types}"},
        )

    service = GameQuestionService(db)
    questions = await service.get_questions(
        game_type=game_type,
        limit=limit,
        only_reviewed=only_reviewed,
        random_order=random_order,
    )

    return {"game_type": game_type, "count": len(questions), "questions": questions}


@router.get("/")
async def get_question_stats(db: AsyncSession = Depends(get_db)):
    """Get statistics about stored questions."""
    service = GameQuestionService(db)
    stats = await service.get_question_stats()
    return {"stats": stats}


@router.patch("/{question_id}/review")
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
