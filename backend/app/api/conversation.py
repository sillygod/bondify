"""Conversation API endpoints."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user_optional
from app.database import get_db
from app.llm.conversation_agent import (
    ConversationAgent,
    add_message,
    create_session,
    get_session,
    get_session_context,
    get_available_scenarios,
    get_scenario_opening,
    get_scenario_data,
)
from app.llm.factory import LLMFactory, LLMServiceError, get_active_llm_config
from app.models.user import User
from app.schemas.conversation import (
    ConversationFeedbackRequest,
    ConversationFeedbackResponse,
    ConversationMessageRequest,
    ConversationResponse,
    ConversationStartRequest,
    ConversationStartResponse,
    ScenarioInfo,
    ScenariosListResponse,
)
from app.services.wordlist_service import WordlistService

router = APIRouter(prefix="/api/conversation", tags=["conversation"])


async def get_conversation_agent(
    db: AsyncSession = Depends(get_db),
    provider: Optional[str] = Header(None, alias="X-Bondify-AI-Provider"),
    api_key: Optional[str] = Header(None, alias="X-Bondify-AI-Key"),
    model: Optional[str] = Header(None, alias="X-Bondify-AI-Model"),
) -> ConversationAgent:
    """
    Dependency to get conversation agent.
    
    Priority:
    1. User-provided API key/provider/model via headers (BYOK)
    2. DB-configured active provider
    3. Environment variables fallback
    """
    try:
        # If user provides custom API key, use that
        if api_key:
            llm = LLMFactory.create(provider=provider, api_key=api_key, model=model)
        else:
            # Use DB-configured or ENV fallback
            config = await get_active_llm_config(db)
            llm = LLMFactory.create(
                provider=config["provider_type"],
                api_key=config["api_key"],
                model=config.get("model") or model,
            )
        return ConversationAgent(llm=llm)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "LLM_CONFIG_ERROR", "detail": str(e)},
        )


@router.get("/scenarios", response_model=ScenariosListResponse)
async def list_scenarios():
    """Get list of available conversation scenarios for role-play practice."""
    scenarios = get_available_scenarios()
    return ScenariosListResponse(
        scenarios=[ScenarioInfo(**s) for s in scenarios]
    )


@router.post("/start", response_model=ConversationStartResponse)
async def start_conversation(
    request: ConversationStartRequest = None,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
    agent: ConversationAgent = Depends(get_conversation_agent),
):
    """
    Start a new conversation session.

    Returns a session ID and an opening message from the assistant.
    Optionally accepts a topic, target vocabulary words, or a scenario for role-play.
    If scenario is provided, uses predefined scenario settings.
    If user is authenticated, words may be auto-selected from their word list.
    """
    try:
        # Extract options from request
        topic = request.topic if request else None
        target_words = request.target_words if request else None
        scenario = request.scenario if request else None
        
        # Scenario-specific handling
        scenario_name = None
        user_role = None
        user_goal = None
        
        if scenario:
            scenario_data = get_scenario_data(scenario)
            if scenario_data:
                scenario_name = scenario_data.get("name")
                user_role = scenario_data.get("user_role")
                user_goal = scenario_data.get("user_goal")
                target_words = scenario_data.get("vocabulary", [])
                # Use predefined scenario opening
                opening_message = get_scenario_opening(scenario)
            else:
                scenario = None  # Invalid scenario, fall back to normal mode
        
        # Create session with scenario support
        session_id = create_session(topic=topic, target_words=target_words, scenario=scenario)
        
        # Generate opening if not using scenario (or scenario opening failed)
        if not scenario or not opening_message:
            # If user is authenticated and no words provided, auto-select from wordlist
            if current_user and not target_words:
                wordlist_service = WordlistService(db)
                random_words = await wordlist_service.get_random_words(
                    user_id=current_user.id,
                    count=3,
                    max_mastery=70,
                )
                if random_words:
                    target_words = [w["word"] for w in random_words]
            
            opening_message = await agent.generate_opening(topic=topic, target_words=target_words)

        # Add opening message to session history
        add_message(session_id, "assistant", opening_message)

        return ConversationStartResponse(
            session_id=session_id,
            opening_message=opening_message,
            topic=topic,
            target_words=target_words,
            scenario=scenario,
            scenario_name=scenario_name,
            user_role=user_role,
            user_goal=user_goal,
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
async def send_message(
    request: ConversationMessageRequest,
    agent: ConversationAgent = Depends(get_conversation_agent),
):
    """
    Send a message and receive a response.

    If no session_id is provided, a new session will be created.
    """
    try:
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
async def get_feedback(
    request: ConversationFeedbackRequest,
    agent: ConversationAgent = Depends(get_conversation_agent),
):
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

        # Generate feedback with target words context

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
