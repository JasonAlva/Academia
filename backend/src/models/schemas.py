from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: str

class UserCreate(UserBase):
    password: str

    
    
    
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    role: Optional[str] = None
    password: Optional[str] = None

class UserResponse(UserBase):
    id: str
    createdAt: datetime
    updatedAt: datetime
    
    class Config:
        from_attributes = True
class UserOut(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: str
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True


# Student Schemas
class StudentBase(BaseModel):
    studentId: str = Field(alias="studentId")
    department: str
    semester: int
    batch: str
    phoneNumber: Optional[str]=None
    address: Optional[str] = None
    dateOfBirth: Optional[datetime] = Field(None, alias="dateOfBirth")

class StudentUserCreate(StudentBase):
    email: EmailStr
    name: str
    password:str

    class Config:
        populate_by_name = True
    
class StudentCreate(BaseModel):
    studentId: str = Field(alias="studentId")
    department: str
    semester: int
    batch: str
    userId: str = Field(alias="userId")

    class Config:
        populate_by_name = True

class StudentUpdate(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None
    semester: Optional[int] = None
    batch: Optional[str] = None
    phoneNumber: Optional[str] =None
    address: Optional[str] = None
    dateOfBirth: Optional[datetime] = Field(None, alias="dateOfBirth")

    class Config:
        populate_by_name = True

class StudentResponse(StudentBase):
    id: str
    userId: str = Field(alias="userId")
    createdAt: datetime
    updatedAt: datetime
    
    class Config:
        from_attributes = True
        populate_by_name = True

#student with nested user
class StudentOut(BaseModel):
    id: str
    userId: str
    studentId: str
    department: str
    semester: int
    batch: str
    phoneNumber: Optional[str] = None
    address: Optional[str] = None
    dateOfBirth: Optional[datetime] = None
    createdAt: datetime
    updatedAt: datetime
    user: Optional[UserOut] = None

    class Config:
        from_attributes = True

# Teacher Schemas
class TeacherBase(BaseModel):
    teacherId: str 
    department: str
    designation: str
    specialization: Optional[str] = None
    phoneNumber: Optional[str] =None
    officeRoom: Optional[str] =None
    officeHours: Optional[str] = None
    joiningDate: Optional[datetime] = None

class TeacherCreateWithUser(TeacherBase):
    name: str
    email: str
    password: str

class TeacherCreate(TeacherBase):
   
    userId: str = Field(alias="userId")

class TeacherUpdate(BaseModel):
    department: Optional[str] = None
    designation: Optional[str] = None
    specialization: Optional[str] = None
    phoneNumber: Optional[str] 
    officeRoom: Optional[str] =None
    officeHours: Optional[str] = None
    joiningDate: Optional[datetime] = None

class TeacherResponse(TeacherBase):
    id: str
    userId: str = Field(alias="userId")
    createdAt: datetime
    updatedAt: datetime
    
    class Config:
        from_attributes = True
        populate_by_name = True

#teacher with nested user
class TeacherOut(BaseModel):
    id: str
    userId: str
    teacherId: str
    department: str
    designation: str
    specialization: Optional[str] = None
    phoneNumber: Optional[str] = None
    officeRoom: Optional[str] = None
    officeHours: Optional[str] = None
    joiningDate: Optional[datetime] = None
    createdAt: datetime
    updatedAt: datetime
    user: Optional[UserOut] = None   # nested user object

    class Config:
        from_attributes = True


# Admin Schemas
class AdminBase(BaseModel):
    admin_id: str = Field(alias="adminId")

class AdminCreate(AdminBase):
    userId: str = Field(alias="userId")

class AdminUpdate(BaseModel):
    admin_id: Optional[str] = Field(None, alias="adminId")

class AdminResponse(AdminBase):
    id: str
    userId: str = Field(alias="userId")
    createdAt: datetime
    updatedAt: datetime
    
    class Config:
        from_attributes = True
        populate_by_name = True

class AdminOut(BaseModel):
    id: str
    adminId: str
    userId: str
    user: UserOut
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True

# Department Schemas
class DepartmentBase(BaseModel):
    code: str
    name: str
    description: Optional[str] = None
    hod_name: Optional[str] = Field(None, alias="hodName")

class DepartmentSchema(BaseModel):
    id: str
    name: str
    code: str
    description: Optional[str] = None
    hodName: Optional[str] = None
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True

class DepartmentCreate(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    hodName: Optional[str] = None

class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    hodName: Optional[str] = None

class DepartmentResponse(DepartmentBase):
    id: str
    createdAt: datetime
    updatedAt: datetime
    
    class Config:
        from_attributes = True
        populate_by_name = True

# Course Schemas
class CourseBase(BaseModel):
    course_code: str = Field(alias="courseCode")
    course_name: str = Field(alias="courseName")
    teacherId: Optional[str] = None
    credits: int
    department_id: str = Field(alias="departmentId")
    semester: int
    description: Optional[str] = None
    syllabus: Optional[str] = None
    max_students: Optional[int] = Field(None, alias="maxStudents")
    is_active: bool = Field(True, alias="isActive")

class CourseCreate(CourseBase):
    pass

class CourseUpdate(BaseModel):
    course_code: Optional[str] = Field(None, alias="courseCode")
    course_name: Optional[str] = Field(None, alias="courseName")
    credits: Optional[int] = None
    teacherId: Optional[str] = None
    department_id: Optional[str] = Field(None, alias="departmentId")
    semester: Optional[int] = None
    description: Optional[str] = None
    syllabus: Optional[str] = None
    max_students: Optional[int] = Field(None, alias="maxStudents")
    is_active: Optional[bool] = Field(None, alias="isActive")

class CourseResponse(CourseBase):
    id: str
    createdAt: datetime
    updatedAt: datetime
    
    class Config:
        from_attributes = True
        populate_by_name = True

# Enrollment Schemas
class EnrollmentBase(BaseModel):
    student_id: str = Field(alias="studentId")
    course_id: str = Field(alias="courseId")
    status: str
    grade: Optional[str] = None
    grade_points: Optional[float] = Field(None, alias="gradePoints")

class EnrollmentCreate(BaseModel):
    student_id: str = Field(alias="studentId")
    course_id: str = Field(alias="courseId")

class EnrollmentUpdate(BaseModel):
    status: Optional[str] = None
    grade: Optional[str] = None
    grade_points: Optional[float] = Field(None, alias="gradePoints")

class EnrollmentResponse(BaseModel):
    id: str
    student_id: str = Field(alias="studentId")
    course_id: str = Field(alias="courseId")
    status: Optional[str] = None
    grade: Optional[str] = None
    grade_points: Optional[float] = Field(None, alias="gradePoints")
    enrolled_at: datetime = Field(alias="enrolledAt")
    
    class Config:
        from_attributes = True
        populate_by_name = True

# Schedule Schemas
class ScheduleBase(BaseModel):
    course_id: str = Field(alias="courseId")
    teacherId: Optional[str] = Field(None, alias="teacherId")
    day_of_week: str = Field(alias="dayOfWeek")
    start_time: str = Field(alias="startTime")
    end_time: str = Field(alias="endTime")
    room: str
    building: Optional[str] = None
    type: str = "LECTURE"
    is_active: bool = Field(True, alias="isActive")

class ScheduleCreate(ScheduleBase):
    pass

class ScheduleUpdate(BaseModel):
    course_id: Optional[str] = Field(None, alias="courseId")
    teacherId: Optional[str] = Field(None, alias="teacherId")
    day_of_week: Optional[str] = Field(None, alias="dayOfWeek")
    start_time: Optional[str] = Field(None, alias="startTime")
    end_time: Optional[str] = Field(None, alias="endTime")
    room: Optional[str] = None
    building: Optional[str] = None
    type: Optional[str] = None
    is_active: Optional[bool] = Field(None, alias="isActive")

class ScheduleResponse(ScheduleBase):
    id: str
    createdAt: datetime
    updatedAt: datetime
    
    class Config:
        from_attributes = True
        populate_by_name = True

# ClassSession Schemas
class ClassSessionBase(BaseModel):
    courseId: str
    scheduleId: Optional[str] = None
    teacherId: str
    date: datetime
    startTime: str
    endTime: str
    room: Optional[str] = None
    topic: Optional[str] = None
    status: str = "SCHEDULED"
    notes: Optional[str] = None

class ClassSessionCreate(ClassSessionBase):
    pass

class ClassSessionUpdate(BaseModel):
    scheduleId: Optional[str] = None
    teacherId: Optional[str] = None
    date: Optional[datetime] = None
    startTime: Optional[str] = None
    endTime: Optional[str] = None
    room: Optional[str] = None
    topic: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class ClassSessionOut(BaseModel):
    id: str
    courseId: str
    scheduleId: Optional[str] = None
    teacherId: str
    date: datetime
    startTime: str
    endTime: str
    room: Optional[str] = None
    topic: Optional[str] = None
    status: str
    notes: Optional[str] = None
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True

# Student Attendance Schemas
class StudentAttendanceBase(BaseModel):
    sessionId: str
    studentId: str
    courseId: str
    status: str
    remarks: Optional[str] = None

class StudentOut(BaseModel):
    id: str
    userId: str
    studentId: str
    department: str
    semester: int
    batch: str
    phoneNumber: Optional[str] = None
    address: Optional[str] = None
    dateOfBirth: Optional[datetime] = None
    createdAt: datetime
    updatedAt: datetime
    user: Optional[UserOut] = None

    class Config:
        from_attributes = True

class TeacherOut(BaseModel):
    id: str
    userId: str
    teacherId: str
    department: str
    designation: str
    specialization: Optional[str] = None
    phoneNumber: Optional[str] = None
    officeRoom: Optional[str] = None
    officeHours: Optional[str] = None
    joiningDate: Optional[datetime] = None
    createdAt: datetime
    updatedAt: datetime
    user: Optional[UserOut] = None

    class Config:
        from_attributes = True

class CourseOut(BaseModel):
    id: str
    courseCode: str
    courseName: str
    credits: int
    departmentId: str
    semester: int
    description: Optional[str] = None
    syllabus: Optional[str] = None
    maxStudents: Optional[int] = None
    isActive: bool
    teacherId: Optional[str] = None
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True

class StudentAttendanceRead(BaseModel):
    id: str
    sessionId: str
    studentId: str
    courseId: str
    status: str
    markedById: str
    remarks: Optional[str] = None
    markedAt: datetime
    updatedAt: datetime
    student: Optional[StudentOut] = None
    course: Optional[CourseOut] = None
    markedBy: Optional[TeacherOut] = None
    session: Optional[ClassSessionOut] = None

    class Config:
        from_attributes = True
class StudentAttendanceCreate(BaseModel):
    sessionId: str
    studentId: str
    status: str
    remarks: Optional[str] = None

class StudentAttendanceUpdate(BaseModel):
    status: Optional[str] = None
    remarks: Optional[str] = None

class StudentAttendanceResponse(StudentAttendanceBase):
    id: str
    markedById: str
    markedAt: datetime
    updatedAt: datetime
    
    class Config:
        from_attributes = True
        populate_by_name = True

# Teacher Attendance Schemas
class TeacherAttendanceBase(BaseModel):
    sessionId: str
    teacherId: str
    courseId: str
    status: str
    remarks: Optional[str] = None

class TeacherAttendanceCreate(BaseModel):
    sessionId: str
    teacherId: str
    status: str
    remarks: Optional[str] = None

class TeacherAttendanceUpdate(BaseModel):
    status: Optional[str] = None
    remarks: Optional[str] = None

class TeacherAttendanceRead(BaseModel):
    id: str
    sessionId: str
    teacherId: str
    courseId: str
    status: str
    markedById: str
    remarks: Optional[str] = None
    markedAt: datetime
    updatedAt: datetime
    teacher: Optional[TeacherOut] = None
    course: Optional[CourseOut] = None
    session: Optional[ClassSessionOut] = None

    class Config:
        from_attributes = True

class TeacherAttendanceResponse(TeacherAttendanceBase):
    id: str
    markedById: str
    markedAt: datetime
    updatedAt: datetime
    
    class Config:
        from_attributes = True
        populate_by_name = True

# Chat Message Schemas
class ChatMessageBase(BaseModel):
    userId: str = Field(alias="userId")
    role: str
    content: str
    metadata: Optional[dict] = None
    thread_id: Optional[str] = Field(None, alias="threadId")
    parent_id: Optional[str] = Field(None, alias="parentId")
    tokens_used: Optional[int] = Field(None, alias="tokensUsed")
    response_time: Optional[float] = Field(None, alias="responseTime")

class ChatMessageCreate(ChatMessageBase):
    pass

class ChatMessageUpdate(BaseModel):
    content: Optional[str] = None
    metadata: Optional[dict] = None

class ChatMessageResponse(ChatMessageBase):
    id: str
    createdAt: datetime = Field(alias="createdAt")
    
    class Config:
        from_attributes = True
        populate_by_name = True

# Authentication Schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    userId: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str  # "STUDENT", "TEACHER", or "ADMIN"
    
    # Optional fields for Student
    studentId: Optional[str] = None
    department: Optional[str] = None
    semester: Optional[int] = None
    batch: Optional[str] = None
    phoneNumber: Optional[str] = None
    address: Optional[str] = None
    dateOfBirth: Optional[datetime] = None
    
    # Optional fields for Teacher
    teacherId: Optional[str] = None
    designation: Optional[str] = None
    specialization: Optional[str] = None
    officeRoom: Optional[str] = None
    officeHours: Optional[str] = None
    joiningDate: Optional[datetime] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

# Timetable Schemas
class PeriodDetails(BaseModel):
    teacher: str
    subject: str
    room: str

class DaySchedule(BaseModel):
    periods: List[Optional[PeriodDetails]]

class TimeTableType(BaseModel):
    days: List[Optional[DaySchedule]]

class FullTimeTable(BaseModel):
    semesters: List[List[TimeTableType]]

class SubjectDetails(BaseModel):
    subjectName: str
    teacherName: str
    roomCodes: List[str]
    color: Optional[str] = None

class SubjectsDetailsList(BaseModel):
    subjects: dict

class SaveScheduleRequest(BaseModel):
    semester: int
    section: int
    timetable: str  # JSON string of List[List[Optional[List[str]]]]
    departmentId: Optional[str] = None

class GenerateTimeTableRequest(BaseModel):
    pass