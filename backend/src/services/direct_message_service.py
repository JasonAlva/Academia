from prisma import Prisma
from datetime import datetime
from typing import Optional, List
from fastapi import HTTPException


class DirectMessageService:
    def __init__(self, db: Prisma):
        self.db = db

    async def get_or_create_conversation(
        self, teacher_id: str, student_id: str
    ) -> dict:
        """Get existing conversation or create a new one between teacher and student"""
        # Try to find existing conversation
        conversation = await self.db.directconversation.find_first(
            where={
                "teacherId": teacher_id,
                "studentId": student_id
            },
            include={
                "teacher": {
                    "include": {"user": True}
                },
                "student": {
                    "include": {"user": True}
                }
            }
        )
        
        if conversation:
            return conversation
        
        # Create new conversation
        conversation = await self.db.directconversation.create(
            data={
                "teacherId": teacher_id,
                "studentId": student_id
            },
            include={
                "teacher": {
                    "include": {"user": True}
                },
                "student": {
                    "include": {"user": True}
                }
            }
        )
        
        return conversation

    async def get_conversation_by_id(self, conversation_id: str) -> Optional[dict]:
        """Get a conversation by ID"""
        return await self.db.directconversation.find_unique(
            where={"id": conversation_id},
            include={
                "teacher": {
                    "include": {"user": True}
                },
                "student": {
                    "include": {"user": True}
                },
                "messages": True
            }
        )

    async def get_teacher_conversations(self, teacher_id: str) -> List[dict]:
        """Get all conversations for a teacher with their students"""
        conversations = await self.db.directconversation.find_many(
            where={"teacherId": teacher_id},
            include={
                "student": {
                    "include": {"user": True}
                },
                "messages": True
            },
            order={"lastMessageAt": "desc"}
        )
        
        # Add unread count for each conversation
        result = []
        for conv in conversations:
            unread_count = await self.db.directmessage.count(
                where={
                    "conversationId": conv.id,
                    "senderRole": "STUDENT",
                    "isRead": False
                }
            )
            conv_dict = {
                **conv.model_dump(),
                "unreadCount": unread_count
            }
            result.append(conv_dict)
        
        return result

    async def get_student_conversations(self, student_id: str) -> List[dict]:
        """Get all conversations for a student with their teachers"""
        conversations = await self.db.directconversation.find_many(
            where={"studentId": student_id},
            include={
                "teacher": {
                    "include": {"user": True}
                },
                "messages": True
            },
            order={"lastMessageAt": "desc"}
        )
        
        # Add unread count for each conversation
        result = []
        for conv in conversations:
            unread_count = await self.db.directmessage.count(
                where={
                    "conversationId": conv.id,
                    "senderRole": "TEACHER",
                    "isRead": False
                }
            )
            conv_dict = {
                **conv.model_dump(),
                "unreadCount": unread_count
            }
            result.append(conv_dict)
        
        return result

    async def get_conversation_messages(
        self, 
        conversation_id: str, 
        limit: int = 50, 
        offset: int = 0
    ) -> List[dict]:
        """Get messages for a conversation with pagination"""
        messages = await self.db.directmessage.find_many(
            where={"conversationId": conversation_id},
            order={"createdAt": "asc"},
            skip=offset,
            take=limit
        )
        return messages

    async def send_message(
        self, 
        conversation_id: str, 
        sender_id: str, 
        sender_role: str, 
        content: str
    ) -> dict:
        """Send a new message in a conversation"""
        # Verify conversation exists
        conversation = await self.db.directconversation.find_unique(
            where={"id": conversation_id}
        )
        
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        # Create the message
        message = await self.db.directmessage.create(
            data={
                "conversationId": conversation_id,
                "senderId": sender_id,
                "senderRole": sender_role,
                "content": content
            }
        )
        
        # Update conversation's lastMessageAt
        await self.db.directconversation.update(
            where={"id": conversation_id},
            data={"lastMessageAt": datetime.utcnow()}
        )
        
        return message

    async def mark_messages_as_read(
        self, 
        conversation_id: str, 
        reader_role: str
    ) -> int:
        """Mark all messages from the other party as read"""
        # If reader is teacher, mark student messages as read
        # If reader is student, mark teacher messages as read
        sender_role = "STUDENT" if reader_role == "TEACHER" else "TEACHER"
        
        result = await self.db.directmessage.update_many(
            where={
                "conversationId": conversation_id,
                "senderRole": sender_role,
                "isRead": False
            },
            data={
                "isRead": True,
                "readAt": datetime.utcnow()
            }
        )
        
        return result

    async def get_teacher_students(self, teacher_id: str) -> List[dict]:
        """Get all students enrolled in courses taught by this teacher"""
        # Get courses taught by teacher
        courses = await self.db.course.find_many(
            where={"teacherId": teacher_id},
            include={
                "enrollments": {
                    "include": {
                        "student": {
                            "include": {"user": True}
                        }
                    },
                    "where": {"status": "ACTIVE"}
                }
            }
        )
        
        # Extract unique students
        students_dict = {}
        for course in courses:
            for enrollment in course.enrollments:
                student = enrollment.student
                if student.id not in students_dict:
                    students_dict[student.id] = {
                        "id": student.id,
                        "userId": student.userId,
                        "studentId": student.studentId,
                        "department": student.department,
                        "semester": student.semester,
                        "name": student.user.name,
                        "email": student.user.email
                    }
        
        return list(students_dict.values())

    async def get_student_teachers(self, student_id: str) -> List[dict]:
        """Get all teachers who teach courses the student is enrolled in"""
        # Get student's enrollments
        enrollments = await self.db.enrollment.find_many(
            where={
                "studentId": student_id,
                "status": "ACTIVE"
            },
            include={
                "course": {
                    "include": {
                        "teacher": {
                            "include": {"user": True}
                        }
                    }
                }
            }
        )
        
        # Extract unique teachers
        teachers_dict = {}
        for enrollment in enrollments:
            teacher = enrollment.course.teacher
            if teacher and teacher.id not in teachers_dict:
                teachers_dict[teacher.id] = {
                    "id": teacher.id,
                    "userId": teacher.userId,
                    "teacherId": teacher.teacherId,
                    "department": teacher.department,
                    "designation": teacher.designation,
                    "name": teacher.user.name,
                    "email": teacher.user.email
                }
        
        return list(teachers_dict.values())

    async def verify_teacher_student_relationship(
        self, 
        teacher_id: str, 
        student_id: str
    ) -> bool:
        """Verify that teacher and student have a valid academic relationship"""
        # Check if teacher teaches any course the student is enrolled in
        enrollment = await self.db.enrollment.find_first(
            where={
                "studentId": student_id,
                "status": "ACTIVE",
                "course": {
                    "teacherId": teacher_id
                }
            }
        )
        
        return enrollment is not None

    async def get_unread_count_for_user(self, user_id: str, role: str) -> int:
        """Get total unread message count for a user"""
        if role == "TEACHER":
            teacher = await self.db.teacher.find_first(where={"userId": user_id})
            if not teacher:
                return 0
            
            conversations = await self.db.directconversation.find_many(
                where={"teacherId": teacher.id}
            )
            
            total = 0
            for conv in conversations:
                count = await self.db.directmessage.count(
                    where={
                        "conversationId": conv.id,
                        "senderRole": "STUDENT",
                        "isRead": False
                    }
                )
                total += count
            return total
        
        elif role == "STUDENT":
            student = await self.db.student.find_first(where={"userId": user_id})
            if not student:
                return 0
            
            conversations = await self.db.directconversation.find_many(
                where={"studentId": student.id}
            )
            
            total = 0
            for conv in conversations:
                count = await self.db.directmessage.count(
                    where={
                        "conversationId": conv.id,
                        "senderRole": "TEACHER",
                        "isRead": False
                    }
                )
                total += count
            return total
        
        return 0
