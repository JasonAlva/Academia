from typing import List, Optional
from prisma import Prisma
from models.schemas import UserCreate, UserUpdate, UserOut

class UserService:
    def __init__(self, db: Prisma):
        self.db = db

    async def create_user(self, user_data: UserCreate) -> UserOut:
        user = await self.db.user.create(data=user_data.dict())
        return UserOut.from_orm(user)

    async def get_user(self, user_id: str) -> Optional[UserOut]:
        user = await self.db.user.find_unique(where={"id": user_id})
        return UserOut.from_orm(user) if user else None

    async def update_user(self, user_id: str, user_data: UserUpdate) -> Optional[UserOut]:
        user = await self.db.user.update(
            where={"id": user_id},
            data=user_data.dict(exclude_unset=True)
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