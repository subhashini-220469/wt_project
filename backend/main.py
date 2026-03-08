import os
import asyncio
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from database import db
from extraction import DocumentExtractor, LLMParser
from scoring import ScoringEngine
from models import ResumeData, JDData, ScoringResult
from mailer import Mailer
from bson import ObjectId
from pydantic import BaseModel

app = FastAPI(title="Resume Screening System")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await db.connect_db()

@app.on_event("shutdown")
async def shutdown():
    await db.close_db()

@app.post("/process")
async def process_resumes(
    jd_text: str = Form(...),
    files: List[UploadFile] = File(...)
):
    try:
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

    except Exception as e:
        import traceback
        print(f"❌ CRITICAL ERROR IN /process: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/results/{jd_id}")
async def get_results(jd_id: str):
    cursor = db.db.resumes.find({"jd_id": jd_id})
    resumes = await cursor.to_list(length=100)
    for r in resumes:
        r["_id"] = str(r["_id"])
    
    # Sort by score
    resumes.sort(key=lambda x: x["score"]["total_score"], reverse=True)
    return resumes

@app.get("/jds")
async def get_all_jds():
    cursor = db.db.jds.find({})
    jds = await cursor.to_list(length=100)
    for j in jds:
        id_obj = ObjectId(j["_id"])
        j["_id"] = str(id_obj)
        j["created_at"] = id_obj.generation_time.isoformat()
    return jds

class EmailRequest(BaseModel):
    jd_id: str
    recipient_emails: List[str]
    subject: str
    body: str

@app.post("/send-emails")
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
