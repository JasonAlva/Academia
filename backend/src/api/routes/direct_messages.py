from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, Query
from prisma import Prisma
from pydantic import BaseModel
from typing import List, Optional
from src.config.database import get_db
from src.api.dependencies import get_current_user, get_current_teacher, get_current_student
from src.services.direct_message_service import DirectMessageService
from src.services.websocket_manager import manager
from src.utils.jwt import verify_token
from src.models.schemas import UserResponse

router = APIRouter()


# Pydantic models for request/response
class SendMessageRequest(BaseModel):
    content: str


class StartConversationRequest(BaseModel):
    teacherId: Optional[str] = None
    studentId: Optional[str] = None


class MessageResponse(BaseModel):
    id: str
    conversationId: str
    senderId: str
    senderRole: str
    content: str
    isRead: bool
    readAt: Optional[str] = None
    createdAt: str

    class Config:
        from_attributes = True


class ConversationResponse(BaseModel):
    id: str
    teacherId: str
    studentId: str
    lastMessageAt: Optional[str] = None
    createdAt: str
    unreadCount: int = 0

    class Config:
        from_attributes = True


# ============ REST Endpoints ============

@router.get("/teacher/students")
async def get_teacher_students(
    db: Prisma = Depends(get_db),
    teacher = Depends(get_current_teacher)
):
    """Get all students enrolled in courses taught by this teacher"""
    service = DirectMessageService(db)
    students = await service.get_teacher_students(teacher.id)
    return students


@router.get("/student/teachers")
async def get_student_teachers(
    db: Prisma = Depends(get_db),
    student = Depends(get_current_student)
):
    """Get all teachers who teach courses the student is enrolled in"""
    service = DirectMessageService(db)
    teachers = await service.get_student_teachers(student.id)
    return teachers


@router.get("/teacher/conversations")
async def get_teacher_conversations(
    db: Prisma = Depends(get_db),
    teacher = Depends(get_current_teacher)
):
    """Get all conversations for a teacher"""
    service = DirectMessageService(db)
    conversations = await service.get_teacher_conversations(teacher.id)
    return conversations


@router.get("/student/conversations")
async def get_student_conversations(
    db: Prisma = Depends(get_db),
    student = Depends(get_current_student)
):
    """Get all conversations for a student"""
    service = DirectMessageService(db)
    conversations = await service.get_student_conversations(student.id)
    return conversations


@router.post("/teacher/conversations")
async def start_teacher_conversation(
    request: StartConversationRequest,
    db: Prisma = Depends(get_db),
    teacher = Depends(get_current_teacher)
):
    """Teacher starts or gets a conversation with a student"""
    if not request.studentId:
        raise HTTPException(status_code=400, detail="studentId is required")
    
    service = DirectMessageService(db)
    
    # Verify relationship
    has_relationship = await service.verify_teacher_student_relationship(teacher.id, request.studentId)
    if not has_relationship:
        raise HTTPException(
            status_code=403, 
            detail="You can only message students enrolled in your courses"
        )
    
    conversation = await service.get_or_create_conversation(teacher.id, request.studentId)
    return conversation


@router.post("/student/conversations")
async def start_student_conversation(
    request: StartConversationRequest,
    db: Prisma = Depends(get_db),
    student = Depends(get_current_student)
):
    """Student starts or gets a conversation with a teacher"""
    if not request.teacherId:
        raise HTTPException(status_code=400, detail="teacherId is required")
    
    service = DirectMessageService(db)
    
    # Verify relationship
    has_relationship = await service.verify_teacher_student_relationship(request.teacherId, student.id)
    if not has_relationship:
        raise HTTPException(
            status_code=403, 
            detail="You can only message teachers who teach your courses"
        )
    
    conversation = await service.get_or_create_conversation(request.teacherId, student.id)
    return conversation


