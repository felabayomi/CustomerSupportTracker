import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Compass } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface NavigationHeaderProps {
  onShowNotifications: () => void;
}

export function NavigationHeader({ onShowNotifications }: NavigationHeaderProps) {
  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  const { data: unreadNotifications } = useQuery({
    queryKey: ["/api/notifications/unread"],
  });

  const notificationCount = unreadNotifications?.length || 0;

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Compass className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Expedition America</h1>
              <p className="text-xs text-slate-500">Traveler Support Hub</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={onShowNotifications}
            >
              <Bell className="h-5 w-5 text-slate-600" />
              {notificationCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {notificationCount}
                </Badge>
              )}
            </Button>
            
            <Button
              variant="destructive"
              size="sm"
              className="font-medium"
              onClick={handleSOS}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">SOS</span>
            </Button>
            
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="hidden sm:block text-sm font-medium text-slate-700">
                {user?.name}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
