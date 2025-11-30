from fastapi import Request, HTTPException
from src.utils.jwt import verify_token
from src.services.auth_service import AuthService


async def auth_middleware(request:Request):

    token_header=request.headers.get("Authentication")

    if not token_header:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    
    if not token_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid Authorization header")
    
    token=token_header.split(" ")[1]

    email=verify_token(token)

    user=await AuthService.get_current_user(token)

    request.state.user=user