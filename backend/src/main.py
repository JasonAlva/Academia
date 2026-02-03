from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from src.config.database import connect_db, disconnect_db
from src.api.routes import (
    admin,
    attendance,
    auth,
    chat,
    courses,
    departments,
    enrollments,
    schedules,
    students,
    teachers,
    users,
    agent_query,
    conversations
)
from src.middleware.error_handler import error_handler

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan - startup and shutdown"""
    await connect_db()
    yield
    await disconnect_db()

# Initialize FastAPI app
app = FastAPI(
    title="College Management System API",
    description="API for managing students, teachers, courses, attendance, and schedules",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "*"  # Remove in production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(students.router, prefix="/api/students", tags=["Students"])
app.include_router(teachers.router, prefix="/api/teachers", tags=["Teachers"])
app.include_router(courses.router, prefix="/api/courses", tags=["Courses"])
app.include_router(departments.router, prefix="/api/departments", tags=["Departments"])
app.include_router(enrollments.router, prefix="/api/enrollments", tags=["Enrollments"])
app.include_router(schedules.router, prefix="/api/schedules", tags=["Schedules"])
app.include_router(attendance.router, prefix="/api/attendance", tags=["Attendance"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(conversations.router, prefix="/api/conversations", tags=["Conversations"])
app.include_router(agent_query.router, prefix="/api/agent", tags=["agent"])

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint - API health check"""
    return {
        "message": "College Management System API",
        "version": "1.0.0",
        "status": "operational"
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "database": "connected"
    }