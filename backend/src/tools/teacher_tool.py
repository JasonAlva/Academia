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