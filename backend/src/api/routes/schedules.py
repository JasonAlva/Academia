from fastapi import APIRouter, HTTPException, Depends
from typing import List
from src.models.schemas import ScheduleCreate, ScheduleUpdate, ScheduleResponse
from src.services.schedule_service import ScheduleService
from src.api.dependencies import get_current_user
from src.config.database import prisma

router = APIRouter()

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