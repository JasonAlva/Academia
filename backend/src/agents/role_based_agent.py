"""
Role-based agent that dynamically binds tools based on user role.
Supports ADMIN, TEACHER, and STUDENT roles with appropriate tools and prompts.
"""

from typing import List, Dict, Any
from langgraph.graph import StateGraph, END
from langchain_core.messages import SystemMessage
from langgraph.prebuilt import ToolNode
from src.graph.agent_state import AgentState
from src.config.llm import llm

# Import all available tools
from src.tools.department_tools import (
    list_all_departments,
    delete_existing_department,
    get_department_by_id,
    update_existing_department,
    create_new_department
)
from src.tools.student_tools import (
    list_all_students,
    create_new_student,
    update_existing_student,
    delete_existing_student,
    get_student_by_id
)
from src.tools.teacher_tool import (
    list_all_teachers,
    get_teacher_by_id,
    create_new_teacher,
    update_existing_teacher,
    delete_existing_teacher,
    get_my_teacher_profile,
    get_teacher_courses,
    get_teacher_courses_with_students,
    get_students_in_course
)
from src.tools.context_aware_tools import (
    get_my_schedule,
    get_my_attendance,
    get_my_courses,
    get_my_profile
)
from src.tools.course_tool import (
    list_all_courses,
    get_course_by_id,
    create_new_course,
    update_existing_course,
    delete_existing_course
)
from src.tools.enrollment_tool import (
    list_all_enrollments,
    get_enrollment_by_id,
    get_student_enrollments_with_details,
    create_new_enrollment,
    update_existing_enrollment,
    delete_existing_enrollment
)
from src.tools.schedule_tools import (
    list_all_schedules,
    get_schedule_by_id,
    get_teacher_schedule,
    get_course_schedule,
    create_new_schedule,
    update_existing_schedule,
    delete_existing_schedule,
    get_full_timetable,
    get_subjects_details,
    save_timetable,
    generate_timetable
)
from src.tools.attendance_tool import (
    create_class_session,
    get_class_session,
    get_course_sessions,
    update_class_session,
    delete_class_session,
    mark_student_attendance,
    bulk_mark_student_attendance,
    get_student_attendance_record,
    get_course_attendance_records,
    get_student_attendance_records,
    update_student_attendance,
    delete_student_attendance,
    get_all_students_attendance_stats,
    mark_teacher_attendance,
    get_teacher_attendance_record,
    get_teacher_attendance_records,
    update_teacher_attendance,
    delete_teacher_attendance,
    get_all_teachers_attendance_stats
)


# Define tools for each role
ROLE_TOOLS: Dict[str, List[Any]] = {
    "ADMIN": [
        # Context-aware tools (for admin testing as any role)
        get_my_profile,
        get_my_schedule,
        get_my_attendance,
        get_my_courses,
        
        # Department management
        list_all_departments,
        get_department_by_id,
        create_new_department,
        update_existing_department,
        delete_existing_department,
        
        # Student management
        list_all_students,
        get_student_by_id,
        create_new_student,
        update_existing_student,
        delete_existing_student,
        
        # Teacher management
        list_all_teachers,
        get_teacher_by_id,
        create_new_teacher,
        update_existing_teacher,
        delete_existing_teacher,
        get_teacher_courses,
        get_teacher_courses_with_students,
        get_students_in_course,
        
        # Course management
        list_all_courses,
        get_course_by_id,
        create_new_course,
        update_existing_course,
        delete_existing_course,
        
        # Enrollment management
        list_all_enrollments,
        get_enrollment_by_id,
        get_student_enrollments_with_details,
        create_new_enrollment,
        update_existing_enrollment,
        delete_existing_enrollment,
        
        # Schedule management
        list_all_schedules,
        get_schedule_by_id,
        get_teacher_schedule,
        get_course_schedule,
        create_new_schedule,
        update_existing_schedule,
        delete_existing_schedule,
        get_full_timetable,
        get_subjects_details,
        save_timetable,
        generate_timetable,
        
        # Attendance management
        create_class_session,
        get_class_session,
        get_course_sessions,
        update_class_session,
        delete_class_session,
        mark_student_attendance,
        bulk_mark_student_attendance,
        get_student_attendance_record,
        get_course_attendance_records,
        get_student_attendance_records,
        update_student_attendance,
        delete_student_attendance,
        get_all_students_attendance_stats,
        mark_teacher_attendance,
        get_teacher_attendance_record,
        get_teacher_attendance_records,
        update_teacher_attendance,
        delete_teacher_attendance,
        get_all_teachers_attendance_stats,
    ],
    
    "TEACHER": [
        # Context-aware tools (use current user automatically)
        get_my_profile,
        get_my_schedule,
        get_my_attendance,
        get_my_courses,
        get_my_teacher_profile,
        
        # View departments
        list_all_departments,
        get_department_by_id,
        
        # View students
        list_all_students,
        get_student_by_id,
        
        # View teachers
        list_all_teachers,
        get_teacher_by_id,
        get_teacher_courses,
        get_teacher_courses_with_students,
        get_students_in_course,
        
        # View courses
        list_all_courses,
        get_course_by_id,
        
        # View enrollments
        list_all_enrollments,
        get_enrollment_by_id,
        get_student_enrollments_with_details,
        
        # View and manage own schedule
        list_all_schedules,
        get_schedule_by_id,
        get_teacher_schedule,
        get_course_schedule,
        get_full_timetable,
        get_subjects_details,
        
        # Attendance management (teachers can mark attendance)
        create_class_session,
        get_class_session,
        get_course_sessions,
        update_class_session,
        mark_student_attendance,
        bulk_mark_student_attendance,
        get_student_attendance_record,
        get_course_attendance_records,
        get_student_attendance_records,
        update_student_attendance,
        get_all_students_attendance_stats,
        mark_teacher_attendance,
        get_teacher_attendance_record,
        get_teacher_attendance_records,
    ],
    
    "STUDENT": [
        # Context-aware tools (use current user automatically)
        get_my_profile,
        get_my_schedule,
        get_my_attendance,
        get_my_courses,
        
        # View departments
        list_all_departments,
        get_department_by_id,
        
        # View teachers
        list_all_teachers,
        get_teacher_by_id,
        
        # View courses
        list_all_courses,
        get_course_by_id,
        
        # View own enrollments
        get_student_enrollments_with_details,
        
        # View schedules and timetable
        list_all_schedules,
        get_schedule_by_id,
        get_course_schedule,
        get_full_timetable,
        get_subjects_details,
        
        # View own attendance
        get_student_attendance_records,
        get_course_attendance_records,
    ]
}


