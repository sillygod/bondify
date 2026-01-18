"""Notification service for managing user notifications."""

from sqlalchemy import select, func, update, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification


class NotificationService:
    """Service for notification CRUD operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(
        self,
        user_id: int,
        notification_type: str,
        title: str,
        message: str,
    ) -> Notification:
        """Create a new notification for a user."""
        notification = Notification(
            user_id=user_id,
            type=notification_type,
            title=title,
            message=message,
            is_read=False,
        )
        self.db.add(notification)
        await self.db.flush()
        await self.db.refresh(notification)
        return notification

    async def get_user_notifications(
        self,
        user_id: int,
        limit: int = 50,
        include_read: bool = True,
    ) -> list[Notification]:
        """Get notifications for a user, ordered by most recent."""
        query = select(Notification).where(Notification.user_id == user_id)
        
        if not include_read:
            query = query.where(Notification.is_read == False)
        
        query = query.order_by(Notification.created_at.desc()).limit(limit)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_unread_count(self, user_id: int) -> int:
        """Get count of unread notifications for a user."""
        query = select(func.count(Notification.id)).where(
            Notification.user_id == user_id,
            Notification.is_read == False,
        )
        result = await self.db.execute(query)
        return result.scalar() or 0

    async def mark_as_read(self, notification_id: int, user_id: int) -> bool:
        """Mark a single notification as read. Returns True if found."""
        query = (
            update(Notification)
            .where(Notification.id == notification_id, Notification.user_id == user_id)
            .values(is_read=True)
        )
        result = await self.db.execute(query)
        return result.rowcount > 0

    async def mark_all_as_read(self, user_id: int) -> int:
        """Mark all notifications as read for a user. Returns count updated."""
        query = (
            update(Notification)
            .where(Notification.user_id == user_id, Notification.is_read == False)
            .values(is_read=True)
        )
        result = await self.db.execute(query)
        return result.rowcount

    async def delete_notification(self, notification_id: int, user_id: int) -> bool:
        """Delete a notification. Returns True if found and deleted."""
        query = delete(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == user_id,
        )
        result = await self.db.execute(query)
        return result.rowcount > 0

    # Helper methods for creating specific notification types
    async def create_achievement_notification(
        self, user_id: int, achievement_name: str
    ) -> Notification:
        """Create notification for achievement unlock."""
        return await self.create(
            user_id=user_id,
            notification_type="achievement",
            title="Achievement Unlocked!",
            message=f"You've earned the '{achievement_name}' achievement!",
        )

    async def create_streak_notification(
        self, user_id: int, streak_days: int
    ) -> Notification:
        """Create notification for streak milestone."""
        return await self.create(
            user_id=user_id,
            notification_type="streak",
            title="Streak Milestone",
            message=f"You're on a {streak_days}-day streak! Keep it up!",
        )

    async def create_wordlist_notification(
        self, user_id: int, words_count: int
    ) -> Notification:
        """Create notification for words added to list."""
        word_text = "word" if words_count == 1 else "words"
        return await self.create(
            user_id=user_id,
            notification_type="wordlist",
            title="New Words Added",
            message=f"{words_count} new {word_text} added to your word list.",
        )

    async def broadcast(
        self,
        notification_type: str,
        title: str,
        message: str,
        user_ids: list[int] | None = None,
    ) -> int:
        """Broadcast a notification to multiple users.
        
        Args:
            notification_type: Type of notification
            title: Notification title
            message: Notification message
            user_ids: List of user IDs to send to. If None, sends to all users.
        
        Returns:
            Number of notifications created.
        """
        if user_ids is None:
            # Get all user IDs
            from app.models.user import User
            result = await self.db.execute(select(User.id))
            user_ids = [row[0] for row in result.all()]
        
        count = 0
        for user_id in user_ids:
            await self.create(
                user_id=user_id,
                notification_type=notification_type,
                title=title,
                message=message,
            )
            count += 1
        
        return count
