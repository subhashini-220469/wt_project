import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def main():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    dbs = await client.list_database_names()
    print(f"Databases found: {dbs}")
    for db_name in dbs:
        db = client[db_name]
        try:
            collections = await db.list_collection_names()
            print(f"  {db_name}: {collections}")
            if "users" in collections:
                count = await db.users.count_documents({})
                print(f"    - Found users collection with {count} docs")
        except Exception as e:
            print(f"    - Error listing collections for {db_name}: {e}")

if __name__ == "__main__":
    asyncio.run(main())
