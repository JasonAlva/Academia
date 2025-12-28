from fastapi import APIRouter, HTTPException, Depends
from typing import List
from src.models.schemas import EnrollmentCreate, EnrollmentUpdate, EnrollmentResponse
from src.services.enrollment_service import EnrollmentService
from src.api.dependencies import get_current_user
from src.config.database import prisma

router = APIRouter()

@router.post("/", response_model=EnrollmentResponse)
async def create_enrollment(enrollment: EnrollmentCreate, current_user: str = Depends(get_current_user)):
    try:
        enrollment_service = EnrollmentService(prisma)
        return await enrollment_service.create_enrollment(enrollment)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{enrollment_id}", response_model=EnrollmentResponse)
async def get_enrollment(enrollment_id: str, current_user: str = Depends(get_current_user)):
    enrollment_service = EnrollmentService(prisma)
    enrollment = await enrollment_service.get_enrollment(enrollment_id)
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    return enrollment

@router.put("/{enrollment_id}", response_model=EnrollmentResponse)
async def update_enrollment(enrollment_id: str, enrollment: EnrollmentUpdate, current_user: str = Depends(get_current_user)):
    enrollment_service = EnrollmentService(prisma)
    try:
        updated_enrollment = await enrollment_service.update_enrollment(enrollment_id, enrollment)
        return updated_enrollment
    except:
        raise HTTPException(status_code=404, detail="Enrollment not found")

@router.delete("/{enrollment_id}", response_model=dict)
async def delete_enrollment(enrollment_id: str, current_user: str = Depends(get_current_user)):
    enrollment_service = EnrollmentService(prisma)
    try:
        await enrollment_service.delete_enrollment(enrollment_id)
        return {"detail": "Enrollment deleted successfully"}
    except:
        raise HTTPException(status_code=404, detail="Enrollment not found")

@router.get("/student/{student_id}/courses")
async def get_student_courses(student_id: str, current_user: str = Depends(get_current_user)):
    """Get all enrolled courses for a student with full details"""
    enrollment_service = EnrollmentService(prisma)
    try:
        enrollments = await enrollment_service.get_student_enrollments_with_courses(student_id)
        return enrollments
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))