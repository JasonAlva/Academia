from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
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
async def get_full_timetable(
    departmentId: Optional[str] = None,
    current_user: str = Depends(get_current_user)
):
    """Get the full timetable structure for all semesters and sections"""
    schedule_service = ScheduleService(prisma)
    return await schedule_service.get_full_timetable(department_id=departmentId)

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
    print(f"\n{'='*60}")
    print(f"SAVE TIMETABLE REQUEST")
    print(f"{'='*60}")
    print(f"Semester: {request.semester}")
    print(f"Section: {request.section}")
    print(f"Department ID: {request.departmentId}")
    print(f"Timetable has {len(request.timetable)} days")
    for day_idx, day in enumerate(request.timetable):
        if day:
            non_null_periods = [i for i, p in enumerate(day) if p is not None]
            if non_null_periods:
                print(f"  Day {day_idx}: Periods with classes: {non_null_periods}")
                for period_idx in non_null_periods:
                    print(f"    Period {period_idx}: {day[period_idx]}")
    print(f"{'='*60}\n")
    
    schedule_service = ScheduleService(prisma)
    try:
        await schedule_service.save_timetable(
            request.semester, 
            request.section, 
            request.timetable,
            request.departmentId
        )
        return {"detail": "Timetable saved successfully"}
    except Exception as e:
        print(f"❌ ERROR saving timetable: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to save timetable: {str(e)}")


# Standard CRUD routes - these must come after specific routes
@router.post("/", response_model=ScheduleResponse)
async def create_schedule(schedule: ScheduleCreate, current_user: str = Depends(get_current_user)):
    schedule_service = ScheduleService(prisma)
    return await schedule_service.create_schedule(schedule)

@router.get("/", response_model=List[ScheduleResponse])
async def get_schedules(
    courseId: Optional[str] = None,
    teacherId: Optional[str] = None,
    current_user: str = Depends(get_current_user)
):
    schedule_service = ScheduleService(prisma)
    return await schedule_service.get_schedules(course_id=courseId, teacher_id=teacherId)

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