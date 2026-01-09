"""Authentication-related Pydantic schemas."""

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    """Request schema for user registration."""

    email: EmailStr
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")
    display_name: str | None = Field(None, max_length=100)


class LoginRequest(BaseModel):
    """Request schema for user login."""

    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """Response schema for authentication tokens."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshTokenRequest(BaseModel):
    """Request schema for token refresh."""

    refresh_token: str


class TokenPayload(BaseModel):
    """JWT token payload schema."""

    sub: str  # user id
    exp: int  # expiration timestamp
    type: str  # "access" or "refresh"
