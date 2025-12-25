from datetime import datetime
from typing import List, Optional
from prisma import Prisma
from src.models.schemas import (
    ClassSessionCreate, 
    ClassSessionUpdate,
    StudentAttendanceCreate, 
    StudentAttendanceUpdate,
    TeacherAttendanceCreate,
    TeacherAttendanceUpdate
)

class AttendanceService:
    """Service for managing class sessions and attendance (both student and teacher)."""
    
    # ==================== CLASS SESSION METHODS ====================
    
    @staticmethod
    async def create_class_session(session: ClassSessionCreate, db: Prisma):
        """Create a new class session."""
        class_session = await db.classsession.create(
            data={
                'course': {'connect': {'id': session.courseId}},
                'schedule': {'connect': {'id': session.scheduleId}} if session.scheduleId else None,
                'teacher': {'connect': {'id': session.teacherId}},
                'date': session.date,
                'startTime': session.startTime,
                'endTime': session.endTime,
                'room': session.room,
                'topic': session.topic,
                'status': session.status,
                'notes': session.notes
            },
            include={
                'course': True,
                'teacher': {
                    'include': {
                        'user': True
                    }
                }
            }
        )
        return class_session

    @staticmethod
    async def get_class_session_by_id(session_id: str, db: Prisma):
        """Get a class session by ID."""
        return await db.classsession.find_unique(
            where={'id': session_id},
            include={
                'course': True,
                'teacher': {
                    'include': {
                        'user': True
                    }
                },
                'schedule': True
            }
        )

    @staticmethod
    async def get_course_sessions(course_id: str, date: Optional[datetime], db: Prisma):
        """Get all sessions for a course, optionally filtered by date."""
        where_clause = {'courseId': course_id}
        if date:
            where_clause['date'] = date
            
        return await db.classsession.find_many(
            where=where_clause,
            include={
                'course': True,
                'teacher': {
                    'include': {
                        'user': True
                    }
                }
            },
            order={'date': 'desc'}
        )

    @staticmethod
    async def update_class_session(session_id: str, session: ClassSessionUpdate, db: Prisma):
        """Update a class session."""
        update_data = {}
        if session.scheduleId is not None:
            update_data['schedule'] = {'connect': {'id': session.scheduleId}}
        if session.teacherId is not None:
            update_data['teacher'] = {'connect': {'id': session.teacherId}}
        if session.date is not None:
            update_data['date'] = session.date
        if session.startTime is not None:
            update_data['startTime'] = session.startTime
        if session.endTime is not None:
            update_data['endTime'] = session.endTime
        if session.room is not None:
            update_data['room'] = session.room
        if session.topic is not None:
            update_data['topic'] = session.topic
        if session.status is not None:
            update_data['status'] = session.status
        if session.notes is not None:
            update_data['notes'] = session.notes
            
        return await db.classsession.update(
            where={'id': session_id},
            data=update_data,
            include={
                'course': True,
                'teacher': {
                    'include': {
                        'user': True
                    }
                }
            }
        )

    @staticmethod
    async def delete_class_session(session_id: str, db: Prisma):
        """Delete a class session."""
        return await db.classsession.delete(
            where={'id': session_id}
        )

    # ==================== STUDENT ATTENDANCE METHODS ====================
    
    @staticmethod
    async def mark_attendance(attendance: StudentAttendanceCreate, marked_by_id: str, db: Prisma):
        """Mark attendance for a student in a session."""
        # Get the session to find the course
        session = await db.classsession.find_unique(
            where={'id': attendance.sessionId}
        )
        
        if not session:
            raise ValueError("Class session not found")
        
        attendance_record = await db.studentattendance.create(
            data={
                'session': {'connect': {'id': attendance.sessionId}},
                'student': {'connect': {'id': attendance.studentId}},
                'course': {'connect': {'id': session.courseId}},
                'markedBy': {'connect': {'id': marked_by_id}},
                'status': attendance.status,
                'remarks': attendance.remarks
            },
            include={
                'student': {
                    'include': {
                        'user': True
                    }
                },
                'course': True,
                'markedBy': {
                    'include': {
                        'user': True
                    }
                },
                'session': True
            }
        )
        return attendance_record

    @staticmethod
    async def bulk_mark_attendance(attendance_list: List[StudentAttendanceCreate], marked_by_id: str, db: Prisma):
        """Mark attendance for multiple students at once."""
        results = []
        for attendance in attendance_list:
            record = await AttendanceService.mark_attendance(attendance, marked_by_id, db)
            results.append(record)
        return results

    @staticmethod
    async def get_attendance_by_id(attendance_id: str, db: Prisma):
        """Get a specific student attendance record by ID."""
        return await db.studentattendance.find_unique(
            where={'id': attendance_id},
            include={
                'student': {
                    'include': {
                        'user': True
                    }
                },
                'course': True,
                'markedBy': {
                    'include': {
                        'user': True
                    }
                },
                'session': True
            }
        )

    @staticmethod
    async def get_course_attendance(course_id: str, date: Optional[datetime], db: Prisma):
        """Get attendance records for a course, optionally filtered by session date."""
        where_clause = {'courseId': course_id}
        
        if date:
            # Find sessions on that date first
            sessions = await db.classsession.find_many(
                where={
                    'courseId': course_id,
                    'date': date
                }
            )
            session_ids = [s.id for s in sessions]
            where_clause['sessionId'] = {'in': session_ids}
        
        return await db.studentattendance.find_many(
            where=where_clause,
            include={
                'student': {
                    'include': {
                        'user': True
                    }
                },
                'course': True,
                'markedBy': {
                    'include': {
                        'user': True
                    }
                },
                'session': True
            },
            order={'markedAt': 'desc'}
        )

    @staticmethod
    async def get_student_attendance(student_id: str, course_id: Optional[str], db: Prisma):
        """Get attendance records for a student, optionally filtered by course."""
        where_clause = {'studentId': student_id}
        if course_id:
            where_clause['courseId'] = course_id
            
        return await db.studentattendance.find_many(
            where=where_clause,
            include={
                'student': {
                    'include': {
                        'user': True
                    }
                },
                'course': True,
                'markedBy': {
                    'include': {
                        'user': True
                    }
                },
                'session': True
            },
            order={'markedAt': 'desc'}
        )

    @staticmethod
    async def update_attendance(attendance_id: str, attendance: StudentAttendanceUpdate, marked_by_id: str, db: Prisma):
        """Update a student attendance record."""
        update_data = {}
        if attendance.status is not None:
            update_data['status'] = attendance.status
        if attendance.remarks is not None:
            update_data['remarks'] = attendance.remarks
            
        return await db.studentattendance.update(
            where={'id': attendance_id},
            data=update_data,
            include={
                'student': {
                    'include': {
                        'user': True
                    }
                },
                'course': True,
                'markedBy': {
                    'include': {
                        'user': True
                    }
                },
                'session': True
            }
        )

    @staticmethod
    async def delete_attendance(attendance_id: str, db: Prisma):
        """Delete a student attendance record."""
        return await db.studentattendance.delete(
            where={'id': attendance_id}
        )

    @staticmethod
    async def get_all_students_attendance(db: Prisma):
        """Get attendance statistics for all students with course-wise breakdown."""
        students = await db.student.find_many(
            include={
                'user': True,
                'attendances': {
                    'include': {
                        'course': True,
                        'session': True
                    }
                },
                'enrollments': {
                    'include': {
                        'course': True
                    }
                }
            }
        )
        
        stats = []
        for student in students:
            # Group attendances by course
            courses_data = {}
            for enrollment in student.enrollments:
                course_id = enrollment.courseId
                course_attendances = [a for a in student.attendances if a.courseId == course_id]
                
                total_classes = len(course_attendances)
                attended_classes = sum(1 for a in course_attendances if a.status in ['PRESENT', 'LATE'])
                present_count = sum(1 for a in course_attendances if a.status == 'PRESENT')
                
                attendance_percentage = (present_count / total_classes * 100) if total_classes > 0 else 0
                
                courses_data[course_id] = {
                    'courseId': course_id,
                    'courseCode': enrollment.course.courseCode,
                    'courseName': enrollment.course.courseName,
                    'totalClasses': total_classes,
                    'attendedClasses': attended_classes,
                    'attendancePercentage': round(attendance_percentage, 2),
                    'status': 'Good' if attendance_percentage >= 75 else 'Warning' if attendance_percentage >= 60 else 'Critical'
                }
            
            stats.append({
                'studentId': student.id,
                'studentName': student.user.name if student.user else 'Unknown',
                'studentIdNumber': student.studentId,
                'department': student.department,
                'semester': student.semester,
                'courses': list(courses_data.values())
            })
        
        return stats

    # ==================== TEACHER ATTENDANCE METHODS ====================
    
    @staticmethod
    async def mark_teacher_attendance(attendance: TeacherAttendanceCreate, marked_by_id: str, db: Prisma):
        """Mark attendance for a teacher in a session."""
        # Get the session to find the course
        session = await db.classsession.find_unique(
            where={'id': attendance.sessionId}
        )
        
        if not session:
            raise ValueError("Class session not found")
        
        attendance_record = await db.teacherattendance.create(
            data={
                'session': {'connect': {'id': attendance.sessionId}},
                'teacher': {'connect': {'id': attendance.teacherId}},
                'course': {'connect': {'id': session.courseId}},
                'markedBy': {'connect': {'id': marked_by_id}},
                'status': attendance.status,
                'remarks': attendance.remarks
            },
            include={
                'teacher': {
                    'include': {
                        'user': True
                    }
                },
                'course': True,
                'session': True
            }
        )
        return attendance_record

    @staticmethod
    async def get_teacher_attendance_by_id(attendance_id: str, db: Prisma):
        """Get a specific teacher attendance record by ID."""
        return await db.teacherattendance.find_unique(
            where={'id': attendance_id},
            include={
                'teacher': {
                    'include': {
                        'user': True
                    }
                },
                'course': True,
                'session': True
            }
        )

    @staticmethod
    async def get_teacher_attendance(teacher_id: str, course_id: Optional[str], db: Prisma):
        """Get attendance records for a teacher, optionally filtered by course."""
        where_clause = {'teacherId': teacher_id}
        if course_id:
            where_clause['courseId'] = course_id
            
        return await db.teacherattendance.find_many(
            where=where_clause,
            include={
                'teacher': {
                    'include': {
                        'user': True
                    }
                },
                'course': True,
                'session': True
            },
            order={'markedAt': 'desc'}
        )

    @staticmethod
    async def update_teacher_attendance(attendance_id: str, attendance: TeacherAttendanceUpdate, db: Prisma):
        """Update a teacher attendance record."""
        update_data = {}
        if attendance.status is not None:
            update_data['status'] = attendance.status
        if attendance.remarks is not None:
            update_data['remarks'] = attendance.remarks
            
        return await db.teacherattendance.update(
            where={'id': attendance_id},
            data=update_data,
            include={
                'teacher': {
                    'include': {
                        'user': True
                    }
                },
                'course': True,
                'session': True
            }
        )

    @staticmethod
    async def delete_teacher_attendance(attendance_id: str, db: Prisma):
        """Delete a teacher attendance record."""
        return await db.teacherattendance.delete(
            where={'id': attendance_id}
        )

    @staticmethod
    async def get_all_teachers_attendance(db: Prisma):
        """Get attendance statistics for all teachers with course-wise breakdown."""
        teachers = await db.teacher.find_many(
            include={
                'user': True,
                'teacherAttendances': {
                    'include': {
                        'course': True,
                        'session': True
                    }
                },
                'coursesTeaching': {
                    'include': {
                        'enrollments': True
                    }
                }
            }
        )
        
        stats = []
        for teacher in teachers:
            # Group data by course
            courses_data = {}
            for course in teacher.coursesTeaching:
                course_id = course.id
                course_attendances = [a for a in teacher.teacherAttendances if a.courseId == course_id]
                
                total_classes_conducted = len(course_attendances)
                total_students_enrolled = len(course.enrollments)
                present_sessions = sum(1 for a in course_attendances if a.status == 'PRESENT')
                
                attendance_percentage = (present_sessions / total_classes_conducted * 100) if total_classes_conducted > 0 else 0
                
                courses_data[course_id] = {
                    'courseId': course_id,
                    'courseCode': course.courseCode,
                    'courseName': course.courseName,
                    'totalClassesConducted': total_classes_conducted,
                    'totalStudentsEnrolled': total_students_enrolled,
                    'averageAttendancePercentage': round(attendance_percentage, 2)
                }
            
            stats.append({
                'teacherId': teacher.id,
                'teacherName': teacher.user.name if teacher.user else 'Unknown',
                'teacherIdNumber': teacher.teacherId,
                'department': teacher.department,
                'courses': list(courses_data.values())
            })
        
        return stats