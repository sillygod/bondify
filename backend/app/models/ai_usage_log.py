"""AI Usage Log model for tracking API usage."""

from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.models.base import BaseModel


class AIUsageLog(BaseModel):
    """Log of AI API usage for tracking and analytics."""

    __tablename__ = "ai_usage_logs"

    provider_id = Column(Integer, ForeignKey("ai_providers.id", ondelete="CASCADE"), nullable=False)
    endpoint = Column(String(255), nullable=False)  # e.g., "/api/admin/questions/generate"
    tokens_used = Column(Integer, nullable=True)  # If API returns token count
    success = Column(Boolean, default=True, nullable=False)
    error_message = Column(Text, nullable=True)  # Store error if failed

    # Relationship
    provider = relationship("AIProvider", back_populates="usage_logs")
