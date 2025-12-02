from fastapi import APIRouter, HTTPException
from typing import List
from src.models.schemas import CourseCreate, CourseUpdate, Course
from src.services.course_service import CourseService
from src.config.database import prisma

router = APIRouter()

@router.post("/", response_model=Course)
async def create_course(course: CourseCreate):
    course_service = CourseService(prisma)
    return await course_service.create_course(course.dict())

@router.get("/", response_model=List[Course])
async def get_courses():
    course_service = CourseService(prisma)
    return await course_service.get_all_courses()

@router.get("/{course_id}", response_model=Course)
async def get_course(course_id: str):
    course_service = CourseService(prisma)
    course = await course_service.get_course_by_id(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@router.put("/{course_id}", response_model=Course)
async def update_course(course_id: str, course: CourseUpdate):
    course_service = CourseService(prisma)
    updated_course = await course_service.update_course(course_id, course.dict(exclude_unset=True))
    if not updated_course:
        raise HTTPException(status_code=404, detail="Course not found")
    return updated_course

@router.delete("/{course_id}", response_model=dict)
async def delete_course(course_id: str):
    course_service = CourseService(prisma)
    try:
        await course_service.delete_course(course_id)
        return {"detail": "Course deleted successfully"}
    except:
        raise HTTPException(status_code=404, detail="Course not found")