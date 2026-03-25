import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

async def main():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["resume_screening"]
    
    print("--- JD_ID TYPE AUDIT ---")
    resumes = await db.resumes.find().to_list(length=100)
    for r in resumes:
        val = r.get('jd_id')
        print(f"Resume {r['_id']} | Candidate: {r.get('candidate_name')} | JD_ID: {val} | Type: {type(val)}")

if __name__ == "__main__":
    asyncio.run(main())
