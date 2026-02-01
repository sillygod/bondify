"""Game Questions API endpoints."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status, Body
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.services.game_question_service import GameQuestionService
from app.llm.game_question_agent import GameQuestionAgent

router = APIRouter(prefix="/api/game-questions", tags=["game-questions"])




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
    valid_types = GameQuestionAgent.SUPPORTED_GAME_TYPES
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






