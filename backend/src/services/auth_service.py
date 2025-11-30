from fastapi import HTTPException
from passlib.context import CryptContext
from datetime import datetime, timedelta

from src.models.schemas import UserCreate, UserOut
from src.utils.password import verify_password, get_password_hash
from src.models.schemas import User
from src.config.database import prisma
from src.utils.jwt import create_access_token,verify_token

class AuthService:

    @classmethod
    async def createUser(cls, user: UserCreate) -> UserOut:
        data = user.dict()
        data["password"] = get_password_hash(user.password)
        created_user = await prisma.user.create(data=data)
        return UserOut.from_orm(created_user)
    
    @classmethod
    async def authenticate_user(cls, email: str, password: str) -> UserOut:
        user = await prisma.user.find_unique(where={"email": email})
        if not user or not verify_password(password, user.password):
            return None
        return UserOut.from_orm(user)

    @classmethod
    def create_access_token(cls, email: str) -> str:
        return create_access_token(
            {"sub": email},
            expires_delta=timedelta(minutes=30)
        )

    @classmethod
    async def get_current_user(cls, token: str) -> UserOut:
        email = verify_token(token)

        user = await prisma.user.find_unique(where={"email": email})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        return UserOut.from_orm(user)
