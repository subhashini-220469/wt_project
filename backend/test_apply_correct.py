import httpx
import json
import asyncio

async def test_apply_correct():
    JOB_ID = "69aeffa5597c8af386b1ee5f" # Senior Python Developer
    url = f"http://localhost:8000/apply/{JOB_ID}"
    
    payload = {
        'name': 'Vinay Marrapu',
        'email': 'n220623@rguktn.ac.in',
        'screening_answers': json.dumps({"q1": "Yes"})
    }
    
    override = {
        "name": "Vinay Marrapu",
        "email": "n220623@rguktn.ac.in",
        "skills": ["Python", "FastAPI", "React"],
        "experience_years": 4,
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
    asyncio.run(test_apply_correct())
