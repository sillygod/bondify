"""Vocabulary caching service."""

import json
from typing import Optional, Tuple

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.vocabulary_cache import VocabularyCache
from app.llm.vocabulary_agent import get_vocabulary_agent


class VocabularyService:
    """Service for vocabulary lookup with caching."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def lookup_word(self, word: str) -> Tuple[dict, str]:
        """
        Look up a word, using cache if available.

        Args:
            word: The word to look up

        Returns:
            Tuple of (word definition dict, source: "cache" or "ai")
        """
        normalized_word = word.strip().lower()

        # Try cache first
        cached = await self._get_cached(normalized_word)
        if cached:
            # Increment lookup count
            cached.lookup_count += 1
            await self.db.commit()
            return json.loads(cached.definition_json), "cache"

        # Cache miss - call AI
        agent = get_vocabulary_agent()
        result = await agent.lookup_word(normalized_word)

        # Save to cache
        await self._save_to_cache(normalized_word, result)

        return result, "ai"

    async def _get_cached(self, word: str) -> Optional[VocabularyCache]:
        """Get cached word definition if exists."""
        stmt = select(VocabularyCache).where(VocabularyCache.word == word)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def _save_to_cache(self, word: str, definition: dict) -> VocabularyCache:
        """Save word definition to cache."""
        cache_entry = VocabularyCache(
            word=word,
            definition_json=json.dumps(definition, ensure_ascii=False),
            lookup_count=1,
        )
        self.db.add(cache_entry)
        await self.db.commit()
        await self.db.refresh(cache_entry)
        return cache_entry

    async def get_cache_stats(self) -> dict:
        """Get cache statistics."""
        from sqlalchemy import func

        stmt = select(
            func.count(VocabularyCache.id).label("total_words"),
            func.sum(VocabularyCache.lookup_count).label("total_lookups"),
        )
        result = await self.db.execute(stmt)
        row = result.one()
        return {
            "cached_words": row.total_words or 0,
            "total_lookups": row.total_lookups or 0,
        }
