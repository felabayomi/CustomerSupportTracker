import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/use-websocket";
import { useState, useEffect, useRef } from "react";
import type { ChatMessage } from "@shared/schema";

export function LiveChatWidget() {
  const [message, setMessage] = useState("");
  const [typingIndicator, setTypingIndicator] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: trip } = useQuery({
    queryKey: ["/api/trip/active"],
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["/api/chat/messages", trip?.id],
    queryFn: async () => {
      if (!trip?.id) return [];
      const response = await fetch(`/api/chat/messages/${trip.id}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json();
    },
    enabled: !!trip?.id,
  });

  const { sendMessage, isConnected } = useWebSocket({
    onMessage: (data) => {
      if (data.type === 'chat_message') {
        // Update messages cache
        queryClient.setQueryData(["/api/chat/messages", trip?.id], (old: ChatMessage[] = []) => {
          // Avoid duplicates
          const exists = old.find(msg => msg.id === data.message.id);
          if (exists) return old;
          return [...old, data.message];
        });

        // Show typing indicator for agent messages
        if (data.message.sender === 'agent') {
          setTypingIndicator(false);
        }

        // Update unread count
        queryClient.invalidateQueries({ queryKey: ["/api/chat/unread-count"] });
      }
    }
  });

  const handleSendMessage = () => {
    if (!message.trim() || !trip?.id || !isConnected) return;

    sendMessage({
      type: 'chat_message',
      userId: 1, // Mock user ID
      tripId: trip.id,
      message: message.trim()
    });

    setMessage("");
    setTypingIndicator(true);

    // Hide typing indicator after timeout
    setTimeout(() => setTypingIndicator(false), 10000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages, typingIndicator]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  };

  return (
    <Card className="h-96">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-success animate-pulse' : 'bg-slate-400'}`}></div>
          <h3 className="font-semibold text-slate-900">Live Support Chat</h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-slate-600">Sarah (Concierge)</span>
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&w=32&h=32&fit=crop&crop=face" />
            <AvatarFallback>SA</AvatarFallback>
          </Avatar>
        </div>
      </div>
      
      <ScrollArea className="h-64 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((msg: ChatMessage) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs p-3 rounded-lg ${
                msg.sender === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-slate-100 text-slate-900'
              }`}>
                <p className="text-sm">{msg.message}</p>
                <span className={`text-xs mt-1 block ${
                  msg.sender === 'user' ? 'text-blue-200' : 'text-slate-500'
                }`}>
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            </div>
          ))}
          
          {typingIndicator && (
            <div className="flex justify-center">
              <span className="text-xs text-slate-400 bg-slate-50 px-3 py-1 rounded-full">
                Sarah is typing...
              </span>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t border-slate-200">
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={!isConnected}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!message.trim() || !isConnected}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
