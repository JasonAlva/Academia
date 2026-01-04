from langchain_core.tools import tool
from src.services.teacher_service import TeacherService
from src.services.user_service import UserService
from src.models.schemas import (
    TeacherCreate, 
    TeacherUpdate, 
    TeacherCreateWithUser, 
    TeacherOut,
    UserCreate
)
from src.config.database import prisma
from fastapi import Depends


@tool
async def list_all_teachers():
    """Get all teachers from the database. Use this when user asks to see all teachers, list teachers, or show teachers."""
    service = TeacherService(prisma)
    teachers = await service.list_teachers()
    return [TeacherOut.model_validate(t).model_dump() for t in teachers]


@tool
async def get_teacher_by_id(teacher_id: str):
    """Get a specific teacher by their ID.
    
    Args:
        teacher_id: The unique identifier of the teacher
    """
    service = TeacherService(prisma)
    teacher = await service.get_teacher(teacher_id)
    if not teacher:
        return {"error": "Teacher not found"}
    return TeacherOut.model_validate(teacher).model_dump()


@tool
async def create_new_teacher(teacher: TeacherCreateWithUser):
    """
    Create a new teacher in the database.

    Args:
        teacher (TeacherCreateWithUser): An object containing all information required to create a new teacher. The fields are:

            teacherId (str): Unique ID of the teacher. (required)
            department (str): Department code of the teacher. (required)
            designation (str): Job designation (e.g., Professor, Assistant Professor). (required)
            
            specialization (Optional[str]): Teacher's area of specialization. (optional)
            phoneNumber (Optional[str]): Teacher's phone number. (optional)
            officeRoom (Optional[str]): Office room number/location. (optional)
            officeHours (Optional[str]): Available office hours. (optional)
            joiningDate (Optional[datetime]): Date when teacher joined. (optional)

            name (str): Full name of the teacher. (required)
            email (EmailStr): Teacher's email address. (required)
            password (str): Account password for the teacher. (required)
    """
    user_service = UserService(prisma)
    user = UserCreate(email=teacher.email, password=teacher.password, name=teacher.name, role="TEACHER")
    new_user = await user_service.create_user(user)
    
    teacher_data = TeacherCreate(
        teacherId=teacher.teacherId,
        department=teacher.department,
        designation=teacher.designation,
        specialization=teacher.specialization,
        phoneNumber=teacher.phoneNumber,
        officeRoom=teacher.officeRoom,
        officeHours=teacher.officeHours,
        joiningDate=teacher.joiningDate,
        userId=new_user.id
    )
    
    teacher_service = TeacherService(prisma)
    new_teacher = await teacher_service.create_teacher(teacher_data)
    teacher_with_user = await teacher_service.get_teacher(new_teacher.id)
    return TeacherOut.model_validate(teacher_with_user).model_dump()


@tool
async def update_existing_teacher(teacher_id: str, teacher: TeacherUpdate):
    """Update an existing teacher's information.
    
    Args:
        teacher_id (str): The unique ID of the teacher to update. This identifies which teacher record should be modified. (required)
        teacher (TeacherUpdate): An object containing the fields to update for the teacher. Only the fields provided (non-None) will be updated. All fields in TeacherUpdate are optional:
            - department (Optional[str]): Updated department code. (optional)
            - designation (Optional[str]): Updated job designation. (optional)
            - specialization (Optional[str]): Updated area of specialization. (optional)
            - phoneNumber (Optional[str]): Updated phone number. (optional)
            - officeRoom (Optional[str]): Updated office room number. (optional)
            - officeHours (Optional[str]): Updated office hours. (optional)
            - joiningDate (Optional[datetime]): Updated joining date. (optional)
    """
    teacher_service = TeacherService(prisma)
    updated_teacher = await teacher_service.update_teacher(teacher_id, teacher)
    if not updated_teacher:
        return {"error": "Teacher not found"}
    teacher_with_user = await teacher_service.get_teacher(updated_teacher.id)
    return TeacherOut.model_validate(teacher_with_user).model_dump()


