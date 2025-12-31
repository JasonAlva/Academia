from typing import List, Optional, Dict, Any
from prisma import Prisma
from src.models.schemas import ScheduleCreate, ScheduleUpdate, ScheduleResponse

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
            filters['courseId'] = course_id
        if teacher_id:
            filters['teacherId'] = teacher_id
        
        schedules = await self.db.schedule.find_many(
            where=filters,
            order=[
                {'dayOfWeek': 'asc'},
                {'startTime': 'asc'}
            ]
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
                'dayOfWeek': schedule_data.day_of_week,
                'startTime': schedule_data.start_time,
                'endTime': schedule_data.end_time,
                'room': schedule_data.room,
                'building': schedule_data.building,
                'type': schedule_data.type,
            }
        )
        return ScheduleResponse.model_validate(schedule)

    async def update_schedule(
        self, 
        schedule_id: str, 
        schedule_data: ScheduleUpdate
    ) -> ScheduleResponse:
        update_data = schedule_data.model_dump(exclude_unset=True)
        schedule = await self.db.schedule.update(
            where={'id': schedule_id},
            data=update_data
        )
        return ScheduleResponse.model_validate(schedule)

    async def delete_schedule(self, schedule_id: str) -> bool:
        await self.db.schedule.delete(where={'id': schedule_id})
        return True

    async def get_teacher_schedule(self, teacher_id: str) -> List[ScheduleResponse]:
        return await self.get_schedules(teacher_id=teacher_id)

    async def get_teacher_timetable_grid(self, teacher_id: str) -> List[List[Optional[List[str]]]]:
        """
        Get teacher's timetable in grid format
        Returns: List[day][period] = [teacher, subject, room] or None
        Structure: 5 days, 9 periods
        """
        DAYS = 5
        PERIODS = 9
        
        # Day mapping
        DAY_INDEX = {
            "MONDAY": 0,
            "TUESDAY": 1,
            "WEDNESDAY": 2,
            "THURSDAY": 3,
            "FRIDAY": 4
        }
        
        # Initialize empty timetable
        timetable = [[None for _ in range(PERIODS)] for _ in range(DAYS)]
        
        # Fetch teacher's schedules
        schedules = await self.db.schedule.find_many(
            where={'teacherId': teacher_id},
            include={
                'course': True,
                'teacher': {
                    'include': {'user': True}
                }
            }
        )
        
        # Fill timetable
        for s in schedules:
            day_idx = DAY_INDEX.get(s.dayOfWeek)
            if day_idx is None:
                continue
                
            period_idx = self._parse_time_to_period(s.startTime)
            if period_idx is None:
                continue
            
            timetable[day_idx][period_idx] = [
                s.teacher.user.name if s.teacher and s.teacher.user else "Unknown",
                s.course.courseCode,
                s.room or "TBA"
            ]
        
        return timetable

    async def get_course_schedule(self, course_id: str) -> List[ScheduleResponse]:
        return await self.get_schedules(course_id=course_id)

    def _parse_time_to_period(self, time_str: str) -> Optional[int]:
        """Convert time string like '10:00 AM' to period index (0-8)"""
        try:
            # Remove spaces and convert to uppercase
            time_str = time_str.strip().upper()
            
            # Parse time
            if 'AM' in time_str or 'PM' in time_str:
                time_part = time_str.replace('AM', '').replace('PM', '').strip()
                hour = int(time_part.split(':')[0])
                
                if 'PM' in time_str and hour != 12:
                    hour += 12
                elif 'AM' in time_str and hour == 12:
                    hour = 0
            else:
                # Assume 24-hour format
                hour = int(time_str.split(':')[0])
            
            # Map hour to period (assuming periods start at 9:00 AM)
            # Period 0: 9:00, Period 1: 10:00, etc.
            if 9 <= hour <= 17:
                return hour - 9
            
            return None
        except:
            return None

    async def get_full_timetable(self) -> List[List[List[List[Optional[List[str]]]]]]:
        """
        Returns: List[semester][section][day][period] = [teacher, subject, room] or None
        Structure: 4 semesters, 2 sections each, 5 days, 9 periods
        """
        print("Getting full timetable...")
        
        SEMESTERS = 4
        SECTIONS_PER_SEM = 2
        DAYS = 5
        PERIODS = 9
        
        # Day mapping
        DAY_INDEX = {
            "MONDAY": 0,
            "TUESDAY": 1,
            "WEDNESDAY": 2,
            "THURSDAY": 3,
            "FRIDAY": 4
        }

        # Initialize empty timetable
        timetable = [
            [
                [[None for _ in range(PERIODS)] for _ in range(DAYS)]
                for _ in range(SECTIONS_PER_SEM)
            ]
            for _ in range(SEMESTERS)
        ]

        # Fetch schedules with relations
        schedules = await self.db.schedule.find_many(
            include={
                "course": True,
                "teacher": {
                    "include": {"user": True}
                }
            }
        )
        
        print(f"Found {len(schedules)} schedules")

        # Fill timetable dynamically
        for s in schedules:
            # Semester from course
            semester_idx = s.course.semester - 1
            if semester_idx < 0 or semester_idx >= SEMESTERS:
                print(f"Skipping schedule - invalid semester: {s.course.semester}")
                continue

            # Section logic (simple default - you may need to adjust this)
            section_idx = 0  # TODO: derive from batch/department if available

            # Day index
            day_idx = DAY_INDEX.get(s.dayOfWeek)
            if day_idx is None:
                print(f"Skipping schedule - invalid day: {s.dayOfWeek}")
                continue

            # Period index from time
            period_idx = self._parse_time_to_period(s.startTime)
            if period_idx is None:
                print(f"Skipping schedule - invalid time: {s.startTime}")
                continue

            print(f"Adding schedule: Sem={semester_idx}, Sec={section_idx}, Day={day_idx}, Period={period_idx}, Course={s.course.courseCode}")

            # Add schedule to timetable
            timetable[semester_idx][section_idx][day_idx][period_idx] = [
                s.teacher.user.name if s.teacher and s.teacher.user else "Unknown",
                s.course.courseCode,
                s.room or "TBA"
            ]

        print(f"Timetable populated successfully")
        return timetable

    async def get_subjects_details(self) -> Dict[str, Any]:
        """Get subject details with teacher names and room codes"""
        print("Getting subjects details...")
        
        courses = await self.db.course.find_many(
            include={
                'teacher': {
                    'include': {
                        'user': True
                    }
                }
            }
        )
        
        print(f"Found {len(courses)} courses")
        
        subjects_details = {}
        
        for course in courses:
            # Get teacher name
            teacher_name = "Unassigned"
            if course.teacher and course.teacher.user:
                teacher_name = course.teacher.user.name
            
            # Get room codes from schedules
            schedules = await self.db.schedule.find_many(
                where={'courseId': course.id}
            )
            
            room_codes = list(set([s.room for s in schedules if s.room]))
            
            subjects_details[course.courseCode] = {
                'subjectName': course.courseName,
                'teacherName': teacher_name,
                'roomCodes': room_codes if room_codes else ['TBA'],
                'color': None  # You can add color logic here
            }
        
        print(f"Returning {len(subjects_details)} subject details")
        return subjects_details

    async def save_timetable(
        self, 
        semester: int, 
        section: int, 
        timetable: List[List[Optional[List[str]]]]
    ) -> bool:
        """
        Save timetable for a specific semester and section
        timetable: List[day][period] = [teacher, subject, room] or None
        """
        print(f"Saving timetable for semester {semester}, section {section}")
        
        # TODO: Implement actual save logic
        # You'll need to:
        # 1. Delete existing schedules for this semester/section
        # 2. Create new schedules from the timetable data
        # 3. Map teacher names and subject codes to IDs
        
        # For now, just return True
        return True

    async def generate_timetable(self) -> List[List[List[List[Optional[List[str]]]]]]:
        """
        Generate timetable automatically using AI/algorithm
        This is a placeholder - implement your generation logic here
        """
        print("Generating timetable...")
        
        # For now, return the empty structure
        return await self.get_full_timetable()