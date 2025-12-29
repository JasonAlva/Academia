from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from langchain_core.messages import HumanMessage
from src.agents.admin_agent import create_admin_agent

router = APIRouter()

class QueryRequest(BaseModel):
    query: str

class QueryResponse(BaseModel):
    answer: str

@router.post("/query", response_model=QueryResponse)
async def query_with_agent(request: QueryRequest):
    
    try:
        # Create the agent
        agent = create_admin_agent()
        
        # Execute the query
        result = await agent.ainvoke({
            "messages": [HumanMessage(content=request.query)]
        })
        
        # Extract the final response
        final_message = result["messages"][-1]
        
        answer = (final_message.content
        if isinstance(final_message.content, str)
        else final_message.content[0]["text"]
        )

        return QueryResponse(answer=answer)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")