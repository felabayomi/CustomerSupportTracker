import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, MessageCircle, AlertTriangle, CheckCircle, Clock, MapPin, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function AgentDashboard() {
  const { data: assignedTravelers } = useQuery({
    queryKey: ["/api/agent/assigned-travelers"],
  });

  const { data: activeSupport } = useQuery({
    queryKey: ["/api/agent/active-support"],
  });

  const { data: agentStats } = useQuery({
    queryKey: ["/api/agent/stats"],
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                <User className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Agent Dashboard</h1>
                <p className="text-xs text-slate-500">Concierge Panel</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Online
              </Badge>
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face" alt="Agent" />
                  <AvatarFallback>SA</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-slate-700">
                  Sarah Anderson
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
                  <p className="text-sm text-slate-600">Assigned Travelers</p>
                  <p className="text-2xl font-semibold text-slate-900">12</p>
                </div>
                <User className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Active Trips</p>
                  <p className="text-2xl font-semibold text-slate-900">8</p>
                </div>
                <MapPin className="h-8 w-8 text-secondary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Open Requests</p>
                  <p className="text-2xl font-semibold text-slate-900">3</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Satisfaction</p>
                  <p className="text-2xl font-semibold text-slate-900">4.9</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="travelers" className="space-y-6">
          <TabsList>
            <TabsTrigger value="travelers">My Travelers</TabsTrigger>
            <TabsTrigger value="support">Active Support</TabsTrigger>
            <TabsTrigger value="schedule">Today's Schedule</TabsTrigger>
          </TabsList>
          
          <TabsContent value="travelers" className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-6">
              {[
                {
                  name: "Maya Chen",
                  trip: "San Francisco City Explorer",
                  status: "active",
                  location: "Golden Gate Bridge",
                  avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face",
                  unreadMessages: 2
                },
                {
                  name: "James Rodriguez",
                  trip: "New York Business Trip",
                  status: "active",
                  location: "Manhattan Hotel", 
                  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
                  unreadMessages: 0
                },
                {
                  name: "Emily Davis",
                  trip: "Chicago Food Tour",
                  status: "pending",
                  location: "O'Hare Airport",
                  avatar: "https://images.unsplash.com/photo-1494790108755-2616b9f90882?w=150&h=150&fit=crop&crop=face",
                  unreadMessages: 1
                }
              ].map((traveler, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={traveler.avatar} alt={traveler.name} />
                          <AvatarFallback>{traveler.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-slate-900">{traveler.name}</h3>
                          <p className="text-sm text-slate-600">{traveler.trip}</p>
                        </div>
                      </div>
                      <Badge 
                        variant={traveler.status === 'active' ? 'default' : 'secondary'}
                        className={traveler.status === 'active' ? 'bg-success' : ''}
                      >
                        {traveler.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-slate-600">
                        <MapPin className="h-4 w-4" />
                        <span>{traveler.location}</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          View Trip
                        </Button>
                        <Button size="sm" className="relative">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Chat
                          {traveler.unreadMessages > 0 && (
                            <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                              {traveler.unreadMessages}
                            </Badge>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="support" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Support Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {[
                      {
                        traveler: "Maya Chen",
                        issue: "Weather Update Request",
                        priority: "normal",
                        time: "10 minutes ago",
                        type: "info"
                      },
                      {
                        traveler: "James Rodriguez", 
                        issue: "Transportation Change",
                        priority: "high",
                        time: "25 minutes ago",
                        type: "urgent"
                      },
                      {
                        traveler: "Emily Davis",
                        issue: "Restaurant Recommendation",
                        priority: "low",
                        time: "1 hour ago", 
                        type: "request"
                      }
                    ].map((request, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            request.priority === 'high' ? 'bg-red-500' :
                            request.priority === 'normal' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}></div>
                          <div>
                            <p className="font-medium text-slate-900">{request.issue}</p>
                            <p className="text-sm text-slate-600">{request.traveler} • {request.time}</p>
                          </div>
                        </div>
                        <Button size="sm">Respond</Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Today's Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      time: "9:00 AM",
                      activity: "Check-in with Maya Chen",
                      type: "Golden Gate Bridge Tour prep",
                      status: "completed"
                    },
                    {
                      time: "11:00 AM", 
                      activity: "Support James Rodriguez",
                      type: "Flight modification assistance",
                      status: "in-progress"
                    },
                    {
                      time: "2:00 PM",
                      activity: "Emily Davis arrival",
                      type: "Airport pickup coordination",
                      status: "upcoming"
                    },
                    {
                      time: "4:00 PM",
                      activity: "Team check-in",
                      type: "Weekly agent meeting",
                      status: "upcoming"
                    }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Clock className="h-5 w-5 text-slate-500" />
                        <span className="font-medium text-slate-900">{item.time}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{item.activity}</p>
                        <p className="text-sm text-slate-600">{item.type}</p>
                      </div>
                      <Badge variant={
                        item.status === 'completed' ? 'default' :
                        item.status === 'in-progress' ? 'secondary' : 'outline'
                      }>
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}