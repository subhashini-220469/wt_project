import os
import asyncio
import smtplib
from email.message import EmailMessage
from aiosmtplib import send
from dotenv import load_dotenv

load_dotenv(override=True)

EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 465 # Switch to port 465 for SSL (often more stable)

class Mailer:
    @staticmethod
    async def send_email(to_email: str, subject: str, body: str):
        # Re-load to ensure we pick up .env changes without master restart
        load_dotenv(override=True)
        user = os.getenv("EMAIL_USER")
        pw = os.getenv("EMAIL_PASSWORD")
        
        print(f"DEBUG: Attempting to send email from {user} (pw len: {len(pw) if pw else 0}) to {to_email}")
        
        if not user or not pw:
            print(f"Email Credentials Missing. User: {'Set' if user else 'Not set'}, PW: {'Set' if pw else 'Not set'}")
            return False

        message = EmailMessage()
        message["From"] = user
        message["To"] = to_email
        message["Subject"] = subject
        message.set_content(body)

        try:
            # Using port 465 requires use_tls=True
            print(f"DEBUG: Connecting to {SMTP_SERVER}:{SMTP_PORT} via SMTPS...")
            await send(
                message,
                hostname=SMTP_SERVER,
                port=SMTP_PORT,
                username=user,
                password=pw,
                use_tls=True, 
                timeout=30
            )
            print(f"DEBUG: Successfully sent to {to_email}")
            return True
        except Exception as e:
            print(f"Failed to send email to {to_email} on port {SMTP_PORT}: {e}")
            # If port 465 fails, we could potentially retry with 587 here
            return False

    @classmethod
    async def send_bulk_emails(cls, recipients: list, subject: str, body_template: str, jd_id: str = None):
        """
        Sends emails in a loop.
        Support placeholders: {name}, {company}, {role}
        """
        success_count = 0
        
        # Fetch Job Info for {company} and {role}
        company_name = "our company"
        job_title = "the position"
        if jd_id:
            try:
                from bson import ObjectId
                from ..db.database import db
                job = await db.db.jobs.find_one({"_id": ObjectId(jd_id)})
                if job:
                    company_name = job.get("company", company_name)
                    job_title = job.get("job_title", job_title)
            except Exception as e:
                print(f"Error fetching job for bulk email: {e}")

        for email in recipients:
            personal_body = body_template
            
            # Try to fetch candidate name for {name}
            name = "Candidate"
            if jd_id:
                try:
                    from ..db.database import db
                    # Look up candidate by email and job
                    cand = await db.db.resumes.find_one({"jd_id": jd_id, "candidate_email": email})
                    if cand:
                        name = cand.get("candidate_name", name)
                except Exception:
                    pass
            
            # Replace placeholders
            personal_body = personal_body.replace("{name}", name)
            personal_body = personal_body.replace("{company}", company_name)
            personal_body = personal_body.replace("{role}", job_title)

            success = await cls.send_email(email, subject, personal_body)
            if success:
                success_count += 1
            # Add a small delay to avoid hitting rate limits
            await asyncio.sleep(0.5)
        
        print(f"Bulk email task finished: {success_count}/{len(recipients)} sent.")

    @classmethod
    async def send_rejection_emails(cls, candidates_to_notify: list):
        """
        candidates_to_notify: List of dicts with {email, name, job_title}
        """
        success_count = 0
        for c in candidates_to_notify:
            email = c['email']
            name = c.get('name', 'Candidate')
            job_title = c.get('job_title', 'the position')
            
            subject = f"Application Status: {job_title}"
            body = f"""Dear {name},

Thank you very much for your interest in the {job_title} position at our company. We truly appreciate the time and effort you put into your application.

After a thorough review of your profile and screening results, we regret to inform you that we will not be moving forward with your candidacy at this stage. Our selection process was exceptionally difficult due to the high caliber of candidates we received.

Please note that this decision is specific to this particular role and does not reflect your overall qualifications or potential. We encourage you to keep an eye on our career page for future openings that may be a closer match for your skills.

We wish you great success in your job search and all your future professional pursuits. Thank you again for considering us as a potential employer.

Warm regards,
The Talent Acquisition Team
"""
            success = await cls.send_email(email, subject, body)
            if success:
                success_count += 1
            # Rate limiting for Gmail
            await asyncio.sleep(0.5)
        
        print(f"Rejection email task finished: {success_count}/{len(candidates_to_notify)} sent.")
