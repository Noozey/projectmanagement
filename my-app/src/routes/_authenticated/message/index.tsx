import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

export const Route = createFileRoute("/_authenticated/message/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Message />;
}

function Message() {
  const [user, setUser] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const getUser = async () => {
      const users = await api.get("/user").then((res) => {
        return res.data.message;
      });
      setUser(users);
    };
    getUser();
  }, []);

  const handleSendMessage = () => {
    if (message.trim() && selectedUser) {
      // TODO: Send message via socket or API
      console.log("Sending message:", message, "to user:", selectedUser);
      setMessage("");
    }
  };

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
                key={index}
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
                      className={`font-medium ${isSelected ? "text-accent-foreground" : "text-foreground group-hover:text-accent-foreground"}`}
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
