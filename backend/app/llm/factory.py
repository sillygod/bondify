"""LLM Factory for creating LLM instances based on configuration."""

from functools import lru_cache
from typing import Optional

from langchain_core.language_models import BaseChatModel
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_mistralai import ChatMistralAI

from app.config import settings


class LLMServiceError(Exception):
    """Exception raised when LLM service encounters an error."""

    def __init__(self, message: str = "AI service temporarily unavailable"):
        self.message = message
        super().__init__(self.message)


class LLMFactory:
    """Factory for creating LLM instances based on configuration."""

    SUPPORTED_PROVIDERS = {"gemini", "mistral"}

    @staticmethod
    def create(provider: Optional[str] = None, temperature: float = 0.7) -> BaseChatModel:
        """
        Create LLM instance based on provider.

        Args:
            provider: "gemini" or "mistral", defaults to config setting
            temperature: Temperature for response generation (0.0-1.0)

        Returns:
            BaseChatModel instance

        Raises:
            ValueError: If provider is not supported
            LLMServiceError: If API key is not configured
        """
        provider = provider or settings.LLM_PROVIDER

        if provider not in LLMFactory.SUPPORTED_PROVIDERS:
            raise ValueError(
                f"Unknown LLM provider: {provider}. "
                f"Supported providers: {LLMFactory.SUPPORTED_PROVIDERS}"
            )

        if provider == "gemini":
            return LLMFactory._create_gemini(temperature)
        elif provider == "mistral":
            return LLMFactory._create_mistral(temperature)

    @staticmethod
    def _create_gemini(temperature: float) -> ChatGoogleGenerativeAI:
        """Create Gemini LLM instance."""
        if not settings.GOOGLE_API_KEY:
            raise LLMServiceError(
                "Google API key not configured. Please set GOOGLE_API_KEY environment variable."
            )

        return ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=settings.GOOGLE_API_KEY,
            temperature=temperature,
            convert_system_message_to_human=True,
        )

    @staticmethod
    def _create_mistral(temperature: float) -> ChatMistralAI:
        """Create Mistral LLM instance."""
        if not settings.MISTRAL_API_KEY:
            raise LLMServiceError(
                "Mistral API key not configured. Please set MISTRAL_API_KEY environment variable."
            )

        return ChatMistralAI(
            model="mistral-large-latest",
            mistral_api_key=settings.MISTRAL_API_KEY,
            temperature=temperature,
        )

    @staticmethod
    def get_available_providers() -> list[str]:
        """Get list of providers that have API keys configured."""
        available = []
        if settings.GOOGLE_API_KEY:
            available.append("gemini")
        if settings.MISTRAL_API_KEY:
            available.append("mistral")
        return available


@lru_cache
def get_llm(provider: Optional[str] = None) -> BaseChatModel:
    """
    Get cached LLM instance.

    Args:
        provider: Optional provider override

    Returns:
        Cached BaseChatModel instance
    """
    return LLMFactory.create(provider)
