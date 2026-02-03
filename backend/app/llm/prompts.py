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

Target words the user was practicing: {target_words}

Provide a helpful summary including:

## Session Summary
- Brief overview of how the conversation went

## Grammar & Language
- Any grammar mistakes with corrections (if any)
- Tips for more natural speaking

## Vocabulary Usage
- How well the user used the target vocabulary (if any were provided)
- Highlight any good vocabulary the user demonstrated

## Recommended Words to Learn
Based on the conversation topic and areas where the user could improve, suggest 3-5 useful vocabulary words they should add to their word list. For each word:
- The word itself
- Brief definition
- An example of how it could be used in this conversation context

## Encouragement
- Positive feedback and motivation to continue practicing

Format in markdown. Be constructive and encouraging."""

CONVERSATION_OPENING_PROMPT = """Generate a friendly opening message to start an English conversation practice session.

The message should:
1. Be warm and welcoming
2. Suggest a casual topic to discuss
3. Ask an open-ended question to get started

Keep it brief (2-3 sentences). Return ONLY the opening message."""

CONVERSATION_OPENING_WITH_TOPIC_PROMPT = """Generate a friendly opening message to start an English conversation practice session.

Topic: {topic}
Vocabulary words to practice: {target_words}

The message should:
1. Be warm and welcoming
2. Introduce the topic naturally
3. Ask an open-ended question related to the topic
4. If vocabulary words are provided, try to naturally use ONE of them in your opening

Keep it brief (2-3 sentences). Return ONLY the opening message."""

CONVERSATION_REPLY_WITH_WORDS_PROMPT = """You are having an English conversation with a learner.

Conversation history:
{history}

User's latest message: {message}

{correction_context}

Target vocabulary words the user is practicing: {target_words}

Generate a natural, friendly reply that:
1. Responds to what the user said
2. Keeps the conversation flowing
3. Is appropriate for their level
4. If natural, incorporate or reference one of the target vocabulary words
5. Occasionally encourage the user to use the target words in their responses

Reply naturally as a conversation partner. Keep it concise (1-3 sentences)."""

# =============================================================================
# Scenario-based Conversation Prompts
# =============================================================================

SCENARIO_TEMPLATES = {
    "job_interview": {
        "name": "Job Interview",
        "role": "HR Manager",
        "role_description": "You are an HR manager conducting a job interview for a software developer position at a tech company",
        "user_role": "Job Candidate",
        "user_goal": "Successfully answer interview questions, demonstrate your qualifications, and make a good impression",
        "vocabulary": ["qualifications", "strengths", "experience", "collaborate", "initiative", "deadline", "prioritize"],
        "opening": "Welcome! Thank you for coming in today. I'm Sarah, the HR manager here at TechCorp. Before we dive into the technical aspects, I'd like to learn a bit about you. Could you start by telling me about yourself and what drew you to this position?",
    },
    "restaurant": {
        "name": "Restaurant Ordering",
        "role": "Waiter/Waitress",
        "role_description": "You are a friendly waiter at an upscale restaurant, ready to take orders and make recommendations",
        "user_role": "Restaurant Guest",
        "user_goal": "Order a meal, ask about the menu, handle dietary restrictions, and pay the bill",
        "vocabulary": ["reservation", "appetizer", "entrée", "vegetarian", "recommendation", "specialty", "bill"],
        "opening": "Good evening! Welcome to La Maison. I'm your server tonight. Have you had a chance to look at the menu, or would you like me to tell you about our specials today?",
    },
    "airport": {
        "name": "Airport Check-in",
        "role": "Check-in Agent",
        "role_description": "You are a professional airline check-in agent at the airport helping passengers with their flights",
        "user_role": "Traveler",
        "user_goal": "Check in for your flight, handle luggage, get boarding pass, and navigate airport procedures",
        "vocabulary": ["boarding pass", "carry-on", "overhead bin", "departure gate", "layover", "aisle seat", "window seat"],
        "opening": "Good morning! Welcome to Global Airlines. May I see your passport and booking confirmation, please? Are you checking any bags today?",
    },
    "hotel": {
        "name": "Hotel Check-in",
        "role": "Hotel Receptionist",
        "role_description": "You are a friendly hotel receptionist at a business hotel helping guests with their reservations",
        "user_role": "Hotel Guest",
        "user_goal": "Check in to your room, ask about amenities, request services, and handle any issues",
        "vocabulary": ["reservation", "amenities", "checkout", "room service", "wake-up call", "complimentary", "concierge"],
        "opening": "Welcome to the Grand Hotel! I hope you had a pleasant journey. Do you have a reservation with us? I'll be happy to get you checked in right away.",
    },
    "doctor": {
        "name": "Doctor's Appointment",
        "role": "Doctor",
        "role_description": "You are a caring general practitioner seeing a patient for a consultation about their health concerns",
        "user_role": "Patient",
        "user_goal": "Describe your symptoms, answer the doctor's questions, and understand your treatment options",
        "vocabulary": ["symptoms", "prescription", "diagnosis", "treatment", "appointment", "follow-up", "medication"],
        "opening": "Hello! Please, have a seat. I'm Dr. Johnson. So, what brings you in to see me today? Tell me about what's been bothering you.",
    },
}

CONVERSATION_SCENARIO_SYSTEM_PROMPT = """You are playing the role of {role} in a {scenario_name} scenario.

