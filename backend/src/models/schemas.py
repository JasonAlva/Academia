from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class UserBase(BaseModel):
    email: str
    name: str
    role: str

class UserCreate(UserBase):
    password: str

class UserUpdate(UserBase):
    password: Optional[str] = None

class StudentBase(BaseModel):
    studentId: str
    department: str
    semester: int
    batch: str
    phoneNumber: Optional[str] = None
    address: Optional[str] = None
    dateOfBirth: Optional[datetime] = None

class StudentCreate(StudentBase):
    userId: str

class StudentUpdate(StudentBase):
    pass

class TeacherBase(BaseModel):
    teacherId: str
    department: str
    designation: str
    specialization: Optional[str] = None
    phoneNumber: Optional[str] = None
    officeRoom: Optional[str] = None
    officeHours: Optional[str] = None
    joiningDate: Optional[datetime] = None

class TeacherCreate(TeacherBase):
    userId: str

class TeacherUpdate(TeacherBase):
    pass

class AdminBase(BaseModel):
    adminId: str

class AdminCreate(AdminBase):
    userId: str

class AdminUpdate(AdminBase):
    pass

class DepartmentBase(BaseModel):
    code: str
    name: str
    description: Optional[str] = None
    hodName: Optional[str] = None

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentUpdate(DepartmentBase):
    pass

class CourseBase(BaseModel):
    courseCode: str
    courseName: str
    credits: int
    departmentId: str
    semester: int
    description: Optional[str] = None
    syllabus: Optional[str] = None
    maxStudents: Optional[int] = None
    isActive: bool = True

class CourseCreate(CourseBase):
    pass

class CourseUpdate(CourseBase):
    pass

class EnrollmentBase(BaseModel):
    studentId: str
    courseId: str
    status: str
    grade: Optional[str] = None
    gradePoints: Optional[float] = None

class EnrollmentCreate(EnrollmentBase):
    pass

class EnrollmentUpdate(EnrollmentBase):
    pass

class ScheduleBase(BaseModel):
    courseId: str
    teacherId: str
    dayOfWeek: str
    startTime: str
    endTime: str
    room: str
    building: Optional[str] = None
    type: str = "LECTURE"
    isActive: bool = True

class ScheduleCreate(ScheduleBase):
    pass

class ScheduleUpdate(ScheduleBase):
    pass

class AttendanceBase(BaseModel):
    studentId: str
    courseId: str
    markedById: str
    date: datetime
    status: str
    remarks: Optional[str] = None

class AttendanceCreate(AttendanceBase):
    pass

class AttendanceUpdate(AttendanceBase):
    pass

class ChatMessageBase(BaseModel):
    userId: str
    role: str
    content: str
    metadata: Optional[dict] = None
    threadId: Optional[str] = None
    parentId: Optional[str] = None
    tokensUsed: Optional[int] = None
    responseTime: Optional[float] = None

class UserOut(UserBase):
    id: str
    createdAt: datetime

    class Config:
        orm_mode = True

class ChatMessageCreate(ChatMessageBase):
    pass

class ChatMessageUpdate(ChatMessageBase):
    pass