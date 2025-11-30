from typing import List, Optional
from prisma import Prisma
from models.schemas import TeacherCreate, TeacherUpdate, Teacher

class TeacherService:
    def __init__(self):
        self.db = Prisma()

    async def create_teacher(self, teacher_data: TeacherCreate) -> Teacher:
        await self.db.connect()
        teacher = await self.db.teacher.create(data=teacher_data.dict())
        await self.db.disconnect()
        return teacher

    async def get_teacher(self, teacher_id: str) -> Optional[Teacher]:
        await self.db.connect()
        teacher = await self.db.teacher.find_unique(where={"id": teacher_id})
        await self.db.disconnect()
        return teacher

    async def update_teacher(self, teacher_id: str, teacher_data: TeacherUpdate) -> Optional[Teacher]:
        await self.db.connect()
        teacher = await self.db.teacher.update(
            where={"id": teacher_id},
            data=teacher_data.dict(exclude_unset=True)
        )
        await self.db.disconnect()
        return teacher

    async def delete_teacher(self, teacher_id: str) -> Optional[Teacher]:
        await self.db.connect()
        teacher = await self.db.teacher.delete(where={"id": teacher_id})
        await self.db.disconnect()
        return teacher

    async def list_teachers(self) -> List[Teacher]:
        await self.db.connect()
        teachers = await self.db.teacher.find_many()
        await self.db.disconnect()
        return teachers