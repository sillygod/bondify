"""
TTS API Endpoints

Provides text-to-speech synthesis endpoints using Piper TTS.
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
import logging

from app.services.tts_service import get_tts_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/tts", tags=["TTS"])


class SpeakRequest(BaseModel):
    """Request body for TTS synthesis."""
    text: str
    
    class Config:
        json_schema_extra = {
            "examples": [
                {"text": "hello"},
                {"text": "ka-SHAY"},
                {"text": "pronunciation"}
            ]
        }


class TTSInfoResponse(BaseModel):
    """Response for TTS service info."""
    available: bool
    model_name: str
    piper_installed: bool
    cache_enabled: bool


@router.post("/speak")
async def synthesize_speech(request: SpeakRequest):
    """
    Synthesize speech from text.
    
    Supports:
    - Plain English words: "hello", "cache"
    - Oxford respelling: "ka-SHAY", "pruh-NUN-see-AY-shun"
    
    Returns WAV audio data.
    """
    if not request.text or not request.text.strip():
        raise HTTPException(
            status_code=400,
            detail="'text' field is required and cannot be empty"
        )
    
    tts = get_tts_service()
    
    if not tts.is_available():
        raise HTTPException(
            status_code=503,
            detail="TTS service unavailable. Please ensure Piper model is installed."
        )
    
    audio_data = tts.synthesize(text=request.text)
    
    if audio_data is None:
        raise HTTPException(
            status_code=500,
            detail="Failed to synthesize speech"
        )
    
    # Use text for filename, remove non-ASCII characters
    filename_base = request.text[:20]
    filename_safe = ''.join(c for c in filename_base if ord(c) < 128)
    if not filename_safe:
        filename_safe = "audio"
    
    return Response(
        content=audio_data,
        media_type="audio/wav",
        headers={
            "Content-Disposition": f'inline; filename="{filename_safe}.wav"'
        }
    )


@router.get("/info")
async def get_tts_info() -> TTSInfoResponse:
    """Get TTS service information."""
    tts = get_tts_service()
    info = tts.get_model_info()
    
    return TTSInfoResponse(
        available=tts.is_available(),
        model_name=info["model_name"],
        piper_installed=info["piper_installed"],
        cache_enabled=info["cache_enabled"],
    )


class PhonemizeRequest(BaseModel):
    """Request body for phonemize."""
    text: str


class PhonemizeResponse(BaseModel):
    """Response for phonemize."""
    text: str
    phonemes: str


@router.post("/phonemize")
async def phonemize_text(request: PhonemizeRequest) -> PhonemizeResponse:
    """
    Convert text to espeak-ng phonemes.
    
    Useful for previewing how Piper will pronounce text.
    """
    tts = get_tts_service()
    
    if not tts.is_available():
        raise HTTPException(
            status_code=503,
            detail="TTS service unavailable"
        )
    
    phonemes = tts.phonemize(request.text)
    
    return PhonemizeResponse(
        text=request.text,
        phonemes=phonemes,
    )
