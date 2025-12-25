from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from datetime import datetime
from src.models.schemas import (
    ClassSessionCreate,
    ClassSessionUpdate,
    ClassSessionOut,
    StudentAttendanceCreate, 
    StudentAttendanceRead, 
    StudentAttendanceUpdate,
    TeacherAttendanceCreate,
    TeacherAttendanceRead,
    TeacherAttendanceUpdate
)
from src.services.attendance_service import AttendanceService
from src.api.dependencies import get_current_user, get_db
from src.models.schemas import UserOut
from prisma import Prisma

router = APIRouter()

# ==================== CLASS SESSION ROUTES ====================

@router.post("/sessions", response_model=ClassSessionOut)
async def create_class_session(
    session: ClassSessionCreate,
    current_user: UserOut = Depends(get_current_user),
    db: Prisma = Depends(get_db)
):
    """Create a new class session (Teacher/Admin only)."""
    try:
        return await AttendanceService.create_class_session(session, db)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/sessions/{session_id}", response_model=ClassSessionOut)
async def get_class_session(
    session_id: str,
    current_user: UserOut = Depends(get_current_user),
    db: Prisma = Depends(get_db)
):
    """Get a class session by ID."""
    try:
        session = await AttendanceService.get_class_session_by_id(session_id, db)
        if not session:
            raise HTTPException(status_code=404, detail="Class session not found")
        return session
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/sessions/course/{course_id}", response_model=List[ClassSessionOut])
async def get_course_sessions(
    course_id: str,
    date: Optional[datetime] = Query(None),
    current_user: UserOut = Depends(get_current_user),
    db: Prisma = Depends(get_db)
):
    """Get all sessions for a course."""
    try:
        return await AttendanceService.get_course_sessions(course_id, date, db)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/sessions/{session_id}", response_model=ClassSessionOut)
async def update_class_session(
    session_id: str,
    session: ClassSessionUpdate,
    current_user: UserOut = Depends(get_current_user),
    db: Prisma = Depends(get_db)
):
    """Update a class session (Teacher/Admin only)."""
    try:
        existing = await AttendanceService.get_class_session_by_id(session_id, db)
        if not existing:
            raise HTTPException(status_code=404, detail="Class session not found")
        return await AttendanceService.update_class_session(session_id, session, db)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/sessions/{session_id}", response_model=ClassSessionOut)
async def delete_class_session(
    session_id: str,
    current_user: UserOut = Depends(get_current_user),
    db: Prisma = Depends(get_db)
):
    """Delete a class session (Admin only)."""
    try:
        existing = await AttendanceService.get_class_session_by_id(session_id, db)
        if not existing:
            raise HTTPException(status_code=404, detail="Class session not found")
        return await AttendanceService.delete_class_session(session_id, db)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ==================== STUDENT ATTENDANCE ROUTES ====================

@router.post("/", response_model=StudentAttendanceRead)
async def mark_attendance(
    attendance: StudentAttendanceCreate,
    current_user: UserOut = Depends(get_current_user),
    db: Prisma = Depends(get_db)
):
    """Mark attendance for a student (Teacher only)."""
    try:
        # Get teacher record from current user
        teacher = await db.teacher.find_unique(
            where={'userId': current_user.id}
        )
        if not teacher:
            raise HTTPException(status_code=403, detail="Only teachers can mark attendance")
        
        return await AttendanceService.mark_attendance(attendance, teacher.id, db)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/bulk", response_model=List[StudentAttendanceRead])
async def bulk_mark_attendance(
    attendance_list: List[StudentAttendanceCreate],
    current_user: UserOut = Depends(get_current_user),
    db: Prisma = Depends(get_db)
):
    """Mark attendance for multiple students at once (Teacher only)."""
    try:
        # Get teacher record from current user
        teacher = await db.teacher.find_unique(
            where={'userId': current_user.id}
        )
        if not teacher:
            raise HTTPException(status_code=403, detail="Only teachers can mark attendance")
        
        return await AttendanceService.bulk_mark_attendance(attendance_list, teacher.id, db)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/course/{course_id}", response_model=List[StudentAttendanceRead])
async def get_course_attendance(
    course_id: str,
    date: Optional[datetime] = Query(None),
    current_user: UserOut = Depends(get_current_user),
    db: Prisma = Depends(get_db)
):
    """Get attendance records for a course (Teacher view)."""
    try:
        return await AttendanceService.get_course_attendance(course_id, date, db)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{attendance_id}", response_model=StudentAttendanceRead)
async def update_attendance(
    attendance_id: str,
    attendance: StudentAttendanceUpdate,
    current_user: UserOut = Depends(get_current_user),
    db: Prisma = Depends(get_db)
):
    """Update an attendance record (Teacher only)."""
    try:
        # Get teacher record from current user
        teacher = await db.teacher.find_unique(
            where={'userId': current_user.id}
        )
        if not teacher:
            raise HTTPException(status_code=403, detail="Only teachers can update attendance")
        
        existing = await AttendanceService.get_attendance_by_id(attendance_id, db)
        if not existing:
            raise HTTPException(status_code=404, detail="Attendance record not found")
        return await AttendanceService.update_attendance(attendance_id, attendance, teacher.id, db)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{attendance_id}", response_model=StudentAttendanceRead)
