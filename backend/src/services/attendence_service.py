from datetime import datetime
from typing import List, Optional

from prisma import Prisma
from prisma.models import Attendance

class AttendanceService:
    def __init__(self, db: Prisma):
        self.db = db

    async def mark_attendance(
        self, 
        student_id: str, 
        course_id: str, 
        date: datetime, 
        status: str, 
        remarks: Optional[str] = None
    ) -> Attendance:
        """Mark attendance for a student in a course."""
        attendance_record = await self.db.attendance.create(
            data={
                'student': {'connect': {'id': student_id}},
                'course': {'connect': {'id': course_id}},
                'date': date,
                'status': status,
                'remarks': remarks
            }
        )
        return attendance_record

    async def get_attendance(
        self, 
        student_id: str, 
        course_id: str, 
        date: datetime
    ) -> Optional[Attendance]:
        """Get attendance record for a specific date."""
        attendance_record = await self.db.attendance.find_first(
            where={
                'student_id': student_id,
                'course_id': course_id,
                'date': date
            }
        )
        return attendance_record

    async def get_attendance_records(
        self, 
        student_id: str, 
        course_id: str
    ) -> List[Attendance]:
        """Get all attendance records for a student in a course."""
        attendance_records = await self.db.attendance.find_many(
            where={
                'student_id': student_id,
                'course_id': course_id
            },
            order={'date': 'desc'}
        )
        return attendance_records

    async def update_attendance(
        self, 
        attendance_id: str, 
        status: str, 
        remarks: Optional[str] = None
    ) -> Attendance:
        """Update an existing attendance record."""
        updated_attendance = await self.db.attendance.update(
            where={'id': attendance_id},
            data={
                'status': status,
                'remarks': remarks
            }
        )
        return updated_attendance

    async def delete_attendance(self, attendance_id: str) -> Attendance:
        """Delete an attendance record."""
        deleted_attendance = await self.db.attendance.delete(
            where={'id': attendance_id}
        )
        return deleted_attendance