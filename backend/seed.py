import asyncio
import motor.motor_asyncio
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# Match the app's database configuration
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DATABASE_NAME = "resume_screening" # Correct DB name from database.py

client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
db = client[DATABASE_NAME]

async def seed_data():
    print(f"🚀 Seeding test data into '{DATABASE_NAME}'...")
    
    # 1. Clear existing jobs/resumes for clean testing
    await db.jobs.delete_many({})
    await db.resumes.delete_many({})
    await db.jds.delete_many({}) # Clear legacy jds too
    
    # 2. Sample Jobs
    jobs = [
        {
            "job_title": "Senior Python Developer",
            "company": "TechStream AI",
            "workplace_type": "Remote",
            "location": "San Francisco, CA",
            "job_type": "Full-time",
            "description": "We are looking for a Senior Python Developer with 5+ years of experience in FastAPI and MongoDB.",
            "salary": {"range": "$140k - $180k", "pay_type": "Yearly"},
            "status": "open",
            "created_at": datetime.utcnow().isoformat(),
            "structured_jd": {
                "job_title": "Senior Python Developer",
                "required_skills": ["Python", "FastAPI", "MongoDB", "Microservices", "Docker"],
                "min_experience_years": 5.0,
                "role_description": "Building AI-driven recruitment platforms.",
                "education_requirements": "Bachelors"
            }
        },
        {
            "job_title": "Frontend React Engineer",
            "company": "Designify",
            "workplace_type": "Hybrid",
            "location": "New York, NY",
            "job_type": "Full-time",
            "description": "Expert in React, Framer Motion, and CSS.",
            "salary": {"range": "$120k - $150k", "pay_type": "Yearly"},
            "status": "open",
            "created_at": datetime.utcnow().isoformat(),
            "structured_jd": {
                "job_title": "Frontend React Engineer",
                "required_skills": ["React", "JavaScript", "CSS", "Framer Motion", "Vite"],
                "min_experience_years": 3.0,
                "role_description": "Crafting premium user experiences.",
                "education_requirements": "Bachelors"
            }
        }
    ]
    
    job_ids = []
    for job in jobs:
        # We insert into 'jobs' as used in endpoints.py create_job
        res = await db.jobs.insert_one(job)
        # Also insert into 'jds' for backward compatibility if needed
        await db.jds.insert_one(job)
        job_ids.append((str(res.inserted_id), job["job_title"]))
        print(f"✅ Added Job: {job['job_title']}")
        
    # 3. Sample Applications
    python_job_id = job_ids[0][0]
    frontend_job_id = job_ids[1][0]
    
    candidates = [
        {
            "jd_id": python_job_id,
            "job_title": "Senior Python Developer",
            "status": "interviewed",
            "applied_at": datetime.utcnow().isoformat(),
            "resume_data": {"name": "Alice Sharma", "email": "alice@example.com", "skills": ["Python", "FastAPI", "Docker"]},
            "score": {"total_score": 88.5, "skills_match_score": 18, "experience_score": 25}
        },
        {
            "jd_id": python_job_id,
            "job_title": "Senior Python Developer",
            "status": "applied",
            "applied_at": datetime.utcnow().isoformat(),
            "resume_data": {"name": "Bob Singh", "email": "bob@example.com", "skills": ["Java", "SQL"]},
            "score": {"total_score": 45.0, "skills_match_score": 5, "experience_score": 10}
        },
        {
            "jd_id": frontend_job_id,
            "job_title": "Frontend React Engineer",
            "status": "applied",
            "applied_at": datetime.utcnow().isoformat(),
            "resume_data": {"name": "David Gupta", "email": "david@example.com", "skills": ["React", "CSS", "Vite"]},
            "score": {"total_score": 92.0, "skills_match_score": 20, "experience_score": 28}
        }
    ]
    
    await db.resumes.insert_many(candidates)
    print(f"✅ Added {len(candidates)} test applications.")
    print("\n✨ Data seeded successfully! Restart backend or refresh Frontend to see updates.")

if __name__ == "__main__":
    asyncio.run(seed_data())
