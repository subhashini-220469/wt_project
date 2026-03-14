import httpx
import json
import asyncio

async def test_apply():
    # Attempting to apply to a REAL job
    JOB_ID = "69b1b532d56fd1b44c202f30" # Senior Python Developer
    url = f"http://localhost:8000/apply/{JOB_ID}"
    
    payload = {
        'name': 'Test User',
        'email': 'test@example.com',
        'screening_answers': json.dumps({"q1": "Yes"})
    }
    
    # Simulate override (Master Resume)
    override = {
        "name": "Test User",
        "skills": ["Python", "FastAPI"],
        "experience_years": 3,
        "education_level": "Bachelors"
    }
    payload['resume_data_override'] = json.dumps(override)
    
    try:
        print(f"Testing POST {url}...")
        async with httpx.AsyncClient() as client:
            res = await client.post(url, data=payload, timeout=60.0)
            print(f"Status Code: {res.status_code}")
            print(f"Response: {res.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_apply())
