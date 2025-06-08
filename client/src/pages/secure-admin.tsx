import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Settings, Shield, Key, Download, Copy, RefreshCw, Users, BarChart3 } from "lucide-react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function SecureAdmin() {
  const [passcode, setPasscode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState<any[]>([]);
  const [generateCount, setGenerateCount] = useState(10);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === "19770520$&?") {
      setIsAuthenticated(true);
      toast({
        title: "Admin Access Granted",
        description: "Welcome to the secure admin portal.",
      });
    } else {
      toast({
        title: "Access Denied",
        description: "Invalid passcode.",
        variant: "destructive",
      });
    }
  };

  const generateAccessCodes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/generate-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: generateCount })
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedCodes(data.codes);
        toast({
          title: "Codes Generated",
          description: `Successfully generated ${data.codes.length} access codes.`,
        });
      }
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Unable to generate access codes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Access code copied to clipboard.",
    });
  };

  const exportCodes = () => {
    const csvContent = "Access Code,User ID,Created At,Expires At\n" + 
      generatedCodes.map(code => 
        `${code.code},${code.userId},${code.createdAt},${code.expiresAt || 'Never'}`
      ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `access-codes-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-gray-900 to-black flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,0,0,0.1)_0%,transparent_50%)] pointer-events-none"></div>
        
        <Card className="w-full max-w-md bg-black/40 backdrop-blur-xl border-red-500/20 shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              Secure Admin Portal
            </CardTitle>
            <p className="text-red-200">FELIMARK Administration</p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">
                  Admin Passcode
                </label>
                <Input
                  type="password"
                  placeholder="Enter secure passcode"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="bg-white/10 border-red-500/30 text-white placeholder:text-gray-400 h-12"
                  autoComplete="off"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-semibold"
              >
                <Settings className="h-4 w-4 mr-2" />
                Access Admin Panel
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/30">
                <Shield className="h-3 w-3 mr-1" />
                Restricted Access
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-red-600 shadow-lg border-b border-red-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <Shield className="text-red-600 text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">Secure Admin Portal</h1>
                <p className="text-xs text-red-100">Code Management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge className="bg-green-100 text-green-800 border-green-200">
                Authenticated
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setLocation("/admin-console")}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Admin Console
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs defaultValue="generate" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="generate">Generate Codes</TabsTrigger>
            <TabsTrigger value="manage">Manage Codes</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="generate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Key className="h-5 w-5" />
                  <span>Access Code Generator</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-slate-700">
                      Number of Codes to Generate
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="1000"
                      value={generateCount}
                      onChange={(e) => setGenerateCount(parseInt(e.target.value) || 1)}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={generateAccessCodes} disabled={isLoading}>
                      {isLoading ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Key className="h-4 w-4 mr-2" />
                      )}
                      Generate Codes
                    </Button>
                    {generatedCodes.length > 0 && (
                      <Button variant="outline" onClick={exportCodes}>
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                      </Button>
                    )}
                  </div>
                </div>

                {generatedCodes.length > 0 && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle className="text-lg">Generated Access Codes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-64">
                        <div className="space-y-2">
                          {generatedCodes.map((code, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center space-x-4">
                                <Badge variant="outline" className="font-mono text-lg">
                                  {code.code}
                                </Badge>
                                <div className="text-sm text-slate-600">
                                  <p>User ID: {code.userId}</p>
                                  <p>Created: {new Date(code.createdAt).toLocaleString()}</p>
                                </div>
                              </div>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => copyToClipboard(code.code)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="manage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Code Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Manage existing access codes, view usage statistics, and deactivate codes.</p>
                <div className="mt-4 p-4 bg-slate-100 rounded-lg">
                  <p className="text-sm text-slate-500">Code management features coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Total Codes Generated</p>
                      <p className="text-2xl font-semibold text-slate-900">2,847</p>
                    </div>
                    <Key className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Active Sessions</p>
                      <p className="text-2xl font-semibold text-slate-900">156</p>
                    </div>
                    <Users className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Success Rate</p>
                      <p className="text-2xl font-semibold text-slate-900">98.2%</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-purple-500" />
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