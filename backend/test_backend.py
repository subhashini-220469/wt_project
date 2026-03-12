import os
import sys
import asyncio
from dotenv import load_dotenv

def check_env():
    print("🔍 Checking Environment Variables...")
    load_dotenv()
    mongo_url = os.getenv("MONGO_URL")
    api_key = os.getenv("OPENROUTER_API_KEY")
    
    if not mongo_url:
        print("❌ MONGO_URL not found in .env")
    else:
        print(f"✅ MONGO_URL found: {mongo_url[:15]}...")
        
    if not api_key or api_key == "your_openrouter_api_key_here":
        print("❌ OPENROUTER_API_KEY is missing or using placeholder!")
    else:
        print("✅ OPENROUTER_API_KEY found.")

async def check_mongo():
    print("\n🔍 Checking MongoDB Connection...")
    try:
        from motor.motor_asyncio import AsyncIOMotorClient
        mongo_url = os.getenv("MONGO_URL", "mongodb://localhost:27017")
        client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=2000)
        await client.admin.command('ping')
        print("✅ MongoDB is reachable!")
    except Exception as e:
        print(f"❌ MongoDB Connection Failed: {e}")

def check_scoring_model():
    print("\n🔍 Checking Sentence-Transformers Model (MiniLM)...")
    print("   (This might take a minute the first time as it downloads the model)")
    try:
        from sentence_transformers import SentenceTransformer
        # Use a very small model just to test the library works
        model = SentenceTransformer('all-MiniLM-L6-v2')
        print("✅ Sentence-Transformers and Model loaded successfully!")
    except Exception as e:
        print(f"❌ Scoring Model Error: {e}")

def check_imports():
    print("\n🔍 Checking Internal Module Imports...")
    try:
        # Add current dir to path for imports
        sys.path.append(os.getcwd())
        import models
        import scoring
        import extraction
        import database
        print("✅ All internal modules imported successfully!")
    except Exception as e:
        print(f"❌ Import Error: {e}")

async def main():
    print("========================================")
    print("🚀 BACKEND SANITY CHECK")
    print("========================================\n")
    
    check_env()
    check_imports()
    await check_mongo()
    check_scoring_model()
    
    print("\n========================================")
    print("✨ Sanity Check Complete!")
    print("========================================")

if __name__ == "__main__":
    asyncio.run(main())
