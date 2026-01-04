from fastapi import APIRouter, HTTPException, Depends
from src.models.schemas import UserResponse, UserCreate, UserUpdate
from src.services.user_service import UserService
from src.api.dependencies import get_current_user
from src.config.database import prisma

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: UserResponse = Depends(get_current_user)):
    """Get current authenticated user's profile"""
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_current_user_profile(
    user_update: UserUpdate,
    current_user: UserResponse = Depends(get_current_user)
):
    """Update current authenticated user's profile"""
    user_service = UserService(prisma)
    try:
        updated_user = await user_service.update_user(current_user.id, user_update)
        return updated_user
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to update profile: {str(e)}")

@router.get("/", response_model=list[UserResponse])
async def get_users(skip: int = 0, limit: int = 10):
    user_service = UserService(prisma)
    users = await user_service.list_users()
    return users[skip:skip+limit]

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str):
    user_service = UserService(prisma)
    user = await user_service.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/", response_model=UserResponse)
async def create_user(user: UserCreate):
    user_service = UserService(prisma)
    new_user = await user_service.create_user(user)
    return new_user

@router.put("/{user_id}", response_model=UserResponse)
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