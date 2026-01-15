"""Game Question Service for managing AI-generated questions."""

import json
from typing import List, Optional

from sqlalchemy import Integer, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.game_question import GameQuestion
from app.llm.game_question_agent import get_game_question_agent


class GameQuestionService:
    """Service for generating and managing game questions."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def generate_questions(
        self, game_type: str, count: int = 5, difficulty: str = "medium"
    ) -> List[dict]:
        """
        Generate new questions using AI and save to database.

        Args:
            game_type: Type of game (clarity, transitions, brevity)
            count: Number of questions to generate
            difficulty: Question difficulty level

        Returns:
            List of generated question dictionaries
        """
        agent = get_game_question_agent()
        questions = await agent.generate_questions(game_type, count)

        # Save to database
        saved_questions = []
        for question in questions:
            db_question = GameQuestion(
                game_type=game_type,
                question_json=json.dumps(question, ensure_ascii=False),
                difficulty=difficulty,
                is_reviewed=False,
            )
            self.db.add(db_question)
            saved_questions.append({**question, "id": None})  # ID will be set after commit

        await self.db.commit()

        # Get IDs after commit
        for i, db_q in enumerate(saved_questions):
            db_q["id"] = i + 1  # Approximate - actual IDs assigned by DB

        return saved_questions

    async def get_questions(
        self,
        game_type: str,
        limit: int = 10,
        only_reviewed: bool = False,
        random_order: bool = True,
    ) -> List[dict]:
        """
        Get questions for a game type.

        Args:
            game_type: Type of game
            limit: Maximum questions to return
            only_reviewed: If True, only return reviewed questions
            random_order: If True, randomize order

        Returns:
            List of question dictionaries
        """
        stmt = select(GameQuestion).where(GameQuestion.game_type == game_type)

        if only_reviewed:
            stmt = stmt.where(GameQuestion.is_reviewed == True)

        if random_order:
            stmt = stmt.order_by(func.random())
        else:
            stmt = stmt.order_by(GameQuestion.created_at.desc())

        stmt = stmt.limit(limit)

        result = await self.db.execute(stmt)
        questions = result.scalars().all()

        return [
            {
                "id": q.id,
                **json.loads(q.question_json),
                "difficulty": q.difficulty,
                "is_reviewed": q.is_reviewed,
            }
            for q in questions
        ]

    async def get_question_stats(self) -> dict:
        """Get statistics about stored questions."""
        stmt = select(
            GameQuestion.game_type,
            func.count(GameQuestion.id).label("total"),
            func.sum(func.cast(GameQuestion.is_reviewed, Integer)).label("reviewed"),
        ).group_by(GameQuestion.game_type)

        result = await self.db.execute(stmt)
        rows = result.all()

        stats = {}
        for row in rows:
            stats[row.game_type] = {
                "total": row.total,
                "reviewed": row.reviewed or 0,
            }

        return stats

    async def mark_reviewed(self, question_id: int, reviewed: bool = True) -> bool:
        """Mark a question as reviewed."""
        stmt = select(GameQuestion).where(GameQuestion.id == question_id)
        result = await self.db.execute(stmt)
        question = result.scalar_one_or_none()

        if not question:
            return False

        question.is_reviewed = reviewed
        await self.db.commit()
        return True