# Define system prompts for each role
ROLE_PROMPTS: Dict[str, str] = {
    "ADMIN": """You are an administrative assistant for a college management system.

You have full access to manage:
- Departments (create, read, update, delete)
- Students (create, read, update, delete)
- Teachers (create, read, update, delete)
- Courses (create, read, update, delete)
- Enrollments (create, read, update, delete)
- Schedules and Timetables (create, read, update, delete)
- Attendance (create, read, update, delete)

You can:
- Create, modify, and delete any record in the system
- Generate and manage timetables
- View comprehensive reports and statistics
- Manage class sessions and attendance
- Access all system functionalities

Always:
- Confirm destructive operations (delete, major updates)
- Provide clear summaries of changes made
- Suggest best practices for data management
- Be helpful and professional in all responses""",

    "TEACHER": """You are a teaching assistant for a college management system.

You have access to:
- View department and student information
- View and manage your teaching schedule
- Create and manage class sessions
- Mark and update student attendance
- View course and enrollment information
- Access timetables and schedules

**Smart Personal Tools - No IDs Needed!**
When the user asks about THEIR OWN information (using words like "my", "I", "me"), use these tools:
- get_my_profile - Shows their profile
- get_my_schedule - Shows their teaching schedule  
- get_my_attendance - Shows their attendance records
- get_my_courses - Shows courses they teach

Examples:
- "What is my schedule?" → Use get_my_schedule (automatically uses their ID)
- "Show my attendance" → Use get_my_attendance (automatically uses their ID)
- "What courses do I teach?" → Use get_my_courses (automatically uses their ID)

You can:
- Check your teaching schedule and timetable
- Create class sessions for your courses
- Mark student attendance for your classes
- View student enrollment in your courses
- Update attendance records
- Mark your own attendance

You cannot:
- Modify student records or enrollments
- Change course details or schedules
- Delete any records
- Access other teachers' private information

Always:
- Focus on your teaching responsibilities
- Provide accurate attendance information
- Be helpful to students regarding schedules
- Maintain professional communication
- Use the smart "get_my_*" tools when users ask about their own data""",

    "STUDENT": """You are a student assistant for a college management system.

You have access to:
- View your course enrollments
- Check your class schedule and timetable
- View your attendance records
- See teacher and course information
- Access department information

**Smart Personal Tools - No IDs Needed!**
When you ask about YOUR OWN information (using words like "my", "I", "me"), these tools work automatically:
- get_my_profile - Shows your profile
- get_my_schedule - Shows your class schedule
- get_my_attendance - Shows your attendance records  
- get_my_courses - Shows courses you're enrolled in

Examples:
- "What is my schedule?" → Use get_my_schedule (automatically uses your ID)
- "Show my attendance" → Use get_my_attendance (automatically uses your ID)
- "What courses am I taking?" → Use get_my_courses (automatically uses your ID)

You can:
- Check when and where your classes are
- View your attendance status
- See which courses you're enrolled in
- Find teacher contact information
- View your academic timetable

You cannot:
- Modify any records or schedules
- Access other students' information
- Change attendance records
- Enroll in or drop courses

Always:
- Focus on your own academic information
- Ask relevant questions about your schedule
- Be respectful and professional
- Seek help from teachers or admin for changes
- Use the smart "get_my_*" tools when asking about your own data"""
}


