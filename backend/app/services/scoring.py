import numpy as np
from sentence_transformers import SentenceTransformer, util
from typing import Dict, Any, List
from ..models.models import ResumeData, JDData, ScoringResult

# Initialize model (MiniLM)
model = SentenceTransformer('all-MiniLM-L6-v2')

EDUCATION_LEVELS = {
    "PhD": 4,
    "Masters": 3,
    "Bachelors": 2,
    "High School": 1,
    "Unknown": 0
}

class ScoringEngine:
    @staticmethod
    def calculate_contact_info(resume: ResumeData) -> float:
        score = 0
        if resume.name and resume.name != "Unknown": score += 3
        if resume.phone: score += 3
        if resume.email: score += 3
        if resume.location: score += 3
        if resume.linkedin: score += 3
        return float(score)

    @staticmethod
    def calculate_skills_match(resume_skills: List[str], jd_skills: List[str]) -> float:
        if not jd_skills:
            return 20.0
        
        # 1. Exact matches
        resume_skills_lower = [s.lower() for s in resume_skills]
        jd_skills_lower = [s.lower() for s in jd_skills]
        
        exact_matches = set(resume_skills_lower).intersection(set(jd_skills_lower))
        remaining_jd_skills = [s for s in jd_skills_lower if s not in exact_matches]
        remaining_resume_skills = [s for s in resume_skills_lower if s not in exact_matches]
        
        exact_score = (len(exact_matches) / len(jd_skills)) * 20.0
        
        # 2. Semantic matches for leftovers
        semantic_score = 0.0
        if remaining_jd_skills and remaining_resume_skills:
            jd_embeddings = model.encode(remaining_jd_skills)
            res_embeddings = model.encode(remaining_resume_skills)
            
            cos_sim = util.cos_sim(res_embeddings, jd_embeddings)
            
            # For each remaining JD skill, find the best match in resume
            matches_found = 0
            for i in range(len(remaining_jd_skills)):
                max_sim = cos_sim[:, i].max().item()
                if max_sim >= 0.85:
                    matches_found += 1
            
            semantic_score = (matches_found / len(jd_skills)) * 20.0
            
        total_skills_score = min(20.0, exact_score + semantic_score)
        return total_skills_score

    @staticmethod
    def calculate_experience_score(resume: ResumeData, jd: JDData) -> float:
        is_fresher = resume.experience_years < 1.0 or not resume.recent_jobs
        
        if is_fresher:
            # Fresher Path: 30pts based on project relevance + 2pt GitHub bonus (capped at 30)
            # For simplicity, we'll use semantic similarity of project names/desc to JD role
            if not resume.projects:
                return 0.0
            
            project_embeddings = model.encode(resume.projects)
            jd_role_embedding = model.encode([jd.role_description])
            
            cos_sim = util.cos_sim(project_embeddings, jd_role_embedding)
            avg_relevance = cos_sim.mean().item()
            
            project_score = avg_relevance * 28.0 # Base 28
            github_bonus = 2.0 if any("github" in p.lower() for p in resume.projects) or (resume.linkedin and "github" in resume.linkedin.lower()) else 0.0
            
            return min(30.0, float(project_score + github_bonus))
        else:
            # Experienced Path: 15pts Time Match + 15pts Role Relevance
            # Time Match
            time_score = (min(resume.experience_years, jd.min_experience_years * 2) / jd.min_experience_years) * 15.0 if jd.min_experience_years > 0 else 15.0
            time_score = min(15.0, time_score)
            
            # Role Relevance (Semantic match of recent jobs to JD description)
            job_embeddings = model.encode(resume.recent_jobs)
            jd_role_embedding = model.encode([jd.role_description])
            
            cos_sim = util.cos_sim(job_embeddings, jd_role_embedding)
            role_relevance_score = cos_sim.max().item() * 15.0
            
            return min(30.0, float(time_score + role_relevance_score))

    @staticmethod
    def calculate_education_score(resume_level: str, jd_level: str) -> float:
        res_val = EDUCATION_LEVELS.get(resume_level, 0)
        jd_val = EDUCATION_LEVELS.get(jd_level, 2) # Default JD to Bachelors if unknown
        
        if jd_val == 0: return 20.0
        
        score = (res_val / jd_val) * 20.0
        return min(20.0, float(score))

    @classmethod
    def score_resume(cls, resume: ResumeData, jd: JDData) -> ScoringResult:
        contact_info_score = cls.calculate_contact_info(resume)
        skills_match_score = cls.calculate_skills_match(resume.skills, jd.required_skills)
        experience_score = cls.calculate_experience_score(resume, jd)
        education_score = cls.calculate_education_score(resume.education_level, jd.education_requirements)
        formatting_score = resume.formatting_score # Out of 15 from LLM
        
        total_score = contact_info_score + skills_match_score + experience_score + education_score + formatting_score
        
        return ScoringResult(
            total_score=round(total_score, 2),
            contact_info_score=contact_info_score,
            skills_match_score=skills_match_score,
            experience_score=experience_score,
            education_score=education_score,
            formatting_score=formatting_score,
            details={
                "skills_count": len(resume.skills),
                "exp_years": resume.experience_years,
                "education": resume.education_level
            }
        )
