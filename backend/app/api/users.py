"""User API endpoints."""

from fastapi import APIRouter, HTTPException, status

from app.api.deps import CurrentUser, DbSession
from app.schemas.error import ErrorResponse
from app.schemas.user import UserProfileResponse, UserResponse, UserUpdate

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get(
    "/me",
    response_model=UserProfileResponse,
    responses={
        401: {"model": ErrorResponse, "description": "Not authenticated"},
    },
)
async def get_current_user_profile(
    current_user: CurrentUser,
) -> UserProfileResponse:
    """Get the current user's profile."""
    return UserProfileResponse.from_user(current_user)


@router.put(
    "/me",
    response_model=UserProfileResponse,
    responses={
        401: {"model": ErrorResponse, "description": "Not authenticated"},
    },
)
async def update_current_user_profile(
    update_data: UserUpdate,
    current_user: CurrentUser,
    db: DbSession,
) -> UserProfileResponse:
    """Update the current user's profile."""
    # Update only provided fields
    update_dict = update_data.model_dump(exclude_unset=True)
    
    for field, value in update_dict.items():
        setattr(current_user, field, value)
    
    await db.flush()
    await db.refresh(current_user)
    
    return UserProfileResponse.from_user(current_user)
