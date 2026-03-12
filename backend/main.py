import os
import sys

from dotenv import load_dotenv
from pymongo import MongoClient
import uvicorn

# Add the current directory to sys.path so 'app' can be found
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load the .env before using os.getenv
load_dotenv()

mongo_uri = os.getenv("MONGO_URL")
if not mongo_uri:
    raise RuntimeError("MONGO_URL not set in .env")

client = MongoClient(mongo_uri)
db = client.get_database()

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)