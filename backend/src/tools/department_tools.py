from langchain_core.tools import tool
from src.services.department_service import DepartmentService
from src.models.schemas import DepartmentCreate, DepartmentUpdate,DepartmentSchema
from src.config.database import prisma
from fastapi import Depends


@tool
async def list_all_departments():
    """Get all departments from the database. Use this when user asks to see all departments, list departments, or show departments."""
    service=DepartmentService(prisma)
    departments=await service.list_departments()
    return [{"id": d.id, "name": d.name, "code": d.code} for d in departments]

@tool
async def get_department_by_id(department_id: str):
    """Get a specific department by its ID.
    
    Args:
        department_id: The unique identifier of the department
    """
    service = DepartmentService(prisma)
    dept = await service.get_department(department_id)
    if not dept:
        return {"error": "Department not found"}
    return {"id": dept.id, "name": dept.name, "code": dept.code}

@tool
async def create_new_department(name: str,code:str):
    """Create a new department in the database.
    
    Args:
        name: The name of the department (required)
        location: The location of the department (optional)
    """
    service = DepartmentService(prisma)
    dept_data = DepartmentCreate(name=name,code=code)
    dept = await service.create_department(dept_data)
    return {"id": dept.id, "name": dept.name, "code": dept.code, "message": "Department created successfully"}

@tool
async def update_existing_department(code: str, name: str):
    """Update an existing department's name based on its code.
    
    Args:
        code: The department code to identify which department to update (required)
        name: New name for the department (required)
    """
    service = DepartmentService(prisma)
    try:
        department = await service.get_department_by_code(code)
        if not department:
            return {"error": f"Department with code '{code}' not found"}
        
        department_id = department.id
        dept_data = DepartmentUpdate(name=name, code=code)
        dept = await service.update_department(department_id, dept_data)
        
        if not dept:
            return {"error": "Department could not be updated"}
        
        return {"id": dept.id, "name": dept.name, "code": dept.code, "message": f"Department '{code}' updated successfully with new name '{name}'"}
    except Exception as e:
        return {"error": f"Failed to update department: {str(e)}"}

@tool
async def delete_existing_department(department_code: str):
    """Delete a department from the database.
    
    Args:
        department_code: The unique code of the department to delete
    """
    service = DepartmentService(prisma)
    try:
        await service.delete_department_by_code(department_code)
        return {"message": "Department deleted successfully", "department_id": department_code}
    except:
        return {"error": "Department not found or could not be deleted"}