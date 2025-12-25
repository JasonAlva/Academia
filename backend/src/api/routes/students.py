from fastapi import APIRouter, HTTPException, Depends
from src.models.schemas import StudentResponse, StudentUpdate, StudentOut, StudentCreate
from src.services.student_service import StudentService
from src.api.dependencies import get_current_user
from src.config.database import prisma

router = APIRouter()

@router.get("/", response_model=list[StudentOut])
async def get_students(skip: int = 0, limit: int = 10):
    student_service = StudentService(prisma)
    students = await student_service.list_students()
    return students[skip:skip+limit]

@router.get("/{student_id}", response_model=StudentOut)
async def get_student(student_id: str):
    student_service = StudentService(prisma)
    student = await student_service.get_student(student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@router.post("/", response_model=StudentOut)
async def create_student(student: StudentCreate):
    student_service = StudentService(prisma)
    new_student = await student_service.create_student(student)
    return new_student

@router.put("/{student_id}", response_model=StudentOut)
async def update_student(student_id: str, student: StudentUpdate):
    student_service = StudentService(prisma)
    try:
        updated_student = await student_service.update_student(student_id, student)
        return updated_student
    except:
        raise HTTPException(status_code=404, detail="Student not found")

@router.delete("/{student_id}", response_model=dict)
async def delete_student(student_id: str):
    student_service = StudentService(prisma)
    try:
        await student_service.delete_student(student_id)
        return {"detail": "Student deleted successfully"}
    except:
        raise HTTPException(status_code=404, detail="Student not found")