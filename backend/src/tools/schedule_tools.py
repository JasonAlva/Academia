from langchain_core.tools import tool
from src.services.schedule_service import ScheduleService
from src.services.teacher_service import TeacherService
from src.models.schemas import (
    ScheduleCreate,
    ScheduleUpdate,
    ScheduleResponse,
    SaveScheduleRequest,
    GenerateTimeTableRequest
)
from src.config.database import prisma
from typing import Optional


@tool
async def list_all_schedules(
    course_code: Optional[str] = None,
    teacher_id: Optional[str] = None
):
    """Get all schedules from the database. Can optionally filter by course code or teacher ID.
    Use this when user asks to see all schedules, list schedules, or show class schedules.
    
    Args:
        course_code: Optional course code (e.g., 'CS101', 'MATH201') to filter schedules
        teacher_id: Optional teacherId (e.g., 'T001', 'T002') to filter schedules
    """
    print(f"[SCHEDULE_TOOL] Listing schedules: course_code={course_code}, teacher_id={teacher_id}")
    service = ScheduleService(prisma)
    
    # Resolve course code to course ID if provided
    resolved_course_id = None
    if course_code:
        print(f"[SCHEDULE_TOOL] Looking up course by code: {course_code}")
        course = await prisma.course.find_first(
            where={"courseCode": {"equals": course_code, "mode": "insensitive"}}
        )
        if course:
            resolved_course_id = course.id
            print(f"[SCHEDULE_TOOL] Found course: {course.courseName} (ID: {course.id})")
        else:
            print(f"[SCHEDULE_TOOL] Course not found with code: {course_code}")
            return {"error": f"Course not found with code: {course_code}"}
    
    # Resolve teacherId to internal ID if provided
    resolved_teacher_id = None
    if teacher_id:
        print(f"[SCHEDULE_TOOL] Looking up teacher by teacherId: {teacher_id}")
        teacher = await prisma.teacher.find_first(
            where={"teacherId": {"equals": teacher_id, "mode": "insensitive"}}
        )
        if teacher:
            resolved_teacher_id = teacher.id
            print(f"[SCHEDULE_TOOL] Found teacher (ID: {teacher.id})")
        else:
            print(f"[SCHEDULE_TOOL] Teacher not found with teacherId: {teacher_id}")
            return {"error": f"Teacher not found with teacherId: {teacher_id}"}
    
    schedules = await service.get_schedules(course_id=resolved_course_id, teacher_id=resolved_teacher_id)
    print(f"[SCHEDULE_TOOL] Found {len(schedules)} schedules")
    return [schedule.model_dump() for schedule in schedules]


@tool
async def get_schedule_by_details(
    course_code: str,
    teacher_id: str,
    day_of_week: str,
    start_time: str
):
    """Get a specific schedule by course code, teacher ID, day of week, and start time.
    This is more user-friendly than requiring the internal schedule ID.
    
    Args:
        course_code: The course code (e.g., 'CS101', 'MATH201')
        teacher_id: The teacherId (e.g., 'T001', 'T002')
        day_of_week: Day of the week (e.g., 'MONDAY', 'TUESDAY', etc.)
        start_time: Start time of the class (e.g., '09:00', '10:00')
    """
    print(f"[SCHEDULE_TOOL] Finding schedule: {course_code}, {teacher_id}, {day_of_week}, {start_time}")
    
    try:
        # Find course by code
        course = await prisma.course.find_first(
            where={"courseCode": {"equals": course_code, "mode": "insensitive"}}
        )
        if not course:
            print(f"[SCHEDULE_TOOL] Course not found: {course_code}")
            return {"error": f"Course not found with code: {course_code}"}
        
        # Find teacher by teacherId
        teacher = await prisma.teacher.find_first(
            where={"teacherId": {"equals": teacher_id, "mode": "insensitive"}}
        )
        if not teacher:
            print(f"[SCHEDULE_TOOL] Teacher not found: {teacher_id}")
            return {"error": f"Teacher not found with teacherId: {teacher_id}"}
        
        print(f"[SCHEDULE_TOOL] Found course: {course.courseName}, teacher ID: {teacher.id}")
        
        # Find schedule with these parameters
        schedule = await prisma.schedule.find_first(
            where={
                "courseId": course.id,
                "teacherId": teacher.id,
                "dayOfWeek": {"equals": day_of_week.upper()},
                "startTime": start_time
            },
            include={
                "course": True,
                "teacher": {"include": {"user": True}}
            }
        )
        
        if not schedule:
            print(f"[SCHEDULE_TOOL] Schedule not found with provided details")
            return {"error": "Schedule not found with provided details"}
        
        print(f"[SCHEDULE_TOOL] Found schedule: {schedule.id}")
        return {
            "id": schedule.id,
            "courseId": schedule.courseId,
            "courseCode": course.courseCode,
            "courseName": course.courseName,
            "teacherId": schedule.teacherId,
            "teacherName": teacher.user.name if teacher.user else None,
            "dayOfWeek": schedule.dayOfWeek,
            "startTime": schedule.startTime,
            "endTime": schedule.endTime,
            "room": schedule.room,
            "building": schedule.building,
            "type": schedule.type,
            "isActive": schedule.isActive
        }
    except Exception as e:
        print(f"[SCHEDULE_TOOL] Error finding schedule: {str(e)}")
        return {"error": f"Failed to find schedule: {str(e)}"}


