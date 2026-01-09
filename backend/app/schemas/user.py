"""User-related Pydantic schemas."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    """Base user schema with common fields."""

    email: EmailStr
    display_name: str | None = None
    learning_level: Literal["beginner", "intermediate", "advanced"] = "intermediate"
    sound_enabled: bool = True
    notifications_enabled: bool = True


class UserCreate(UserBase):
    """Schema for creating a new user."""

    password: str = Field(..., min_length=8)


class UserUpdate(BaseModel):
    """Schema for updating user profile."""

    display_name: str | None = Field(None, max_length=100)
    learning_level: Literal["beginner", "intermediate", "advanced"] | None = None
    sound_enabled: bool | None = None
    notifications_enabled: bool | None = None


class UserResponse(BaseModel):
    """Response schema for user data."""

    id: int
    email: EmailStr
    display_name: str | None
    learning_level: Literal["beginner", "intermediate", "advanced"]
    sound_enabled: bool
    notifications_enabled: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserProfileResponse(BaseModel):
    """Response schema for user profile (frontend compatible)."""

    id: int
    email: str
    displayName: str | None
    learningLevel: Literal["beginner", "intermediate", "advanced"]
    soundEnabled: bool
    notificationsEnabled: bool
    createdAt: str

    @classmethod
    def from_user(cls, user) -> "UserProfileResponse":
        """Create profile response from User model."""
        return cls(
            id=user.id,
            email=user.email,
            displayName=user.display_name,
            learningLevel=user.learning_level,
            soundEnabled=user.sound_enabled,
            notificationsEnabled=user.notifications_enabled,
            createdAt=user.created_at.isoformat(),
        )
