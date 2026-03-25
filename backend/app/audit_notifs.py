import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def main():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["resume_screening"]
    count = await db.notifications.count_documents({})
    print(f"Total notifications: {count}")
    notifs = await db.notifications.find({}).sort("created_at", -1).to_list(length=10)
    for n in notifs:
        print(f"TO: {n.get('user_email')} | MSG: {n.get('message')} | TYPE: {n.get('type')}")

if __name__ == "__main__":
    asyncio.run(main())
