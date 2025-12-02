from prisma import Prisma
from fastapi import HTTPException
from typing import List, Optional
from src.models.schemas import AdminCreate, AdminUpdate, AdminOut
from src.utils.password import hash_password

class AdminService:
    def __init__(self, db: db):
        self.db = db

    async def create_admin(self, admin_data: AdminCreate) -> AdminOut:
        """Create a new admin with user account"""
        try:
            # Check if email already exists
            existing_user = await self.db.user.find_unique(
                where={"email": admin_data.email}
            )
            if existing_user:
                raise HTTPException(status_code=400, detail="Email already registered")

            # Check if adminId already exists
            existing_admin = await self.db.admin.find_unique(
                where={"adminId": admin_data.adminId}
            )
            if existing_admin:
                raise HTTPException(status_code=400, detail="Admin ID already exists")

            # Hash password
            hashed_password = hash_password(admin_data.password)

            # Create admin with user
            admin = await self.db.admin.create(
                data={
                    "adminId": admin_data.adminId,
                    "user": {
                        "create": {
                            "email": admin_data.email,
                            "password": hashed_password,
                            "role": "ADMIN",
                            "name": admin_data.name,
                        }
                    }
                },
                include={"user": True}
            )
            return admin
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to create admin: {str(e)}")

    async def update_admin(self, admin_id: str, admin_data: AdminUpdate) -> AdminOut:
        """Update admin information"""
        try:
            # Check if admin exists
            existing_admin = await self.db.admin.find_unique(
                where={"id": admin_id},
                include={"user": True}
            )
            if not existing_admin:
                raise HTTPException(status_code=404, detail="Admin not found")

            # Check if email is being changed and if it's already taken
            if admin_data.email and admin_data.email != existing_admin.user.email:
                email_exists = await self.db.user.find_unique(
                    where={"email": admin_data.email}
                )
                if email_exists:
                    raise HTTPException(status_code=400, detail="Email already in use")

            # Prepare update data
            user_update_data = {}
            if admin_data.email:
                user_update_data["email"] = admin_data.email
            if admin_data.name:
                user_update_data["name"] = admin_data.name

            # Update admin
            admin = await self.db.admin.update(
                where={"id": admin_id},
                data={
                    "user": {
                        "update": user_update_data
                    }
                },
                include={"user": True}
            )
            return admin
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to update admin: {str(e)}")

    async def get_admin(self, admin_id: str) -> AdminOut:
        """Get admin by ID"""
        admin = await self.db.admin.find_unique(
            where={"id": admin_id},
            include={"user": True}
        )
        if not admin:
            raise HTTPException(status_code=404, detail="Admin not found")
        return admin

    async def get_admin_by_user_id(self, user_id: str) -> Optional[AdminOut]:
        """Get admin by user ID"""
        admin = await self.db.admin.find_unique(
            where={"userId": user_id},
            include={"user": True}
        )
        return admin

    async def get_admin_by_admin_id(self, admin_id_str: str) -> Optional[AdminOut]:
        """Get admin by adminId (e.g., 'ADM2024001')"""
        admin = await self.db.admin.find_unique(
            where={"adminId": admin_id_str},
            include={"user": True}
        )
        return admin

    async def list_admins(self, skip: int = 0, limit: int = 100) -> List[AdminOut]:
        """List all admins with pagination"""
        return await self.db.admin.find_many(
            skip=skip,
            take=limit,
            include={"user": True},
            order={"createdAt": "desc"}
        )

    async def delete_admin(self, admin_id: str) -> bool:
        """Delete an admin (cascades to user)"""
        try:
            admin = await self.db.admin.find_unique(where={"id": admin_id})
            if not admin:
                raise HTTPException(status_code=404, detail="Admin not found")

            await self.db.admin.delete(where={"id": admin_id})
            return True
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to delete admin: {str(e)}")

    async def count_admins(self) -> int:
        """Get total count of admins"""
        return await self.db.admin.count()