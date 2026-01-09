"""Conversation API endpoints."""

from fastapi import APIRouter, HTTPException, status

from app.llm.conversation_agent import (
    ConversationAgent,
    add_message,
    create_session,
    get_session,
)
from app.llm.factory import LLMServiceError
from app.schemas.conversation import (
    ConversationFeedbackRequest,
    ConversationFeedbackResponse,
    ConversationMessageRequest,
    ConversationResponse,
    ConversationStartRequest,
    ConversationStartResponse,
)

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
async def start_conversation(request: ConversationStartRequest = None):
    """
    Start a new conversation session.

    Returns a session ID and an opening message from the assistant.
    """
    try:
        agent = get_agent()
        session_id = create_session()
        opening_message = await agent.generate_opening()

        # Add opening message to session history
        add_message(session_id, "assistant", opening_message)

        return ConversationStartResponse(
            session_id=session_id,
            opening_message=opening_message,
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

        # Get conversation history
        history = get_session(session_id)

        # Process message
        result = await agent.process_message(request.message, history)

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
        # Get conversation history first (before creating agent)
        history = get_session(request.session_id)

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

        # Generate feedback
        feedback = await agent.generate_feedback(history)

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
