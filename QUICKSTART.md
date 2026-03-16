# AI Resume Screening & Automation System 🚀

This project is a high-performance ATS (Applicant Tracking System) that uses AI to score resumes against job descriptions and automate candidate outreach via email.

---

## 🛠️ Prerequisites
- **Python 3.8+**
- **Node.js 16+** (for the React frontend)
- **MongoDB** (running locally or on Atlas)
- **Gmail Account** (with 2-Step Verification enabled)

---

## ⚙️ Initial Setup

### 1. Backend Setup (.env)
The backend requires certain environment variables to communicate with the AI and send emails.

1.  Navigate to the `backend/` folder.
2.  Copy `example.env` and rename it to `.env`:
    ```bash
    cp example.env .env
    ```
3.  **Fill in your details:**
    - `MONGO_URL`: Your MongoDB connection string (leave default for local).
    - `OPENROUTER_API_KEY`: Your key from [OpenRouter](https://openrouter.ai/).
    - `EMAIL_USER`: Your Gmail address.
    - `EMAIL_PASSWORD`: Your 16-character **Gmail App Password** (Critical: This is *not* your regular login password).

4.  **Install dependencies & run:**
    ```bash
    cd backend
    python -m venv venv
    .\venv\Scripts\activate
    pip install -r requirements.txt
    python main.py
    ```

### 2. Frontend Setup
1.  Navigate to the `frontend-react/` folder.
2.  Install dependencies:
    ```bash
    cd frontend-react
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```

---

## 🧠 How the System Works

### 1. Upload & Screen
- **User Input:** You paste a Job Description (JD) and upload multiple resume PDFs.
- **AI Processing:** The backend extracts text from each PDF and sends it to the AI (Arcee Trinity model) along with the JD.
- **Scoring:** The AI returns a structured score (0-100%) based on skill matching, experience, and education.
- **Queue Management:** Resumes are processed in an asynchronous queue to ensure the UI stays responsive.

### 2. Dashboard & Ranking
- Candidates are ranked automatically from highest match to lowest.
- Match results are stored in MongoDB so you can access them later.

### 3. Email Automation (The HR Workflow)
- **JD Selection**: Choose any job description from the history.
- **Smart Filters**: The system automatically pre-selects candidates with a score of **70% or higher**.
- **Template Customization**: Click "Edit Template" to change the invitation message before sending.
- **Real-time Status**: When you click "Broadcast", the system sends emails one-by-one. You will see a live status (🔄 Sending -> ✅ Sent) for every candidate.
- **Retry Logic**: If an email fails (e.g., due to an invalid address), a "Retry" button appears next to that specific candidate.

---

## 💡 Pro-Tips for the Team
- **Gmail Setup**: If you get a "Bad Credentials" error, ensure **2-Step Verification** is ON in your Google Account settings, then generate a new **App Password**.
- **Mock Data**: Run `python seed_db.py` in the backend folder to populate the system with test data instantly.
