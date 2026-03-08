import os
import smtplib
from email.message import EmailMessage
from aiosmtplib import send
from dotenv import load_dotenv

load_dotenv()

EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587

class Mailer:
    @staticmethod
    async def send_email(to_email: str, subject: str, body: str):
        # Re-load to ensure we pick up .env changes without master restart (optional, but safer)
        load_dotenv()
        user = os.getenv("EMAIL_USER")
        pw = os.getenv("EMAIL_PASSWORD")
        
        if not user or not pw:
            print(f"⚠️ Email Credentials Missing. User: {'Set' if user else 'Not set'}, PW: {'Set' if pw else 'Not set'}")
            return False

        message = EmailMessage()
        message["From"] = user
        message["To"] = to_email
        message["Subject"] = subject
        message.set_content(body)

        try:
            await send(
                message,
                hostname=SMTP_SERVER,
                port=SMTP_PORT,
                username=user,
                password=pw,
                start_tls=True
            )
            print(f"📧 Email sent successfully to {to_email}")
            return True
        except Exception as e:
            print(f"❌ Failed to send email to {to_email}: {e}")
            return False

    @classmethod
    async def send_bulk_emails(cls, recipients: list, subject: str, body: str):
        """
        Sends emails in a loop. Since it's triggered as a BackgroundTask,
        it won't block the API response.
        """
        success_count = 0
        for email in recipients:
            success = await cls.send_email(email, subject, body)
            if success:
                success_count += 1
        
        print(f"✅ Bulk email task finished: {success_count}/{len(recipients)} sent.")
