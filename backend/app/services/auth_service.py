"""Authentication service for user registration, login, and token management."""

from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.user import User
from app.schemas.auth import TokenPayload, TokenResponse


# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthenticationError(Exception):
    """Custom exception for authentication errors."""

    def __init__(self, code: str, message: str):
        self.code = code
        self.message = message
        super().__init__(message)


class AuthService:
    """Service for handling authentication operations."""

    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password using bcrypt."""
        return pwd_context.hash(password)

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash."""
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def create_access_token(user_id: int) -> str:
        """Create a JWT access token."""
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
        payload = {
            "sub": str(user_id),
            "exp": expire,
            "type": "access",
        }
        return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

    @staticmethod
    def create_refresh_token(user_id: int) -> str:
        """Create a JWT refresh token."""
        expire = datetime.now(timezone.utc) + timedelta(
            days=settings.REFRESH_TOKEN_EXPIRE_DAYS
        )
        payload = {
            "sub": str(user_id),
            "exp": expire,
            "type": "refresh",
        }
        return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


    @staticmethod
    def create_tokens(user_id: int) -> TokenResponse:
        """Create both access and refresh tokens."""
        return TokenResponse(
            access_token=AuthService.create_access_token(user_id),
            refresh_token=AuthService.create_refresh_token(user_id),
        )

    @staticmethod
    def decode_token(token: str) -> TokenPayload:
        """Decode and validate a JWT token."""
        try:
            payload = jwt.decode(
                token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
            )
            return TokenPayload(
                sub=payload["sub"],
                exp=payload["exp"],
                type=payload["type"],
            )
        except JWTError as e:
            raise AuthenticationError("AUTH_TOKEN_INVALID", f"Invalid token: {str(e)}")

    @staticmethod
    def verify_access_token(token: str) -> TokenPayload:
        """Verify an access token and return its payload."""
        payload = AuthService.decode_token(token)
        if payload.type != "access":
            raise AuthenticationError("AUTH_TOKEN_INVALID", "Invalid token type")
        return payload

    @staticmethod
    def verify_refresh_token(token: str) -> TokenPayload:
        """Verify a refresh token and return its payload."""
        payload = AuthService.decode_token(token)
        if payload.type != "refresh":
            raise AuthenticationError("AUTH_TOKEN_INVALID", "Invalid token type")
        return payload

    @staticmethod
    async def register_user(
        db: AsyncSession,
        email: str,
        password: str,
        display_name: Optional[str] = None,
    ) -> User:
        """Register a new user."""
        # Check if user already exists
        result = await db.execute(select(User).where(User.email == email))
        existing_user = result.scalar_one_or_none()
        if existing_user:
            raise AuthenticationError("USER_ALREADY_EXISTS", "User with this email already exists")

        # Create new user
        user = User(
            email=email,
            hashed_password=AuthService.hash_password(password),
            display_name=display_name,
        )
        db.add(user)
        await db.flush()
        await db.refresh(user)
        return user

    @staticmethod
    async def authenticate_user(
        db: AsyncSession,
        email: str,
        password: str,
    ) -> User:
        """Authenticate a user by email and password."""
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()

        if not user:
            raise AuthenticationError("AUTH_INVALID_CREDENTIALS", "Invalid email or password")

        if not AuthService.verify_password(password, user.hashed_password):
            raise AuthenticationError("AUTH_INVALID_CREDENTIALS", "Invalid email or password")

        return user

    @staticmethod
    async def get_user_by_id(db: AsyncSession, user_id: int) -> Optional[User]:
        """Get a user by their ID."""
        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()
