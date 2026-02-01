import asyncio
import sys
import argparse

# Add parent directory to path to allow importing app modules
sys.path.append(".")

from app.database import async_session_maker
from app.models.user import User
from app.api.deps import get_db
from sqlalchemy import select

async def create_admin(email: str):
    async with async_session_maker() as session:
        result = await session.execute(select(User).where(User.email == email))
        user = result.scalars().first()
        
        if not user:
            print(f"Error: User with email {email} not found.")
            return False
            
        print(f"Found user: {user.email} (current role: {getattr(user, 'role', 'N/A')})")
        
        user.role = "admin"
        await session.commit()
        
        print(f"Successfully promoted {email} to admin!")
        return True

async def main():
    parser = argparse.ArgumentParser(description="Promote a user to admin")
    parser.add_argument("--email", required=True, help="Email of the user to promote")
    args = parser.parse_args()
    
    await create_admin(args.email)

if __name__ == "__main__":
    asyncio.run(main())
