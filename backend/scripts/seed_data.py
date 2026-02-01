"""
Data Seeder for Bondify

Usage:
    python scripts/seed_data.py
    
    # Or via module if run from backend root
    python -m scripts.seed_data
"""

import asyncio
import json
import logging
import sys
from pathlib import Path
from typing import List, Dict, Any

# Ensure we can import from app
sys.path.append(".")

from sqlalchemy import select
from app.database import async_session_maker, engine
from app.models.user import User
from app.models.vocabulary_cache import VocabularyCache
from app.models.game_question import GameQuestion
from app.services.auth_service import AuthService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Constants
SEEDS_DIR = Path(__file__).parent.parent / "seeds"
DEFAULT_ADMIN_EMAIL = "admin@bondify.app"
DEFAULT_ADMIN_PASSWORD = "demoadmin"
DEFAULT_USER_EMAIL = "user@bondify.app"
DEFAULT_USER_PASSWORD = "demouser"


async def seed_users(session) -> None:
    """Seed initial users."""
    logger.info("Seeding users...")
    
    # Check Admin
    result = await session.execute(select(User).where(User.email == DEFAULT_ADMIN_EMAIL))
    admin_user = result.scalars().first()
    
    if not admin_user:
        logger.info(f"Creating admin user: {DEFAULT_ADMIN_EMAIL}")
        new_admin = User(
            email=DEFAULT_ADMIN_EMAIL,
            hashed_password=AuthService.hash_password(DEFAULT_ADMIN_PASSWORD),
            display_name="Admin",
            role="admin",
            learning_level="advanced"
        )
        session.add(new_admin)
    else:
        logger.info(f"Admin user {DEFAULT_ADMIN_EMAIL} already exists.")

    # Check Test User
    result = await session.execute(select(User).where(User.email == DEFAULT_USER_EMAIL))
    test_user = result.scalars().first()
    
    if not test_user:
        logger.info(f"Creating test user: {DEFAULT_USER_EMAIL}")
        new_user = User(
            email=DEFAULT_USER_EMAIL,
            hashed_password=AuthService.hash_password(DEFAULT_USER_PASSWORD),
            display_name="Player One",
            role="user",
            learning_level="intermediate"
        )
        session.add(new_user)
    else:
        logger.info(f"Test user {DEFAULT_USER_EMAIL} already exists.")


async def seed_vocabulary(session) -> None:
    """Seed vocabulary cache from JSON."""
    json_path = SEEDS_DIR / "seed_vocabulary.json"
    if not json_path.exists():
        logger.warning(f"Vocabulary seed file not found at {json_path}")
        return

    logger.info(f"Seeding vocabulary from {json_path}...")
    try:
        data = json.loads(json_path.read_text())
        
        # Get existing words to avoid duplicates
        existing_words_result = await session.execute(select(VocabularyCache.word))
        existing_words = set(existing_words_result.scalars().all())
        
        added_count = 0
        for item in data:
            word = item["word"]
            if word not in existing_words:
                db_item = VocabularyCache(
                    word=word,
                    definition_json=item["definition_json"],
                    lookup_count=item.get("lookup_count", 1)
                )
                session.add(db_item)
                existing_words.add(word) # Prevent dupes within the same batch
                added_count += 1
        
        logger.info(f"Added {added_count} new vocabulary items.")
            
    except Exception as e:
        logger.error(f"Failed to seed vocabulary: {e}")


async def seed_questions(session) -> None:
    """Seed game questions from JSON."""
    json_path = SEEDS_DIR / "seed_questions.json"
    if not json_path.exists():
        logger.warning(f"Questions seed file not found at {json_path}")
        return

    logger.info(f"Seeding questions from {json_path}...")
    try:
        data = json.loads(json_path.read_text())
        
        # Simple check for duplicates by question_json usually isn't efficient,
        # but for seeding we might just add them if the table is empty or trust duplication isn't fatal.
        # Alternatively, check by game_type count or just skip if we want to be safe.
        # For now, let's just add them if needed. 
        # A better approach is to check if *any* questions exist for that type, or just add blindly?
        # Let's check if the specific question_json exists to be safe.
        
        # Note: Text comparison on large fields is slow. 
        # Making a hash would be better, but for a seeder script it is likely fine.
        
        count = 0
        for item in data:
            # Check if identical question content exists
            # In a real scenario we might want a checksum, but for now we query. 
            # Given potentially large number of questions, batching or skipping queries might be needed.
            # Optimization: If table is empty, just bulk insert.
            
            # For robustness, let's just try to insert and ignore or we can check. 
            # Let's skip check for now to keep it simple, or maybe just check count?
            # User wants "initial data".
            
            # Let's check for existence of exact match
            stmt = select(GameQuestion).where(
                GameQuestion.question_json == item["question_json"],
                GameQuestion.game_type == item["game_type"]
            )
            result = await session.execute(stmt)
            if not result.scalars().first():
                 new_q = GameQuestion(
                     game_type=item["game_type"],
                     question_json=item["question_json"],
                     difficulty=item.get("difficulty", "medium"),
                     is_reviewed=item.get("is_reviewed", False),
                     usage_count=item.get("usage_count", 0)
                 )
                 session.add(new_q)
                 count += 1
        
        logger.info(f"Added {count} new game questions.")

    except Exception as e:
        logger.error(f"Failed to seed questions: {e}")


async def main():
    try:
        async with async_session_maker() as session:
            await seed_users(session)
            await seed_vocabulary(session)
            await seed_questions(session)
            await session.commit()
            logger.info("Database seeding completed successfully!")
    except Exception as e:
        logger.error(f"Seeding failed: {e}")
        # Don't silence the error, let it exit 1 so CI/CD knows
        sys.exit(1)
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
