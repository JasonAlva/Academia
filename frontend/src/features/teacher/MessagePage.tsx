import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  directMessageService,
  type Conversation,
  type DirectMessage,
  type Student,
  type WebSocketMessage,
} from "@/services/directMessageService";
import { useAuth } from "@/auth/AuthContext";
import { Send, MessageSquare, Users, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function TeacherMessagePage() {
  useAuth(); // Ensure user is authenticated
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [showStudentList, setShowStudentList] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle incoming WebSocket messages
  const handleWebSocketMessage = useCallback(
    (wsMessage: WebSocketMessage) => {
      if (wsMessage.type === "new_message" && wsMessage.message) {
        // Add new message to the list if it's for the current conversation
        if (
          selectedConversation &&
          wsMessage.conversationId === selectedConversation.id
        ) {
          setMessages((prev) => [...prev, wsMessage.message!]);
          // Mark as read since we're viewing this conversation
          directMessageService.markAsRead(wsMessage.conversationId);
        }

        // Update conversations list with new message indicator
        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id === wsMessage.conversationId) {
              return {
                ...conv,
                lastMessageAt: wsMessage.timestamp,
                unreadCount:
                  conv.id === selectedConversation?.id
                    ? 0
                    : conv.unreadCount + 1,
              };
            }
            return conv;
          }),
        );

        // Show notification if not viewing this conversation
        if (
          !selectedConversation ||
          wsMessage.conversationId !== selectedConversation.id
        ) {
          toast.info(`New message from ${wsMessage.senderName}`);
        }
      } else if (wsMessage.type === "messages_read") {
        // Update message read status
        if (
          selectedConversation &&
          wsMessage.conversationId === selectedConversation.id
        ) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.senderRole === "TEACHER" ? { ...msg, isRead: true } : msg,
            ),
          );
        }
      } else if (wsMessage.type === "typing") {
        if (
          selectedConversation &&
          wsMessage.conversationId === selectedConversation.id
        ) {
          if (wsMessage.isTyping) {
            setTypingUser(wsMessage.typerName || null);
          } else {
            setTypingUser(null);
          }
        }
      }
    },
    [selectedConversation],
  );

  // Initialize WebSocket connection
  useEffect(() => {
    wsRef.current = directMessageService.createWebSocketConnection(
      handleWebSocketMessage,
    );

    // Ping every 30 seconds to keep connection alive
    const pingInterval = setInterval(() => {
      directMessageService.ping(wsRef.current);
    }, 30000);

    return () => {
      clearInterval(pingInterval);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [handleWebSocketMessage]);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [convs, studs] = await Promise.all([
          directMessageService.getTeacherConversations(),
          directMessageService.getTeacherStudents(),
        ]);
        setConversations(convs);
        setStudents(studs);
      } catch (error) {
        console.error("Failed to load data:", error);
        toast.error("Failed to load messages");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Load messages when conversation is selected
  useEffect(() => {
    if (!selectedConversation) return;

    const loadMessages = async () => {
      try {
        const msgs = await directMessageService.getMessages(
          selectedConversation.id,
        );
        setMessages(msgs);

        // Mark messages as read
        await directMessageService.markAsRead(selectedConversation.id);

        // Update unread count in conversations list
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === selectedConversation.id
              ? { ...conv, unreadCount: 0 }
              : conv,
          ),
        );

        // Join the conversation room via WebSocket
        directMessageService.joinConversation(
          wsRef.current,
          selectedConversation.id,
        );
      } catch (error) {
        console.error("Failed to load messages:", error);
        toast.error("Failed to load messages");
      }
    };

    loadMessages();

    return () => {
      // Leave conversation room when switching
      if (selectedConversation) {
        directMessageService.leaveConversation(
          wsRef.current,
          selectedConversation.id,
        );
      }
    };
  }, [selectedConversation?.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || isSending) return;

    const messageContent = newMessage.trim();
    setNewMessage("");
    setIsSending(true);

    try {
      const sentMessage = await directMessageService.sendMessage(
        selectedConversation.id,
        messageContent,
      );
      setMessages((prev) => [...prev, sentMessage]);

      // Update conversation's last message time
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedConversation.id
            ? { ...conv, lastMessageAt: sentMessage.createdAt }
            : conv,
        ),
      );
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
      setNewMessage(messageContent); // Restore message on error
    } finally {
      setIsSending(false);
    }
  };

  // Handle starting a new conversation with a student
  const handleStartConversation = async (student: Student) => {
    try {
      const conversation =
        await directMessageService.startConversationWithStudent(student.id);

      // Check if conversation already exists in list
      const existingConv = conversations.find((c) => c.id === conversation.id);
      if (!existingConv) {
        setConversations((prev) => [conversation, ...prev]);
      }

      // Select this conversation
      setSelectedConversation(conversation);
      setShowStudentList(false);
    } catch (error) {
      console.error("Failed to start conversation:", error);
      toast.error("Failed to start conversation");
    }
  };

  // Handle typing indicator
  const handleTyping = () => {
    if (!selectedConversation) return;

    directMessageService.sendTypingIndicator(
      wsRef.current,
      selectedConversation.id,
      true,
    );

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      directMessageService.sendTypingIndicator(
        wsRef.current,
        selectedConversation.id,
        false,
      );
    }, 2000);
  };

  // Filter students based on search
  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.department.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Get student name for a conversation
  const getStudentName = (conv: Conversation) => {
    return conv.student?.user?.name || "Unknown Student";
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-120px)] gap-4 p-4">
      {/* Conversations Sidebar */}
      <Card className="w-80 flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Messages
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowStudentList(!showStudentList)}
            >
              <Users className="h-4 w-4 mr-1" />
              New
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-2">
          {showStudentList ? (
            // Student list for starting new conversations
            <div className="h-full flex flex-col">
              <div className="relative mb-2">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <ScrollArea className="flex-1">
                <div className="space-y-1">
                  {filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      className="p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                      onClick={() => handleStartConversation(student)}
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 bg-primary/10">
                          <span className="text-xs font-medium">
                            {student.name.charAt(0).toUpperCase()}
                          </span>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {student.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {student.studentId} • {student.department}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredStudents.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No students found
                    </p>
                  )}
                </div>
              </ScrollArea>
            </div>
          ) : (
            // Conversations list
            <ScrollArea className="h-full">
              <div className="space-y-1">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedConversation?.id === conv.id
                        ? "bg-primary/10"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => setSelectedConversation(conv)}
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8 bg-primary/10">
                        <span className="text-xs font-medium">
                          {getStudentName(conv).charAt(0).toUpperCase()}
                        </span>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">
                            {getStudentName(conv)}
                          </p>
                          {conv.unreadCount > 0 && (
                            <Badge
                              variant="default"
                              className="h-5 min-w-5 text-xs"
                            >
                              {conv.unreadCount}
                            </Badge>
                          )}
                        </div>
                        {conv.lastMessageAt && (
                          <p className="text-xs text-muted-foreground">
                            {new Date(conv.lastMessageAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {conversations.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No conversations yet</p>
                    <p className="text-xs">
                      Click "New" to start messaging a student
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <CardHeader className="pb-2 border-b">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 bg-primary/10">
                  <span className="font-medium">
                    {getStudentName(selectedConversation)
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">
                    {getStudentName(selectedConversation)}
                  </CardTitle>
                  {typingUser && (
                    <p className="text-xs text-muted-foreground animate-pulse">
                      {typingUser} is typing...
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>

            {/* Messages Area */}
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full p-4">
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.senderRole === "TEACHER"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-3 py-2 ${
                          msg.senderRole === "TEACHER"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-all">
                          {msg.content}
                        </p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-xs opacity-70">
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {msg.senderRole === "TEACHER" && msg.isRead && (
                            <span className="text-xs opacity-70">✓✓</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </CardContent>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={isSending}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isSending || !newMessage.trim()}
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          // No conversation selected
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm">Choose a student to start messaging</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
