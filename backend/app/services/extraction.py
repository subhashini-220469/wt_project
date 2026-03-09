import os
import httpx
import json
import fitz  # PyMuPDF
import docx
from typing import Dict, Any
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3-8b-instruct")

class DocumentExtractor:
    @staticmethod
    def extract_text_from_pdf(content: bytes) -> str:
        doc = fitz.open(stream=content, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text()
        return text

    @staticmethod
    def extract_text_from_docx(content: bytes) -> str:
        import io
        file_stream = io.BytesIO(content)
        doc = docx.Document(file_stream)
        return "\n".join([paragraph.text for paragraph in doc.paragraphs])

class LLMParser:
    @staticmethod
    def _clean_json_response(content: str) -> Dict[str, Any]:
        content = content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            # Fallback: try to find the first '{' and last '}'
            start = content.find('{')
            end = content.rfind('}')
            if start != -1 and end != -1:
                return json.loads(content[start:end+1])
            raise

    @staticmethod
    async def parse_resume(resume_text: str) -> Dict[str, Any]:
        # Truncate to 10k characters
        resume_text = resume_text[:10000]
        
        prompt = f"""
        Extract the following information from the resume text and return it as a JSON object:
        - name
        - email
        - phone
        - location
        - linkedin (URL or presence)
        - skills (as a list)
        - experience_years (total years as a float)
        - recent_jobs (list of the 3 most recent job titles)
        - projects (list of top 3 projects)
        - education_level (PhD, Masters, Bachelors, High School)
        - formatting_score (0-15 based on readability and structure)

        Resume Text:
        {resume_text}
        """

        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json={
                    "model": OPENROUTER_MODEL,
                    "messages": [{"role": "user", "content": prompt}]
                },
                timeout=60.0
            )
            
            if response.status_code == 200:
                result = response.json()
                content = result['choices'][0]['message']['content']
                return LLMParser._clean_json_response(content)
            else:
                raise Exception(f"OpenRouter API Error: {response.text}")

    @staticmethod
    async def parse_jd(jd_text: str) -> Dict[str, Any]:
        # Truncate to 6k characters
        jd_text = jd_text[:6000]
        
        prompt = f"""
        Extract the following information from the Job Description text and return it as a JSON object:
        - job_title
        - required_skills (list)
        - min_experience_years (float)
        - role_description (detailed summary for semantic matching)
        - education_requirements (PhD, Masters, Bachelors, High School)

        JD Text:
        {jd_text}
        """

        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json={
                    "model": OPENROUTER_MODEL,
                    "messages": [{"role": "user", "content": prompt}]
                },
                timeout=60.0
            )
            
            if response.status_code == 200:
                result = response.json()
                content = result['choices'][0]['message']['content']
                return LLMParser._clean_json_response(content)
            else:
                raise Exception(f"OpenRouter API Error: {response.text}")
