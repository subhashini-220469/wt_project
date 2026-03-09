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

class ScreeningQuestion(BaseModel):
    id: str
    category: str
    question: str
    input_type: str  # short_text, long_text, multiple_choice, yes_no, numeric
    options: Optional[List[str]] = None
    is_required: bool = True
    is_custom: bool = False

class SalaryInfo(BaseModel):
    range: Optional[str] = None
    pay_type: Optional[str] = None  # Yearly, Monthly, Hourly

class JobPosting(BaseModel):
    job_title: str
    company: str
    workplace_type: str  # In Office, Hybrid, Remote
    location: str
    job_type: str  # Full-time, Part-time, Contract, etc.
    description: str
    salary: Optional[SalaryInfo] = None
    screening_questions: List[ScreeningQuestion] = []
    status: str = "open"  # open, closed
    deadline: Optional[str] = None
    # For ATS parsing cache
    structured_jd: Optional[JDData] = None

class ScoringResult(BaseModel):
    total_score: float
    contact_info_score: float
    skills_match_score: float
    experience_score: float
    education_score: float
    formatting_score: float
    details: Dict
