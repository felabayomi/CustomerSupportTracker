import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Plus, CalendarX, ConciergeBell, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ModifyBookingModal } from "./modify-booking-modal";

export function TripManagement() {
  const { toast } = useToast();
  const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);

  const handleAction = async (actionType: string, title: string) => {
    try {
      await apiRequest("POST", "/api/support-requests", {
        tripId: 1,
        type: "modification",
        title,
        description: `Request to ${actionType} current trip arrangements`,
        priority: "normal"
      });
      
      toast({
        title: "Request Submitted",
        description: `Your ${actionType} request has been sent to our team.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="mt-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Trip Management</h3>
          <Button variant="ghost" size="sm" className="text-primary hover:text-blue-700">
            View Full Itinerary 
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="h-auto p-4 flex-col items-start space-y-2 hover:border-primary transition-colors"
            onClick={() => setIsModifyModalOpen(true)}
          >
            <Edit className="text-primary h-6 w-6" />
            <div className="text-left">
              <h4 className="font-medium text-slate-900">Modify Booking</h4>
              <p className="text-sm text-slate-600">Change times, activities, or preferences</p>
            </div>
          </Button>
          
          <Button
            variant="outline"
            className="h-auto p-4 flex-col items-start space-y-2 hover:border-secondary transition-colors"
            onClick={() => handleAction("add activity", "Add Activity")}
          >
            <Plus className="text-secondary h-6 w-6" />
            <div className="text-left">
              <h4 className="font-medium text-slate-900">Add Activity</h4>
              <p className="text-sm text-slate-600">Discover new experiences</p>
            </div>
          </Button>
          
          <Button
            variant="outline"
            className="h-auto p-4 flex-col items-start space-y-2 hover:border-accent transition-colors"
            onClick={() => handleAction("cancel/reschedule", "Cancel/Reschedule")}
          >
            <CalendarX className="text-accent h-6 w-6" />
            <div className="text-left">
              <h4 className="font-medium text-slate-900">Cancel/Reschedule</h4>
              <p className="text-sm text-slate-600">Flexible changes when needed</p>
            </div>
          </Button>
          
          <Button
            variant="outline"
            className="h-auto p-4 flex-col items-start space-y-2 hover:border-purple-500 transition-colors"
            onClick={() => handleAction("special request", "Special Requests")}
          >
            <ConciergeBell className="text-purple-500 h-6 w-6" />
            <div className="text-left">
              <h4 className="font-medium text-slate-900">Special Requests</h4>
              <p className="text-sm text-slate-600">Custom assistance and arrangements</p>
            </div>
          </Button>
        </div>
      </CardContent>
      
      <ModifyBookingModal 
        isOpen={isModifyModalOpen} 
        onClose={() => setIsModifyModalOpen(false)} 
      />
    </Card>
  );
}
