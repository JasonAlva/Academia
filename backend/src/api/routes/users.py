from fastapi import APIRouter, HTTPException, Depends
from src.models.schemas import User, UserCreate, UserUpdate
from src.services.user_service import UserService
from src.api.dependencies import get_current_user
from src.config.database import prisma

router = APIRouter()

@router.get("/", response_model=list[User])
async def get_users(skip: int = 0, limit: int = 10):
    user_service = UserService(prisma)
    users = await user_service.list_users()
    return users[skip:skip+limit]

@router.get("/{user_id}", response_model=User)
async def get_user(user_id: str):
    user_service = UserService(prisma)
    user = await user_service.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/", response_model=User)
async def create_user(user: UserCreate):
    user_service = UserService(prisma)
    new_user = await user_service.create_user(user)
    return new_user

@router.put("/{user_id}", response_model=User)
async def update_user(user_id: str, user: UserUpdate):
    user_service = UserService(prisma)
    try:
        updated_user = await user_service.update_user(user_id, user)
        return updated_user
    except:
        raise HTTPException(status_code=404, detail="User not found")

@router.delete("/{user_id}", response_model=dict)
async def delete_user(user_id: str):
    user_service = UserService(prisma)
    result = await user_service.delete_user(user_id)
    if not result:
        raise HTTPException(status_code=404, detail="User not found")
    return {"detail": "User deleted successfully"}