import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def t():
    c = AsyncIOMotorClient('mongodb://localhost:27017')
    db = c.resume_screening
    records = await db.resumes.find({}, {'candidate_name':1,'resume_filename':1,'score':1}).to_list(10)
    for r in records:
        score = r.get('score', {})
        total = score.get('total_score', 0) if isinstance(score, dict) else 0
        fname = r.get('resume_filename', 'None')
        name  = r.get('candidate_name', '?')
        print(f"name={name}  score={total:.1f}  file={fname}")

asyncio.run(t())
