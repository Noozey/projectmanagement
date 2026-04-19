import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Send } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useUser } from "@/context/user";
import { useProject } from "@/context/project";

const socket = io("http://localhost:3001", {
  auth: {
    token: localStorage.getItem("token"),
  },
});

export const Route = createFileRoute(
  "/_authenticated/project/message/$message",
)({
  component: RouteComponent,
});

function RouteComponent() {
  return <Message />;
}

function Message() {
  const { projectID } = useProject();
  const [user, setUser] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const messagesEndRef = useRef(null);
  const { user: userInfo } = useUser();

  useEffect(() => {
    if (userInfo?.uid) {
      setCurrentUserId(userInfo.uid);
    }
  }, [userInfo]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleReceive = (data) => {
      // Add received message to messages array
      setMessages((prev) => [...prev, data]);
    };

    socket.on("receive_message", handleReceive);

    return () => {
      socket.off("receive_message", handleReceive);
    };
  }, []);

  useEffect(() => {
    const getProjectMembers = async () => {
      if (!projectID) return;
      const res = await api.get(`/kanban/${projectID}/members`);
      setUser(res.data);
    };
    getProjectMembers();
  }, [projectID]);

  // Load chat history when a user is selected
  useEffect(() => {
    if (selectedUser && currentUserId) {
      const loadChatHistory = async () => {
        try {
          // Adjust endpoint according to your API
          const response = await api.get(`/messages/${selectedUser.uid}`);
          setMessages(response.data.messages || []);
          console.log(response.data.message);
        } catch (error) {
          console.error("Error loading chat history:", error);
          setMessages([]); // Reset to empty if error
        }
      };
      loadChatHistory();
    }
  }, [selectedUser, currentUserId]);

  const handleSendMessage = () => {
    if (message.trim() && selectedUser) {
      const messageData = {
        senderId: currentUserId,
        receiverId: selectedUser.uid,
        text: message,
        createdAt: new Date().toISOString(),
      };

      socket.emit("send_message", {
        receiverId: selectedUser.uid,
        text: message,
      });
      setMessages((prev) => [...prev, messageData]);
      setMessage("");
    }
  };

  // Filter messages for the selected conversation
  const getFilteredMessages = () => {
    if (!selectedUser || !currentUserId) return [];

    return messages.filter((msg) => {
      return (
        (msg.senderId === currentUserId &&
          msg.receiverId === selectedUser.uid) ||
        (msg.senderId === selectedUser.uid && msg.receiverId === currentUserId)
      );
    });
  };

  const filteredMessages = getFilteredMessages();

  return (
    <div className="bg-background my-5 h-screen rounded-2xl flex">
      {/* Sidebar */}
      <div className="w-80 border-r border-border bg-background rounded-l-2xl">
        {/* Header */}
        <div className="p-6">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Messages
          </h2>
        </div>
        <Separator className="bg-border" />
        {/* User List */}
        <div
          className="p-3 space-y-1 overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 160px)" }}
        >
          {user.map((value, index) => {
            const isSelected = selectedIndex === index;
            return (
              <div
                key={value.uid || index}
                onClick={() => {
                  setSelectedUser(value);
                  setSelectedIndex(index);
                }}
                className={`group p-4 hover:bg-accent rounded-lg cursor-pointer transition-colors duration-200 ${
                  isSelected ? "bg-accent" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {value.name.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-medium ${isSelected ? `text-accent-foreground` : `text-foreground group-hover:text-accent-foreground`}`}
                    >
                      {value.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      Click to view messages
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Message Area */}
      <div className="flex-1 flex flex-col bg-background rounded-r-2xl">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-base font-medium text-primary">
                    {selectedUser.name.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {selectedUser.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">Active now</p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-6 overflow-y-auto">
              {filteredMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                      <MessageCircle className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      No messages yet. Start the conversation!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredMessages.map((msg, index) => {
                    const isSentByMe = msg.senderId === currentUserId;
                    return (
                      <div
                        key={index}
                        className={`flex ${isSentByMe ? `justify-end` : `justify-start`}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-4 py-2 ${
                            isSentByMe
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground"
                          }`}
                        >
                          <p className="text-sm break-words">{msg.text}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isSentByMe
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            }`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={`Message ${selectedUser.name}...`}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  size="icon"
                  className="shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          // Empty State
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-lg font-medium text-foreground">
                  No conversation selected
                </p>
                <p className="text-sm text-muted-foreground">
                  Choose a user from the sidebar to view messages
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
