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
    print("[TOOL] list_all_teachers: Fetching all teachers from database")
    service = TeacherService(prisma)
    teachers = await service.list_teachers()
    print(f"[TOOL] list_all_teachers: Found {len(teachers)} teachers")
    return [TeacherOut.model_validate(t).model_dump() for t in teachers]


@tool
async def get_teacher_by_id(teacher_id: str):
    """Get a specific teacher by their Teacher ID (e.g., T001) or database ID.
    
    Args:
        teacher_id: The teacher ID (e.g., T001, T002) or database UUID of the teacher
    """
    print(f"[TOOL] get_teacher_by_id: Looking up teacher with ID '{teacher_id}'")
    service = TeacherService(prisma)
    
    # Try to find by teacherId first (e.g., T001)
    teacher = await prisma.teacher.find_first(
        where={'teacherId': teacher_id},
        include={'user': True}
    )
    
    # If not found, try by database ID
    if not teacher:
        print(f"[TOOL] get_teacher_by_id: Not found by teacherId, trying database ID")
        teacher = await service.get_teacher(teacher_id)
    else:
        print(f"[TOOL] get_teacher_by_id: Found teacher by teacherId '{teacher_id}'")
    
    if not teacher:
        print(f"[TOOL] get_teacher_by_id: ERROR - Teacher '{teacher_id}' not found")
        return {"error": "Teacher not found"}
    
    print(f"[TOOL] get_teacher_by_id: Successfully retrieved teacher '{teacher.teacherId}'")
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
    print(f"[TOOL] create_new_teacher: Creating teacher with ID '{teacher.teacherId}'")
    user_service = UserService(prisma)
    user = UserCreate(email=teacher.email, password=teacher.password, name=teacher.name, role="TEACHER")
    print(f"[TOOL] create_new_teacher: Creating user account for '{teacher.email}'")
    new_user = await user_service.create_user(user)
    print(f"[TOOL] create_new_teacher: User created with ID '{new_user.id}'")
    
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
    print(f"[TOOL] create_new_teacher: Teacher record created successfully")
    teacher_with_user = await teacher_service.get_teacher(new_teacher.id)
    print(f"[TOOL] create_new_teacher: Successfully created teacher '{teacher.teacherId}' for user '{teacher.name}'")
    return TeacherOut.model_validate(teacher_with_user).model_dump()


@tool
async def update_existing_teacher(teacher_id: str, teacher: TeacherUpdate):
    """Update an existing teacher's information using their Teacher ID (e.g., T001).
    
    Args:
        teacher_id (str): The teacher ID (e.g., T001, T002) to identify which teacher to update. (required)
        teacher (TeacherUpdate): An object containing the fields to update for the teacher. Only the fields provided (non-None) will be updated. All fields in TeacherUpdate are optional:
            - department (Optional[str]): Updated department code. (optional)
            - designation (Optional[str]): Updated job designation. (optional)
            - specialization (Optional[str]): Updated area of specialization. (optional)
            - phoneNumber (Optional[str]): Updated phone number. (optional)
            - officeRoom (Optional[str]): Updated office room number. (optional)
            - officeHours (Optional[str]): Updated office hours. (optional)
            - joiningDate (Optional[datetime]): Updated joining date. (optional)
    """
    try:
        print(f"[TOOL] update_existing_teacher: Updating teacher '{teacher_id}'")
        # Find teacher by teacherId (e.g., T001)
        teacher_record = await prisma.teacher.find_first(
            where={'teacherId': teacher_id},
            include={'user': True}
        )
        
        if not teacher_record:
            print(f"[TOOL] update_existing_teacher: Not found by teacherId, trying database ID")
            # Try by database ID as fallback
            teacher_service = TeacherService(prisma)
            teacher_record = await teacher_service.get_teacher(teacher_id)
        else:
            print(f"[TOOL] update_existing_teacher: Found teacher by teacherId '{teacher_id}'")
        
        if not teacher_record:
            print(f"[TOOL] update_existing_teacher: ERROR - Teacher '{teacher_id}' not found")
            return {"error": f"Teacher with ID '{teacher_id}' not found"}
        
        # Update using the database ID
        print(f"[TOOL] update_existing_teacher: Applying updates to teacher record")
        teacher_service = TeacherService(prisma)
        updated_teacher = await teacher_service.update_teacher(teacher_record.id, teacher)
        
        if not updated_teacher:
            print(f"[TOOL] update_existing_teacher: ERROR - Failed to update teacher")
            return {"error": "Failed to update teacher"}
        
        teacher_with_user = await teacher_service.get_teacher(updated_teacher.id)
        print(f"[TOOL] update_existing_teacher: Successfully updated teacher '{teacher_id}'")
        return TeacherOut.model_validate(teacher_with_user).model_dump()
    except Exception as e:
        print(f"[TOOL] update_existing_teacher: EXCEPTION - {str(e)}")
        return {"error": f"Failed to update teacher: {str(e)}"}


