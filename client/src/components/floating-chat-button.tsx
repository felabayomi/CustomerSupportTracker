import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface FloatingChatButtonProps {
  onClick: () => void;
}

export function FloatingChatButton({ onClick }: FloatingChatButtonProps) {
  const { data: unreadCount } = useQuery({
    queryKey: ["/api/chat/unread-count"],
  });

  return (
    <Button
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-blue-700 transition-all hover:scale-105 z-40"
      onClick={onClick}
    >
      <MessageCircle className="h-6 w-6" />
      {unreadCount?.count > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 text-xs"
        >
          {unreadCount.count}
        </Badge>
      )}
    </Button>
  );
}
