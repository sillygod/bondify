"""Vocabulary API endpoints."""

from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.vocabulary_service import VocabularyService
from app.schemas.vocabulary import (
    VocabularyLookupRequest,
    VocabularyLookupResponse,
)
from app.database import get_db
from app.llm.factory import LLMFactory, LLMServiceError

router = APIRouter(prefix="/api/vocabulary", tags=["vocabulary"])


@router.post("/lookup", response_model=VocabularyLookupResponse)
async def lookup_word(
    request: VocabularyLookupRequest,
    db: AsyncSession = Depends(get_db),
    provider: Optional[str] = Header(None, alias="X-Bondify-AI-Provider"),
    api_key: Optional[str] = Header(None, alias="X-Bondify-AI-Key"),
    model: Optional[str] = Header(None, alias="X-Bondify-AI-Model"),
):
    """
    Look up comprehensive information about a word.

    Returns detailed word information including:
    - Definition, part of speech, pronunciation
    - Word structure (prefix, root, suffix) and etymology
    - Multiple meanings with contexts and examples
    - Collocations and synonyms
    - Learning tips, visual tricks, memory phrases
    - Common mistakes to avoid

    Response includes 'source' field: "cache" (from DB) or "ai" (fresh lookup).
    
    Supports BYOK (Bring Your Own Key) via X-Bondify-AI-* headers.
    """
    try:
        service = VocabularyService(db)
        
        # If user provides custom API key, create LLM instance (BYOK)
        custom_llm = None
        if api_key:
            custom_llm = LLMFactory.create(provider=provider, api_key=api_key, model=model)
        
        result, source = await service.lookup_word(request.word, custom_llm=custom_llm)

        # Add source info to response
        response_data = {**result, "source": source}
        return VocabularyLookupResponse(**response_data)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "error": "VALIDATION_ERROR",
                "detail": str(e),
                "code": "VALIDATION_ERROR",
            },
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


@router.post("/lookup/stream")
async def lookup_word_stream(
    request: VocabularyLookupRequest,
    db: AsyncSession = Depends(get_db),
    provider: Optional[str] = Header(None, alias="X-Bondify-AI-Provider"),
    api_key: Optional[str] = Header(None, alias="X-Bondify-AI-Key"),
    model: Optional[str] = Header(None, alias="X-Bondify-AI-Model"),
):
    """
    Stream vocabulary lookup results using Server-Sent Events.
    
    Returns a stream of text/event-stream data with JSON content chunks.
    Each event contains a portion of the vocabulary JSON as it's generated.
    
    Supports BYOK (Bring Your Own Key) via X-Bondify-AI-* headers.
    """
    from app.llm.vocabulary_agent import VocabularyAgent
    from app.llm.factory import get_active_llm_config
    
    async def generate_stream():
        try:
            # Check cache first
            service = VocabularyService(db)
            cached = await service._get_cached(request.word.strip().lower())
            
            if cached:
                # If cached, send complete data immediately
                cached.lookup_count += 1
                await db.commit()
                yield f"data: {cached.definition_json}\n\n"
                yield "data: [DONE]\n\n"
                return
            
            # Create LLM instance
            if api_key:
                llm = LLMFactory.create(provider=provider, api_key=api_key, model=model)
            else:
                # Use DB-configured provider
                config = await get_active_llm_config(db)
                llm = LLMFactory.create(
                    provider=config.get("provider_type"),
                    api_key=config.get("api_key"),
                    model=config.get("model")
                )
            
            agent = VocabularyAgent(llm=llm)
            
            # Accumulate content for caching
            full_content = ""
            
            async for chunk in agent.lookup_word_stream(request.word):
                full_content += chunk
                # Send SSE event with chunk - escape newlines to keep content on single line
                # Newlines in SSE data break the format since each line needs "data:" prefix
                escaped_chunk = chunk.replace('\n', '\\n')
                yield f"data: {escaped_chunk}\n\n"
            
            yield "data: [DONE]\n\n"
            
            # Try to cache the complete response
            try:
                # Parse the accumulated content
                parsed = agent._parse_json_response(full_content)
                validated = agent._validate_word_definition(parsed)
                validated["word"] = request.word.strip().lower()
                await service._save_to_cache(request.word.strip().lower(), validated)
            except Exception:
                # Caching failed, but streaming was successful
                pass
                
        except ValueError as e:
            yield f"data: {{\"error\": \"VALIDATION_ERROR\", \"detail\": \"{str(e)}\"}}\n\n"
        except LLMServiceError as e:
            yield f"data: {{\"error\": \"LLM_SERVICE_ERROR\", \"detail\": \"{str(e.message)}\"}}\n\n"
        except Exception as e:
            yield f"data: {{\"error\": \"INTERNAL_ERROR\", \"detail\": \"An unexpected error occurred\"}}\n\n"
    
    return StreamingResponse(
        generate_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )
