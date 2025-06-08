import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Users, TrendingUp, AlertTriangle, UserCheck, MapPin, BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function AdminConsole() {
  const { data: systemStats } = useQuery({
    queryKey: ["/api/admin/stats"],
  });

  const { data: agents } = useQuery({
    queryKey: ["/api/admin/agents"],
  });

  const { data: travelers } = useQuery({
    queryKey: ["/api/admin/travelers"],
  });

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
            <TabsTrigger value="agents">Agent Management</TabsTrigger>
            <TabsTrigger value="travelers">Traveler Management</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
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
                      email: "sarah@felimark.com",
                      status: "online",
                      assigned: 12,
                      rating: 4.9,
                      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
                    },
                    {
                      name: "Michael Brown",
                      email: "michael@felimark.com", 
                      status: "online",
                      assigned: 8,
                      rating: 4.7,
                      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
                    },
                    {
                      name: "Lisa Chen",
                      email: "lisa@felimark.com",
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
        </Tabs>
      </main>
    </div>
  );
}