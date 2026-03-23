import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

async def main():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["resume_screening"]
    
    # 2. List all resumes
    print("\n--- RESUMES ---")
    resumes = await db.resumes.find().to_list(length=100)
    for r in resumes:
        print(f"ID: {r['_id']}, JD_ID: {r.get('jd_id')}, JD_ID_Type: {type(r.get('jd_id'))}, Candidate: {r.get('candidate_name')}")

if __name__ == "__main__":
    asyncio.run(main())
