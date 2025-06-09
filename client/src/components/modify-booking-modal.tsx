import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock, MapPin, Users } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import type { Trip, Activity } from "@shared/schema";

interface ModifyBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ModifyBookingModal({ isOpen, onClose }: ModifyBookingModalProps) {
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [modificationType, setModificationType] = useState<string>("");
  const [newDate, setNewDate] = useState<Date>();
  const [newTime, setNewTime] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [activityChanges, setActivityChanges] = useState<string[]>([]);
  const [specialRequests, setSpecialRequests] = useState("");
  const [reasonForChange, setReasonForChange] = useState("");
  const { toast } = useToast();

  const { data: trips = [] } = useQuery<Trip[]>({
    queryKey: ["/api/trips"],
  });

  const selectedTrip = trips.find(trip => trip.id === selectedTripId);

  const { data: activities = [] } = useQuery<Activity[]>({
    queryKey: ["/api/activities", selectedTripId],
    enabled: !!selectedTripId,
  });

  const handleActivityChange = (activityId: string, checked: boolean) => {
    if (checked) {
      setActivityChanges([...activityChanges, activityId]);
    } else {
      setActivityChanges(activityChanges.filter(id => id !== activityId));
    }
  };

  const handleSubmit = async () => {
    if (!selectedTripId) {
      toast({
        title: "Please select a trip to modify",
        variant: "destructive"
      });
      return;
    }

    if (!modificationType) {
      toast({
        title: "Please select what you'd like to modify",
        variant: "destructive"
      });
      return;
    }

    const modificationDetails = {
      type: modificationType,
      newDate: newDate ? format(newDate, "yyyy-MM-dd") : null,
      newTime,
      newLocation,
      guestCount: guestCount ? parseInt(guestCount) : null,
      activityChanges,
      specialRequests,
      reasonForChange
    };

    try {
      await apiRequest("POST", "/api/support-requests", {
        tripId: selectedTripId,
        type: "modification",
        title: `Booking Modification Request - ${modificationType}`,
        description: `Modification Details: ${JSON.stringify(modificationDetails, null, 2)}`,
        priority: "normal"
      });

      toast({
        title: "Modification Request Submitted",
        description: "Our team will review your request and contact you within 2 hours."
      });

      onClose();
      // Reset form
      setSelectedTripId(null);
      setModificationType("");
      setNewDate(undefined);
      setNewTime("");
      setNewLocation("");
      setGuestCount("");
      setActivityChanges([]);
      setSpecialRequests("");
      setReasonForChange("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit modification request. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modify Your Booking</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Trip Selection */}
          <div className="space-y-3">
            <Label htmlFor="trip-selection">Select Trip to Modify</Label>
            <Select value={selectedTripId?.toString() || ""} onValueChange={(value) => setSelectedTripId(parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Choose which trip you want to modify" />
              </SelectTrigger>
              <SelectContent>
                {trips.map((trip) => (
                  <SelectItem key={trip.id} value={trip.id.toString()}>
                    {trip.title} - {trip.destination} ({trip.startDate} to {trip.endDate})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Current Trip Info */}
          {selectedTrip && (
            <div className="bg-slate-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Selected Booking:</h4>
              <p className="text-sm text-slate-600">{selectedTrip.title}</p>
              <p className="text-sm text-slate-600">{selectedTrip.destination}</p>
              <p className="text-sm text-slate-600">{selectedTrip.startDate} to {selectedTrip.endDate}</p>
            </div>
          )}

          {/* What to Modify */}
          <div className="space-y-3">
            <Label htmlFor="modification-type">What would you like to modify?</Label>
            <Select value={modificationType} onValueChange={setModificationType}>
              <SelectTrigger>
                <SelectValue placeholder="Select modification type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dates">Travel Dates</SelectItem>
                <SelectItem value="times">Activity Times</SelectItem>
                <SelectItem value="location">Meeting Location</SelectItem>
                <SelectItem value="guests">Number of Guests</SelectItem>
                <SelectItem value="activities">Specific Activities</SelectItem>
                <SelectItem value="accommodation">Accommodation</SelectItem>
                <SelectItem value="transportation">Transportation</SelectItem>
                <SelectItem value="dining">Dining Preferences</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Change */}
          {modificationType === "dates" && (
            <div className="space-y-3">
              <Label>New Travel Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newDate ? format(newDate, "PPP") : "Select new date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={newDate}
                    onSelect={setNewDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Time Change */}
          {modificationType === "times" && (
            <div className="space-y-3">
              <Label htmlFor="new-time">Preferred Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="new-time"
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          {/* Location Change */}
          {modificationType === "location" && (
            <div className="space-y-3">
              <Label htmlFor="new-location">New Meeting Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="new-location"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="Enter preferred meeting location"
                  className="pl-10"
                />
              </div>
            </div>
          )}

          {/* Guest Count Change */}
          {modificationType === "guests" && (
            <div className="space-y-3">
              <Label htmlFor="guest-count">Number of Guests</Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="guest-count"
                  type="number"
                  min="1"
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                  placeholder="Enter number of guests"
                  className="pl-10"
                />
              </div>
            </div>
          )}

          {/* Activity Changes */}
          {modificationType === "activities" && activities.length > 0 && (
            <div className="space-y-3">
              <Label>Select activities to modify or remove:</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`activity-${activity.id}`}
                      checked={activityChanges.includes(activity.id.toString())}
                      onCheckedChange={(checked) => handleActivityChange(activity.id.toString(), checked as boolean)}
                    />
                    <Label htmlFor={`activity-${activity.id}`} className="text-sm">
                      {activity.title} - {activity.date} {activity.startTime}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Special Requests */}
          <div className="space-y-3">
            <Label htmlFor="special-requests">Additional Requests or Preferences</Label>
            <Textarea
              id="special-requests"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Any specific requirements, dietary restrictions, accessibility needs, etc."
              rows={3}
            />
          </div>

          {/* Reason for Change */}
          <div className="space-y-3">
            <Label htmlFor="reason">Reason for Change (Optional)</Label>
            <Textarea
              id="reason"
              value={reasonForChange}
              onChange={(e) => setReasonForChange(e.target.value)}
              placeholder="Help us understand why you need to make this change"
              rows={2}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Submit Modification Request
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}