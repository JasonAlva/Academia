from langchain_core.tools import tool
from datetime import datetime
from typing import Optional, List
from src.services.attendance_service import AttendanceService
from src.models.schemas import (
    ClassSessionCreate,
    ClassSessionUpdate,
    ClassSessionOut,
    StudentAttendanceCreate,
    StudentAttendanceUpdate,
    StudentAttendanceRead,
    TeacherAttendanceCreate,
    TeacherAttendanceUpdate,
    TeacherAttendanceRead
)
from src.config.database import prisma


# ==================== CLASS SESSION TOOLS ====================

@tool
async def create_class_session(session: ClassSessionCreate):
    """
    Create a new class session.

    Args:
        session (ClassSessionCreate): An object containing all information for the class session. The fields are:

            courseId (str): ID of the course. (required)
            teacherId (str): ID of the teacher conducting the session. (required)
            date (datetime): Date of the class session. (required)
            startTime (str): Start time (e.g., "09:00 AM"). (required)
            endTime (str): End time (e.g., "10:00 AM"). (required)
            
            scheduleId (Optional[str]): ID of the associated schedule. (optional)
            room (Optional[str]): Room number. (optional)
            topic (Optional[str]): Topic to be covered. (optional)
            status (str): Session status (SCHEDULED, COMPLETED, CANCELLED). (optional, default="SCHEDULED")
            notes (Optional[str]): Additional notes. (optional)
    """
    try:
        class_session = await AttendanceService.create_class_session(session, prisma)
        return ClassSessionOut.model_validate(class_session).model_dump()
    except Exception as e:
        return {"error": f"Failed to create class session: {str(e)}"}


@tool
async def get_class_session(session_id: str):
    """Get a specific class session by its ID.
    
    Args:
        session_id: The unique identifier of the class session
    """
    try:
        session = await AttendanceService.get_class_session_by_id(session_id, prisma)
        if not session:
            return {"error": "Class session not found"}
        return ClassSessionOut.model_validate(session).model_dump()
    except Exception as e:
        return {"error": f"Failed to get class session: {str(e)}"}


@tool
async def get_course_sessions(course_id: str, date: Optional[str] = None):
    """Get all class sessions for a specific course, optionally filtered by date.
    
    Args:
        course_id: The unique identifier of the course
        date: Optional date filter in ISO format (YYYY-MM-DD)
    """
    try:
        date_obj = datetime.fromisoformat(date) if date else None
        sessions = await AttendanceService.get_course_sessions(course_id, date_obj, prisma)
        return [ClassSessionOut.model_validate(s).model_dump() for s in sessions]
    except Exception as e:
        return {"error": f"Failed to get course sessions: {str(e)}"}


@tool
async def update_class_session(session_id: str, session: ClassSessionUpdate):
    """Update an existing class session.
    
    Args:
        session_id (str): The unique ID of the session to update. (required)
        session (ClassSessionUpdate): An object containing fields to update. All fields are optional:
            - scheduleId (Optional[str]): Updated schedule ID. (optional)
            - teacherId (Optional[str]): Updated teacher ID. (optional)
            - date (Optional[datetime]): Updated date. (optional)
            - startTime (Optional[str]): Updated start time. (optional)
            - endTime (Optional[str]): Updated end time. (optional)
            - room (Optional[str]): Updated room. (optional)
            - topic (Optional[str]): Updated topic. (optional)
            - status (Optional[str]): Updated status. (optional)
            - notes (Optional[str]): Updated notes. (optional)
    """
    try:
        updated_session = await AttendanceService.update_class_session(session_id, session, prisma)
        return ClassSessionOut.model_validate(updated_session).model_dump()
    except Exception as e:
        return {"error": f"Failed to update class session: {str(e)}"}


@tool
async def delete_class_session(session_id: str):
    """
    Delete a class session from the database.

    Args:
        session_id (str): The unique ID of the class session to delete. (required)
    """
    try:
        await AttendanceService.delete_class_session(session_id, prisma)
        return {"message": "Class session deleted successfully", "session_id": session_id}
    except Exception as e:
        return {"error": f"Failed to delete class session: {str(e)}"}


# ==================== STUDENT ATTENDANCE TOOLS ====================

