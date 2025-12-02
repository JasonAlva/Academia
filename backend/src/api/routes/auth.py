from fastapi import APIRouter, HTTPException, Depends
from src.models.schemas import UserLogin, UserRegister
from src.services.auth_service import AuthService
from src.api.dependencies import get_current_user

router = APIRouter()

@router.post("/login")
async def login(user: UserLogin):
    authenticated_user = await AuthService.authenticate_user(user.email, user.password)
    if not authenticated_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = AuthService.create_access_token(user.email)
    return {"access_token": token, "token_type": "bearer"}

@router.post("/register")
async def register(user: UserRegister):
    new_user = await AuthService.createUser(user)
    if not new_user:
        raise HTTPException(status_code=400, detail="User registration failed")
    return {"message": "User registered successfully", "user": new_user}

@router.get("/me")
async def read_users_me(current_user: str = Depends(get_current_user)):
    return current_user