@tool
async def delete_existing_teacher(teacher_id: str):
    """Delete a teacher from the database using their Teacher ID (e.g., T001).

    Args:
        teacher_id (str): The teacher ID (e.g., T001, T002) to identify the teacher to delete. (required)
    """
    try:
        print(f"[TOOL] delete_existing_teacher: Attempting to delete teacher '{teacher_id}'")
        # Find teacher by teacherId (e.g., T001)
        teacher_record = await prisma.teacher.find_first(
            where={'teacherId': teacher_id}
        )
        
        if not teacher_record:
            print(f"[TOOL] delete_existing_teacher: Not found by teacherId, trying database ID")
            # Try by database ID as fallback
            service = TeacherService(prisma)
            teacher_record = await service.get_teacher(teacher_id)
        else:
            print(f"[TOOL] delete_existing_teacher: Found teacher by teacherId '{teacher_id}'")
        
        if not teacher_record:
            print(f"[TOOL] delete_existing_teacher: ERROR - Teacher '{teacher_id}' not found")
            return {"error": f"Teacher with ID '{teacher_id}' not found"}
        
        # Delete using the database ID
        service = TeacherService(prisma)
        deleted_teacher = await service.delete_teacher(teacher_record.id)
        
        if not deleted_teacher:
            print(f"[TOOL] delete_existing_teacher: ERROR - Failed to delete teacher")
            return {"error": "Failed to delete teacher"}
        
        print(f"[TOOL] delete_existing_teacher: Successfully deleted teacher '{teacher_id}'")
        return {"message": "Teacher deleted successfully", "teacher_id": teacher_id}
    except Exception as e:
        print(f"[TOOL] delete_existing_teacher: EXCEPTION - {str(e)}")
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
        print(f"[TOOL] get_my_teacher_profile: Fetching profile for user_id '{user_id}'")
        # Find teacher by user ID
        teacher = await prisma.teacher.find_first(
            where={'userId': user_id},
            include={'user': True, 'department': True}
        )
        
        if not teacher:
            print(f"[TOOL] get_my_teacher_profile: ERROR - No teacher profile found for user '{user_id}'")
            return {"error": "Teacher profile not found for current user"}
        
        print(f"[TOOL] get_my_teacher_profile: Successfully retrieved profile for teacher '{teacher.teacherId}'")
        return TeacherOut.model_validate(teacher).model_dump()
    except Exception as e:
        print(f"[TOOL] get_my_teacher_profile: EXCEPTION - {str(e)}")
        return {"error": f"Failed to get teacher profile: {str(e)}"}


@tool
async def get_teacher_courses(teacher_id: str):
    """Get all courses taught by a specific teacher using their Teacher ID (e.g., T001).
    
    Args:
        teacher_id: The teacher ID (e.g., T001, T002) of the teacher
    """
    try:
        print(f"[TOOL] get_teacher_courses: Fetching courses for teacher '{teacher_id}'")
        # Find teacher by teacherId (e.g., T001)
        teacher = await prisma.teacher.find_first(
            where={'teacherId': teacher_id}
        )
        
        if not teacher:
            print(f"[TOOL] get_teacher_courses: Not found by teacherId, trying database ID")
            # Try by database ID as fallback
            teacher = await prisma.teacher.find_unique(
                where={'id': teacher_id}
            )
        else:
            print(f"[TOOL] get_teacher_courses: Found teacher by teacherId '{teacher_id}'")
        
        if not teacher:
            print(f"[TOOL] get_teacher_courses: ERROR - Teacher '{teacher_id}' not found")
            return {"error": f"Teacher with ID '{teacher_id}' not found"}
        
        # Get courses using the database ID
        courses = await prisma.course.find_many(
            where={'teacherId': teacher.id},
            include={'department': True}
        )
        
        print(f"[TOOL] get_teacher_courses: Found {len(courses)} courses for teacher '{teacher_id}'")
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
        print(f"[TOOL] get_teacher_courses: EXCEPTION - {str(e)}")
        return {"error": f"Failed to get teacher courses: {str(e)}"}