Setting: {role_description}
Your character: {role}
User's role: {user_role}
User's goal: {user_goal}

Guidelines:
1. Stay fully in character throughout the conversation - you ARE the {role}
2. Use natural, contextually appropriate language for your role
3. Gently guide the user through the scenario realistically
4. If the user makes English mistakes, continue naturally but provide subtle correction
5. Use scenario-specific vocabulary when appropriate
6. Keep your responses realistic to the situation - don't break character
7. If the user seems stuck, offer helpful prompts while staying in character

Remember: You're helping them practice English in a realistic scenario. Be encouraging but authentic."""

CONVERSATION_SCENARIO_REPLY_PROMPT = """You are playing the role of {role} in a {scenario_name} scenario.

Scenario context: {role_description}
User is playing: {user_role}
Target vocabulary: {target_words}

Conversation history:
{history}

User's latest message: {message}

{correction_context}

Stay in character as the {role}. Generate a natural, realistic response that:
1. Is appropriate for your role in this scenario
2. Moves the scenario interaction forward naturally
3. Uses scenario-appropriate vocabulary when possible
4. If the user seems confused or stuck, gently guide them
5. Keep responses realistic in length for the situation

Reply as the {role}. Stay in character."""

CONVERSATION_SCENARIO_FEEDBACK_PROMPT = """Analyze this role-play conversation and provide scenario-specific feedback:

Scenario: {scenario_name}
User's role: {user_role}
User's goal: {user_goal}
Target vocabulary: {target_words}

Conversation:
{conversation}

Provide helpful feedback including:

## Scenario Performance
- How well did the user handle the {scenario_name} situation?
- Did they achieve their goal as the {user_role}?
- What did they do well in this context?

## Language in Context
- Any grammar or vocabulary issues specific to this situation
- Phrases that worked well for this scenario
- What could sound more natural in this context

## Scenario-Specific Vocabulary
- How well did they use the target vocabulary?
- Additional useful phrases for this type of situation

## Recommendations
- 3-5 vocabulary words or phrases specific to {scenario_name} situations
- Tips for handling similar real-world situations

## Encouragement
- Positive feedback and motivation to continue practicing

Format in markdown. Be constructive and scenario-focused."""

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

# =============================================================================
# Game Question Generation Prompts
# =============================================================================

