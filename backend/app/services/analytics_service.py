"""Analytics service for weakness analysis."""

from datetime import datetime, timedelta
from typing import Optional
from collections import defaultdict

from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.answer_record import AnswerRecord


class AnalyticsService:
    """Service for analyzing user learning weaknesses."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def record_answer(
        self,
        user_id: int,
        word: str,
        game_type: str,
        is_correct: bool,
        part_of_speech: Optional[str] = None,
        question_type: Optional[str] = None,
        user_answer: Optional[str] = None,
        correct_answer: Optional[str] = None,
    ) -> AnswerRecord:
        """Record a user's answer for later analysis."""
        record = AnswerRecord(
            user_id=user_id,
            word=word.lower(),
            part_of_speech=part_of_speech.lower() if part_of_speech else None,
            game_type=game_type,
            is_correct=is_correct,
            question_type=question_type,
            user_answer=user_answer,
            correct_answer=correct_answer,
            answered_at=datetime.utcnow(),
        )
        self.db.add(record)
        await self.db.flush()
        await self.db.refresh(record)
        return record

    async def get_weakness_analysis(
        self,
        user_id: int,
        days: int = 30,
        min_attempts: int = 2,
    ) -> dict:
        """
        Get weakness analysis for a user.
        
        Returns breakdown by part of speech and list of frequently missed words.
        """
        start_date = datetime.utcnow() - timedelta(days=days)

        # Get all answer records in time range
        result = await self.db.execute(
            select(AnswerRecord).where(
                and_(
                    AnswerRecord.user_id == user_id,
                    AnswerRecord.answered_at >= start_date,
                )
            )
        )
        records = result.scalars().all()

        if not records:
            return {
                "totalAnswers": 0,
                "overallAccuracy": 0.0,
                "byPartOfSpeech": [],
                "topWeakWords": [],
                "byGameType": [],
                "periodDays": days,
            }

        # Aggregate by part of speech
        pos_stats = defaultdict(lambda: {"correct": 0, "total": 0})
        word_stats = defaultdict(lambda: {"correct": 0, "total": 0, "pos": None})
        game_stats = defaultdict(lambda: {"correct": 0, "total": 0})

        for record in records:
            pos = record.part_of_speech or "unknown"
            pos_stats[pos]["total"] += 1
            pos_stats[pos]["correct"] += 1 if record.is_correct else 0

            word_key = record.word
            word_stats[word_key]["total"] += 1
            word_stats[word_key]["correct"] += 1 if record.is_correct else 0
            word_stats[word_key]["pos"] = pos

            game = record.game_type
            game_stats[game]["total"] += 1
            game_stats[game]["correct"] += 1 if record.is_correct else 0

        # Calculate by part of speech
        by_pos = []
        for pos, stats in pos_stats.items():
            accuracy = stats["correct"] / stats["total"] if stats["total"] > 0 else 0
            by_pos.append({
                "partOfSpeech": pos,
                "totalAnswers": stats["total"],
                "correctAnswers": stats["correct"],
                "accuracy": round(accuracy, 3),
                "errorRate": round(1 - accuracy, 3),
            })
        by_pos.sort(key=lambda x: x["accuracy"])  # Weakest first

        # Calculate weak words (filtered by min attempts, sorted by error rate)
        weak_words = []
        for word, stats in word_stats.items():
            if stats["total"] >= min_attempts:
                accuracy = stats["correct"] / stats["total"]
                if accuracy < 1.0:  # Only include words with at least one error
                    weak_words.append({
                        "word": word,
                        "partOfSpeech": stats["pos"],
                        "totalAttempts": stats["total"],
                        "correctCount": stats["correct"],
                        "accuracy": round(accuracy, 3),
                        "errorRate": round(1 - accuracy, 3),
                    })
        weak_words.sort(key=lambda x: (-x["errorRate"], -x["totalAttempts"]))
        top_weak_words = weak_words[:10]  # Top 10 weakest

        # Calculate by game type
        by_game = []
        for game, stats in game_stats.items():
            accuracy = stats["correct"] / stats["total"] if stats["total"] > 0 else 0
            by_game.append({
                "gameType": game,
                "totalAnswers": stats["total"],
                "correctAnswers": stats["correct"],
                "accuracy": round(accuracy, 3),
            })
        by_game.sort(key=lambda x: -x["totalAnswers"])

        # Overall stats
        total_answers = len(records)
        correct_answers = sum(1 for r in records if r.is_correct)
        overall_accuracy = correct_answers / total_answers if total_answers > 0 else 0

        return {
            "totalAnswers": total_answers,
            "correctAnswers": correct_answers,
            "overallAccuracy": round(overall_accuracy, 3),
            "byPartOfSpeech": by_pos,
            "topWeakWords": top_weak_words,
            "byGameType": by_game,
            "periodDays": days,
        }
