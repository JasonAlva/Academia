from typing import List, Optional
from prisma import Prisma
from src.models.schemas import DepartmentCreate, DepartmentUpdate
from prisma.models import Department
class DepartmentService:
    def __init__(self, db: Prisma):
        self.db = db

    async def create_department(self, department_data: DepartmentCreate) -> Department:
        department = await self.db.department.create(data=department_data.dict())
        return department

    async def get_department(self, department_id: str) -> Optional[Department]:
        department = await self.db.department.find_unique(where={"id": department_id})
        return department

    async def update_department(self, department_id: str, department_data: DepartmentUpdate) -> Optional[Department]:
        department = await self.db.department.update(
            where={"id": department_id},
            data=department_data.dict(exclude_unset=True)
        )
        return department

    async def delete_department(self, department_id: str) -> Optional[Department]:
        department = await self.db.department.delete(where={"id": department_id})
        return department
    
    async def delete_department_by_code(self, department_code: str) -> Optional[Department]:
        department = await self.db.department.delete(where={"code": department_code})
        return department

    async def list_departments(self) -> List[Department]:
        departments = await self.db.department.find_many()
        return departments