from fastapi import APIRouter, HTTPException, Depends
from typing import List
from src.services.conversation_service import ConversationService
from src.api.dependencies import get_current_user
from src.models.schemas import ConversationCreate, ConversationUpdate, ConversationResponse, UserResponse
from src.config.database import prisma
import json

router = APIRouter()

@router.post("/conversations", response_model=ConversationResponse)
async def create_conversation(
    conversation: ConversationCreate,
    current_user: UserResponse = Depends(get_current_user)
):
    """Create a new conversation"""
    try:
        service = ConversationService(prisma)
        result = await service.create_conversation(current_user.id, conversation.title)
        
        # Parse messages from JSON string
        messages = json.loads(result.messages) if isinstance(result.messages, str) else result.messages
        
        return ConversationResponse(
            id=result.id,
            userId=result.userId,
            title=result.title,
            threadId=result.threadId,
            messages=messages,
            createdAt=result.createdAt,
            updatedAt=result.updatedAt
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/conversations", response_model=List[ConversationResponse])
async def get_conversations(current_user: UserResponse = Depends(get_current_user)):
    """Get all conversations for the current user"""
    try:
        service = ConversationService(prisma)
        conversations = await service.get_user_conversations(current_user.id)
        
        results = []
        for conv in conversations:
            # Parse messages from JSON string
            messages = json.loads(conv.messages) if isinstance(conv.messages, str) else conv.messages
            results.append(ConversationResponse(
                id=conv.id,
                userId=conv.userId,
                title=conv.title,
                threadId=conv.threadId,
                messages=messages,
                createdAt=conv.createdAt,
                updatedAt=conv.updatedAt
            ))
        return results
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/conversations/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(
    conversation_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Get a specific conversation by ID"""
    try:
        service = ConversationService(prisma)
        conv = await service.get_conversation_by_id(conversation_id, current_user.id)
        
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        # Parse messages from JSON string
        messages = json.loads(conv.messages) if isinstance(conv.messages, str) else conv.messages
        
        return ConversationResponse(
            id=conv.id,
            userId=conv.userId,
            title=conv.title,
            threadId=conv.threadId,
            messages=messages,
            createdAt=conv.createdAt,
            updatedAt=conv.updatedAt
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/conversations/{conversation_id}", response_model=ConversationResponse)
async def update_conversation(
    conversation_id: str,
    update_data: ConversationUpdate,
    current_user: UserResponse = Depends(get_current_user)
):
    """Update a conversation"""
    try:
        service = ConversationService(prisma)
        result = await service.update_conversation(
            conversation_id,
            current_user.id,
            messages=update_data.messages,
            thread_id=update_data.threadId,
            title=update_data.title
        )
        
        if not result:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        # Parse messages from JSON string
        messages = json.loads(result.messages) if isinstance(result.messages, str) else result.messages
        
        return ConversationResponse(
            id=result.id,
            userId=result.userId,
            title=result.title,
            threadId=result.threadId,
            messages=messages,
            createdAt=result.createdAt,
            updatedAt=result.updatedAt
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Delete a conversation"""
    try:
        service = ConversationService(prisma)
        success = await service.delete_conversation(conversation_id, current_user.id)
        
        if not success:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        return {"message": "Conversation deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