CLARITY_QUESTION_PROMPT = """Generate {count} English clarity practice questions.

Each question should have a sentence with a wordy/redundant phrase that can be simplified.

Return a JSON array with exactly this structure:
[
  {{
    "sentence": "Due to the fact that it was raining, we stayed inside.",
    "wordyPart": {{
      "startIndex": 0,
      "text": "Due to the fact that"
    }},
    "options": ["Because", "Since", "As a result of the situation where"],
    "correctOption": "Because",
    "reason": "'Due to the fact that' is wordy. Simply use 'Because' for clarity."
  }}
]

Requirements:
- Create diverse sentence topics (work, daily life, academic, technology, etc.)
- wordyPart.startIndex must be the exact character position where the wordy phrase starts
- options must have exactly 3 choices: 2 good alternatives and 1 obviously wrong/wordier option
- correctOption must be the best, most concise replacement
- reason should explain why the original is wordy and why the answer is better

Return ONLY valid JSON array, no other text."""

TRANSITIONS_QUESTION_PROMPT = """Generate {count} English transition word practice questions.

Each question should have a paragraph with a blank where a transition word should go.

Return a JSON array with exactly this structure:
[
  {{
    "paragraph": "The project was delayed by several weeks. ______, we managed to deliver it on time by working overtime.",
    "options": ["However", "Moreover", "Therefore", "Although"],
    "correctOption": "However",
    "reason": "'However' shows contrast between the delay and the successful delivery."
  }}
]

Requirements:
- Create realistic, professional contexts
- options must have exactly 4 transition words
- Include various transition types: contrast, addition, cause/effect, sequence
- correctOption must logically fit the sentence context
- reason should explain why this transition word is appropriate

Return ONLY valid JSON array, no other text."""

BREVITY_QUESTION_PROMPT = """Generate {count} English brevity practice questions.

Each question should present a verbose sentence and ask for a more concise version.

Return a JSON array with exactly this structure:
[
  {{
    "originalSentence": "At this point in time, we are not in a position to make a decision.",
    "options": ["We cannot decide now.", "At this moment we are unable to make decisions.", "We are currently not positioned to decide."],
    "correctOption": "We cannot decide now.",
    "reason": "Removes redundant phrases like 'at this point in time' and 'in a position to' for clearer expression."
  }}
]

Requirements:
- Create sentences with common verbose patterns (e.g., "in order to", "the fact that", "at this point in time")
- options must have 3 choices: 1 best concise version, 1 decent but not optimal, 1 still verbose
- correctOption must be the most concise while maintaining meaning
- reason should explain the wordiness issues fixed

Return ONLY valid JSON array, no other text."""

CONTEXT_QUESTION_PROMPT = """Generate {count} vocabulary-in-context questions.

Each question should have a sentence with a blank where a vocabulary word fits.

Return a JSON array with exactly this structure:
[
  {{
    "sentence": "The new app became _____ in our daily lives; everyone seemed to use it constantly.",
    "correctWord": "ubiquitous",
    "options": ["ubiquitous", "ephemeral", "meticulous", "benevolent"],
    "explanation": "Ubiquitous means 'present everywhere,' fitting the context of something everyone uses constantly."
  }}
]

Requirements:
- Use intermediate to advanced vocabulary words (GRE/TOEFL level)
- Sentence context should make the correct answer clear
- options must have exactly 4 vocabulary words
- All options should be real English words at similar difficulty level
- explanation should explain why the word fits the context

Return ONLY valid JSON array, no other text."""

DICTION_QUESTION_PROMPT = """Generate {count} diction (word choice) questions.

Each question tests whether a word or phrase is used correctly in a sentence.

Return a JSON array with exactly this structure:
[
  {{
    "sentence": "I could care less about what he thinks.",
    "highlightedPart": {{
      "startIndex": 2,
      "text": "could care less"
    }},
    "isCorrect": false,
    "correctVersion": "couldn't care less",
    "category": "idiom",
    "explanation": "The correct phrase is 'couldn't care less,' meaning you care so little that it's impossible to care any less."
  }}
]

Requirements:
- Mix of correct and incorrect usages (roughly 30% correct, 70% incorrect)
- category must be one of: "vocabulary", "grammar", "idiom", "preposition", "word-choice"
- highlightedPart.startIndex must be the exact character position
- For correct usages, omit correctVersion field
- Common errors: affect/effect, less/fewer, lie/lay, their/there/they're, etc.

Return ONLY valid JSON array, no other text."""

