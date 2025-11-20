import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Message {
  role: "user" | "assistant";
  content: string;
  id?: string | number;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = messagesRef.current;
    if (el) requestAnimationFrame(() => (el.scrollTop = el.scrollHeight));
  }, [messages, isLoading]);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg: Message = {
      role: "user",
      content: input.trim(),
      id: Date.now(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token") || "";
      const res = await fetch("http://localhost:8000/api/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query: userMsg.content }),
      });
      const data = await res.json();
      const assistant: Message = {
        role: "assistant",
        content: data.answer || "No response",
        id: Date.now() + 1,
      };
      setMessages((m) => [...m, assistant]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "Error: failed to fetch",
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
    <Card className="w-full min-h-[520px] flex flex-col">
      <CardHeader>
        <CardTitle>Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
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
              className={`max-w-[80%] px-4 py-3 rounded-lg break-words shadow-sm ${
                m.role === "user"
                  ? "ml-auto bg-indigo-600 text-white rounded-tr-none"
                  : "mr-auto bg-gray-100 text-gray-800 rounded-bl-none"
              }`}
            >
              <div className="whitespace-pre-wrap">{m.content}</div>
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
  );
}
