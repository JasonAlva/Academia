from fastapi import APIRouter, HTTPException, Depends
from src.models.schemas import TeacherCreate, TeacherUpdate, TeacherResponse,UserResponse,TeacherOut,UserCreate,TeacherCreateWithUser
from src.services.teacher_service import TeacherService
from src.services.user_service import UserService
from src.api.dependencies import get_current_user
from src.config.database import prisma
from typing import List
from prisma.models import Course

router = APIRouter()

@router.get("/", response_model=list[TeacherOut])
async def get_all_teachers(
    skip: int = 0,
    limit: int = 100,
    current_user: UserResponse = Depends(get_current_user)
):
    teacher_service = TeacherService(prisma)
    teachers = await teacher_service.list_teachers()
    return teachers

@router.post("/", response_model=TeacherResponse)
async def create_teacher(teacher: TeacherCreateWithUser, current_user: UserResponse = Depends(get_current_user)):
    try:
      
        user_service = UserService(prisma)
        user_create = UserCreate(
            email=teacher.email,
            password=teacher.password,
            name=teacher.name,
            role="TEACHER"
        )
        new_user = await user_service.create_user(user_create)

        
        teacher_service = TeacherService(prisma)
        teacher_create = TeacherCreate(
            teacherId=teacher.teacherId,
            department=teacher.department,
            designation=teacher.designation,
            specialization=teacher.specialization,
            phoneNumber=teacher.phoneNumber,
            officeRoom=teacher.officeRoom,
            officeHours=teacher.officeHours,
            userId=new_user.id
        )
        new_teacher = await teacher_service.create_teacher(teacher_create)

        return new_teacher

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{teacher_id}/courses", response_model=List[Course])
async def get_teacher_courses(
    teacher_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Get all courses taught by a specific teacher."""
    teacher_service = TeacherService(prisma)
    courses = await teacher_service.get_teacher_courses(teacher_id)
    return courses

@router.get("/{teacher_id}/courses-with-students")
async def get_teacher_courses_with_students(
    teacher_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Get all courses taught by a teacher with enrolled students."""
    teacher_service = TeacherService(prisma)
    courses = await teacher_service.get_teacher_courses_with_students(teacher_id)
    return courses

@router.get("/{teacher_id}/students")
async def get_students_belongs_to_course(
    teacher_id: str,course_id:str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Get all courses taught by a teacher with enrolled students."""
    teacher_service = TeacherService(prisma)
    courses = await teacher_service.get_students_belongs_to_course(teacher_id,course_id)
    return courses

@router.get("/{teacher_id}", response_model=TeacherResponse)
async def get_teacher(teacher_id: str, current_user: UserResponse = Depends(get_current_user)):
    teacher_service = TeacherService(prisma)
    teacher = await teacher_service.get_teacher(teacher_id)
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    
@router.get("/userId/{user_id}", response_model=TeacherResponse)
async def get_teacher(user_id: str, current_user: UserResponse = Depends(get_current_user)):
    teacher_service = TeacherService(prisma)
    teacher = await teacher_service.get_teacher_by_user_id(user_id)
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return teacher

@router.put("/{teacher_id}", response_model=TeacherResponse)
async def update_teacher(teacher_id: str, teacher: TeacherUpdate, current_user: UserResponse = Depends(get_current_user)):
    teacher_service = TeacherService(prisma)
    try:
        updated_teacher = await teacher_service.update_teacher(teacher_id, teacher)
        return updated_teacher
    except:
        raise HTTPException(status_code=404, detail="Teacher not found")

@router.delete("/{teacher_id}", response_model=dict)
async def delete_teacher(teacher_id: str, current_user: UserResponse = Depends(get_current_user)):
    teacher_service = TeacherService(prisma)
    try:
        await teacher_service.delete_teacher(teacher_id)
        return {"detail": "Teacher deleted successfully"}
    except Exception as e:
        print("hello")
        print(e)
        raise HTTPException(status_code=404, detail="Teacher not found")