from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from typing import List
from ...controllers.ats_controller import ATSController
from ...db.database import db
from ...services.mailer import Mailer
from ...services.scoring import ScoringEngine
from ...models.models import ResumeData, JDData, ScoringResult, JobPosting
from bson import ObjectId
from pydantic import BaseModel

router = APIRouter()

@router.post("/jobs")
async def create_job(job_post: JobPosting):
    try:
        # Pass the JD description to LLM to get structured requirements for our screening engine
        from ...services.extraction import LLMParser
        structured_dict = await LLMParser.parse_jd(job_post.description)
        job_post.structured_jd = JDData(**structured_dict)
        
        job_dict = job_post.model_dump()
        result = await db.db.jobs.insert_one(job_dict)
        return {"id": str(result.inserted_id), "message": "Job posted successfully"}
    except Exception as e:
        print(f"Error creating job: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/jobs")
async def get_jobs():
    cursor = db.db.jobs.find({})
    jobs = await cursor.to_list(length=100)
    for j in jobs:
        j["_id"] = str(j["_id"])
    return jobs

@router.get("/results/{jd_id}")
async def get_results(jd_id: str):
    cursor = db.db.resumes.find({"jd_id": jd_id})
    resumes = await cursor.to_list(length=100)
    for r in resumes:
        r["_id"] = str(r["_id"])
    
    # Sort by score
    resumes.sort(key=lambda x: x["score"]["total_score"], reverse=True)
    return resumes

@router.get("/jds")
async def get_all_jds():
    # Keep this for backward compatibility or general list
    cursor = db.db.jds.find({})
    jds = await cursor.to_list(length=100)
    for j in jds:
        id_obj = ObjectId(j["_id"])
        j["_id"] = str(id_obj)
        j["created_at"] = id_obj.generation_time.isoformat()
    return jds

@router.post("/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    return await ATSController.parse_resume(file)

@router.post("/apply/{job_id}")
async def apply_to_job(
    job_id: str,
    name: str = Form(...),
    email: str = Form(...),
    resume: UploadFile = File(None), # Optional if override provided
    screening_answers: str = Form("{}"),
    resume_data_override: str = Form(None) # JSON string
):
    try:
        import json
        answers_dict = json.loads(screening_answers)
        override_dict = json.loads(resume_data_override) if resume_data_override else None
        return await ATSController.apply_to_job(job_id, name, email, resume, answers_dict, override_dict)
    except Exception as e:
        print(f"Error in /apply: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/rescore/{job_id}")
async def rescore_job(job_id: str, resume_data: ResumeData):
    try:
        job = await db.db.jobs.find_one({"_id": ObjectId(job_id)})
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        jd_dict = job.get("structured_jd")
        if not jd_dict:
            # Fallback if JD wasn't parsed (e.g. old data)
            from ...services.extraction import LLMParser
            jd_dict = await LLMParser.parse_jd(job.get("description", ""))
        
        jd_data = JDData(**jd_dict)
        score_res = ScoringEngine.score_resume(resume_data, jd_data)
        return score_res
    except Exception as e:
        print(f"Error in /rescore: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/jobs/{job_id}")
async def delete_job(job_id: str):
    try:
        result = await db.db.jobs.delete_one({"_id": ObjectId(job_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Job not found")
        # Also cleanup resumes for this job
        await db.db.resumes.delete_many({"jd_id": job_id})
        return {"message": "Job and associated applications deleted successfully"}
    except Exception as e:
        print(f"Error deleting job: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/jobs/{job_id}/status")
async def update_job_status(job_id: str, status: str = Form(...)):
    try:
        result = await db.db.jobs.update_one(
            {"_id": ObjectId(job_id)},
            {"$set": {"status": status}}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Job not found")
        return {"message": f"Job status updated to {status}"}
    except Exception as e:
        print(f"Error updating job status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class EmailRequest(BaseModel):
    jd_id: str
    recipient_emails: List[str]
    subject: str
    body: str

@router.get("/analytics/jobs")
async def get_job_analytics():
    try:
        # Get all jobs
        cursor = db.db.jobs.find({})
        jobs = await cursor.to_list(length=100)
        
        analytics = []
        for job in jobs:
            job_id = str(job["_id"])
            
            # Count applications
            total_apps = await db.db.resumes.count_documents({"jd_id": job_id})
            
            # Count selected (Shortlisted score >= 70)
            # Find all matching jd_id
            cursor_res = db.db.resumes.find({"jd_id": job_id})
            resumes = await cursor_res.to_list(length=1000)
            
            selected = 0
            interviewed = 0
            for r in resumes:
                score = r.get("score", {}).get("total_score", 0)
                if score >= 70:
                    selected += 1
                
                # Check status for 'interviewed'
                if r.get("status") == "interviewed":
                    interviewed += 1
            
            analytics.append({
                "job_id": job_id,
                "job_title": job.get("job_title", "Untitled"),
                "company": job.get("company", "Unknown"),
                "total_applied": total_apps,
                "selected": selected,
                "interviews_done": interviewed,
                "status": job.get("status", "open")
            })
            
        return analytics
    except Exception as e:
        print(f"Error in analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/send-emails")
async def send_bulk_emails(req: EmailRequest, background_tasks: BackgroundTasks):
    if not req.recipient_emails:
        raise HTTPException(status_code=400, detail="No recipients provided")
    
    # Update status to 'interviewed' for these candidates
    await db.db.resumes.update_many(
        {"jd_id": req.jd_id, "resume_data.email": {"$in": req.recipient_emails}},
        {"$set": {"status": "interviewed"}}
    )
    
    # Use FastAPI BackgroundTasks for queueing
    background_tasks.add_task(
        Mailer.send_bulk_emails, 
        req.recipient_emails, 
        req.subject, 
        req.body
    )
    
    return {"message": f"Bulk email task started for {len(req.recipient_emails)} candidates."}
