from fastapi import APIRouter, HTTPException
from src.services.department_service import DepartmentService
from src.models.schemas import DepartmentSchema, DepartmentCreate, DepartmentUpdate
from src.config.database import prisma

router = APIRouter()

@router.get("", response_model=list[DepartmentSchema])
async def get_departments():
    department_service = DepartmentService(prisma)
    departments = await department_service.list_departments()
    return departments

@router.get("/{department_id}", response_model=DepartmentSchema)
async def get_department(department_id: str):
    department_service = DepartmentService(prisma)
    department = await department_service.get_department(department_id)
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    return department

@router.post("", response_model=DepartmentSchema)
async def create_department(department: DepartmentCreate):
    department_service = DepartmentService(prisma)
    new_department = await department_service.create_department(department)
    return new_department

@router.put("/{department_id}", response_model=DepartmentSchema)
async def update_department(department_id: str, department: DepartmentUpdate):
    department_service = DepartmentService(prisma)
    updated_department = await department_service.update_department(department_id, department)
    if not updated_department:
        raise HTTPException(status_code=404, detail="Department not found")
    return updated_department

@router.delete("/{department_id}", response_model=dict)
async def delete_department(department_id: str):
    department_service = DepartmentService(prisma)
    try:
        await department_service.delete_department(department_id)
        return {"detail": "Department deleted successfully"}
    except:
        raise HTTPException(status_code=404, detail="Department not found")