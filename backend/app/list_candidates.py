import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

async def main():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["resume_screening"]
    
    # 1. List all jobs
    print("--- JOBS ---")
    jobs = await db.jobs.find().to_list(length=100)
    for j in jobs:
        print(f"ID: {j['_id']}, Title: {j.get('job_title')}, Company: {j.get('company')}")
    
    # 2. List all resumes
    print("\n--- RESUMES ---")
    resumes = await db.resumes.find().to_list(length=100)
    for r in resumes:
        print(f"ID: {r['_id']}, JD_ID: {r.get('jd_id')}, Candidate: {r.get('candidate_name')}, Email: {r.get('candidate_email')}, Status: {r.get('status')}, Score: {r.get('score', {}).get('total_score')}")

if __name__ == "__main__":
    asyncio.run(main())
