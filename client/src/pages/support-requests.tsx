import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Clock, AlertCircle, ArrowLeft, MessageSquare } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { SupportRequest } from "@shared/schema";

export default function SupportRequests() {
  const [, setLocation] = useLocation();

  const { data: supportRequests, isLoading } = useQuery({
    queryKey: ["/api/support-requests"],
  });

  const requests = (supportRequests as SupportRequest[]) || [];

  const openRequests = requests.filter(req => req.status === 'open');
  const inProgressRequests = requests.filter(req => req.status === 'in_progress');
  const resolvedRequests = requests.filter(req => req.status === 'resolved');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-50 border-green-200';
      case 'in_progress':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-red-50 border-red-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-slate-600">Loading support requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/dashboard")}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
              <h1 className="text-xl font-semibold text-slate-900">Support Requests</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({requests.length})</TabsTrigger>
            <TabsTrigger value="open">Open ({openRequests.length})</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress ({inProgressRequests.length})</TabsTrigger>
            <TabsTrigger value="resolved">Resolved ({resolvedRequests.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>All Support Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {requests.map((request) => (
                    <div key={request.id} className={`border rounded-lg p-4 hover:bg-slate-50 ${getStatusColor(request.status)}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            {getStatusIcon(request.status)}
                            <h3 className="font-medium text-slate-900">{request.title}</h3>
                            <Badge className={getPriorityColor(request.priority)}>
                              {request.priority.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">
                            {request.description ? request.description.substring(0, 150) + '...' : 'No description provided'}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-slate-500">
                            <span>Created {formatTimeAgo(request.createdAt)}</span>
                            {request.assignedAgent && <span>Assigned to {request.assignedAgent}</span>}
                            {request.resolvedAt && <span>Resolved {formatTimeAgo(request.resolvedAt)}</span>}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={request.status === "resolved" ? "default" : "secondary"}>
                            {request.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                  {requests.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                      <p>No support requests found</p>
                      <p className="text-sm mt-2">Your support requests will appear here when you create them.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="open">
            <Card>
              <CardHeader>
                <CardTitle>Open Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {openRequests.map((request) => (
                    <div key={request.id} className={`border rounded-lg p-4 hover:bg-slate-50 ${getStatusColor(request.status)}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            {getStatusIcon(request.status)}
                            <h3 className="font-medium text-slate-900">{request.title}</h3>
                            <Badge className={getPriorityColor(request.priority)}>
                              {request.priority.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">
                            {request.description ? request.description.substring(0, 150) + '...' : 'No description provided'}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-slate-500">
                            <span>Created {formatTimeAgo(request.createdAt)}</span>
                            {request.assignedAgent && <span>Assigned to {request.assignedAgent}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {openRequests.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      No open requests
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="in_progress">
            <Card>
              <CardHeader>
                <CardTitle>In Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {inProgressRequests.map((request) => (
                    <div key={request.id} className={`border rounded-lg p-4 hover:bg-slate-50 ${getStatusColor(request.status)}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            {getStatusIcon(request.status)}
                            <h3 className="font-medium text-slate-900">{request.title}</h3>
                            <Badge className={getPriorityColor(request.priority)}>
                              {request.priority.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">
                            {request.description ? request.description.substring(0, 150) + '...' : 'No description provided'}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-slate-500">
                            <span>Created {formatTimeAgo(request.createdAt)}</span>
                            {request.assignedAgent && <span>Assigned to {request.assignedAgent}</span>}
                          </div>
                        </div>
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
                <CardTitle>Resolved Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {resolvedRequests.map((request) => (
                    <div key={request.id} className={`border rounded-lg p-4 hover:bg-slate-50 ${getStatusColor(request.status)}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            {getStatusIcon(request.status)}
                            <h3 className="font-medium text-slate-900">{request.title}</h3>
                            <Badge className={getPriorityColor(request.priority)}>
                              {request.priority.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">
                            {request.description ? request.description.substring(0, 150) + '...' : 'No description provided'}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-slate-500">
                            <span>Created {formatTimeAgo(request.createdAt)}</span>
                            {request.assignedAgent && <span>Assigned to {request.assignedAgent}</span>}
                            {request.resolvedAt && <span>Resolved {formatTimeAgo(request.resolvedAt)}</span>}
                          </div>
                        </div>
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
        </Tabs>
      </div>
    </div>
  );
}