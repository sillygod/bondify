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
    def create(
        provider: Optional[str] = None,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        temperature: float = 0.7
    ) -> BaseChatModel:
        """
        Create LLM instance based on configuration.

        Args:
            provider: "gemini" or "mistral", defaults to config setting
            api_key: Optional user-provided API key
            model: Optional specific model name
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
            return LLMFactory._create_gemini(temperature, api_key, model)
        elif provider == "mistral":
            return LLMFactory._create_mistral(temperature, api_key, model)

    @staticmethod
    def _create_gemini(
        temperature: float,
        api_key: Optional[str] = None,
        model: Optional[str] = None
    ) -> ChatGoogleGenerativeAI:
        """Create Gemini LLM instance."""
        final_api_key = api_key or settings.GOOGLE_API_KEY
        if not final_api_key:
            raise LLMServiceError(
                "Google API key not configured. Please set GOOGLE_API_KEY environment variable or provide a key."
            )

        return ChatGoogleGenerativeAI(
            model=model or "gemini-2.0-flash",
            google_api_key=final_api_key,
            temperature=temperature,
            convert_system_message_to_human=True,
        )

    @staticmethod
    def _create_mistral(
        temperature: float,
        api_key: Optional[str] = None,
        model: Optional[str] = None
    ) -> ChatMistralAI:
        """Create Mistral LLM instance."""
        final_api_key = api_key or settings.MISTRAL_API_KEY
        if not final_api_key:
            raise LLMServiceError(
                "Mistral API key not configured. Please set MISTRAL_API_KEY environment variable or provide a key."
            )

        return ChatMistralAI(
            model=model or "mistral-large-latest",
            mistral_api_key=final_api_key,
            temperature=temperature,
        )

    @staticmethod
    def list_models(provider: str, api_key: str) -> list[dict]:
        """
        List available models for a provider.
        
        Args:
            provider: "gemini" or "mistral"
            api_key: The API key to use
            
        Returns:
            List of dictionaries with 'id' and 'name'
        """
        try:
            if provider == "gemini":
                return LLMFactory._list_gemini_models(api_key)
            elif provider == "mistral":
                return LLMFactory._list_mistral_models(api_key)
        except Exception as e:
            # Log error but return empty list or raise specific error
            print(f"Error listing models for {provider}: {str(e)}")
            raise LLMServiceError(f"Failed to list models: {str(e)}")
        
        return []

    @staticmethod
    def _list_gemini_models(api_key: str) -> list[dict]:
        """List Gemini models via REST API."""
        import requests
        
        url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
        response = requests.get(url, timeout=10)
        
        if response.status_code != 200:
            raise ValueError(f"Google API Error: {response.text}")
            
        data = response.json()
        models = []
        
        for model in data.get("models", []):
            # We filter for models that support content generation
            if "generateContent" in model.get("supportedGenerationMethods", []):
                # model['name'] is like "models/gemini-pro", we want "gemini-pro"
                model_id = model["name"].replace("models/", "")
                models.append({
                    "id": model_id,
                    "name": model.get("displayName", model_id),
                    "description": model.get("description")
                })
        
        return sorted(models, key=lambda x: x["id"], reverse=True)

    @staticmethod
    def _list_mistral_models(api_key: str) -> list[dict]:
        """List Mistral models via REST API."""
        import requests
        
        url = "https://api.mistral.ai/v1/models"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Accept": "application/json"
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code != 200:
            raise ValueError(f"Mistral API Error: {response.text}")
            
        data = response.json()
        models = []
        
        for model in data.get("data", []):
            models.append({
                "id": model["id"],
                "name": model["id"],
                "description": None
            })
            
        return sorted(models, key=lambda x: x["id"])

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
def get_llm(
    provider: Optional[str] = None,
    api_key: Optional[str] = None,
    model: Optional[str] = None
) -> BaseChatModel:
    """
    Get cached LLM instance.

    Args:
        provider: Optional provider override
        api_key: Optional API key override
        model: Optional model override

    Returns:
        Cached BaseChatModel instance
    """
    return LLMFactory.create(provider, api_key, model)


async def get_active_llm_config(db) -> dict:
    """
    Get the active LLM configuration from DB or fallback to ENV.

    Priority: DB active provider > ENV variables

    Args:
        db: AsyncSession database session

    Returns:
        Dict with provider_type, api_key, model, and source
    """
    from app.services.ai_settings_service import AISettingsService
    
    service = AISettingsService(db)
    config = await service.get_active_config()
    
    if config:
        return {
            "provider_type": config["provider_type"],
            "api_key": config["api_key"],
            "model": config["model"],
            "provider_id": config["provider_id"],
            "source": "database",
        }
    
    # Fallback to ENV variables
    provider = settings.LLM_PROVIDER
    api_key = None
    
    if provider == "gemini" and settings.GOOGLE_API_KEY:
        api_key = settings.GOOGLE_API_KEY
    elif provider == "mistral" and settings.MISTRAL_API_KEY:
        api_key = settings.MISTRAL_API_KEY
    
    if not api_key:
        raise LLMServiceError("No AI provider configured. Please set up a provider in Admin Settings or configure environment variables.")
    
    return {
        "provider_type": provider,
        "api_key": api_key,
        "model": None,
        "provider_id": None,
        "source": "environment",
    }


async def create_llm_from_active(db, temperature: float = 0.7) -> tuple[BaseChatModel, dict]:
    """
    Create an LLM instance using the active configuration.

    Args:
        db: AsyncSession database session
        temperature: Temperature for response generation

    Returns:
        Tuple of (BaseChatModel instance, config dict with provider_id and source)
    """
    config = await get_active_llm_config(db)
    llm = LLMFactory.create(
        provider=config["provider_type"],
        api_key=config["api_key"],
        model=config["model"],
        temperature=temperature,
    )
    return llm, config


class LLMContext:
    """
    Context manager for LLM operations with usage logging.
    
    Usage:
        async with LLMContext(db) as ctx:
            response = await ctx.llm.ainvoke([...])
            # Logging happens automatically on exit
    """
    
    def __init__(self, db, endpoint: str = "unknown", temperature: float = 0.7):
        self.db = db
        self.endpoint = endpoint
        self.temperature = temperature
        self.llm = None
        self.config = None
        self.tokens_used = 0
        self.success = True
        self.error_message = None
    
    async def __aenter__(self):
        self.llm, self.config = await create_llm_from_active(self.db, self.temperature)
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        # Log usage if we have a provider_id (from DB)
        if self.config and self.config.get("provider_id"):
            from app.services.ai_settings_service import AISettingsService
            
            if exc_type is not None:
                self.success = False
                self.error_message = str(exc_val)
            
            service = AISettingsService(self.db)
            await service.log_usage(
                provider_id=self.config["provider_id"],
                endpoint=self.endpoint,
                success=self.success,
                tokens_used=self.tokens_used,
                error_message=self.error_message,
            )
        return False  # Don't suppress exceptions

