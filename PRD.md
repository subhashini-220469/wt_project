📄 Product Requirement Document (PRD)
1. Project Title
 AI Resume Screening System (ATS Score Checker)

2. Problem Statement
 Recruiters (HR) often spend hours manually reviewing resumes, while applicants struggle to understand how well their resumes match job requirements. Traditional screening is slow, inconsistent, and prone to bias. Applicants also lack tools to check their resume’s ATS (Applicant Tracking System) score, which determines if their resume passes automated filters.

3. Objectives
 Provide HR teams with a fast, AI-powered resume screening tool.

 Allow applicants to upload resumes and instantly check their ATS score.

 Ensure fair, unbiased, and consistent evaluation of resumes.

Save time by automating initial resume filtering.

4. Key Features
For HR:
Upload multiple resumes for bulk screening.

Get ATS scores and ranking of candidates.

Filter resumes based on job description keywords.

Export shortlisted candidates.

For Applicants:
Upload resume and job description.

Get ATS score with detailed feedback (e.g., missing keywords, formatting issues).

Suggestions to improve resume for better ATS compatibility.

Common Features:
Secure login for HR and applicants.

Dashboard with analytics (average scores, top resumes).

Resume parsing (extracting text from PDF/Word).

AI-powered keyword matching.

5. Target Users
HR Recruiters: To shortlist candidates quickly.

Job Applicants: To optimize resumes before applying.

6. Technologies
Frontend: React.js / Angular (for user interface).

Backend: Node.js / Django (for APIs).

Database: MongoDB / PostgreSQL (for storing resumes and scores).

AI/NLP: Python (spaCy, NLTK, or transformer models for text analysis).

Deployment: GitHub, Docker, Cloud (AWS/Azure).

7. Modules
Authentication (Login/Signup for HR & Applicants).

Resume Upload & Parsing (extract text from resumes).

Job Description Upload (for comparison).

ATS Scoring Engine (AI model to calculate score).

Feedback Generator (suggest improvements).

Dashboard & Analytics (visual reports for HR).

Export/Download Results.

8. Work Items
Team Lead: Setup GitHub repo, define modules, assign tasks.

Frontend Developer: Build login, upload forms, dashboard UI.

Backend Developer: Create APIs for resume parsing, scoring.

AI Engineer: Implement NLP model for ATS scoring.

Database Engineer: Design schema for resumes, scores, users.

9. Success Metrics
Resume parsing accuracy ≥ 90%.

ATS score feedback clarity (easy to understand).

HR time saved in screening (at least 50% faster).

Applicant satisfaction (positive feedback on resume improvement).

10. Expected Output
A working prototype where:

HR can upload resumes and get ranked results.

Applicants can upload resumes and see ATS score + suggestions.



