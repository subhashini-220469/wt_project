import os
import sys

from dotenv import load_dotenv
from pymongo import MongoClient
import uvicorn

# Add the current directory to sys.path so 'app' can be found
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load the .env before using os.getenv
load_dotenv()

# Database configuration is handled within the 'app.main' module.

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)