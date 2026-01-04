"""
Context-aware tools that automatically use the current user's information.
These tools detect the user's role and ID from the context.
"""

from langchain_core.tools import tool
from src.config.database import prisma
from typing import Optional
from datetime import datetime


@tool
async def get_my_schedule(user_id: str, user_role: str):
    """
    Get MY schedule/timetable automatically based on who I am (teacher or student).
    Use this when user asks "What is my schedule?", "Show my timetable", "What classes do I have today?".
    
    Args:
        user_id: The current user's ID (automatically provided)
        user_role: The current user's role (automatically provided)
    """
    try:
        from src.services.schedule_service import ScheduleService
        service = ScheduleService(prisma)
        
        if user_role == "TEACHER":
            # Find teacher by user ID
            teacher = await prisma.teacher.find_first(where={'userId': user_id})
            if not teacher:
                return {"error": "Teacher profile not found"}
            
            # Get teacher's timetable
            timetable = await service.get_teacher_timetable_grid(teacher.id)
            return {
                "success": True,
                "role": "TEACHER",
                "teacher_id": teacher.id,
                "timetable": timetable,
                "message": "Here is your teaching schedule for the week"
            }
            
        elif user_role == "STUDENT":
            # Find student by user ID
            student = await prisma.student.find_first(where={'userId': user_id})
            if not student:
                return {"error": "Student profile not found"}
            
            # Get student's timetable
            timetable = await service.get_student_timetable_grid(student.id)
            return {
                "success": True,
                "role": "STUDENT",
                "student_id": student.id,
                "timetable": timetable,
                "message": "Here is your class schedule for the week"
            }
        else:
            return {"error": "Schedule not available for admin users"}
            
    except Exception as e:
        return {"error": f"Failed to get schedule: {str(e)}"}


@tool
async def get_my_attendance(user_id: str, user_role: str, course_id: Optional[str] = None):
    """
    Get MY attendance records automatically based on who I am (teacher or student).
    Use this when user asks "What is my attendance?", "Show my attendance", "How's my attendance in CS101?".
    
    Args:
        user_id: The current user's ID (automatically provided)
        user_role: The current user's role (automatically provided)
        course_id: Optional - specific course to filter attendance (optional)
    """
    try:
        from src.services.attendance_service import AttendanceService
        
        if user_role == "TEACHER":
            # Find teacher by user ID
            teacher = await prisma.teacher.find_first(where={'userId': user_id})
            if not teacher:
                return {"error": "Teacher profile not found"}
            
            # Get teacher's attendance
            records = await AttendanceService.get_teacher_attendance(teacher.id, course_id, prisma)
            return {
                "success": True,
                "role": "TEACHER",
                "teacher_id": teacher.id,
                "attendance_records": [r.model_dump() for r in records],
                "total_sessions": len(records),
                "message": f"Found {len(records)} attendance records"
            }
            
        elif user_role == "STUDENT":
            # Find student by user ID
            student = await prisma.student.find_first(where={'userId': user_id})
            if not student:
                return {"error": "Student profile not found"}
            
            # Get student's attendance
            records = await AttendanceService.get_student_attendance(student.id, course_id, prisma)
            
            # Calculate attendance percentage
            total = len(records)
            present = len([r for r in records if r.status == "PRESENT"])
            percentage = (present / total * 100) if total > 0 else 0
            
            return {
                "success": True,
                "role": "STUDENT",
                "student_id": student.id,
                "attendance_records": [r.model_dump() for r in records],
                "total_classes": total,
                "attended": present,
                "attendance_percentage": round(percentage, 2),
                "message": f"Your attendance: {present}/{total} classes ({percentage:.1f}%)"
            }
        else:
            return {"error": "Attendance not available for admin users"}
            
    except Exception as e:
        return {"error": f"Failed to get attendance: {str(e)}"}


