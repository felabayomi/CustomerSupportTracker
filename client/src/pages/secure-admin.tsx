import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Settings, Shield, Key, Download, Copy, RefreshCw, Users, BarChart3, Search, CheckCircle, XCircle, Ban } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function SecureAdmin() {
  const [passcode, setPasscode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState<any[]>([]);
  const [generateCount, setGenerateCount] = useState(10);
  const [codeToValidate, setCodeToValidate] = useState("");
  const [validationResult, setValidationResult] = useState<any>(null);
  const [recentActivity] = useState([
    { type: 'validation', action: 'Code validated successfully', code: '3Q6-HLN-9GM-1BF', timestamp: '2 minutes ago' },
    { type: 'generation', action: 'Generated batch of 5 codes', code: 'Batch #247', timestamp: '15 minutes ago' },
    { type: 'deactivation', action: 'Code deactivated', code: '7X2-PLK-4RT-9YZ', timestamp: '1 hour ago' },
  ]);
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

  const validateAccessCode = async () => {
    if (!codeToValidate.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/verify-access-code', { code: codeToValidate.trim() });
      const result = await response.json();
      
      setValidationResult(result);
      
      toast({
        title: result.isValid ? "Valid Code" : "Invalid Code",
        description: result.isValid 
          ? `Code belongs to ${result.user?.name}` 
          : "This access code is not valid",
        variant: result.isValid ? "default" : "destructive"
      });
    } catch (error) {
      setValidationResult({ isValid: false });
      toast({
        title: "Validation Error",
        description: "Failed to validate access code",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deactivateCode = async (code: string) => {
    try {
      await apiRequest('POST', '/api/admin/deactivate-code', { code });
      
      setValidationResult(null);
      setCodeToValidate("");
      
      toast({
        title: "Code Deactivated",
        description: "Access code has been successfully deactivated",
      });
    } catch (error) {
      toast({
        title: "Deactivation Failed",
        description: "Failed to deactivate access code",
        variant: "destructive"
      });
    }
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
                onClick={() => setLocation("/admin/felixdgreat/console")}
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
                <CardTitle>Code Validation Tool</CardTitle>
                <p className="text-sm text-slate-600">Verify access codes, check their status, and view usage details</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="validateCode">Enter Access Code</Label>
                    <div className="flex space-x-2 mt-1">
                      <Input
                        id="validateCode"
                        placeholder="e.g., 3Q6-HLN-9GM-1BF"
                        value={codeToValidate}
                        onChange={(e) => setCodeToValidate(e.target.value)}
                        className="flex-1 font-mono"
                      />
                      <Button onClick={validateAccessCode} disabled={!codeToValidate.trim()}>
                        <Search className="h-4 w-4 mr-2" />
                        Validate
                      </Button>
                    </div>
                  </div>

                  {validationResult && (
                    <Card className={`border-2 ${validationResult.isValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              {validationResult.isValid ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-600" />
                              )}
                              <Badge 
                                variant={validationResult.isValid ? "default" : "destructive"}
                                className="font-mono"
                              >
                                {codeToValidate}
                              </Badge>
                              <span className={`text-sm font-medium ${validationResult.isValid ? 'text-green-700' : 'text-red-700'}`}>
                                {validationResult.isValid ? 'Valid Code' : 'Invalid Code'}
                              </span>
                            </div>
                            
                            {validationResult.isValid && validationResult.user && (
                              <div className="grid md:grid-cols-2 gap-4 mt-4">
                                <div>
                                  <h4 className="font-medium text-slate-900 mb-2">User Information</h4>
                                  <div className="space-y-1 text-sm">
                                    <p><span className="font-medium">Name:</span> {validationResult.user.name}</p>
                                    <p><span className="font-medium">Email:</span> {validationResult.user.email}</p>
                                    <p><span className="font-medium">Role:</span> {validationResult.user.role}</p>
                                    <p><span className="font-medium">User ID:</span> {validationResult.user.id}</p>
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="font-medium text-slate-900 mb-2">Code Details</h4>
                                  <div className="space-y-1 text-sm">
                                    <p><span className="font-medium">Status:</span> 
                                      <Badge variant="outline" className="ml-2">Active</Badge>
                                    </p>
                                    <p><span className="font-medium">Created:</span> {new Date().toLocaleDateString()}</p>
                                    <p><span className="font-medium">Last Used:</span> {validationResult.lastUsed || 'Never'}</p>
                                    <p><span className="font-medium">Usage Count:</span> {validationResult.usageCount || 0}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {!validationResult.isValid && (
                              <div className="mt-3">
                                <p className="text-sm text-red-600">
                                  This access code is not valid. It may have been:
                                </p>
                                <ul className="text-sm text-red-600 mt-1 ml-4 list-disc">
                                  <li>Entered incorrectly</li>
                                  <li>Expired or deactivated</li>
                                  <li>Never generated</li>
                                </ul>
                              </div>
                            )}
                          </div>
                          
                          {validationResult.isValid && (
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => copyToClipboard(codeToValidate)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => deactivateCode(codeToValidate)}
                              >
                                <Ban className="h-4 w-4 mr-1" />
                                Deactivate
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Code Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {activity.type === 'validation' ? (
                          <Search className="h-4 w-4 text-blue-500" />
                        ) : activity.type === 'generation' ? (
                          <Key className="h-4 w-4 text-green-500" />
                        ) : (
                          <Ban className="h-4 w-4 text-red-500" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-xs text-slate-500">{activity.timestamp}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="font-mono text-xs">
                        {activity.code}
                      </Badge>
                    </div>
                  ))}
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