import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, Clock, CheckCircle, User, Calendar, MapPin, Edit, MessageSquare, ArrowLeft } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface SupportRequest {
  id: number;
  userId: number;
  tripId: number;
  type: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignedAgent: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

export default function AdminSupportRequests() {
  const [location, setLocation] = useLocation();
  const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(null);
  const [responseText, setResponseText] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [newAgent, setNewAgent] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get all support requests for admin view
  const { data: allSupportRequests, isLoading } = useQuery({
    queryKey: ["/api/admin/support-requests"],
  });

  const { data: agents } = useQuery({
    queryKey: ["/api/admin/agents"],
  });

  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      const res = await apiRequest('PATCH', `/api/admin/support-requests/${id}`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/support-requests"] });
      toast({
        title: "Request Updated",
        description: "Support request has been successfully updated.",
      });
    },
  });

  const createResponseMutation = useMutation({
    mutationFn: async ({ requestId, response }: { requestId: number; response: string }) => {
      const res = await apiRequest('POST', `/api/admin/support-requests/${requestId}/response`, {
        message: response
      });
      return res.json();
    },
    onSuccess: () => {
      setResponseText("");
      toast({
        title: "Response Sent",
        description: "Your response has been sent to the customer.",
      });
    },
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "emergency": return "bg-red-100 text-red-800 border-red-200";
      case "high": return "bg-orange-100 text-orange-800 border-orange-200";
      case "normal": return "bg-blue-100 text-blue-800 border-blue-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in_progress": return "bg-blue-100 text-blue-800 border-blue-200";
      case "resolved": return "bg-green-100 text-green-800 border-green-200";
      case "closed": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open": return <Clock className="h-4 w-4 text-yellow-600" />;
      case "in_progress": return <Edit className="h-4 w-4 text-blue-600" />;
      case "resolved": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "closed": return <CheckCircle className="h-4 w-4 text-gray-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleStatusUpdate = (request: SupportRequest) => {
    const updates: any = {};
    if (newStatus) updates.status = newStatus;
    if (newAgent) updates.assignedAgent = newAgent;
    if (newStatus === "resolved") updates.resolvedAt = new Date().toISOString();

    updateRequestMutation.mutate({ id: request.id, updates });
    setNewStatus("");
    setNewAgent("");
  };

  const handleSendResponse = (request: SupportRequest) => {
    if (!responseText.trim()) return;
    
    createResponseMutation.mutate({
      requestId: request.id,
      response: responseText
    });
  };

  const parseModificationDetails = (description: string) => {
    try {
      const match = description.match(/Modification Details: ({.*})/s);
      if (match) {
        return JSON.parse(match[1]);
      }
    } catch (e) {
      // Fallback for non-JSON descriptions
    }
    return null;
  };

  const openRequests = allSupportRequests?.filter((req: SupportRequest) => req.status === 'open') || [];
  const inProgressRequests = allSupportRequests?.filter((req: SupportRequest) => req.status === 'in_progress') || [];
  const resolvedRequests = allSupportRequests?.filter((req: SupportRequest) => req.status === 'resolved') || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-slate-600">Loading support requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/admin/felixdgreat/console")}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Console</span>
              </Button>
              <h1 className="text-xl font-semibold text-slate-900">Support Request Management</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Open Requests</p>
                  <p className="text-2xl font-bold text-slate-900">{openRequests.length}</p>
                </div>
                <div className="h-8 w-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-4 w-4 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">In Progress</p>
                  <p className="text-2xl font-bold text-slate-900">{inProgressRequests.length}</p>
                </div>
                <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Edit className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Resolved Today</p>
                  <p className="text-2xl font-bold text-slate-900">{resolvedRequests.length}</p>
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="open" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="open">Open ({openRequests.length})</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress ({inProgressRequests.length})</TabsTrigger>
            <TabsTrigger value="resolved">Resolved ({resolvedRequests.length})</TabsTrigger>
            <TabsTrigger value="all">All Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="open">
            <Card>
              <CardHeader>
                <CardTitle>Open Support Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {openRequests.map((request: SupportRequest) => (
                    <div key={request.id} className="border rounded-lg p-4 hover:bg-slate-50 cursor-pointer"
                         onClick={() => setSelectedRequest(request)}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            {getStatusIcon(request.status)}
                            <h3 className="font-medium text-slate-900">{request.title}</h3>
                            <Badge className={getPriorityColor(request.priority)}>
                              {request.priority.toUpperCase()}
                            </Badge>
                            <Badge className={getStatusColor(request.status)}>
                              {request.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{request.description.substring(0, 150)}...</p>
                          <div className="flex items-center space-x-4 text-xs text-slate-500">
                            <span className="flex items-center space-x-1">
                              <User className="h-3 w-3" />
                              <span>User ID: {request.userId}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{format(new Date(request.createdAt), 'MMM dd, HH:mm')}</span>
                            </span>
                            {request.assignedAgent && (
                              <span className="flex items-center space-x-1">
                                <Avatar className="h-3 w-3">
                                  <AvatarFallback className="text-xs">{request.assignedAgent.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span>{request.assignedAgent}</span>
                              </span>
                            )}
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                  {openRequests.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      No open support requests
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="in_progress">
            <Card>
              <CardHeader>
                <CardTitle>In Progress Support Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {inProgressRequests.map((request: SupportRequest) => (
                    <div key={request.id} className="border rounded-lg p-4 hover:bg-slate-50 cursor-pointer"
                         onClick={() => setSelectedRequest(request)}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            {getStatusIcon(request.status)}
                            <h3 className="font-medium text-slate-900">{request.title}</h3>
                            <Badge className={getPriorityColor(request.priority)}>
                              {request.priority.toUpperCase()}
                            </Badge>
                            <Badge className={getStatusColor(request.status)}>
                              {request.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{request.description.substring(0, 150)}...</p>
                          <div className="flex items-center space-x-4 text-xs text-slate-500">
                            <span className="flex items-center space-x-1">
                              <User className="h-3 w-3" />
                              <span>User ID: {request.userId}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{format(new Date(request.createdAt), 'MMM dd, HH:mm')}</span>
                            </span>
                            {request.assignedAgent && (
                              <span className="flex items-center space-x-1">
                                <Avatar className="h-3 w-3">
                                  <AvatarFallback className="text-xs">{request.assignedAgent.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span>{request.assignedAgent}</span>
                              </span>
                            )}
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                  {inProgressRequests.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      No requests in progress
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resolved">
            <Card>
              <CardHeader>
                <CardTitle>Resolved Support Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {resolvedRequests.map((request: SupportRequest) => (
                    <div key={request.id} className="border rounded-lg p-4 hover:bg-slate-50 cursor-pointer"
                         onClick={() => setSelectedRequest(request)}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            {getStatusIcon(request.status)}
                            <h3 className="font-medium text-slate-900">{request.title}</h3>
                            <Badge className={getPriorityColor(request.priority)}>
                              {request.priority.toUpperCase()}
                            </Badge>
                            <Badge className={getStatusColor(request.status)}>
                              {request.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{request.description.substring(0, 150)}...</p>
                          <div className="flex items-center space-x-4 text-xs text-slate-500">
                            <span className="flex items-center space-x-1">
                              <User className="h-3 w-3" />
                              <span>User ID: {request.userId}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>Created: {format(new Date(request.createdAt), 'MMM dd, HH:mm')}</span>
                            </span>
                            {request.resolvedAt && (
                              <span className="flex items-center space-x-1">
                                <CheckCircle className="h-3 w-3" />
                                <span>Resolved: {format(new Date(request.resolvedAt), 'MMM dd, HH:mm')}</span>
                              </span>
                            )}
                            {request.assignedAgent && (
                              <span className="flex items-center space-x-1">
                                <Avatar className="h-3 w-3">
                                  <AvatarFallback className="text-xs">{request.assignedAgent.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span>{request.assignedAgent}</span>
                              </span>
                            )}
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                  {resolvedRequests.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      No resolved requests
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>All Support Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allSupportRequests?.map((request: SupportRequest) => (
                    <div key={request.id} className="border rounded-lg p-4 hover:bg-slate-50 cursor-pointer"
                         onClick={() => setSelectedRequest(request)}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            {getStatusIcon(request.status)}
                            <h3 className="font-medium text-slate-900">{request.title}</h3>
                            <Badge className={getPriorityColor(request.priority)}>
                              {request.priority.toUpperCase()}
                            </Badge>
                            <Badge className={getStatusColor(request.status)}>
                              {request.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{request.description.substring(0, 150)}...</p>
                          <div className="flex items-center space-x-4 text-xs text-slate-500">
                            <span className="flex items-center space-x-1">
                              <User className="h-3 w-3" />
                              <span>User ID: {request.userId}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{format(new Date(request.createdAt), 'MMM dd, HH:mm')}</span>
                            </span>
                            {request.assignedAgent && (
                              <span className="flex items-center space-x-1">
                                <Avatar className="h-3 w-3">
                                  <AvatarFallback className="text-xs">{request.assignedAgent.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span>{request.assignedAgent}</span>
                              </span>
                            )}
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                  {(!allSupportRequests || allSupportRequests.length === 0) && (
                    <div className="text-center py-8 text-slate-500">
                      No support requests found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Support Request Detail Modal */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Support Request Details</DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Request ID</label>
                  <p className="text-slate-900">{selectedRequest.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Type</label>
                  <p className="text-slate-900 capitalize">{selectedRequest.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Priority</label>
                  <Badge className={getPriorityColor(selectedRequest.priority)}>
                    {selectedRequest.priority.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Status</label>
                  <Badge className={getStatusColor(selectedRequest.status)}>
                    {selectedRequest.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Customer ID</label>
                  <p className="text-slate-900">{selectedRequest.userId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Trip ID</label>
                  <p className="text-slate-900">{selectedRequest.tripId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Created</label>
                  <p className="text-slate-900">{format(new Date(selectedRequest.createdAt), 'MMM dd, yyyy HH:mm')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Assigned Agent</label>
                  <p className="text-slate-900">{selectedRequest.assignedAgent || "Unassigned"}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">Title</label>
                <p className="text-slate-900 mt-1">{selectedRequest.title}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600">Description</label>
                <div className="mt-1 p-3 bg-slate-50 rounded-lg">
                  <pre className="text-sm text-slate-900 whitespace-pre-wrap">{selectedRequest.description}</pre>
                </div>
              </div>

              {/* Parse and display modification details if available */}
              {selectedRequest.type === "modification" && (
                (() => {
                  const modDetails = parseModificationDetails(selectedRequest.description);
                  return modDetails ? (
                    <div>
                      <label className="text-sm font-medium text-slate-600">Modification Details</label>
                      <div className="mt-1 grid grid-cols-2 gap-4 p-3 bg-blue-50 rounded-lg">
                        <div>
                          <span className="text-xs font-medium text-slate-600">Type:</span>
                          <p className="text-sm text-slate-900 capitalize">{modDetails.type}</p>
                        </div>
                        {modDetails.newDate && (
                          <div>
                            <span className="text-xs font-medium text-slate-600">New Date:</span>
                            <p className="text-sm text-slate-900">{modDetails.newDate}</p>
                          </div>
                        )}
                        {modDetails.newTime && (
                          <div>
                            <span className="text-xs font-medium text-slate-600">New Time:</span>
                            <p className="text-sm text-slate-900">{modDetails.newTime}</p>
                          </div>
                        )}
                        {modDetails.newLocation && (
                          <div>
                            <span className="text-xs font-medium text-slate-600">New Location:</span>
                            <p className="text-sm text-slate-900">{modDetails.newLocation}</p>
                          </div>
                        )}
                        {modDetails.guestCount && (
                          <div>
                            <span className="text-xs font-medium text-slate-600">Guest Count:</span>
                            <p className="text-sm text-slate-900">{modDetails.guestCount}</p>
                          </div>
                        )}
                        {modDetails.specialRequests && (
                          <div className="col-span-2">
                            <span className="text-xs font-medium text-slate-600">Special Requests:</span>
                            <p className="text-sm text-slate-900">{modDetails.specialRequests}</p>
                          </div>
                        )}
                        {modDetails.reasonForChange && (
                          <div className="col-span-2">
                            <span className="text-xs font-medium text-slate-600">Reason for Change:</span>
                            <p className="text-sm text-slate-900">{modDetails.reasonForChange}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null;
                })()
              )}

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <label className="text-sm font-medium text-slate-600">Update Status</label>
                  <div className="flex space-x-2 mt-1">
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      size="sm" 
                      onClick={() => handleStatusUpdate(selectedRequest)}
                      disabled={!newStatus}
                    >
                      Update
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-600">Assign Agent</label>
                  <div className="flex space-x-2 mt-1">
                    <Select value={newAgent} onValueChange={setNewAgent}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select agent" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sarah">Sarah Johnson</SelectItem>
                        <SelectItem value="Mike">Mike Chen</SelectItem>
                        <SelectItem value="Emma">Emma Davis</SelectItem>
                        <SelectItem value="Alex">Alex Rodriguez</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      size="sm" 
                      onClick={() => handleStatusUpdate(selectedRequest)}
                      disabled={!newAgent}
                    >
                      Assign
                    </Button>
                  </div>
                </div>
              </div>

              {/* Response Section */}
              <div className="pt-4 border-t">
                <label className="text-sm font-medium text-slate-600">Send Response to Customer</label>
                <div className="mt-2 space-y-3">
                  <Textarea
                    placeholder="Type your response here..."
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    rows={4}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setResponseText("")}>
                      Clear
                    </Button>
                    <Button 
                      onClick={() => handleSendResponse(selectedRequest)}
                      disabled={!responseText.trim() || createResponseMutation.isPending}
                      className="flex items-center space-x-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Send Response</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}