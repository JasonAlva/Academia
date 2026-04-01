const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8000/api";

export interface Teacher {
  id: string;
  userId: string;
  teacherId: string;
  department: string;
  designation: string;
  name: string;
  email: string;
}

export interface Student {
  id: string;
  userId: string;
  studentId: string;
  department: string;
  semester: number;
  name: string;
  email: string;
}

export interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: "TEACHER" | "STUDENT";
  content: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  teacherId: string;
  studentId: string;
  lastMessageAt?: string;
  createdAt: string;
  unreadCount: number;
  teacher?: {
    id: string;
    user: { name: string; email: string };
  };
  student?: {
    id: string;
    user: { name: string; email: string };
  };
  messages?: DirectMessage[];
}

export interface WebSocketMessage {
  type:
    | "new_message"
    | "messages_read"
    | "typing"
    | "joined_conversation"
    | "pong";
  conversationId?: string;
  message?: DirectMessage;
  senderName?: string;
  isTyping?: boolean;
  typerName?: string;
  timestamp?: string;
}

class DirectMessageService {
  private getHeaders() {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ detail: "Request failed" }));
      throw new Error(
        error.detail || `Request failed with status ${response.status}`,
      );
    }

    return response.json();
  }

  // For Teachers
  async getTeacherStudents(): Promise<Student[]> {
    return this.request<Student[]>("/messages/teacher/students");
  }

  async getTeacherConversations(): Promise<Conversation[]> {
    return this.request<Conversation[]>("/messages/teacher/conversations");
  }

  async startConversationWithStudent(studentId: string): Promise<Conversation> {
    return this.request<Conversation>("/messages/teacher/conversations", {
      method: "POST",
      body: JSON.stringify({ studentId }),
    });
  }

  // For Students
  async getStudentTeachers(): Promise<Teacher[]> {
    return this.request<Teacher[]>("/messages/student/teachers");
  }

  async getStudentConversations(): Promise<Conversation[]> {
    return this.request<Conversation[]>("/messages/student/conversations");
  }

  async startConversationWithTeacher(teacherId: string): Promise<Conversation> {
    return this.request<Conversation>("/messages/student/conversations", {
      method: "POST",
      body: JSON.stringify({ teacherId }),
    });
  }

  // Common
  async getConversation(conversationId: string): Promise<Conversation> {
    return this.request<Conversation>(
      `/messages/conversations/${conversationId}`,
    );
  }

  async getMessages(
    conversationId: string,
    limit = 50,
    offset = 0,
  ): Promise<DirectMessage[]> {
    return this.request<DirectMessage[]>(
      `/messages/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`,
    );
  }

  async sendMessage(
    conversationId: string,
    content: string,
  ): Promise<DirectMessage> {
    return this.request<DirectMessage>(
      `/messages/conversations/${conversationId}/messages`,
      {
        method: "POST",
        body: JSON.stringify({ content }),
      },
    );
  }

  async markAsRead(conversationId: string): Promise<void> {
    await this.request<{ status: string }>(
      `/messages/conversations/${conversationId}/read`,
      {
        method: "POST",
      },
    );
  }

  async getUnreadCount(): Promise<number> {
    const result = await this.request<{ unreadCount: number }>(
      "/messages/unread-count",
    );
    return result.unreadCount;
  }

  // WebSocket connection
  createWebSocketConnection(
    onMessage: (message: WebSocketMessage) => void,
  ): WebSocket | null {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const ws = new WebSocket(`${WS_URL}/messages/ws/${token}`);

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WebSocketMessage;
        onMessage(data);
      } catch (e) {
        console.error("Failed to parse WebSocket message:", e);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return ws;
  }

  // WebSocket actions
  joinConversation(ws: WebSocket | null, conversationId: string) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "join_conversation", conversationId }));
    }
  }

  leaveConversation(ws: WebSocket | null, conversationId: string) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "leave_conversation", conversationId }));
    }
  }

  sendTypingIndicator(
    ws: WebSocket | null,
    conversationId: string,
    isTyping: boolean,
  ) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "typing", conversationId, isTyping }));
    }
  }

  ping(ws: WebSocket | null) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "ping" }));
    }
  }
}

export const directMessageService = new DirectMessageService();
