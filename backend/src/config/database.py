from prisma import Prisma

prisma=Prisma()


async def get_db()->Prisma:
    if not prisma.is_connected():
        await prisma.connect()
    return prisma

async def connect_to_database():
    await prisma.connect()
    print("✅ Database connected")

async def disconnect_to_database():
    await prisma.disconnect()
    print("❌ Database disconnected")