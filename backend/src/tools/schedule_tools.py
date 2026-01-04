from langchain_core.tools import tool
from src.services.schedule_service import ScheduleService
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
    course_id: Optional[str] = None,
    teacher_id: Optional[str] = None
):
    """Get all schedules from the database. Can optionally filter by course_id or teacher_id.
    Use this when user asks to see all schedules, list schedules, or show class schedules.
    
    Args:
        course_id: Optional course ID to filter schedules by specific course
        teacher_id: Optional teacher ID to filter schedules by specific teacher
    """
    service = ScheduleService(prisma)
    schedules = await service.get_schedules(course_id=course_id, teacher_id=teacher_id)
    return [schedule.model_dump() for schedule in schedules]


@tool
async def get_schedule_by_id(schedule_id: str):
    """Get a specific schedule by its ID.
    
    Args:
        schedule_id: The unique identifier of the schedule
    """
    service = ScheduleService(prisma)
    schedule = await service.get_schedule(schedule_id)
    if not schedule:
        return {"error": "Schedule not found"}
    return schedule.model_dump()


@tool
async def get_teacher_schedule(teacher_id: str):
    """Get all schedules for a specific teacher.
    
    Args:
        teacher_id: The unique identifier of the teacher
    """
    service = ScheduleService(prisma)
    schedules = await service.get_teacher_schedule(teacher_id)
    return [schedule.model_dump() for schedule in schedules]


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
async def create_new_schedule(schedule: ScheduleCreate):
    """
    Create a new schedule entry in the database.

    Args:
        schedule (ScheduleCreate): An object containing all information required to create a new schedule. The fields are:

            course_id (str): ID of the course. (required)
            teacherId (str): ID of the teacher. (required)
            day_of_week (str): Day of the week (MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY). (required)
            start_time (str): Start time of the class (e.g., "09:00 AM"). (required)
            end_time (str): End time of the class (e.g., "10:00 AM"). (required)
            room (str): Room number or code. (required)
            
            building (Optional[str]): Building name or code. (optional)
            type (str): Type of class (LECTURE, LAB, TUTORIAL). (optional, default="LECTURE")
            is_active (bool): Whether the schedule is currently active. (optional, default=True)
    """
    service = ScheduleService(prisma)
    try:
        new_schedule = await service.create_schedule(schedule)
        return new_schedule.model_dump()
    except Exception as e:
        return {"error": f"Failed to create schedule: {str(e)}"}


@tool
async def update_existing_schedule(schedule_id: str, schedule: ScheduleUpdate):
    """Update an existing schedule's information.
    
    Args:
        schedule_id (str): The unique ID of the schedule to update. (required)
        schedule (ScheduleUpdate): An object containing the fields to update. All fields are optional:
            - course_id (Optional[str]): Updated course ID. (optional)
            - teacherId (Optional[str]): Updated teacher ID. (optional)
            - day_of_week (Optional[str]): Updated day of the week. (optional)
            - start_time (Optional[str]): Updated start time. (optional)
            - end_time (Optional[str]): Updated end time. (optional)
            - room (Optional[str]): Updated room number. (optional)
            - building (Optional[str]): Updated building name. (optional)
            - type (Optional[str]): Updated class type. (optional)
            - is_active (Optional[bool]): Updated active status. (optional)
    """
    service = ScheduleService(prisma)
    try:
        updated_schedule = await service.update_schedule(schedule_id, schedule)
        return updated_schedule.model_dump()
    except Exception as e:
        return {"error": f"Schedule not found or could not be updated: {str(e)}"}


@tool
async def delete_existing_schedule(schedule_id: str):
    """
    Delete a schedule from the database.

    Args:
        schedule_id (str): The unique ID of the schedule to delete. (required)
    """
    service = ScheduleService(prisma)
    try:
        deleted = await service.delete_schedule(schedule_id)
        if deleted:
            return {"message": "Schedule deleted successfully", "schedule_id": schedule_id}
        return {"error": "Schedule not found"}
    except Exception as e:
        return {"error": f"Schedule not found or could not be deleted: {str(e)}"}


@tool
async def get_full_timetable():
    """
    Get the complete timetable for all semesters and sections.
    Returns a 4D structure: [semester][section][day][period] = [teacher, subject, room] or None
    Structure: 4 semesters, 2 sections each, 5 days (Mon-Fri), 9 periods per day.
    
    Use this when user asks for the full timetable, complete schedule, or entire timetable view.
    """
    service = ScheduleService(prisma)
    try:
        timetable = await service.get_full_timetable()
        return {
            "success": True,
            "timetable": timetable,
            "structure": {
                "semesters": 4,
                "sections_per_semester": 2,
                "days": 5,
                "periods": 9
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
async def save_timetable(semester: int, section: int, timetable_json: str):
    """
    Save timetable for a specific semester and section.
    
    Args:
        semester: Semester number (1-8). (required)
        section: Section number (0 or 1). (required)
        timetable_json: JSON string representing the timetable as a 2D array where each cell is [teacher, subject, room] or null. Example: '[[null, ["T1", "CS101", "R1"], null], [null, null, ["T2", "CS102", "R2"]]]' (required)
    
    Use this when user wants to save or update a timetable for a specific semester/section.
    """
    import json
    service = ScheduleService(prisma)
    try:
        # Parse the JSON string to the expected format
        timetable = json.loads(timetable_json)
        
        success = await service.save_timetable(
            semester=semester,
            section=section,
            timetable=timetable
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


@tool
async def generate_timetable():
    """
    Generate a timetable automatically using AI/algorithm.
    This creates a complete timetable structure for all semesters and sections.
    
    Use this when user asks to generate a new timetable, create automatic schedule, or build timetable from scratch.
    """
    service = ScheduleService(prisma)
    try:
        timetable = await service.generate_timetable()
        return {
            "success": True,
            "message": "Timetable generated successfully",
            "timetable": timetable
        }
    except Exception as e:
        return {"error": f"Failed to generate timetable: {str(e)}"}
