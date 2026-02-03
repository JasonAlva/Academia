from langchain_core.tools import tool
from src.services.department_service import DepartmentService
from src.models.schemas import DepartmentCreate, DepartmentUpdate,DepartmentSchema
from src.config.database import prisma
from fastapi import Depends


@tool
async def list_all_departments():
    """Get all departments from the database. Use this when user asks to see all departments, list departments, or show departments."""
    print("[DEBUG] list_all_departments called")
    service=DepartmentService(prisma)
    departments=await service.list_departments()
    print(f"[DEBUG] Retrieved {len(departments)} departments")
    return [{"id": d.id, "name": d.name, "code": d.code} for d in departments]

@tool
async def get_department_by_id(department_id: str):
    """Get a specific department by its ID.
    
    Args:
        department_id: The unique identifier of the department
    """
    print(f"[DEBUG] get_department_by_id called with department_id: {department_id}")
    service = DepartmentService(prisma)
    dept = await service.get_department(department_id)
    if not dept:
        print(f"[DEBUG] Department not found for ID: {department_id}")
        return {"error": "Department not found"}
    print(f"[DEBUG] Found department: {dept.name} (code: {dept.code})")
    return {"id": dept.id, "name": dept.name, "code": dept.code}

@tool
async def create_new_department(name: str,code:str):
    """Create a new department in the database.
    
    Args:
        name: The name of the department (required)
        location: The location of the department (optional)
    """
    print(f"[DEBUG] create_new_department called with name: {name}, code: {code}")
    service = DepartmentService(prisma)
    dept_data = DepartmentCreate(name=name,code=code)
    print(f"[DEBUG] Creating department with data: {dept_data}")
    dept = await service.create_department(dept_data)
    print(f"[DEBUG] Department created successfully with ID: {dept.id}")
    return {"id": dept.id, "name": dept.name, "code": dept.code, "message": "Department created successfully"}

@tool
async def update_existing_department(code: str, name: str):
    """Update an existing department's name based on its code.
    
    Args:
        code: The department code to identify which department to update (required)
        name: New name for the department (required)
    """
    print(f"[DEBUG] update_existing_department called with code: {code}, name: {name}")
    service = DepartmentService(prisma)
    try:
        department = await service.get_department_by_code(code)
        if not department:
            print(f"[DEBUG] Department with code '{code}' not found")
            return {"error": f"Department with code '{code}' not found"}
        
        department_id = department.id
        print(f"[DEBUG] Found department ID: {department_id}")
        dept_data = DepartmentUpdate(name=name, code=code)
        dept = await service.update_department(department_id, dept_data)
        
        if not dept:
            print(f"[DEBUG] Department could not be updated")
            return {"error": "Department could not be updated"}
        
        print(f"[DEBUG] Department updated successfully: {dept.name}")
        return {"id": dept.id, "name": dept.name, "code": dept.code, "message": f"Department '{code}' updated successfully with new name '{name}'"}
    except Exception as e:
        print(f"[DEBUG] Exception in update_existing_department: {str(e)}")
        return {"error": f"Failed to update department: {str(e)}"}

@tool
async def delete_existing_department(department_code: str):
    """Delete a department from the database. Use this tool when the user has confirmed they want to delete a department.
    This should only be called AFTER the user has explicitly confirmed the deletion (e.g., by saying 'yes', 'confirm', 'proceed', etc.).
    
    Args:
        department_code: The unique code of the department to delete (e.g., 'CS', 'RA', 'EE')
    """
    print(f"[DEBUG] delete_existing_department called with department_code: {department_code}")
    service = DepartmentService(prisma)
    try:
        await service.delete_department_by_code(department_code)
        print(f"[DEBUG] Department deleted successfully: {department_code}")
        return {"message": "Department deleted successfully", "department_id": department_code}
    except Exception as e:
        print(f"[DEBUG] Failed to delete department: {str(e)}")
        return {"error": "Department not found or could not be deleted"}