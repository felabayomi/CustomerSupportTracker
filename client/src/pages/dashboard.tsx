import { NavigationHeader } from "@/components/navigation-header";
import { TripOverviewCard } from "@/components/trip-overview-card";
import { LiveChatWidget } from "@/components/live-chat-widget";
import { SupportPanel } from "@/components/support-panel";
import { TripManagement } from "@/components/trip-management";
import { CheckInFeedback } from "@/components/check-in-feedback";
import { FloatingChatButton } from "@/components/floating-chat-button";
import { NotificationModal } from "@/components/notification-modal";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Dashboard() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFloatingChat, setShowFloatingChat] = useState(false);
  const { toast } = useToast();

  const handleSOS = async () => {
    try {
      const response = await apiRequest("POST", "/api/emergency/sos", {
        description: "Emergency assistance requested via SOS button"
      });
      
      const data = await response.json();
      
      toast({
        title: "🚨 Emergency Response Activated",
        description: data.message,
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to contact emergency services. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <NavigationHeader 
        onShowNotifications={() => setShowNotifications(true)}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <TripOverviewCard onOpenChat={() => setShowFloatingChat(true)} />
        
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <LiveChatWidget />
          </div>
          <div>
            <SupportPanel />
          </div>
        </div>

        <TripManagement />
        <CheckInFeedback />
      </main>

      <FloatingChatButton 
        onClick={() => setShowFloatingChat(true)} 
      />
      
      <NotificationModal 
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      {/* SOS Button at bottom of page */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <Button
          variant="destructive"
          size="lg"
          className="font-semibold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
          onClick={handleSOS}
        >
          <AlertTriangle className="h-6 w-6 mr-3" />
          Emergency SOS
        </Button>
      </div>
    </div>
  );
}