@tool
async def get_teacher_schedule(teacher_id: str):
    """Get all schedules for a specific teacher.
    
    Args:
        teacher_id: The unique identifier of the teacher
    """
    teacher_service=TeacherService(prisma)
    teacher=await teacher_service.get_teacher_by_teacher_id(teacher_id)
    service = ScheduleService(prisma)
    schedules = await service.get_teacher_schedule(teacher.id)
    return [schedule.model_dump() for schedule in schedules]


@tool
async def get_teacher_timetable_grid(teacher_id: str):
    """
    Get teacher's timetable in grid format.
    Returns a 2D structure: [day][period] = [teacher, subject, room] or None
    Structure: 5 days (Mon-Fri), 8 periods per day.
    
    Args:
        teacher_id: The unique identifier of the teacher. (required)
    
    Use this when user asks for a teacher's timetable in grid/table format.
    """
    service = ScheduleService(prisma)
    try:
        timetable = await service.get_teacher_timetable_grid(teacher_id)
        return {
            "success": True,
            "timetable": timetable,
            "structure": {
                "days": 5,
                "periods": 8
            }
        }
    except Exception as e:
        return {"error": f"Failed to get teacher timetable: {str(e)}"}


@tool
async def get_student_timetable_grid(student_id: str):
    """
    Get student's timetable in grid format.
    Returns a 2D structure: [day][period] = [teacher, subject, room] or None
    Structure: 5 days (Mon-Fri), 8 periods per day.
    
    Args:
        student_id: The unique identifier of the student. (required)
    
    Use this when user asks for a student's timetable in grid/table format.
    """
    service = ScheduleService(prisma)
    try:
        timetable = await service.get_student_timetable_grid(student_id)
        return {
            "success": True,
            "timetable": timetable,
            "structure": {
                "days": 5,
                "periods": 8
            }
        }
    except Exception as e:
        return {"error": f"Failed to get student timetable: {str(e)}"}


@tool
async def get_course_schedule(course_id: str):
    """Get all schedules for a specific course.
    
    Args:
        course_id: The unique identifier of the course
    """
    service = ScheduleService(prisma)
    schedules = await service.get_course_schedule(course_id)
    return [schedule.model_dump() for schedule in schedules]


@tool
async def create_new_schedule(
    course_code: str,
    teacher_id: str,
    day_of_week: str,
    start_time: str,
    end_time: str,
    room: str,
    building: str = None,
    type: str = "LECTURE",
    is_active: bool = True
):
    """
    Create a new schedule entry in the database.

    Args:
        course_code (str): Course code (e.g., 'CS101', 'MATH201'). (required)
        teacher_id (str): Teacher ID (e.g., 'T001', 'T002'). (required)
        day_of_week (str): Day of the week (MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY). (required)
        start_time (str): Start time (e.g., '09:00', '10:00'). (required)
        end_time (str): End time (e.g., '10:00', '11:00'). (required)
        room (str): Room number or code (e.g., 'R101', 'LAB-1'). (required)
        building (str): Building name or code. (optional)
        type (str): Type of class (LECTURE, LAB, TUTORIAL). (optional, default='LECTURE')
        is_active (bool): Whether the schedule is active. (optional, default=True)
    """
    print(f"[SCHEDULE_TOOL] Creating schedule: {course_code}, {teacher_id}, {day_of_week}")
    service = ScheduleService(prisma)
    
    try:
        # Find course by code
        course = await prisma.course.find_first(
            where={"courseCode": {"equals": course_code, "mode": "insensitive"}}
        )
        if not course:
            print(f"[SCHEDULE_TOOL] Course not found: {course_code}")
            return {"error": f"Course not found with code: {course_code}"}
        
        # Find teacher by teacherId
        teacher = await prisma.teacher.find_first(
            where={"teacherId": {"equals": teacher_id, "mode": "insensitive"}}
        )
        if not teacher:
            print(f"[SCHEDULE_TOOL] Teacher not found: {teacher_id}")
            return {"error": f"Teacher not found with teacherId: {teacher_id}"}
        
        print(f"[SCHEDULE_TOOL] Found course: {course.courseName}, teacher: {teacher.id}")
        
        # Create schedule using correct field names from schema
        schedule_data = ScheduleCreate(
            course_id=course.id,      # Python field name is course_id
            teacherId=teacher.id,      # Python field name is teacherId
            day_of_week=day_of_week.upper(),
            start_time=start_time,
            end_time=end_time,
            room=room,
            building=building,
            type=type,
            is_active=is_active
        )
        
        new_schedule = await service.create_schedule(schedule_data)
        print(f"[SCHEDULE_TOOL] Schedule created successfully: {new_schedule.id}")
        return new_schedule.model_dump()
    except Exception as e:
        print(f"[SCHEDULE_TOOL] Failed to create schedule: {str(e)}")
        return {"error": f"Failed to create schedule: {str(e)}"}