PUNCTUATION_QUESTION_PROMPT = """Generate {count} punctuation practice questions.

Each question has a sentence with blanks where punctuation marks should go.

Return a JSON array with exactly this structure:
[
  {{
    "sentence": "The dog wagged ___ tail happily.",
    "blanks": [
      {{ "options": ["its", "it's", "its'"], "correctIndex": 0 }}
    ],
    "punctuationType": "apostrophe",
    "explanation": "'Its' is possessive. 'It's' means 'it is' or 'it has'."
  }}
]

Requirements:
- punctuationType must be one of: "apostrophe", "comma", "hyphen", "semicolon", "colon"
- blanks array can have multiple blanks for the same sentence
- Each blank has options array and correctIndex (0-based)
- Focus on common punctuation mistakes
- explanation should teach the rule

Return ONLY valid JSON array, no other text."""

LISTENING_QUESTION_PROMPT = """Generate {count} conversation comprehension questions.

Each question presents a dialogue and asks what the best response would be.

Return a JSON array with exactly this structure:
[
  {{
    "category": "casual",
    "conversation": [
      {{ "speaker": "Person A", "text": "Hey, do you want to grab some coffee later?" }},
      {{ "speaker": "Person B", "text": "I'd love to, but I have a dentist appointment at 3." }}
    ],
    "question": "What is the best response from Person A?",
    "options": [
      "No problem! How about tomorrow instead?",
      "You should cancel your appointment.",
      "I don't like dentists either."
    ],
    "correctAnswer": 0,
    "explanation": "The best response acknowledges the conflict and offers an alternative, showing flexibility and consideration."
  }}
]

Requirements:
- category must be "casual" or "professional"
- conversation should be 2-3 exchanges between speakers
- options must have exactly 3 responses
- correctAnswer is the 0-based index of the best response
- Focus on appropriate social/professional communication

Return ONLY valid JSON array, no other text."""

SPEED_READING_QUESTION_PROMPT = """Generate {count} reading comprehension articles.

Each article should have a unique title and exactly 3 paragraphs with comprehension questions (one per paragraph).

Return a JSON array with exactly this structure:
[
  {{
    "title": "The Power of Sleep",
    "paragraphs": [
      {{
        "text": "Sleep is one of the most important factors...",
        "question": {{
          "text": "According to the passage, what happens during sleep?",
          "options": [
            "The brain stops all activity",
            "The body repairs tissues and consolidates memories",
            "Heart rate increases significantly",
            "Appetite hormones are suppressed"
          ],
          "correctIndex": 1
        }}
      }},
      {{
        "text": "The quality of sleep matters...",
        "question": {{
          "text": "What is a key characteristic of deep sleep?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctIndex": 2
        }}
      }},
      {{
        "text": "Improving sleep hygiene can...",
        "question": {{
          "text": "Why should electronic devices be avoided before bedtime?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctIndex": 2
        }}
      }}
    ]
  }}
]

Requirements:
- Generate exactly {count} articles, each with EXACTLY 3 paragraphs
- Each article should have a unique title
- Topics: science, technology, health, environment, history, economics
- Each paragraph should be 80-150 words
- Questions should test comprehension, not just memory
- options must have exactly 4 choices
- correctIndex is 0-based

Return ONLY valid JSON array, no other text."""

