"""Conversation API endpoints."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user_optional
from app.database import get_db
from app.llm.conversation_agent import (
    ConversationAgent,
    add_message,
    create_session,
    get_session,
    get_session_context,
)
from app.llm.factory import LLMServiceError
from app.models.user import User
from app.schemas.conversation import (
    ConversationFeedbackRequest,
    ConversationFeedbackResponse,
    ConversationMessageRequest,
    ConversationResponse,
    ConversationStartRequest,
    ConversationStartResponse,
)
from app.services.wordlist_service import WordlistService

router = APIRouter(prefix="/api/conversation", tags=["conversation"])

# Lazy-loaded agent instance
_agent: ConversationAgent | None = None


def get_agent() -> ConversationAgent:
    """Get or create conversation agent instance."""
    global _agent
    if _agent is None:
        _agent = ConversationAgent()
    return _agent


@router.post("/start", response_model=ConversationStartResponse)
async def start_conversation(
    request: ConversationStartRequest = None,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """
    Start a new conversation session.

    Returns a session ID and an opening message from the assistant.
    Optionally accepts a topic and target vocabulary words to practice.
    If user is authenticated, words may be auto-selected from their word list.
    """
    try:
        agent = get_agent()
        
        # Extract topic and target_words from request
        topic = request.topic if request else None
        target_words = request.target_words if request else None
        
        # If user is authenticated and no words provided, auto-select from their wordlist
        if current_user and not target_words:
            wordlist_service = WordlistService(db)
            random_words = await wordlist_service.get_random_words(
                user_id=current_user.id,
                count=3,
                max_mastery=70,  # Focus on words not yet mastered
            )
            if random_words:
                target_words = [w["word"] for w in random_words]
        
        session_id = create_session(topic=topic, target_words=target_words)
        opening_message = await agent.generate_opening(topic=topic, target_words=target_words)

        # Add opening message to session history
        add_message(session_id, "assistant", opening_message)

        return ConversationStartResponse(
            session_id=session_id,
            opening_message=opening_message,
            topic=topic,
            target_words=target_words,
        )

    except LLMServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "error": "LLM_SERVICE_ERROR",
                "detail": str(e.message),
                "code": "LLM_SERVICE_ERROR",
            },
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "INTERNAL_ERROR",
                "detail": "An unexpected error occurred",
                "code": "INTERNAL_ERROR",
            },
        )


@router.post("/message", response_model=ConversationResponse)
async def send_message(request: ConversationMessageRequest):
    """
    Send a message and receive a response.

    If no session_id is provided, a new session will be created.
    """
    try:
        agent = get_agent()

        # Get or create session
        session_id = request.session_id
        if not session_id:
            session_id = create_session()

        # Get conversation history and context
        history = get_session(session_id)
        context = get_session_context(session_id)
        target_words = context.get("target_words", [])

        # Process message with target_words in state
        result = await agent.process_message(
            request.message, history, target_words=target_words
        )

        # Add user message to history
        add_message(
            session_id,
            "user",
            request.message,
            result.get("correction"),
        )

        # Add assistant reply to history
        full_reply = result["reply"]
        if result.get("followUp"):
            full_reply = f"{result['reply']} {result['followUp']}"

        add_message(session_id, "assistant", full_reply)

        return ConversationResponse(
            reply=result["reply"],
            followUp=result.get("followUp", ""),
            correction=result.get("correction"),
            session_id=session_id,
        )

    except LLMServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "error": "LLM_SERVICE_ERROR",
                "detail": str(e.message),
                "code": "LLM_SERVICE_ERROR",
            },
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "INTERNAL_ERROR",
                "detail": "An unexpected error occurred",
                "code": "INTERNAL_ERROR",
            },
        )


@router.post("/feedback", response_model=ConversationFeedbackResponse)
async def get_feedback(request: ConversationFeedbackRequest):
    """
    Get feedback for a conversation session.

    Analyzes the conversation and provides improvement suggestions.
    """
    try:
        # Get conversation history and context first (before creating agent)
        history = get_session(request.session_id)
        context = get_session_context(request.session_id)
        target_words = context.get("target_words", [])

        if not history:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "error": "SESSION_NOT_FOUND",
                    "detail": "Conversation session not found or empty",
                    "code": "SESSION_NOT_FOUND",
                },
            )

        agent = get_agent()

        # Generate feedback with target words context
        feedback = await agent.generate_feedback(history, target_words=target_words)

        return ConversationFeedbackResponse(
            feedback=feedback,
            session_id=request.session_id,
        )

    except HTTPException:
        raise
    except LLMServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "error": "LLM_SERVICE_ERROR",
                "detail": str(e.message),
                "code": "LLM_SERVICE_ERROR",
            },
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "INTERNAL_ERROR",
                "detail": "An unexpected error occurred",
                "code": "INTERNAL_ERROR",
            },
        )