@tool
async def update_existing_schedule(
    course_code: str,
    teacher_id: str,
    day_of_week: str,
    start_time: str,
    new_end_time: str = None,
    new_room: str = None,
    new_building: str = None,
    new_type: str = None,
    is_active: bool = None
):
    """Update an existing schedule's information by finding it using course code, teacher ID, day, and time.
    
    Args:
        course_code (str): Course code to find the schedule (e.g., 'CS101'). (required)
        teacher_id (str): Teacher ID to find the schedule (e.g., 'T001'). (required)
        day_of_week (str): Day of week to find the schedule (e.g., 'MONDAY'). (required)
        start_time (str): Start time to find the schedule (e.g., '09:00'). (required)
        new_end_time (str): Updated end time. (optional)
        new_room (str): Updated room number. (optional)
        new_building (str): Updated building name. (optional)
        new_type (str): Updated class type (LECTURE, LAB, TUTORIAL). (optional)
        is_active (bool): Updated active status. (optional)
    """
    print(f"[SCHEDULE_TOOL] Updating schedule: {course_code}, {teacher_id}, {day_of_week}, {start_time}")
    service = ScheduleService(prisma)
    
    try:
        # Find the schedule first
        course = await prisma.course.find_first(
            where={"courseCode": {"equals": course_code, "mode": "insensitive"}}
        )
        if not course:
            print(f"[SCHEDULE_TOOL] Course not found: {course_code}")
            return {"error": f"Course not found with code: {course_code}"}
        
        teacher = await prisma.teacher.find_first(
            where={"teacherId": {"equals": teacher_id, "mode": "insensitive"}}
        )
        if not teacher:
            print(f"[SCHEDULE_TOOL] Teacher not found: {teacher_id}")
            return {"error": f"Teacher not found with teacherId: {teacher_id}"}
        
        # Find the schedule
        schedule = await prisma.schedule.find_first(
            where={
                "courseId": course.id,
                "teacherId": teacher.id,
                "dayOfWeek": {"equals": day_of_week.upper()},
                "startTime": start_time
            }
        )
        
        if not schedule:
            print(f"[SCHEDULE_TOOL] Schedule not found")
            return {"error": "Schedule not found with provided details"}
        
        print(f"[SCHEDULE_TOOL] Found schedule to update: {schedule.id}")
        
        # Build update data
        schedule_update = ScheduleUpdate(
            endTime=new_end_time,
            room=new_room,
            building=new_building,
            type=new_type,
            isActive=is_active
        )
        
        updated_schedule = await service.update_schedule(schedule.id, schedule_update)
        print(f"[SCHEDULE_TOOL] Schedule updated successfully")
        return updated_schedule.model_dump()
    except Exception as e:
        print(f"[SCHEDULE_TOOL] Update failed: {str(e)}")
        return {"error": f"Schedule not found or could not be updated: {str(e)}"}


