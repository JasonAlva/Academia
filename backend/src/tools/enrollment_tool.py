from langchain_core.tools import tool
from src.services.enrollment_service import EnrollmentService
from src.models.schemas import (
    EnrollmentCreate,
    EnrollmentUpdate,
    EnrollmentResponse
)
from src.config.database import prisma
from typing import Optional
import logging

logger = logging.getLogger(__name__)


@tool
async def list_all_enrollments(student_id: Optional[str] = None):
    """Get all enrollments from the database. Can optionally filter by studentId.
    Use this when user asks to see all enrollments, list enrollments, or show student enrollments.
    
    Args:
        student_id: Optional studentId (e.g., 'CS001', 'MATH123') to filter enrollments by specific student
    """
    logger.info(f"[ENROLLMENT_TOOL] Listing enrollments, filter by studentId: {student_id}")
    service = EnrollmentService(prisma)
    
    # If student_id provided, try to find student by studentId first
    filter_by_id = None
    if student_id:
        student = await prisma.student.find_first(
            where={"studentId": {"equals": student_id, "mode": "insensitive"}}
        )
        if student:
            filter_by_id = student.id
            logger.info(f"[ENROLLMENT_TOOL] Found student with studentId: {student_id}")
        else:
            # Fallback to treating it as internal id
            logger.info(f"[ENROLLMENT_TOOL] Treating as internal id: {student_id}")
            filter_by_id = student_id
    
    enrollments = await service.list_enrollments(student_id=filter_by_id)
    logger.info(f"[ENROLLMENT_TOOL] Found {len(enrollments)} enrollments")
    return [enrollment.model_dump() for enrollment in enrollments]


@tool
async def get_enrollment_by_id(enrollment_id: str):
    """Get a specific enrollment by its ID.
    
    Args:
        enrollment_id: The unique identifier of the enrollment
    """
    service = EnrollmentService(prisma)
    enrollment = await service.get_enrollment(enrollment_id)
    if not enrollment:
        return {"error": "Enrollment not found"}
    return enrollment.model_dump()


@tool
async def get_student_enrollments_with_details(student_id: str):
    """Get all enrollments for a specific student with full course and teacher details.
    This includes course information, teacher details, and department information.
    
    Args:
        student_id: The studentId of the student (e.g., 'CS001', 'MATH123')
    """
    logger.info(f"[ENROLLMENT_TOOL] Getting enrollments with details for studentId: {student_id}")
    service = EnrollmentService(prisma)
    
    try:
        # Find student by studentId
        student = await prisma.student.find_first(
            where={"studentId": {"equals": student_id, "mode": "insensitive"}}
        )
        
        # Fallback to internal id
        if not student:
            logger.info(f"[ENROLLMENT_TOOL] Not found by studentId, trying internal id: {student_id}")
            student = await prisma.student.find_unique(where={"id": student_id})
        
        if not student:
            logger.warning(f"[ENROLLMENT_TOOL] Student not found: {student_id}")
            return {"error": f"Student not found: {student_id}"}
        
        logger.info(f"[ENROLLMENT_TOOL] Found student: {student.studentId}")
        
        enrollments = await service.get_student_enrollments_with_courses(student.id)
        if not enrollments:
            logger.info(f"[ENROLLMENT_TOOL] No active enrollments found for student: {student.studentId}")
            return {"message": "No active enrollments found for this student", "enrollments": []}
        
        logger.info(f"[ENROLLMENT_TOOL] Found {len(enrollments)} enrollments")
        
        # Format the response with nested details
        result = []
        for enrollment in enrollments:
            enrollment_data = {
                "id": enrollment.id,
                "studentId": enrollment.studentId,
                "courseId": enrollment.courseId,
                "status": enrollment.status,
                "grade": enrollment.grade,
                "gradePoints": enrollment.gradePoints,
                "enrolledAt": enrollment.enrolledAt,
                "course": None,
                "teacher": None
            }
            
            if enrollment.course:
                course = enrollment.course
                enrollment_data["course"] = {
                    "id": course.id,
                    "courseCode": course.courseCode,
                    "courseName": course.courseName,
                    "credits": course.credits,
                    "semester": course.semester,
                    "description": course.description
                }
                
                if course.teacher and course.teacher.user:
                    enrollment_data["teacher"] = {
                        "id": course.teacher.id,
                        "teacherId": course.teacher.teacherId,
                        "name": course.teacher.user.name,
                        "email": course.teacher.user.email,
                        "designation": course.teacher.designation,
                        "officeRoom": course.teacher.officeRoom,
                        "officeHours": course.teacher.officeHours
                    }
            
            result.append(enrollment_data)
        
        return {"enrollments": result, "count": len(result)}
    except Exception as e:
        logger.error(f"[ENROLLMENT_TOOL] Failed to get enrollments: {str(e)}")
        return {"error": f"Failed to get student enrollments: {str(e)}"}


