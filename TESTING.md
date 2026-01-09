# Testing Guide

This document provides comprehensive testing instructions for the English Learning Application, covering both manual testing workflows and automated testing approaches.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Manual Testing Guide](#manual-testing-guide)
3. [API Testing with cURL](#api-testing-with-curl)
4. [Automated Testing](#automated-testing)
5. [End-to-End Testing Workflow](#end-to-end-testing-workflow)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

### Backend Setup
```bash
cd backend
source venv/bin/activate  # Activate virtual environment
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup
```bash
npm install
npm run dev
```

### Required Environment Variables
Ensure your `backend/.env` file contains:
```env
SECRET_KEY=test-secret-key-for-development
LLM_PROVIDER=gemini
GOOGLE_API_KEY=your-api-key
```

## Manual Testing Guide

### 1. Health Check
Verify the backend is running:
```bash
curl http://localhost:8000/health
```
Expected response:
```json
{"status": "healthy", "service": "English Learning API"}
```

### 2. User Registration Flow

#### Step 1: Register a New User
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123!",
    "display_name": "Test User"
  }'
```
Expected response:
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer"
}
```

#### Step 2: Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123!"
  }'
```

#### Step 3: Get User Profile (Authenticated)
```bash
# Replace YOUR_ACCESS_TOKEN with the token from login response
curl http://localhost:8000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Step 4: Update User Profile
```bash
curl -X PUT http://localhost:8000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "display_name": "Updated Name",
    "learning_level": "advanced"
  }'
```

### 3. Conversation Practice Testing

#### Start a Conversation
```bash
curl -X POST http://localhost:8000/api/conversation/start \
  -H "Content-Type: application/json"
```
Expected response:
```json
{
  "session_id": "uuid-string",
  "opening_message": "Hi there! I'm excited to practice English with you..."
}
```

#### Send a Message
```bash
curl -X POST http://localhost:8000/api/conversation/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I go to school yesterday.",
    "session_id": "YOUR_SESSION_ID"
  }'
```
Expected response (with grammar correction):
```json
{
  "reply": "That sounds great! What did you do at school?",
  "followUp": "Did you have any interesting classes?",
  "correction": {
    "original": "I go to school yesterday",
    "corrected": "I went to school yesterday",
    "explanation": "Use past tense 'went' for actions that happened in the past."
  },
  "session_id": "..."
}
```

#### Get Conversation Feedback
```bash
curl -X POST http://localhost:8000/api/conversation/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "YOUR_SESSION_ID"
  }'
```

### 4. Vocabulary Lookup Testing

```bash
curl -X POST http://localhost:8000/api/vocabulary/lookup \
  -H "Content-Type: application/json" \
  -d '{"word": "serendipity"}'
```
Expected response includes:
- Word definition and part of speech
- Pronunciation (IPA)
- Word structure (prefix, root, suffix)
- Etymology
- Multiple meanings with examples
- Collocations and synonyms
- Learning tips and memory phrases
- Common mistakes

### 5. Rephrase Analysis Testing

```bash
curl -X POST http://localhost:8000/api/rephrase/analyze \
  -H "Content-Type: application/json" \
  -d '{"sentence": "Me and him goes to the store yesterday."}'
```
Expected response includes:
- Original sentence
- Grammar issues with explanations
- Multiple rephrased options (formal, casual, concise)
- Key takeaways
- Best recommendation

### 6. Progress Tracking Testing

#### Get Learning Stats (Authenticated)
```bash
curl http://localhost:8000/api/progress/stats \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Get Streak Data
```bash
curl http://localhost:8000/api/progress/streak \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Record Activity
```bash
curl -X POST http://localhost:8000/api/progress/activity \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "xp": 50,
    "wordsLearned": 5,
    "timeSpentMinutes": 15
  }'
```

#### Get Achievements
```bash
curl http://localhost:8000/api/progress/achievements \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## API Testing with cURL

### Complete Test Script

Save this as `test_api.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:8000"
EMAIL="testuser_$(date +%s)@example.com"
PASSWORD="TestPassword123!"

echo "=== Testing English Learning API ==="
echo ""

# Health Check
echo "1. Health Check"
curl -s "$BASE_URL/health" | jq .
echo ""

# Register
echo "2. Register User"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\", \"display_name\": \"Test User\"}")
echo $REGISTER_RESPONSE | jq .
ACCESS_TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.access_token')
echo ""

# Get Profile
echo "3. Get User Profile"
curl -s "$BASE_URL/api/users/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq .
echo ""

# Start Conversation
echo "4. Start Conversation"
CONV_RESPONSE=$(curl -s -X POST "$BASE_URL/api/conversation/start" \
  -H "Content-Type: application/json")
echo $CONV_RESPONSE | jq .
SESSION_ID=$(echo $CONV_RESPONSE | jq -r '.session_id')
echo ""

# Send Message
echo "5. Send Message"
curl -s -X POST "$BASE_URL/api/conversation/message" \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"Hello, I want to practice English.\", \"session_id\": \"$SESSION_ID\"}" | jq .
echo ""

# Vocabulary Lookup
echo "6. Vocabulary Lookup"
curl -s -X POST "$BASE_URL/api/vocabulary/lookup" \
  -H "Content-Type: application/json" \
  -d '{"word": "eloquent"}' | jq .
echo ""

# Rephrase Analysis
echo "7. Rephrase Analysis"
curl -s -X POST "$BASE_URL/api/rephrase/analyze" \
  -H "Content-Type: application/json" \
  -d '{"sentence": "Me want to learn English good."}' | jq .
echo ""

# Get Stats
echo "8. Get Learning Stats"
curl -s "$BASE_URL/api/progress/stats" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq .
echo ""

# Record Activity
echo "9. Record Activity"
curl -s -X POST "$BASE_URL/api/progress/activity" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"xp": 100, "wordsLearned": 10, "timeSpentMinutes": 30}' | jq .
echo ""

# Get Achievements
echo "10. Get Achievements"
curl -s "$BASE_URL/api/progress/achievements" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq .
echo ""

echo "=== All Tests Complete ==="
```