def create_role_based_agent(user_role: str = "STUDENT", user_id: str = None):
    """
    Create an agent with tools and prompts based on user role.
    
    Args:
        user_role: User's role (ADMIN, TEACHER, STUDENT)
        user_id: User's ID for personalized queries (automatically used in tools)
    
    Returns:
        Compiled LangGraph workflow
    """
    # Normalize role
    role = user_role.upper()
    
    # Get tools for this role
    tools = ROLE_TOOLS.get(role, ROLE_TOOLS["STUDENT"])  # Default to STUDENT if unknown
    
    # Get system prompt for this role
    system_prompt = ROLE_PROMPTS.get(role, ROLE_PROMPTS["STUDENT"])
    
    # Enhanced system prompt with user context and natural language guidance
    if user_id:
        system_prompt += f"""

**Important Context:**
- Your current user ID: {user_id}
- Your role: {role}

**When users ask about THEIR OWN information, use these tools:**
- "What is my schedule?" → Use get_my_schedule
- "Show my attendance" → Use get_my_attendance  
- "What courses do I teach/take?" → Use get_my_courses
- "Show my profile" → Use get_my_profile

These tools automatically use the current user's ID ({user_id}), so you don't need to ask for IDs when users ask about themselves."""
    
    # Bind tools to LLM
    llm_with_tools = llm.bind_tools(tools)
    
    def call_model(state: AgentState):
        messages = state["messages"]
        
        # Always ensure system message is present at the start
        # Check if first message is a system message
        has_system_msg = len(messages) > 0 and hasattr(messages[0], 'type') and messages[0].type == 'system'
        
        if not has_system_msg:
            # Add system message at the beginning
            system_msg = SystemMessage(content=system_prompt)
            messages = [system_msg] + messages
        
        response = llm_with_tools.invoke(messages)
        return {"messages": [response]}
    
    async def call_tools(state: AgentState):
        """Custom tool executor that injects user context"""
        last_message = state['messages'][-1]
        
        # Get tool calls from the message
        tool_calls = last_message.tool_calls if hasattr(last_message, 'tool_calls') else []
        
        if not tool_calls:
            return {"messages": []}
        
        # Execute tools with automatic user_id and user_role injection
        from langchain_core.messages import ToolMessage
        tool_messages = []
        
        for tool_call in tool_calls:
            tool_name = tool_call["name"]
            tool_args = tool_call["args"].copy()
            
            # Auto-inject user_id and user_role for context-aware tools
            context_aware_tools = ['get_my_schedule', 'get_my_attendance', 'get_my_courses', 'get_my_profile', 'get_my_teacher_profile']
            
            if tool_name in context_aware_tools:
                # Inject user context if not already provided
                if 'user_id' not in tool_args and user_id:
                    tool_args['user_id'] = user_id
                if 'user_role' not in tool_args:
                    tool_args['user_role'] = role
            
            # Find and execute the tool
            tool_to_execute = next((t for t in tools if t.name == tool_name), None)
            
            if tool_to_execute:
                try:
                    result = await tool_to_execute.ainvoke(tool_args)
                    tool_messages.append(
                        ToolMessage(
                            content=str(result),
                            tool_call_id=tool_call["id"]
                        )
                    )
                except Exception as e:
                    tool_messages.append(
                        ToolMessage(
                            content=f"Error executing {tool_name}: {str(e)}",
                            tool_call_id=tool_call["id"]
                        )
                    )
            else:
                tool_messages.append(
                    ToolMessage(
                        content=f"Tool {tool_name} not found",
                        tool_call_id=tool_call["id"]
                    )
                )
        
        return {"messages": tool_messages}
    
    def should_continue(state: AgentState):
        last_message = state['messages'][-1]
        if not hasattr(last_message, 'tool_calls') or not last_message.tool_calls:
            return END
        return "tools"
    
    # Build workflow
    workflow = StateGraph(AgentState)
    
    workflow.add_node("agent", call_model)
    workflow.add_node("tools", call_tools)  # Use custom tool executor
    
    workflow.set_entry_point("agent")
    
    workflow.add_conditional_edges(
        "agent",
        should_continue,
        {"tools": "tools", END: END}
    )
    
    workflow.add_edge("tools", "agent")
    
    return workflow.compile()


# Convenience functions for specific roles
def create_admin_agent(user_id: str = None):
    """Create an agent with admin privileges"""
    return create_role_based_agent("ADMIN", user_id)


def create_teacher_agent(user_id: str = None):
    """Create an agent with teacher privileges"""
    return create_role_based_agent("TEACHER", user_id)


def create_student_agent(user_id: str = None):
    """Create an agent with student privileges"""
    return create_role_based_agent("STUDENT", user_id)
