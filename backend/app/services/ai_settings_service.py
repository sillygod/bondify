"""AI Settings Service for managing AI provider configurations."""

from datetime import datetime, timedelta
from typing import List, Optional

from cryptography.fernet import Fernet, InvalidToken
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.ai_provider import AIProvider
from app.models.ai_usage_log import AIUsageLog


class AISettingsService:
    """Service for managing AI provider configurations with encrypted API keys."""

    def __init__(self, db: AsyncSession):
        self.db = db
        self._fernet = self._get_fernet()

    def _get_fernet(self) -> Fernet:
        """Get Fernet instance from SECRET_KEY."""
        # Use first 32 bytes of SECRET_KEY as Fernet key (base64 encoded)
        import base64
        import hashlib
        
        key = hashlib.sha256(settings.SECRET_KEY.encode()).digest()
        return Fernet(base64.urlsafe_b64encode(key))

    def _encrypt_key(self, api_key: str) -> str:
        """Encrypt an API key."""
        return self._fernet.encrypt(api_key.encode()).decode()

    def _decrypt_key(self, encrypted: str) -> str:
        """Decrypt an API key."""
        try:
            return self._fernet.decrypt(encrypted.encode()).decode()
        except InvalidToken:
            raise ValueError("Failed to decrypt API key. SECRET_KEY may have changed.")

    def _mask_key(self, api_key: str) -> str:
        """Mask API key for display (show first 4 and last 4 chars)."""
        if len(api_key) <= 8:
            return "*" * len(api_key)
        return f"{api_key[:4]}...{api_key[-4:]}"

    # =========================================================================
    # CRUD Operations
    # =========================================================================

    async def create_provider(
        self,
        name: str,
        provider_type: str,
        api_key: str,
        model: Optional[str] = None,
        set_active: bool = False,
    ) -> AIProvider:
        """Create a new AI provider configuration."""
        provider = AIProvider(
            name=name,
            provider_type=provider_type,
            api_key_encrypted=self._encrypt_key(api_key),
            model=model,
            is_active=False,
        )
        self.db.add(provider)
        await self.db.commit()
        await self.db.refresh(provider)

        if set_active:
            await self.set_active_provider(provider.id)
            await self.db.refresh(provider)

        return provider

    async def get_providers(self) -> List[AIProvider]:
        """Get all AI providers."""
        result = await self.db.execute(
            select(AIProvider).order_by(AIProvider.is_active.desc(), AIProvider.name)
        )
        return list(result.scalars().all())

    async def get_provider(self, provider_id: int) -> Optional[AIProvider]:
        """Get a specific AI provider by ID."""
        result = await self.db.execute(
            select(AIProvider).where(AIProvider.id == provider_id)
        )
        return result.scalar_one_or_none()

    async def update_provider(
        self,
        provider_id: int,
        name: Optional[str] = None,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
    ) -> Optional[AIProvider]:
        """Update an AI provider configuration."""
        provider = await self.get_provider(provider_id)
        if not provider:
            return None

        if name is not None:
            provider.name = name
        if api_key is not None:
            provider.api_key_encrypted = self._encrypt_key(api_key)
        if model is not None:
            provider.model = model

        await self.db.commit()
        await self.db.refresh(provider)
        return provider

    async def delete_provider(self, provider_id: int) -> bool:
        """Delete an AI provider."""
        provider = await self.get_provider(provider_id)
        if not provider:
            return False

        await self.db.delete(provider)
        await self.db.commit()
        return True

    # =========================================================================
    # Active Provider Management
    # =========================================================================

    async def set_active_provider(self, provider_id: int) -> Optional[AIProvider]:
        """Set a provider as active (deactivates others)."""
        provider = await self.get_provider(provider_id)
        if not provider:
            return None

        # Deactivate all other providers
        await self.db.execute(
            update(AIProvider).where(AIProvider.id != provider_id).values(is_active=False)
        )

        # Activate this provider
        provider.is_active = True
        await self.db.commit()
        await self.db.refresh(provider)
        return provider

    async def get_active_provider(self) -> Optional[AIProvider]:
        """Get the currently active AI provider."""
        result = await self.db.execute(
            select(AIProvider).where(AIProvider.is_active == True)
        )
        return result.scalar_one_or_none()

    async def get_active_config(self) -> Optional[dict]:
        """Get the active provider's decrypted configuration."""
        provider = await self.get_active_provider()
        if not provider:
            return None

        # Update last_used_at
        provider.last_used_at = datetime.utcnow()
        await self.db.commit()

        return {
            "provider_id": provider.id,
            "provider_type": provider.provider_type,
            "api_key": self._decrypt_key(provider.api_key_encrypted),
            "model": provider.model,
        }

    # =========================================================================
    # Connection Testing
    # =========================================================================

    async def test_connection(self, provider_type: str, api_key: str) -> dict:
        """Test connection to an AI provider."""
        from app.llm.factory import LLMFactory, LLMServiceError

        try:
            models = LLMFactory.list_models(provider_type, api_key)
            return {
                "success": True,
                "message": f"Connected successfully. Found {len(models)} models.",
                "models": models,  # Return all models
            }
        except LLMServiceError as e:
            return {
                "success": False,
                "message": str(e.message),
                "models": [],
            }
        except Exception as e:
            return {
                "success": False,
                "message": str(e),
                "models": [],
            }

    # =========================================================================
    # Usage Tracking
    # =========================================================================

    async def log_usage(
        self,
        provider_id: int,
        endpoint: str,
        success: bool = True,
        tokens_used: Optional[int] = None,
        error_message: Optional[str] = None,
    ) -> AIUsageLog:
        """Log AI API usage."""
        log = AIUsageLog(
            provider_id=provider_id,
            endpoint=endpoint,
            tokens_used=tokens_used,
            success=success,
            error_message=error_message,
        )
        self.db.add(log)
        await self.db.commit()
        return log

    async def get_usage_stats(self, provider_id: int, days: int = 30) -> dict:
        """Get usage statistics for a provider."""
        since = datetime.utcnow() - timedelta(days=days)

        # Total requests
        total_result = await self.db.execute(
            select(func.count(AIUsageLog.id)).where(
                AIUsageLog.provider_id == provider_id,
                AIUsageLog.created_at >= since,
            )
        )
        total = total_result.scalar() or 0

        # Successful requests
        success_result = await self.db.execute(
            select(func.count(AIUsageLog.id)).where(
                AIUsageLog.provider_id == provider_id,
                AIUsageLog.created_at >= since,
                AIUsageLog.success == True,
            )
        )
        successful = success_result.scalar() or 0

        # Total tokens
        tokens_result = await self.db.execute(
            select(func.sum(AIUsageLog.tokens_used)).where(
                AIUsageLog.provider_id == provider_id,
                AIUsageLog.created_at >= since,
            )
        )
        total_tokens = tokens_result.scalar() or 0

        return {
            "total_requests": total,
            "successful_requests": successful,
            "failed_requests": total - successful,
            "success_rate": round((successful / total * 100) if total > 0 else 0, 1),
            "total_tokens": total_tokens,
            "period_days": days,
        }

    async def get_provider_status(self) -> dict:
        """Get current AI provider status."""
        active_provider = await self.get_active_provider()

        if active_provider:
            return {
                "source": "database",
                "provider_id": active_provider.id,
                "provider_name": active_provider.name,
                "provider_type": active_provider.provider_type,
                "model": active_provider.model,
                "last_used_at": active_provider.last_used_at.isoformat() if active_provider.last_used_at else None,
            }
        else:
            # Fallback to environment variables
            from app.llm.factory import LLMFactory
            available = LLMFactory.get_available_providers()
            
            return {
                "source": "environment",
                "provider_id": None,
                "provider_name": None,
                "provider_type": settings.LLM_PROVIDER if settings.LLM_PROVIDER in available else None,
                "model": None,
                "available_from_env": available,
            }

    def provider_to_dict(self, provider: AIProvider, include_usage: bool = False) -> dict:
        """Convert provider to dictionary with masked API key."""
        return {
            "id": provider.id,
            "name": provider.name,
            "provider_type": provider.provider_type,
            "api_key_masked": self._mask_key(self._decrypt_key(provider.api_key_encrypted)),
            "model": provider.model,
            "is_active": provider.is_active,
            "last_used_at": provider.last_used_at.isoformat() if provider.last_used_at else None,
            "created_at": provider.created_at.isoformat(),
            "updated_at": provider.updated_at.isoformat(),
        }
