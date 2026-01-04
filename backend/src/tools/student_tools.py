from langchain_core.tools import tool
from src.services.student_service import StudentService
from src.services.user_service import UserService
from src.models.schemas import StudentCreate,StudentResponse,StudentBase,StudentUserCreate,UserCreate,StudentUpdate
from src.config.database import prisma
import logging

logger = logging.getLogger(__name__)


@tool
async def list_all_students():
    """Get all students from the database. Use this when user asks to see all students, list students, or show students."""
    logger.info("[STUDENT_TOOL] Listing all students")
    service=StudentService(prisma)
    students= await service.list_students()
    logger.info(f"[STUDENT_TOOL] Found {len(students)} students")
    return [StudentBase.model_validate(s).model_dump() for s in students]

@tool
async def get_student_by_studentId(student_id:str):
    """Get a specific student by their studentId (e.g., 'CS001', 'MATH123').
    This is the user-visible student identifier, not the internal database ID.
    
    Args:
        student_id: The studentId of the student (e.g., 'CS001', 'MATH123')
    """
    logger.info(f"[STUDENT_TOOL] Getting student by studentId: {student_id}")
    service=StudentService(prisma)
    
    # First try to find by studentId field
    student = await prisma.student.find_first(
        where={"studentId": {"equals": student_id, "mode": "insensitive"}},
        include={"user": True, "Department": True}
    )
    
    # If not found by studentId, try by internal id (UUID) as fallback
    if not student:
        logger.info(f"[STUDENT_TOOL] Not found by studentId, trying internal id: {student_id}")
        student = await service.get_student_by_id(student_id)
    
    if not student:
        logger.warning(f"[STUDENT_TOOL] Student not found: {student_id}")
        return {"error": f"Student not found: {student_id}"}
    
    logger.info(f"[STUDENT_TOOL] Found student: {student.user.name} (studentId: {student.studentId})")
    return {
        "studentId": student.studentId,
        "name": student.user.name,
        "email": student.user.email,
        "department": student.department,
        "departmentName": student.Department.name if student.Department else None,
        "semester": student.semester,
        "batch": student.batch,
        "phoneNumber": student.phoneNumber,
        "address": student.address,
        "dateOfBirth": student.dateOfBirth
    }


@tool
async def create_new_student(
    student_id: str,
    name: str,
    email: str,
    password: str,
    semester: int,
    batch: str,
    department_code: str = None,
    department_id: str = None,
    phone_number: str = None,
    address: str = None,
    date_of_birth: str = None
):
    """
    Create a new student in the database.

    Args:
        student_id (str): Unique student ID (e.g., 'CS001', 'MATH123'). (required)
        name (str): Full name of the student. (required)
        email (str): Student's email address. (required)
        password (str): Account password for the student. (required)
        semester (int): Current semester of the student (1-8). (required)
        batch (str): Academic batch (e.g., '2022-2026'). (required)
        department_code (str): Department code (e.g., 'CS', 'MATH'). Preferred over department_id. (optional)
        department_id (str): Internal department ID (use if department_code not available). (optional)
        phone_number (str): Student's phone number. (optional)
        address (str): Student's residential address. (optional)
        date_of_birth (str): Student's date of birth (YYYY-MM-DD format). (optional)
    
    Note: Provide either department_code (preferred) or department_id.
    """
    logger.info(f"[STUDENT_TOOL] Creating student: {student_id} - {name}")
    
    try:
        # Resolve department by code if provided
        resolved_dept_code = department_code
        if department_code:
            logger.info(f"[STUDENT_TOOL] Looking up department by code: {department_code}")
            dept = await prisma.department.find_first(
                where={"code": {"equals": department_code, "mode": "insensitive"}}
            )
            if not dept:
                logger.error(f"[STUDENT_TOOL] Department not found with code: {department_code}")
                return {"error": f"Department not found with code: {department_code}"}
            resolved_dept_code = dept.code
            logger.info(f"[STUDENT_TOOL] Found department: {dept.name} (code: {dept.code})")
        elif department_id:
            # Lookup department by ID to get the code
            logger.info(f"[STUDENT_TOOL] Looking up department by ID: {department_id}")
            dept = await prisma.department.find_unique(where={"id": department_id})
            if not dept:
                logger.error(f"[STUDENT_TOOL] Department not found with ID: {department_id}")
                return {"error": f"Department not found with ID: {department_id}"}
            resolved_dept_code = dept.code
            logger.info(f"[STUDENT_TOOL] Found department: {dept.name} (code: {dept.code})")
        else:
            logger.error("[STUDENT_TOOL] Neither department_code nor department_id provided")
            return {"error": "Please provide either department_code or department_id"}
        
        # Create user first
        logger.info(f"[STUDENT_TOOL] Creating user account for: {email}")
        user_service = UserService(prisma)
        user = UserCreate(email=email, password=password, name=name, role="STUDENT")
        new_user = await user_service.create_user(user)
        logger.info(f"[STUDENT_TOOL] User created with ID: {new_user.id}")
        
        # Create student record
        student_with_user = StudentCreate(
            studentId=student_id,
            department=resolved_dept_code,
            semester=semester,
            batch=batch,
            phoneNumber=phone_number,
            address=address,
            dateOfBirth=date_of_birth,
            userId=new_user.id
        )
        
        student_service = StudentService(prisma)
        student = await student_service.create_student(student_with_user)
        logger.info(f"[STUDENT_TOOL] Student created successfully: {student.studentId}")
        
        return {
            "studentId": student.studentId,
            "name": name,
            "email": email,
            "department": student.department,
            "semester": student.semester,
            "batch": student.batch,
            "phoneNumber": student.phoneNumber,
            "address": student.address,
            "dateOfBirth": student.dateOfBirth
        }
    except Exception as e:
        logger.error(f"[STUDENT_TOOL] Failed to create student: {str(e)}")
        return {"error": f"Failed to create student: {str(e)}"}


