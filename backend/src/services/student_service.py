from typing import List, Optional
from prisma import Prisma
from models.schemas import StudentCreate, StudentUpdate, Student as StudentModel

class StudentService:
    def __init__(self):
        self.db = Prisma()

    async def get_student(self, student_id: str) -> Optional[StudentModel]:
        await self.db.connect()
        student = await self.db.student.find_unique(where={"id": student_id})
        await self.db.disconnect()
        return student

    async def create_student(self, student_data: StudentCreate) -> StudentModel:
        await self.db.connect()
        student = await self.db.student.create(data=student_data.dict())
        await self.db.disconnect()
        return student

    async def update_student(self, student_id: str, student_data: StudentUpdate) -> Optional[StudentModel]:
        await self.db.connect()
        student = await self.db.student.update(
            where={"id": student_id},
            data=student_data.dict(exclude_unset=True)
        )
        await self.db.disconnect()
        return student

    async def delete_student(self, student_id: str) -> Optional[StudentModel]:
        await self.db.connect()
        student = await self.db.student.delete(where={"id": student_id})
        await self.db.disconnect()
        return student

    async def list_students(self) -> List[StudentModel]:
        await self.db.connect()
        students = await self.db.student.find_many()
        await self.db.disconnect()
        return students