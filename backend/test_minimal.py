import asyncio
import os
from dotenv import load_dotenv
from email.message import EmailMessage
import aiosmtplib

async def test_minimal():
    load_dotenv()
    user = os.getenv("EMAIL_USER")
    pw = os.getenv("EMAIL_PASSWORD")
    
    print(f"Testing aiosmtplib with User: {user}")
    if not user or not pw:
        print("Missing credentials")
        return

    msg = EmailMessage()
    msg["From"] = user
    msg["To"] = user
    msg["Subject"] = "Minimal Test"
    msg.set_content("Testing...")

    try:
        # Let aiosmtplib handle the port/security defaults
        print("Connecting to gmail on port 587...")
        await aiosmtplib.send(
            msg,
            hostname="smtp.gmail.com",
            port=587,
            username=user,
            password=pw,
            use_tls=False,
            start_tls=True,
            timeout=30
        )
        print("SUCCESS: Minimal test sent!")
    except Exception as e:
        print(f"FAILED: error: {e}")

if __name__ == "__main__":
    asyncio.run(test_minimal())
