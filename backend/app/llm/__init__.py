# LLM Integration Package
"""
This package provides LLM integration for the English Learning API.

Components:
- factory: LLM provider factory for creating LLM instances
- prompts: Prompt templates for various agents
- conversation_agent: Conversation practice agent
- vocabulary_agent: Vocabulary lookup agent
- rephrase_agent: Sentence analysis and rephrasing agent
"""

from app.llm.factory import LLMFactory, get_llm

__all__ = ["LLMFactory", "get_llm"]
