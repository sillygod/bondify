"""Reading article service."""

from typing import Optional

from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.reading import ReadingArticle


class ReadingService:
    """Service for reading article CRUD operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_article(
        self,
        user_id: int,
        title: str,
        content: str,
        source_url: Optional[str] = None,
    ) -> ReadingArticle:
        """Create a new reading article."""
        # Calculate word count
        word_count = len(content.split())

        # Estimate difficulty based on word count and average word length
        avg_word_length = (
            sum(len(word) for word in content.split()) / word_count
            if word_count > 0
            else 0
        )
        if avg_word_length < 5:
            difficulty = "beginner"
        elif avg_word_length < 6.5:
            difficulty = "intermediate"
        else:
            difficulty = "advanced"

        article = ReadingArticle(
            user_id=user_id,
            title=title,
            content=content,
            source_url=source_url,
            word_count=word_count,
            difficulty_level=difficulty,
        )

        self.db.add(article)
        await self.db.commit()
        await self.db.refresh(article)
        return article

    async def get_user_articles(
        self,
        user_id: int,
        limit: int = 50,
        offset: int = 0,
    ) -> tuple[list[ReadingArticle], int]:
        """Get user's articles with pagination."""
        # Get total count
        count_stmt = select(ReadingArticle).where(ReadingArticle.user_id == user_id)
        count_result = await self.db.execute(count_stmt)
        total = len(count_result.scalars().all())

        # Get paginated articles
        stmt = (
            select(ReadingArticle)
            .where(ReadingArticle.user_id == user_id)
            .order_by(ReadingArticle.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        articles = list(result.scalars().all())

        return articles, total

    async def get_article(
        self, article_id: int, user_id: int
    ) -> Optional[ReadingArticle]:
        """Get a specific article by ID."""
        stmt = select(ReadingArticle).where(
            ReadingArticle.id == article_id,
            ReadingArticle.user_id == user_id,
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def update_article(
        self,
        article_id: int,
        user_id: int,
        title: Optional[str] = None,
        content: Optional[str] = None,
    ) -> Optional[ReadingArticle]:
        """Update an article."""
        article = await self.get_article(article_id, user_id)
        if not article:
            return None

        if title:
            article.title = title
        if content:
            article.content = content
            article.word_count = len(content.split())

        await self.db.commit()
        await self.db.refresh(article)
        return article

    async def delete_article(self, article_id: int, user_id: int) -> bool:
        """Delete an article. Returns True if deleted."""
        stmt = delete(ReadingArticle).where(
            ReadingArticle.id == article_id,
            ReadingArticle.user_id == user_id,
        )
        result = await self.db.execute(stmt)
        await self.db.commit()
        return result.rowcount > 0
