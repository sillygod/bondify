"""Error response schemas."""

from pydantic import BaseModel


class ErrorResponse(BaseModel):
    """Standard error response format."""

    error: str
    detail: str
    code: str


# Standard error codes
ERROR_CODES = {
    "AUTH_INVALID_CREDENTIALS": "Invalid email or password",
    "AUTH_TOKEN_EXPIRED": "Token has expired",
    "AUTH_TOKEN_INVALID": "Invalid token",
    "USER_NOT_FOUND": "User not found",
    "USER_ALREADY_EXISTS": "User with this email already exists",
    "LLM_SERVICE_ERROR": "AI service temporarily unavailable",
    "VALIDATION_ERROR": "Invalid input data",
}
