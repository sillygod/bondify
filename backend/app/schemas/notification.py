"""Notification-related Pydantic schemas."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel


NotificationType = Literal["achievement", "streak", "wordlist", "reminder"]


class NotificationBase(BaseModel):
    """Base notification schema."""

    type: NotificationType
    title: str
    message: str


class NotificationCreate(NotificationBase):
    """Schema for creating a notification internally."""

    user_id: int


class NotificationResponse(BaseModel):
    """Response schema for a notification (frontend compatible)."""

    id: int
    type: NotificationType
    title: str
    message: str
    isRead: bool
    createdAt: str

    @classmethod
    def from_notification(cls, notification) -> "NotificationResponse":
        """Create response from Notification model."""
        return cls(
            id=notification.id,
            type=notification.type,
            title=notification.title,
            message=notification.message,
            isRead=notification.is_read,
            createdAt=notification.created_at.isoformat(),
        )


class NotificationListResponse(BaseModel):
    """Response schema for notification list."""

    notifications: list[NotificationResponse]
    unreadCount: int


class UnreadCountResponse(BaseModel):
    """Response schema for unread count only."""

    unreadCount: int


class BroadcastRequest(BaseModel):
    """Request schema for broadcasting notifications."""

    type: NotificationType
    title: str
    message: str
    user_ids: list[int] | None = None  # None = send to all users
