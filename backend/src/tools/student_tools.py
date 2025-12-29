from langchain_core.tools import tool
from src.services.student_service import StudentService
from src.services.user_service import UserService
from src.models.schemas import StudentCreate,StudentResponse,StudentBase,StudentUserCreate,UserCreate,StudentUpdate
from src.config.database import prisma


@tool
async def list_all_students():
    """Get all students from the database. Use this when user asks to see all students, list students, or show students."""
    service=StudentService(prisma)
    students= await service.list_students()
    return [StudentBase.model_validate(s).model_dump() for s in students]

@tool
async def get_student_by_id(student_id:str):
    """Get a specific student by its ID.
    Args:
        student_id: The unique identifier of the student
    """
    service=StudentService(prisma)
    student=await service.get_student_by_id(student_id)
    return {"id":student.id,"name":student.user.name,"department":student.department,
    "semester": student.semester,
    "batch": student.batch,
    "phoneNumber": student.phoneNumber,
    "address": student.address,
    "dateOfBirth": student.dateOfBirth
    }


@tool
async def create_new_student(student:StudentUserCreate):
    """
    Create a new student in the database.

    Args:
        student (StudentUserCreate): An object containing all information required to create a new student. The fields are:

            studentId (str): Unique ID of the student. (required)
            department (str): Department code of the student. (required)
            semester (int): Current semester of the student. (required)
            batch (str): Academic batch (e.g., 2022–2026). (required)

            phoneNumber (Optional[str]): Student's phone number. (optional, default=None)
            address (Optional[str]): Student's residential address. (optional, default=None)
            dateOfBirth (Optional[datetime]): Student's date of birth. (optional)

            email (EmailStr): Student's email address. (required)
            name (str): Full name of the student. (required)
            password (str): Account password for the student. (required)
    """
    user_service=UserService(prisma)
    user=UserCreate(email=student.email,password=student.password,name=student.name,role="STUDENT")
    new_user = await user_service.create_user(user)
    student_with_user = StudentCreate(studentId=student.studentId,
    department=student.department,
    semester=student.semester,
    batch= student.batch,
    userId=new_user.id)
    student_service = StudentService(prisma)
    student = await student_service.create_student(student_with_user)
    return {"id":student.id,"name":student.name,"department":student.department,
    "semester": student.semester,
    "batch": student.batch,
    "phoneNumber": student.phoneNumber,
    "address": student.address,
    "dateOfBirth": student.dateOfBirth
    }


@tool
async def update_existing_student( student_id: str, student: StudentUpdate ):
    """Update an existing student's information.
    
   Args:
    student_id (str): The unique ID of the student to update. This identifies which student record should be modified. (required)
    student (StudentUpdate): An object containing the fields to update for the student. Only the fields provided (non-None) will be updated. All fields in StudentUpdate are optional:
        - name (Optional[str]): Updated full name of the student. (optional)
        - department (Optional[str]): Updated department code. (optional)
        - semester (Optional[int]): Updated current semester. (optional)
        - batch (Optional[str]): Updated academic batch. (optional)
        - phoneNumber (Optional[str]): Updated phone number. (optional)
        - address (Optional[str]): Updated residential address. (optional)
        - dateOfBirth (Optional[datetime]): Updated date of birth. (optional)

    """
    student_service = StudentService(prisma)
    updated_student = await student_service.update_student(student_id, student)
    if not updated_student:
        return {"error": "Student not found"}
    return {"id":updated_student.id,"name":updated_student.name,"department":updated_student.department,
    "semester": updated_student.semester,
    "batch": updated_student.batch,
    "phoneNumber": updated_student.phoneNumber,
    "address": updated_student.address,
    "dateOfBirth": updated_student.dateOfBirth
    }


        
    

@tool
async def delete_existing_student(student_id: str):
    """
    Delete a student from the database.

    Args:
        student_id (str): The unique ID of the student to delete. This identifies the student record in the database. (required)
    """
    service = StudentService(prisma)
    try:
        student = await service.get_student_by_id(student_id)
        if not student:
            return {"error": "Student not found"}
        # Use student.id (database UUID) for deletion, not userId
        await service.delete_student(student.id)
        return {"message": "Student deleted successfully", "student_id": student_id}
    except Exception as e:
        return {"error": f"Student not found or could not be deleted: {str(e)}"}