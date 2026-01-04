from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from src.agents.role_based_agent import create_role_based_agent
from src.api.dependencies import get_current_user
from src.models.schemas import UserResponse
from src.services.chat_services import ChatService
from src.config.database import prisma
from typing import Optional
import uuid

router = APIRouter()

class QueryRequest(BaseModel):
    query: str
    thread_id: Optional[str] = None  # For conversation continuity

class QueryResponse(BaseModel):
    answer: str
    thread_id: str  # Return thread_id for session continuity

@router.post("/query", response_model=QueryResponse)
async def query_with_agent(
    request: QueryRequest,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Process user query with role-based agent with conversation memory.
    The agent will have access to tools based on the user's role (ADMIN, TEACHER, STUDENT).
    Maintains conversation history across requests using thread_id.
    """
    try:
        # Extract user information from UserResponse object
        user_id = current_user.id
        user_role = current_user.role  # role is a property of UserResponse
        
        # Get or create thread_id for conversation continuity
        thread_id = request.thread_id or str(uuid.uuid4())
        
        print(f"\n{'='*60}")
        print(f"AGENT QUERY")
        print(f"{'='*60}")
        print(f"User ID: {user_id}")
        print(f"User Role: {user_role}")
        print(f"User Name: {current_user.name}")
        print(f"Thread ID: {thread_id}")
        print(f"Query: {request.query}")
        print(f"{'='*60}\n")
        
        # Initialize chat service
        chat_service = ChatService(prisma)
        
        # Load conversation history if thread_id exists
        conversation_history = []
        if request.thread_id:
            db_messages = await chat_service.get_messages(thread_id, limit=20)
            for msg in db_messages:
                if msg.role == 'USER':
                    conversation_history.append(HumanMessage(content=msg.content))
                elif msg.role == 'ASSISTANT':
                    conversation_history.append(AIMessage(content=msg.content))
            print(f"📚 Loaded {len(conversation_history)} messages from conversation history")
        
        # Add current user message to history
        current_message = HumanMessage(content=request.query)
        conversation_history.append(current_message)
        
        # Save user message to database
        await chat_service.create_message(
            user_id=user_id,
            role='USER',
            content=request.query,
            thread_id=thread_id
        )
        
        # Create role-based agent
        agent = create_role_based_agent(user_role=user_role, user_id=user_id)
        
        # Execute the query with full conversation history
        result = await agent.ainvoke({
            "messages": conversation_history
        })
        
        # Extract the final response
        final_message = result["messages"][-1]
        
        answer = (
            final_message.content
            if isinstance(final_message.content, str)
            else final_message.content[0]["text"]
        )
        
        # Save assistant response to database
        await chat_service.create_message(
            user_id=user_id,
            role='ASSISTANT',
            content=answer,
            thread_id=thread_id
        )

        print(f"Agent Response: {answer[:200]}...")  # Log first 200 chars
        print(f"💾 Saved conversation to thread: {thread_id}\n")
        
        return QueryResponse(answer=answer, thread_id=thread_id)
        
    except Exception as e:
        print(f"❌ Error processing query: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")