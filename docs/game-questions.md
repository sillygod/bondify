# Game Questions API

## Overview

Game questions are AI-generated via the Gemini API and stored in the database. The backend provides endpoints for generating and fetching questions, with built-in duplicate detection.

## Supported Game Types

| Type | Description | Frontend Hook |
|------|-------------|---------------|
| `rocket` | Synonym matching | `useRocketQuestions` |
| `diction` | Word choice/grammar | `useDictionQuestions` |
| `recall` | Definition to word | `useRecallQuestions` |
| `clarity` | Sentence clarity | - |
| `transitions` | Transition words | - |
| `brevity` | Concise writing | - |
| `punctuation` | Punctuation rules | - |
| `word_parts` | Root/prefix/suffix | - |
| `rephrase` | Sentence rephrasing | - |
| `attention` | Listening comprehension | - |

## API Endpoints

### Fetch Questions
```
GET /api/game-questions/{game_type}
  ?limit=10
  &only_reviewed=true
  &random_order=true
```

### Generate Questions (Admin)
```
POST /api/game-questions/generate
{
  "game_type": "rocket",
  "count": 5,
  "difficulty": "medium"
}
```

### Update Question (Admin)
```
PATCH /api/game-questions/{id}
{
  "question_json": {...},
  "difficulty": "hard",
  "is_reviewed": true
}
```

### Delete Question (Admin)
```
DELETE /api/game-questions/{id}
```

## Question Structures

### Rocket Question
```json
{
  "word": "resilient",
  "meaning": "able to recover quickly",
  "correctSynonym": "hardy",
  "options": ["hardy", "weak", "fragile", "brittle"]
}
```

### Diction Question
```json
{
  "sentence": "I could care less about that.",
  "highlightedPart": {
    "startIndex": 2,
    "text": "could care less"
  },
  "isCorrect": false,
  "correctVersion": "couldn't care less",
  "category": "idiom",
  "explanation": "..."
}
```

### Recall Question
```json
{
  "word": "resilient",
  "meaning": "able to recover quickly from difficulties",
  "partOfSpeech": "adjective"
}
```

## Duplicate Detection

The backend automatically checks for duplicates when generating:
1. Fetches existing questions for the game type
2. Extracts unique identifiers (word/sentence)
3. Filters out duplicates before saving

Key fields used for duplicate detection:
- `word` - for vocabulary-based games
- `sentence` - for sentence-based games
- `originalSentence` - for rephrase games
