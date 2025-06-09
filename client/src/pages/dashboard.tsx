import { NavigationHeader } from "@/components/navigation-header";
import { TripOverviewCard } from "@/components/trip-overview-card";
import { TripSelector } from "@/components/trip-selector";
import { LiveChatWidget } from "@/components/live-chat-widget";
import { SupportPanel } from "@/components/support-panel";
import { TripManagement } from "@/components/trip-management";
import { CheckInFeedback } from "@/components/check-in-feedback";
import { FloatingChatButton } from "@/components/floating-chat-button";
import { NotificationModal } from "@/components/notification-modal";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

interface Trip {
  id: number;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  status: string;
  description: string | null;
}

export default function Dashboard() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFloatingChat, setShowFloatingChat] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const { toast } = useToast();

  // Get all trips and set the first active trip as default
  const { data: trips = [] } = useQuery<Trip[]>({
    queryKey: ['/api/trips'],
    enabled: true
  });

  // Set default selected trip to the first active trip or first trip
  useEffect(() => {
    if (trips.length > 0 && !selectedTrip) {
      const activeTrip = trips.find((trip: Trip) => trip.status === 'active');
      setSelectedTrip(activeTrip || trips[0]);
    }
  }, [trips, selectedTrip]);

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
        <TripSelector 
          selectedTripId={selectedTrip?.id}
          onTripSelect={setSelectedTrip}
        />
        
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
