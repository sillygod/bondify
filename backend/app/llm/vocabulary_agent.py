"""Vocabulary Agent for word lookup and analysis."""

import json
from typing import Optional

from langchain_core.language_models import BaseChatModel
from langchain_core.messages import HumanMessage

from app.llm.factory import LLMFactory, LLMServiceError
from app.llm.prompts import VOCABULARY_LOOKUP_PROMPT


class VocabularyAgent:
    """Agent for vocabulary lookup and analysis."""

    def __init__(self, llm: Optional[BaseChatModel] = None):
        """
        Initialize vocabulary agent.

        Args:
            llm: Optional LLM instance, creates default if not provided
        """
        self.llm = llm or LLMFactory.create()

    def _parse_json_response(self, content: str) -> dict:
        """
        Parse JSON response from LLM, handling markdown code blocks.

        Args:
            content: Raw response content from LLM

        Returns:
            Parsed JSON dictionary

        Raises:
            ValueError: If JSON parsing fails
        """
        content = content.strip()

        # Handle markdown code blocks
        if content.startswith("```"):
            lines = content.split("\n")
            # Remove first line (```json or ```)
            lines = lines[1:]
            # Find closing ```
            for i, line in enumerate(lines):
                if line.strip() == "```":
                    lines = lines[:i]
                    break
            content = "\n".join(lines).strip()

        return json.loads(content)

    def _validate_word_definition(self, data: dict) -> dict:
        """
        Validate and normalize word definition data.

        Args:
            data: Raw parsed JSON data

        Returns:
            Validated and normalized dictionary
        """
        # Ensure required fields exist with defaults
        validated = {
            "word": data.get("word", ""),
            "partOfSpeech": data.get("partOfSpeech", "unknown"),
            "definition": data.get("definition", ""),
            "pronunciation": self._validate_pronunciation(data.get("pronunciation", {})),
            "wordStructure": self._validate_word_structure(data.get("wordStructure", {})),
            "etymology": data.get("etymology", ""),
            "meanings": self._validate_meanings(data.get("meanings", [])),
            "collocations": data.get("collocations", []),
            "synonyms": self._validate_synonyms(data.get("synonyms", [])),
            "learningTip": data.get("learningTip", ""),
            "visualTrick": data.get("visualTrick", ""),
            "memoryPhrase": data.get("memoryPhrase", ""),
            "commonMistakes": self._validate_common_mistakes(data.get("commonMistakes")),
        }

        return validated

    def _validate_pronunciation(self, data: dict) -> dict:
        """Validate pronunciation data."""
        return {
            "ipa": data.get("ipa", ""),
            "phoneticBreakdown": data.get("phoneticBreakdown", ""),
            "oxfordRespelling": data.get("oxfordRespelling", ""),
        }

    def _validate_word_structure(self, data: dict) -> dict:
        """Validate word structure data."""
        return {
            "prefix": data.get("prefix"),
            "prefixMeaning": data.get("prefixMeaning"),
            "root": data.get("root", ""),
            "rootMeaning": data.get("rootMeaning", ""),
            "suffix": data.get("suffix"),
            "suffixMeaning": data.get("suffixMeaning"),
        }

    def _validate_meanings(self, meanings: list) -> list:
        """Validate meanings list."""
        if not meanings:
            return []

        validated = []
        for meaning in meanings:
            if isinstance(meaning, dict):
                validated.append({
                    "context": meaning.get("context", "General"),
                    "meaning": meaning.get("meaning", ""),
                    "example": meaning.get("example", ""),
                })
        return validated

    def _validate_synonyms(self, synonyms: list) -> list:
        """Validate synonyms list."""
        if not synonyms:
            return []

        validated = []
        for synonym in synonyms:
            if isinstance(synonym, dict):
                validated.append({
                    "word": synonym.get("word", ""),
                    "meaning": synonym.get("meaning", ""),
                    "context": synonym.get("context", ""),
                    "interchangeable": synonym.get("interchangeable", "sometimes"),
                })
        return validated

    def _validate_common_mistakes(self, mistakes: list) -> Optional[list]:
        """Validate common mistakes list."""
        if not mistakes:
            return None

        validated = []
        for mistake in mistakes:
            if isinstance(mistake, dict):
                validated.append({
                    "incorrect": mistake.get("incorrect", ""),
                    "issue": mistake.get("issue", ""),
                    "correct": mistake.get("correct", ""),
                })
        return validated if validated else None

    async def lookup_word(self, word: str) -> dict:
        """
        Look up comprehensive word information.

        Args:
            word: The word to look up

        Returns:
            Dictionary with comprehensive word information including:
            - definition, part of speech, pronunciation
            - word structure (prefix, root, suffix)
            - etymology
            - meanings with contexts and examples
            - collocations
            - synonyms with interchangeability
            - learning tips, visual tricks, memory phrases
            - common mistakes

        Raises:
            LLMServiceError: If LLM call fails
            ValueError: If response parsing fails
        """
        if not word or not word.strip():
            raise ValueError("Word cannot be empty")

        word = word.strip().lower()

        prompt = VOCABULARY_LOOKUP_PROMPT.format(word=word)

        try:
            response = await self.llm.ainvoke([HumanMessage(content=prompt)])
            content = response.content

            # Parse JSON response
            data = self._parse_json_response(content)

            # Validate and normalize the data
            validated_data = self._validate_word_definition(data)

            # Ensure the word field matches the queried word
            validated_data["word"] = word

            return validated_data

        except json.JSONDecodeError as e:
            raise LLMServiceError(
                f"Failed to parse vocabulary response: Invalid JSON format"
            )
        except Exception as e:
            if isinstance(e, (LLMServiceError, ValueError)):
                raise
            raise LLMServiceError(f"Vocabulary lookup failed: {str(e)}")


# Singleton instance for reuse
_vocabulary_agent: Optional[VocabularyAgent] = None


def get_vocabulary_agent() -> VocabularyAgent:
    """Get or create vocabulary agent instance."""
    global _vocabulary_agent
    if _vocabulary_agent is None:
        _vocabulary_agent = VocabularyAgent()
    return _vocabulary_agent
