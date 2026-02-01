
import asyncio
import sys

# Add parent directory to path to allow importing app modules
sys.path.append(".")

from app.database import async_session_maker, engine
from app.models.user import User
from sqlalchemy import select

async def list_users():
    try:
        async with async_session_maker() as session:
            result = await session.execute(select(User))
            users = result.scalars().all()
            
            print(f"{'ID':<5} {'Email':<30} {'Display Name':<25} {'Role':<10}")
            print("-" * 75)
            for user in users:
                role = getattr(user, 'role', 'N/A')
                print(f"{user.id:<5} {user.email:<30} {user.display_name:<25} {role:<10}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(list_users())