async def delete_attendance(
    attendance_id: str,
    current_user: UserOut = Depends(get_current_user),
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

@router.get("/student/{student_id}", response_model=List[StudentAttendanceRead])
async def get_student_attendance(
    student_id: str,
    course_id: Optional[str] = Query(None),
    current_user: UserOut = Depends(get_current_user),
    db: Prisma = Depends(get_db)
):
    """Get attendance records for a student."""
    try:
        # Authorization: student can only view their own records
        student = await db.student.find_unique(
            where={'userId': current_user.id}
        )
        if student and student.id != student_id and current_user.role not in ["TEACHER", "ADMIN"]:
            raise HTTPException(status_code=403, detail="You can only view your own attendance")
        
        return await AttendanceService.get_student_attendance(student_id, course_id, db)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{attendance_id}", response_model=StudentAttendanceRead)
async def get_attendance(
    attendance_id: str,
    current_user: UserOut = Depends(get_current_user),
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

@router.get("/statistics/students")
async def get_all_students_attendance(
    current_user: UserOut = Depends(get_current_user),
    db: Prisma = Depends(get_db)
):
    """Get attendance statistics for all students (Admin only)."""
    try:
        if current_user.role != "ADMIN":
            raise HTTPException(status_code=403, detail="Admin access required")
        return await AttendanceService.get_all_students_attendance(db)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ==================== TEACHER ATTENDANCE ROUTES ====================

@router.post("/teacher", response_model=TeacherAttendanceRead)
async def mark_teacher_attendance(
    attendance: TeacherAttendanceCreate,
    current_user: UserOut = Depends(get_current_user),
    db: Prisma = Depends(get_db)
):
    """Mark attendance for a teacher (Admin only)."""
    try:
        if current_user.role != "ADMIN":
            raise HTTPException(status_code=403, detail="Admin access required")
        
        # Get admin record from current user
        admin = await db.admin.find_unique(
            where={'userId': current_user.id}
        )
        if not admin:
            raise HTTPException(status_code=403, detail="Admin profile not found")
        
        return await AttendanceService.mark_teacher_attendance(attendance, admin.id, db)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/teacher/{teacher_id}", response_model=List[TeacherAttendanceRead])
async def get_teacher_attendance(
    teacher_id: str,
    course_id: Optional[str] = Query(None),
    current_user: UserOut = Depends(get_current_user),
    db: Prisma = Depends(get_db)
):
    """Get attendance records for a teacher."""
    try:
        # Authorization: teacher can only view their own records unless admin
        teacher = await db.teacher.find_unique(
            where={'userId': current_user.id}
        )
        if teacher and teacher.id != teacher_id and current_user.role != "ADMIN":
            raise HTTPException(status_code=403, detail="You can only view your own attendance")
        
        return await AttendanceService.get_teacher_attendance(teacher_id, course_id, db)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/teacher/{attendance_id}", response_model=TeacherAttendanceRead)
async def update_teacher_attendance(
    attendance_id: str,
    attendance: TeacherAttendanceUpdate,
    current_user: UserOut = Depends(get_current_user),
    db: Prisma = Depends(get_db)
):
    """Update a teacher attendance record (Admin only)."""
    try:
        if current_user.role != "ADMIN":
            raise HTTPException(status_code=403, detail="Admin access required")
        
        existing = await AttendanceService.get_teacher_attendance_by_id(attendance_id, db)
        if not existing:
            raise HTTPException(status_code=404, detail="Teacher attendance record not found")
        return await AttendanceService.update_teacher_attendance(attendance_id, attendance, db)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/teacher/{attendance_id}", response_model=TeacherAttendanceRead)
async def delete_teacher_attendance(
    attendance_id: str,
    current_user: UserOut = Depends(get_current_user),
    db: Prisma = Depends(get_db)
):
    """Delete a teacher attendance record (Admin only)."""
    try:
        if current_user.role != "ADMIN":
            raise HTTPException(status_code=403, detail="Admin access required")
        
        existing = await AttendanceService.get_teacher_attendance_by_id(attendance_id, db)
        if not existing:
            raise HTTPException(status_code=404, detail="Teacher attendance record not found")
        return await AttendanceService.delete_teacher_attendance(attendance_id, db)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/statistics/teachers")
async def get_all_teachers_attendance(
    current_user: UserOut = Depends(get_current_user),
    db: Prisma = Depends(get_db)
):
    """Get attendance statistics for all teachers (Admin only)."""
    try:
        if current_user.role != "ADMIN":
            raise HTTPException(status_code=403, detail="Admin access required")
        return await AttendanceService.get_all_teachers_attendance(db)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))