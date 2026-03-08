# 🚀 AI Resume Screening Backend - Quickstart Guide

This is the backend for the AI-powered Resume Screening System. It uses **FastAPI**, **MongoDB**, and **OpenRouter LLMs** to extract data and score resumes against job descriptions.

---

## 🛠️ Prerequisites
- **Python 3.10+**
- **MongoDB** (Local or Atlas)
- **OpenRouter API Key** (Get one at [openrouter.ai](https://openrouter.ai/))

---

## ⚙️ Setup Instructions

### 1. Initialize Virtual Environment
If you haven't already:
```powershell
# Create venv
python -m venv venv

# Activate venv
.\venv\Scripts\activate
```

### 2. Install Dependencies
```powershell
pip install -r requirements.txt
```

### 3. Configuration
Create/Edit the `.env` file in the `backend` directory:
```env
MONGO_URL=mongodb://localhost:27017
OPENROUTER_API_KEY=your_actual_key_here
OPENROUTER_MODEL=meta-llama/llama-3-8b-instruct
```

---

## 🏃 Running the Application

### Start the Server
```powershell
python main.py
```
The server will start at `http://localhost:8000`.

### Documentation
Once running, you can view the interactive API docs at:
- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 📡 API Endpoints

### `POST /process`
Main entry point for screening.
- **Payload**: `FormData`
  - `jd_text`: Raw string of the job description.
  - `files`: List of PDF/DOCX files (resumes).
- **Behavior**: Parses JD, parses resumes via LLM, calculates scores, and stores results in MongoDB.

### `GET /results/{jd_id}`
Retrieve all candidates for a specific job description.

---

## 🧠 Scoring Engine Logic
The system uses a 100-point deterministic engine:
1. **Contact Info (15 pts)**: Name, Phone, Email, Location, LinkedIn.
2. **Skills Match (20 pts)**: Exact keyword matching + MiniLM Semantic similarity (threshold 0.85).
3. **Experience (30 pts)**: Time match + Role relevance via vector embeddings.
4. **Education (20 pts)**: Weighted degree level match.
5. **Formatting (15 pts)**: Professionalism score from LLM.
