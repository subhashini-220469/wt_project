import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check_users():
    client = AsyncIOMotorClient("mongodb://localhost:27017/")
    db = client["resume_screening"]
    cursor = db.users.find({})
    users = await cursor.to_list(length=100)
    print(f"Total Users: {len(users)}")
    for u in users:
        print(f" - {u.get('email')} (Role: {u.get('role')})")
    client.close()

if __name__ == "__main__":
    asyncio.run(check_users())
