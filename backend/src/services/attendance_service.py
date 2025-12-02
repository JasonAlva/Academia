from datetime import datetime
from typing import List, Optional
from prisma import Prisma
from prisma.models import Attendance
from src.models.schemas import AttendanceCreate, AttendanceUpdate

class AttendanceService:
    @staticmethod
    async def mark_attendance(
        attendance_data: AttendanceCreate,
        current_user: str,
        db: Prisma
    ) -> Attendance:
        """Mark attendance for a student in a course (Teacher only)."""
        attendance_record = await db.attendance.create(
            data={
                'student': {'connect': {'id': attendance_data.student_id}},
                'course': {'connect': {'id': attendance_data.course_id}},
                'date': attendance_data.date,
                'status': attendance_data.status,
                'remarks': attendance_data.remarks,
                'marked_by': current_user
            }
        )
        return attendance_record

    @staticmethod
    async def get_attendance_by_id(
        attendance_id: str,
        db: Prisma
    ) -> Optional[Attendance]:
        """Get a specific attendance record by ID."""
        return await db.attendance.find_unique(
            where={'id': attendance_id},
            include={'student': True, 'course': True}
        )

    @staticmethod
    async def get_student_attendance(
        student_id: str,
        course_id: Optional[str],
        db: Prisma
    ) -> List[Attendance]:
        """Get attendance records for a student."""
        where_clause = {'student_id': student_id}
        if course_id:
            where_clause['course_id'] = course_id
        
        return await db.attendance.find_many(
            where=where_clause,
            include={'course': True},
            order={'date': 'desc'}
        )

    @staticmethod
    async def get_course_attendance(
        course_id: str,
        date: Optional[datetime],
        db: Prisma
    ) -> List[Attendance]:
        """Get attendance records for a course (Teacher view)."""
        where_clause = {'course_id': course_id}
        if date:
            where_clause['date'] = date
        
        return await db.attendance.find_many(
            where=where_clause,
            include={'student': True},
            order={'date': 'desc'}
        )

    @staticmethod
    async def update_attendance(
        attendance_id: str,
        attendance_data: AttendanceUpdate,
        current_user: str,
        db: Prisma
    ) -> Attendance:
        """Update an existing attendance record (Teacher only)."""
        update_data = attendance_data.dict(exclude_unset=True)
        update_data['updated_by'] = current_user
        
        return await db.attendance.update(
            where={'id': attendance_id},
            data=update_data
        )

    @staticmethod
    async def delete_attendance(
        attendance_id: str,
        db: Prisma
    ) -> Attendance:
        """Delete an attendance record (Teacher only)."""
        return await db.attendance.delete(
            where={'id': attendance_id}
        )

    @staticmethod
    async def bulk_mark_attendance(
        attendance_list: List[AttendanceCreate],
        current_user: str,
        db: Prisma
    ) -> List[Attendance]:
        """Mark attendance for multiple students at once (Teacher only)."""
        created_records = []
        for attendance_data in attendance_list:
            record = await AttendanceService.mark_attendance(
                attendance_data, current_user, db
            )
            created_records.append(record)
        return created_records
