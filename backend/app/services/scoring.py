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
    def calculate_contact_info(resume: ResumeData) -> (float, str):
        score = 0
        missing = []
        if resume.name and resume.name != "Unknown": score += 3
        else: missing.append("Name")
        if resume.phone: score += 3
        else: missing.append("Phone")
        if resume.email: score += 3
        else: missing.append("Email")
        if resume.location: score += 3
        else: missing.append("Location")
        if resume.linkedin: score += 3
        else: missing.append("LinkedIn")
        
        feedback = "Perfect contact details provided." if not missing else f"Missing: {', '.join(missing)}. Recruiters need these to reach you."
        return float(score), feedback

    @staticmethod
    def calculate_skills_match(resume_skills: List[str], jd_skills: List[str]) -> (float, str):
        if not jd_skills:
            return 0.0, "No skills required for this job description."
        
        resume_skills_lower = [s.lower() for s in resume_skills]
        jd_skills_lower = [s.lower() for s in jd_skills]
        
        matched = []
        missing = []
        
        jd_embeddings = model.encode(jd_skills_lower)
        res_embeddings = model.encode(resume_skills_lower) if resume_skills_lower else []
        
        if len(res_embeddings) > 0:
            cos_sim = util.cos_sim(res_embeddings, jd_embeddings)
            for i, jd_skill in enumerate(jd_skills):
                max_sim = cos_sim[:, i].max().item()
                if max_sim >= 0.85:
                    matched.append(jd_skill)
                else:
                    missing.append(jd_skill)
        else:
            missing = jd_skills

        score = (len(matched) / len(jd_skills)) * 20.0
        feedback = f"Matched {len(matched)} skills: {', '.join(matched[:5])}{'...' if len(matched)>5 else ''}. "
        if missing:
            feedback += f"Missing critical skills like: {', '.join(missing[:3])}."
        
        return min(20.0, float(score)), feedback

    @staticmethod
    def calculate_experience_score(resume: ResumeData, jd: JDData) -> (float, str):
        is_fresher = resume.experience_years < 1.0 or not resume.recent_jobs
        
        if is_fresher:
            if not resume.projects:
                return 0.0, "No relevant projects found. Freshers need at least 2-3 projects to qualify."
            
            project_embeddings = model.encode(resume.projects)
            jd_role_embedding = model.encode([jd.role_description])
            cos_sim = util.cos_sim(project_embeddings, jd_role_embedding)
            avg_relevance = cos_sim.mean().item()
            
            score = avg_relevance * 28.0
            github_bonus = 2.0 if any("github" in p.lower() for p in resume.projects) else 0.0
            total = min(30.0, float(score + github_bonus))
            
            feedback = f"Analyzed {len(resume.projects)} projects. "
            if avg_relevance < 0.5: feedback += "Project relevance to this role is low."
            else: feedback += "Projects show strong alignment with JD."
            return total, feedback
        else:
            time_score = (min(resume.experience_years, jd.min_experience_years * 2) / jd.min_experience_years) * 15.0 if jd.min_experience_years > 0 else 15.0
            time_score = min(15.0, time_score)
            
            job_embeddings = model.encode(resume.recent_jobs)
            jd_role_embedding = model.encode([jd.role_description])
            cos_sim = util.cos_sim(job_embeddings, jd_role_embedding)
            max_relevance = cos_sim.max().item()
            role_score = max_relevance * 15.0
            
            total = min(30.0, float(time_score + role_score))
            feedback = f"Found {resume.experience_years} years exp vs {jd.min_experience_years} required. "
            if max_relevance < 0.6: feedback += "Work history relevance is low."
            else: feedback += "Previous roles demonstrate highly relevant background."
            return total, feedback

    @staticmethod
    def calculate_education_score(resume_level: str, jd_level: str) -> (float, str):
        res_val = EDUCATION_LEVELS.get(resume_level, 0)
        jd_val = EDUCATION_LEVELS.get(jd_level, 2)
        
        if jd_val == 0: return 20.0, "No specific education required."
        
        score = (res_val / jd_val) * 20.0
        total = min(20.0, float(score))
        
        if res_val >= jd_val:
            feedback = f"Education matches or exceeds requirement ({resume_level} vs {jd_level})."
        else:
            feedback = f"Requested {jd_level}, found {resume_level}."
        
        return total, feedback

    @classmethod
    def score_resume(cls, resume: ResumeData, jd: JDData) -> ScoringResult:
        c_score, c_fb = cls.calculate_contact_info(resume)
        s_score, s_fb = cls.calculate_skills_match(resume.skills, jd.required_skills)
        ex_score, ex_fb = cls.calculate_experience_score(resume, jd)
        ed_score, ed_fb = cls.calculate_education_score(resume.education_level, jd.education_requirements)
        f_score = resume.formatting_score
        f_fb = "Clear structure and professional layout detected." if f_score > 10 else "Resume layout is messy; use standard sections like Skills and Experience."
        
        total_score = round(c_score + s_score + ex_score + ed_score + f_score, 1)
        
        return ScoringResult(
            total_score=total_score,
            contact_info_score=c_score,
            skills_match_score=s_score,
            experience_score=ex_score,
            education_score=ed_score,
            formatting_score=f_score,
            details={
                "skills_count": len(resume.skills),
                "exp_years": resume.experience_years,
                "education": resume.education_level
            },
            feedback={
                "contact": c_fb,
                "skills": s_fb,
                "experience": ex_fb,
                "education": ed_fb,
                "formatting": f_fb
            }
        )
