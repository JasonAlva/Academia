from prisma import Prisma

# Shared database instance
db = Prisma()

async def get_db()->Prisma:
    if not db.is_connected():
        await db.connect()
    return db

async def connect_db():
    """Connect to the database"""
    if not db.is_connected():
        await db.connect()
    print("✅ Database connected")

async def disconnect_db():
    """Disconnect from the database"""
    if db.is_connected():
        await db.disconnect()
    print("❌ Database disconnected")