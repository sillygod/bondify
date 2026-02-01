"""AI Provider model for storing API key configurations."""

from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, String, Text
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class AIProvider(BaseModel):
    """AI Provider configuration with encrypted API key."""

    __tablename__ = "ai_providers"

    name = Column(String(100), nullable=False)  # Custom name like "Production Gemini"
    provider_type = Column(String(50), nullable=False)  # "gemini" or "mistral"
    api_key_encrypted = Column(Text, nullable=False)  # Fernet encrypted API key
    model = Column(String(100), nullable=True)  # Optional model override like "gemini-2.0-flash"
    is_active = Column(Boolean, default=False, nullable=False)  # Only one can be active
    last_used_at = Column(DateTime, nullable=True)

    # Relationship to usage logs
    usage_logs = relationship("AIUsageLog", back_populates="provider", cascade="all, delete-orphan")