Run with:
```bash
chmod +x test_api.sh
./test_api.sh
```

## Automated Testing

### Backend Unit Tests

```bash
cd backend
pytest -v
```

### Running Specific Test Files
```bash
# Test authentication
pytest tests/test_auth.py -v

# Test conversation
pytest tests/test_conversation.py -v

# Test with coverage
pytest --cov=app --cov-report=html
```

### Property-Based Tests

The project uses Hypothesis for property-based testing:

```bash
# Run all property tests
pytest tests/ -v -k "property"

# Run with more examples
pytest tests/ -v --hypothesis-seed=0
```

## End-to-End Testing Workflow

### Complete User Journey Test

1. **Start Services**
   ```bash
   # Terminal 1: Backend
   cd backend && uvicorn app.main:app --reload
   
   # Terminal 2: Frontend
   npm run dev
   ```

2. **Test User Registration**
   - Open http://localhost:5173
   - Navigate to registration page
   - Create a new account
   - Verify redirect to dashboard

3. **Test Conversation Practice**
   - Navigate to Conversation page
   - Start a new conversation
   - Send messages with intentional grammar mistakes
   - Verify corrections are displayed
   - Request feedback at the end

4. **Test Vocabulary Lookup**
   - Navigate to Word List page
   - Search for a word
   - Verify comprehensive word information is displayed
   - Check pronunciation, etymology, synonyms

5. **Test Rephrase Analyzer**
   - Navigate to Rephrase Analyzer page
   - Enter a sentence with grammar issues
   - Verify issues are identified
   - Check rephrasing suggestions

6. **Test Progress Tracking**
   - Navigate to Dashboard
   - Verify streak display
   - Check XP and statistics
   - View achievements

7. **Test Profile Management**
   - Navigate to Profile page
   - Update display name
   - Change learning level
   - Verify changes persist

## Troubleshooting

### Common Issues

#### 1. LLM Service Errors (503)
**Symptom**: API returns "AI service temporarily unavailable"

**Solutions**:
- Verify API key is set correctly in `.env`
- Check API key has sufficient quota
- Try switching LLM provider (gemini ↔ mistral)

#### 2. Authentication Errors (401)
**Symptom**: "Token has expired" or "Invalid token"

**Solutions**:
- Clear browser localStorage
- Re-login to get new tokens
- Check JWT_SECRET_KEY is consistent

#### 3. CORS Errors
**Symptom**: Browser console shows CORS errors

**Solutions**:
- Verify CORS_ORIGINS in backend `.env` includes frontend URL
- Restart backend server after changing CORS settings

#### 4. Database Errors
**Symptom**: SQLAlchemy errors or missing tables

**Solutions**:
- Delete `app.db` and restart server (tables auto-create)
- Check DATABASE_URL format

#### 5. Frontend API Connection Issues
**Symptom**: Network errors in browser console

**Solutions**:
- Verify VITE_API_BASE_URL is set correctly
- Check backend is running on expected port
- Verify no firewall blocking connections

### Debug Mode

Enable debug logging:

```env
# backend/.env
DEBUG=true
```

View detailed logs:
```bash
uvicorn app.main:app --reload --log-level debug
```

### Testing LLM Responses

To test LLM integration independently:

```python
# test_llm.py
import asyncio
from app.llm.factory import LLMFactory

async def test_llm():
    llm = LLMFactory.create()
    response = await llm.ainvoke("Say hello in one word")
    print(response.content)

asyncio.run(test_llm())
```

Run with:
```bash
cd backend
python test_llm.py
```

## Performance Testing

### Load Testing with wrk

```bash
# Install wrk
brew install wrk  # macOS

# Test health endpoint
wrk -t4 -c100 -d30s http://localhost:8000/health

# Test with authentication (create lua script)
wrk -t4 -c100 -d30s -s auth_test.lua http://localhost:8000/api/users/me
```

### Response Time Benchmarks

Expected response times:
- Health check: < 10ms
- Authentication: < 100ms
- User profile: < 50ms
- Conversation message: < 3s (LLM dependent)
- Vocabulary lookup: < 5s (LLM dependent)
- Rephrase analysis: < 5s (LLM dependent)

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
      - name: Run tests
        run: |
          cd backend
          pytest -v
        env:
          SECRET_KEY: test-secret-key
          LLM_PROVIDER: gemini
          GOOGLE_API_KEY: ${{ secrets.GOOGLE_API_KEY }}
```
