"""Rephrase Agent for sentence analysis and rephrasing."""

import json
from typing import Optional, List

from langchain_core.language_models import BaseChatModel
from langchain_core.messages import HumanMessage

from app.llm.factory import LLMFactory, LLMServiceError
from app.llm.prompts import REPHRASE_ANALYSIS_PROMPT


class RephraseAgent:
    """Agent for sentence analysis and rephrasing."""

    def __init__(self, llm: Optional[BaseChatModel] = None):
        """
        Initialize rephrase agent.

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


    def _validate_rephrase_analysis(self, data: dict, original_sentence: str) -> dict:
        """
        Validate and normalize rephrase analysis data.

        Args:
            data: Raw parsed JSON data
            original_sentence: The original sentence submitted

        Returns:
            Validated and normalized dictionary
        """
        validated = {
            "originalSentence": data.get("originalSentence", original_sentence),
            "issues": self._validate_issues(data.get("issues", [])),
            "rephrasedOptions": self._validate_rephrased_options(
                data.get("rephrasedOptions", [])
            ),
            "keyTakeaways": self._validate_key_takeaways(
                data.get("keyTakeaways", [])
            ),
            "bestRecommendation": data.get("bestRecommendation", ""),
        }

        # Ensure we have at least one rephrased option
        if not validated["rephrasedOptions"]:
            validated["rephrasedOptions"] = [
                {
                    "context": "Natural & Concise",
                    "sentence": original_sentence,
                    "whyItWorks": "The original sentence is already well-formed.",
                }
            ]

        # Ensure we have at least one key takeaway
        if not validated["keyTakeaways"]:
            validated["keyTakeaways"] = [
                "Review your sentence structure for clarity."
            ]

        # Ensure best recommendation is set
        if not validated["bestRecommendation"]:
            validated["bestRecommendation"] = validated["rephrasedOptions"][0]["sentence"]

        return validated

    def _validate_issues(self, issues: list) -> List[dict]:
        """Validate grammar issues list."""
        if not issues:
            return []

        validated = []
        for issue in issues:
            if isinstance(issue, dict):
                validated.append({
                    "type": issue.get("type", "Grammar Issue"),
                    "problematic": issue.get("problematic", ""),
                    "explanation": issue.get("explanation", ""),
                    "corrections": issue.get("corrections", []),
                })
        return validated

    def _validate_rephrased_options(self, options: list) -> List[dict]:
        """Validate rephrased options list."""
        if not options:
            return []

        validated = []
        for option in options:
            if isinstance(option, dict):
                validated.append({
                    "context": option.get("context", "Alternative"),
                    "sentence": option.get("sentence", ""),
                    "whyItWorks": option.get("whyItWorks", ""),
                })
        return [opt for opt in validated if opt["sentence"]]

    def _validate_key_takeaways(self, takeaways: list) -> List[str]:
        """Validate key takeaways list."""
        if not takeaways:
            return []

        return [str(t) for t in takeaways if t]


    async def analyze(self, sentence: str) -> dict:
        """
        Analyze sentence for grammar issues and provide rephrasing options.

        Args:
            sentence: The sentence to analyze

        Returns:
            Dictionary with rephrase analysis including:
            - originalSentence: The original sentence
            - issues: List of grammar/clarity issues with explanations
            - rephrasedOptions: List of rephrased options (formal, casual, concise)
            - keyTakeaways: List of learning points
            - bestRecommendation: The best rephrased version

        Raises:
            LLMServiceError: If LLM call fails
            ValueError: If response parsing fails
        """
        if not sentence or not sentence.strip():
            raise ValueError("Sentence cannot be empty")

        sentence = sentence.strip()

        prompt = REPHRASE_ANALYSIS_PROMPT.format(sentence=sentence)

        try:
            response = await self.llm.ainvoke([HumanMessage(content=prompt)])
            content = response.content

            # Parse JSON response
            data = self._parse_json_response(content)

            # Validate and normalize the data
            validated_data = self._validate_rephrase_analysis(data, sentence)

            return validated_data

        except json.JSONDecodeError as e:
            raise LLMServiceError(
                f"Failed to parse rephrase response: Invalid JSON format"
            )
        except Exception as e:
            if isinstance(e, (LLMServiceError, ValueError)):
                raise
            raise LLMServiceError(f"Rephrase analysis failed: {str(e)}")


# Singleton instance for reuse
_rephrase_agent: Optional[RephraseAgent] = None


def get_rephrase_agent() -> RephraseAgent:
    """Get or create rephrase agent instance."""
    global _rephrase_agent
    if _rephrase_agent is None:
        _rephrase_agent = RephraseAgent()
    return _rephrase_agent
