from langchain_core.tools import tool
from src.services.course_service import CourseService
from src.models.schemas import (
    CourseCreate,
    CourseUpdate,
    CourseOut
)
from src.config.database import prisma
import logging

logger = logging.getLogger(__name__)


@tool
async def list_all_courses():
    """Get all courses from the database. 
    Use this when user asks to see all courses, list courses, or show available courses.
    Returns course details including teacher and department information."""
    logger.info("[COURSE_TOOL] Listing all courses")
    service = CourseService(prisma)
    courses = await service.get_all_courses()
    logger.info(f"[COURSE_TOOL] Found {len(courses)} courses")
    
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
    logger.info(f"[COURSE_TOOL] Getting course by: id={course_id}, code={course_code}, name={course_name}")
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
        logger.warning(f"[COURSE_TOOL] Course not found with: {search_param}")
        return {"error": f"Course not found with: {search_param}"}
    
    logger.info(f"[COURSE_TOOL] Found course: {course.courseName} ({course.courseCode})")
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
async def create_new_course(
    course_code: str,
    course_name: str,
    credits: int,
    semester: int,
    department_code: str = None,
    department_id: str = None,
    description: str = None,
    syllabus: str = None,
    max_students: int = None,
    is_active: bool = True
):
    """
    Create a new course in the database.

    Args:
        course_code (str): Unique course code (e.g., "CS101"). (required)
        course_name (str): Full name of the course. (required)
        credits (int): Number of credit hours. (required)
        semester (int): Semester level (1-8). (required)
        department_code (str): Code of the department offering the course (e.g., "CS", "MATH"). Preferred over department_id. (optional)
        department_id (str): ID of the department (use if department_code not available). (optional)
        description (str): Course description. (optional)
        syllabus (str): Course syllabus details. (optional)
        max_students (int): Maximum number of students allowed. (optional)
        is_active (bool): Whether the course is currently active. (optional, default=True)
    
    Note: Provide either department_code (preferred) or department_id.
    """
    logger.info(f"[COURSE_TOOL] Creating course: {course_code} - {course_name}")
    service = CourseService(prisma)
    try:
        # Find department by code if provided
        resolved_dept_id = department_id
        if department_code:
            logger.info(f"[COURSE_TOOL] Looking up department by code: {department_code}")
            dept = await prisma.department.find_first(
                where={"code": {"equals": department_code, "mode": "insensitive"}}
            )
            if not dept:
                logger.error(f"[COURSE_TOOL] Department not found with code: {department_code}")
                return {"error": f"Department not found with code: {department_code}"}
            resolved_dept_id = dept.id
            logger.info(f"[COURSE_TOOL] Found department: {dept.name} (ID: {dept.id})")
        elif not department_id:
            logger.error("[COURSE_TOOL] Neither department_code nor department_id provided")
            return {"error": "Please provide either department_code or department_id"}
        
        # Create course object
        course_data = CourseCreate(
            courseCode=course_code,
            courseName=course_name,
            credits=credits,
            departmentId=resolved_dept_id,
            semester=semester,
            description=description,
            syllabus=syllabus,
            maxStudents=max_students,
            isActive=is_active
        )
        
        new_course = await service.create_course(course_data)
        logger.info(f"[COURSE_TOOL] Course created successfully: {new_course.id}")
        # Fetch with relations for complete response
        complete_course = await service.get_course_by_id(new_course.id)
        return CourseOut.model_validate(complete_course).model_dump()
    except Exception as e:
        logger.error(f"[COURSE_TOOL] Failed to create course: {str(e)}")
        return {"error": f"Failed to create course: {str(e)}"}


