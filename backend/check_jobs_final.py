import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check_jobs():
    client = AsyncIOMotorClient("mongodb://localhost:27017/")
    db = client["resume_screening"]
    cursor = db.jobs.find({})
    jobs = await cursor.to_list(length=100)
    for j in jobs:
        print(f"TITLE: {j.get('job_title')} | ID: {j['_id']}")
    client.close()

if __name__ == "__main__":
    asyncio.run(check_jobs())