@tool
async def get_teacher_courses_with_students(teacher_id: str):
    """Get all courses taught by a teacher with enrolled student information using Teacher ID (e.g., T001).
    
    Args:
        teacher_id: The teacher ID (e.g., T001, T002) of the teacher
    """
    try:
        print(f"[TOOL] get_teacher_courses_with_students: Fetching courses with students for teacher '{teacher_id}'")
        # Find teacher by teacherId (e.g., T001)
        teacher = await prisma.teacher.find_first(
            where={'teacherId': teacher_id}
        )
        
        if not teacher:
            print(f"[TOOL] get_teacher_courses_with_students: Not found by teacherId, trying database ID")
            # Try by database ID as fallback
            teacher = await prisma.teacher.find_unique(
                where={'id': teacher_id}
            )
        else:
            print(f"[TOOL] get_teacher_courses_with_students: Found teacher by teacherId '{teacher_id}'")
        
        if not teacher:
            print(f"[TOOL] get_teacher_courses_with_students: ERROR - Teacher '{teacher_id}' not found")
            return {"error": f"Teacher with ID '{teacher_id}' not found"}
        
        # Get courses using the database ID
        courses = await prisma.course.find_many(
            where={'teacherId': teacher.id},
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
        
        print(f"[TOOL] get_teacher_courses_with_students: Found {len(result)} courses with total {sum(c['total_enrolled'] for c in result)} students")
        return {
            "success": True,
            "teacher_id": teacher_id,
            "courses": result,
            "total_courses": len(result)
        }
    except Exception as e:
        print(f"[TOOL] get_teacher_courses_with_students: EXCEPTION - {str(e)}")
        return {"error": f"Failed to get teacher courses with students: {str(e)}"}


@tool
async def get_students_in_course(teacher_id: str, course_id: str):
    """Get all students enrolled in a specific course taught by a teacher using Teacher ID (e.g., T001).
    
    Args:
        teacher_id: The teacher ID (e.g., T001, T002) of the teacher
        course_id: The course code (e.g., CS101) or database ID of the course
    """
    try:
        print(f"[TOOL] get_students_in_course: Fetching students for course '{course_id}' taught by teacher '{teacher_id}'")
        # Find teacher by teacherId (e.g., T001)
        teacher = await prisma.teacher.find_first(
            where={'teacherId': teacher_id}
        )
        
        if not teacher:
            print(f"[TOOL] get_students_in_course: Not found by teacherId, trying database ID")
            # Try by database ID as fallback
            teacher = await prisma.teacher.find_unique(
                where={'id': teacher_id}
            )
        else:
            print(f"[TOOL] get_students_in_course: Found teacher by teacherId '{teacher_id}'")
        
        if not teacher:
            print(f"[TOOL] get_students_in_course: ERROR - Teacher '{teacher_id}' not found")
            return {"error": f"Teacher with ID '{teacher_id}' not found"}
        
        # Find course by courseCode first (e.g., CS101)
        course = await prisma.course.find_first(
            where={
                'courseCode': course_id,
                'teacherId': teacher.id
            }
        )
        
        # If not found, try by database ID
        if not course:
            print(f"[TOOL] get_students_in_course: Not found by courseCode, trying database ID")
            course = await prisma.course.find_first(
                where={'id': course_id, 'teacherId': teacher.id}
            )
        else:
            print(f"[TOOL] get_students_in_course: Found course by courseCode '{course_id}'")
        
        if not course:
            print(f"[TOOL] get_students_in_course: ERROR - Course '{course_id}' not found or not taught by teacher '{teacher_id}'")
            return {"error": "Course not found or not taught by this teacher"}
        
        # Get enrollments
        enrollments = await prisma.enrollment.find_many(
            where={'courseId': course.id},
            include={
                'student': {
                    'include': {'user': True}
                }
            }
        )
        
        print(f"[TOOL] get_students_in_course: Found {len(enrollments)} students in course '{course.courseCode}'")
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
        print(f"[TOOL] get_students_in_course: EXCEPTION - {str(e)}")
        return {"error": f"Failed to get students in course: {str(e)}"}