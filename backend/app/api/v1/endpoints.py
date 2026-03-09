from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from typing import List
from ...controllers.ats_controller import ATSController
from ...db.database import db
from ...services.mailer import Mailer
from ...models.models import ResumeData, JDData, ScoringResult, JobPosting
from bson import ObjectId
from pydantic import BaseModel

router = APIRouter()

@router.post("/process")
async def process_resumes(
    jd_text: str = Form(...),
    files: List[UploadFile] = File(...)
):
    try:
        return await ATSController.process_resumes(jd_text, files)
    except Exception as e:
        import traceback
        print(f"❌ CRITICAL ERROR IN /process: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

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
        print(f"❌ Error creating job: {e}")
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

@router.post("/apply/{job_id}")
async def apply_to_job(
    job_id: str,
    name: str = Form(...),
    email: str = Form(...),
    resume: UploadFile = File(...),
    screening_answers: str = Form("{}") # JSON string
):
    try:
        import json
        answers_dict = json.loads(screening_answers)
        return await ATSController.apply_to_job(job_id, name, email, resume, answers_dict)
    except Exception as e:
        print(f"❌ Error in /apply: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/rescore/{job_id}")
async def rescore_job(job_id: str, resume_data: ResumeData):
    try:
        from bson import ObjectId
        job = await db.db.jobs.find_one({"_id": ObjectId(job_id)})
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        from ...services.scoring import ScoringEngine
        from ...models.models import JDData
        jd_data = JDData(**job["structured_jd"])
        
        score_res = ScoringEngine.score_resume(resume_data, jd_data)
        return score_res
    except Exception as e:
        print(f"❌ Error in /rescore: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class EmailRequest(BaseModel):
    jd_id: str
    recipient_emails: List[str]
    subject: str
    body: str

@router.post("/send-emails")
async def send_bulk_emails(req: EmailRequest, background_tasks: BackgroundTasks):
    if not req.recipient_emails:
        raise HTTPException(status_code=400, detail="No recipients provided")
    
    # Use FastAPI BackgroundTasks for queueing
    background_tasks.add_task(
        Mailer.send_bulk_emails, 
        req.recipient_emails, 
        req.subject, 
        req.body
    )
    
    return {"message": f"Bulk email task started for {len(req.recipient_emails)} candidates."}
