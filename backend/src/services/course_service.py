from typing import List, Optional
from prisma import Prisma
from prisma.models import Course

class CourseService:
    def __init__(self, db: Prisma):
        self.db = db

    async def get_all_courses(self) -> List[Course]:
        return await self.db.course.find_many()

    async def get_course_by_id(self, course_id: str) -> Optional[Course]:
        return await self.db.course.find_unique(where={"id": course_id})

    async def create_course(self, course_data: dict) -> Course:
        return await self.db.course.create(data=course_data)

    async def update_course(self, course_id: str, course_data: dict) -> Optional[Course]:
        return await self.db.course.update(
            where={"id": course_id},
            data=course_data
        )

    async def delete_course(self, course_id: str) -> Course:
        return await self.db.course.delete(where={"id": course_id})