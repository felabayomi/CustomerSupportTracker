import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Plus, Edit, Trash2, Save, X, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

interface Trip {
  id: number;
  userId: number;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  status: string;
  description: string | null;
  userName?: string;
}

interface TripFormData {
  userId: number;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  status: string;
  description?: string;
}

export function AdminTripManager() {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingTrip, setEditingTrip] = useState<number | null>(null);
  const [formData, setFormData] = useState<TripFormData>({
    userId: 0,
    title: "",
    destination: "",
    startDate: "",
    endDate: "",
    status: "planned",
    description: ""
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: users = [] } = useQuery({
    queryKey: ['/api/admin/users'],
  });

  const { data: allTrips = [] } = useQuery({
    queryKey: ['/api/admin/trips'],
  });

  const filteredTrips = selectedUserId 
    ? allTrips.filter((trip: Trip) => trip.userId === selectedUserId)
    : allTrips;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.userId || !formData.title || !formData.destination || !formData.startDate || !formData.endDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast({
        title: "Invalid Dates",
        description: "End date must be after start date.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingTrip) {
        await apiRequest("PATCH", `/api/admin/trips/${editingTrip}`, formData);
        toast({
          title: "Trip Updated",
          description: "Trip has been successfully updated.",
        });
        setEditingTrip(null);
      } else {
        await apiRequest("POST", "/api/admin/trips", formData);
        toast({
          title: "Trip Added",
          description: "New trip has been successfully created.",
        });
        setIsAdding(false);
      }
      
      // Reset form
      setFormData({
        userId: 0,
        title: "",
        destination: "",
        startDate: "",
        endDate: "",
        status: "planned",
        description: ""
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/admin/trips'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save trip. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (trip: Trip) => {
    setEditingTrip(trip.id);
    setFormData({
      userId: trip.userId,
      title: trip.title,
      destination: trip.destination,
      startDate: trip.startDate,
      endDate: trip.endDate,
      status: trip.status,
      description: trip.description || ""
    });
  };

  const handleDelete = async (tripId: number) => {
    if (!confirm("Are you sure you want to delete this trip?")) return;
    
    try {
      await apiRequest("DELETE", `/api/admin/trips/${tripId}`);
      toast({
        title: "Trip Deleted",
        description: "Trip has been successfully removed.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/trips'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete trip. Please try again.",
        variant: "destructive",
      });
    }
  };

  const cancelEdit = () => {
    setEditingTrip(null);
    setIsAdding(false);
    setFormData({
      userId: 0,
      title: "",
      destination: "",
      startDate: "",
      endDate: "",
      status: "planned",
      description: ""
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500 text-white";
      case "planned":
        return "bg-blue-500 text-white";
      case "completed":
        return "bg-gray-500 text-white";
      default:
        return "bg-slate-500 text-white";
    }
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate + 'T12:00:00');
    const end = new Date(endDate + 'T12:00:00');
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
  };

  const getUserName = (userId: number) => {
    const user = users.find((u: any) => u.id === userId);
    return user ? user.name || user.username : `User ${userId}`;
  };

  const getCurrentLocation = (trip: Trip) => {
    const today = new Date();
    const start = new Date(trip.startDate + 'T12:00:00');
    const end = new Date(trip.endDate + 'T12:00:00');
    
    if (today >= start && today <= end) {
      return `Currently in ${trip.destination}`;
    } else if (today < start) {
      const daysUntil = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return `Departing in ${daysUntil} days`;
    } else {
      return "Trip completed";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Customer Trip Management</CardTitle>
          <div className="flex items-center space-x-3">
            <select
              value={selectedUserId || ''}
              onChange={(e) => setSelectedUserId(e.target.value ? parseInt(e.target.value) : null)}
              className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Customers</option>
              {users.map((user: any) => (
                <option key={user.id} value={user.id}>
                  {user.name || user.username}
                </option>
              ))}
            </select>
            <Button 
              onClick={() => setIsAdding(true)}
              className="flex items-center space-x-2"
              disabled={isAdding || editingTrip !== null}
            >
              <Plus className="w-4 h-4" />
              <span>Add Trip</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Add/Edit Form */}
        {(isAdding || editingTrip !== null) && (
          <div className="border rounded-lg p-4 mb-6 bg-slate-50">
            <h3 className="font-semibold mb-4">
              {editingTrip ? "Edit Trip" : "Add New Trip"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="userId">Customer *</Label>
                  <select
                    id="userId"
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value={0}>Select Customer</option>
                    {users.map((user: any) => (
                      <option key={user.id} value={user.id}>
                        {user.name || user.username}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="title">Trip Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., European Adventure"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="destination">Destination *</Label>
                <Input
                  id="destination"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  placeholder="e.g., Paris, France"
                  required
                />
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="planned">Planned</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description/Itinerary Link</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Trip notes or itinerary link"
                />
              </div>
              
              <div className="flex space-x-2">
                <Button type="submit" className="flex items-center space-x-2">
                  <Save className="w-4 h-4" />
                  <span>{editingTrip ? "Update Trip" : "Create Trip"}</span>
                </Button>
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Trip List */}
        <div className="space-y-3">
          {filteredTrips.length === 0 ? (
            <div className="text-center py-8 text-slate-600">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-400" />
              <p>No trips found for the selected criteria.</p>
            </div>
          ) : (
            filteredTrips.map((trip: Trip) => (
              <div
                key={trip.id}
                className="border rounded-lg p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-lg">{trip.title}</h3>
                      <Badge className={getStatusColor(trip.status)}>
                        {trip.status}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-2">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{getUserName(trip.userId)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{trip.destination}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-blue-600 font-medium mb-2">
                      {getCurrentLocation(trip)}
                    </div>
                    
                    {trip.description && (
                      <p className="text-sm text-slate-600">{trip.description}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(trip)}
                      disabled={isAdding || editingTrip !== null}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(trip.id)}
                      disabled={isAdding || editingTrip !== null}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}