from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db.database import db
from .api.v1.endpoints import router as v1_router
import asyncio
import datetime

app = FastAPI(title="Resume Screening System (Restructured)")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await db.connect_db()
    # Start background task for deadline notifications
    asyncio.create_task(check_job_deadlines_periodically())

async def check_job_deadlines_periodically():
    while True:
        try:
            print("[INFO] Periodic deadline check started...")
            now = datetime.datetime.utcnow()
            tomorrow = now + datetime.timedelta(days=1)
            tomorrow_str = tomorrow.strftime("%Y-%m-%d")
            
            # Find all open jobs with a deadline of tomorrow
            cursor = db.db.jobs.find({
                "status": "open", 
                "deadline": tomorrow_str
            })
            upcoming_jobs = await cursor.to_list(length=100)
            
            if upcoming_jobs:
                # Find all candidates to notify
                user_cursor = db.users_db.users.find({"role": "user"})
                users = await user_cursor.to_list(length=1000)
                
                for job in upcoming_jobs:
                    job_id = str(job["_id"])
                    for user in users:
                        # Check if a notification already exists for this job and user to avoid duplicates
                        exists = await db.db.notifications.find_one({
                            "user_email": user["email"],
                            "job_id": job_id,
                            "type": "deadline"
                        })
                        
                        if not exists:
                            notif = {
                                "user_email": user["email"],
                                "message": f"🔔 Last date to apply for '{job['job_title']}' at {job['company']} is tomorrow!",
                                "is_read": False,
                                "type": "deadline",
                                "created_at": now.isoformat(),
                                "link": "/app",
                                "job_id": job_id
                            }
                            await db.db.notifications.insert_one(notif)
            
            print("[INFO] Periodic deadline check finished.")
        except Exception as e:
            print(f"[ERROR] Deadline checker failed: {e}")
        
        # Wait for 1 hour before checking again
        await asyncio.sleep(3600)

@app.on_event("shutdown")
async def shutdown():
    await db.close_db()

# Include the V1 router
app.include_router(v1_router)

@app.get("/")
async def root():
    return {"message": "ATS API is running", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
