#!/usr/bin/env python3
"""
Integration test script for the English Learning API.
Tests the complete user flow: Register → Login → Use Features → Check Progress

Usage:
    python test_integration.py [--base-url URL]

Requirements:
    - Backend server must be running
    - httpx package installed
"""

import argparse
import asyncio
import sys
from datetime import datetime

try:
    import httpx
except ImportError:
    print("Error: httpx package required. Install with: pip install httpx")
    sys.exit(1)


class IntegrationTester:
    """Integration test runner for the English Learning API."""

    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.access_token = None
        self.session_id = None
        self.test_email = f"test_{datetime.now().strftime('%Y%m%d%H%M%S')}@example.com"
        self.test_password = "TestPassword123!"
        self.results = []

    def log(self, message: str, success: bool = True):
        """Log test result."""
        status = "✅" if success else "❌"
        print(f"{status} {message}")
        self.results.append((message, success))

    async def run_all_tests(self):
        """Run all integration tests."""
        print("\n" + "=" * 60)
        print("English Learning API - Integration Tests")
        print("=" * 60)
        print(f"Base URL: {self.base_url}")
        print(f"Test Email: {self.test_email}")
        print("=" * 60 + "\n")

        async with httpx.AsyncClient(base_url=self.base_url, timeout=30.0) as client:
            # Health Check
            await self.test_health_check(client)

            # Authentication Flow
            await self.test_register(client)
            await self.test_login(client)
            await self.test_get_profile(client)
            await self.test_update_profile(client)

            # Conversation Flow
            await self.test_start_conversation(client)
            await self.test_send_message(client)
            await self.test_get_feedback(client)

            # Vocabulary
            await self.test_vocabulary_lookup(client)

            # Rephrase
            await self.test_rephrase_analyze(client)

            # Progress
            await self.test_get_stats(client)
            await self.test_get_streak(client)
            await self.test_record_activity(client)
            await self.test_get_achievements(client)

        # Summary
        self.print_summary()

    async def test_health_check(self, client: httpx.AsyncClient):
        """Test health check endpoint."""
        try:
            response = await client.get("/health")
            if response.status_code == 200 and response.json().get("status") == "healthy":
                self.log("Health check passed")
            else:
                self.log(f"Health check failed: {response.text}", False)
        except Exception as e:
            self.log(f"Health check error: {e}", False)

    async def test_register(self, client: httpx.AsyncClient):
        """Test user registration."""
        try:
            response = await client.post(
                "/api/auth/register",
                json={
                    "email": self.test_email,
                    "password": self.test_password,
                    "display_name": "Integration Test User",
                },
            )
            if response.status_code == 201:
                data = response.json()
                self.access_token = data.get("access_token")
                self.log("User registration passed")
            else:
                self.log(f"User registration failed: {response.text}", False)
        except Exception as e:
            self.log(f"User registration error: {e}", False)

    async def test_login(self, client: httpx.AsyncClient):
        """Test user login."""
        try:
            response = await client.post(
                "/api/auth/login",
                json={
                    "email": self.test_email,
                    "password": self.test_password,
                },
            )
            if response.status_code == 200:
                data = response.json()
                self.access_token = data.get("access_token")
                self.log("User login passed")
            else:
                self.log(f"User login failed: {response.text}", False)
        except Exception as e:
            self.log(f"User login error: {e}", False)

    async def test_get_profile(self, client: httpx.AsyncClient):
        """Test get user profile."""
        if not self.access_token:
            self.log("Get profile skipped (no token)", False)
            return

        try:
            response = await client.get(
                "/api/users/me",
                headers={"Authorization": f"Bearer {self.access_token}"},
            )
            if response.status_code == 200:
                data = response.json()
                if data.get("email") == self.test_email:
                    self.log("Get user profile passed")
                else:
                    self.log(f"Get profile: email mismatch", False)
            else:
                self.log(f"Get profile failed: {response.text}", False)
        except Exception as e:
            self.log(f"Get profile error: {e}", False)

    async def test_update_profile(self, client: httpx.AsyncClient):
        """Test update user profile."""
        if not self.access_token:
            self.log("Update profile skipped (no token)", False)
            return

        try:
            response = await client.put(
                "/api/users/me",
                headers={"Authorization": f"Bearer {self.access_token}"},
                json={
                    "display_name": "Updated Test User",
                    "learning_level": "advanced",
                },
            )
            if response.status_code == 200:
                data = response.json()
                if data.get("displayName") == "Updated Test User":
                    self.log("Update user profile passed")
                else:
                    self.log(f"Update profile: name not updated", False)
            else:
                self.log(f"Update profile failed: {response.text}", False)
        except Exception as e:
            self.log(f"Update profile error: {e}", False)

    async def test_start_conversation(self, client: httpx.AsyncClient):
        """Test start conversation."""
        try:
            response = await client.post("/api/conversation/start", json={})
            if response.status_code == 200:
                data = response.json()
                self.session_id = data.get("session_id")
                if self.session_id and data.get("opening_message"):
                    self.log("Start conversation passed")
                else:
                    self.log("Start conversation: missing data", False)
            else:
                self.log(f"Start conversation failed: {response.text}", False)
        except Exception as e:
            self.log(f"Start conversation error: {e}", False)

    async def test_send_message(self, client: httpx.AsyncClient):
        """Test send conversation message."""
        if not self.session_id:
            self.log("Send message skipped (no session)", False)
            return

        try:
            response = await client.post(
                "/api/conversation/message",
                json={
                    "message": "I go to school yesterday.",
                    "session_id": self.session_id,
                },
            )
            if response.status_code == 200:
                data = response.json()
                if data.get("reply"):
                    self.log("Send message passed")
                    # Check for grammar correction
                    if data.get("correction"):
                        self.log("Grammar correction detected ✓")
                else:
                    self.log("Send message: no reply", False)
            else:
                self.log(f"Send message failed: {response.text}", False)
        except Exception as e:
            self.log(f"Send message error: {e}", False)

    async def test_get_feedback(self, client: httpx.AsyncClient):
        """Test get conversation feedback."""
        if not self.session_id:
            self.log("Get feedback skipped (no session)", False)
            return

        try:
            response = await client.post(
                "/api/conversation/feedback",
                json={"session_id": self.session_id},
            )
            if response.status_code == 200:
                data = response.json()
                if data.get("feedback"):
                    self.log("Get conversation feedback passed")
                else:
                    self.log("Get feedback: no feedback content", False)
            else:
                self.log(f"Get feedback failed: {response.text}", False)
        except Exception as e:
            self.log(f"Get feedback error: {e}", False)

    async def test_vocabulary_lookup(self, client: httpx.AsyncClient):
        """Test vocabulary lookup."""
        try:
            response = await client.post(
                "/api/vocabulary/lookup",
                json={"word": "eloquent"},
            )
            if response.status_code == 200:
                data = response.json()
                required_fields = ["word", "definition", "partOfSpeech", "pronunciation"]
                if all(data.get(f) for f in required_fields):
                    self.log("Vocabulary lookup passed")
                else:
                    self.log("Vocabulary lookup: missing fields", False)
            else:
                self.log(f"Vocabulary lookup failed: {response.text}", False)
        except Exception as e:
            self.log(f"Vocabulary lookup error: {e}", False)

    async def test_rephrase_analyze(self, client: httpx.AsyncClient):
        """Test rephrase analysis."""
        try:
            response = await client.post(
                "/api/rephrase/analyze",
                json={"sentence": "Me want to learn English good."},
            )
            if response.status_code == 200:
                data = response.json()
                if data.get("rephrasedOptions") and data.get("issues"):
                    self.log("Rephrase analysis passed")
                else:
                    self.log("Rephrase analysis: missing data", False)
            else:
                self.log(f"Rephrase analysis failed: {response.text}", False)
        except Exception as e:
            self.log(f"Rephrase analysis error: {e}", False)

    async def test_get_stats(self, client: httpx.AsyncClient):
        """Test get learning stats."""
        if not self.access_token:
            self.log("Get stats skipped (no token)", False)
            return

        try:
            response = await client.get(
                "/api/progress/stats",
                headers={"Authorization": f"Bearer {self.access_token}"},
            )
            if response.status_code == 200:
                data = response.json()
                if "totalXp" in data and "currentStreak" in data:
                    self.log("Get learning stats passed")
                else:
                    self.log("Get stats: missing fields", False)
            else:
                self.log(f"Get stats failed: {response.text}", False)
        except Exception as e:
            self.log(f"Get stats error: {e}", False)

    async def test_get_streak(self, client: httpx.AsyncClient):
        """Test get streak data."""
        if not self.access_token:
            self.log("Get streak skipped (no token)", False)
            return

        try:
            response = await client.get(
                "/api/progress/streak",
                headers={"Authorization": f"Bearer {self.access_token}"},
            )
            if response.status_code == 200:
                data = response.json()
                if "currentStreak" in data and "history" in data:
                    if len(data["history"]) == 28:
                        self.log("Get streak data passed (28-day history)")
                    else:
                        self.log(f"Get streak: history has {len(data['history'])} days, expected 28", False)
                else:
                    self.log("Get streak: missing fields", False)
            else:
                self.log(f"Get streak failed: {response.text}", False)
        except Exception as e:
            self.log(f"Get streak error: {e}", False)

    async def test_record_activity(self, client: httpx.AsyncClient):
        """Test record learning activity."""
        if not self.access_token:
            self.log("Record activity skipped (no token)", False)
            return

        try:
            response = await client.post(
                "/api/progress/activity",
                headers={"Authorization": f"Bearer {self.access_token}"},
                json={
                    "xp": 50,
                    "wordsLearned": 5,
                    "timeSpentMinutes": 15,
                },
            )
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "xpEarned" in data:
                    self.log("Record activity passed")
                else:
                    self.log("Record activity: unexpected response", False)
            else:
                self.log(f"Record activity failed: {response.text}", False)
        except Exception as e:
            self.log(f"Record activity error: {e}", False)

    async def test_get_achievements(self, client: httpx.AsyncClient):
        """Test get achievements."""
        if not self.access_token:
            self.log("Get achievements skipped (no token)", False)
            return

        try:
            response = await client.get(
                "/api/progress/achievements",
                headers={"Authorization": f"Bearer {self.access_token}"},
            )
            if response.status_code == 200:
                data = response.json()
                if "achievements" in data:
                    self.log(f"Get achievements passed ({len(data['achievements'])} achievements)")
                else:
                    self.log("Get achievements: missing data", False)
            else:
                self.log(f"Get achievements failed: {response.text}", False)
        except Exception as e:
            self.log(f"Get achievements error: {e}", False)

    def print_summary(self):
        """Print test summary."""
        print("\n" + "=" * 60)
        print("Test Summary")
        print("=" * 60)

        passed = sum(1 for _, success in self.results if success)
        failed = sum(1 for _, success in self.results if not success)
        total = len(self.results)

        print(f"Total: {total} | Passed: {passed} | Failed: {failed}")
        print(f"Success Rate: {passed/total*100:.1f}%")

        if failed > 0:
            print("\nFailed Tests:")
            for message, success in self.results:
                if not success:
                    print(f"  - {message}")

        print("=" * 60 + "\n")

        return failed == 0


async def main():
    parser = argparse.ArgumentParser(description="Integration tests for English Learning API")
    parser.add_argument(
        "--base-url",
        default="http://localhost:8000",
        help="Base URL of the API server",
    )
    args = parser.parse_args()

    tester = IntegrationTester(base_url=args.base_url)
    success = await tester.run_all_tests()

    sys.exit(0 if success else 1)


if __name__ == "__main__":
    asyncio.run(main())
