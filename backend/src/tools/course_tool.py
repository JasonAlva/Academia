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
async def get_course_by_id(course_id: str = None, course_code: str = None, course_name: str = None):
    """Get a specific course by its ID, course code, or course name.
    Returns detailed course information including teacher and department details.
    You can search by any of these parameters - the tool will find the course.
    
    Args:
        course_id: The unique identifier of the course (optional)
        course_code: The course code (e.g., "CS101", "MATH201") (optional)
        course_name: The full or partial course name (e.g., "Data Structures") (optional)
    
    Examples:
        - "Get course CS101" → Use course_code="CS101"
        - "Show me Data Structures course" → Use course_name="Data Structures"
        - "Find Database course" → Use course_name="Database"
    """
    service = CourseService(prisma)
    
    # Try to find course by provided parameter
    course = None
    
    if course_id:
        course = await service.get_course_by_id(course_id)
    elif course_code:
        # Search by course code
        course = await prisma.course.find_first(
            where={"courseCode": {"equals": course_code, "mode": "insensitive"}},
            include={
                "teacher": {"include": {"user": True}},
                "department": True
            }
        )
    elif course_name:
        # Search by course name (case-insensitive partial match)
        course = await prisma.course.find_first(
            where={"courseName": {"contains": course_name, "mode": "insensitive"}},
            include={
                "teacher": {"include": {"user": True}},
                "department": True
            }
        )
    else:
        return {"error": "Please provide either course_id, course_code, or course_name"}
    
    if not course:
        search_param = course_code or course_name or course_id
        return {"error": f"Course not found with: {search_param}"}
    
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
async def update_existing_course(course_id: str = None, course_code: str = None, course_name: str = None, course: CourseUpdate = None):
    """Update an existing course's information.
    You can identify the course by ID, course code, or course name.
    
    Args:
        course_id (str): The unique ID of the course to update. (optional)
        course_code (str): The course code to find the course (e.g., "CS101"). (optional)
        course_name (str): The course name to find the course (e.g., "Data Structures"). (optional)
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
    
    Examples:
        - "Update CS101 credits to 4" → Use course_code="CS101"
        - "Change Data Structures description" → Use course_name="Data Structures"
    """
    service = CourseService(prisma)
    
    try:
        # Find the course first
        target_course = None
        
        if course_id:
            target_course = await prisma.course.find_unique(where={"id": course_id})
        elif course_code:
            target_course = await prisma.course.find_first(
                where={"courseCode": {"equals": course_code, "mode": "insensitive"}}
            )
        elif course_name:
            target_course = await prisma.course.find_first(
                where={"courseName": {"contains": course_name, "mode": "insensitive"}}
            )
        else:
            return {"error": "Please provide either course_id, course_code, or course_name"}
        
        if not target_course:
            search_param = course_code or course_name or course_id
            return {"error": f"Course not found with: {search_param}"}
        
        # Update using the found course ID
        updated_course = await service.update_course(target_course.id, course)
        if not updated_course:
            return {"error": "Course not found"}
        
        # Fetch with relations for complete response
        complete_course = await service.get_course_by_id(updated_course.id)
        return CourseOut.model_validate(complete_course).model_dump()
    except Exception as e:
        return {"error": f"Course not found or could not be updated: {str(e)}"}


@tool
async def delete_existing_course(course_id: str = None, course_code: str = None, course_name: str = None):
    """
    Delete a course from the database.
    You can identify the course by ID, course code, or course name.
    Warning: This will also affect associated schedules and enrollments.

    Args:
        course_id (str): The unique ID of the course to delete. (optional)
        course_code (str): The course code to find the course (e.g., "CS101"). (optional)
        course_name (str): The course name to find the course (e.g., "Data Structures"). (optional)
    
    Examples:
        - "Delete course CS101" → Use course_code="CS101"
        - "Remove Database course" → Use course_name="Database"
    """
    service = CourseService(prisma)
    
    try:
        # Find the course first
        target_course = None
        
        if course_id:
            target_course = await prisma.course.find_unique(where={"id": course_id})
        elif course_code:
            target_course = await prisma.course.find_first(
                where={"courseCode": {"equals": course_code, "mode": "insensitive"}}
            )
        elif course_name:
            target_course = await prisma.course.find_first(
                where={"courseName": {"contains": course_name, "mode": "insensitive"}}
            )
        else:
            return {"error": "Please provide either course_id, course_code, or course_name"}
        
        if not target_course:
            search_param = course_code or course_name or course_id
            return {"error": f"Course not found with: {search_param}"}
        
        # Delete using the found course ID
        deleted_course = await service.delete_course(target_course.id)
        if deleted_course:
            return {
                "message": "Course deleted successfully",
                "course_id": target_course.id,
                "course_code": deleted_course.courseCode,
                "course_name": deleted_course.courseName
            }
        return {"error": "Course not found"}
    except Exception as e:
        return {"error": f"Course not found or could not be deleted: {str(e)}"}
