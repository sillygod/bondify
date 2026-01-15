"""Game Question Agent for AI-powered question generation."""

import json
from typing import Dict, List, Optional, Union

from langchain_core.language_models import BaseChatModel
from langchain_core.messages import HumanMessage

from app.llm.factory import LLMFactory, LLMServiceError
from app.llm.prompts import (
    CLARITY_QUESTION_PROMPT,
    TRANSITIONS_QUESTION_PROMPT,
    BREVITY_QUESTION_PROMPT,
    CONTEXT_QUESTION_PROMPT,
    DICTION_QUESTION_PROMPT,
    PUNCTUATION_QUESTION_PROMPT,
    LISTENING_QUESTION_PROMPT,
    SPEED_READING_QUESTION_PROMPT,
    WORD_PARTS_QUESTION_PROMPT,
    ROCKET_QUESTION_PROMPT,
    REPHRASE_QUESTION_PROMPT,
    RECALL_QUESTION_PROMPT,
    ATTENTION_QUESTION_PROMPT,
)


class GameQuestionAgent:
    """Agent for generating game questions using LLM."""

    SUPPORTED_GAME_TYPES = [
        "clarity",
        "transitions",
        "brevity",
        "context",
        "diction",
        "punctuation",
        "listening",
        "speed_reading",
        "word_parts",
        "rocket",
        "rephrase",
        "recall",
        "attention",
    ]

    def __init__(self, llm: Optional[BaseChatModel] = None):
        """Initialize game question agent."""
        self.llm = llm or LLMFactory.create()

    def _get_prompt_for_type(self, game_type: str, count: int) -> str:
        """Get the appropriate prompt for the game type."""
        prompts = {
            "clarity": CLARITY_QUESTION_PROMPT,
            "transitions": TRANSITIONS_QUESTION_PROMPT,
            "brevity": BREVITY_QUESTION_PROMPT,
            "context": CONTEXT_QUESTION_PROMPT,
            "diction": DICTION_QUESTION_PROMPT,
            "punctuation": PUNCTUATION_QUESTION_PROMPT,
            "listening": LISTENING_QUESTION_PROMPT,
            "speed_reading": SPEED_READING_QUESTION_PROMPT,
            "word_parts": WORD_PARTS_QUESTION_PROMPT,
            "rocket": ROCKET_QUESTION_PROMPT,
            "rephrase": REPHRASE_QUESTION_PROMPT,
            "recall": RECALL_QUESTION_PROMPT,
            "attention": ATTENTION_QUESTION_PROMPT,
        }
        prompt_template = prompts.get(game_type)
        if not prompt_template:
            raise ValueError(f"Unknown game type: {game_type}")
        return prompt_template.format(count=count)

    def _parse_json_response(self, content: str) -> Union[List[dict], dict]:
        """Parse JSON response from LLM (can be array or object)."""
        content = content.strip()

        # Handle markdown code blocks
        if content.startswith("```"):
            lines = content.split("\n")
            lines = lines[1:]
            for i, line in enumerate(lines):
                if line.strip() == "```":
                    lines = lines[:i]
                    break
            content = "\n".join(lines).strip()

        return json.loads(content)

    async def generate_questions(
        self, game_type: str, count: int = 5
    ) -> List[dict]:
        """
        Generate game questions using AI.

        Args:
            game_type: Type of game
            count: Number of questions to generate

        Returns:
            List of question dictionaries
        """
        if game_type not in self.SUPPORTED_GAME_TYPES:
            raise ValueError(
                f"Unsupported game type: {game_type}. "
                f"Supported types: {self.SUPPORTED_GAME_TYPES}"
            )

        prompt = self._get_prompt_for_type(game_type, count)

        try:
            response = await self.llm.ainvoke([HumanMessage(content=prompt)])
            result = self._parse_json_response(response.content)

            # speed_reading returns a single article object, wrap in list
            if game_type == "speed_reading" and isinstance(result, dict):
                return [result]

            return result

        except json.JSONDecodeError:
            raise LLMServiceError("Failed to parse question response: Invalid JSON")
        except Exception as e:
            if isinstance(e, (LLMServiceError, ValueError)):
                raise
            raise LLMServiceError(f"Question generation failed: {str(e)}")


# Singleton instance
_game_question_agent: Optional[GameQuestionAgent] = None


def get_game_question_agent() -> GameQuestionAgent:
    """Get or create game question agent instance."""
    global _game_question_agent
    if _game_question_agent is None:
        _game_question_agent = GameQuestionAgent()
    return _game_question_agent

