import asyncio
from typing import List
from fastapi import UploadFile, HTTPException
from ..services.extraction import DocumentExtractor, LLMParser
from ..services.scoring import ScoringEngine
from ..db.database import db
from ..models.models import ResumeData, JDData

class ATSController:
    @staticmethod
    async def process_resumes(jd_text: str, files: List[UploadFile]):
        # 1. Parse and Store JD
        # We'll parse it first to get structured data
        jd_dict = await LLMParser.parse_jd(jd_text)
        jd_data = JDData(**jd_dict)
        
        jd_insert = await db.db.jds.insert_one({
            "raw_text": jd_text,
            "structured_data": jd_data.model_dump()
        })
        jd_id = str(jd_insert.inserted_id)
        print(f"✅ Stored Job Description in DB with ID: {jd_id}")

        results = []
        
        # Limit concurrency to 3 parallel LLM calls to handle rate limits and manage the "queue"
        semaphore = asyncio.Semaphore(3)

        async def process_single_resume(file: UploadFile):
            async with semaphore:
                try:
                    print(f"🔄 Processing {file.filename} in queue...")
                    content = await file.read()
                    
                    # Extract Text
                    if file.filename.endswith(".pdf"):
                        text = DocumentExtractor.extract_text_from_pdf(content)
                    elif file.filename.endswith(".docx"):
                        text = DocumentExtractor.extract_text_from_docx(content)
                    else:
                        return {"error": f"Unsupported file type: {file.filename}"}
                    
                    if not text.strip():
                        return {"error": f"Empty text in file: {file.filename}"}

                    # LLM Parse
                    resume_dict = await LLMParser.parse_resume(text)
                    resume_data = ResumeData(**resume_dict)
                    
                    # Score
                    score_res = ScoringEngine.score_resume(resume_data, jd_data)
                    
                    # Store in DB
                    resume_record = {
                        "jd_id": jd_id,
                        "job_title": jd_data.job_title,
                        "filename": file.filename,
                        "resume_data": resume_data.model_dump(),
                        "score": score_res.model_dump()
                    }
                    await db.db.resumes.insert_one(resume_record)
                    print(f"✅ Stored Resume for {resume_data.name} in DB.")
                    
                    return {
                        "name": resume_data.name,
                        "filename": file.filename,
                        "score": score_res.total_score,
                        "resume_data": resume_data.model_dump(),
                        "details": score_res.model_dump()
                    }
                except Exception as e:
                    print(f"❌ Error processing {file.filename}: {e}")
                    return {"error": str(e), "filename": file.filename}

        # Run resume processing with the concurrency limit
        tasks = [process_single_resume(f) for f in files]
        results = await asyncio.gather(*tasks)

        # 3. Filter out errors and sort
        valid_results = [r for r in results if "error" not in r]
        errors = [r for r in results if "error" in r]
        valid_results.sort(key=lambda x: x["score"], reverse=True)

        return {
            "jd_id": jd_id,
            "job_title": jd_data.job_title,
            "total_processed": len(valid_results),
            "errors": errors,
            "top_candidates": valid_results
        }
    @staticmethod
    async def apply_to_job(job_id: str, name: str, email: str, file: UploadFile, screening_answers: dict):
        # 1. Fetch Job from DB to get structured_jd
        from bson import ObjectId
        job = await db.db.jobs.find_one({"_id": ObjectId(job_id)})
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        # We stored structured_jd in the JobPosting model
        jd_data_dict = job.get("structured_jd")
        if not jd_data_dict:
            # Fallback: Parse description if not structured
            jd_data_dict = await LLMParser.parse_jd(job["description"])
        
        jd_data = JDData(**jd_data_dict)

        # 2. Process Resume
        content = await file.read()
        if file.filename.endswith(".pdf"):
            text = DocumentExtractor.extract_text_from_pdf(content)
        elif file.filename.endswith(".docx"):
            text = DocumentExtractor.extract_text_from_docx(content)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")

        # 3. LLM Parse & Score
        resume_dict = await LLMParser.parse_resume(text)
        resume_data = ResumeData(**resume_dict)
        # Override name/email with what was provided in form
        resume_data.name = name
        resume_data.email = email
        
        score_res = ScoringEngine.score_resume(resume_data, jd_data)
        
        # 4. Store in Resumes collection
        resume_record = {
            "jd_id": job_id,
            "job_title": jd_data.job_title,
            "filename": file.filename,
            "candidate_name": name,
            "candidate_email": email,
            "screening_answers": screening_answers,
            "resume_data": resume_data.model_dump(),
            "score": score_res.model_dump(),
            "applied_at": asyncio.get_event_loop().time() # or datetime
        }
        from datetime import datetime
        resume_record["applied_at"] = datetime.utcnow().isoformat()
        
        await db.db.resumes.insert_one(resume_record)
        
        # 5. Return success with score for instant feedback
        return {
            "message": "Application submitted successfully",
            "score": score_res.total_score,
            "details": score_res.model_dump()
        }
