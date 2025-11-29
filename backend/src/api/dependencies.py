from fastapi import HTTPException, Depends
from prisma import Prisma
from src.config.database import get_db
from src.services.auth


async def get_current_student(db:Prisma=Depends(get_db),current_user=Depends(get_current_user)):
    student =await db.student.find_first(where={
        "userId":current_user.id
    })

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

async def get_current_teacher(
    db: Prisma = Depends(get_db),
    current_user = Depends(get_current_user)
):
    teacher = await db.teacher.find_first(
        where={"userId": current_user.id}
    )
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return teacher


async def get_current_admin(
    db: Prisma = Depends(get_db),
    current_user = Depends(get_current_user)
):
    admin = await db.admin.find_first(
        where={"userId": current_user.id}
    )
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    return admin

    