@router.get("/conversations/{conversation_id}")
async def get_conversation(
    conversation_id: str,
    db: Prisma = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Get a specific conversation with messages"""
    service = DirectMessageService(db)
    conversation = await service.get_conversation_by_id(conversation_id)
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Verify user has access to this conversation
    user_role = current_user.role.upper()
    
    if user_role == "TEACHER":
        teacher = await db.teacher.find_first(where={"userId": current_user.id})
        if not teacher or conversation.teacherId != teacher.id:
            raise HTTPException(status_code=403, detail="Access denied")
    elif user_role == "STUDENT":
        student = await db.student.find_first(where={"userId": current_user.id})
        if not student or conversation.studentId != student.id:
            raise HTTPException(status_code=403, detail="Access denied")
    else:
        raise HTTPException(status_code=403, detail="Only teachers and students can access messages")
    
    return conversation


@router.get("/conversations/{conversation_id}/messages")
async def get_messages(
    conversation_id: str,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Prisma = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Get messages for a conversation with pagination"""
    service = DirectMessageService(db)
    
    # First verify access
    conversation = await service.get_conversation_by_id(conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    user_role = current_user.role.upper()
    
    if user_role == "TEACHER":
        teacher = await db.teacher.find_first(where={"userId": current_user.id})
        if not teacher or conversation.teacherId != teacher.id:
            raise HTTPException(status_code=403, detail="Access denied")
    elif user_role == "STUDENT":
        student = await db.student.find_first(where={"userId": current_user.id})
        if not student or conversation.studentId != student.id:
            raise HTTPException(status_code=403, detail="Access denied")
    else:
        raise HTTPException(status_code=403, detail="Access denied")
    
    messages = await service.get_conversation_messages(conversation_id, limit, offset)
    return messages


@router.post("/conversations/{conversation_id}/messages")
async def send_message(
    conversation_id: str,
    request: SendMessageRequest,
    db: Prisma = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Send a message in a conversation"""
    service = DirectMessageService(db)
    
    # Verify access
    conversation = await service.get_conversation_by_id(conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    user_role = current_user.role.upper()
    recipient_user_id = None
    
    if user_role == "TEACHER":
        teacher = await db.teacher.find_first(where={"userId": current_user.id})
        if not teacher or conversation.teacherId != teacher.id:
            raise HTTPException(status_code=403, detail="Access denied")
        # Get student's user ID for notification
        student = await db.student.find_unique(where={"id": conversation.studentId})
        recipient_user_id = student.userId if student else None
        
    elif user_role == "STUDENT":
        student = await db.student.find_first(where={"userId": current_user.id})
        if not student or conversation.studentId != student.id:
            raise HTTPException(status_code=403, detail="Access denied")
        # Get teacher's user ID for notification
        teacher = await db.teacher.find_unique(where={"id": conversation.teacherId})
        recipient_user_id = teacher.userId if teacher else None
    else:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Send the message
    message = await service.send_message(
        conversation_id=conversation_id,
        sender_id=current_user.id,
        sender_role=user_role,
        content=request.content
    )
    
    # Send WebSocket notification to recipient
    if recipient_user_id:
        await manager.notify_new_message(
            recipient_user_id=recipient_user_id,
            conversation_id=conversation_id,
            message_data={
                "id": message.id,
                "conversationId": message.conversationId,
                "senderId": message.senderId,
                "senderRole": message.senderRole,
                "content": message.content,
                "isRead": message.isRead,
                "createdAt": message.createdAt.isoformat()
            },
            sender_name=current_user.name
        )
    
    return message


@router.post("/conversations/{conversation_id}/read")
async def mark_as_read(
    conversation_id: str,
    db: Prisma = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Mark all messages in a conversation as read"""
    service = DirectMessageService(db)
    
    # Verify access
    conversation = await service.get_conversation_by_id(conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    user_role = current_user.role.upper()
    other_user_id = None
    
    if user_role == "TEACHER":
        teacher = await db.teacher.find_first(where={"userId": current_user.id})
        if not teacher or conversation.teacherId != teacher.id:
            raise HTTPException(status_code=403, detail="Access denied")
        student = await db.student.find_unique(where={"id": conversation.studentId})
        other_user_id = student.userId if student else None
        
    elif user_role == "STUDENT":
        student = await db.student.find_first(where={"userId": current_user.id})
        if not student or conversation.studentId != student.id:
            raise HTTPException(status_code=403, detail="Access denied")
        teacher = await db.teacher.find_unique(where={"id": conversation.teacherId})
        other_user_id = teacher.userId if teacher else None
    else:
        raise HTTPException(status_code=403, detail="Access denied")
    
    await service.mark_messages_as_read(conversation_id, user_role)
    
    # Notify the other party that messages were read
    if other_user_id:
        await manager.notify_message_read(other_user_id, conversation_id)
    
    return {"status": "ok"}


@router.get("/unread-count")
async def get_unread_count(
    db: Prisma = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Get total unread message count for current user"""
    service = DirectMessageService(db)
    count = await service.get_unread_count_for_user(current_user.id, current_user.role.upper())
    return {"unreadCount": count}


# ============ WebSocket Endpoint ============

@router.websocket("/ws/{token}")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str,
    db: Prisma = Depends(get_db)
):
    """WebSocket endpoint for real-time messaging"""
    user_id = None
    
    try:
        # Verify token and get user
        payload = verify_token(token)
        user_id = payload.get("sub")
        
        if not user_id:
            await websocket.close(code=4001, reason="Invalid token")
            return
        
        # Get user from database
        user = await db.user.find_unique(where={"id": user_id})
        if not user:
            await websocket.close(code=4001, reason="User not found")
            return
        
        # Only allow teachers and students
        if user.role not in ["TEACHER", "STUDENT"]:
            await websocket.close(code=4003, reason="Access denied")
            return
        
        # Connect the user
        await manager.connect(websocket, user_id)
        
        # Listen for messages
        while True:
            data = await websocket.receive_json()
            
            message_type = data.get("type")
            
            if message_type == "join_conversation":
                conversation_id = data.get("conversationId")
                if conversation_id:
                    manager.join_conversation(user_id, conversation_id)
                    await websocket.send_json({
                        "type": "joined_conversation",
                        "conversationId": conversation_id
                    })
            
            elif message_type == "leave_conversation":
                conversation_id = data.get("conversationId")
                if conversation_id:
                    manager.leave_conversation(user_id, conversation_id)
            
            elif message_type == "typing":
                conversation_id = data.get("conversationId")
                is_typing = data.get("isTyping", False)
                
                if conversation_id:
                    # Get the conversation to find the other user
                    conversation = await db.directconversation.find_unique(
                        where={"id": conversation_id},
                        include={
                            "teacher": {"include": {"user": True}},
                            "student": {"include": {"user": True}}
                        }
                    )
                    
                    if conversation:
                        # Determine recipient
                        if user.role == "TEACHER":
                            recipient_user_id = conversation.student.userId
                        else:
                            recipient_user_id = conversation.teacher.userId
                        
                        await manager.notify_typing(
                            recipient_user_id=recipient_user_id,
                            conversation_id=conversation_id,
                            is_typing=is_typing,
                            typer_name=user.name
                        )
            
            elif message_type == "ping":
                await websocket.send_json({"type": "pong"})
    
    except WebSocketDisconnect:
        if user_id:
            manager.disconnect(websocket, user_id)
    except Exception as e:
        print(f"WebSocket error: {e}")
        if user_id:
            manager.disconnect(websocket, user_id)
