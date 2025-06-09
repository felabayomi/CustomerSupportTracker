import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, Send, Clock, Globe, User } from "lucide-react";
import { useWebSocket } from "@/hooks/use-websocket";

interface PublicChatSession {
  sessionId: string;
  websiteUrl: string;
  isActive: boolean;
  lastActivity: string;
  unreadCount: number;
  messages: PublicChatMessage[];
}

interface PublicChatMessage {
  id: string;
  message: string;
  sender: 'user' | 'agent';
  timestamp: string;
  agentName?: string;
}

export default function PublicChatInbox() {
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [sessions, setSessions] = useState<PublicChatSession[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { sendMessage: sendWebSocketMessage, isConnected } = useWebSocket({
    onMessage: (data) => {
      if (data.type === 'public_chat_update') {
        setSessions(prev => {
          const existingIndex = prev.findIndex(s => s.sessionId === data.session.sessionId);
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = data.session;
            return updated;
          } else {
            return [...prev, data.session];
          }
        });
      }
    }
  });

  // Fetch active public chat sessions
  const { data: activeSessions } = useQuery({
    queryKey: ["/api/public-chat/sessions"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  useEffect(() => {
    if (activeSessions && Array.isArray(activeSessions)) {
      setSessions(activeSessions as PublicChatSession[]);
    }
  }, [activeSessions]);

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedSession) return;

    try {
      const response = await fetch("/api/public-chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: selectedSession,
          message: message.trim(),
          agentName: "Support Agent"
        }),
      });

      if (response.ok) {
        setMessage("");
        // Refresh sessions to get updated messages
        queryClient.invalidateQueries({ queryKey: ["/api/public-chat/sessions"] });
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const selectedSessionData = sessions.find(s => s.sessionId === selectedSession);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <MessageCircle className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Public Chat Inbox</h1>
                <p className="text-xs text-slate-500">Manage website visitor conversations</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {isConnected ? "Connected" : "Disconnected"}
              </Badge>
              <Badge variant="outline">
                {sessions.length} Active Sessions
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Sessions List */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Active Sessions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                {sessions.length === 0 ? (
                  <div className="p-6 text-center text-slate-500">
                    <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No active public chat sessions</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {sessions.map((session) => (
                      <div
                        key={session.sessionId}
                        onClick={() => setSelectedSession(session.sessionId)}
                        className={`p-4 cursor-pointer hover:bg-slate-50 border-l-4 ${
                          selectedSession === session.sessionId
                            ? 'bg-blue-50 border-l-blue-500'
                            : 'border-l-transparent'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <span className="font-medium text-sm text-slate-900">
                              {session.websiteUrl}
                            </span>
                          </div>
                          {session.unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {session.unreadCount}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center text-xs text-slate-500 mb-1">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(session.lastActivity).toLocaleTimeString()}
                        </div>
                        
                        {session.messages.length > 0 && (
                          <p className="text-xs text-slate-600 truncate">
                            {session.messages[session.messages.length - 1]?.message}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Interface */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                {selectedSessionData ? (
                  <>
                    <Globe className="h-5 w-5 mr-2" />
                    Chat with {selectedSessionData.websiteUrl}
                  </>
                ) : (
                  "Select a session to start chatting"
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {selectedSessionData ? (
                <div className="flex flex-col h-[500px]">
                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                    <div className="space-y-4">
                      {selectedSessionData.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${
                            msg.sender === 'user' ? 'justify-start' : 'justify-end'
                          }`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg px-3 py-2 ${
                              msg.sender === 'user'
                                ? 'bg-slate-100 text-slate-900'
                                : 'bg-blue-600 text-white'
                            }`}
                          >
                            <div className="flex items-center space-x-2 mb-1">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {msg.sender === 'user' ? <User className="h-3 w-3" /> : 'A'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs opacity-75">
                                {msg.sender === 'user' ? 'Visitor' : (msg.agentName || 'Agent')}
                              </span>
                              <span className="text-xs opacity-75">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm">{msg.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  <Separator />

                  {/* Message Input */}
                  <div className="p-4">
                    <div className="flex space-x-2">
                      <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your response..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleSendMessage}
                        disabled={!message.trim() || !isConnected}
                        size="sm"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[500px] text-slate-500">
                  <div className="text-center">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select a chat session to view messages</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}