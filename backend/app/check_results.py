import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def main():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["resume_screening"]
    jd_id = "69c16b3b522f457ec839d4f2"
    res = await db.resumes.find({"jd_id": jd_id}).to_list(length=10)
    print(f"Results for '{jd_id}': {len(res)}")
    for r in res:
        print(f"Candidate: {r.get('candidate_name')}, JD_ID_Type: {type(r.get('jd_id'))}")

if __name__ == "__main__":
    asyncio.run(main())
