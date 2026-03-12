import asyncio
from typing import List
from fastapi import UploadFile, HTTPException
from ..services.extraction import DocumentExtractor, LLMParser
from ..services.scoring import ScoringEngine
from ..db.database import db
from ..models.models import ResumeData, JDData

class ATSController:
    @staticmethod
    async def parse_resume(file: UploadFile):
        try:
            content = await file.read()
            if file.filename.endswith(".pdf"):
                text = DocumentExtractor.extract_text_from_pdf(content)
            elif file.filename.endswith(".docx"):
                text = DocumentExtractor.extract_text_from_docx(content)
            else:
                raise HTTPException(status_code=400, detail="Unsupported format")
            
            resume_dict = await LLMParser.parse_resume(text)
            resume_data = ResumeData(**resume_dict)
            
            # Optionally store this "Profile" in a master collection
            profile_record = {
                "filename": file.filename,
                "resume_data": resume_data.model_dump(),
                "parsed_at": asyncio.get_event_loop().time()
            }
            # We could store in a 'profiles' collection if we had candidate IDs
            
            return {
                "name": resume_data.name,
                "resume_data": resume_data.model_dump()
            }
        except Exception as e:
            print(f"❌ Error parsing resume: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @staticmethod
    async def apply_to_job(job_id: str, name: str, email: str, file: UploadFile, screening_answers: dict, resume_data_override: dict = None):
        # 1. Fetch Job from DB to get structured_jd
        from bson import ObjectId
        job = await db.db.jobs.find_one({"_id": ObjectId(job_id)})
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        jd_data_dict = job.get("structured_jd")
        if not jd_data_dict:
            jd_data_dict = await LLMParser.parse_jd(job["description"])
        
        jd_data = JDData(**jd_data_dict)

        # 2. Get Resume Data (either from file or from override)
        if resume_data_override:
            resume_data = ResumeData(**resume_data_override)
        else:
            content = await file.read()
            if file.filename.endswith(".pdf"):
                text = DocumentExtractor.extract_text_from_pdf(content)
            elif file.filename.endswith(".docx"):
                text = DocumentExtractor.extract_text_from_docx(content)
            else:
                raise HTTPException(status_code=400, detail="Unsupported format")
            
            resume_dict = await LLMParser.parse_resume(text)
            resume_data = ResumeData(**resume_dict)

        # 3. Final polish on resume data
        resume_data.name = name
        resume_data.email = email
        
        # 4. Score
        score_res = ScoringEngine.score_resume(resume_data, jd_data)
        
        # 5. Store in Resumes collection
        from datetime import datetime
        resume_record = {
            "jd_id": job_id,
            "job_title": jd_data.job_title,
            "filename": file.filename if file else "pre-parsed",
            "candidate_name": name,
            "candidate_email": email,
            "screening_answers": screening_answers,
            "resume_data": resume_data.model_dump(),
            "score": score_res.model_dump(),
            "status": "applied", # Default status
            "applied_at": datetime.utcnow().isoformat()
        }
        
        await db.db.resumes.insert_one(resume_record)
        print(f"✅ Successfully stored application for {name} in 'resumes' collection.")
        
        return {
            "message": "Application submitted successfully",
            "score": score_res.total_score,
            "details": score_res.model_dump()
        }
