"""API routes package."""

from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.progress import router as progress_router

__all__ = ["auth_router", "users_router", "progress_router"]
