"""Notification API endpoints."""

from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentUser, DbSession
from app.schemas.notification import (
    NotificationListResponse,
    NotificationResponse,
    UnreadCountResponse,
)
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


@router.get("", response_model=NotificationListResponse)
async def get_notifications(
    current_user: CurrentUser,
    db: DbSession,
    limit: int = 50,
) -> NotificationListResponse:
    """Get user's notifications."""
    service = NotificationService(db)
    notifications = await service.get_user_notifications(current_user.id, limit=limit)
    unread_count = await service.get_unread_count(current_user.id)

    return NotificationListResponse(
        notifications=[
            NotificationResponse.from_notification(n) for n in notifications
        ],
        unreadCount=unread_count,
    )


@router.get("/unread-count", response_model=UnreadCountResponse)
async def get_unread_count(
    current_user: CurrentUser,
    db: DbSession,
) -> UnreadCountResponse:
    """Get count of unread notifications."""
    service = NotificationService(db)
    count = await service.get_unread_count(current_user.id)
    return UnreadCountResponse(unreadCount=count)


@router.patch("/{notification_id}/read")
async def mark_as_read(
    notification_id: int,
    current_user: CurrentUser,
    db: DbSession,
) -> dict:
    """Mark a notification as read."""
    service = NotificationService(db)
    success = await service.mark_as_read(notification_id, current_user.id)

    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")

    return {"success": True}


@router.post("/read-all")
async def mark_all_as_read(
    current_user: CurrentUser,
    db: DbSession,
) -> dict:
    """Mark all notifications as read."""
    service = NotificationService(db)
    count = await service.mark_all_as_read(current_user.id)
    return {"success": True, "count": count}


@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: int,
    current_user: CurrentUser,
    db: DbSession,
) -> dict:
    """Delete a notification."""
    service = NotificationService(db)
    success = await service.delete_notification(notification_id, current_user.id)

    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")

    return {"success": True}