WORD_PARTS_QUESTION_PROMPT = """Generate {count} word etymology questions.

Each question should present a word and break it down into prefix, root, and suffix.

Return a JSON array with exactly this structure:
[
  {{
    "word": "synchronize",
    "meaning": "cause to occur at the same time",
    "parts": [
      {{"type": "prefix", "value": "syn-", "meaning": "together"}},
      {{"type": "root", "value": "chron", "meaning": "time"}},
      {{"type": "suffix", "value": "-ize", "meaning": "verb ending"}}
    ],
    "targetPartIndex": 0,
    "options": ["syn-", "anti-", "co-", "pre-"] 
  }}
]

Requirements:
- Words must have at least one clearly identifiable part (prefix, root, or suffix)
- parts array must contain all morphological components
- type must be "prefix", "root", or "suffix"
- targetPartIndex is the index of the part to be quizzed
- options must include the correct target part value and 3 distractors of the SAME type (e.g., all prefixes)
- Distractors should be real morphological parts
- IMPORTANT: options must ONLY contain the affix value itself (e.g., "syn-", "-ize"), do NOT include meanings or brackets like "syn- [together]"

Return ONLY valid JSON array, no other text."""

ROCKET_QUESTION_PROMPT = """Generate {count} synonym practice questions.

Each question offers a target word and asks to identify a synonym.

Return a JSON array with exactly this structure:
[
  {{
    "word": "strategy",
    "meaning": "a plan of action designed to achieve a long-term or overall aim",
    "correctSynonym": "tactic",
    "options": ["tactic", "illusion", "barrier", "concept"]
  }}
]

Requirements:
- Use useful, commonly used vocabulary (CEFR B2-C1 level) suitable for professional or academic contexts
- Avoid archaic, overly obscure, or purely literary words (like 'laconic', 'bellicose', 'obsequious')
- correctSynonym must be a true synonym
- options must include the correct synonym and 3 plausible distractors
- Distractors should be real words of similar difficulty but different meaning

Return ONLY valid JSON array, no other text."""

REPHRASE_QUESTION_PROMPT = """Generate {count} rephrasing challenge questions.

Each question asks the user to improve a sentence or paragraph.

Return a JSON array with exactly this structure:
[
  {{
    "type": "conjunction",
    "level": 1,
    "context": "He was tired. He went to bed early.",
    "targetSentence": "Combine using a conjunction",
    "options": ["He was tired, so he went to bed early.", "He was tired because he went to bed early.", "He was tired but he went to bed early.", "He was tired if he went to bed early."],
    "correctAnswer": "He was tired, so he went to bed early.",
    "explanation": "'So' correctly shows the cause-and-effect relationship."
  }}
]

Requirements:
- type must be one of: "conjunction", "reorder", "rephrase", "combine"
- level must be 1 (easy), 2 (medium), or 3 (hard)
- options must have exactly 4 choices
- correctAnswer must be one of the options
- explanation should explain why the answer is the best improvement

Return ONLY valid JSON array, no other text."""

RECALL_QUESTION_PROMPT = """Generate {count} vocabulary recall questions.

Each question provides a definition and asks for the word.

Return a JSON array with exactly this structure:
[
  {{
    "word": "resilient",
    "meaning": "able to withstand or recover quickly from difficult conditions",
    "partOfSpeech": "adjective"
  }}
]

Requirements:
- Use useful, commonly used vocabulary (CEFR B2-C1 level) suitable for professional discussion
- Avoid extremely obscure or purely literary terms
- meaning should be clear and precise
- partOfSpeech must be correct (noun, verb, adjective, adverb)

Return ONLY valid JSON array, no other text."""

ATTENTION_QUESTION_PROMPT = """Generate 1 audio comprehension article with categorization task.

Return a JSON object with exactly this structure:
{{
  "title": "Forest Ecosystems",
  "audioText": "Forests are complex ecosystems with distinct layers. The canopy is the top layer...",
  "mainBubbles": [
    {{ "id": "canopy", "text": "Canopy Layer", "color": "purple" }},
    {{ "id": "floor", "text": "Forest Floor", "color": "orange" }},
    {{ "id": "understory", "text": "Understory", "color": "cyan" }}
  ],
  "relatedBubbles": [
    {{ "id": "birds", "text": "Birds", "parentId": "canopy" }},
    {{ "id": "fungi", "text": "Fungi", "parentId": "floor" }},
    {{ "id": "shrubs", "text": "Shrubs", "parentId": "understory" }}
  ]
}}

Requirements:
- audioText should be 100-200 words, informative and structured
- mainBubbles must have exactly 3 categories
- color must be "purple", "cyan", or "orange"
- relatedBubbles must have 6-9 items total (2-3 per category)
- parentId in relatedBubbles must match an id in mainBubbles
- The text must clearly associate the items with their categories

Return ONLY valid JSON object, no other text."""

