import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

interface TripActionModalsProps {
  isAddActivityOpen: boolean;
  isCancelRescheduleOpen: boolean;
  isSpecialRequestsOpen: boolean;
  onCloseAddActivity: () => void;
  onCloseCancelReschedule: () => void;
  onCloseSpecialRequests: () => void;
}

export function TripActionModals({
  isAddActivityOpen,
  isCancelRescheduleOpen,
  isSpecialRequestsOpen,
  onCloseAddActivity,
  onCloseCancelReschedule,
  onCloseSpecialRequests
}: TripActionModalsProps) {
  const { toast } = useToast();

  // Get user's trips for selection
  const { data: trips } = useQuery({
    queryKey: ["/api/trips"],
  });

  // Add Activity Modal State
  const [selectedTripForActivity, setSelectedTripForActivity] = useState<number | null>(null);
  const [activityType, setActivityType] = useState("");
  const [activityName, setActivityName] = useState("");
  const [activityDate, setActivityDate] = useState<Date | undefined>(undefined);
  const [activityTime, setActivityTime] = useState("");
  const [activityLocation, setActivityLocation] = useState("");
  const [activityBudget, setActivityBudget] = useState("");
  const [activityRequirements, setActivityRequirements] = useState<string[]>([]);
  const [activityNotes, setActivityNotes] = useState("");

  // Cancel/Reschedule Modal State
  const [selectedTripForCancel, setSelectedTripForCancel] = useState<number | null>(null);
  const [cancelType, setCancelType] = useState("");
  const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>(undefined);
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [refundPreference, setRefundPreference] = useState("");
  const [alternativeOptions, setAlternativeOptions] = useState("");

  // Special Requests Modal State
  const [selectedTripForSpecial, setSelectedTripForSpecial] = useState<number | null>(null);
  const [requestCategory, setRequestCategory] = useState("");
  const [requestTitle, setRequestTitle] = useState("");
  const [requestDescription, setRequestDescription] = useState("");
  const [urgencyLevel, setUrgencyLevel] = useState("normal");
  const [contactPreference, setContactPreference] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");

  const handleAddActivity = async () => {
    if (!selectedTripForActivity || !activityType || !activityName) {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const activityDetails = {
      type: activityType,
      name: activityName,
      date: activityDate ? format(activityDate, "yyyy-MM-dd") : null,
      time: activityTime,
      location: activityLocation,
      budget: activityBudget,
      requirements: activityRequirements,
      notes: activityNotes
    };

    try {
      await apiRequest("POST", "/api/support-requests", {
        tripId: selectedTripForActivity,
        type: "activity_addition",
        title: `Add Activity Request - ${activityName}`,
        description: `Activity Addition Details: ${JSON.stringify(activityDetails, null, 2)}`,
        priority: "normal"
      });

      toast({
        title: "Activity Request Submitted",
        description: "Our team will review your activity request and respond within 2 hours."
      });

      onCloseAddActivity();
      resetAddActivityForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit activity request. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCancelReschedule = async () => {
    if (!selectedTripForCancel || !cancelType) {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const cancelDetails = {
      action: cancelType,
      newDate: rescheduleDate ? format(rescheduleDate, "yyyy-MM-dd") : null,
      newTime: rescheduleTime,
      reason: cancelReason,
      refundPreference: refundPreference,
      alternativeOptions: alternativeOptions
    };

    try {
      await apiRequest("POST", "/api/support-requests", {
        tripId: selectedTripForCancel,
        type: "cancellation_reschedule",
        title: `${cancelType === "cancel" ? "Cancellation" : "Reschedule"} Request`,
        description: `${cancelType === "cancel" ? "Cancellation" : "Reschedule"} Details: ${JSON.stringify(cancelDetails, null, 2)}`,
        priority: cancelType === "cancel" ? "high" : "normal"
      });

      toast({
        title: "Request Submitted",
        description: `Your ${cancelType} request has been sent to our team.`
      });

      onCloseCancelReschedule();
      resetCancelRescheduleForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSpecialRequest = async () => {
    if (!selectedTripForSpecial || !requestCategory || !requestTitle || !requestDescription) {
      toast({
        title: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const specialDetails = {
      category: requestCategory,
      title: requestTitle,
      description: requestDescription,
      urgency: urgencyLevel,
      contactPreference: contactPreference,
      specialInstructions: specialInstructions
    };

    try {
      await apiRequest("POST", "/api/support-requests", {
        tripId: selectedTripForSpecial,
        type: "special_request",
        title: `Special Request - ${requestTitle}`,
        description: `Special Request Details: ${JSON.stringify(specialDetails, null, 2)}`,
        priority: urgencyLevel
      });

      toast({
        title: "Special Request Submitted",
        description: "Our concierge team will handle your request and contact you shortly."
      });

      onCloseSpecialRequests();
      resetSpecialRequestForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit special request. Please try again.",
        variant: "destructive"
      });
    }
  };

  const resetAddActivityForm = () => {
    setSelectedTripForActivity(null);
    setActivityType("");
    setActivityName("");
    setActivityDate(undefined);
    setActivityTime("");
    setActivityLocation("");
    setActivityBudget("");
    setActivityRequirements([]);
    setActivityNotes("");
  };

  const resetCancelRescheduleForm = () => {
    setSelectedTripForCancel(null);
    setCancelType("");
    setRescheduleDate(undefined);
    setRescheduleTime("");
    setCancelReason("");
    setRefundPreference("");
    setAlternativeOptions("");
  };

  const resetSpecialRequestForm = () => {
    setSelectedTripForSpecial(null);
    setRequestCategory("");
    setRequestTitle("");
    setRequestDescription("");
    setUrgencyLevel("normal");
    setContactPreference("");
    setSpecialInstructions("");
  };

  const toggleRequirement = (requirement: string) => {
    setActivityRequirements(prev => 
      prev.includes(requirement) 
        ? prev.filter(r => r !== requirement)
        : [...prev, requirement]
    );
  };

  return (
    <>
      {/* Add Activity Modal */}
      <Dialog open={isAddActivityOpen} onOpenChange={onCloseAddActivity}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Activity to Your Trip</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="trip-select">Select Trip</Label>
              <Select 
                value={selectedTripForActivity?.toString() || ""} 
                onValueChange={(value) => setSelectedTripForActivity(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose which trip to add activity to" />
                </SelectTrigger>
                <SelectContent>
                  {trips?.map((trip: any) => (
                    <SelectItem key={trip.id} value={trip.id.toString()}>
                      {trip.title} ({trip.destination})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="activity-type">Activity Type *</Label>
                <Select value={activityType} onValueChange={setActivityType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select activity type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dining">Dining Experience</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                    <SelectItem value="cultural">Cultural Activity</SelectItem>
                    <SelectItem value="adventure">Adventure/Outdoor</SelectItem>
                    <SelectItem value="wellness">Wellness/Spa</SelectItem>
                    <SelectItem value="shopping">Shopping</SelectItem>
                    <SelectItem value="transportation">Transportation</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="activity-name">Activity Name *</Label>
                <Input
                  id="activity-name"
                  value={activityName}
                  onChange={(e) => setActivityName(e.target.value)}
                  placeholder="e.g., Wine tasting tour"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Preferred Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {activityDate ? format(activityDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={activityDate}
                      onSelect={setActivityDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="activity-time">Preferred Time</Label>
                <Input
                  id="activity-time"
                  type="time"
                  value={activityTime}
                  onChange={(e) => setActivityTime(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="activity-location">Location/Area</Label>
                <Input
                  id="activity-location"
                  value={activityLocation}
                  onChange={(e) => setActivityLocation(e.target.value)}
                  placeholder="Preferred location or area"
                />
              </div>

              <div>
                <Label htmlFor="activity-budget">Budget Range</Label>
                <Select value={activityBudget} onValueChange={setActivityBudget}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under-50">Under $50</SelectItem>
                    <SelectItem value="50-100">$50 - $100</SelectItem>
                    <SelectItem value="100-200">$100 - $200</SelectItem>
                    <SelectItem value="200-500">$200 - $500</SelectItem>
                    <SelectItem value="over-500">Over $500</SelectItem>
                    <SelectItem value="no-preference">No preference</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Special Requirements</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {[
                  "Wheelchair accessible",
                  "Family-friendly",
                  "Private/exclusive",
                  "Group booking",
                  "Photography allowed",
                  "Indoor activity",
                  "Outdoor activity",
                  "Food restrictions accommodated"
                ].map((requirement) => (
                  <div key={requirement} className="flex items-center space-x-2">
                    <Checkbox
                      id={requirement}
                      checked={activityRequirements.includes(requirement)}
                      onCheckedChange={() => toggleRequirement(requirement)}
                    />
                    <Label htmlFor={requirement} className="text-sm">{requirement}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="activity-notes">Additional Notes</Label>
              <Textarea
                id="activity-notes"
                value={activityNotes}
                onChange={(e) => setActivityNotes(e.target.value)}
                placeholder="Any specific preferences or additional information..."
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={onCloseAddActivity}>
                Cancel
              </Button>
              <Button onClick={handleAddActivity}>
                Submit Activity Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel/Reschedule Modal */}
      <Dialog open={isCancelRescheduleOpen} onOpenChange={onCloseCancelReschedule}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cancel or Reschedule Trip</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="trip-select-cancel">Select Trip</Label>
              <Select 
                value={selectedTripForCancel?.toString() || ""} 
                onValueChange={(value) => setSelectedTripForCancel(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose which trip to modify" />
                </SelectTrigger>
                <SelectContent>
                  {trips?.map((trip: any) => (
                    <SelectItem key={trip.id} value={trip.id.toString()}>
                      {trip.title} ({trip.destination})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="cancel-type">Action *</Label>
              <Select value={cancelType} onValueChange={setCancelType}>
                <SelectTrigger>
                  <SelectValue placeholder="What would you like to do?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cancel">Cancel Trip</SelectItem>
                  <SelectItem value="reschedule">Reschedule Trip</SelectItem>
                  <SelectItem value="partial-cancel">Cancel Part of Trip</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {cancelType === "reschedule" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>New Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {rescheduleDate ? format(rescheduleDate, "PPP") : "Pick new date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={rescheduleDate}
                        onSelect={setRescheduleDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label htmlFor="reschedule-time">New Time</Label>
                  <Input
                    id="reschedule-time"
                    type="time"
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="cancel-reason">Reason *</Label>
              <Select value={cancelReason} onValueChange={setCancelReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="emergency">Emergency/Urgent matter</SelectItem>
                  <SelectItem value="illness">Illness/Health concerns</SelectItem>
                  <SelectItem value="work">Work/Business conflict</SelectItem>
                  <SelectItem value="weather">Weather concerns</SelectItem>
                  <SelectItem value="travel-restrictions">Travel restrictions</SelectItem>
                  <SelectItem value="financial">Financial reasons</SelectItem>
                  <SelectItem value="change-of-plans">Change of plans</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {cancelType === "cancel" && (
              <div>
                <Label htmlFor="refund-preference">Refund Preference</Label>
                <Select value={refundPreference} onValueChange={setRefundPreference}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select refund option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-refund">Full refund</SelectItem>
                    <SelectItem value="credit">Travel credit</SelectItem>
                    <SelectItem value="reschedule">Reschedule for later</SelectItem>
                    <SelectItem value="partial-refund">Partial refund</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="alternative-options">Alternative Options/Notes</Label>
              <Textarea
                id="alternative-options"
                value={alternativeOptions}
                onChange={(e) => setAlternativeOptions(e.target.value)}
                placeholder="Any alternative arrangements or additional information..."
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={onCloseCancelReschedule}>
                Cancel
              </Button>
              <Button onClick={handleCancelReschedule}>
                Submit Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Special Requests Modal */}
      <Dialog open={isSpecialRequestsOpen} onOpenChange={onCloseSpecialRequests}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Special Request</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="trip-select-special">Select Trip</Label>
              <Select 
                value={selectedTripForSpecial?.toString() || ""} 
                onValueChange={(value) => setSelectedTripForSpecial(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose which trip this request is for" />
                </SelectTrigger>
                <SelectContent>
                  {trips?.map((trip: any) => (
                    <SelectItem key={trip.id} value={trip.id.toString()}>
                      {trip.title} ({trip.destination})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="request-category">Request Category *</Label>
              <Select value={requestCategory} onValueChange={setRequestCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="concierge">Concierge Services</SelectItem>
                  <SelectItem value="accessibility">Accessibility Needs</SelectItem>
                  <SelectItem value="dietary">Dietary Requirements</SelectItem>
                  <SelectItem value="transportation">Transportation</SelectItem>
                  <SelectItem value="accommodation">Accommodation</SelectItem>
                  <SelectItem value="celebration">Special Celebration</SelectItem>
                  <SelectItem value="emergency">Emergency Assistance</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="request-title">Request Title *</Label>
              <Input
                id="request-title"
                value={requestTitle}
                onChange={(e) => setRequestTitle(e.target.value)}
                placeholder="Brief title for your request"
              />
            </div>

            <div>
              <Label htmlFor="request-description">Detailed Description *</Label>
              <Textarea
                id="request-description"
                value={requestDescription}
                onChange={(e) => setRequestDescription(e.target.value)}
                placeholder="Please provide detailed information about your request..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="urgency-level">Urgency Level</Label>
                <Select value={urgencyLevel} onValueChange={setUrgencyLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - General request</SelectItem>
                    <SelectItem value="normal">Normal - Standard timing</SelectItem>
                    <SelectItem value="high">High - Important</SelectItem>
                    <SelectItem value="emergency">Emergency - Immediate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="contact-preference">Contact Preference</Label>
                <Select value={contactPreference} onValueChange={setContactPreference}>
                  <SelectTrigger>
                    <SelectValue placeholder="How to contact you" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chat">In-app chat</SelectItem>
                    <SelectItem value="phone">Phone call</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="text">Text message</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="special-instructions">Special Instructions</Label>
              <Textarea
                id="special-instructions"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Any special instructions or preferences for handling this request..."
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={onCloseSpecialRequests}>
                Cancel
              </Button>
              <Button onClick={handleSpecialRequest}>
                Submit Special Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}