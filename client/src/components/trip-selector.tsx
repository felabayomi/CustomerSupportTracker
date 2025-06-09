import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Calendar, MapPin, ExternalLink } from "lucide-react";
import { format } from "date-fns";

interface Trip {
  id: number;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  status: string;
  description: string | null;
}

interface TripSelectorProps {
  selectedTripId?: number;
  onTripSelect: (trip: Trip) => void;
}

export function TripSelector({ selectedTripId, onTripSelect }: TripSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: trips = [], isLoading } = useQuery<Trip[]>({
    queryKey: ['/api/trips'],
    enabled: true
  });

  const selectedTrip = trips.find((trip: Trip) => trip.id === selectedTripId);

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-1/4 mb-2"></div>
            <div className="h-6 bg-slate-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!trips.length) {
    return (
      <Card className="mb-6">
        <CardContent className="p-4 text-center text-slate-500">
          No trips found
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Your Trips</CardTitle>
          <Badge variant="secondary">{trips.length} trip{trips.length !== 1 ? 's' : ''}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Selected Trip Display */}
        {selectedTrip && (
          <div className="border rounded-lg p-4 mb-4 bg-blue-50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg">{selectedTrip.title}</h3>
              <Badge className={getStatusColor(selectedTrip.status)}>
                {selectedTrip.status}
              </Badge>
            </div>
            <div className="flex items-center text-slate-600 text-sm space-x-4">
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>{selectedTrip.destination}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>
                  {format(new Date(selectedTrip.startDate), 'MMM d')} - {format(new Date(selectedTrip.endDate), 'MMM d, yyyy')}
                </span>
              </div>
            </div>
            {selectedTrip.description && (
              <div className="mt-3">
                {selectedTrip.description.includes('https://') ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      const urlMatch = selectedTrip.description?.match(/https:\/\/[^\s]+/);
                      if (urlMatch) {
                        window.open(urlMatch[0], '_blank');
                      }
                    }}
                    className="flex items-center space-x-1"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>View Itinerary</span>
                  </Button>
                ) : (
                  <p className="text-slate-600 text-sm">{selectedTrip.description}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Trip List Toggle */}
        {trips.length > 1 && (
          <>
            <Button
              variant="outline"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full mb-4"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-2" />
                  Hide Other Trips
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-2" />
                  View All Trips ({trips.length})
                </>
              )}
            </Button>

            {/* Expandable Trip List */}
            {isExpanded && (
              <div className="space-y-3">
                {trips.map((trip: Trip) => (
                  <div
                    key={trip.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      trip.id === selectedTripId 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                    onClick={() => onTripSelect(trip)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">{trip.title}</h4>
                      <Badge 
                        className={getStatusColor(trip.status)}
                      >
                        {trip.status}
                      </Badge>
                    </div>
                    <div className="flex items-center text-slate-600 text-xs space-x-3">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{trip.destination}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {format(new Date(trip.startDate), 'MMM d')} - {format(new Date(trip.endDate), 'MMM d')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}