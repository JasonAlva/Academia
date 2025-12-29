from typing import List, Optional
from prisma import Prisma
from src.models.schemas import StudentCreate, StudentUpdate
from prisma.models import Student as StudentModel

class StudentService:
    def __init__(self, db: Prisma):
        self.db = db

    async def get_student(self, id: str) -> Optional[StudentModel]:
        student = await self.db.student.find_unique(
            where={"id": id},
            include={"user": True}
        )
        return student

    async def get_student_by_user_id(self, user_id: str) -> Optional[StudentModel]:
        """Get student by their user ID"""
        student = await self.db.student.find_unique(
            where={"userId": user_id},
            include={"user": True}
        )
        return student
    
    async def get_student_by_id(self, student_id: str) -> Optional[StudentModel]:
        """Get student by their student ID"""
        print(student_id)
        student = await self.db.student.find_unique(
            where={"studentId": student_id},
            include={"user": True}
        )
        return student

    async def create_student(self, student_data: StudentCreate) -> StudentModel:
    
        student = await self.db.student.create(
            data=student_data.dict(),
            include={"user": True}
        )
        return student

    async def update_student(self, student_id: str, student_data: StudentUpdate) -> Optional[StudentModel]:
        student_fields = student_data.dict(exclude_unset=True)
        student_fields.pop("name", None) 
        existing = await self.db.student.find_unique(where={"id": student_id})
        if not existing:
            return None
        
        student = await self.db.student.update(
            where={"id": student_id},
            data=student_fields,
            include={"user": True}
        )
        if student_data.name is not None:
            await self.db.user.update(
                where={"id": student.userId},
                data={"name": student_data.name}
            )
        return student

    async def delete_student(self, id: str) -> Optional[StudentModel]:
        # First get the student to find the userId
        student = await self.db.student.find_unique(
            where={"id": id},
            include={"user": True}
        )
        if not student:
            return None
        
        # Delete the user, which will cascade delete the student
        await self.db.user.delete(where={"id": student.userId})
        return student

    async def list_students(self) -> List[StudentModel]:
        students = await self.db.student.find_many(include={"user": True})
        return students