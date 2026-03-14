import asyncio
import json
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

async def inspect_job():
    client = AsyncIOMotorClient("mongodb://localhost:27017/")
    db = client["resume_screening"]
    job = await db.jobs.find_one({"job_title": "Senior Python Developer"})
    if job:
        # Convert ObjectId and other non-serializable fields
        job["_id"] = str(job["_id"])
        print(json.dumps(job, indent=2))
    else:
        print("Job not found")
    client.close()

if __name__ == "__main__":
    asyncio.run(inspect_job())
