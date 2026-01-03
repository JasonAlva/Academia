from fastapi import APIRouter, HTTPException, Depends
from typing import List
from src.models.schemas import (
    ScheduleCreate, 
    ScheduleUpdate, 
    ScheduleResponse,
    SaveScheduleRequest
)
from src.services.schedule_service import ScheduleService
from src.api.dependencies import get_current_user
from src.config.database import prisma

router = APIRouter()

# Timetable routes - MUST come before parameterized routes
@router.get("/timetable")
async def get_full_timetable(current_user: str = Depends(get_current_user)):
    """Get the full timetable structure for all semesters and sections"""
    schedule_service = ScheduleService(prisma)
    return await schedule_service.get_full_timetable()

@router.get("/teacher/{teacher_id}/timetable")
async def get_teacher_timetable(
    teacher_id: str,
    current_user: str = Depends(get_current_user)
):
    """Get teacher's timetable in grid format"""
    schedule_service = ScheduleService(prisma)
    return await schedule_service.get_teacher_timetable_grid(teacher_id)

@router.get("/student/{student_id}/timetable")
async def get_student_timetable(
    student_id: str,
    current_user: str = Depends(get_current_user)
):
    """Get student's timetable in grid format"""
    schedule_service = ScheduleService(prisma)
    return await schedule_service.get_student_timetable_grid(student_id)

@router.get("/subjects-details")
async def get_subjects_details(current_user: str = Depends(get_current_user)):
    """Get subject details with teacher names and room codes"""
    schedule_service = ScheduleService(prisma)
    return await schedule_service.get_subjects_details()

@router.post("/save", response_model=dict)
async def save_timetable(
    request: SaveScheduleRequest,
    current_user: str = Depends(get_current_user)
):
    """Save timetable for a specific semester and section"""
    schedule_service = ScheduleService(prisma)
    try:
        await schedule_service.save_timetable(
            request.semester, 
            request.section, 
            request.timetable
        )
        return {"detail": "Timetable saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save timetable: {str(e)}")

@router.post("/generate")
async def generate_timetable(current_user: str = Depends(get_current_user)):
    """Generate timetable automatically using AI/algorithm"""
    schedule_service = ScheduleService(prisma)
    try:
        return await schedule_service.generate_timetable()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate timetable: {str(e)}")

# Standard CRUD routes - these must come after specific routes
@router.post("/", response_model=ScheduleResponse)
async def create_schedule(schedule: ScheduleCreate, current_user: str = Depends(get_current_user)):
    schedule_service = ScheduleService(prisma)
    return await schedule_service.create_schedule(schedule)

@router.get("/", response_model=List[ScheduleResponse])
async def get_schedules(current_user: str = Depends(get_current_user)):
    schedule_service = ScheduleService(prisma)
    return await schedule_service.get_schedules()

@router.get("/{schedule_id}", response_model=ScheduleResponse)
async def get_schedule(schedule_id: str, current_user: str = Depends(get_current_user)):
    schedule_service = ScheduleService(prisma)
    schedule = await schedule_service.get_schedule(schedule_id)
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return schedule

@router.put("/{schedule_id}", response_model=ScheduleResponse)
async def update_schedule(schedule_id: str, schedule: ScheduleUpdate, current_user: str = Depends(get_current_user)):
    schedule_service = ScheduleService(prisma)
    try:
        updated_schedule = await schedule_service.update_schedule(schedule_id, schedule)
        return updated_schedule
    except:
        raise HTTPException(status_code=404, detail="Schedule not found")

@router.delete("/{schedule_id}", response_model=dict)
async def delete_schedule(schedule_id: str, current_user: str = Depends(get_current_user)):
    schedule_service = ScheduleService(prisma)
    try:
        await schedule_service.delete_schedule(schedule_id)
        return {"detail": "Schedule deleted successfully"}
    except:
        raise HTTPException(status_code=404, detail="Schedule not found")