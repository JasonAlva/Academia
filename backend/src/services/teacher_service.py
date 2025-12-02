from typing import List, Optional
from prisma import Prisma
from models.schemas import TeacherCreate, TeacherUpdate, Teacher

class TeacherService:
    def __init__(self, db: Prisma):
        self.db = db

    async def create_teacher(self, teacher_data: TeacherCreate) -> Teacher:
        teacher = await self.db.teacher.create(data=teacher_data.dict())
        return teacher

    async def get_teacher(self, teacher_id: str) -> Optional[Teacher]:
        teacher = await self.db.teacher.find_unique(where={"id": teacher_id})
        return teacher

    async def update_teacher(self, teacher_id: str, teacher_data: TeacherUpdate) -> Optional[Teacher]:
        teacher = await self.db.teacher.update(
            where={"id": teacher_id},
            data=teacher_data.dict(exclude_unset=True)
        )
        return teacher

    async def delete_teacher(self, teacher_id: str) -> Optional[Teacher]:
        teacher = await self.db.teacher.delete(where={"id": teacher_id})
        return teacher

    async def list_teachers(self) -> List[Teacher]:
        teachers = await self.db.teacher.find_many()
        return teachers