@tool
async def create_new_enrollment(
    student_id: str,
    course_code: str = None,
    course_id: str = None
):
    """
    Create a new enrollment entry in the database.
    This enrolls a student in a specific course.

    Args:
        student_id (str): The studentId of the student to enroll (e.g., 'CS001', 'MATH123'). (required)
        course_code (str): The course code to enroll in (e.g., 'CS101', 'MATH201'). Preferred over course_id. (optional)
        course_id (str): The internal course ID (use if course_code not available). (optional)
    
    Note: Provide either course_code (preferred) or course_id.
    """
    logger.info(f"[ENROLLMENT_TOOL] Creating enrollment for studentId: {student_id}, courseCode: {course_code}")
    service = EnrollmentService(prisma)
    
    try:
        # Find student by studentId
        student = await prisma.student.find_first(
            where={"studentId": {"equals": student_id, "mode": "insensitive"}}
        )
        
        # Fallback to internal id
        if not student:
            logger.info(f"[ENROLLMENT_TOOL] Not found by studentId, trying internal id: {student_id}")
            student = await prisma.student.find_unique(where={"id": student_id})
        
        if not student:
            logger.error(f"[ENROLLMENT_TOOL] Student not found: {student_id}")
            return {"error": f"Student not found: {student_id}"}
        
        logger.info(f"[ENROLLMENT_TOOL] Found student: {student.studentId}")
        
        # Find course by code if provided
        resolved_course_id = course_id
        if course_code:
            logger.info(f"[ENROLLMENT_TOOL] Looking up course by code: {course_code}")
            course = await prisma.course.find_first(
                where={"courseCode": {"equals": course_code, "mode": "insensitive"}}
            )
            if not course:
                logger.error(f"[ENROLLMENT_TOOL] Course not found with code: {course_code}")
                return {"error": f"Course not found with code: {course_code}"}
            resolved_course_id = course.id
            logger.info(f"[ENROLLMENT_TOOL] Found course: {course.courseName} ({course.courseCode})")
        elif not course_id:
            logger.error("[ENROLLMENT_TOOL] Neither course_code nor course_id provided")
            return {"error": "Please provide either course_code or course_id"}
        
        # Create enrollment
        enrollment_data = EnrollmentCreate(
            studentId=student.id,
            courseId=resolved_course_id
        )
        
        new_enrollment = await service.create_enrollment(enrollment_data)
        logger.info(f"[ENROLLMENT_TOOL] Enrollment created successfully: {new_enrollment.id}")
        return new_enrollment.model_dump()
    except Exception as e:
        logger.error(f"[ENROLLMENT_TOOL] Failed to create enrollment: {str(e)}")
        return {"error": f"Failed to create enrollment: {str(e)}"}


@tool
async def update_existing_enrollment(
    enrollment_id: str,
    status: str = None,
    grade: str = None,
    grade_points: float = None
):
    """Update an existing enrollment's information.
    This can be used to update enrollment status, grades, or grade points.
    
    Args:
        enrollment_id (str): The unique ID of the enrollment to update. (required)
        status (str): Updated enrollment status (e.g., "ACTIVE", "COMPLETED", "DROPPED"). (optional)
        grade (str): Updated grade (e.g., "A", "B+", "C"). (optional)
        grade_points (float): Updated grade points (e.g., 4.0, 3.5). (optional)
    """
    logger.info(f"[ENROLLMENT_TOOL] Updating enrollment: {enrollment_id}")
    service = EnrollmentService(prisma)
    
    try:
        enrollment_update = EnrollmentUpdate(
            status=status,
            grade=grade,
            gradePoints=grade_points
        )
        
        updated_enrollment = await service.update_enrollment(enrollment_id, enrollment_update)
        logger.info(f"[ENROLLMENT_TOOL] Enrollment updated successfully: {enrollment_id}")
        return updated_enrollment.model_dump()
    except Exception as e:
        logger.error(f"[ENROLLMENT_TOOL] Update failed: {str(e)}")
        return {"error": f"Enrollment not found or could not be updated: {str(e)}"}


@tool
async def delete_existing_enrollment(enrollment_id: str):
    """
    Delete an enrollment from the database.
    This removes a student's enrollment from a course.

    Args:
        enrollment_id (str): The unique ID of the enrollment to delete. (required)
    """
    logger.info(f"[ENROLLMENT_TOOL] Deleting enrollment: {enrollment_id}")
    service = EnrollmentService(prisma)
    
    try:
        deleted = await service.delete_enrollment(enrollment_id)
        if deleted:
            logger.info(f"[ENROLLMENT_TOOL] Enrollment deleted successfully: {enrollment_id}")
            return {"message": "Enrollment deleted successfully", "enrollment_id": enrollment_id}
        logger.error(f"[ENROLLMENT_TOOL] Enrollment not found: {enrollment_id}")
        return {"error": "Enrollment not found"}
    except Exception as e:
        logger.error(f"[ENROLLMENT_TOOL] Delete failed: {str(e)}")
        return {"error": f"Enrollment not found or could not be deleted: {str(e)}"}
