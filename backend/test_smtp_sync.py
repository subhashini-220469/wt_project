import smtplib
import os
from dotenv import load_dotenv

def test_sync_smtp():
    load_dotenv()
    user = os.getenv("EMAIL_USER")
    pw = os.getenv("EMAIL_PASSWORD")
    
    print(f"Testing SYNC SMTP with User: {user}")
    if pw:
        print(f"Password length: {len(pw)}")
    if not user or not pw:
        return

    msg = f"Subject: Test\n\nThis is a test."
    
    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(user, pw)
        server.sendmail(user, user, msg)
        server.quit()
        print("SUCCESS: Sync SMTP works!")
    except Exception as e:
        print(f"FAILED: Sync SMTP error: {e}")

if __name__ == "__main__":
    test_sync_smtp()
