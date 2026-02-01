import asyncio
import sys
import argparse

# Add parent directory to path to allow importing app modules
sys.path.append(".")

from sqlalchemy import select
from app.database import async_session_maker, engine
from app.models.user import User
from app.services.auth_service import AuthService

async def change_password(email: str, new_password: str):
    try:
        async with async_session_maker() as session:
            # Check if user exists
            result = await session.execute(select(User).where(User.email == email))
            user = result.scalars().first()
            
            if not user:
                print(f"Error: User with email {email} not found.")
                return False
                
            print(f"Changing password for user: {email}")
            
            # Hash new password
            hashed_password = AuthService.hash_password(new_password)
            
            # Update user
            user.hashed_password = hashed_password
            
            session.add(user)
            await session.commit()
            
            print(f"Successfully changed password for user: {email}!")
            return True
    finally:
        await engine.dispose()

async def main():
    parser = argparse.ArgumentParser(description="Change a user's password")
    parser.add_argument("--email", required=True, help="Email of the user")
    parser.add_argument("--password", required=True, help="New password for the user")
    
    args = parser.parse_args()
    
    await change_password(args.email, args.password)

if __name__ == "__main__":
    asyncio.run(main())