@tool
async def delete_existing_teacher(teacher_id: str):
    """
    Delete a teacher from the database.

    Args:
        teacher_id (str): The unique ID of the teacher to delete. This identifies the teacher record in the database. (required)
    """
    service = TeacherService(prisma)
    try:
        deleted_teacher = await service.delete_teacher(teacher_id)
        if not deleted_teacher:
            return {"error": "Teacher not found"}
        return {"message": "Teacher deleted successfully", "teacher_id": teacher_id}
    except Exception as e:
        return {"error": f"Teacher not found or could not be deleted: {str(e)}"}


@tool
async def get_my_teacher_profile(user_id: str):
    """
    Get the current teacher's profile information.
    This automatically uses the logged-in teacher's user ID.
    
    Args:
        user_id: The user ID of the currently logged-in teacher (automatically provided)
    """
    try:
        # Find teacher by user ID
        teacher = await prisma.teacher.find_first(
            where={'userId': user_id},
            include={'user': True, 'department': True}
        )
        
        if not teacher:
            return {"error": "Teacher profile not found for current user"}
        
        return TeacherOut.model_validate(teacher).model_dump()
    except Exception as e:
        return {"error": f"Failed to get teacher profile: {str(e)}"}


@tool
async def get_teacher_courses(teacher_id: str):
    """
    Get all courses taught by a specific teacher.
    
    Args:
        teacher_id: The unique identifier of the teacher
    """
    try:
        courses = await prisma.course.find_many(
            where={'teacherId': teacher_id},
            include={'department': True}
        )
        
        return {
            "success": True,
            "teacher_id": teacher_id,
            "courses": [{
                "id": c.id,
                "courseCode": c.courseCode,
                "courseName": c.courseName,
                "credits": c.credits,
                "semester": c.semester,
                "department": c.department.name if c.department else None,
                "maxStudents": c.maxStudents,
                "isActive": c.isActive
            } for c in courses],
            "total_courses": len(courses)
        }
    except Exception as e:
        return {"error": f"Failed to get teacher courses: {str(e)}"}


@tool
async def get_teacher_courses_with_students(teacher_id: str):
    """
    Get all courses taught by a teacher with enrolled student information.
    
    Args:
        teacher_id: The unique identifier of the teacher
    """
    try:
        courses = await prisma.course.find_many(
            where={'teacherId': teacher_id},
            include={
                'department': True,
                'enrollments': {
                    'include': {
                        'student': {
                            'include': {'user': True}
                        }
                    }
                }
            }
        )
        
        result = []
        for course in courses:
            course_data = {
                "id": course.id,
                "courseCode": course.courseCode,
                "courseName": course.courseName,
                "credits": course.credits,
                "semester": course.semester,
                "department": course.department.name if course.department else None,
                "total_enrolled": len(course.enrollments),
                "students": [{
                    "id": e.student.id,
                    "studentId": e.student.studentId,
                    "name": e.student.user.name,
                    "email": e.student.user.email,
                    "status": e.status,
                    "grade": e.grade
                } for e in course.enrollments]
            }
            result.append(course_data)
        
        return {
            "success": True,
            "teacher_id": teacher_id,
            "courses": result,
            "total_courses": len(result)
        }
    except Exception as e:
        return {"error": f"Failed to get teacher courses with students: {str(e)}"}


@tool
async def get_students_in_course(teacher_id: str, course_id: str):
    """
    Get all students enrolled in a specific course taught by a teacher.
    
    Args:
        teacher_id: The unique identifier of the teacher
        course_id: The unique identifier of the course
    """
    try:
        # Verify the teacher teaches this course
        course = await prisma.course.find_first(
            where={'id': course_id, 'teacherId': teacher_id}
        )
        
        if not course:
            return {"error": "Course not found or not taught by this teacher"}
        
        # Get enrollments
        enrollments = await prisma.enrollment.find_many(
            where={'courseId': course_id},
            include={
                'student': {
                    'include': {'user': True}
                }
            }
        )
        
        return {
            "success": True,
            "course_id": course_id,
            "course_code": course.courseCode,
            "course_name": course.courseName,
            "total_students": len(enrollments),
            "students": [{
                "id": e.student.id,
                "studentId": e.student.studentId,
                "name": e.student.user.name,
                "email": e.student.user.email,
                "department": e.student.department,
                "semester": e.student.semester,
                "enrollment_status": e.status,
                "grade": e.grade
            } for e in enrollments]
        }
    except Exception as e:
        return {"error": f"Failed to get students in course: {str(e)}"}