import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
import sys
import bcrypt
from datetime import datetime, timedelta

# Mock credentials
# PASSWORD for local users will be "password123"
SALT = bcrypt.gensalt()
HASHED_PASSWORD = bcrypt.hashpw("password123".encode('utf-8'), SALT).decode('utf-8')

MONGO_URL = "mongodb://localhost:27017/"
DB_NAME = "resume_screening"

async def seed_users():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("Seeding Mock Users...")
    
    # 1. Clear existing users (Careful: this deletes all users)
    await db.users.delete_many({})
    
    # 2. Mock Users
    mock_users = [
        {
            "username": "Admin HR",
            "email": "hr@example.com",
            "password": HASHED_PASSWORD,
            "role": "hr",
            "provider": "local",
            "officeName": "Main HQ",
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "username": "John Candidate",
            "email": "john.doe.mock@gmail.com",
            "password": HASHED_PASSWORD,
            "role": "user",
            "provider": "local",
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "username": "Navya Dev",
            "email": "n220623@rguktn.ac.in",
            "password": HASHED_PASSWORD,
            "role": "user",
            "provider": "local",
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
    ]
    
    result = await db.users.insert_many(mock_users)
    print(f"Successfully seeded {len(result.inserted_ids)} users.")
    print("Default Password for all: password123")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_users())
