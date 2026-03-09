import asyncio
import motor.motor_asyncio
import os
from datetime import datetime, timedelta
from bson import ObjectId
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
db = client.screening_db

async def seed_data():
    print("🚀 Seeding test data...")
    
    # 1. Clear existing data (Optional, but good for a clean test)
    # await db.jobs.delete_many({})
    # await db.resumes.delete_many({})
    
    # 2. Sample Jobs
    jobs = [
        {
            "job_title": "Senior Python Developer",
            "company": "TechStream AI",
            "workplace_type": "Remote",
            "location": "San Francisco, CA",
            "job_type": "Full-time",
            "description": "We are looking for a Senior Python Developer with 5+ years of experience in FastAPI and MongoDB. You will build scalable microservices and AI-driven ATS solutions.",
            "salary": {"range": "$140k - $180k", "pay_type": "Yearly"},
            "status": "open",
            "structured_jd": {
                "job_title": "Senior Python Developer",
                "required_skills": ["Python", "FastAPI", "MongoDB", "Microservices", "Docker", "Unit Testing"],
                "min_experience_years": 5.0,
                "role_description": "Building AI-driven recruitment platforms using modern Python frameworks.",
                "education_requirements": "Bachelors"
            }
        },
        {
            "job_title": "Frontend React Engineer",
            "company": "Designify",
            "workplace_type": "Hybrid",
            "location": "New York, NY",
            "job_type": "Full-time",
            "description": "Expert in React, Framer Motion, and CSS. Help us build stunning recruiter dashboards.",
            "salary": {"range": "$120k - $150k", "pay_type": "Yearly"},
            "status": "open",
            "structured_jd": {
                "job_title": "Frontend React Engineer",
                "required_skills": ["React", "JavaScript", "CSS", "Framer Motion", "Vite", "Responsive Design"],
                "min_experience_years": 3.0,
                "role_description": "Crafting premium user experiences for our dashboard platforms.",
                "education_requirements": "Bachelors"
            }
        },
        {
            "job_title": "Junior Data Scientist",
            "company": "InsightLab",
            "workplace_type": "In Office",
            "location": "Austin, TX",
            "job_type": "Internship",
            "description": "Work with our data team to clean and analyze recruitment trends.",
            "salary": {"range": "$30 - $45", "pay_type": "Hourly"},
            "status": "closed",
            "structured_jd": {
                "job_title": "Junior Data Scientist",
                "required_skills": ["Python", "Pandas", "SQL", "Statistics", "Data Cleaning"],
                "min_experience_years": 0.0,
                "role_description": "Assisting in data-driven decision making for the HR tech sector.",
                "education_requirements": "Bachelors"
            }
        }
    ]
    
    job_ids = []
    for job in jobs:
        res = await db.jobs.insert_one(job)
        job_ids.append((str(res.inserted_id), job["job_title"]))
        print(f"✅ Added Job: {job['job_title']}")
        
    # 3. Sample Applications for the first job (Senior Python)
    python_job_id = job_ids[0][0]
    python_candidates = [
        {
            "jd_id": python_job_id,
            "job_title": "Senior Python Developer",
            "candidate_name": "Alice Sharma",
            "candidate_email": "alice@example.com",
            "status": "interviewed",
            "score": {
                "total_score": 88.5,
                "contact_info_score": 15.0,
                "skills_match_score": 18.0,
                "experience_score": 25.0,
                "education_score": 20.0,
                "formatting_score": 10.5
            },
            "resume_data": {"name": "Alice Sharma", "email": "alice@example.com", "skills": ["Python", "FastAPI", "Docker"]}
        },
        {
            "jd_id": python_job_id,
            "job_title": "Senior Python Developer",
            "candidate_name": "Bob Singh",
            "candidate_email": "bob@example.com",
            "status": "applied",
            "score": {
                "total_score": 45.0,
                "contact_info_score": 10.0,
                "skills_match_score": 5.0,
                "experience_score": 10.0,
                "education_score": 10.0,
                "formatting_score": 10.0
            },
            "resume_data": {"name": "Bob Singh", "email": "bob@example.com", "skills": ["Java", "SQL"]}
        },
        {
            "jd_id": python_job_id,
            "job_title": "Senior Python Developer",
            "candidate_name": "Carol D'Souza",
            "candidate_email": "carol@example.com",
            "status": "applied",
            "score": {
                "total_score": 76.2,
                "contact_info_score": 15.0,
                "skills_match_score": 14.0,
                "experience_score": 18.0,
                "education_score": 20.0,
                "formatting_score": 9.2
            },
            "resume_data": {"name": "Carol D'Souza", "email": "carol@example.com", "skills": ["Python", "Flask", "MongoDB"]}
        }
    ]
    
    # Sample Application for the second job (Frontend)
    frontend_job_id = job_ids[1][0]
    frontend_candidates = [
        {
            "jd_id": frontend_job_id,
            "job_title": "Frontend React Engineer",
            "candidate_name": "David Gupta",
            "candidate_email": "david@example.com",
            "status": "applied",
            "score": {
                "total_score": 92.0,
                "contact_info_score": 15.0,
                "skills_match_score": 20.0,
                "experience_score": 28.0,
                "education_score": 20.0,
                "formatting_score": 9.0
            },
            "resume_data": {"name": "David Gupta", "email": "david@example.com", "skills": ["React", "CSS", "Vite"]}
        }
    ]
    
    await db.resumes.insert_many(python_candidates + frontend_candidates)
    print(f"✅ Added {len(python_candidates + frontend_candidates)} test applications.")
    print("\n✨ Seeding Complete! Refresh your Analytics/Dashboard to see the data.")

if __name__ == "__main__":
    asyncio.run(seed_data())
