"""API dependencies for dependency injection."""

from typing import Annotated, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.services.auth_service import AuthenticationError, AuthService

# Security scheme for JWT bearer token
security = HTTPBearer()
security_optional = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    """
    Dependency to get the current authenticated user.
    
    Extracts and validates the JWT token from the Authorization header,
    then retrieves the corresponding user from the database.
    """
    try:
        token = credentials.credentials
        payload = AuthService.verify_access_token(token)
        user_id = int(payload.sub)
        
        user = await AuthService.get_user_by_id(db, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"error": "USER_NOT_FOUND", "detail": "User not found", "code": "USER_NOT_FOUND"},
            )
        
        return user
    except AuthenticationError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": e.code, "detail": e.message, "code": e.code},
        )


async def get_current_user_optional(
    credentials: Annotated[Optional[HTTPAuthorizationCredentials], Depends(security_optional)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Optional[User]:
    """
    Optional dependency to get the current user if authenticated.
    
    Returns None if no valid token is provided (instead of raising an error).
    Useful for endpoints that work for both authenticated and anonymous users.
    """
    if not credentials:
        return None
    
    try:
        token = credentials.credentials
        payload = AuthService.verify_access_token(token)
        user_id = int(payload.sub)
        
        user = await AuthService.get_user_by_id(db, user_id)
        return user
    except (AuthenticationError, Exception):
        # Invalid token - treat as unauthenticated
        return None


# Type alias for dependency injection
CurrentUser = Annotated[User, Depends(get_current_user)]
OptionalUser = Annotated[Optional[User], Depends(get_current_user_optional)]
DbSession = Annotated[AsyncSession, Depends(get_db)]


async def get_current_admin_user(
    current_user: CurrentUser,
) -> User:
    """
    Dependency to get the current authenticated user and ensure they are an admin.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges",
        )
    return current_user

