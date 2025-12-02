from fastapi import APIRouter, HTTPException, Depends
from src.services.chat_services import ChatService
from src.api.dependencies import get_current_user
from src.models.schemas import ChatMessageCreate, ChatMessageResponse

router = APIRouter()

@router.post("/messages", response_model=ChatMessageResponse)
async def send_message(message: ChatMessageCreate, current_user: str = Depends(get_current_user)):
    try:
        return await ChatService.send_message(message, current_user)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/messages", response_model=list[ChatMessageResponse])
async def get_messages(current_user: str = Depends(get_current_user)):
    try:
        return await ChatService.get_messages(current_user)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))