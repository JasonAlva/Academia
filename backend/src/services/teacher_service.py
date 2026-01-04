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
    
    async def get_teacher_by_user_id(self, user_id: str) -> Optional[Teacher]:
        teacher = await self.db.teacher.find_unique(
            where={"userId": user_id},
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
        
        
        # await self.db.schedule.delete_many(where={"teacherId": teacher_id})

        
        await self.db.teacher.delete(where={"id": teacher_id})
        await self.db.user.delete(where={"id": teacher.userId})
        
        return teacher

    async def list_teachers(self) -> List[Teacher]:
        teachers = await self.db.teacher.find_many(include={"user": True})
        return teachers

    async def get_teacher_courses(self, teacher_id: str):
        """Get all courses taught by a specific teacher."""
        courses = await self.db.course.find_many(
            where={"teacherId": teacher_id},
            include={
                "department": True,
                "enrollments": True,
                "teacher": {"include": {"user": True}}
            }
        )
        return courses

    async def get_teacher_courses_with_students(self, teacher_id: str):
        """Get all courses taught by a teacher with enrolled students."""
        courses = await self.db.course.find_many(
            where={"teacherId": teacher_id, "isActive": True},
            include={
                "department": True,
                "enrollments": {
                    "where": {"status": "ACTIVE"},
                    "include": {
                        "student": {
                            "include": {"user": True}
                        }
                    }
                },
                "teacher": {"include": {"user": True}}
            },
            order={"semester": "asc"}
        )
        return courses
    
    async def get_students_belongs_to_course(self, teacher_id: str, course_id: str):
        """Get all students enrolled in a specific course taught by a specific teacher."""
        students = await self.db.student.find_many(
            where={
                "enrollments": {
                    "some": {
                        "course": {
                            "id": course_id,
                            "teacherId": teacher_id,
                        }
                    }
                }
            },
            include={
                "user": True
            }
        )
        return students