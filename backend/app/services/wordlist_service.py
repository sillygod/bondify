"""Wordlist service for managing user's vocabulary list."""

import json
from typing import Optional

from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models.user_wordlist import UserWordlist
from app.models.vocabulary_cache import VocabularyCache
from app.services.vocabulary_service import VocabularyService


class WordlistService:
    """Service for managing user's word list."""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.vocabulary_service = VocabularyService(db)

    async def get_user_wordlist(self, user_id: int) -> list[dict]:
        """
        Get all words in user's wordlist with definitions.

        Returns list of word entries with full definition data.
        """
        stmt = (
            select(UserWordlist)
            .options(joinedload(UserWordlist.vocabulary))
            .where(UserWordlist.user_id == user_id)
            .order_by(UserWordlist.added_at.desc())
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
                "part_of_speech": definition_data.get("partOfSpeech", ""),
                "difficulty": definition_data.get("difficulty"),
                "added_at": entry.added_at,
                "last_reviewed": entry.last_reviewed,
                "review_count": entry.review_count,
                "mastery_level": entry.mastery_level,
                "notes": entry.notes,
                "full_definition": definition_data,
            })

        return words

    async def add_word(self, user_id: int, word: str, notes: Optional[str] = None, custom_llm=None) -> dict:
        """
        Add a word to user's wordlist.

        If word doesn't exist in vocabulary cache, it will be looked up first.
        
        Args:
            custom_llm: Optional custom LLM instance for BYOK (Bring Your Own Key)
        """
        normalized_word = word.strip().lower()

        # Check if word already in user's list
        existing = await self._get_entry(user_id, normalized_word)
        if existing:
            raise ValueError(f"Word '{word}' is already in your word list")

        # Get or create vocabulary cache entry
        cache_entry = await self._get_or_create_vocabulary(normalized_word, custom_llm=custom_llm)

        # Create wordlist entry
        entry = UserWordlist(
            user_id=user_id,
            vocabulary_cache_id=cache_entry.id,
            notes=notes,
        )
        self.db.add(entry)
        await self.db.commit()
        await self.db.refresh(entry)

        definition_data = json.loads(cache_entry.definition_json)
        return {
            "id": entry.id,
            "word": cache_entry.word,
            "definition": definition_data.get("definition", ""),
            "part_of_speech": definition_data.get("partOfSpeech", ""),
            "difficulty": definition_data.get("difficulty"),
            "added_at": entry.added_at,
            "last_reviewed": entry.last_reviewed,
            "review_count": entry.review_count,
            "mastery_level": entry.mastery_level,
            "notes": entry.notes,
        }

    async def remove_word(self, user_id: int, word: str) -> bool:
        """Remove a word from user's wordlist."""
        normalized_word = word.strip().lower()
        entry = await self._get_entry(user_id, normalized_word)

        if not entry:
            return False

        await self.db.delete(entry)
        await self.db.commit()
        return True

    async def update_entry(
        self,
        user_id: int,
        word: str,
        notes: Optional[str] = None,
        mastery_level: Optional[int] = None,
    ) -> Optional[dict]:
        """Update a wordlist entry."""
        normalized_word = word.strip().lower()
        entry = await self._get_entry(user_id, normalized_word)

        if not entry:
            return None

        if notes is not None:
            entry.notes = notes
        if mastery_level is not None:
            entry.mastery_level = max(0, min(100, mastery_level))

        await self.db.commit()
        await self.db.refresh(entry)

        definition_data = json.loads(entry.vocabulary.definition_json)
        return {
            "id": entry.id,
            "word": entry.vocabulary.word,
            "definition": definition_data.get("definition", ""),
            "part_of_speech": definition_data.get("partOfSpeech", ""),
            "difficulty": definition_data.get("difficulty"),
            "added_at": entry.added_at,
            "last_reviewed": entry.last_reviewed,
            "review_count": entry.review_count,
            "mastery_level": entry.mastery_level,
            "notes": entry.notes,
        }

    async def get_random_words(
        self,
        user_id: int,
        count: int = 5,
        min_mastery: Optional[int] = None,
        max_mastery: Optional[int] = None,
    ) -> list[dict]:
        """
        Get random words from user's wordlist for practice.

        Args:
            user_id: User's ID
            count: Number of words to return
            min_mastery: Minimum mastery level filter
            max_mastery: Maximum mastery level filter

        Returns:
            List of random word entries
        """
        conditions = [UserWordlist.user_id == user_id]

        if min_mastery is not None:
            conditions.append(UserWordlist.mastery_level >= min_mastery)
        if max_mastery is not None:
            conditions.append(UserWordlist.mastery_level <= max_mastery)

        stmt = (
            select(UserWordlist)
            .options(joinedload(UserWordlist.vocabulary))
            .where(and_(*conditions))
            .order_by(func.random())
            .limit(count)
        )
        result = await self.db.execute(stmt)
        entries = result.scalars().all()

        words = []
        for entry in entries:
            definition_data = json.loads(entry.vocabulary.definition_json)
            words.append({
                "word": entry.vocabulary.word,
                "definition": definition_data.get("definition", ""),
                "part_of_speech": definition_data.get("partOfSpeech", ""),
                "mastery_level": entry.mastery_level,
            })

        return words

    async def get_stats(self, user_id: int) -> dict:
        """Get wordlist statistics for user."""
        stmt = select(UserWordlist).where(UserWordlist.user_id == user_id)
        result = await self.db.execute(stmt)
        entries = result.scalars().all()

        total = len(entries)
        if total == 0:
            return {
                "total_words": 0,
                "words_mastered": 0,
                "words_learning": 0,
                "words_new": 0,
                "average_mastery": 0.0,
            }

        mastered = sum(1 for e in entries if e.mastery_level >= 80)
        learning = sum(1 for e in entries if 20 <= e.mastery_level < 80)
        new = sum(1 for e in entries if e.mastery_level < 20)
        avg_mastery = sum(e.mastery_level for e in entries) / total

        return {
            "total_words": total,
            "words_mastered": mastered,
            "words_learning": learning,
            "words_new": new,
            "average_mastery": round(avg_mastery, 1),
        }

    async def _get_entry(self, user_id: int, word: str) -> Optional[UserWordlist]:
        """Get a specific wordlist entry."""
        stmt = (
            select(UserWordlist)
            .options(joinedload(UserWordlist.vocabulary))
            .join(VocabularyCache)
            .where(
                and_(
                    UserWordlist.user_id == user_id,
                    VocabularyCache.word == word,
                )
            )
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def _get_or_create_vocabulary(self, word: str, custom_llm=None) -> VocabularyCache:
        """Get vocabulary cache entry, creating if needed via AI lookup."""
        # Check cache first
        stmt = select(VocabularyCache).where(VocabularyCache.word == word)
        result = await self.db.execute(stmt)
        cache_entry = result.scalar_one_or_none()

        if cache_entry:
            return cache_entry

        # Lookup via AI and cache
        definition, _ = await self.vocabulary_service.lookup_word(word, custom_llm=custom_llm)

        # The lookup_word already saves to cache, so fetch it
        result = await self.db.execute(stmt)
        return result.scalar_one()
