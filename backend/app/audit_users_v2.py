import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def main():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["resume_screening"]
    users = await db.users.find({}).to_list(length=100)
    print(f"Users in resume_screening: {len(users)}")
    for user in users:
        print(f"Email: {user.get('email')} | Role: {user.get('role')}")

if __name__ == "__main__":
    asyncio.run(main())
