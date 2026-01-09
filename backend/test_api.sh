#!/bin/bash
# Quick API test script for English Learning API
# Usage: ./test_api.sh [base_url]

BASE_URL="${1:-http://localhost:8000}"
EMAIL="testuser_$(date +%s)@example.com"
PASSWORD="TestPassword123!"

echo "=============================================="
echo "English Learning API - Quick Test"
echo "=============================================="
echo "Base URL: $BASE_URL"
echo "Test Email: $EMAIL"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

pass() {
    echo -e "${GREEN}✅ $1${NC}"
}

fail() {
    echo -e "${RED}❌ $1${NC}"
}

# 1. Health Check
echo "1. Testing Health Check..."
HEALTH=$(curl -s "$BASE_URL/health")
if echo "$HEALTH" | grep -q "healthy"; then
    pass "Health check passed"
else
    fail "Health check failed: $HEALTH"
fi
echo ""

# 2. Register User
echo "2. Testing User Registration..."
REGISTER=$(curl -s -X POST "$BASE_URL/api/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\", \"display_name\": \"Test User\"}")

if echo "$REGISTER" | grep -q "access_token"; then
    pass "User registration passed"
    ACCESS_TOKEN=$(echo "$REGISTER" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
else
    fail "User registration failed: $REGISTER"
    exit 1
fi
echo ""

# 3. Get User Profile
echo "3. Testing Get User Profile..."
PROFILE=$(curl -s "$BASE_URL/api/users/me" \
    -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$PROFILE" | grep -q "$EMAIL"; then
    pass "Get user profile passed"
else
    fail "Get user profile failed: $PROFILE"
fi
echo ""

# 4. Start Conversation
echo "4. Testing Start Conversation..."
CONV_START=$(curl -s -X POST "$BASE_URL/api/conversation/start" \
    -H "Content-Type: application/json" \
    -d "{}")

if echo "$CONV_START" | grep -q "session_id"; then
    pass "Start conversation passed"
    SESSION_ID=$(echo "$CONV_START" | grep -o '"session_id":"[^"]*"' | cut -d'"' -f4)
else
    fail "Start conversation failed: $CONV_START"
fi
echo ""

# 5. Send Message
echo "5. Testing Send Message..."
MESSAGE=$(curl -s -X POST "$BASE_URL/api/conversation/message" \
    -H "Content-Type: application/json" \
    -d "{\"message\": \"Hello, I want to practice English.\", \"session_id\": \"$SESSION_ID\"}")

if echo "$MESSAGE" | grep -q "reply"; then
    pass "Send message passed"
else
    fail "Send message failed: $MESSAGE"
fi
echo ""

# 6. Vocabulary Lookup
echo "6. Testing Vocabulary Lookup..."
VOCAB=$(curl -s -X POST "$BASE_URL/api/vocabulary/lookup" \
    -H "Content-Type: application/json" \
    -d '{"word": "eloquent"}')

if echo "$VOCAB" | grep -q "definition"; then
    pass "Vocabulary lookup passed"
else
    fail "Vocabulary lookup failed: $VOCAB"
fi
echo ""

# 7. Rephrase Analysis
echo "7. Testing Rephrase Analysis..."
REPHRASE=$(curl -s -X POST "$BASE_URL/api/rephrase/analyze" \
    -H "Content-Type: application/json" \
    -d '{"sentence": "Me want to learn English good."}')

if echo "$REPHRASE" | grep -q "rephrasedOptions"; then
    pass "Rephrase analysis passed"
else
    fail "Rephrase analysis failed: $REPHRASE"
fi
echo ""

# 8. Get Learning Stats
echo "8. Testing Get Learning Stats..."
STATS=$(curl -s "$BASE_URL/api/progress/stats" \
    -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$STATS" | grep -q "totalXp"; then
    pass "Get learning stats passed"
else
    fail "Get learning stats failed: $STATS"
fi
echo ""

# 9. Record Activity
echo "9. Testing Record Activity..."
ACTIVITY=$(curl -s -X POST "$BASE_URL/api/progress/activity" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"xp": 50, "wordsLearned": 5, "timeSpentMinutes": 15}')

if echo "$ACTIVITY" | grep -q "success"; then
    pass "Record activity passed"
else
    fail "Record activity failed: $ACTIVITY"
fi
echo ""

# 10. Get Achievements
echo "10. Testing Get Achievements..."
ACHIEVEMENTS=$(curl -s "$BASE_URL/api/progress/achievements" \
    -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$ACHIEVEMENTS" | grep -q "achievements"; then
    pass "Get achievements passed"
else
    fail "Get achievements failed: $ACHIEVEMENTS"
fi
echo ""

echo "=============================================="
echo "All tests completed!"
echo "=============================================="
