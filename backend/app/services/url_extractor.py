"""URL content extraction service."""

import re
import logging
from typing import Optional
from urllib.parse import urlparse

import httpx
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)


class UrlExtractorService:
    """Service for extracting article content from URLs."""

    # Common article content selectors
    ARTICLE_SELECTORS = [
        "article",
        '[role="main"]',
        ".post-content",
        ".article-content",
        ".entry-content",
        ".content-body",
        ".post-body",
        ".article-body",
        "main",
        "#content",
        ".content",
    ]

    # Elements to remove
    REMOVE_SELECTORS = [
        "script",
        "style",
        "nav",
        "header",
        "footer",
        "aside",
        "form",
        "iframe",
        ".advertisement",
        ".ads",
        ".social-share",
        ".comments",
        ".related-posts",
        ".sidebar",
        '[role="navigation"]',
        '[role="banner"]',
        '[role="contentinfo"]',
    ]

    def __init__(self):
        self.client = httpx.AsyncClient(
            timeout=20.0,
            follow_redirects=True,
            headers={
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
                "Accept-Encoding": "gzip, deflate, br",
                "Cache-Control": "no-cache",
                "Pragma": "no-cache",
                "Sec-Ch-Ua": '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
                "Sec-Ch-Ua-Mobile": "?0",
                "Sec-Ch-Ua-Platform": '"macOS"',
                "Sec-Fetch-Dest": "document",
                "Sec-Fetch-Mode": "navigate",
                "Sec-Fetch-Site": "none",
                "Sec-Fetch-User": "?1",
                "Upgrade-Insecure-Requests": "1",
            },
        )

    async def extract_from_url(self, url: str) -> dict:
        """
        Extract article content from a URL.
        
        Returns:
            dict: Contains 'title', 'content', 'source_url', and 'word_count'
        """
        # Validate URL
        parsed = urlparse(url)
        if not parsed.scheme or not parsed.netloc:
            raise ValueError("Invalid URL format")

        try:
            response = await self.client.get(url)
            response.raise_for_status()
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error fetching {url}: {e.response.status_code}")
            raise ValueError(f"Failed to fetch URL: HTTP {e.response.status_code}")
        except httpx.RequestError as e:
            logger.error(f"Request error fetching {url}: {str(e)}")
            raise ValueError(f"Failed to fetch URL: {str(e)}")

        html = response.text
        logger.info(f"Fetched {len(html)} bytes from {url}")
        
        soup = BeautifulSoup(html, "lxml")

        # Extract title
        title = self._extract_title(soup)

        # Remove unwanted elements
        for selector in self.REMOVE_SELECTORS:
            for elem in soup.select(selector):
                elem.decompose()

        # Extract main content
        content = self._extract_content(soup)
        
        logger.info(f"Extracted content length: {len(content)} chars")

        # Lower threshold - some sites have short articles
        if not content or len(content) < 50:
            raise ValueError("Could not extract article content from this URL")

        word_count = len(content.split())

        return {
            "title": title,
            "content": content,
            "source_url": url,
            "word_count": word_count,
        }

    def _extract_title(self, soup: BeautifulSoup) -> str:
        """Extract article title."""
        # Try og:title first
        og_title = soup.find("meta", property="og:title")
        if og_title and og_title.get("content"):
            return og_title["content"].strip()

        # Try h1
        h1 = soup.find("h1")
        if h1:
            return h1.get_text(strip=True)

        # Fall back to title tag
        title_tag = soup.find("title")
        if title_tag:
            return title_tag.get_text(strip=True)

        return "Untitled Article"

    def _extract_content(self, soup: BeautifulSoup) -> str:
        """Extract main article content."""
        content_elem = None

        # Try to find article content using selectors
        for selector in self.ARTICLE_SELECTORS:
            elem = soup.select_one(selector)
            if elem:
                content_elem = elem
                break

        # Fallback to body
        if not content_elem:
            content_elem = soup.body or soup

        # Extract text from paragraphs
        paragraphs = []
        for p in content_elem.find_all(["p", "h2", "h3", "h4", "blockquote", "li"]):
            text = p.get_text(strip=True)
            # Filter out very short paragraphs (likely navigation/buttons)
            if len(text) > 30:
                paragraphs.append(text)

        content = "\n\n".join(paragraphs)

        # Clean up whitespace
        content = re.sub(r"\n{3,}", "\n\n", content)
        content = re.sub(r" {2,}", " ", content)

        return content.strip()

    async def close(self):
        """Close the HTTP client."""
        await self.client.aclose()


# Singleton instance
_extractor: Optional[UrlExtractorService] = None


def get_url_extractor() -> UrlExtractorService:
    """Get or create the URL extractor service."""
    global _extractor
    if _extractor is None:
        _extractor = UrlExtractorService()
    return _extractor
