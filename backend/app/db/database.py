import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DATABASE_NAME = "resume_screening"

class Database:
    client: AsyncIOMotorClient = None
    db = None

    @classmethod
    async def connect_db(cls):
        cls.client = AsyncIOMotorClient(MONGO_URL)
        cls.db = cls.client[DATABASE_NAME]
        print(f"Connected to MongoDB at {MONGO_URL}")
        
        # Diagnostics
        try:
            jd_count = await cls.db.jds.count_documents({})
            res_count = await cls.db.resumes.count_documents({})
            print(f"📊 Current DB Stats: {jd_count} Job Descriptions, {res_count} Resumes stored.")
        except Exception as e:
            print(f"⚠️ Could not fetch stats: {e}")

    @classmethod
    async def close_db(cls):
        cls.client.close()

db = Database
