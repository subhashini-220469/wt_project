import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/")
db_name = "resume_screening"

async def seed_data():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[db_name]

    print("Seeding Mock Data...")

    # Clear existing
    await db.jds.delete_many({})
    await db.resumes.delete_many({})

    # 1. Insert Mock JD
    jd_mock = {
        "raw_text": "We are looking for a Senior React Developer with 5+ years of experience in JavaScript, HTML, CSS and Node.js.",
        "structured_data": {
            "job_title": "Senior React Developer",
            "experience_years": 5,
            "skills": ["React", "JavaScript", "HTML", "CSS", "Node.js"],
            "education": "Bachelor's Degree"
        }
    }
    jd_result = await db.jds.insert_one(jd_mock)
    jd_id = str(jd_result.inserted_id)

    # 2. Insert Mock Resumes
    mock_resumes = [
        {
            "jd_id": jd_id,
            "job_title": "Senior React Developer",
            "filename": "navya_resume.pdf",
            "resume_data": {
                "name": "Navya Maripi",
                "email": "n220623@rguktn.ac.in",
                "skills": ["React", "JavaScript", "Python", "Problem Solving"],
                "experience_years": 4
            },
            "score": {
                "total_score": 99,
                "skills_score": 45,
                "experience_score": 34,
                "education_score": 10,
                "contact_score": 10,
                "formatting_score": 0
            }
        },
        {
            "jd_id": jd_id,
            "job_title": "Senior React Developer",
            "filename": "ganesh_resume.pdf",
            "resume_data": {
                "name": "Ganesh",
                "email": "guntreddinagaraju@gmail.com",
                "skills": ["React", "HTML", "CSS"],
                "experience_years": 2
            },
            "score": {
                "total_score": 71,
                "skills_score": 30,
                "experience_score": 21,
                "education_score": 10,
                "contact_score": 10,
                "formatting_score": 0
            }
        },
        {
            "jd_id": jd_id,
            "job_title": "Senior React Developer",
            "filename": "john_doe_resume.pdf",
            "resume_data": {
                "name": "John Doe",
                "email": "john.doe.mock@gmail.com",
                "skills": ["React", "JavaScript", "HTML", "CSS", "Node.js", "TypeScript"],
                "experience_years": 6
            },
            "score": {
                "total_score": 92,
                "skills_score": 40,
                "experience_score": 30,
                "education_score": 10,
                "contact_score": 10,
                "formatting_score": 2
            }
        },
        {
            "jd_id": jd_id,
            "job_title": "Senior React Developer",
            "filename": "jane_smith_resume.pdf",
            "resume_data": {
                "name": "Jane Smith",
                "email": "jane.smith.mock@gmail.com",
                "skills": ["React", "JavaScript", "HTML"],
                "experience_years": 3
            },
            "score": {
                "total_score": 65,
                "skills_score": 25,
                "experience_score": 20,
                "education_score": 10,
                "contact_score": 10,
                "formatting_score": 0
            }
        },
        {
            "jd_id": jd_id,
            "job_title": "Senior React Developer",
            "filename": "bob_professional.docx",
            "resume_data": {
                "name": "Bob Wilson",
                "email": "bob.wilson.mock@gmail.com",
                "skills": ["React", "JavaScript", "Node.js", "Next.js"],
                "experience_years": 8
            },
            "score": {
                "total_score": 88,
                "skills_score": 35,
                "experience_score": 30,
                "education_score": 10,
                "contact_score": 10,
                "formatting_score": 3
            }
        }
    ]

    await db.resumes.insert_many(mock_resumes)
    
    # 2nd JD for testing list view
    jd_mock_2 = {
        "raw_text": "Python Backend Developer needed for a FinTech startup. Expertise in FastAPI and MongoDB required.",
        "structured_data": {
            "job_title": "Python Backend Developer",
            "experience_years": 3,
            "skills": ["Python", "FastAPI", "MongoDB", "PostgreSQL"],
            "education": "Master's Degree"
        }
    }
    await db.jds.insert_one(jd_mock_2)

    print(f"Seeding complete! Added 2 JDs and 3 candidates for '{jd_mock['structured_data']['job_title']}'.")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_data())
