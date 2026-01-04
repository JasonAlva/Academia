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
        PERIODS = 8
        
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
    
    async def get_student_timetable_grid(self, studentId: str) -> List[List[Optional[List[str]]]]:
        """
        Get teacher's timetable in grid format
        Returns: List[day][period] = [teacher, subject, room] or None
        Structure: 5 days, 9 periods
        """
        DAYS = 5
        PERIODS = 8
        
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
        
        enrollments=await self.db.enrollment.find_many(where={
            "studentId":studentId
        },
        include={
            'course':True
        })
        
        courses_list=[e.courseId for e in enrollments ]
        # Fetch student's schedules
        schedules = await self.db.schedule.find_many(
            where={'courseId': {
                'in':courses_list
            }},
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
        """Convert time string like '10:00 AM' to period index (0-7)
        Matches frontend TIME_SLOTS structure"""
        try:
            # Remove extra spaces and convert to uppercase
            time_str = time_str.strip().upper()
            
            # Normalize the time string (add space before AM/PM if missing)
            time_str = time_str.replace('AM', ' AM').replace('PM', ' PM')
            time_str = time_str.replace('  ', ' ').strip()
            
            # Parse time
            if 'AM' in time_str or 'PM' in time_str:
                time_part = time_str.replace('AM', '').replace('PM', '').strip()
                time_parts = time_part.split(':')
                hour = int(time_parts[0])
                minute = int(time_parts[1]) if len(time_parts) > 1 else 0
                
                if 'PM' in time_str and hour != 12:
                    hour += 12
                elif 'AM' in time_str and hour == 12:
                    hour = 0
            else:
                # Assume 24-hour format
                time_parts = time_str.split(':')
                hour = int(time_parts[0])
                minute = int(time_parts[1]) if len(time_parts) > 1 else 0
            
            # Map to periods matching frontend structure
            # Period 0: 9:00-10:00
            # Period 1: 10:00-11:00
            # Period 2: 11:00-11:30 (Break)
            # Period 3: 11:30-12:30
            # Period 4: 12:30-13:30
            # Period 5: 13:30-14:30 (Break)
            # Period 6: 14:30-15:30
            # Period 7: 15:30-16:30
            
            print(f"Parsing time: '{time_str}' -> hour={hour}, minute={minute}")
            
            if hour == 9 and minute == 0:
                return 0
            elif hour == 10 and minute == 0:
                return 1
            elif hour == 11 and minute == 0:
                return 2  # Break
            elif hour == 11 and minute == 30:
                return 3
            elif hour == 12 and minute == 30:
                return 4
            elif hour == 13 and minute == 30:
                return 5  # Break
            elif hour == 14 and minute == 30:
                return 6
            elif hour == 15 and minute == 30:
                return 7
            else:
                print(f"Warning: Time {hour}:{minute:02d} doesn't match any period slot")
                return None
            
        except Exception as e:
            print(f"Error parsing time '{time_str}': {e}")
            import traceback
            traceback.print_exc()
            return None

    async def get_full_timetable(self, department_id: Optional[str] = None) -> List[List[List[List[Optional[List[str]]]]]]:
        """
        Returns: List[semester][section][day][period] = [teacher, subject, room] or None
        Structure: 8 semesters, 2 sections each, 5 days, 8 periods
        """
        print(f"Getting full timetable for department: {department_id}")
        
        SEMESTERS = 8
        SECTIONS_PER_SEM = 2
        DAYS = 5
        PERIODS = 8
        
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

        # Build filter for schedules
        where_clause = {}
        if department_id:
            where_clause['course'] = {
                'departmentId': department_id
            }
        
        # Fetch schedules with relations
        schedules = await self.db.schedule.find_many(
            where=where_clause,
            include={
                "course": {
                    "include": {
                        "department": True
                    }
                },
                "teacher": {
                    "include": {"user": True}
                }
            }
        )
        
        print(f"Found {len(schedules)} schedules")
        
        # Debug: print all schedules
        for s in schedules:
            print(f"Schedule: Course={s.course.courseCode}, Semester={s.course.semester}, Day={s.dayOfWeek}, Time={s.startTime}, Room={s.room}")

        # Fill timetable dynamically
        for s in schedules:
            # Semester from course
            semester_idx = s.course.semester - 1
            if semester_idx < 0 or semester_idx >= SEMESTERS:
                print(f"❌ Skipping schedule - invalid semester: {s.course.semester}")
                continue

            # Section logic (simple default - you may need to adjust this)
            section_idx = 0  # TODO: derive from batch/department if available

            # Day index
            day_idx = DAY_INDEX.get(s.dayOfWeek)
            if day_idx is None:
                print(f"❌ Skipping schedule - invalid day: {s.dayOfWeek}")
                continue

            # Period index from time
            period_idx = self._parse_time_to_period(s.startTime)
            if period_idx is None:
                print(f"❌ Skipping schedule - invalid time: {s.startTime}")
                continue

            print(f"✅ Adding schedule: Sem={semester_idx}, Sec={section_idx}, Day={day_idx}, Period={period_idx}, Course={s.course.courseCode}, Room={s.room}")

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
        timetable: List[List[Optional[List[str]]]],
        department_id: Optional[str] = None
    ) -> bool:
        """
        Save timetable for a specific semester and section
        timetable: List[day][period] = [teacher, subject, room] or None
        """
        print(f"Saving timetable for semester {semester}, section {section}")
        
        # Day mapping
        DAY_NAMES = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]
        
        # Time mapping to match frontend (8 periods with breaks at indices 2 and 5)
        PERIOD_TIMES = [
            ("09:00 AM", "10:00 AM"),  # Period 0
            ("10:00 AM", "11:00 AM"),  # Period 1
            ("11:00 AM", "11:30 AM"),  # Period 2 (Break)
            ("11:30 AM", "12:30 PM"),  # Period 3
            ("12:30 PM", "01:30 PM"),  # Period 4
            ("01:30 PM", "02:30 PM"),  # Period 5 (Lunch Break)
            ("02:30 PM", "03:30 PM"),  # Period 6
            ("03:30 PM", "04:30 PM"),  # Period 7
        ]
        
        # Break periods (these should be skipped when saving)
        BREAK_PERIODS = [2, 5]
        
        try:
            # Process each period in the timetable
            for day_idx, day_schedule in enumerate(timetable):
                if not day_schedule or day_idx >= len(DAY_NAMES):
                    continue
                    
                day_of_week = DAY_NAMES[day_idx]
                
                for period_idx, period_data in enumerate(day_schedule):
                    if not period_data or period_idx >= len(PERIOD_TIMES):
                        continue
                    
                    # Skip break periods
                    if period_idx in BREAK_PERIODS:
                        continue
                    
                    # period_data = [teacher_name, course_code, room]
                    if len(period_data) < 3:
                        continue
                        
                    teacher_name, course_code, room = period_data[0], period_data[1], period_data[2]
                    
                    print(f"Processing: Day={day_of_week}, Period={period_idx}, Teacher={teacher_name}, Course={course_code}, Room={room}")
                    
                    if not course_code or course_code.strip() == "":
                        print(f"  ⚠️ Skipping: Empty course code")
                        continue
                    
                    # Find course by code
                    print(f"  🔍 Looking for course: code={course_code}, semester={semester}")
                    course = await self.db.course.find_first(
                        where={'courseCode': course_code, 'semester': semester}
                    )
                    
                    if not course:
                        print(f"  ❌ Warning: Course {course_code} not found for semester {semester}")
                        # Debug: Check what courses exist
                        all_courses_with_code = await self.db.course.find_many(
                            where={'courseCode': course_code}
                        )
                        if all_courses_with_code:
                            print(f"  📚 Found {len(all_courses_with_code)} course(s) with code {course_code} but different semesters:")
                            for c in all_courses_with_code:
                                print(f"      - Semester {c.semester}, Dept: {c.departmentId}")
                        else:
                            print(f"  📚 No courses found with code {course_code} at all")
                        continue
                        continue
                    else:
                        print(f"  ✓ Found course: {course.id} - {course.courseName}")
                    
                    # If department filter is provided, verify course belongs to that department
                    if department_id and course.departmentId != department_id:
                        print(f"  ❌ Skipping course {course_code} - not in department {department_id}")
                        continue
                    
                    # Find teacher by name (if provided)
                    teacher = None
                    if teacher_name and teacher_name != "Unknown" and teacher_name != "TBA":
                        # Handle multiple teachers (teacher1+teacher2)
                        teacher_names = teacher_name.split('+')
                        # For simplicity, use first teacher
                        first_teacher_name = teacher_names[0].strip()
                        
                        teacher_user = await self.db.user.find_first(
                            where={'name': first_teacher_name, 'role': 'TEACHER'},
                            include={'teacherProfile': True}
                        )
                        
                        if teacher_user and teacher_user.teacherProfile:
                            teacher = teacher_user.teacherProfile
                    
                    # Get time for this period
                    start_time, end_time = PERIOD_TIMES[period_idx]
                    
                    # Check if schedule already exists
                    existing_schedule = await self.db.schedule.find_first(
                        where={
                            'courseId': course.id,
                            'dayOfWeek': day_of_week,
                            'startTime': start_time
                        }
                    )
                    
                    schedule_data = {
                        'courseId': course.id,
                        'teacherId': teacher.id if teacher else course.teacherId,
                        'dayOfWeek': day_of_week,
                        'startTime': start_time,
                        'endTime': end_time,
                        'room': room or 'TBA',
                        'building': 'Main',  # Default building
                        'type': 'LECTURE',
                        'isActive': True
                    }
                    
                    print(f"  Schedule data: {schedule_data}")
                    
                    if existing_schedule:
                        # Update existing schedule
                        await self.db.schedule.update(
                            where={'id': existing_schedule.id},
                            data=schedule_data
                        )
                        print(f"  ✅ Updated schedule: {course_code} on {day_of_week} at {start_time}")
                    else:
                        # Create new schedule
                        created_schedule = await self.db.schedule.create(data=schedule_data)
                        print(f"  ✅ Created schedule: ID={created_schedule.id}, {course_code} on {day_of_week} at {start_time}")
            
            print(f"✅ Timetable saved successfully for semester {semester}, section {section}")
            return True
            
        except Exception as e:
            print(f"Error saving timetable: {str(e)}")
            raise

    