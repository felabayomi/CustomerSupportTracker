import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Phone, MessageCircle, Bell, Info, Clock, Car, Utensils, CloudSun } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export function SupportPanel() {
  const { toast } = useToast();

  const { data: notifications } = useQuery({
    queryKey: ["/api/notifications/unread"],
  });

  const handleEmergencyCall = async () => {
    try {
      await apiRequest("POST", "/api/emergency/sos", {
        description: "Emergency call requested"
      });
      
      toast({
        title: "🚨 Emergency Call Initiated",
        description: "Connecting you to emergency support now...",
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate emergency call. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEmergencyChat = async () => {
    try {
      await apiRequest("POST", "/api/support-requests", {
        tripId: 1,
        type: "emergency",
        title: "Emergency Chat Request",
        description: "Urgent assistance needed via emergency chat",
        priority: "emergency"
      });
      
      toast({
        title: "Emergency Chat Started",
        description: "An emergency support agent will respond immediately.",
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start emergency chat. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleQuickRequest = async (type: string, title: string) => {
    try {
      await apiRequest("POST", "/api/support-requests", {
        tripId: 1,
        type: "assistance",
        title,
        description: `Quick request for ${type}`,
        priority: "normal"
      });
      
      toast({
        title: "Request Sent",
        description: `Your ${type} request has been sent to our concierge team.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "info":
        return <Info className="text-primary" />;
      case "warning":
        return <Clock className="text-secondary" />;
      case "alert":
        return <Bell className="text-destructive" />;
      default:
        return <Info className="text-primary" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Emergency Support */}
      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-4">
          <h3 className="font-semibold text-red-900 mb-2 flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Emergency Support
          </h3>
          <p className="text-sm text-red-800 mb-3">Need immediate assistance? We're here 24/7.</p>
          <div className="space-y-2">
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={handleEmergencyCall}
            >
              <Phone className="h-4 w-4 mr-2" />
              Call Emergency Line
            </Button>
            <Button 
              variant="outline" 
              className="w-full border-red-300 text-red-700 hover:bg-red-50"
              onClick={handleEmergencyChat}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Emergency Chat
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Proactive Alerts */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold text-slate-900 mb-3 flex items-center">
            <Bell className="h-5 w-5 mr-2 text-accent" />
            Travel Alerts
          </h3>
          <div className="space-y-3">
            {notifications?.slice(0, 2).map((notification) => (
              <div key={notification.id} className={`p-3 rounded-lg border ${
                notification.type === 'info' ? 'bg-blue-50 border-blue-200' :
                notification.type === 'success' ? 'bg-green-50 border-green-200' :
                notification.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start space-x-2">
                  {getNotificationIcon(notification.type)}
                  <div>
                    <p className="text-sm font-medium text-slate-900">{notification.title}</p>
                    <p className="text-xs text-slate-600">{notification.message}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {(!notifications || notifications.length === 0) && (
              <div className="p-3 bg-slate-50 rounded-lg text-center">
                <p className="text-sm text-slate-600">No new alerts</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold text-slate-900 mb-3">Quick Requests</h3>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start h-auto p-3"
              onClick={() => handleQuickRequest("transportation", "Request Transportation")}
            >
              <Car className="h-5 w-5 mr-3 text-slate-600" />
              <span className="text-sm font-medium text-slate-900">Request Transportation</span>
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start h-auto p-3"
              onClick={() => handleQuickRequest("dining", "Restaurant Recommendations")}
            >
              <Utensils className="h-5 w-5 mr-3 text-slate-600" />
              <span className="text-sm font-medium text-slate-900">Restaurant Recommendations</span>
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start h-auto p-3"
              onClick={() => handleQuickRequest("weather", "Weather & Conditions")}
            >
              <CloudSun className="h-5 w-5 mr-3 text-slate-600" />
              <span className="text-sm font-medium text-slate-900">Weather & Conditions</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
