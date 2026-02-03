const API_BASE_URL = "http://localhost:8000/api/conversations";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token") || "";
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export interface Message {
  role: "user" | "assistant";
  query: string;
  id?: string | number;
}

export interface Conversation {
  id: string;
  userId: string;
  threadId: string | null;
  messages: Message[];
  title: string;
  createdAt: string;
  updatedAt: string;
}

export const conversationService = {
  async getAll(): Promise<Conversation[]> {
    const res = await fetch(`${API_BASE_URL}/conversations`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch conversations");
    return res.json();
  },

  async getById(id: string): Promise<Conversation> {
    const res = await fetch(`${API_BASE_URL}/conversations/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch conversation");
    return res.json();
  },

  async create(title: string = "New Conversation"): Promise<Conversation> {
    const res = await fetch(`${API_BASE_URL}/conversations`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ title }),
    });
    if (!res.ok) throw new Error("Failed to create conversation");
    return res.json();
  },

  async update(
    id: string,
    data: {
      messages?: Message[];
      threadId?: string | null;
      title?: string;
    },
  ): Promise<Conversation> {
    const res = await fetch(`${API_BASE_URL}/conversations/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update conversation");
    return res.json();
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/conversations/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete conversation");
  },
};
