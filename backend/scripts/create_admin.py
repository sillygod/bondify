import asyncio
import sys
import argparse
from typing import Optional

# Add parent directory to path to allow importing app modules
sys.path.append(".")

from sqlalchemy import select
from app.database import async_session_maker, engine
from app.models.user import User
from app.services.auth_service import AuthService

async def create_admin(email: str, password: str, display_name: Optional[str] = None):
    try:
        async with async_session_maker() as session:
            # Check if user already exists
            result = await session.execute(select(User).where(User.email == email))
            existing_user = result.scalars().first()
            
            if existing_user:
                print(f"Error: User with email {email} already exists.")
                print("To promote an existing user to admin, use: python scripts/promote_to_admin.py --email <email>")
                return False
                
            print(f"Creating new admin user: {email}")
            
            # Create new user
            hashed_password = AuthService.hash_password(password)
            new_admin = User(
                email=email,
                hashed_password=hashed_password,
                display_name=display_name or email.split("@")[0],
                role="admin",
                learning_level="intermediate" # Default
            )
            
            session.add(new_admin)
            await session.commit()
            
            print(f"Successfully created admin user: {email}!")
            return True
    finally:
        await engine.dispose()

async def main():
    parser = argparse.ArgumentParser(description="Create a new admin user")
    parser.add_argument("--email", required=True, help="Email of the new admin")
    parser.add_argument("--password", required=True, help="Password for the new admin")
    parser.add_argument("--name", help="Display name for the new admin (optional)")
    
    args = parser.parse_args()
    
    await create_admin(args.email, args.password, args.name)

if __name__ == "__main__":
    asyncio.run(main())
