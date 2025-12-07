from fastapi import HTTPException
from passlib.context import CryptContext
from datetime import datetime, timedelta

from src.models.schemas import UserRegister, UserOut
from src.utils.password import verify_password, hash_password
from prisma.models import User
from prisma import Prisma
from src.utils.jwt import create_access_token, verify_token

class AuthService:

    def __init__(self, db: Prisma):
        self.db = db

    async def createUser(self, user: UserRegister) -> UserOut:
        existing_user = await self.db.user.find_unique(where={"email": user.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        data = {
            "email": user.email,
            "password": hash_password(user.password),
            "name": user.name,
            "role": user.role
        }
        
        created_user = await self.db.user.create(data=data)
        
        # Create role-specific profile
        if created_user.role == "ADMIN":
            admin_count = await self.db.admin.count()
            await self.db.admin.create(
                data={
                    "userId": created_user.id,
                    "adminId": f"ADM{datetime.now().year}{admin_count + 1:04d}"
                }
            )
        elif created_user.role == "STUDENT":
            if not all([user.studentId, user.department, user.semester, user.batch]):
                raise HTTPException(status_code=400, detail="Missing required student fields")
            student_data = {
                "userId": created_user.id,
                "studentId": user.studentId,
                "department": user.department,
                "semester": user.semester,
                "batch": user.batch
            }
            if user.phoneNumber:
                student_data["phoneNumber"] = user.phoneNumber
            if user.address:
                student_data["address"] = user.address
            if user.dateOfBirth:
                student_data["dateOfBirth"] = user.dateOfBirth
            await self.db.student.create(data=student_data)
        elif created_user.role == "TEACHER":
            if not all([user.teacherId, user.department, user.designation]):
                raise HTTPException(status_code=400, detail="Missing required teacher fields")
            teacher_data = {
                "userId": created_user.id,
                "teacherId": user.teacherId,
                "department": user.department,
                "designation": user.designation
            }
            if user.specialization:
                teacher_data["specialization"] = user.specialization
            if user.phoneNumber:
                teacher_data["phoneNumber"] = user.phoneNumber
            if user.officeRoom:
                teacher_data["officeRoom"] = user.officeRoom
            if user.officeHours:
                teacher_data["officeHours"] = user.officeHours
            if user.joiningDate:
                teacher_data["joiningDate"] = user.joiningDate
            await self.db.teacher.create(data=teacher_data)
        
        return UserOut.model_validate(created_user)
        
    
    async def authenticate_user(self, email: str, password: str) -> UserOut:
        user = await self.db.user.find_unique(where={"email": email})
        if not user or not verify_password(password, user.password):
            return None
        return UserOut.model_validate(user)

    def create_access_token(self, user_id: str) -> str:
        return create_access_token(
            {"sub": user_id},
            expires_delta=timedelta(minutes=30)
        )

    async def get_current_user(self, token: str) -> UserOut:
        email = verify_token(token)
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token")

        user = await self.db.user.find_unique(where={"email": email})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        return UserOut.model_validate(user)
