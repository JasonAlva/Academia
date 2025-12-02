from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from datetime import datetime
from src.models.schemas import (
    AttendanceCreate, 
    AttendanceRead, 
    AttendanceUpdate
)
from src.services.attendance_service import AttendanceService
from src.api.dependencies import get_current_user, get_db
from prisma import Prisma

router = APIRouter()

# Teacher Routes - Manage Attendance
@router.post("/", response_model=AttendanceRead)
async def mark_attendance(
    attendance: AttendanceCreate,
    current_user: str = Depends(get_current_user),
    db: Prisma = Depends(get_db)
):
    """Mark attendance for a student (Teacher only)."""
    try:
        return await AttendanceService.mark_attendance(attendance, current_user, db)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/bulk", response_model=List[AttendanceRead])
async def bulk_mark_attendance(
    attendance_list: List[AttendanceCreate],
    current_user: str = Depends(get_current_user),
    db: Prisma = Depends(get_db)
):
    """Mark attendance for multiple students at once (Teacher only)."""
    try:
        return await AttendanceService.bulk_mark_attendance(attendance_list, current_user, db)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/course/{course_id}", response_model=List[AttendanceRead])
async def get_course_attendance(
    course_id: str,
    date: Optional[datetime] = Query(None),
    current_user: str = Depends(get_current_user),
    db: Prisma = Depends(get_db)
):
    """Get attendance records for a course (Teacher view)."""
    try:
        return await AttendanceService.get_course_attendance(course_id, date, db)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{attendance_id}", response_model=AttendanceRead)
async def update_attendance(
    attendance_id: str,
    attendance: AttendanceUpdate,
    current_user: str = Depends(get_current_user),
    db: Prisma = Depends(get_db)
):
    """Update an attendance record (Teacher only)."""
    try:
        existing = await AttendanceService.get_attendance_by_id(attendance_id, db)
        if not existing:
            raise HTTPException(status_code=404, detail="Attendance record not found")
        return await AttendanceService.update_attendance(attendance_id, attendance, current_user, db)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{attendance_id}", response_model=AttendanceRead)
async def delete_attendance(
    attendance_id: str,
    current_user: str = Depends(get_current_user),
    db: Prisma = Depends(get_db)
):
    """Delete an attendance record (Teacher only)."""
    try:
        existing = await AttendanceService.get_attendance_by_id(attendance_id, db)
        if not existing:
            raise HTTPException(status_code=404, detail="Attendance record not found")
        return await AttendanceService.delete_attendance(attendance_id, db)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Student Routes - View Attendance
@router.get("/student/{student_id}", response_model=List[AttendanceRead])
async def get_student_attendance(
    student_id: str,
    course_id: Optional[str] = Query(None),
    current_user: str = Depends(get_current_user),
    db: Prisma = Depends(get_db)
):
    """Get attendance records for a student."""
    try:
        # Add authorization check: student can only view their own records
        # or teacher can view any student's records
        return await AttendanceService.get_student_attendance(student_id, course_id, db)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{attendance_id}", response_model=AttendanceRead)
async def get_attendance(
    attendance_id: str,
    current_user: str = Depends(get_current_user),
    db: Prisma = Depends(get_db)
):
    """Get a specific attendance record by ID."""
    try:
        record = await AttendanceService.get_attendance_by_id(attendance_id, db)
        if not record:
            raise HTTPException(status_code=404, detail="Attendance record not found")
        return record
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))