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
    print(f"[CONTEXT_TOOL] get_my_schedule called: user_id={user_id}, role={user_role}")
    try:
        from src.services.schedule_service import ScheduleService
        service = ScheduleService(prisma)
        
        if user_role == "TEACHER":
            print(f"[CONTEXT_TOOL] Looking up teacher profile for user_id={user_id}")
            # Find teacher by user ID
            teacher = await prisma.teacher.find_first(where={'userId': user_id})
            if not teacher:
                print(f"[CONTEXT_TOOL] ❌ Teacher profile not found for user_id={user_id}")
                return {"error": "Teacher profile not found"}
            
            print(f"[CONTEXT_TOOL] ✅ Found teacher: id={teacher.id}, teacherId={teacher.teacherId}")
            # Get teacher's timetable
            timetable = await service.get_teacher_timetable_grid(teacher.id)
            print(f"[CONTEXT_TOOL] ✅ Retrieved teacher timetable with {len(timetable)} days")
            return {
                "success": True,
                "role": "TEACHER",
                "teacher_id": teacher.id,
                "timetable": timetable,
                "message": "Here is your teaching schedule for the week"
            }
            
        elif user_role == "STUDENT":
            print(f"[CONTEXT_TOOL] Looking up student profile for user_id={user_id}")
            # Find student by user ID
            student = await prisma.student.find_first(where={'userId': user_id})
            if not student:
                print(f"[CONTEXT_TOOL] ❌ Student profile not found for user_id={user_id}")
                return {"error": "Student profile not found"}
            
            print(f"[CONTEXT_TOOL] ✅ Found student: id={student.id}, studentId={student.studentId}")
            # Get student's timetable
            timetable = await service.get_student_timetable_grid(student.id)
            print(f"[CONTEXT_TOOL] ✅ Retrieved student timetable with {len(timetable)} days")
            return {
                "success": True,
                "role": "STUDENT",
                "student_id": student.id,
                "timetable": timetable,
                "message": "Here is your class schedule for the week"
            }
        else:
            print(f"[CONTEXT_TOOL] ❌ Schedule not available for role={user_role}")
            return {"error": "Schedule not available for admin users"}
            
    except Exception as e:
        print(f"[CONTEXT_TOOL] ❌ Exception in get_my_schedule: {str(e)}")
        import traceback
        traceback.print_exc()
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
    print(f"[CONTEXT_TOOL] get_my_attendance called: user_id={user_id}, role={user_role}, course_id={course_id}")
    try:
        from src.services.attendance_service import AttendanceService
        
        if user_role == "TEACHER":
            print(f"[CONTEXT_TOOL] Looking up teacher profile for user_id={user_id}")
            # Find teacher by user ID
            teacher = await prisma.teacher.find_first(where={'userId': user_id})
            if not teacher:
                print(f"[CONTEXT_TOOL] ❌ Teacher profile not found for user_id={user_id}")
                return {"error": "Teacher profile not found"}
            
            print(f"[CONTEXT_TOOL] ✅ Found teacher: id={teacher.id}, fetching attendance records")
            # Get teacher's attendance
            records = await AttendanceService.get_teacher_attendance(teacher.id, course_id, prisma)
            print(f"[CONTEXT_TOOL] ✅ Retrieved {len(records)} attendance records for teacher")
            return {
                "success": True,
                "role": "TEACHER",
                "teacher_id": teacher.id,
                "attendance_records": [r.model_dump() for r in records],
                "total_sessions": len(records),
                "message": f"Found {len(records)} attendance records"
            }
            
        elif user_role == "STUDENT":
            print(f"[CONTEXT_TOOL] Looking up student profile for user_id={user_id}")
            # Find student by user ID
            student = await prisma.student.find_first(where={'userId': user_id})
            if not student:
                print(f"[CONTEXT_TOOL] ❌ Student profile not found for user_id={user_id}")
                return {"error": "Student profile not found"}
            
            print(f"[CONTEXT_TOOL] ✅ Found student: id={student.id}, fetching attendance records")
            # Get student's attendance
            records = await AttendanceService.get_student_attendance(student.id, course_id, prisma)
            print(f"[CONTEXT_TOOL] Retrieved {len(records)} attendance records for student")
            
            # Calculate attendance percentage
            total = len(records)
            present = len([r for r in records if r.status == "PRESENT"])
            percentage = (present / total * 100) if total > 0 else 0
            print(f"[CONTEXT_TOOL] Attendance stats: {present}/{total} classes ({percentage:.1f}%)")
            
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
            print(f"[CONTEXT_TOOL] ❌ Attendance not available for role={user_role}")
            return {"error": "Attendance not available for admin users"}
            
    except Exception as e:
        print(f"[CONTEXT_TOOL] ❌ Exception in get_my_attendance: {str(e)}")
        import traceback
        traceback.print_exc()
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
    print(f"[CONTEXT_TOOL] get_my_courses called: user_id={user_id}, role={user_role}")
    try:
        if user_role == "TEACHER":
            print(f"[CONTEXT_TOOL] Looking up teacher profile for user_id={user_id}")
            # Find teacher by user ID
            teacher = await prisma.teacher.find_first(
                where={'userId': user_id},
                include={'user': True}
            )
            if not teacher:
                print(f"[CONTEXT_TOOL] ❌ Teacher profile not found for user_id={user_id}")
                return {"error": "Teacher profile not found"}
            
            print(f"[CONTEXT_TOOL] ✅ Found teacher: id={teacher.id}, name={teacher.user.name}")
            # Get courses taught by this teacher
            courses = await prisma.course.find_many(
                where={'teacherId': teacher.id},
                include={'department': True}
            )
            print(f"[CONTEXT_TOOL] ✅ Found {len(courses)} courses taught by teacher")
            
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
            print(f"[CONTEXT_TOOL] Looking up student profile for user_id={user_id}")
            # Find student by user ID
            student = await prisma.student.find_first(
                where={'userId': user_id},
                include={'user': True}
            )
            if not student:
                print(f"[CONTEXT_TOOL] ❌ Student profile not found for user_id={user_id}")
                return {"error": "Student profile not found"}
            
            print(f"[CONTEXT_TOOL] ✅ Found student: id={student.id}, name={student.user.name}")
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
            print(f"[CONTEXT_TOOL] ✅ Found {len(enrollments)} enrollments for student")
            
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
            print(f"[CONTEXT_TOOL] ❌ Course information not available for role={user_role}")
            return {"error": "Course information not available for admin users"}
            
    except Exception as e:
        print(f"[CONTEXT_TOOL] ❌ Exception in get_my_courses: {str(e)}")
        import traceback
        traceback.print_exc()
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
    print(f"[CONTEXT_TOOL] get_my_profile called: user_id={user_id}, role={user_role}")
    try:
        # Get base user info
        print(f"[CONTEXT_TOOL] Looking up user with id={user_id}")
        user = await prisma.user.find_unique(where={'id': user_id})
        if not user:
            print(f"[CONTEXT_TOOL] ❌ User not found with id={user_id}")
            return {"error": "User not found"}
        
        print(f"[CONTEXT_TOOL] ✅ Found user: name={user.name}, email={user.email}, role={user.role}")
        profile = {
            "user_id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
        }
        
        if user_role == "TEACHER":
            print(f"[CONTEXT_TOOL] Fetching teacher profile details")
            teacher = await prisma.teacher.find_first(
                where={'userId': user_id}
            )
            if teacher:
                print(f"[CONTEXT_TOOL] ✅ Found teacher profile: teacherId={teacher.teacherId}, designation={teacher.designation}")
                profile.update({
                    "teacher_id": teacher.teacherId,
                    "designation": teacher.designation,
                    "department": teacher.department,  # department is a String field, not a relation
                    "specialization": teacher.specialization,
                    "office_room": teacher.officeRoom,
                    "office_hours": teacher.officeHours,
                    "phone": teacher.phoneNumber,
                })
            else:
                print(f"[CONTEXT_TOOL] ⚠️ Teacher profile not found for user_id={user_id}")
                
        elif user_role == "STUDENT":
            print(f"[CONTEXT_TOOL] Fetching student profile details")
            student = await prisma.student.find_first(
                where={'userId': user_id},
                include={'department': True}
            )
            if student:
                print(f"[CONTEXT_TOOL] ✅ Found student profile: studentId={student.studentId}, semester={student.semester}")
                profile.update({
                    "student_id": student.studentId,
                    "department": student.department.name if student.department else student.department,
                    "semester": student.semester,
                    "batch": student.batch,
                    "phone": student.phoneNumber,
                    "address": student.address,
                    "date_of_birth": student.dateOfBirth.isoformat() if student.dateOfBirth else None,
                })
            else:
                print(f"[CONTEXT_TOOL] ⚠️ Student profile not found for user_id={user_id}")
        
        print(f"[CONTEXT_TOOL] ✅ Returning profile for {user.name}")
        
        # Create a formatted display message
        display_message = f"**Profile Information for {user.name}**\n\n"
        display_message += f"📧 Email: {profile['email']}\n"
        display_message += f"👤 Role: {profile['role']}\n\n"
        
        if user_role == "TEACHER":
            display_message += f"**Teacher Details:**\n"
            display_message += f"🆔 Teacher ID: {profile.get('teacher_id', 'N/A')}\n"
            display_message += f"🏢 Department: {profile.get('department', 'N/A')}\n"
            display_message += f"💼 Designation: {profile.get('designation', 'N/A')}\n"
            if profile.get('specialization'):
                display_message += f"📚 Specialization: {profile['specialization']}\n"
            if profile.get('office_room'):
                display_message += f"🚪 Office Room: {profile['office_room']}\n"
            if profile.get('office_hours'):
                display_message += f"🕒 Office Hours: {profile['office_hours']}\n"
            if profile.get('phone'):
                display_message += f"📞 Phone: {profile['phone']}\n"
        
        elif user_role == "STUDENT":
            display_message += f"**Student Details:**\n"
            display_message += f"🆔 Student ID: {profile.get('student_id', 'N/A')}\n"
            display_message += f"🏢 Department: {profile.get('department', 'N/A')}\n"
            display_message += f"📖 Semester: {profile.get('semester', 'N/A')}\n"
            display_message += f"🎓 Batch: {profile.get('batch', 'N/A')}\n"
            if profile.get('phone'):
                display_message += f"📞 Phone: {profile['phone']}\n"
            if profile.get('address'):
                display_message += f"🏠 Address: {profile['address']}\n"
            if profile.get('date_of_birth'):
                display_message += f"🎂 Date of Birth: {profile['date_of_birth']}\n"
        
        return {
            "success": True,
            "profile": profile,
            "message": display_message
        }
        
    except Exception as e:
        print(f"[CONTEXT_TOOL] ❌ Exception in get_my_profile: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"error": f"Failed to get profile: {str(e)}"}
