"""Authentication API endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.auth import (
    LoginRequest,
    RefreshTokenRequest,
    RegisterRequest,
    TokenResponse,
)
from app.schemas.error import ErrorResponse
from app.schemas.user import UserResponse
from app.services.auth_service import AuthenticationError, AuthService

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        400: {"model": ErrorResponse, "description": "User already exists"},
    },
)
async def register(
    request: RegisterRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """Register a new user account."""
    try:
        user = await AuthService.register_user(
            db=db,
            email=request.email,
            password=request.password,
            display_name=request.display_name,
        )
        return AuthService.create_tokens(user.id)
    except AuthenticationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": e.code, "detail": e.message, "code": e.code},
        )


@router.post(
    "/login",
    response_model=TokenResponse,
    responses={
        401: {"model": ErrorResponse, "description": "Invalid credentials"},
    },
)
async def login(
    request: LoginRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """Login with email and password."""
    try:
        user = await AuthService.authenticate_user(
            db=db,
            email=request.email,
            password=request.password,
        )
        return AuthService.create_tokens(user.id)
    except AuthenticationError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": e.code, "detail": e.message, "code": e.code},
        )



@router.post(
    "/refresh",
    response_model=TokenResponse,
    responses={
        401: {"model": ErrorResponse, "description": "Invalid or expired token"},
    },
)
async def refresh_token(
    request: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """Refresh access token using refresh token."""
    try:
        payload = AuthService.verify_refresh_token(request.refresh_token)
        user_id = int(payload.sub)
        
        # Verify user still exists
        user = await AuthService.get_user_by_id(db, user_id)
        if not user:
            raise AuthenticationError("USER_NOT_FOUND", "User not found")
        
        return AuthService.create_tokens(user.id)
    except AuthenticationError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": e.code, "detail": e.message, "code": e.code},
        )
