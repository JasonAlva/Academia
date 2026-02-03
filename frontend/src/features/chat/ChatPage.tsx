import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, Trash2, MessageSquare } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  query: string;
  id?: string | number;
}

interface Conversation {
  id: string;
  userId: string;
  threadId: string | null;
  messages: Message[];
  title: string;
  createdAt: string;
  updatedAt: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const messagesRef = useRef<HTMLDivElement | null>(null);

  // Load conversations from API on mount
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem("token") || "";
        const res = await fetch(
          "http://localhost:8000/api/conversations/conversations",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (res.ok) {
          const data = await res.json();
          setConversations(data);
        }
      } catch (err) {
        console.error("Failed to fetch conversations", err);
      }
    };
    fetchConversations();
  }, []);

  useEffect(() => {
    const el = messagesRef.current;
    if (el) requestAnimationFrame(() => (el.scrollTop = el.scrollHeight));
  }, [messages, isLoading]);

  // Save current conversation whenever messages change
  useEffect(() => {
    const saveConversation = async () => {
      if (messages.length > 0 && currentConversationId) {
        try {
          const token = localStorage.getItem("token") || "";
          const title =
            messages.find((m) => m.role === "user")?.query.substring(0, 40) ||
            "New Conversation";
          await fetch(
            `http://localhost:8000/api/conversations/conversations/${currentConversationId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                messages: messages,
                threadId: threadId,
                title: title,
              }),
            },
          );
          // Update local state
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === currentConversationId
                ? {
                    ...conv,
                    messages,
                    threadId: threadId,
                    updatedAt: new Date().toISOString(),
                  }
                : conv,
            ),
          );
        } catch (err) {
          console.error("Failed to save conversation", err);
        }
      }
    };
    saveConversation();
  }, [messages, currentConversationId, threadId]);

  const createNewConversation = async () => {
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(
        "http://localhost:8000/api/conversations/conversations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title: "New Conversation" }),
        },
      );
      if (res.ok) {
        const newConv = await res.json();
        setConversations((prev) => [newConv, ...prev]);
        setCurrentConversationId(newConv.id);
        setMessages([]);
        setThreadId(null);
        setIsHistoryOpen(false);
      }
    } catch (err) {
      console.error("Failed to create conversation", err);
    }
  };

  const loadConversation = (conv: Conversation) => {
    setCurrentConversationId(conv.id);
    setMessages(conv.messages);
    setThreadId(conv.threadId);
    setIsHistoryOpen(false);
  };

  const deleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch(
        `http://localhost:8000/api/conversations/conversations/${convId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (res.ok) {
        setConversations((prev) => prev.filter((c) => c.id !== convId));
        if (currentConversationId === convId) {
          setMessages([]);
          setThreadId(null);
          setCurrentConversationId(null);
        }
      }
    } catch (err) {
      console.error("Failed to delete conversation", err);
    }
  };

  const getConversationTitle = (conv: Conversation): string => {
    if (conv.messages.length > 0) {
      const firstUserMsg = conv.messages.find((m) => m.role === "user");
      return firstUserMsg
        ? firstUserMsg.query.substring(0, 40) + "..."
        : "New Conversation";
    }
    return "New Conversation";
  };

  const send = async () => {
    if (!input.trim()) return;

    // Create a new conversation if none exists
    if (!currentConversationId) {
      try {
        const token = localStorage.getItem("token") || "";
        const res = await fetch(
          "http://localhost:8000/api/conversations/conversations",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ title: "New Conversation" }),
          },
        );
        if (res.ok) {
          const newConv = await res.json();
          setConversations((prev) => [newConv, ...prev]);
          setCurrentConversationId(newConv.id);
        }
      } catch (err) {
        console.error("Failed to create conversation", err);
        return;
      }
    }

    const userMsg: any = {
      query: input.trim(),
      thread_id: threadId,
    };
    const userMessg: Message = {
      role: "user",
      query: input.trim(),
      id: Date.now(),
    };
    setMessages((m) => [...m, userMessg]);
    setInput("");
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch("http://localhost:8000/api/agent/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: userMsg.query,
          thread_id: threadId,
        }),
      });
      const data = await res.json();

      // Save thread_id for conversation continuity
      if (data.thread_id && !threadId) {
        setThreadId(data.thread_id);
        console.log("Started new conversation thread:", data.thread_id);
      }

      const assistant: Message = {
        role: "assistant",
        query: data.answer || "No response",
        id: Date.now() + 1,
      };
      setMessages((m) => [...m, assistant]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          query: "Error: failed to fetch",
          id: Date.now() + 2,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8">
      <Card className="w-full min-h-[600px] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Chat
          </CardTitle>
          <div className="flex gap-2">
            <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <History className="h-4 w-4 mr-2" />
                  History
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Chat History</SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                  <Button
                    onClick={createNewConversation}
                    className="w-full mb-4"
                    variant="default"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    New Conversation
                  </Button>
                  <ScrollArea className="h-[calc(100vh-180px)]">
                    {conversations.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        No conversations yet
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {conversations.map((conv) => (
                          <div
                            key={conv.id}
                            onClick={() => loadConversation(conv)}
                            className={`p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors ${
                              currentConversationId === conv.id
                                ? "border-indigo-500 bg-indigo-50"
                                : "border-gray-200"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {getConversationTitle(conv)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(
                                    conv.updatedAt,
                                  ).toLocaleDateString()}{" "}
                                  {new Date(conv.updatedAt).toLocaleTimeString(
                                    [],
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    },
                                  )}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {conv.messages.length} messages
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => deleteConversation(conv.id, e)}
                                className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </SheetContent>
            </Sheet>
            <Button
              variant="outline"
              size="sm"
              onClick={createNewConversation}
              disabled={messages.length === 0 && !currentConversationId}
            >
              New Conversation
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0 ">
          <div
            ref={messagesRef}
            className="flex-1 overflow-y-auto p-6 space-y-4 bg-white/50"
            aria-live="polite"
          >
            {messages.length === 0 && (
              <div className="text-center text-gray-500">
                Start the conversation...
              </div>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[80%] px-4 py-3 rounded-lg wrap-break-word shadow-sm ${
                  m.role === "user"
                    ? "ml-auto bg-indigo-600 text-white rounded-tr-none"
                    : "mr-auto bg-gray-100 text-gray-800 rounded-bl-none"
                }`}
              >
                <div className="whitespace-pre-wrap">{m.query}</div>
              </div>
            ))}

            {isLoading && (
              <div className="max-w-[20%] bg-gray-100 text-gray-800 px-3 py-2 rounded-lg">
                <div className="animate-pulse">Assistant is typing...</div>
              </div>
            )}
          </div>

          <div className="border-t p-4 bg-white">
            <div className="flex gap-2">
              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Ask about your timetable... (Shift+Enter for newline)"
                className="flex-1 resize-none rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <Button onClick={send} disabled={isLoading || !input.trim()}>
                {isLoading ? "Sending..." : "Send"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
