from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from prisma import Prisma
from src.config.database import get_db
from src.utils.jwt import verify_token
from src.services.user_service import UserService
from src.models.schemas import UserResponse


security =HTTPBearer()


async def get_current_user(db:Prisma=Depends(get_db),credentials:HTTPAuthorizationCredentials=Depends(security)):
    token=credentials.credentials
   
    
    try:
       
        payload=verify_token(token)
        user_id=payload.get("sub")
    
       
        

        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials"
            )
        
        user_service=UserService(db)
        
        user=await user_service.get_user(user_id)
        
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        print(user)
        return user
    
        
    except Exception as e:
        print(f"Authentication error: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}"  # Show actual error
        )
    
async def get_current_student(
    db: Prisma = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    student = await db.student.find_first(where={
        "userId": current_user.id
    })

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


async def get_current_teacher(
    db: Prisma = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    teacher = await db.teacher.find_first(
        where={"userId": current_user.id}
    )
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return teacher


async def get_current_admin(
    db: Prisma = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    admin = await db.admin.find_first(
        where={"userId": current_user.id}
    )
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    return admin
    


