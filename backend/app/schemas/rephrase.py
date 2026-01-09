"""Pydantic schemas for rephrase API."""

from typing import List

from pydantic import BaseModel, Field


class GrammarIssue(BaseModel):
    """A grammar or clarity issue identified in the sentence."""

    type: str = Field(
        ..., description="Type of issue (e.g., Incorrect Grammar, Subject-Verb Agreement)"
    )
    problematic: str = Field(..., description="The problematic phrase")
    explanation: str = Field(..., description="Why it's wrong")
    corrections: List[str] = Field(
        default_factory=list, description="Possible corrections"
    )


class RephrasedOption(BaseModel):
    """A rephrased version of the sentence."""

    context: str = Field(
        ..., description="Context for this rephrasing (e.g., Natural & Concise, Formal)"
    )
    sentence: str = Field(..., description="The rephrased sentence")
    whyItWorks: str = Field(..., description="Explanation of why this version works better")


class RephraseAnalysis(BaseModel):
    """Complete rephrase analysis response."""

    originalSentence: str = Field(..., description="The original sentence submitted")
    issues: List[GrammarIssue] = Field(
        default_factory=list, description="List of grammar/clarity issues found"
    )
    rephrasedOptions: List[RephrasedOption] = Field(
        ..., min_length=1, description="List of rephrased options for different contexts"
    )
    keyTakeaways: List[str] = Field(
        ..., min_length=1, description="Key learning points from the analysis"
    )
    bestRecommendation: str = Field(
        ..., description="The best recommended rephrasing"
    )


class RephraseAnalyzeRequest(BaseModel):
    """Request to analyze and rephrase a sentence."""

    sentence: str = Field(
        ..., min_length=1, description="The sentence to analyze and rephrase"
    )


class RephraseAnalyzeResponse(RephraseAnalysis):
    """Response from rephrase analysis (same as RephraseAnalysis)."""

    pass
