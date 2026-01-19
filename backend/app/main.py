"""FastAPI application entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import init_db, close_db
from app.schemas.error import ErrorResponse
from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.conversation import router as conversation_router
from app.api.vocabulary import router as vocabulary_router
from app.api.rephrase import router as rephrase_router
from app.api.progress import router as progress_router
from app.api.game_questions import router as game_questions_router
from app.api.wordlist import router as wordlist_router
from app.api.notifications import router as notifications_router
from app.api.tts import router as tts_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup and shutdown."""
    # Startup
    await init_db()
    yield
    # Shutdown
    await close_db()


app = FastAPI(
    title=settings.APP_NAME,
    description="Backend API for English Learning Application",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Custom exception classes
class AppException(Exception):
    """Base application exception."""

    def __init__(self, code: str, detail: str, status_code: int = 400):
        self.code = code
        self.detail = detail
        self.status_code = status_code


class AuthenticationError(AppException):
    """Authentication related errors."""

    def __init__(self, code: str, detail: str):
        super().__init__(code, detail, status_code=401)


class LLMServiceError(AppException):
    """LLM service related errors."""

    def __init__(self, detail: str = "AI service temporarily unavailable"):
        super().__init__("LLM_SERVICE_ERROR", detail, status_code=503)


# Exception handlers
@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    """Handle application exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error=exc.code,
            detail=exc.detail,
            code=exc.code,
        ).model_dump(),
    )


@app.exception_handler(AuthenticationError)
async def auth_exception_handler(request: Request, exc: AuthenticationError):
    """Handle authentication exceptions."""
    return JSONResponse(
        status_code=401,
        content=ErrorResponse(
            error=exc.code,
            detail=exc.detail,
            code=exc.code,
        ).model_dump(),
    )


@app.exception_handler(LLMServiceError)
async def llm_exception_handler(request: Request, exc: LLMServiceError):
    """Handle LLM service exceptions."""
    return JSONResponse(
        status_code=503,
        content=ErrorResponse(
            error="LLM_SERVICE_ERROR",
            detail=exc.detail,
            code="LLM_SERVICE_ERROR",
        ).model_dump(),
    )


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": settings.APP_NAME}


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": f"Welcome to {settings.APP_NAME}"}


# Include routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(conversation_router)
app.include_router(vocabulary_router)
app.include_router(rephrase_router)
app.include_router(progress_router)
app.include_router(game_questions_router)
app.include_router(wordlist_router)
app.include_router(notifications_router)
app.include_router(tts_router)

