"""
TTS Service using Piper

Provides text-to-speech synthesis using Piper TTS engine.
"""

import hashlib
import io
import wave
from pathlib import Path
from typing import Optional
import logging

logger = logging.getLogger(__name__)

# Piper imports - will be available after piper-tts is installed
try:
    from piper.voice import PiperVoice
    PIPER_AVAILABLE = True
except ImportError:
    PIPER_AVAILABLE = False
    logger.warning("Piper TTS not available. Install with: pip install piper-tts")


class TTSService:
    """Text-to-Speech service using Piper."""
    
    # Default model paths
    DEFAULT_MODEL_DIR = Path(__file__).parent.parent.parent / "models"
    DEFAULT_MODEL_NAME = "en_US-amy-medium"
    
    # Cache directory
    CACHE_DIR = Path(__file__).parent.parent.parent / "cache" / "tts"
    
    def __init__(
        self,
        model_dir: Optional[Path] = None,
        model_name: Optional[str] = None,
        enable_cache: bool = True,
    ):
        self.model_dir = model_dir or self.DEFAULT_MODEL_DIR
        self.model_name = model_name or self.DEFAULT_MODEL_NAME
        self.enable_cache = enable_cache
        self.voice: Optional["PiperVoice"] = None
        
        # Ensure cache directory exists
        if self.enable_cache:
            self.CACHE_DIR.mkdir(parents=True, exist_ok=True)
    
    def _get_model_paths(self) -> tuple[Path, Path]:
        """Get model and config file paths."""
        model_path = self.model_dir / f"{self.model_name}.onnx"
        config_path = self.model_dir / f"{self.model_name}.onnx.json"
        return model_path, config_path
    
    def _load_voice(self) -> bool:
        """Load Piper voice model. Returns True if successful."""
        if not PIPER_AVAILABLE:
            logger.error("Piper TTS is not installed")
            return False
        
        if self.voice is not None:
            return True
        
        model_path, config_path = self._get_model_paths()
        
        if not model_path.exists():
            logger.error(f"Model not found: {model_path}")
            logger.info("Download from: https://huggingface.co/rhasspy/piper-voices")
            return False
        
        if not config_path.exists():
            logger.error(f"Config not found: {config_path}")
            return False
        
        try:
            self.voice = PiperVoice.load(str(model_path), str(config_path))
            logger.info(f"Loaded Piper model: {self.model_name}")
            return True
        except Exception as e:
            logger.error(f"Failed to load Piper model: {e}")
            return False
    
    def _get_cache_key(self, text: str) -> str:
        """Generate cache key from text."""
        content = f"{text}:{self.model_name}"
        return hashlib.md5(content.encode()).hexdigest()
    
    def _get_cached_audio(self, cache_key: str) -> Optional[bytes]:
        """Get cached audio if available."""
        if not self.enable_cache:
            return None
        
        cache_path = self.CACHE_DIR / f"{cache_key}.wav"
        if cache_path.exists():
            return cache_path.read_bytes()
        return None
    
    def _save_to_cache(self, cache_key: str, audio_data: bytes) -> None:
        """Save audio to cache."""
        if not self.enable_cache:
            return
        
        cache_path = self.CACHE_DIR / f"{cache_key}.wav"
        cache_path.write_bytes(audio_data)
    
    def synthesize(self, text: str) -> Optional[bytes]:
        """
        Synthesize speech from text.
        
        Works with plain English and Oxford respelling (e.g., "ka-SHAY").
        
        Args:
            text: Text to synthesize
            
        Returns:
            WAV audio data as bytes, or None if synthesis fails
        """
        if not text.strip():
            return None
        
        # Check cache
        cache_key = self._get_cache_key(text)
        cached = self._get_cached_audio(cache_key)
        if cached:
            logger.debug(f"Cache hit for: {cache_key}")
            return cached
        
        # Load voice if needed
        if not self._load_voice():
            return None
        
        # Synthesize
        try:
            buffer = io.BytesIO()
            with wave.open(buffer, "wb") as wav_file:
                self.voice.synthesize_wav(text, wav_file)
            
            audio_data = buffer.getvalue()
            
            # Save to cache
            self._save_to_cache(cache_key, audio_data)
            
            logger.debug(f"Synthesized: {text[:50]}...")
            return audio_data
            
        except Exception as e:
            logger.error(f"Synthesis failed: {e}")
            return None
    
    def is_available(self) -> bool:
        """Check if TTS service is available."""
        if not PIPER_AVAILABLE:
            return False
        
        model_path, config_path = self._get_model_paths()
        return model_path.exists() and config_path.exists()
    
    def phonemize(self, text: str) -> str:
        """
        Convert text to espeak-ng phonemes.
        
        Useful for previewing how Piper will pronounce text.
        
        Args:
            text: Text to phonemize
            
        Returns:
            Phonemes string
        """
        if not self._load_voice():
            return ""
        
        try:
            phonemes = self.voice.phonemize(text)
            # Flatten to single string
            return ''.join(''.join(ps) for ps in phonemes)
        except Exception as e:
            logger.error(f"Phonemize failed: {e}")
            return ""
    
    def get_model_info(self) -> dict:
        """Get information about the current model."""
        model_path, config_path = self._get_model_paths()
        return {
            "model_name": self.model_name,
            "model_dir": str(self.model_dir),
            "model_exists": model_path.exists(),
            "config_exists": config_path.exists(),
            "piper_installed": PIPER_AVAILABLE,
            "cache_enabled": self.enable_cache,
            "cache_dir": str(self.CACHE_DIR),
        }


# Singleton instance
_tts_service: Optional[TTSService] = None


def get_tts_service() -> TTSService:
    """Get the TTS service singleton."""
    global _tts_service
    if _tts_service is None:
        _tts_service = TTSService()
    return _tts_service

