from fastapi import APIRouter, HTTPException, Depends
from src.models.schemas import TeacherCreate, TeacherUpdate, TeacherResponse,UserResponse,TeacherOut
from src.services.teacher_service import TeacherService
from src.api.dependencies import get_current_user
from src.config.database import prisma

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
async def create_teacher(teacher: TeacherCreate, current_user: UserResponse = Depends(get_current_user)):
    teacher_service = TeacherService(prisma)
    return await teacher_service.create_teacher(teacher)

@router.get("/{teacher_id}", response_model=TeacherResponse)
async def get_teacher(teacher_id: str, current_user: UserResponse = Depends(get_current_user)):
    teacher_service = TeacherService(prisma)
    teacher = await teacher_service.get_teacher(teacher_id)
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
        print(e)
        raise HTTPException(status_code=404, detail="Teacher not found")