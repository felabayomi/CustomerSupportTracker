import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Users, TrendingUp, AlertTriangle, UserCheck, MapPin, BarChart3, Plus, Trash2, Edit, Save, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminConsole() {
  const [location, setLocation] = useLocation();
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    accessCode: '',
    preferences: '',
    itineraries: ['']
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: systemStats } = useQuery({
    queryKey: ["/api/admin/stats"],
  });

  const { data: agents } = useQuery({
    queryKey: ["/api/admin/agents"],
  });

  const { data: travelers } = useQuery({
    queryKey: ["/api/admin/travelers"],
  });

  // Create customer mutation
  const createCustomerMutation = useMutation({
    mutationFn: async (customerData: any) => {
      const res = await apiRequest('POST', '/api/admin/create-customer', customerData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/travelers"] });
      toast({
        title: "Success",
        description: "Customer created and access code linked successfully",
      });
      setNewCustomer({
        name: '',
        email: '',
        phone: '',
        accessCode: '',
        preferences: '',
        itineraries: ['']
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create customer. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Update customer mutation
  const updateCustomerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      const res = await apiRequest('PUT', `/api/admin/update-customer/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/travelers"] });
      toast({
        title: "Success",
        description: "Customer updated successfully",
      });
      setEditingCustomer(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update customer. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Delete customer mutation
  const deleteCustomerMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/admin/delete-customer/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/travelers"] });
      toast({
        title: "Success",
        description: "Customer deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete customer. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Itinerary management functions
  const addItinerary = (customerType = 'new') => {
    if (customerType === 'new') {
      setNewCustomer(prev => ({
        ...prev,
        itineraries: [...prev.itineraries, '']
      }));
    } else if (editingCustomer) {
      setEditingCustomer(prev => ({
        ...prev,
        itineraries: [...prev.itineraries, '']
      }));
    }
  };

  const removeItinerary = (index, customerType = 'new') => {
    if (customerType === 'new') {
      setNewCustomer(prev => ({
        ...prev,
        itineraries: prev.itineraries.filter((_, i) => i !== index)
      }));
    } else if (editingCustomer) {
      setEditingCustomer(prev => ({
        ...prev,
        itineraries: prev.itineraries.filter((_, i) => i !== index)
      }));
    }
  };

  const updateItinerary = (index, value, customerType = 'new') => {
    if (customerType === 'new') {
      setNewCustomer(prev => ({
        ...prev,
        itineraries: prev.itineraries.map((itinerary, i) => 
          i === index ? value : itinerary
        )
      }));
    } else if (editingCustomer) {
      setEditingCustomer(prev => ({
        ...prev,
        itineraries: prev.itineraries.map((itinerary, i) => 
          i === index ? value : itinerary
        )
      }));
    }
  };

  const startEditing = (customer) => {
    setEditingCustomer({
      ...customer,
      itineraries: customer.itineraries || ['']
    });
  };

  const cancelEditing = () => {
    setEditingCustomer(null);
  };

  const saveCustomer = () => {
    if (editingCustomer) {
      updateCustomerMutation.mutate({
        id: editingCustomer.id,
        data: {
          name: editingCustomer.name,
          email: editingCustomer.email,
          phone: editingCustomer.phone,
          preferences: editingCustomer.preferences,
          itineraries: editingCustomer.itineraries
        }
      });
    }
  };

  const createCustomer = () => {
    createCustomerMutation.mutate({
      name: newCustomer.name,
      email: newCustomer.email,
      phone: newCustomer.phone,
      accessCode: newCustomer.accessCode,
      preferences: newCustomer.preferences,
      itineraries: newCustomer.itineraries.filter(itinerary => itinerary.trim() !== '')
    });
  };

  const deleteCustomer = (customerId: number) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      deleteCustomerMutation.mutate(customerId);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-destructive rounded-lg flex items-center justify-center">
                <Settings className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Admin Console</h1>
                <p className="text-xs text-slate-500">Management Center</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                Administrator
              </Badge>
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" alt="Admin" />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-slate-700">
                  Admin User
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Travelers</p>
                  <p className="text-2xl font-semibold text-slate-900">347</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Active Agents</p>
                  <p className="text-2xl font-semibold text-slate-900">28</p>
                </div>
                <UserCheck className="h-8 w-8 text-secondary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Active Trips</p>
                  <p className="text-2xl font-semibold text-slate-900">156</p>
                </div>
                <MapPin className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Avg. Satisfaction</p>
                  <p className="text-2xl font-semibold text-slate-900">4.8</p>
                </div>
                <TrendingUp className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="monitoring">Live Monitoring</TabsTrigger>
            <TabsTrigger value="codes">Access Codes</TabsTrigger>
            <TabsTrigger value="customers">Customer Management</TabsTrigger>
            <TabsTrigger value="agents">Agent Management</TabsTrigger>
            <TabsTrigger value="travelers">Traveler Management</TabsTrigger>
            <TabsTrigger value="communications">Communications</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {[
                        {
                          action: "New traveler registered",
                          user: "Emma Wilson",
                          time: "5 minutes ago",
                          type: "user"
                        },
                        {
                          action: "Agent went online",
                          user: "Michael Brown",
                          time: "12 minutes ago",
                          type: "agent"
                        },
                        {
                          action: "Emergency request resolved",
                          user: "Sarah Anderson → Maya Chen",
                          time: "25 minutes ago",
                          type: "emergency"
                        },
                        {
                          action: "Trip completed",
                          user: "John Davis",
                          time: "1 hour ago",
                          type: "trip"
                        }
                      ].map((activity, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <div className={`w-3 h-3 rounded-full ${
                            activity.type === 'emergency' ? 'bg-red-500' :
                            activity.type === 'agent' ? 'bg-green-500' :
                            activity.type === 'user' ? 'bg-blue-500' : 'bg-yellow-500'
                          }`}></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                            <p className="text-xs text-slate-600">{activity.user} • {activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      {
                        alert: "High support ticket volume",
                        severity: "warning",
                        description: "15% increase in tickets today"
                      },
                      {
                        alert: "Agent utilization optimal",
                        severity: "success", 
                        description: "All agents within capacity"
                      },
                      {
                        alert: "Database backup completed",
                        severity: "info",
                        description: "Daily backup successful"
                      }
                    ].map((alert, index) => (
                      <div key={index} className={`p-3 rounded-lg border-l-4 ${
                        alert.severity === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                        alert.severity === 'success' ? 'border-green-500 bg-green-50' :
                        'border-blue-500 bg-blue-50'
                      }`}>
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className={`h-4 w-4 ${
                            alert.severity === 'warning' ? 'text-yellow-600' :
                            alert.severity === 'success' ? 'text-green-600' :
                            'text-blue-600'
                          }`} />
                          <p className="font-medium text-slate-900">{alert.alert}</p>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{alert.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="agents" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-900">Agent Management</h3>
              <Button>Add New Agent</Button>
            </div>
            
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[
                    {
                      name: "Sarah Anderson",
                      email: "sarah@citydiscoverer.com",
                      status: "online",
                      assigned: 12,
                      rating: 4.9,
                      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
                    },
                    {
                      name: "Michael Brown",
                      email: "michael@citydiscoverer.com", 
                      status: "online",
                      assigned: 8,
                      rating: 4.7,
                      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
                    },
                    {
                      name: "Lisa Chen",
                      email: "lisa@citydiscoverer.com",
                      status: "offline",
                      assigned: 15,
                      rating: 4.8,
                      avatar: "https://images.unsplash.com/photo-1494790108755-2616b9f90882?w=150&h=150&fit=crop&crop=face"
                    }
                  ].map((agent, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={agent.avatar} alt={agent.name} />
                          <AvatarFallback>{agent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-slate-900">{agent.name}</h4>
                          <p className="text-sm text-slate-600">{agent.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <p className="text-sm text-slate-600">Status</p>
                          <Badge variant={agent.status === 'online' ? 'default' : 'secondary'}>
                            {agent.status}
                          </Badge>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-slate-600">Assigned</p>
                          <p className="font-semibold">{agent.assigned}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-slate-600">Rating</p>
                          <p className="font-semibold">{agent.rating}</p>
                        </div>
                        <Button variant="outline" size="sm">Manage</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="travelers" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-900">Traveler Management</h3>
              <div className="flex space-x-2">
                <Select>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">Export</Button>
              </div>
            </div>
            
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[
                    {
                      name: "Maya Chen",
                      email: "maya.chen@email.com",
                      trip: "San Francisco City Explorer",
                      agent: "Sarah Anderson",
                      status: "active",
                      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face"
                    },
                    {
                      name: "James Rodriguez",
                      email: "james.r@email.com",
                      trip: "New York Business Trip", 
                      agent: "Michael Brown",
                      status: "active",
                      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
                    },
                    {
                      name: "Emily Davis",
                      email: "emily.davis@email.com",
                      trip: "Chicago Food Tour",
                      agent: "Unassigned",
                      status: "pending",
                      avatar: "https://images.unsplash.com/photo-1494790108755-2616b9f90882?w=150&h=150&fit=crop&crop=face"
                    }
                  ].map((traveler, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={traveler.avatar} alt={traveler.name} />
                          <AvatarFallback>{traveler.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-slate-900">{traveler.name}</h4>
                          <p className="text-sm text-slate-600">{traveler.email}</p>
                          <p className="text-sm text-slate-500">{traveler.trip}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <p className="text-sm text-slate-600">Agent</p>
                          <p className="font-medium">{traveler.agent}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-slate-600">Status</p>
                          <Badge variant={traveler.status === 'active' ? 'default' : 'secondary'}>
                            {traveler.status}
                          </Badge>
                        </div>
                        <Button variant="outline" size="sm">View Details</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="assignments" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-900">Agent-Traveler Assignments</h3>
              <Button>Auto-Assign</Button>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Assignment Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      {
                        traveler: "Emily Davis",
                        recommendedAgent: "Lisa Chen",
                        reason: "Language preference (Spanish)",
                        confidence: "95%"
                      },
                      {
                        traveler: "Robert Kim",
                        recommendedAgent: "Sarah Anderson", 
                        reason: "Destination expertise (West Coast)",
                        confidence: "87%"
                      }
                    ].map((rec, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-slate-900">{rec.traveler}</p>
                            <p className="text-sm text-slate-600">→ {rec.recommendedAgent}</p>
                          </div>
                          <Badge variant="outline">{rec.confidence}</Badge>
                        </div>
                        <p className="text-sm text-slate-500">{rec.reason}</p>
                        <div className="flex space-x-2 mt-2">
                          <Button size="sm">Assign</Button>
                          <Button size="sm" variant="outline">Skip</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Workload Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { agent: "Sarah Anderson", load: 12, capacity: 15, utilization: 80 },
                      { agent: "Michael Brown", load: 8, capacity: 15, utilization: 53 },
                      { agent: "Lisa Chen", load: 15, capacity: 15, utilization: 100 }
                    ].map((workload, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-slate-900">{workload.agent}</span>
                          <span className="text-sm text-slate-600">
                            {workload.load}/{workload.capacity} ({workload.utilization}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              workload.utilization >= 90 ? 'bg-red-500' :
                              workload.utilization >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${workload.utilization}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Live Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-4">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Live Chat Queue</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Pending Chats</span>
                      <span className="font-semibold text-red-600">3</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Chats</span>
                      <span className="font-semibold text-green-600">24</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Wait Time</span>
                      <span className="font-semibold">2m 15s</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Response Time</span>
                      <span className="font-semibold">45s</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Agent Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: "Sarah Anderson", status: "online", chats: 5, load: "Normal" },
                      { name: "Michael Brown", status: "online", chats: 3, load: "Light" },
                      { name: "Lisa Chen", status: "busy", chats: 8, load: "Heavy" },
                      { name: "David Wilson", status: "offline", chats: 0, load: "N/A" }
                    ].map((agent, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center space-x-2">
                          <div className={`h-2 w-2 rounded-full ${
                            agent.status === 'online' ? 'bg-green-500' :
                            agent.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-400'
                          }`}></div>
                          <span className="text-sm font-medium">{agent.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm">{agent.chats} chats</div>
                          <div className="text-xs text-slate-500">{agent.load}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Database</span>
                      <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>API Response</span>
                      <Badge className="bg-green-100 text-green-800">125ms</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Memory Usage</span>
                      <Badge className="bg-yellow-100 text-yellow-800">72%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Active Connections</span>
                      <Badge className="bg-blue-100 text-blue-800">156</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Access Codes Tab */}
          <TabsContent value="codes" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-900">Access Code Management</h3>
              <Button onClick={() => setLocation('/admin/felixdgreat')}>
                Back to Secure Portal
              </Button>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Code Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total Codes Generated</span>
                      <span className="font-semibold">1,247</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Codes</span>
                      <span className="font-semibold text-green-600">892</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Used Today</span>
                      <span className="font-semibold">156</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Expired/Inactive</span>
                      <span className="font-semibold text-red-600">355</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Code Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-48">
                    <div className="space-y-2">
                      {[
                        { code: "ABC-123-DEF", user: "Maya Chen", time: "2 minutes ago", status: "active" },
                        { code: "GHI-456-JKL", user: "John Smith", time: "15 minutes ago", status: "active" },
                        { code: "MNO-789-PQR", user: "Sarah Wilson", time: "1 hour ago", status: "expired" },
                        { code: "STU-012-VWX", user: "Mike Davis", time: "2 hours ago", status: "active" }
                      ].map((usage, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <div className="font-mono text-sm">{usage.code}</div>
                            <div className="text-xs text-slate-500">{usage.user}</div>
                          </div>
                          <div className="text-right">
                            <Badge variant={usage.status === 'active' ? 'default' : 'secondary'}>
                              {usage.status}
                            </Badge>
                            <div className="text-xs text-slate-500 mt-1">{usage.time}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Customer Management Tab */}
          <TabsContent value="customers" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-900">Customer Management</h3>
              <Button>Add New Customer</Button>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Create Customer & Link Access Code</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Customer Name</label>
                      <Input 
                        type="text" 
                        placeholder="e.g., Kattey Hensen"
                        value={newCustomer.name}
                        onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <Input 
                        type="email" 
                        placeholder="customer@email.com"
                        value={newCustomer.email}
                        onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Phone</label>
                      <Input 
                        type="tel" 
                        placeholder="+1-555-0123"
                        value={newCustomer.phone}
                        onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Access Code</label>
                      <Select 
                        value={newCustomer.accessCode} 
                        onValueChange={(value) => setNewCustomer(prev => ({ ...prev, accessCode: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select available code..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="31Y-818-APP-JMW">31Y-818-APP-JMW</SelectItem>
                          <SelectItem value="BSI-SZZ-QRT-789">BSI-SZZ-QRT-789</SelectItem>
                          <SelectItem value="DEY-QDL-MNP-456">DEY-QDL-MNP-456</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Itinerary Links</label>
                      <Button 
                        type="button" 
                        size="sm" 
                        variant="outline"
                        onClick={() => addItinerary('new')}
                        className="flex items-center space-x-1"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Add Link</span>
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {newCustomer.itineraries.map((itinerary, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input 
                            type="url" 
                            placeholder={`Scenario ${index + 1}: https://view.citydiscoverer.ai/itinerary/...`}
                            value={itinerary}
                            onChange={(e) => updateItinerary(index, e.target.value, 'new')}
                            className="text-sm"
                          />
                          {newCustomer.itineraries.length > 1 && (
                            <Button 
                              type="button"
                              size="sm" 
                              variant="destructive"
                              onClick={() => removeItinerary(index, 'new')}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Travel Preferences</label>
                    <Textarea 
                      placeholder="e.g., Adventure travel, cultural experiences, road trips"
                      value={newCustomer.preferences}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, preferences: e.target.value }))}
                      className="h-20"
                    />
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={createCustomer}
                    disabled={!newCustomer.name || !newCustomer.email || !newCustomer.accessCode || createCustomerMutation.isPending}
                  >
                    {createCustomerMutation.isPending ? "Creating..." : "Create Customer & Link Code"}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Existing Customers</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {[
                        {
                          id: 1,
                          name: "Alex Thompson",
                          email: "alex.thompson@expedition-america.com",
                          phone: "+1-555-0123",
                          code: "ZQC-MBX-4KP-UUG",
                          status: "active",
                          trip: "Pacific Coast Adventure",
                          preferences: "Adventure activities, local cuisine, cultural experiences",
                          itineraries: [
                            "https://view.citydiscoverer.ai/itinerary/pacific-coast-premium",
                            "https://view.citydiscoverer.ai/itinerary/big-sur-adventure"
                          ],
                          avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face"
                        },
                        {
                          id: 4,
                          name: "Kattey Hensen",
                          email: "kattey.hensen@email.com",
                          phone: "+1-555-0199",
                          code: "31Y-818-APP-JMW",
                          status: "active",
                          trip: "Full Road Trip Drive",
                          preferences: "Adventure travel, cultural experiences, road trips",
                          itineraries: [
                            "https://view.citydiscoverer.ai/itinerary/itinerary-1749482482503-1lnmea4pn",
                            "https://view.citydiscoverer.ai/itinerary/itinerary-1749482321937-pjxoyw8d3"
                          ],
                          avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face"
                        }
                      ].map((customer) => (
                        <div key={customer.id} className="border rounded p-3">
                          {editingCustomer?.id === customer.id ? (
                            // Edit Mode
                            <div className="space-y-3">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium text-sm">Editing Customer</h4>
                                <div className="flex space-x-2">
                                  <Button size="sm" onClick={saveCustomer} className="text-xs">
                                    <Save className="h-3 w-3 mr-1" />
                                    Save
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={cancelEditing} className="text-xs">
                                    <X className="h-3 w-3 mr-1" />
                                    Cancel
                                  </Button>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-xs font-medium">Name</label>
                                  <Input 
                                    value={editingCustomer.name}
                                    onChange={(e) => setEditingCustomer(prev => ({ ...prev, name: e.target.value }))}
                                    className="text-xs"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-medium">Email</label>
                                  <Input 
                                    value={editingCustomer.email}
                                    onChange={(e) => setEditingCustomer(prev => ({ ...prev, email: e.target.value }))}
                                    className="text-xs"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-xs font-medium">Phone</label>
                                  <Input 
                                    value={editingCustomer.phone}
                                    onChange={(e) => setEditingCustomer(prev => ({ ...prev, phone: e.target.value }))}
                                    className="text-xs"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-medium">Access Code</label>
                                  <Input 
                                    value={editingCustomer.code}
                                    onChange={(e) => setEditingCustomer(prev => ({ ...prev, code: e.target.value }))}
                                    className="text-xs font-mono"
                                  />
                                </div>
                              </div>

                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <label className="text-xs font-medium">Itineraries</label>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => addItinerary('edit')}
                                    className="text-xs flex items-center space-x-1"
                                  >
                                    <Plus className="h-3 w-3" />
                                    <span>Add</span>
                                  </Button>
                                </div>
                                <div className="space-y-2">
                                  {editingCustomer.itineraries.map((itinerary, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                      <Input 
                                        value={itinerary}
                                        onChange={(e) => updateItinerary(index, e.target.value, 'edit')}
                                        className="text-xs"
                                      />
                                      {editingCustomer.itineraries.length > 1 && (
                                        <Button 
                                          size="sm" 
                                          variant="destructive"
                                          onClick={() => removeItinerary(index, 'edit')}
                                          className="text-xs"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <label className="text-xs font-medium">Preferences</label>
                                <Textarea 
                                  value={editingCustomer.preferences}
                                  onChange={(e) => setEditingCustomer(prev => ({ ...prev, preferences: e.target.value }))}
                                  className="text-xs h-16"
                                />
                              </div>
                            </div>
                          ) : (
                            // View Mode
                            <>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={customer.avatar} alt={customer.name} />
                                    <AvatarFallback>{customer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium text-sm">{customer.name}</p>
                                    <p className="text-xs text-slate-500">{customer.email}</p>
                                  </div>
                                </div>
                                <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
                                  {customer.status}
                                </Badge>
                              </div>
                              
                              <div className="text-xs space-y-1 mb-2">
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Access Code:</span>
                                  <span className="font-mono">{customer.code}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Phone:</span>
                                  <span>{customer.phone}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Current Trip:</span>
                                  <span>{customer.trip}</span>
                                </div>
                              </div>

                              <div className="text-xs mb-2">
                                <p className="text-slate-500 mb-1">Itineraries ({customer.itineraries.length}):</p>
                                <div className="space-y-1">
                                  {customer.itineraries.map((itinerary, index) => (
                                    <div key={index} className="truncate text-blue-600">
                                      Scenario {index + 1}: {itinerary}
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              <div className="flex space-x-2 mt-3">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="text-xs"
                                  onClick={() => startEditing(customer)}
                                >
                                  <Edit className="h-3 w-3 mr-1" />
                                  Edit
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive" 
                                  className="text-xs"
                                  onClick={() => deleteCustomer(customer.id)}
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Communications Tab */}
          <TabsContent value="communications" className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Broadcast Message</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Recipient Type</label>
                    <select className="w-full mt-1 p-2 border rounded">
                      <option>All Agents</option>
                      <option>Online Agents Only</option>
                      <option>All Travelers</option>
                      <option>Active Travelers</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Message Type</label>
                    <select className="w-full mt-1 p-2 border rounded">
                      <option>General Announcement</option>
                      <option>System Maintenance</option>
                      <option>Emergency Alert</option>
                      <option>Policy Update</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Message</label>
                    <textarea 
                      className="w-full mt-1 p-2 border rounded h-24" 
                      placeholder="Enter your message here..."
                    ></textarea>
                  </div>
                  <Button className="w-full">Send Broadcast</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Announcements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium">Maintenance Scheduled</div>
                        <div className="text-sm text-slate-600">System will be down for 30 minutes tonight at 2 AM EST</div>
                        <div className="text-xs text-slate-400">Posted 2 hours ago</div>
                      </div>
                      <Button size="sm" variant="outline">Edit</Button>
                    </div>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium">New Feature Launch</div>
                        <div className="text-sm text-slate-600">Enhanced chat capabilities now available</div>
                        <div className="text-xs text-slate-400">Posted 1 day ago</div>
                      </div>
                      <Button size="sm" variant="outline">Edit</Button>
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="outline">Add New Announcement</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Customer Satisfaction</span>
                        <span className="font-semibold">4.8/5.0</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '96%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Resolution Rate</span>
                        <span className="font-semibold">94%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '94%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>First Contact Resolution</span>
                        <span className="font-semibold">87%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '87%' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Usage Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Peak Usage Hours</span>
                      <span className="font-semibold">2-4 PM EST</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Busiest Day</span>
                      <span className="font-semibold">Monday</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Most Common Request</span>
                      <span className="font-semibold">Dining Recommendations</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Session Length</span>
                      <span className="font-semibold">12m 30s</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Top Destination</span>
                      <span className="font-semibold">San Francisco</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}