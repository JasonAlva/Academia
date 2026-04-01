from fastapi import WebSocket
from typing import Dict, Set
import json
from datetime import datetime


class ConnectionManager:
    """Manages WebSocket connections for real-time messaging"""
    
    def __init__(self):
        # Map of user_id -> set of WebSocket connections (user can have multiple tabs/devices)
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        # Map of conversation_id -> set of user_ids currently viewing that conversation
        self.conversation_viewers: Dict[str, Set[str]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        """Accept a new WebSocket connection for a user"""
        await websocket.accept()
        
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        self.active_connections[user_id].add(websocket)
        
        print(f"User {user_id} connected. Total connections: {len(self.active_connections[user_id])}")
    
    def disconnect(self, websocket: WebSocket, user_id: str):
        """Remove a WebSocket connection for a user"""
        if user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        
        # Remove from any conversation viewers
        for conv_id in list(self.conversation_viewers.keys()):
            self.conversation_viewers[conv_id].discard(user_id)
            if not self.conversation_viewers[conv_id]:
                del self.conversation_viewers[conv_id]
        
        print(f"User {user_id} disconnected")
    
    def join_conversation(self, user_id: str, conversation_id: str):
        """Mark user as viewing a specific conversation"""
        if conversation_id not in self.conversation_viewers:
            self.conversation_viewers[conversation_id] = set()
        self.conversation_viewers[conversation_id].add(user_id)
    
    def leave_conversation(self, user_id: str, conversation_id: str):
        """Mark user as no longer viewing a specific conversation"""
        if conversation_id in self.conversation_viewers:
            self.conversation_viewers[conversation_id].discard(user_id)
    
    def is_user_in_conversation(self, user_id: str, conversation_id: str) -> bool:
        """Check if a user is currently viewing a conversation"""
        return (
            conversation_id in self.conversation_viewers and 
            user_id in self.conversation_viewers[conversation_id]
        )
    
    def is_user_online(self, user_id: str) -> bool:
        """Check if a user is currently connected"""
        return user_id in self.active_connections and len(self.active_connections[user_id]) > 0
    
    async def send_personal_message(self, message: dict, user_id: str):
        """Send a message to a specific user (all their connections)"""
        if user_id in self.active_connections:
            dead_connections = set()
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    print(f"Error sending to user {user_id}: {e}")
                    dead_connections.add(connection)
            
            # Clean up dead connections
            for conn in dead_connections:
                self.active_connections[user_id].discard(conn)
    
    async def send_to_conversation(self, message: dict, conversation_id: str, sender_id: str = None):
        """Send a message to all users viewing a conversation (optionally excluding sender)"""
        if conversation_id in self.conversation_viewers:
            for user_id in self.conversation_viewers[conversation_id]:
                if sender_id and user_id == sender_id:
                    continue  # Skip sender if specified
                await self.send_personal_message(message, user_id)
    
    async def broadcast_to_users(self, message: dict, user_ids: list):
        """Broadcast a message to specific users"""
        for user_id in user_ids:
            await self.send_personal_message(message, user_id)
    
    async def notify_new_message(
        self, 
        recipient_user_id: str, 
        conversation_id: str, 
        message_data: dict,
        sender_name: str
    ):
        """Notify a user about a new message"""
        notification = {
            "type": "new_message",
            "conversationId": conversation_id,
            "message": message_data,
            "senderName": sender_name,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.send_personal_message(notification, recipient_user_id)
    
    async def notify_message_read(
        self, 
        sender_user_id: str, 
        conversation_id: str
    ):
        """Notify the original sender that their messages were read"""
        notification = {
            "type": "messages_read",
            "conversationId": conversation_id,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.send_personal_message(notification, sender_user_id)
    
    async def notify_typing(
        self, 
        recipient_user_id: str, 
        conversation_id: str, 
        is_typing: bool,
        typer_name: str
    ):
        """Notify a user that someone is typing"""
        notification = {
            "type": "typing",
            "conversationId": conversation_id,
            "isTyping": is_typing,
            "typerName": typer_name,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.send_personal_message(notification, recipient_user_id)


# Global connection manager instance
manager = ConnectionManager()