@tool
async def update_existing_student(
    student_id: str,
    name: str = None,
    department_code: str = None,
    semester: int = None,
    batch: str = None,
    phone_number: str = None,
    address: str = None,
    date_of_birth: str = None
):
    """Update an existing student's information using their studentId.
    
    Args:
        student_id (str): The studentId of the student to update (e.g., 'CS001', 'MATH123'). (required)
        name (str): Updated full name of the student. (optional)
        department_code (str): Updated department code (e.g., 'CS', 'MATH'). (optional)
        semester (int): Updated current semester (1-8). (optional)
        batch (str): Updated academic batch (e.g., '2022-2026'). (optional)
        phone_number (str): Updated phone number. (optional)
        address (str): Updated residential address. (optional)
        date_of_birth (str): Updated date of birth (YYYY-MM-DD format). (optional)
    
    Examples:
        - "Update CS001 semester to 5" → Use student_id="CS001", semester=5
        - "Change MATH123 phone number" → Use student_id="MATH123", phone_number="..."
    """
    logger.info(f"[STUDENT_TOOL] Updating student: {student_id}")
    
    try:
        # Find student by studentId
        target_student = await prisma.student.find_first(
            where={"studentId": {"equals": student_id, "mode": "insensitive"}},
            include={"user": True}
        )
        
        # Fallback to internal id if not found
        if not target_student:
            logger.info(f"[STUDENT_TOOL] Not found by studentId, trying internal id: {student_id}")
            student_service = StudentService(prisma)
            target_student = await student_service.get_student_by_id(student_id)
        
        if not target_student:
            logger.warning(f"[STUDENT_TOOL] Student not found: {student_id}")
            return {"error": f"Student not found: {student_id}"}
        
        logger.info(f"[STUDENT_TOOL] Found student to update: {target_student.user.name} (studentId: {target_student.studentId})")
        
        # Resolve department code if provided
        resolved_dept_code = None
        if department_code:
            logger.info(f"[STUDENT_TOOL] Looking up department by code: {department_code}")
            dept = await prisma.department.find_first(
                where={"code": {"equals": department_code, "mode": "insensitive"}}
            )
            if not dept:
                logger.error(f"[STUDENT_TOOL] Department not found with code: {department_code}")
                return {"error": f"Department not found with code: {department_code}"}
            resolved_dept_code = dept.code
            logger.info(f"[STUDENT_TOOL] Found department: {dept.name} (code: {dept.code})")
        
        # Build update object
        student_update = StudentUpdate(
            name=name,
            department=resolved_dept_code,
            semester=semester,
            batch=batch,
            phoneNumber=phone_number,
            address=address,
            dateOfBirth=date_of_birth
        )
        
        student_service = StudentService(prisma)
        updated_student = await student_service.update_student(target_student.id, student_update)
        
        if not updated_student:
            logger.error("[STUDENT_TOOL] Student update failed")
            return {"error": "Student not found"}
        
        logger.info(f"[STUDENT_TOOL] Student updated successfully: {updated_student.studentId}")
        
        # Fetch fresh data with relations
        fresh_student = await prisma.student.find_unique(
            where={"id": updated_student.id},
            include={"user": True, "Department": True}
        )
        
        return {
            "studentId": fresh_student.studentId,
            "name": fresh_student.user.name if fresh_student.user else updated_student.name,
            "email": fresh_student.user.email if fresh_student.user else None,
            "department": fresh_student.department,
            "departmentName": fresh_student.Department.name if fresh_student.Department else None,
            "semester": fresh_student.semester,
            "batch": fresh_student.batch,
            "phoneNumber": fresh_student.phoneNumber,
            "address": fresh_student.address,
            "dateOfBirth": fresh_student.dateOfBirth
        }
    except Exception as e:
        logger.error(f"[STUDENT_TOOL] Update failed: {str(e)}")
        return {"error": f"Failed to update student: {str(e)}"}


        
    

@tool
async def delete_existing_student(student_id: str):
    """
    Delete a student from the database using their studentId.

    Args:
        student_id (str): The studentId of the student to delete (e.g., 'CS001', 'MATH123'). (required)
    """
    logger.info(f"[STUDENT_TOOL] Deleting student: {student_id}")
    service = StudentService(prisma)
    
    try:
        # Find student by studentId
        student = await prisma.student.find_first(
            where={"studentId": {"equals": student_id, "mode": "insensitive"}},
            include={"user": True}
        )
        
        # Fallback to internal id if not found
        if not student:
            logger.info(f"[STUDENT_TOOL] Not found by studentId, trying internal id: {student_id}")
            student = await service.get_student_by_id(student_id)
        
        if not student:
            logger.warning(f"[STUDENT_TOOL] Student not found: {student_id}")
            return {"error": f"Student not found: {student_id}"}
        
        logger.info(f"[STUDENT_TOOL] Found student to delete: {student.user.name if student.user else 'Unknown'} (studentId: {student.studentId})")
        
        # Use student.id (database UUID) for deletion
        await service.delete_student(student.id)
        logger.info(f"[STUDENT_TOOL] Student deleted successfully: {student.studentId}")
        
        return {
            "message": "Student deleted successfully",
            "studentId": student.studentId,
            "name": student.user.name if student.user else None
        }
    except Exception as e:
        logger.error(f"[STUDENT_TOOL] Delete failed: {str(e)}")
        return {"error": f"Student not found or could not be deleted: {str(e)}"}


# Backward compatibility alias
get_student_by_id = get_student_by_studentId