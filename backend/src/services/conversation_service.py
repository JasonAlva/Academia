from typing import List, Optional
from prisma import Prisma
from prisma.models import Conversation
import json

class ConversationService:
    def __init__(self, db: Prisma):
        self.db = db

    async def create_conversation(self, user_id: str, title: str = "New Conversation") -> Conversation:
        """Create a new conversation for a user"""
        conversation = await self.db.conversation.create(
            data={
                "userId": user_id,
                "title": title,
                "messages": json.dumps([]),
            }
        )
        return conversation

    async def get_user_conversations(self, user_id: str) -> List[Conversation]:
        """Get all conversations for a user, ordered by most recent"""
        conversations = await self.db.conversation.find_many(
            where={"userId": user_id},
            order={"updatedAt": "desc"}
        )
        return conversations

    async def get_conversation_by_id(self, conversation_id: str, user_id: str) -> Optional[Conversation]:
        """Get a specific conversation by ID, ensuring it belongs to the user"""
        conversation = await self.db.conversation.find_first(
            where={
                "id": conversation_id,
                "userId": user_id
            }
        )
        return conversation

    async def update_conversation(
        self, 
        conversation_id: str, 
        user_id: str, 
        messages: Optional[List] = None,
        thread_id: Optional[str] = None,
        title: Optional[str] = None
    ) -> Optional[Conversation]:
        """Update conversation messages, thread_id, or title"""
        # First verify the conversation belongs to the user
        existing = await self.get_conversation_by_id(conversation_id, user_id)
        if not existing:
            return None

        update_data = {}
        if messages is not None:
            update_data["messages"] = json.dumps(messages)
        if thread_id is not None:
            update_data["threadId"] = thread_id
        if title is not None:
            update_data["title"] = title

        conversation = await self.db.conversation.update(
            where={"id": conversation_id},
            data=update_data
        )
        return conversation

    async def delete_conversation(self, conversation_id: str, user_id: str) -> bool:
        """Delete a conversation, ensuring it belongs to the user"""
        existing = await self.get_conversation_by_id(conversation_id, user_id)
        if not existing:
            return False

        await self.db.conversation.delete(
            where={"id": conversation_id}
        )
        return True
