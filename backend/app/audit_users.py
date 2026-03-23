import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def main():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["test"]
    users = await db.users.find({}).to_list(length=100)
    for user in users:
        print(f"ID: {user['_id']} | Username: {user.get('username')} | Email: {user.get('email')} | Role: {user.get('role')}")

if __name__ == "__main__":
    asyncio.run(main())