@tool
async def delete_existing_schedule(
    course_code: str,
    teacher_id: str,
    day_of_week: str,
    start_time: str
):
    """
    Delete a schedule from the database by finding it using course code, teacher ID, day, and time.

    Args:
        course_code (str): Course code (e.g., 'CS101'). (required)
        teacher_id (str): Teacher ID (e.g., 'T001'). (required)
        day_of_week (str): Day of week (e.g., 'MONDAY'). (required)
        start_time (str): Start time (e.g., '09:00'). (required)
    """
    print(f"[SCHEDULE_TOOL] Deleting schedule: {course_code}, {teacher_id}, {day_of_week}, {start_time}")
    service = ScheduleService(prisma)
    
    try:
        # Find the schedule first
        course = await prisma.course.find_first(
            where={"courseCode": {"equals": course_code, "mode": "insensitive"}}
        )
        if not course:
            print(f"[SCHEDULE_TOOL] Course not found: {course_code}")
            return {"error": f"Course not found with code: {course_code}"}
        
        teacher = await prisma.teacher.find_first(
            where={"teacherId": {"equals": teacher_id, "mode": "insensitive"}}
        )
        if not teacher:
            print(f"[SCHEDULE_TOOL] Teacher not found: {teacher_id}")
            return {"error": f"Teacher not found with teacherId: {teacher_id}"}
        
        # Find the schedule
        schedule = await prisma.schedule.find_first(
            where={
                "courseId": course.id,
                "teacherId": teacher.id,
                "dayOfWeek": {"equals": day_of_week.upper()},
                "startTime": start_time
            }
        )
        
        if not schedule:
            print(f"[SCHEDULE_TOOL] Schedule not found")
            return {"error": "Schedule not found with provided details"}
        
        print(f"[SCHEDULE_TOOL] Found schedule to delete: {schedule.id}")
        
        deleted = await service.delete_schedule(schedule.id)
        if deleted:
            print(f"[SCHEDULE_TOOL] Schedule deleted successfully")
            return {
                "message": "Schedule deleted successfully",
                "course_code": course_code,
                "teacher_id": teacher_id,
                "day_of_week": day_of_week,
                "start_time": start_time
            }
        return {"error": "Schedule not found"}
    except Exception as e:
        print(f"[SCHEDULE_TOOL] Delete failed: {str(e)}")
        return {"error": f"Schedule not found or could not be deleted: {str(e)}"}


@tool
async def get_full_timetable(department_id: Optional[str] = None):
    """
    Get the complete timetable for all semesters, optionally filtered by department.
    Returns a 3D structure: [semester][day][period] = [teacher, subject, room] or None
    Structure: 8 semesters, 5 days (Mon-Fri), 8 periods per day.
    
    Args:
        department_id: Optional department ID to filter schedules by department. (optional)
    
    Use this when user asks for the full timetable, complete schedule, or entire timetable view.
    """
    service = ScheduleService(prisma)
    try:
        timetable = await service.get_full_timetable(department_id=department_id)
        return {
            "success": True,
            "timetable": timetable,
            "structure": {
                "semesters": 8,
                "days": 5,
                "periods": 8
            }
        }
    except Exception as e:
        return {"error": f"Failed to get full timetable: {str(e)}"}


@tool
async def get_subjects_details():
    """
    Get detailed information about all subjects including teacher names and room codes.
    Returns a dictionary mapping course codes to their details.
    
    Use this when user asks for subject details, course information with teachers, or room assignments.
    """
    service = ScheduleService(prisma)
    try:
        subjects = await service.get_subjects_details()
        return {
            "success": True,
            "subjects": subjects,
            "count": len(subjects)
        }
    except Exception as e:
        return {"error": f"Failed to get subjects details: {str(e)}"}


@tool
async def save_timetable(semester: int, timetable_json: str, section: int = 1, department_id: Optional[str] = None):
    """
    Save timetable for a specific semester.
    
    Args:
        semester: Semester number (1-8). (required)
        timetable_json: JSON string representing the timetable as a 2D array [day][period] where each cell is [teacher, subject, room] or null. Example: '[[null, ["T1", "CS101", "R1"], null], [null, null, ["T2", "CS102", "R2"]]]' (required)
        section: Section number (default: 1). (optional)
        department_id: Optional department ID to associate schedules with. (optional)
    
    Use this when user wants to save or update a timetable for a specific semester.
    """
    import json
    service = ScheduleService(prisma)
    try:
        # Parse the JSON string to the expected format
        timetable = json.loads(timetable_json)
        
        success = await service.save_timetable(
            semester=semester,
            section=section,
            timetable=timetable,
            department_id=department_id
        )
        if success:
            return {
                "success": True,
                "message": f"Timetable saved for semester {semester}, section {section}"
            }
        return {"error": "Failed to save timetable"}
    except json.JSONDecodeError as e:
        return {"error": f"Invalid JSON format for timetable: {str(e)}"}
    except Exception as e:
        return {"error": f"Failed to save timetable: {str(e)}"}


