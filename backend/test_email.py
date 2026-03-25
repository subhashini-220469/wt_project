import asyncio
import os
from dotenv import load_dotenv
from email.message import EmailMessage
from aiosmtplib import send

async def test_smtp():
    load_dotenv()
    user = os.getenv("EMAIL_USER")
    pw = os.getenv("EMAIL_PASSWORD")
    
    print(f"Testing SMTP with User: {user}")
    if not user or not pw:
        print("Error: EMAIL_USER or EMAIL_PASSWORD not in .env")
        return

    msg = EmailMessage()
    msg["From"] = user
    msg["To"] = user # Send test email to self
    msg["Subject"] = "Test Email from SmartHire"
    msg.set_content("This is a test email to verify SMTP configuration.")

    try:
        await send(
            msg,
            hostname="smtp.gmail.com",
            port=465,
            username=user,
            password=pw,
            use_tls=True,
            timeout=30 # Add timeout for testing
        )
        print("SUCCESS: Email sent successfully!")
    except Exception as e:
        print(f"FAILED: SMTP error occurred: {e}")

if __name__ == "__main__":
    asyncio.run(test_smtp())
