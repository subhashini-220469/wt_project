from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict

class SkillMatch(BaseModel):
    name: str
    match_type: str  # "exact" or "semantic"
    score: float

class ExperienceDetail(BaseModel):
    years: float
    role_relevance_score: float
    job_description_match: bool

class ResumeData(BaseModel):
    name: str = "Unknown"
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin: Optional[str] = None
    skills: List[str] = []
    experience_years: float = 0.0
    recent_jobs: List[str] = []
    projects: List[str] = []
    education_level: str = "Unknown"
    formatting_score: float = 0.0

class JDData(BaseModel):
    job_title: str
    required_skills: List[str]
    min_experience_years: float
    role_description: str
    education_requirements: str

class ScoringResult(BaseModel):
    total_score: float
    contact_info_score: float
    skills_match_score: float
    experience_score: float
    education_score: float
    formatting_score: float
    details: Dict
