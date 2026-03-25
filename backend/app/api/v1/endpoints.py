from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from typing import List, Optional, Dict
from app.controllers.ats_controller import ATSController
from app.db.database import db
from app.services.mailer import Mailer
from app.services.scoring import ScoringEngine
from app.models.models import ResumeData, JDData, ScoringResult, JobPosting
from bson import ObjectId
from pydantic import BaseModel

router = APIRouter()

@router.post("/jobs")
async def create_job(job_post: JobPosting):
    try:
        # Check if DB is initialized
        if db.db is None:
            await db.connect_db()
            
        # Try to parse JD with LLM for structured requirements
        try:
            from app.services.extraction import LLMParser
            structured_dict = await LLMParser.parse_jd(job_post.description)
            if structured_dict:
                job_post.structured_jd = JDData(**structured_dict)
                print("Successfully parsed JD with AI")
        except Exception as llm_err:
            print(f"Warning: AI JD parsing failed: {llm_err}")
            # Job still gets posted even if AI fails
        
        job_dict = job_post.model_dump()
        result = await db.db.jobs.insert_one(job_dict)
        return {"id": str(result.inserted_id), "message": "Job posted successfully"}
    except Exception as e:
        print(f"Error creating job: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/jobs")
async def get_jobs(posted_by: str | None = None):
    if db.db is None:
        await db.connect_db()
    query = {}
    if posted_by:
        query["posted_by"] = posted_by
    cursor = db.db.jobs.find(query)
    jobs = await cursor.to_list(length=100)
    for j in jobs:
        j["_id"] = str(j["_id"])
    return jobs

@router.get("/results/{jd_id}")
async def get_results(jd_id: str):
    if db.db is None:
        await db.connect_db()
    cursor = db.db.resumes.find({"jd_id": jd_id})
    resumes = await cursor.to_list(length=100)
    for r in resumes:
        r["_id"] = str(r["_id"])
    
    # Sort by score
    resumes.sort(key=lambda x: x["score"]["total_score"], reverse=True)
    return resumes

@router.get("/my-applications/{email}")
async def get_my_applications(email: str):
    try:
        if db.db is None:
            await db.connect_db()
        cursor = db.db.resumes.find({"candidate_email": email})
        apps = await cursor.to_list(length=50)
        for a in apps:
            a["_id"] = str(a["_id"])
        return apps
    except Exception as e:
        print(f"Error fetching personal apps: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/jds")
async def get_all_jds(posted_by: str | None = None):
    # Keep this for backward compatibility or general list
    if db.db is None:
        await db.connect_db()
    query = {}
    if posted_by:
        query["posted_by"] = posted_by
    cursor = db.db.jobs.find(query)
    jds = await cursor.to_list(length=100)
    for j in jds:
        id_obj = ObjectId(j["_id"])
        j["_id"] = str(id_obj)
        j["created_at"] = id_obj.generation_time.isoformat()
    return jds

@router.post("/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    return await ATSController.parse_resume(file)

@router.get("/profiles/{email}")
async def get_profile(email: str):
    profile = await ATSController.get_profile(email)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.post("/profiles/{email}")
async def upsert_profile(email: str, profile_data: dict):
    return await ATSController.upsert_profile(email, profile_data)

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
        if db.db is None:
            await db.connect_db()

        try:
            obj_id = ObjectId(job_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid Job ID format")

        job = await db.db.jobs.find_one({"_id": obj_id})
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        jd_dict = job.get("structured_jd")
        if not jd_dict:
            # Fallback if JD wasn't parsed (e.g. old data)
            from app.services.extraction import LLMParser
            try:
                jd_dict = await LLMParser.parse_jd(job.get("description", ""))
            except Exception as jd_llm_err:
                print(f"Warning: AI JD parsing failed in rescore: {jd_llm_err}")
                jd_dict = {
                    "job_title": job.get("job_title", "Untitled Job"),
                    "required_skills": [],
                    "min_experience_years": 0.0,
                    "role_description": (job.get("description") or "")[:200],
                    "education_requirements": "Bachelors"
                }
        
        try:
            jd_data = JDData(**jd_dict)
        except Exception as validation_err:
            print(f"Validation error for JDData: {validation_err}")
            # Emergency fallback
            jd_data = JDData(
                job_title=job.get("job_title", "Untitled Job"),
                required_skills=[],
                min_experience_years=0.0,
                role_description=(job.get("description") or "")[:200],
                education_requirements="Bachelors"
            )

        score_res = ScoringEngine.score_resume(resume_data, jd_data)
        return score_res
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in /rescore: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/jobs/{job_id}")
async def delete_job(job_id: str):
    try:
        if db.db is None:
            await db.connect_db()
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
        if db.db is None:
            await db.connect_db()
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
async def get_job_analytics(posted_by: str | None = None):
    try:
        if db.db is None:
            await db.connect_db()
        # Get jobs filtered by HR
        query = {}
        if posted_by:
            query["posted_by"] = posted_by
            
        cursor = db.db.jobs.find(query)
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

@router.post("/notify-rejected/{jd_id}")
async def notify_rejected_candidates(jd_id: str, background_tasks: BackgroundTasks):
    if db.db is None:
        await db.connect_db()
        
    # Get candidates (score < 70) for this job
    # Note: Use filters directly in MongoDB if it gets large
    cursor = db.db.resumes.find({"jd_id": jd_id})
    resumes = await cursor.to_list(length=1000)
    
    rejected_to_notify = []
    for r in resumes:
        # Check both nested score.total_score or flat score
        score_data = r.get("score", {})
        if isinstance(score_data, dict):
            score_val = score_data.get("total_score", 0)
        else:
            score_val = score_data
            
        if score_val < 70:
            rejected_to_notify.append({
                "email": r["candidate_email"],
                "name": r["candidate_name"],
                "job_title": r.get("job_title", "Position Applied")
            })
            
    if not rejected_to_notify:
        print(f"No rejected candidates found for JD {jd_id} (Score < 70)")
        return {"message": "No candidates found with score < 70%."}
        
    print(f"Queueing {len(rejected_to_notify)} rejection emails for JD {jd_id}")
    # Queue background task
    background_tasks.add_task(
        Mailer.send_rejection_emails, 
        rejected_to_notify
    )
    
    return {"message": f"Successfully started task to notify {len(rejected_to_notify)} rejected candidates."}

@router.post("/send-emails")
async def send_bulk_emails(req: EmailRequest, background_tasks: BackgroundTasks):
    if req.recipient_emails is None or not req.recipient_emails:
        raise HTTPException(status_code=400, detail="No recipients provided")
    
    if db.db is None:
        await db.connect_db()
        
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
