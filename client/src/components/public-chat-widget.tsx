import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, X, Minimize2, Maximize2 } from "lucide-react";

interface PublicChatMessage {
  id: string;
  message: string;
  sender: 'user' | 'agent';
  timestamp: string;
  agentName?: string;
}

interface PublicChatWidgetProps {
  websiteUrl?: string;
  agentName?: string;
  agentAvatar?: string;
  brandColor?: string;
  companyName?: string;
  welcomeMessage?: string;
}

export function PublicChatWidget({
  websiteUrl = window.location.hostname,
  agentName = "Support Agent",
  agentAvatar,
  brandColor = "#3b82f6",
  companyName = "City Discoverer",
  welcomeMessage = "Hi! How can we help you today?"
}: PublicChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<PublicChatMessage[]>([]);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [typingIndicator, setTypingIndicator] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (messages.length === 0) {
      // Add welcome message
      setMessages([{
        id: 'welcome',
        message: welcomeMessage,
        sender: 'agent',
        timestamp: new Date().toISOString(),
        agentName
      }]);
    }
  }, [welcomeMessage, agentName]);

  useEffect(() => {
    if (isOpen && !wsRef.current) {
      connectWebSocket();
    }
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const connectWebSocket = () => {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/public-ws`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        // Send session info
        wsRef.current?.send(JSON.stringify({
          type: 'join_public_chat',
          sessionId,
          websiteUrl
        }));
      };

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'public_chat_message') {
          setMessages(prev => [...prev, data.message]);
          if (!isOpen || isMinimized) {
            setUnreadCount(prev => prev + 1);
          }
          if (data.message.sender === 'agent') {
            setTypingIndicator(false);
          }
        }
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
      };

      wsRef.current.onerror = () => {
        setIsConnected(false);
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
    }
  };

  const handleSendMessage = () => {
    if (!message.trim() || !wsRef.current || !isConnected) return;

    const userMessage: PublicChatMessage = {
      id: `msg_${Date.now()}`,
      message: message.trim(),
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setTypingIndicator(true);

    wsRef.current.send(JSON.stringify({
      type: 'public_chat_message',
      sessionId,
      message: userMessage.message,
      websiteUrl
    }));

    setMessage("");
  };

  const handleOpenChat = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setUnreadCount(0);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <Button
          onClick={handleOpenChat}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg transition-all hover:scale-105 z-[9999]"
          style={{ backgroundColor: brandColor }}
        >
          <MessageCircle className="h-6 w-6" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-80 h-96 shadow-2xl z-[9999] flex flex-col">
          <CardHeader className="pb-2 flex-shrink-0" style={{ borderTopColor: brandColor }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={agentAvatar} />
                  <AvatarFallback style={{ backgroundColor: brandColor, color: 'white' }}>
                    {agentName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-sm">{companyName} Support</CardTitle>
                  <div className="flex items-center space-x-1 text-xs text-slate-500">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span>{agentName}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="h-6 w-6 p-0"
                >
                  {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {!isMinimized && (
            <>
              <CardContent className="flex-1 p-2 overflow-hidden">
                <ScrollArea className="h-full pr-2" ref={scrollAreaRef}>
                  <div className="space-y-3">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-2 rounded-lg text-sm ${
                            msg.sender === 'user'
                              ? 'bg-blue-500 text-white'
                              : 'bg-slate-100 text-slate-900'
                          }`}
                          style={msg.sender === 'user' ? { backgroundColor: brandColor } : {}}
                        >
                          <p>{msg.message}</p>
                          <p className={`text-xs mt-1 ${
                            msg.sender === 'user' ? 'text-blue-100' : 'text-slate-500'
                          }`}>
                            {formatTime(msg.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {typingIndicator && (
                      <div className="flex justify-start">
                        <div className="bg-slate-100 text-slate-900 p-2 rounded-lg text-sm">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>

              <div className="p-2 border-t flex-shrink-0">
                <div className="flex space-x-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1 text-sm"
                  />
                  <Button
                    onClick={handleSendMessage}
                    size="sm"
                    disabled={!message.trim() || !isConnected}
                    style={{ backgroundColor: brandColor }}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      )}
    </>
  );
}