@tool
async def mark_student_attendance(attendance: StudentAttendanceCreate, marked_by_id: str):
    """
    Mark attendance for a student in a class session.

    Args:
        attendance (StudentAttendanceCreate): An object containing attendance information:
            - sessionId (str): ID of the class session. (required)
            - studentId (str): ID of the student. (required)
            - status (str): Attendance status (PRESENT, ABSENT, LATE, EXCUSED). (required)
            - remarks (Optional[str]): Additional remarks. (optional)
        
        marked_by_id (str): ID of the teacher/admin marking the attendance. (required)
    """
    try:
        attendance_record = await AttendanceService.mark_attendance(attendance, marked_by_id, prisma)
        return StudentAttendanceRead.model_validate(attendance_record).model_dump()
    except Exception as e:
        return {"error": f"Failed to mark attendance: {str(e)}"}


@tool
async def bulk_mark_student_attendance(attendance_list: List[StudentAttendanceCreate], marked_by_id: str):
    """
    Mark attendance for multiple students at once in a class session.

    Args:
        attendance_list (List[StudentAttendanceCreate]): List of attendance records to create.
        marked_by_id (str): ID of the teacher/admin marking the attendance. (required)
    """
    try:
        records = await AttendanceService.bulk_mark_attendance(attendance_list, marked_by_id, prisma)
        return {
            "message": f"Successfully marked attendance for {len(records)} students",
            "records": [StudentAttendanceRead.model_validate(r).model_dump() for r in records]
        }
    except Exception as e:
        return {"error": f"Failed to bulk mark attendance: {str(e)}"}


@tool
async def get_student_attendance_record(attendance_id: str):
    """Get a specific student attendance record by its ID.
    
    Args:
        attendance_id: The unique identifier of the attendance record
    """
    try:
        record = await AttendanceService.get_attendance_by_id(attendance_id, prisma)
        if not record:
            return {"error": "Attendance record not found"}
        return StudentAttendanceRead.model_validate(record).model_dump()
    except Exception as e:
        return {"error": f"Failed to get attendance record: {str(e)}"}


@tool
async def get_course_attendance_records(course_id: str, date: Optional[str] = None):
    """Get all attendance records for a course, optionally filtered by date.
    
    Args:
        course_id: The unique identifier of the course
        date: Optional date filter in ISO format (YYYY-MM-DD)
    """
    try:
        date_obj = datetime.fromisoformat(date) if date else None
        records = await AttendanceService.get_course_attendance(course_id, date_obj, prisma)
        return [StudentAttendanceRead.model_validate(r).model_dump() for r in records]
    except Exception as e:
        return {"error": f"Failed to get course attendance: {str(e)}"}


@tool
async def get_student_attendance_records(student_id: str, course_id: Optional[str] = None):
    """Get all attendance records for a student, optionally filtered by course.
    
    Args:
        student_id: The unique identifier of the student
        course_id: Optional course ID to filter by specific course
    """
    try:
        records = await AttendanceService.get_student_attendance(student_id, course_id, prisma)
        return [StudentAttendanceRead.model_validate(r).model_dump() for r in records]
    except Exception as e:
        return {"error": f"Failed to get student attendance: {str(e)}"}


@tool
async def update_student_attendance(attendance_id: str, attendance: StudentAttendanceUpdate, marked_by_id: str):
    """Update an existing student attendance record.
    
    Args:
        attendance_id (str): The unique ID of the attendance record to update. (required)
        attendance (StudentAttendanceUpdate): An object containing fields to update:
            - status (Optional[str]): Updated status (PRESENT, ABSENT, LATE, EXCUSED). (optional)
            - remarks (Optional[str]): Updated remarks. (optional)
        marked_by_id (str): ID of the teacher/admin updating the record. (required)
    """
    try:
        updated_record = await AttendanceService.update_attendance(attendance_id, attendance, marked_by_id, prisma)
        return StudentAttendanceRead.model_validate(updated_record).model_dump()
    except Exception as e:
        return {"error": f"Failed to update attendance: {str(e)}"}


@tool
async def delete_student_attendance(attendance_id: str):
    """
    Delete a student attendance record from the database.

    Args:
        attendance_id (str): The unique ID of the attendance record to delete. (required)
    """
    try:
        await AttendanceService.delete_attendance(attendance_id, prisma)
        return {"message": "Attendance record deleted successfully", "attendance_id": attendance_id}
    except Exception as e:
        return {"error": f"Failed to delete attendance: {str(e)}"}


