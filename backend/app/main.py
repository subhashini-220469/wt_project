from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db.database import db
from .api.v1.endpoints import router as v1_router

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