@tool
async def get_my_courses(user_id: str, user_role: str):
    """
    Get MY courses automatically based on who I am.
    For teachers: courses they teach
    For students: courses they're enrolled in
    
    Use this when user asks "What courses do I teach?", "What courses am I taking?", "Show my courses".
    
    Args:
        user_id: The current user's ID (automatically provided)
        user_role: The current user's role (automatically provided)
    """
    try:
        if user_role == "TEACHER":
            # Find teacher by user ID
            teacher = await prisma.teacher.find_first(
                where={'userId': user_id},
                include={'user': True}
            )
            if not teacher:
                return {"error": "Teacher profile not found"}
            
            # Get courses taught by this teacher
            courses = await prisma.course.find_many(
                where={'teacherId': teacher.id},
                include={'department': True}
            )
            
            return {
                "success": True,
                "role": "TEACHER",
                "teacher_name": teacher.user.name,
                "courses": [{
                    "id": c.id,
                    "courseCode": c.courseCode,
                    "courseName": c.courseName,
                    "credits": c.credits,
                    "semester": c.semester,
                    "department": c.department.name if c.department else None
                } for c in courses],
                "total_courses": len(courses),
                "message": f"You are teaching {len(courses)} course(s)"
            }
            
        elif user_role == "STUDENT":
            # Find student by user ID
            student = await prisma.student.find_first(
                where={'userId': user_id},
                include={'user': True}
            )
            if not student:
                return {"error": "Student profile not found"}
            
            # Get enrollments with course details
            enrollments = await prisma.enrollment.find_many(
                where={'studentId': student.id},
                include={
                    'course': {
                        'include': {
                            'teacher': {'include': {'user': True}},
                            'department': True
                        }
                    }
                }
            )
            
            return {
                "success": True,
                "role": "STUDENT",
                "student_name": student.user.name,
                "enrollments": [{
                    "courseCode": e.course.courseCode,
                    "courseName": e.course.courseName,
                    "credits": e.course.credits,
                    "semester": e.course.semester,
                    "teacher": e.course.teacher.user.name if e.course.teacher and e.course.teacher.user else "TBA",
                    "department": e.course.department.name if e.course.department else None,
                    "status": e.status,
                    "grade": e.grade
                } for e in enrollments],
                "total_courses": len(enrollments),
                "message": f"You are enrolled in {len(enrollments)} course(s)"
            }
        else:
            return {"error": "Course information not available for admin users"}
            
    except Exception as e:
        return {"error": f"Failed to get courses: {str(e)}"}


@tool
async def get_my_profile(user_id: str, user_role: str):
    """
    Get MY profile information automatically based on who I am.
    Use this when user asks "Who am I?", "Show my profile", "What's my information?".
    
    Args:
        user_id: The current user's ID (automatically provided)
        user_role: The current user's role (automatically provided)
    """
    try:
        # Get base user info
        user = await prisma.user.find_unique(where={'id': user_id})
        if not user:
            return {"error": "User not found"}
        
        profile = {
            "user_id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
        }
        
        if user_role == "TEACHER":
            teacher = await prisma.teacher.find_first(
                where={'userId': user_id},
                include={'department': True}
            )
            if teacher:
                profile.update({
                    "teacher_id": teacher.teacherId,
                    "designation": teacher.designation,
                    "department": teacher.department.name if teacher.department else None,
                    "specialization": teacher.specialization,
                    "office_room": teacher.officeRoom,
                    "office_hours": teacher.officeHours,
                    "phone": teacher.phoneNumber,
                })
                
        elif user_role == "STUDENT":
            student = await prisma.student.find_first(
                where={'userId': user_id},
                include={'department': True}
            )
            if student:
                profile.update({
                    "student_id": student.studentId,
                    "department": student.department.name if student.department else student.department,
                    "semester": student.semester,
                    "batch": student.batch,
                    "phone": student.phoneNumber,
                    "address": student.address,
                    "date_of_birth": student.dateOfBirth.isoformat() if student.dateOfBirth else None,
                })
        
        return {
            "success": True,
            "profile": profile,
            "message": f"Profile information for {user.name}"
        }
        
    except Exception as e:
        return {"error": f"Failed to get profile: {str(e)}"}
