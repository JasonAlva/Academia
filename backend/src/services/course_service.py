from typing import List, Optional
from prisma import Prisma
from prisma.models import Course
from src.models.schemas import CourseCreate, CourseUpdate, CourseResponse, CourseOut

class CourseService:
    def __init__(self, db: Prisma):
        self.db = db

    async def get_all_courses(self) -> List[Course]:
        courses = await self.db.course.find_many(
            include={
                "teacher": {
                    "include": {"user": True}
                },
                "department": True
            }
        )
        return courses

    async def get_course_by_id(self, course_id: str) -> Optional[Course]:
        course = await self.db.course.find_unique(
            where={"id": course_id},
            include={
                "teacher": {
                    "include": {"user": True}
                },
                "department": True
            }
        )
        return course

    async def create_course(self, course_data: CourseCreate) -> Course:
        course = await self.db.course.create(
            data=course_data.model_dump(by_alias=True, exclude_unset=True)
        )
        return course

    async def update_course(self, course_id: str, course_data: CourseUpdate) -> Optional[Course]:
        course = await self.db.course.update(
            where={"id": course_id},
            data=course_data.model_dump(by_alias=True, exclude_unset=True)
        )
        return course

    async def delete_course(self, course_id: str) -> Course:
        course = await self.db.course.delete(where={"id": course_id})
        return course