from typing import List, Optional
from prisma import Prisma
from prisma.models import ChatMessage

class ChatService:
    def __init__(self, db: Prisma):
        self.db = db

    async def create_message(
        self, 
        user_id: str, 
        role: str, 
        content: str, 
        thread_id: Optional[str] = None, 
        parent_id: Optional[str] = None
    ) -> ChatMessage:
        message = await self.db.chatmessage.create(
            data={
                'user': {'connect': {'id': user_id}},
                'role': role,
                'content': content,
                'threadId': thread_id,
                'parentId': parent_id,
            }
        )
        return message

    async def get_messages(self, thread_id: str, limit: int = 50) -> List[ChatMessage]:
        messages = await self.db.chatmessage.find_many(
            where={'threadId': thread_id},
            take=limit,
            order={'createdAt': 'asc'}
        )
        return messages

    async def delete_message(self, message_id: str) -> ChatMessage:
        message = await self.db.chatmessage.delete(
            where={'id': message_id}
        )
        return message