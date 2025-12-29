from src.tools.department_tools import (list_all_departments,delete_existing_department,get_department_by_id,update_existing_department,create_new_department)
from src.tools.student_tools import (list_all_students,create_new_student,update_existing_student,delete_existing_student,get_student_by_id)
from langgraph.graph import StateGraph,END

from langchain_core.messages import SystemMessage
from langgraph.prebuilt import ToolNode
from src.graph.agent_state import AgentState
from src.config.llm import llm


def create_admin_agent():
    tools=[list_all_departments,delete_existing_department,get_department_by_id,update_existing_department,create_new_department,list_all_students,create_new_student,update_existing_student,delete_existing_student,get_student_by_id
]
    
    
    llm_with_tools=llm.bind_tools(tools)

    def call_model(state:AgentState):
        messages=state["messages"]

        if(len(messages)==1):
            system_msg=SystemMessage(content="""You are a helpful assistant for managing students and departments.
                You have access to tools to list, get, create, update, and delete students and departments.
                Always provide clear and concise responses to the user.""")
            messages=[system_msg]+messages

        response=llm_with_tools.invoke(messages)
        return {"messages":[response]}
    
    def should_continue(state:AgentState):
        last_message=state['messages'][-1]
        if not hasattr(last_message,'tool_calls') or not last_message.tool_calls:
            return END
        return "tools"
    
    workflow=StateGraph(AgentState)

    workflow.add_node("agent",call_model)
    workflow.add_node("tools",ToolNode(tools))

    workflow.set_entry_point("agent")

    workflow.add_conditional_edges("agent",should_continue,{"tools":"tools",END:END})

    workflow.add_edge("tools","agent")

    return workflow.compile()