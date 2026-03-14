import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check_jobs():
    client = AsyncIOMotorClient("mongodb://localhost:27017/")
    db = client["resume_screening"]
    cursor = db.jobs.find({})
    jobs = await cursor.to_list(length=100)
    print(f"Total Jobs: {len(jobs)}")
    for j in jobs:
        print(f" - {j.get('job_title', 'Untitled')} (ID: {j.get('_id')})")
    
    cursor_jds = db.jds.find({})
    jds = await cursor_jds.to_list(length=100)
    print(f"\nTotal JDs (old schema?): {len(jds)}")
    for j in jds:
        print(f" - {j.get('structured_data', {}).get('job_title', 'Untitled')} (ID: {j.get('_id')})")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(check_jobs())