@tool
async def get_all_students_attendance_stats():
    """
    Get comprehensive attendance statistics for all students.
    Returns course-wise breakdown with attendance percentages and status.
    Use this for generating attendance reports or dashboard views.
    """
    try:
        stats = await AttendanceService.get_all_students_attendance(prisma)
        return {"students": stats, "count": len(stats)}
    except Exception as e:
        return {"error": f"Failed to get students attendance stats: {str(e)}"}


# ==================== TEACHER ATTENDANCE TOOLS ====================

@tool
async def mark_teacher_attendance(attendance: TeacherAttendanceCreate, marked_by_id: str):
    """
    Mark attendance for a teacher in a class session.

    Args:
        attendance (TeacherAttendanceCreate): An object containing attendance information:
            - sessionId (str): ID of the class session. (required)
            - teacherId (str): ID of the teacher. (required)
            - status (str): Attendance status (PRESENT, ABSENT, LEAVE). (required)
            - remarks (Optional[str]): Additional remarks. (optional)
        
        marked_by_id (str): ID of the admin marking the attendance. (required)
    """
    try:
        attendance_record = await AttendanceService.mark_teacher_attendance(attendance, marked_by_id, prisma)
        return TeacherAttendanceRead.model_validate(attendance_record).model_dump()
    except Exception as e:
        return {"error": f"Failed to mark teacher attendance: {str(e)}"}


@tool
async def get_teacher_attendance_record(attendance_id: str):
    """Get a specific teacher attendance record by its ID.
    
    Args:
        attendance_id: The unique identifier of the teacher attendance record
    """
    try:
        record = await AttendanceService.get_teacher_attendance_by_id(attendance_id, prisma)
        if not record:
            return {"error": "Teacher attendance record not found"}
        return TeacherAttendanceRead.model_validate(record).model_dump()
    except Exception as e:
        return {"error": f"Failed to get teacher attendance record: {str(e)}"}


@tool
async def get_teacher_attendance_records(teacher_id: str, course_id: Optional[str] = None):
    """Get all attendance records for a teacher, optionally filtered by course.
    
    Args:
        teacher_id: The unique identifier of the teacher
        course_id: Optional course ID to filter by specific course
    """
    try:
        records = await AttendanceService.get_teacher_attendance(teacher_id, course_id, prisma)
        return [TeacherAttendanceRead.model_validate(r).model_dump() for r in records]
    except Exception as e:
        return {"error": f"Failed to get teacher attendance: {str(e)}"}


@tool
async def update_teacher_attendance(attendance_id: str, attendance: TeacherAttendanceUpdate):
    """Update an existing teacher attendance record.
    
    Args:
        attendance_id (str): The unique ID of the attendance record to update. (required)
        attendance (TeacherAttendanceUpdate): An object containing fields to update:
            - status (Optional[str]): Updated status (PRESENT, ABSENT, LEAVE). (optional)
            - remarks (Optional[str]): Updated remarks. (optional)
    """
    try:
        updated_record = await AttendanceService.update_teacher_attendance(attendance_id, attendance, prisma)
        return TeacherAttendanceRead.model_validate(updated_record).model_dump()
    except Exception as e:
        return {"error": f"Failed to update teacher attendance: {str(e)}"}


@tool
async def delete_teacher_attendance(attendance_id: str):
    """
    Delete a teacher attendance record from the database.

    Args:
        attendance_id (str): The unique ID of the attendance record to delete. (required)
    """
    try:
        await AttendanceService.delete_teacher_attendance(attendance_id, prisma)
        return {"message": "Teacher attendance record deleted successfully", "attendance_id": attendance_id}
    except Exception as e:
        return {"error": f"Failed to delete teacher attendance: {str(e)}"}


@tool
async def get_all_teachers_attendance_stats():
    """
    Get comprehensive attendance statistics for all teachers.
    Returns course-wise breakdown with classes conducted and student enrollment data.
    Use this for generating teacher performance reports or dashboard views.
    """
    try:
        stats = await AttendanceService.get_all_teachers_attendance(prisma)
        return {"teachers": stats, "count": len(stats)}
    except Exception as e:
        return {"error": f"Failed to get teachers attendance stats: {str(e)}"}
