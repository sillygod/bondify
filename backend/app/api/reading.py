"""Reading API endpoints."""

import json
from typing import Optional
from fastapi import APIRouter, HTTPException, status, Query, Header

from app.api.deps import CurrentUser, DbSession
from app.schemas.reading import (
    ArticleCreateRequest,
    ArticleListSummaryResponse,
    ArticleResponse,
    ArticleSummary,
    ArticleUpdateRequest,
    UrlImportRequest,
    UrlImportResponse,
    ReadingAnalysisResponse,
)
from app.services.reading_service import ReadingService
from app.services.url_extractor import get_url_extractor
from app.llm.factory import LLMContext, LLMFactory, LLMServiceError
from app.llm.prompts import READING_ANALYSIS_PROMPT

router = APIRouter(prefix="/api/reading", tags=["reading"])


@router.post("/articles", response_model=ArticleResponse, status_code=status.HTTP_201_CREATED)
async def create_article(
    request: ArticleCreateRequest,
    current_user: CurrentUser,
    db: DbSession,
) -> ArticleResponse:
    """
    Create a new reading article.

    Import text content for reading practice. Words can be clicked
    to look up definitions and add to wordlist.
    """
    service = ReadingService(db)
    article = await service.create_article(
        user_id=current_user.id,
        title=request.title,
        content=request.content,
        source_url=request.source_url,
    )
    return ArticleResponse.model_validate(article)


@router.get("/articles", response_model=ArticleListSummaryResponse)
async def list_articles(
    current_user: CurrentUser,
    db: DbSession,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
) -> ArticleListSummaryResponse:
    """
    Get user's reading articles.

    Returns article summaries (without full content) for efficiency.
    """
    service = ReadingService(db)
    articles, total = await service.get_user_articles(
        user_id=current_user.id,
        limit=limit,
        offset=offset,
    )
    return ArticleListSummaryResponse(
        total=total,
        articles=[ArticleSummary.model_validate(a) for a in articles],
    )


@router.get("/articles/{article_id}", response_model=ArticleResponse)
async def get_article(
    article_id: int,
    current_user: CurrentUser,
    db: DbSession,
) -> ArticleResponse:
    """Get a specific article by ID with full content."""
    service = ReadingService(db)
    article = await service.get_article(article_id, current_user.id)

    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "ARTICLE_NOT_FOUND", "message": "Article not found"},
        )

    return ArticleResponse.model_validate(article)


@router.patch("/articles/{article_id}", response_model=ArticleResponse)
async def update_article(
    article_id: int,
    request: ArticleUpdateRequest,
    current_user: CurrentUser,
    db: DbSession,
) -> ArticleResponse:
    """Update an article's title or content."""
    service = ReadingService(db)
    article = await service.update_article(
        article_id=article_id,
        user_id=current_user.id,
        title=request.title,
        content=request.content,
    )

    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "ARTICLE_NOT_FOUND", "message": "Article not found"},
        )

    return ArticleResponse.model_validate(article)


@router.delete("/articles/{article_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_article(
    article_id: int,
    current_user: CurrentUser,
    db: DbSession,
) -> None:
    """Delete an article."""
    service = ReadingService(db)
    deleted = await service.delete_article(article_id, current_user.id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "ARTICLE_NOT_FOUND", "message": "Article not found"},
        )


@router.post("/import-url", response_model=UrlImportResponse)
async def import_from_url(
    request: UrlImportRequest,
    current_user: CurrentUser,
) -> UrlImportResponse:
    """
    Extract article content from a URL.
    
    Returns the extracted title and content for preview before saving.
    """
    extractor = get_url_extractor()
    try:
        result = await extractor.extract_from_url(request.url)
        return UrlImportResponse(**result)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "URL_EXTRACTION_FAILED", "message": str(e)},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "URL_EXTRACTION_ERROR", "message": "Failed to extract content from URL"},
        )


@router.post("/articles/{article_id}/analyze", response_model=ReadingAnalysisResponse)
async def analyze_article(
    article_id: int,
    current_user: CurrentUser,
    db: DbSession,
    provider: Optional[str] = Header(None, alias="X-Bondify-AI-Provider"),
    api_key: Optional[str] = Header(None, alias="X-Bondify-AI-Key"),
    model: Optional[str] = Header(None, alias="X-Bondify-AI-Model"),
) -> ReadingAnalysisResponse:
    """
    Analyze article content using AI.
    
    Returns suggested vocabulary, summary, key concepts, and grammar highlights.
    Results are cached to avoid repeated API calls.
    
    Supports BYOK (Bring Your Own Key) via X-Bondify-AI-* headers.
    Priority: Client API Key -> Admin Settings -> Environment Variables
    """
    service = ReadingService(db)
    article = await service.get_article(article_id, current_user.id)
    
    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "ARTICLE_NOT_FOUND", "message": "Article not found"},
        )
    
    # Check if we have cached analysis
    if article.ai_analysis_json:
        try:
            cached_data = json.loads(article.ai_analysis_json)
            cached_data["cached"] = True
            return ReadingAnalysisResponse(**cached_data)
        except (json.JSONDecodeError, ValueError):
            pass  # Invalid cache, regenerate
    
    # Generate new analysis using LLM
    try:
        prompt = READING_ANALYSIS_PROMPT.format(content=article.content[:8000])  # Limit content length
        
        # Check if user provides custom API key (BYOK)
        if api_key:
            # Use client-provided API key
            llm = LLMFactory.create(provider=provider, api_key=api_key, model=model)
            response = await llm.ainvoke(prompt)
        else:
            # Fall back to LLMContext (admin settings -> env variables)
            async with LLMContext(db, endpoint="reading_analysis") as ctx:
                response = await ctx.llm.ainvoke(prompt)
        
        analysis_text = response.content if hasattr(response, 'content') else str(response)
        
        # Parse JSON from response
        # Handle potential markdown code blocks
        if "```json" in analysis_text:
            analysis_text = analysis_text.split("```json")[1].split("```")[0]
        elif "```" in analysis_text:
            analysis_text = analysis_text.split("```")[1].split("```")[0]
        
        analysis_data = json.loads(analysis_text.strip())
        
        # Cache the analysis
        article.ai_analysis_json = json.dumps(analysis_data)
        await db.commit()
        
        analysis_data["cached"] = False
        return ReadingAnalysisResponse(**analysis_data)
        
    except LLMServiceError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"error": "LLM_SERVICE_ERROR", "message": str(e.message)},
        )
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "ANALYSIS_PARSE_ERROR", "message": f"Failed to parse AI response: {str(e)}"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "ANALYSIS_ERROR", "message": f"Failed to analyze article: {str(e)}"},
        )
