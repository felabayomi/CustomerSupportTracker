import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Building, Utensils, Clock, Edit, MessageCircle, Calendar, HelpCircle, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface TripOverviewCardProps {
  onOpenChat: () => void;
}

export function TripOverviewCard({ onOpenChat }: TripOverviewCardProps) {
  const { data: trip } = useQuery({
    queryKey: ["/api/trip/active"],
  });

  const { data: activities } = useQuery({
    queryKey: ["/api/activities/today"],
  });

  if (!trip) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <p className="text-slate-600">No active trip found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate + 'T12:00:00');
    const end = new Date(endDate + 'T12:00:00');
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    return `${start.toLocaleDateString("en-US", { month: "long", day: "numeric" })}-${end.getDate()}, ${start.getFullYear()} • ${diffDays} Days`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "tour":
        return <Building className="text-white h-5 w-5" />;
      case "dining":
        return <Utensils className="text-white h-5 w-5" />;
      default:
        return <Clock className="text-white h-5 w-5" />;
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">{trip.title}</h2>
            <p className="text-slate-600 mt-1">
              {formatDateRange(trip.startDate, trip.endDate)}
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <div className="flex items-center text-success">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">On Track</span>
            </div>
            <Button className="bg-primary hover:bg-blue-700">
              View Full Itinerary
            </Button>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-slate-900 mb-3">Today's Activities</h3>
            <div className="space-y-3">
              {activities?.map((activity, index) => (
                <div 
                  key={activity.id} 
                  className={`flex items-center space-x-3 p-3 rounded-lg border ${
                    index === 0 ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    activity.type === 'tour' ? 'bg-primary' : 'bg-secondary'
                  }`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{activity.title}</p>
                    <p className="text-sm text-slate-600">
                      {activity.startTime} - {activity.endTime}
                    </p>
                  </div>
                  <div className={index === 0 ? 'text-primary' : 'text-slate-400 hover:text-primary'}>
                    {index === 0 ? <Clock className="h-5 w-5" /> : <Edit className="h-5 w-5 cursor-pointer" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-slate-900 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="p-4 h-auto flex-col items-start space-y-2 hover:bg-slate-100"
                onClick={onOpenChat}
              >
                <MessageCircle className="text-primary h-6 w-6" />
                <div className="text-left">
                  <p className="font-medium text-slate-900">Live Chat</p>
                  <p className="text-sm text-slate-600">Get instant help</p>
                </div>
              </Button>
              
              <Button
                variant="outline"
                className="p-4 h-auto flex-col items-start space-y-2 hover:bg-slate-100"
              >
                <Calendar className="text-secondary h-6 w-6" />
                <div className="text-left">
                  <p className="font-medium text-slate-900">Reschedule</p>
                  <p className="text-sm text-slate-600">Modify plans</p>
                </div>
              </Button>
              
              <Button
                variant="outline"
                className="p-4 h-auto flex-col items-start space-y-2 hover:bg-slate-100"
              >
                <HelpCircle className="text-accent h-6 w-6" />
                <div className="text-left">
                  <p className="font-medium text-slate-900">Need Help</p>
                  <p className="text-sm text-slate-600">Request assistance</p>
                </div>
              </Button>
              
              <Button
                variant="outline"
                className="p-4 h-auto flex-col items-start space-y-2 hover:bg-slate-100"
              >
                <Star className="text-accent h-6 w-6" />
                <div className="text-left">
                  <p className="font-medium text-slate-900">Feedback</p>
                  <p className="text-sm text-slate-600">Rate your day</p>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