@tool
async def update_existing_course(
    course_id: str = None,
    course_code: str = None,
    course_name: str = None,
    new_course_code: str = None,
    new_course_name: str = None,
    credits: int = None,
    department_code: str = None,
    department_id: str = None,
    semester: int = None,
    description: str = None,
    syllabus: str = None,
    max_students: int = None,
    is_active: bool = None
):
    """Update an existing course's information.
    You can identify the course by ID, course code, or course name.
    
    Args:
        course_id (str): The unique ID of the course to update. (optional)
        course_code (str): The course code to find the course (e.g., "CS101"). (optional)
        course_name (str): The course name to find the course (e.g., "Data Structures"). (optional)
        new_course_code (str): Updated course code. (optional)
        new_course_name (str): Updated course name. (optional)
        credits (int): Updated credit hours. (optional)
        department_code (str): Updated department code (e.g., "CS", "MATH"). Preferred over department_id. (optional)
        department_id (str): Updated department ID (use if department_code not available). (optional)
        semester (int): Updated semester level. (optional)
        description (str): Updated description. (optional)
        syllabus (str): Updated syllabus. (optional)
        max_students (int): Updated max students. (optional)
        is_active (bool): Updated active status. (optional)
    
    Examples:
        - "Update CS101 credits to 4" → Use course_code="CS101", credits=4
        - "Change Data Structures description" → Use course_name="Data Structures", description="..."
        - "Move CS101 to MATH department" → Use course_code="CS101", department_code="MATH"
    """
    logger.info(f"[COURSE_TOOL] Updating course: id={course_id}, code={course_code}, name={course_name}")
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
            logger.error("[COURSE_TOOL] No course identifier provided")
            return {"error": "Please provide either course_id, course_code, or course_name"}
        
        if not target_course:
            search_param = course_code or course_name or course_id
            logger.warning(f"[COURSE_TOOL] Course not found with: {search_param}")
            return {"error": f"Course not found with: {search_param}"}
        
        logger.info(f"[COURSE_TOOL] Found course to update: {target_course.courseName} ({target_course.courseCode})")
        
        # Resolve department if department_code is provided
        resolved_dept_id = department_id
        if department_code:
            logger.info(f"[COURSE_TOOL] Looking up department by code: {department_code}")
            dept = await prisma.department.find_first(
                where={"code": {"equals": department_code, "mode": "insensitive"}}
            )
            if not dept:
                logger.error(f"[COURSE_TOOL] Department not found with code: {department_code}")
                return {"error": f"Department not found with code: {department_code}"}
            resolved_dept_id = dept.id
            logger.info(f"[COURSE_TOOL] Found department: {dept.name} (ID: {dept.id})")
        
        # Build update object with only provided fields
        update_data = CourseUpdate(
            courseCode=new_course_code,
            courseName=new_course_name,
            credits=credits,
            departmentId=resolved_dept_id,
            semester=semester,
            description=description,
            syllabus=syllabus,
            maxStudents=max_students,
            isActive=is_active
        )
        
        # Update using the found course ID
        updated_course = await service.update_course(target_course.id, update_data)
        if not updated_course:
            logger.error("[COURSE_TOOL] Course update failed")
            return {"error": "Course not found"}
        
        logger.info(f"[COURSE_TOOL] Course updated successfully: {updated_course.id}")
        # Fetch with relations for complete response
        complete_course = await service.get_course_by_id(updated_course.id)
        return CourseOut.model_validate(complete_course).model_dump()
    except Exception as e:
        logger.error(f"[COURSE_TOOL] Update failed: {str(e)}")
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
    logger.info(f"[COURSE_TOOL] Deleting course: id={course_id}, code={course_code}, name={course_name}")
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
            logger.error("[COURSE_TOOL] No course identifier provided")
            return {"error": "Please provide either course_id, course_code, or course_name"}
        
        if not target_course:
            search_param = course_code or course_name or course_id
            logger.warning(f"[COURSE_TOOL] Course not found with: {search_param}")
            return {"error": f"Course not found with: {search_param}"}
        
        logger.info(f"[COURSE_TOOL] Found course to delete: {target_course.courseName} ({target_course.courseCode})")
        
        # Delete using the found course ID
        deleted_course = await service.delete_course(target_course.id)
        if deleted_course:
            logger.info(f"[COURSE_TOOL] Course deleted successfully: {deleted_course.courseCode}")
            return {
                "message": "Course deleted successfully",
                "course_id": target_course.id,
                "course_code": deleted_course.courseCode,
                "course_name": deleted_course.courseName
            }
        logger.error("[COURSE_TOOL] Course deletion failed")
        return {"error": "Course not found"}
    except Exception as e:
        logger.error(f"[COURSE_TOOL] Delete failed: {str(e)}")
        return {"error": f"Course not found or could not be deleted: {str(e)}"}
