from typing import List, Optional
from prisma import Prisma
from models.schemas import ScheduleCreate, ScheduleUpdate, ScheduleResponse

class ScheduleService:
    def __init__(self, db: Prisma):
        self.db = db

    async def get_schedules(
        self, 
        course_id: Optional[str] = None, 
        teacher_id: Optional[str] = None
    ) -> List[ScheduleResponse]:
        filters = {}
        if course_id:
            filters['course_id'] = course_id
        if teacher_id:
            filters['teacher_id'] = teacher_id
        
        schedules = await self.db.schedule.find_many(
            where=filters,
            order={'day_of_week': 'asc', 'start_time': 'asc'}
        )
        return [ScheduleResponse.model_validate(schedule) for schedule in schedules]

    async def get_schedule(self, schedule_id: str) -> Optional[ScheduleResponse]:
        schedule = await self.db.schedule.find_unique(where={'id': schedule_id})
        return ScheduleResponse.model_validate(schedule) if schedule else None

    async def create_schedule(self, schedule_data: ScheduleCreate) -> ScheduleResponse:
        schedule = await self.db.schedule.create(
            data={
                'course': {'connect': {'id': schedule_data.course_id}},
                'teacher': {'connect': {'id': schedule_data.teacher_id}},
                'day_of_week': schedule_data.day_of_week,
                'start_time': schedule_data.start_time,
                'end_time': schedule_data.end_time,
                'room': schedule_data.room,
                'building': schedule_data.building,
                'type': schedule_data.type,
                'is_active': schedule_data.is_active
            }
        )
        return ScheduleResponse.model_validate(schedule)

    async def update_schedule(
        self, 
        schedule_id: str, 
        schedule_data: ScheduleUpdate
    ) -> ScheduleResponse:
        schedule = await self.db.schedule.update(
            where={'id': schedule_id},
            data=schedule_data.model_dump(exclude_unset=True)
        )
        return ScheduleResponse.model_validate(schedule)

    async def delete_schedule(self, schedule_id: str) -> bool:
        await self.db.schedule.delete(where={'id': schedule_id})
        return True

    async def get_teacher_schedule(self, teacher_id: str) -> List[ScheduleResponse]:
        """Get all schedules for a specific teacher"""
        schedules = await self.db.schedule.find_many(
            where={'teacher_id': teacher_id},
            order={'day_of_week': 'asc', 'start_time': 'asc'}
        )
        return [ScheduleResponse.model_validate(schedule) for schedule in schedules]

    async def get_course_schedule(self, course_id: str) -> List[ScheduleResponse]:
        """Get all schedules for a specific course"""
        schedules = await self.db.schedule.find_many(
            where={'course_id': course_id},
            order={'day_of_week': 'asc', 'start_time': 'asc'}
        )
        return [ScheduleResponse.model_validate(schedule) for schedule in schedules]