PRONUNCIATION_QUESTION_PROMPT = """Generate {count} pronunciation questions for commonly mispronounced English words.

Return a JSON array with exactly this structure:
[
  {{
    "word": "epitome",
    "definition": "A perfect example of a particular quality or type",
    "correctPronunciation": "ih-PIT-uh-mee",
    "ttsCorrect": "epitome",
    "incorrectPronunciations": ["EP-ih-tohm", "ep-ih-TOHM"],
    "ttsIncorrect": ["epi tome", "eppy tome"],
    "ipaCorrect": "/ɪˈpɪtəmi/",
    "explanation": "Many people pronounce it like 'epi-tome' but it has four syllables with stress on the second."
  }}
]

Requirements:
- Focus on vocabulary words that native speakers commonly mispronounce
- Use Oxford-style respelling for pronunciations (e.g. ih-PIT-uh-mee, not IPA)
- correctPronunciation should use capital letters for stressed syllables
- ttsCorrect MUST be the actual word itself (e.g. "epitome", "segue") - TTS will pronounce it correctly
- incorrectPronunciations must have exactly 2 common wrong pronunciations
- ttsIncorrect is an array of phonetic-friendly text that produces the WRONG pronunciation when read by TTS
  - Use word splits or similar-sounding words (e.g. "epi tome" for wrong 3-syllable pronunciation)
  - This should sound like the wrong pronunciation, NOT like the correct one
- ipaCorrect should be IPA notation for reference
- explanation should explain why the word is commonly mispronounced
- Include words from various categories: academic, food, science, everyday words

Return ONLY valid JSON array, no other text."""

# =============================================================================
# Reading Analysis Prompts
# =============================================================================

READING_ANALYSIS_PROMPT = """Analyze the following English article and provide learning assistance.

Article Content:
{content}

Return a JSON object with this exact structure:
{{
  "summary": "A 2-3 sentence summary of the article's main points in simple English.",
  "suggestedWords": [
    {{
      "word": "the vocabulary word",
      "definition": "clear, concise definition",
      "contextSentence": "the sentence from the article where this word appears"
    }}
  ],
  "keyConcepts": [
    {{
      "concept": "Main idea or concept name",
      "explanation": "Simple explanation in easy-to-understand English"
    }}
  ],
  "grammarHighlights": [
    {{
      "sentence": "An interesting sentence from the article",
      "pattern": "Grammar pattern name (e.g., 'Passive Voice', 'Subjunctive Mood')",
      "explanation": "Brief explanation of why this sentence structure is notable"
    }}
  ]
}}

Requirements:
1. **suggestedWords**: Select 3-6 advanced vocabulary words (CEFR B2-C2 level) that:
   - Are important for understanding the text
   - Would be valuable for an English learner to know
   - Avoid common words like "the", "is", "have"
   
2. **keyConcepts**: Extract 2-4 main ideas or arguments from the article
   - Use simple language to explain complex ideas
   - Focus on what the reader should take away
   
3. **grammarHighlights**: Find 2-3 sentences with notable grammar patterns:
   - Complex sentence structures (relative clauses, conditionals)
   - Interesting verb tenses or moods
   - Effective use of conjunctions or transitions
   
4. **summary**: Write 2-3 sentences summarizing the article
   - Use simple, clear language
   - Cover the main topic and key points

Return ONLY valid JSON, no other text."""

