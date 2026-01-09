"""Pydantic schemas for vocabulary API."""

from typing import List, Optional

from pydantic import BaseModel, Field


class Pronunciation(BaseModel):
    """Pronunciation information for a word."""

    ipa: str = Field(..., description="IPA phonetic transcription")
    phoneticBreakdown: str = Field(..., description="Syllable breakdown")
    oxfordRespelling: str = Field(..., description="Oxford respelling")


class WordStructure(BaseModel):
    """Word structure analysis (prefix, root, suffix)."""

    prefix: Optional[str] = Field(None, description="Word prefix")
    prefixMeaning: Optional[str] = Field(None, description="Meaning of the prefix")
    root: str = Field(..., description="Root word")
    rootMeaning: str = Field(..., description="Meaning of the root")
    suffix: Optional[str] = Field(None, description="Word suffix")
    suffixMeaning: Optional[str] = Field(None, description="Meaning of the suffix")


class WordMeaning(BaseModel):
    """A specific meaning of a word in context."""

    context: str = Field(..., description="Context or domain for this meaning")
    meaning: str = Field(..., description="The meaning in this context")
    example: str = Field(..., description="Example sentence")


class Synonym(BaseModel):
    """Synonym information with interchangeability."""

    word: str = Field(..., description="The synonym word")
    meaning: str = Field(..., description="Meaning of the synonym")
    context: str = Field(..., description="When to use this synonym")
    interchangeable: str = Field(
        ..., description="Interchangeability: 'yes', 'sometimes', or 'no'"
    )


class CommonMistake(BaseModel):
    """Common mistake information."""

    incorrect: str = Field(..., description="Incorrect usage example")
    issue: str = Field(..., description="What's wrong with this usage")
    correct: str = Field(..., description="Correct usage")


class WordDefinition(BaseModel):
    """Comprehensive word definition response."""

    word: str = Field(..., description="The word being defined")
    partOfSpeech: str = Field(..., description="Part of speech (noun, verb, etc.)")
    definition: str = Field(..., description="Clear, concise definition")
    pronunciation: Pronunciation = Field(..., description="Pronunciation information")
    wordStructure: WordStructure = Field(..., description="Word structure analysis")
    etymology: str = Field(..., description="Origin and history of the word")
    meanings: List[WordMeaning] = Field(
        ..., description="Multiple meanings with contexts"
    )
    collocations: List[str] = Field(..., description="Common word combinations")
    synonyms: List[Synonym] = Field(..., description="Synonyms with details")
    learningTip: str = Field(..., description="Helpful tip for remembering")
    visualTrick: str = Field(..., description="Visual memory aid")
    memoryPhrase: str = Field(..., description="Memorable phrase using the word")
    commonMistakes: Optional[List[CommonMistake]] = Field(
        None, description="Common mistakes to avoid"
    )


class VocabularyLookupRequest(BaseModel):
    """Request to look up a word."""

    word: str = Field(..., min_length=1, description="The word to look up")


class VocabularyLookupResponse(WordDefinition):
    """Response from vocabulary lookup (same as WordDefinition)."""

    pass
