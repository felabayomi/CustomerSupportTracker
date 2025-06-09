import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, ExternalLink, MessageCircle, Globe, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function WidgetIntegration() {
  const [copied, setCopied] = useState(false);
  const [brandColor, setBrandColor] = useState("#3b82f6");
  const [companyName, setCompanyName] = useState("City Discoverer");
  const [position, setPosition] = useState("bottom-right");
  const { toast } = useToast();

  // Get the current domain
  const currentDomain = window.location.origin;

  const generateEmbedCode = () => {
    return `<!-- City Discoverer Chat Widget -->
<script 
  src="${currentDomain}/city-discoverer-chat.js"
  data-brand-color="${brandColor}"
  data-company-name="${companyName}"
  data-position="${position}"
  async
></script>
<!-- End City Discoverer Chat Widget -->`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateEmbedCode());
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "The widget code has been copied to your clipboard."
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the code manually.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Widget Integration
          </h1>
          <p className="text-gray-600">
            Add the City Discoverer chat widget to any website. All messages will appear in your Public Chat Inbox.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Widget Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Your Company Name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand-color">Brand Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="brand-color"
                      type="color"
                      value={brandColor}
                      onChange={(e) => setBrandColor(e.target.value)}
                      className="w-16 h-10 p-1 border"
                    />
                    <Input
                      value={brandColor}
                      onChange={(e) => setBrandColor(e.target.value)}
                      placeholder="#3b82f6"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <select
                    id="position"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="bottom-right">Bottom Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="top-right">Top Right</option>
                    <option value="top-left">Top Left</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Embed Code</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto border">
                    <code>{generateEmbedCode()}</code>
                  </pre>
                  <Button
                    onClick={copyToClipboard}
                    size="sm"
                    className="absolute top-2 right-2"
                    variant="outline"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  Add this code to any website's HTML, preferably before the closing &lt;/body&gt; tag.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Features and Instructions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium">Add to Website</h4>
                      <p className="text-sm text-gray-600">
                        Copy the embed code and add it to any website
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium">Visitors Chat</h4>
                      <p className="text-sm text-gray-600">
                        Website visitors see a chat widget with your welcome message
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium">Messages in Inbox</h4>
                      <p className="text-sm text-gray-600">
                        All conversations appear in your Public Chat Inbox
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                      4
                    </div>
                    <div>
                      <h4 className="font-medium">Respond in Real-Time</h4>
                      <p className="text-sm text-gray-600">
                        Reply from the inbox and visitors see your responses instantly
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Badge variant="secondary" className="justify-center p-2">
                    Real-time messaging
                  </Badge>
                  <Badge variant="secondary" className="justify-center p-2">
                    Auto-reconnection
                  </Badge>
                  <Badge variant="secondary" className="justify-center p-2">
                    Website detection
                  </Badge>
                  <Badge variant="secondary" className="justify-center p-2">
                    Customizable styling
                  </Badge>
                  <Badge variant="secondary" className="justify-center p-2">
                    5-min contact prompt
                  </Badge>
                  <Badge variant="secondary" className="justify-center p-2">
                    Mobile responsive
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full" 
                  onClick={() => window.open('/admin/felixdgreat/public-chat-inbox', '_blank')}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Open Public Chat Inbox
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open('/admin/felixdgreat/public-chat-demo', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Test Widget Demo
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Important Notes</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• The widget automatically detects the website URL where it's installed</li>
            <li>• All conversations are organized by website in your Public Chat Inbox</li>
            <li>• If no agent responds within 5 minutes, users are prompted for contact info</li>
            <li>• The widget works on any website that allows custom JavaScript</li>
          </ul>
        </div>
      </div>
    </div>
  );
}