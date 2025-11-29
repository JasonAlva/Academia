from prisma import Prisma

prisma=Prisma()


async def get_db():
    if not prisma.is_connected():
        await prisma.connect()
    return prisma

async def connect_to_database():
    await prisma.connect()

async def disconnect_to_database():
    await prisma.disconnect()