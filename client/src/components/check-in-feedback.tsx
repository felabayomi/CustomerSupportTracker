import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export function CheckInFeedback() {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: supportRequests } = useQuery({
    queryKey: ["/api/support-requests"],
  });

  const { data: activeTrip } = useQuery({
    queryKey: ["/api/trip/active"],
  });

  const { data: trips } = useQuery({
    queryKey: ["/api/trips"],
  });

  // Generate dynamic location text for check-in
  const getLocationText = () => {
    if (activeTrip?.destination) {
      return activeTrip.destination;
    }
    
    if (trips && trips.length > 0) {
      // If multiple trips, use the first active/current one or most recent
      const currentTrip = trips.find((trip: any) => trip.status === 'active') || trips[0];
      if (currentTrip?.destination) {
        return currentTrip.destination;
      }
    }
    
    // Fallback to generic text if no destination found
    return "your travel";
  };

  const handleRatingSelect = async (rating: number) => {
    setSelectedRating(rating);
    
    try {
      await apiRequest("POST", "/api/feedback", {
        tripId: 1,
        rating,
        comment: feedback,
        type: "daily"
      });
      
      toast({
        title: "Rating Submitted",
        description: "Thank you for your feedback!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmitCheckIn = async () => {
    if (!selectedRating) {
      toast({
        title: "Please select a rating",
        description: "Rating is required for check-in.",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiRequest("POST", "/api/feedback", {
        tripId: 1,
        rating: selectedRating,
        comment: feedback,
        type: "daily"
      });
      
      // Reset form
      setSelectedRating(null);
      setFeedback("");
      
      toast({
        title: "Check-in Complete",
        description: "Thank you for your feedback! We'll use this to improve your experience.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/feedback"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit check-in. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-50 border-green-200 text-success";
      case "in_progress":
        return "bg-blue-50 border-blue-200 text-primary";
      case "open":
        return "bg-yellow-50 border-yellow-200 text-accent";
      default:
        return "bg-slate-50 border-slate-200 text-slate-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return <CheckCircle className="h-5 w-5 text-success" />;
      case "in_progress":
        return <Clock className="h-5 w-5 text-primary" />;
      default:
        return <Clock className="h-5 w-5 text-accent" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} days ago`;
    }
  };

  return (
    <div className="mt-6 grid lg:grid-cols-2 gap-6">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Daily Check-In</h3>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600 mb-3">How is your {getLocationText()} experience going so far?</p>
              <div className="flex space-x-2">
                <Button
                  variant={selectedRating === 5 ? "default" : "outline"}
                  size="sm"
                  className={`flex-1 ${selectedRating === 5 ? 'bg-success hover:bg-green-600' : ''}`}
                  onClick={() => handleRatingSelect(5)}
                >
                  😊 Excellent
                </Button>
                <Button
                  variant={selectedRating === 4 ? "default" : "outline"}
                  size="sm"
                  className={`flex-1 ${selectedRating === 4 ? 'bg-primary hover:bg-blue-600' : ''}`}
                  onClick={() => handleRatingSelect(4)}
                >
                  🙂 Good
                </Button>
                <Button
                  variant={selectedRating === 3 ? "default" : "outline"}
                  size="sm"
                  className={`flex-1 ${selectedRating === 3 ? 'bg-slate-500 hover:bg-slate-600' : ''}`}
                  onClick={() => handleRatingSelect(3)}
                >
                  😐 Okay
                </Button>
              </div>
            </div>
            
            <Textarea
              placeholder="Any feedback or concerns? We're here to help!"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
            />
            
            <Button 
              className="w-full bg-primary hover:bg-blue-700"
              onClick={handleSubmitCheckIn}
            >
              Submit Check-In
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Resolution Center</h3>
          <div className="space-y-3">
            {supportRequests?.slice(0, 2).map((request) => (
              <div key={request.id} className={`flex items-center justify-between p-3 rounded-lg border ${getStatusColor(request.status)}`}>
                <div className="flex items-center space-x-3">
                  {getStatusIcon(request.status)}
                  <div>
                    <p className="text-sm font-medium text-slate-900">{request.title}</p>
                    <p className="text-xs text-slate-600">
                      {request.status === "resolved" ? "Resolved" : "In progress"} • {formatTimeAgo(request.createdAt)}
                    </p>
                  </div>
                </div>
                <Badge variant={request.status === "resolved" ? "default" : "secondary"} className="text-xs">
                  {request.status === "resolved" ? "RESOLVED" : "IN PROGRESS"}
                </Badge>
              </div>
            ))}
            
            {(!supportRequests || supportRequests.length === 0) && (
              <div className="p-3 bg-slate-50 rounded-lg text-center">
                <p className="text-sm text-slate-600">No recent requests</p>
              </div>
            )}
            
            <Button variant="ghost" className="w-full mt-4 text-primary hover:text-blue-700">
              View All Resolutions 
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
