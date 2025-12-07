from fastapi import APIRouter, HTTPException, Depends
from src.models.schemas import UserLogin, UserRegister, TokenResponse, UserOut
from src.services.auth_service import AuthService
from src.api.dependencies import get_current_user
from src.config.database import prisma

router = APIRouter()

@router.post("/login", response_model=TokenResponse)
async def login(user: UserLogin):
    auth_service = AuthService(prisma)
    authenticated_user = await auth_service.authenticate_user(user.email, user.password)
    if not authenticated_user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = auth_service.create_access_token(authenticated_user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": authenticated_user
    }

@router.post("/register", response_model=UserOut)
async def register(user: UserRegister):
    auth_service = AuthService(prisma)
    new_user = await auth_service.createUser(user)
    return new_user

@router.get("/me", response_model=UserOut)
async def read_users_me(current_user: UserOut = Depends(get_current_user)):
    return current_user