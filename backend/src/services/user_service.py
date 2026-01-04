from typing import List, Optional
from prisma import Prisma
from src.models.schemas import UserCreate, UserUpdate, UserOut
from src.utils.password import hash_password

class UserService:
    def __init__(self, db: Prisma):
        self.db = db

    async def create_user(self, user_data: UserCreate) -> UserOut:
        user = await self.db.user.create(data=user_data.dict())
        return UserOut.from_orm(user)

    async def get_user(self, user_id: str) -> Optional[UserOut]:
        user = await self.db.user.find_unique(where={"id": user_id})
        return UserOut.from_orm(user) if user else None
    
    async def get_user_email(self, user_email: str) -> Optional[UserOut]:
        user = await self.db.user.find_unique(where={"email": user_email})
        return UserOut.from_orm(user) if user else None

    async def update_user(self, user_id: str, user_data: UserUpdate) -> Optional[UserOut]:
        # Prepare update data
        update_dict = user_data.dict(exclude_unset=True)
        
        # Hash password if it's being updated
        if "password" in update_dict and update_dict["password"]:
            update_dict["password"] = hash_password(update_dict["password"])
        
        user = await self.db.user.update(
            where={"id": user_id},
            data=update_dict
        )
        return UserOut.from_orm(user)

    async def delete_user(self, user_id: str) -> bool:
        try:
            await self.db.user.delete(where={"id": user_id})
            return True
        except Exception:
            return False

    async def list_users(self) -> List[UserOut]:
        users = await self.db.user.find_many()
        return [UserOut.from_orm(user) for user in users]