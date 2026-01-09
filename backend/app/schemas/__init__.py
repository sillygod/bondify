"""Pydantic schemas for API request/response validation."""

from app.schemas.auth import (
    LoginRequest,
    RefreshTokenRequest,
    RegisterRequest,
    TokenPayload,
    TokenResponse,
)
from app.schemas.error import ErrorResponse
from app.schemas.user import (
    UserBase,
    UserCreate,
    UserProfileResponse,
    UserResponse,
    UserUpdate,
)
from app.schemas.progress import (
    ActivityRequest,
    ActivityResponse,
    AchievementResponse,
    AchievementsListResponse,
    LearningStats,
    StreakData,
    StreakDay,
)

__all__ = [
    # Auth schemas
    "LoginRequest",
    "RefreshTokenRequest",
    "RegisterRequest",
    "TokenPayload",
    "TokenResponse",
    # Error schemas
    "ErrorResponse",
    # User schemas
    "UserBase",
    "UserCreate",
    "UserProfileResponse",
    "UserResponse",
    "UserUpdate",
    # Progress schemas
    "ActivityRequest",
    "ActivityResponse",
    "AchievementResponse",
    "AchievementsListResponse",
    "LearningStats",
    "StreakData",
    "StreakDay",
]
