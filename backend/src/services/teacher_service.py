from typing import List, Optional
from prisma import Prisma
from src.models.schemas import TeacherCreate, TeacherUpdate
from prisma.models import Teacher

class TeacherService:
    def __init__(self, db: Prisma):
        self.db = db

    async def create_teacher(self, teacher_data: TeacherCreate) -> Teacher:
        teacher = await self.db.teacher.create(data=teacher_data.dict())
        return teacher

    async def get_teacher(self, teacher_id: str) -> Optional[Teacher]:
        teacher = await self.db.teacher.find_unique(
            where={"id": teacher_id},
            include={"user": True}
        )
        return teacher

    async def update_teacher(self, teacher_id: str, teacher_data: TeacherUpdate) -> Optional[Teacher]:
        teacher = await self.db.teacher.update(
            where={"id": teacher_id},
            data=teacher_data.dict(exclude_unset=True)
        )
        return teacher

    async def delete_teacher(self, teacher_id: str) -> Optional[Teacher]:
        teacher = await self.db.teacher.find_unique(
            where={"id": teacher_id},
            include={"user": True}
        )
        if not teacher:
            return None
        
   
        await self.db.user.delete(where={"id": teacher.userId})
        return teacher

    async def list_teachers(self) -> List[Teacher]:
        teachers = await self.db.teacher.find_many(include={"user": True})
        return teachers