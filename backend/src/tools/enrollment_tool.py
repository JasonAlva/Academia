from langchain_core.tools import tool
from src.services.enrollment_service import EnrollmentService
from src.models.schemas import (
    EnrollmentCreate,
    EnrollmentUpdate,
    EnrollmentResponse
)
from src.config.database import prisma
from typing import Optional


@tool
async def list_all_enrollments(student_id: Optional[str] = None):
    """Get all enrollments from the database. Can optionally filter by student_id.
    Use this when user asks to see all enrollments, list enrollments, or show student enrollments.
    
    Args:
        student_id: Optional student ID to filter enrollments by specific student
    """
    service = EnrollmentService(prisma)
    enrollments = await service.list_enrollments(student_id=student_id)
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
        student_id: The unique identifier of the student
    """
    service = EnrollmentService(prisma)
    try:
        enrollments = await service.get_student_enrollments_with_courses(student_id)
        if not enrollments:
            return {"message": "No active enrollments found for this student", "enrollments": []}
        
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
        return {"error": f"Failed to get student enrollments: {str(e)}"}


@tool
async def create_new_enrollment(enrollment: EnrollmentCreate):
    """
    Create a new enrollment entry in the database.
    This enrolls a student in a specific course.

    Args:
        enrollment (EnrollmentCreate): An object containing all information required to create a new enrollment. The fields are:

            student_id (str): ID of the student to enroll. (required)
            course_id (str): ID of the course to enroll in. (required)
    """
    service = EnrollmentService(prisma)
    try:
        new_enrollment = await service.create_enrollment(enrollment)
        return new_enrollment.model_dump()
    except Exception as e:
        return {"error": f"Failed to create enrollment: {str(e)}"}


@tool
async def update_existing_enrollment(enrollment_id: str, enrollment: EnrollmentUpdate):
    """Update an existing enrollment's information.
    This can be used to update enrollment status, grades, or grade points.
    
    Args:
        enrollment_id (str): The unique ID of the enrollment to update. (required)
        enrollment (EnrollmentUpdate): An object containing the fields to update. All fields are optional:
            - status (Optional[str]): Updated enrollment status (e.g., "ACTIVE", "COMPLETED", "DROPPED"). (optional)
            - grade (Optional[str]): Updated grade (e.g., "A", "B+", "C"). (optional)
            - grade_points (Optional[float]): Updated grade points (e.g., 4.0, 3.5). (optional)
    """
    service = EnrollmentService(prisma)
    try:
        updated_enrollment = await service.update_enrollment(enrollment_id, enrollment)
        return updated_enrollment.model_dump()
    except Exception as e:
        return {"error": f"Enrollment not found or could not be updated: {str(e)}"}


@tool
async def delete_existing_enrollment(enrollment_id: str):
    """
    Delete an enrollment from the database.
    This removes a student's enrollment from a course.

    Args:
        enrollment_id (str): The unique ID of the enrollment to delete. (required)
    """
    service = EnrollmentService(prisma)
    try:
        deleted = await service.delete_enrollment(enrollment_id)
        if deleted:
            return {"message": "Enrollment deleted successfully", "enrollment_id": enrollment_id}
        return {"error": "Enrollment not found"}
    except Exception as e:
        return {"error": f"Enrollment not found or could not be deleted: {str(e)}"}
