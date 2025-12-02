from fastapi import HTTPException,APIRouter,Depends,status
from typing import List
from prisma import Prisma
from src.services.student_service import StudentService
from src.services.teacher_service import TeacherService
from src.services.admin_service import AdminService
from src.services.user_service import UserService
from src.api.dependencies import get_current_user, get_current_admin, get_db
from src.models.schemas import (
    UserResponse, 
    UserCreate, 
    UserUpdate,
    AdminResponse,
    StudentResponse,
    TeacherResponse
)

router=APIRouter(prefix="/api/admin",tags=["admin"])

#User managemnet 
@router.get("/users",response_model=List[UserResponse])
async def get_all_users(db:Prisma=Depends(get_db),currentadmin=Depends(get_current_admin)):
    user_service=UserService(db)
    return await user_service.list_users()

@router.get("/users/{user_id}",response_model=UserResponse)
async def get_user(user_id:str,db:Prisma=Depends(get_db),currentadmin=Depends(get_current_admin)):
    user_service=UserService(db)
    user= await user_service.get_user(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    db: Prisma = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    """Create a new user (Admin only)"""
    user_service = UserService(db)
    
    # Check if user already exists
    existing_user = await user_service.get_user_by_email(user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    return await user_service.create_user(user_data)

@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    db: Prisma = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    """Update a user (Admin only)"""
    user_service = UserService(db)
    
    # Check if user exists
    existing_user = await user_service.get_user_by_id(user_id)
    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return await user_service.update_user(user_id, user_data)

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: str,
    db: Prisma = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user),
    current_admin = Depends(get_current_admin)
):
    """Delete a user (Admin only)"""
    user_service = UserService(db)
    
    # Check if user exists
    existing_user = await user_service.get_user_by_id(user_id)
    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Don't allow admin to delete themselves
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    await user_service.delete_user(user_id)
    return None

@router.get("/students", response_model=List[StudentResponse])
async def get_all_students(
    db: Prisma = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    """Get all students (Admin only)"""
    student_service = StudentService(db)
    return await student_service.get_all_students()

# Teacher Management
@router.get("/teachers", response_model=List[TeacherResponse])
async def get_all_teachers(
    db: Prisma = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    """Get all teachers (Admin only)"""
    teacher_service = TeacherService(db)
    return await teacher_service.get_all_teachers()