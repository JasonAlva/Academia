from langchain_core.tools import tool
from src.services.course_service import CourseService
from src.models.schemas import (
    CourseCreate,
    CourseUpdate,
    CourseOut
)
from src.config.database import prisma


@tool
async def list_all_courses():
    """Get all courses from the database. 
    Use this when user asks to see all courses, list courses, or show available courses.
    Returns course details including teacher and department information."""
    service = CourseService(prisma)
    courses = await service.get_all_courses()
    
    result = []
    for course in courses:
        course_data = {
            "id": course.id,
            "courseCode": course.courseCode,
            "courseName": course.courseName,
            "credits": course.credits,
            "departmentId": course.departmentId,
            "semester": course.semester,
            "description": course.description,
            "syllabus": course.syllabus,
            "maxStudents": course.maxStudents,
            "isActive": course.isActive,
            "teacherId": course.teacherId,
            "createdAt": course.createdAt,
            "updatedAt": course.updatedAt
        }
        
        # Add teacher info if available
        if course.teacher and course.teacher.user:
            course_data["teacher"] = {
                "id": course.teacher.id,
                "teacherId": course.teacher.teacherId,
                "name": course.teacher.user.name,
                "email": course.teacher.user.email,
                "designation": course.teacher.designation
            }
        
        # Add department info if available
        if course.department:
            course_data["department"] = {
                "id": course.department.id,
                "code": course.department.code,
                "name": course.department.name
            }
        
        result.append(course_data)
    
    return result


@tool
async def get_course_by_id(course_id: str):
    """Get a specific course by its ID.
    Returns detailed course information including teacher and department details.
    
    Args:
        course_id: The unique identifier of the course
    """
    service = CourseService(prisma)
    course = await service.get_course_by_id(course_id)
    
    if not course:
        return {"error": "Course not found"}
    
    course_data = {
        "id": course.id,
        "courseCode": course.courseCode,
        "courseName": course.courseName,
        "credits": course.credits,
        "departmentId": course.departmentId,
        "semester": course.semester,
        "description": course.description,
        "syllabus": course.syllabus,
        "maxStudents": course.maxStudents,
        "isActive": course.isActive,
        "teacherId": course.teacherId,
        "createdAt": course.createdAt,
        "updatedAt": course.updatedAt
    }
    
    # Add teacher info if available
    if course.teacher and course.teacher.user:
        course_data["teacher"] = {
            "id": course.teacher.id,
            "teacherId": course.teacher.teacherId,
            "name": course.teacher.user.name,
            "email": course.teacher.user.email,
            "designation": course.teacher.designation,
            "officeRoom": course.teacher.officeRoom,
            "officeHours": course.teacher.officeHours
        }
    
    # Add department info if available
    if course.department:
        course_data["department"] = {
            "id": course.department.id,
            "code": course.department.code,
            "name": course.department.name,
            "description": course.department.description
        }
    
    return course_data


@tool
async def create_new_course(course: CourseCreate):
    """
    Create a new course in the database.

    Args:
        course (CourseCreate): An object containing all information required to create a new course. The fields are:

            course_code (str): Unique course code (e.g., "CS101"). (required)
            course_name (str): Full name of the course. (required)
            credits (int): Number of credit hours. (required)
            department_id (str): ID of the department offering the course. (required)
            semester (int): Semester level (1-8). (required)
            
            description (Optional[str]): Course description. (optional)
            syllabus (Optional[str]): Course syllabus details. (optional)
            max_students (Optional[int]): Maximum number of students allowed. (optional)
            is_active (bool): Whether the course is currently active. (optional, default=True)
    """
    service = CourseService(prisma)
    try:
        new_course = await service.create_course(course)
        # Fetch with relations for complete response
        complete_course = await service.get_course_by_id(new_course.id)
        return CourseOut.model_validate(complete_course).model_dump()
    except Exception as e:
        return {"error": f"Failed to create course: {str(e)}"}


@tool
async def update_existing_course(course_id: str, course: CourseUpdate):
    """Update an existing course's information.
    
    Args:
        course_id (str): The unique ID of the course to update. (required)
        course (CourseUpdate): An object containing the fields to update. All fields are optional:
            - course_code (Optional[str]): Updated course code. (optional)
            - course_name (Optional[str]): Updated course name. (optional)
            - credits (Optional[int]): Updated credit hours. (optional)
            - department_id (Optional[str]): Updated department ID. (optional)
            - semester (Optional[int]): Updated semester level. (optional)
            - description (Optional[str]): Updated description. (optional)
            - syllabus (Optional[str]): Updated syllabus. (optional)
            - max_students (Optional[int]): Updated max students. (optional)
            - is_active (Optional[bool]): Updated active status. (optional)
    """
    service = CourseService(prisma)
    try:
        updated_course = await service.update_course(course_id, course)
        if not updated_course:
            return {"error": "Course not found"}
        # Fetch with relations for complete response
        complete_course = await service.get_course_by_id(updated_course.id)
        return CourseOut.model_validate(complete_course).model_dump()
    except Exception as e:
        return {"error": f"Course not found or could not be updated: {str(e)}"}


@tool
async def delete_existing_course(course_id: str):
    """
    Delete a course from the database.
    Warning: This will also affect associated schedules and enrollments.

    Args:
        course_id (str): The unique ID of the course to delete. (required)
    """
    service = CourseService(prisma)
    try:
        deleted_course = await service.delete_course(course_id)
        if deleted_course:
            return {
                "message": "Course deleted successfully",
                "course_id": course_id,
                "course_code": deleted_course.courseCode,
                "course_name": deleted_course.courseName
            }
        return {"error": "Course not found"}
    except Exception as e:
        return {"error": f"Course not found or could not be deleted: {str(e)}"}
