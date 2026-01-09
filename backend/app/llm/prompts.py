"""Prompt templates for LLM agents."""

# =============================================================================
# Conversation Agent Prompts
# =============================================================================

CONVERSATION_SYSTEM_PROMPT = """You are a friendly English conversation partner helping users practice English.

Your role:
1. Engage in natural, casual conversation
2. Detect and gently correct grammar mistakes
3. Ask follow-up questions to keep the conversation flowing
4. Adapt to the user's level (beginner/intermediate/advanced)

When you detect a grammar mistake:
- Note the original phrase
- Provide the corrected version
- Give a brief, helpful explanation

Keep responses conversational and encouraging. Don't be overly formal."""

GRAMMAR_CHECK_PROMPT = """Analyze this message for grammar mistakes:
"{message}"

If there are mistakes, return JSON:
{{
  "has_error": true,
  "original": "the incorrect phrase",
  "corrected": "the correct phrase",
  "explanation": "brief explanation"
}}

If no mistakes, return:
{{"has_error": false}}

Return ONLY valid JSON, no other text."""

CONVERSATION_REPLY_PROMPT = """You are having an English conversation with a learner.

Conversation history:
{history}

User's latest message: {message}

{correction_context}

Generate a natural, friendly reply that:
1. Responds to what the user said
2. Keeps the conversation flowing
3. Is appropriate for their level

Reply naturally as a conversation partner. Keep it concise (1-3 sentences)."""

CONVERSATION_FOLLOWUP_PROMPT = """Based on this conversation:
{history}

And the assistant's reply: {reply}

Generate ONE follow-up question to keep the conversation going.
The question should be:
- Related to the topic
- Open-ended to encourage more practice
- Natural and conversational

Return ONLY the follow-up question, nothing else."""

CONVERSATION_FEEDBACK_PROMPT = """Analyze this English conversation and provide feedback:

{conversation}

Provide a helpful summary including:
1. What went well in the conversation
2. Grammar mistakes made (if any) with corrections
3. Tips for more natural speaking
4. Encouragement for the learner

Keep the feedback constructive and encouraging. Format as plain text, not markdown."""

CONVERSATION_OPENING_PROMPT = """Generate a friendly opening message to start an English conversation practice session.

The message should:
1. Be warm and welcoming
2. Suggest a casual topic to discuss
3. Ask an open-ended question to get started

Keep it brief (2-3 sentences). Return ONLY the opening message."""

# =============================================================================
# Vocabulary Agent Prompts
# =============================================================================

VOCABULARY_LOOKUP_PROMPT = """Provide comprehensive information about the English word: "{word}"

Return a JSON object with this exact structure:
{{
  "word": "{word}",
  "partOfSpeech": "noun/verb/adjective/etc",
  "definition": "clear, concise definition",
  "pronunciation": {{
    "ipa": "/phonetic/",
    "phoneticBreakdown": "SYLLABLE-breakdown",
    "oxfordRespelling": "/respelling/"
  }},
  "wordStructure": {{
    "prefix": "prefix or null",
    "prefixMeaning": "meaning or null",
    "root": "root word",
    "rootMeaning": "root meaning",
    "suffix": "suffix or null",
    "suffixMeaning": "meaning or null"
  }},
  "etymology": "origin and history of the word",
  "meanings": [
    {{
      "context": "Context name",
      "meaning": "meaning in this context",
      "example": "example sentence"
    }}
  ],
  "collocations": ["common phrase 1", "common phrase 2"],
  "synonyms": [
    {{
      "word": "synonym",
      "meaning": "its meaning",
      "context": "when to use",
      "interchangeable": "yes/sometimes/no"
    }}
  ],
  "learningTip": "helpful tip for remembering",
  "visualTrick": "visual memory aid",
  "memoryPhrase": "memorable phrase using the word",
  "commonMistakes": [
    {{
      "incorrect": "wrong usage example",
      "issue": "what's wrong",
      "correct": "correct usage"
    }}
  ]
}}

Be thorough but accurate. Include 2-3 meanings, 4-5 collocations, 4-6 synonyms, and 2-3 common mistakes.
Return ONLY valid JSON, no other text."""

# =============================================================================
# Rephrase Agent Prompts
# =============================================================================

REPHRASE_ANALYSIS_PROMPT = """Analyze this English sentence for grammar issues and provide rephrasing options:

Sentence: "{sentence}"

Return a JSON object with this exact structure:
{{
  "originalSentence": "{sentence}",
  "issues": [
    {{
      "type": "Issue Type (e.g., Incorrect Grammar, Subject-Verb Agreement)",
      "problematic": "the problematic phrase",
      "explanation": "why it's wrong",
      "corrections": ["correction 1", "correction 2"]
    }}
  ],
  "rephrasedOptions": [
    {{
      "context": "Natural & Concise",
      "sentence": "rephrased version",
      "whyItWorks": "explanation of improvement"
    }},
    {{
      "context": "Formal / Professional",
      "sentence": "formal version",
      "whyItWorks": "explanation"
    }},
    {{
      "context": "Casual / Conversational",
      "sentence": "casual version",
      "whyItWorks": "explanation"
    }}
  ],
  "keyTakeaways": [
    "Learning point 1",
    "Learning point 2"
  ],
  "bestRecommendation": "the best rephrased version"
}}

Identify all grammar issues, awkward phrasing, and clarity problems.
Provide at least 3 rephrasing options for different contexts.
If the sentence is already correct, return empty issues array but still provide alternative phrasings.
Return ONLY valid JSON, no other text."""
