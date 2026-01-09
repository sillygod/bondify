"""Pydantic schemas for conversation API."""

from typing import Optional

from pydantic import BaseModel, Field


class GrammarCorrection(BaseModel):
    """Grammar correction details."""

    original: str = Field(..., description="The original incorrect phrase")
    corrected: str = Field(..., description="The corrected phrase")
    explanation: str = Field(..., description="Explanation of the correction")


class ConversationStartRequest(BaseModel):
    """Request to start a new conversation."""

    pass  # No parameters needed for now


class ConversationStartResponse(BaseModel):
    """Response when starting a new conversation."""

    session_id: str = Field(..., description="Unique session identifier")
    opening_message: str = Field(..., description="Opening message from the assistant")


class ConversationMessageRequest(BaseModel):
    """Request to send a message in a conversation."""

    message: str = Field(..., min_length=1, description="The user's message")
    session_id: Optional[str] = Field(None, description="Session ID for continuing conversation")


class ConversationResponse(BaseModel):
    """Response from the conversation agent."""

    reply: str = Field(..., description="The assistant's reply")
    followUp: str = Field("", description="A follow-up question to continue the conversation")
    correction: Optional[GrammarCorrection] = Field(
        None, description="Grammar correction if the user made a mistake"
    )
    session_id: Optional[str] = Field(None, description="Session ID for the conversation")


class ConversationMessage(BaseModel):
    """A single message in a conversation."""

    id: str = Field(..., description="Unique message identifier")
    role: str = Field(..., description="Message role: 'user' or 'assistant'")
    content: str = Field(..., description="Message content")
    correction: Optional[GrammarCorrection] = Field(
        None, description="Grammar correction if applicable"
    )


class ConversationFeedbackRequest(BaseModel):
    """Request for conversation feedback."""

    session_id: str = Field(..., description="Session ID to get feedback for")


class ConversationFeedbackResponse(BaseModel):
    """Response with conversation feedback."""

    feedback: str = Field(..., description="Feedback summary for the conversation")
    session_id: str = Field(..., description="Session ID")
