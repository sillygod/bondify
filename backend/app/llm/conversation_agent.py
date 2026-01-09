"""Conversation Agent for English conversation practice."""

import json
import uuid
from typing import Any, Optional

from langchain_core.language_models import BaseChatModel
from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph import END, StateGraph

from app.llm.factory import LLMFactory, LLMServiceError
from app.llm.prompts import (
    CONVERSATION_FEEDBACK_PROMPT,
    CONVERSATION_FOLLOWUP_PROMPT,
    CONVERSATION_OPENING_PROMPT,
    CONVERSATION_REPLY_PROMPT,
    CONVERSATION_SYSTEM_PROMPT,
    GRAMMAR_CHECK_PROMPT,
)


class ConversationState(dict):
    """State for conversation workflow."""

    messages: list[dict]
    user_message: str
    assistant_reply: str
    follow_up: str
    correction: Optional[dict]


class ConversationAgent:
    """Agent for handling English conversation practice."""

    def __init__(self, llm: Optional[BaseChatModel] = None):
        """
        Initialize conversation agent.

        Args:
            llm: Optional LLM instance, creates default if not provided
        """
        self.llm = llm or LLMFactory.create()
        self.graph = self._build_graph()

    def _build_graph(self) -> Any:
        """Build LangGraph workflow for conversation."""
        workflow = StateGraph(dict)

        workflow.add_node("analyze_grammar", self._analyze_grammar)
        workflow.add_node("generate_reply", self._generate_reply)
        workflow.add_node("generate_follow_up", self._generate_follow_up)

        workflow.set_entry_point("analyze_grammar")
        workflow.add_edge("analyze_grammar", "generate_reply")
        workflow.add_edge("generate_reply", "generate_follow_up")
        workflow.add_edge("generate_follow_up", END)

        return workflow.compile()

    def _format_history(self, messages: list[dict]) -> str:
        """Format conversation history for prompts."""
        if not messages:
            return "No previous messages."

        formatted = []
        for msg in messages[-10:]:  # Keep last 10 messages for context
            role = "User" if msg.get("role") == "user" else "Assistant"
            formatted.append(f"{role}: {msg.get('content', '')}")

        return "\n".join(formatted)

    async def _analyze_grammar(self, state: dict) -> dict:
        """Analyze user message for grammar mistakes."""
        user_message = state.get("user_message", "")

        try:
            prompt = GRAMMAR_CHECK_PROMPT.format(message=user_message)
            response = await self.llm.ainvoke([HumanMessage(content=prompt)])

            # Parse JSON response
            content = response.content.strip()
            # Handle potential markdown code blocks
            if content.startswith("```"):
                content = content.split("```")[1]
                if content.startswith("json"):
                    content = content[4:]
                content = content.strip()

            result = json.loads(content)

            if result.get("has_error"):
                state["correction"] = {
                    "original": result.get("original", ""),
                    "corrected": result.get("corrected", ""),
                    "explanation": result.get("explanation", ""),
                }
            else:
                state["correction"] = None

        except (json.JSONDecodeError, Exception):
            # If parsing fails, assume no grammar errors
            state["correction"] = None

        return state

    async def _generate_reply(self, state: dict) -> dict:
        """Generate conversational reply."""
        user_message = state.get("user_message", "")
        messages = state.get("messages", [])
        correction = state.get("correction")

        history = self._format_history(messages)

        correction_context = ""
        if correction:
            correction_context = (
                f"Note: The user made a grammar mistake. "
                f"'{correction['original']}' should be '{correction['corrected']}'. "
                f"You may gently acknowledge this in your reply if appropriate."
            )

        prompt = CONVERSATION_REPLY_PROMPT.format(
            history=history,
            message=user_message,
            correction_context=correction_context,
        )

        try:
            response = await self.llm.ainvoke([
                SystemMessage(content=CONVERSATION_SYSTEM_PROMPT),
                HumanMessage(content=prompt),
            ])
            state["assistant_reply"] = response.content.strip()
        except Exception as e:
            raise LLMServiceError(f"Failed to generate reply: {str(e)}")

        return state

    async def _generate_follow_up(self, state: dict) -> dict:
        """Generate follow-up question."""
        messages = state.get("messages", [])
        reply = state.get("assistant_reply", "")

        history = self._format_history(messages)

        prompt = CONVERSATION_FOLLOWUP_PROMPT.format(
            history=history,
            reply=reply,
        )

        try:
            response = await self.llm.ainvoke([HumanMessage(content=prompt)])
            state["follow_up"] = response.content.strip()
        except Exception as e:
            # Follow-up is optional, use empty string on failure
            state["follow_up"] = ""

        return state

    async def process_message(
        self,
        user_message: str,
        conversation_history: list[dict],
    ) -> dict:
        """
        Process user message and return response.

        Args:
            user_message: The user's message
            conversation_history: List of previous messages

        Returns:
            Dict with reply, followUp, and optional correction
        """
        initial_state = {
            "messages": conversation_history,
            "user_message": user_message,
            "assistant_reply": "",
            "follow_up": "",
            "correction": None,
        }

        try:
            result = await self.graph.ainvoke(initial_state)

            response = {
                "reply": result.get("assistant_reply", ""),
                "followUp": result.get("follow_up", ""),
            }

            if result.get("correction"):
                response["correction"] = result["correction"]

            return response

        except Exception as e:
            raise LLMServiceError(f"Conversation processing failed: {str(e)}")

    async def generate_opening(self) -> str:
        """Generate opening message for new conversation."""
        try:
            response = await self.llm.ainvoke([
                SystemMessage(content=CONVERSATION_SYSTEM_PROMPT),
                HumanMessage(content=CONVERSATION_OPENING_PROMPT),
            ])
            return response.content.strip()
        except Exception as e:
            raise LLMServiceError(f"Failed to generate opening: {str(e)}")

    async def generate_feedback(self, messages: list[dict]) -> str:
        """
        Generate conversation feedback summary.

        Args:
            messages: List of conversation messages

        Returns:
            Feedback summary string
        """
        if not messages:
            return "No conversation to analyze."

        conversation = self._format_history(messages)
        prompt = CONVERSATION_FEEDBACK_PROMPT.format(conversation=conversation)

        try:
            response = await self.llm.ainvoke([
                SystemMessage(content=CONVERSATION_SYSTEM_PROMPT),
                HumanMessage(content=prompt),
            ])
            return response.content.strip()
        except Exception as e:
            raise LLMServiceError(f"Failed to generate feedback: {str(e)}")


# Session storage for conversation history (in-memory for now)
_conversation_sessions: dict[str, list[dict]] = {}


def get_session(session_id: str) -> list[dict]:
    """Get conversation history for a session."""
    return _conversation_sessions.get(session_id, [])


def create_session() -> str:
    """Create a new conversation session."""
    session_id = str(uuid.uuid4())
    _conversation_sessions[session_id] = []
    return session_id


def add_message(session_id: str, role: str, content: str, correction: Optional[dict] = None):
    """Add a message to a session."""
    if session_id not in _conversation_sessions:
        _conversation_sessions[session_id] = []

    message = {
        "id": str(uuid.uuid4()),
        "role": role,
        "content": content,
    }
    if correction:
        message["correction"] = correction

    _conversation_sessions[session_id].append(message)


def clear_session(session_id: str):
    """Clear a conversation session."""
    if session_id in _conversation_sessions:
        del _conversation_sessions[session_id]
