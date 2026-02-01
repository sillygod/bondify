"""Game Question Service for managing AI-generated questions."""

import json
import random
from typing import List, Optional

from sqlalchemy import Integer, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.game_question import GameQuestion


class GameQuestionService:
    """Service for generating and managing game questions."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_existing_words(self, game_type: str) -> set:
        """Get all existing words for a game type to avoid duplicates."""
        stmt = select(GameQuestion).where(GameQuestion.game_type == game_type)
        result = await self.db.execute(stmt)
        questions = result.scalars().all()

        existing_words = set()
        for q in questions:
            try:
                data = json.loads(q.question_json)
                # Different game types may use different key names for the main word/sentence
                if "word" in data:
                    existing_words.add(data["word"].lower())
                elif "sentence" in data:
                    existing_words.add(data["sentence"].lower()[:100])  # Use first 100 chars
                elif "originalSentence" in data:
                    existing_words.add(data["originalSentence"].lower()[:100])
                elif "title" in data:  # speed_reading articles
                    existing_words.add(data["title"].lower())
            except (json.JSONDecodeError, KeyError):
                pass

        return existing_words

    async def generate_questions(
        self, game_type: str, count: int = 5, difficulty: str = "medium"
    ) -> List[dict]:
        """
        Generate new questions using AI and save to database.
        Skips duplicate questions based on the main word/sentence.

        Args:
            game_type: Type of game (clarity, transitions, brevity)
            count: Number of questions to generate
            difficulty: Question difficulty level

        Returns:
            List of generated question dictionaries
        """
        from app.llm.factory import LLMContext
        from app.llm.game_question_agent import GameQuestionAgent
        
        # Get existing words to avoid duplicates
        existing_words = await self.get_existing_words(game_type)

        # Use LLMContext to get DB-configured LLM with automatic usage logging
        async with LLMContext(self.db, endpoint=f"game_question_{game_type}") as ctx:
            agent = GameQuestionAgent(llm=ctx.llm)
            # Request more questions than needed to account for potential duplicates
            request_count = count + min(len(existing_words), 10)
            questions = await agent.generate_questions(game_type, request_count, existing_words)

        # Filter out duplicates and limit to requested count
        saved_questions = []
        for question in questions:
            if len(saved_questions) >= count:
                break

            # Check for duplicate based on game type
            is_duplicate = False
            if "word" in question:
                is_duplicate = question["word"].lower() in existing_words
            elif "sentence" in question:
                is_duplicate = question["sentence"].lower()[:100] in existing_words
            elif "originalSentence" in question:
                is_duplicate = question["originalSentence"].lower()[:100] in existing_words
            elif "title" in question:  # speed_reading articles
                is_duplicate = question["title"].lower() in existing_words

            if is_duplicate:
                continue

            # Save to database
            db_question = GameQuestion(
                game_type=game_type,
                question_json=json.dumps(question, ensure_ascii=False),
                difficulty=difficulty,
                is_reviewed=False,
            )
            self.db.add(db_question)
            saved_questions.append({**question, "id": None})

            # Add to existing words to prevent duplicates within this batch
            if "word" in question:
                existing_words.add(question["word"].lower())
            elif "sentence" in question:
                existing_words.add(question["sentence"].lower()[:100])
            elif "originalSentence" in question:
                existing_words.add(question["originalSentence"].lower()[:100])
            elif "title" in question:  # speed_reading articles
                existing_words.add(question["title"].lower())

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

        formatted_questions = []
        for q in questions:
            question_data = {
                "id": q.id,
                **json.loads(q.question_json),
                "difficulty": q.difficulty,
                "is_reviewed": q.is_reviewed,
            }
            # Shuffle options to prevent correct answer from always being first
            if "options" in question_data and isinstance(question_data["options"], list):
                random.shuffle(question_data["options"])
            formatted_questions.append(question_data)

        return formatted_questions

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

    async def delete_question(self, question_id: int) -> bool:
        """Delete a question."""
        stmt = select(GameQuestion).where(GameQuestion.id == question_id)
        result = await self.db.execute(stmt)
        question = result.scalar_one_or_none()

        if not question:
            return False

        await self.db.delete(question)
        await self.db.commit()
        return True

    async def update_question(self, question_id: int, updates: dict) -> Optional[dict]:
        """Update a question."""
        stmt = select(GameQuestion).where(GameQuestion.id == question_id)
        result = await self.db.execute(stmt)
        question = result.scalar_one_or_none()

        if not question:
            return None

        # Update fields if present in updates
        if "question_json" in updates:
            # Validate JSON string
            if isinstance(updates["question_json"], (dict, list)):
                 question.question_json = json.dumps(updates["question_json"], ensure_ascii=False)
            else:
                 # Assume it's already a string, try to validate it
                 try:
                     json.loads(updates["question_json"])
                     question.question_json = updates["question_json"]
                 except json.JSONDecodeError:
                     raise ValueError("Invalid JSON format")

        if "difficulty" in updates:
            question.difficulty = updates["difficulty"]

        if "is_reviewed" in updates:
            question.is_reviewed = updates["is_reviewed"]

        await self.db.commit()
        
        return {
            "id": question.id,
            **json.loads(question.question_json),
            "difficulty": question.difficulty,
            "is_reviewed": question.is_reviewed,
        }
