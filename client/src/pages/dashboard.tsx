import { NavigationHeader } from "@/components/navigation-header";
import { TripOverviewCard } from "@/components/trip-overview-card";
import { LiveChatWidget } from "@/components/live-chat-widget";
import { SupportPanel } from "@/components/support-panel";
import { TripManagement } from "@/components/trip-management";
import { CheckInFeedback } from "@/components/check-in-feedback";
import { FloatingChatButton } from "@/components/floating-chat-button";
import { NotificationModal } from "@/components/notification-modal";
import { useState } from "react";

export default function Dashboard() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFloatingChat, setShowFloatingChat] = useState(false);

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
    </div>
  );
}
