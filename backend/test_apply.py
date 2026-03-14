import httpx
import json
import asyncio

async def test_apply():
    # Attempting to apply to one of the jobs
    JOB_ID = "69aeffa5597c8af386b1e2e1" # Sample ID
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
            res = await client.post(url, data=payload)
            print(f"Status Code: {res.status_code}")
            print(f"Response: {res.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_apply())
