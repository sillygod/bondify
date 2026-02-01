
import asyncio
import json
import sys
from sqlalchemy import select
from app.database import async_session_maker, engine
from app.models.vocabulary_cache import VocabularyCache
from app.models.game_question import GameQuestion

async def dump_data():
    try:
        async with async_session_maker() as session:
            # Dump Vocabulary
            result = await session.execute(select(VocabularyCache))
            vocab_items = result.scalars().all()
            vocab_data = []
            for item in vocab_items:
                vocab_data.append({
                    "word": item.word,
                    "definition_json": item.definition_json,
                    "lookup_count": item.lookup_count
                })
            
            with open("data/seed_vocabulary.json", "w") as f:
                json.dump(vocab_data, f, indent=2)
            print(f"Dumped {len(vocab_data)} vocabulary items.")

            # Dump Questions
            result = await session.execute(select(GameQuestion))
            question_items = result.scalars().all()
            question_data = []
            for item in question_items:
                question_data.append({
                    "game_type": item.game_type,
                    "question_json": item.question_json,
                    "difficulty": item.difficulty,
                    "is_reviewed": item.is_reviewed,
                    "usage_count": item.usage_count
                })
            
            with open("data/seed_questions.json", "w") as f:
                json.dump(question_data, f, indent=2)
            print(f"Dumped {len(question_data)} game questions.")
            
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(dump_data())
