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
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Student Schemas
class StudentBase(BaseModel):
    student_id: str = Field(alias="studentId")
    department: str
    semester: int
    batch: str
    phone_number: Optional[str] = Field(None, alias="phoneNumber")
    address: Optional[str] = None
    date_of_birth: Optional[datetime] = Field(None, alias="dateOfBirth")

class StudentCreate(StudentBase):
    user_id: str = Field(alias="userId")

class StudentUpdate(BaseModel):
    department: Optional[str] = None
    semester: Optional[int] = None
    batch: Optional[str] = None
    phone_number: Optional[str] = Field(None, alias="phoneNumber")
    address: Optional[str] = None
    date_of_birth: Optional[datetime] = Field(None, alias="dateOfBirth")

class StudentResponse(StudentBase):
    id: str
    user_id: str = Field(alias="userId")
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
        populate_by_name = True

# Teacher Schemas
class TeacherBase(BaseModel):
    teacher_id: str = Field(alias="teacherId")
    department: str
    designation: str
    specialization: Optional[str] = None
    phone_number: Optional[str] = Field(None, alias="phoneNumber")
    office_room: Optional[str] = Field(None, alias="officeRoom")
    office_hours: Optional[str] = Field(None, alias="officeHours")
    joining_date: Optional[datetime] = Field(None, alias="joiningDate")

class TeacherCreate(TeacherBase):
    user_id: str = Field(alias="userId")

class TeacherUpdate(BaseModel):
    department: Optional[str] = None
    designation: Optional[str] = None
    specialization: Optional[str] = None
    phone_number: Optional[str] = Field(None, alias="phoneNumber")
    office_room: Optional[str] = Field(None, alias="officeRoom")
    office_hours: Optional[str] = Field(None, alias="officeHours")
    joining_date: Optional[datetime] = Field(None, alias="joiningDate")

class TeacherResponse(TeacherBase):
    id: str
    user_id: str = Field(alias="userId")
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
        populate_by_name = True

# Admin Schemas
class AdminBase(BaseModel):
    admin_id: str = Field(alias="adminId")

class AdminCreate(AdminBase):
    user_id: str = Field(alias="userId")

class AdminUpdate(BaseModel):
    admin_id: Optional[str] = Field(None, alias="adminId")

class AdminResponse(AdminBase):
    id: str
    user_id: str = Field(alias="userId")
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
        populate_by_name = True

# Department Schemas
class DepartmentBase(BaseModel):
    code: str
    name: str
    description: Optional[str] = None
    hod_name: Optional[str] = Field(None, alias="hodName")

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentUpdate(BaseModel):
    code: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    hod_name: Optional[str] = Field(None, alias="hodName")

class DepartmentResponse(DepartmentBase):
    id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
        populate_by_name = True

# Course Schemas
class CourseBase(BaseModel):
    course_code: str = Field(alias="courseCode")
    course_name: str = Field(alias="courseName")
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
    department_id: Optional[str] = Field(None, alias="departmentId")
    semester: Optional[int] = None
    description: Optional[str] = None
    syllabus: Optional[str] = None
    max_students: Optional[int] = Field(None, alias="maxStudents")
    is_active: Optional[bool] = Field(None, alias="isActive")

class CourseResponse(CourseBase):
    id: str
    created_at: datetime
    updated_at: datetime
    
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
    semester: str
    academic_year: str = Field(alias="academicYear")

class EnrollmentUpdate(BaseModel):
    semester: Optional[str] = None
    academic_year: Optional[str] = Field(None, alias="academicYear")
    status: Optional[str] = None
    grade: Optional[str] = None
    grade_points: Optional[float] = Field(None, alias="gradePoints")

class EnrollmentResponse(BaseModel):
    id: str
    student_id: str = Field(alias="studentId")
    course_id: str = Field(alias="courseId")
    semester: str
    academic_year: str = Field(alias="academicYear")
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
    teacher_id: str = Field(alias="teacherId")
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
    teacher_id: Optional[str] = Field(None, alias="teacherId")
    day_of_week: Optional[str] = Field(None, alias="dayOfWeek")
    start_time: Optional[str] = Field(None, alias="startTime")
    end_time: Optional[str] = Field(None, alias="endTime")
    room: Optional[str] = None
    building: Optional[str] = None
    type: Optional[str] = None
    is_active: Optional[bool] = Field(None, alias="isActive")

class ScheduleResponse(ScheduleBase):
    id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
        populate_by_name = True

# Attendance Schemas
class AttendanceBase(BaseModel):
    student_id: str = Field(alias="studentId")
    course_id: str = Field(alias="courseId")
    marked_by_id: str = Field(alias="markedById")
    date: datetime
    status: str
    remarks: Optional[str] = None

class AttendanceCreate(AttendanceBase):
    pass

class AttendanceUpdate(BaseModel):
    status: Optional[str] = None
    remarks: Optional[str] = None

class AttendanceResponse(AttendanceBase):
    id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
        populate_by_name = True

# Chat Message Schemas
class ChatMessageBase(BaseModel):
    user_id: str = Field(alias="userId")
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
    created_at: datetime = Field(alias="createdAt")
    
    class Config:
        from_attributes = True
        populate_by_name = True

# Authentication Schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    user_id: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str