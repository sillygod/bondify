"""Spaced Repetition Service using FSRS algorithm."""

import json
from datetime import datetime, timezone
from typing import Optional

from fsrs import Card, Rating, Scheduler
from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models.user_wordlist import UserWordlist
from app.models.vocabulary_cache import VocabularyCache


class SpacedRepetitionService:
    """Service for managing spaced repetition using FSRS algorithm."""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.scheduler = Scheduler(
            desired_retention=0.9,  # 90% target retention rate
            maximum_interval=365,   # Max 1 year interval
        )

    async def get_due_words(self, user_id: int, limit: int = 20) -> list[dict]:
        """
        Get words that are due for review.

        Returns words where fsrs_due <= now, ordered by due date.
        Also includes new words (fsrs_card_json is None) that haven't started SRS.
        """
        now = datetime.now(timezone.utc)

        # Query due words
        stmt = (
            select(UserWordlist)
            .options(joinedload(UserWordlist.vocabulary))
            .where(
                and_(
                    UserWordlist.user_id == user_id,
                    # Due now OR not yet initialized (new)
                    (UserWordlist.fsrs_due <= now) | (UserWordlist.fsrs_card_json.is_(None)),
                )
            )
            .order_by(
                # Prioritize: new cards first, then by due date
                UserWordlist.fsrs_card_json.is_(None).desc(),
                UserWordlist.fsrs_due.asc(),
            )
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        entries = result.scalars().all()

        words = []
        for entry in entries:
            definition_data = json.loads(entry.vocabulary.definition_json)
            words.append({
                "id": entry.id,
                "word": entry.vocabulary.word,
                "definition": definition_data.get("definition", ""),
                "partOfSpeech": definition_data.get("partOfSpeech", ""),
                "pronunciation": definition_data.get("pronunciation", ""),
                "examples": definition_data.get("exampleSentences", []),
                "state": entry.fsrs_state or "New",
                "due": entry.fsrs_due.isoformat() if entry.fsrs_due else None,
            })

        return words

    async def record_review(
        self, user_id: int, word_id: int, rating: int
    ) -> dict:
        """
        Record a review result and update the FSRS schedule.

        Args:
            user_id: User's ID
            word_id: UserWordlist entry ID
            rating: 1=Again, 2=Hard, 3=Good, 4=Easy

        Returns:
            Updated card info including next due date
        """
        # Get the wordlist entry
        stmt = (
            select(UserWordlist)
            .options(joinedload(UserWordlist.vocabulary))
            .where(
                and_(
                    UserWordlist.id == word_id,
                    UserWordlist.user_id == user_id,
                )
            )
        )
        result = await self.db.execute(stmt)
        entry = result.scalar_one_or_none()

        if not entry:
            raise ValueError(f"Word entry {word_id} not found for user {user_id}")

        # Get or create FSRS card
        if entry.fsrs_card_json:
            card = Card.from_json(entry.fsrs_card_json)
        else:
            card = Card()

        # Review the card
        fsrs_rating = Rating(rating)
        card, review_log = self.scheduler.review_card(card, fsrs_rating)

        # Update database
        entry.fsrs_card_json = card.to_json()
        entry.fsrs_due = card.due
        entry.fsrs_state = card.state.name
        entry.last_reviewed = datetime.now(timezone.utc)
        entry.review_count += 1

        # Update mastery level based on state and stability
        entry.mastery_level = self._calculate_mastery(card)

        await self.db.commit()
        await self.db.refresh(entry)

        return {
            "id": entry.id,
            "word": entry.vocabulary.word,
            "state": entry.fsrs_state,
            "due": entry.fsrs_due.isoformat() if entry.fsrs_due else None,
            "masteryLevel": entry.mastery_level,
            "reviewCount": entry.review_count,
        }

    async def get_srs_stats(self, user_id: int) -> dict:
        """Get SRS statistics for a user."""
        now = datetime.now(timezone.utc)

        # Get all wordlist entries
        stmt = select(UserWordlist).where(UserWordlist.user_id == user_id)
        result = await self.db.execute(stmt)
        entries = result.scalars().all()

        total = len(entries)
        if total == 0:
            return {
                "totalCards": 0,
                "dueToday": 0,
                "newCards": 0,
                "learningCards": 0,
                "reviewCards": 0,
                "relearningCards": 0,
                "averageRetention": 0.0,
            }

        # Count by state
        new_count = sum(1 for e in entries if not e.fsrs_card_json)
        due_count = sum(
            1 for e in entries
            if e.fsrs_due and e.fsrs_due <= now
        )
        learning = sum(1 for e in entries if e.fsrs_state == "Learning")
        review = sum(1 for e in entries if e.fsrs_state == "Review")
        relearning = sum(1 for e in entries if e.fsrs_state == "Relearning")

        # Calculate average retention (based on mastery levels)
        avg_mastery = sum(e.mastery_level for e in entries) / total if total > 0 else 0

        return {
            "totalCards": total,
            "dueToday": due_count + new_count,  # Include new cards as "due"
            "newCards": new_count,
            "learningCards": learning,
            "reviewCards": review,
            "relearningCards": relearning,
            "averageRetention": round(avg_mastery / 100, 2),  # Convert to 0-1 scale
        }

    async def get_review_forecast(self, user_id: int, days: int = 7) -> list[dict]:
        """Get review forecast for the next N days."""
        now = datetime.now(timezone.utc)

        stmt = select(UserWordlist).where(
            and_(
                UserWordlist.user_id == user_id,
                UserWordlist.fsrs_due.isnot(None),
            )
        )
        result = await self.db.execute(stmt)
        entries = result.scalars().all()

        # Count due cards per day
        forecast = []
        for i in range(days):
            day_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
            day_start = day_start.replace(day=day_start.day + i)
            day_end = day_start.replace(day=day_start.day + 1)

            count = sum(
                1 for e in entries
                if e.fsrs_due and day_start <= e.fsrs_due < day_end
            )
            forecast.append({
                "date": day_start.date().isoformat(),
                "count": count,
            })

        return forecast

    async def init_card_for_word(self, entry: UserWordlist) -> None:
        """Initialize FSRS card for a new word."""
        card = Card()
        entry.fsrs_card_json = card.to_json()
        entry.fsrs_due = card.due
        entry.fsrs_state = card.state.name

    def _calculate_mastery(self, card: Card) -> int:
        """
        Calculate mastery level (0-100) based on FSRS card state.

        Uses card stability and state to estimate mastery.
        """
        # Get retrievability (probability of recall)
        retrievability = self.scheduler.get_card_retrievability(card)

        # Base mastery on state
        state_bonus = {
            "New": 0,
            "Learning": 10,
            "Review": 50,
            "Relearning": 20,
        }
        base = state_bonus.get(card.state.name, 0)

        # Add retrievability contribution (0-50)
        retrieval_bonus = int(retrievability * 50)

        return min(100, base + retrieval_bonus)
