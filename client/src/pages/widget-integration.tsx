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
<script>
(function() {
  // Widget configuration
  const config = {
    brandColor: "${brandColor}",
    companyName: "${companyName}",
    position: "${position}",
    serverUrl: "${currentDomain}"
  };

  // Create widget container
  const widgetContainer = document.createElement('div');
  widgetContainer.id = 'city-discoverer-chat-widget';
  
  // Apply positioning styles
  const positions = {
    'bottom-right': 'bottom: 20px; right: 20px;',
    'bottom-left': 'bottom: 20px; left: 20px;',
    'top-right': 'top: 20px; right: 20px;',
    'top-left': 'top: 20px; left: 20px;'
  };
  
  widgetContainer.style.cssText = \`
    position: fixed;
    \${positions[config.position] || positions['bottom-right']}
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  \`;

  // Widget HTML
  widgetContainer.innerHTML = \`
    <div id="chat-toggle" style="
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: \${config.brandColor};
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: all 0.3s ease;
    ">
      <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
      </svg>
    </div>
    
    <div id="chat-window" style="
      position: absolute;
      bottom: 70px;
      right: 0;
      width: 350px;
      height: 500px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.12);
      display: none;
      flex-direction: column;
      overflow: hidden;
    ">
      <div style="
        background: \${config.brandColor};
        color: white;
        padding: 16px;
        font-weight: 600;
      ">
        Chat with \${config.companyName}
      </div>
      
      <div id="messages" style="
        flex: 1;
        padding: 16px;
        overflow-y: auto;
        background: #f8f9fa;
      "></div>
      
      <div style="
        padding: 16px;
        border-top: 1px solid #e9ecef;
        background: white;
      ">
        <div style="display: flex; gap: 8px;">
          <input 
            type="text" 
            id="message-input" 
            placeholder="Type your message..."
            style="
              flex: 1;
              padding: 8px 12px;
              border: 1px solid #ddd;
              border-radius: 20px;
              outline: none;
            "
          />
          <button 
            id="send-btn"
            style="
              background: \${config.brandColor};
              color: white;
              border: none;
              border-radius: 50%;
              width: 40px;
              height: 40px;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
            "
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  \`;

  // Add to page when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => document.body.appendChild(widgetContainer));
  } else {
    document.body.appendChild(widgetContainer);
  }

  // Widget functionality
  setTimeout(() => {
    const toggle = document.getElementById('chat-toggle');
    const window = document.getElementById('chat-window');
    const input = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    const messages = document.getElementById('messages');
    
    let isOpen = false;
    let sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    let websocket = null;

    // Toggle chat window
    toggle.addEventListener('click', () => {
      isOpen = !isOpen;
      window.style.display = isOpen ? 'flex' : 'none';
      
      if (isOpen && !websocket) {
        connectWebSocket();
        showWelcomeMessage();
      }
    });

    // Connect WebSocket with fallback
    function connectWebSocket() {
      try {
        const protocol = config.serverUrl.includes('https') ? 'wss:' : 'ws:';
        const host = config.serverUrl.replace(/^https?:\\/\\//, '');
        const wsUrl = \`\${protocol}//\${host}/public-ws\`;
        
        console.log('Attempting WebSocket connection to:', wsUrl);
        websocket = new WebSocket(wsUrl);
        
        let connectionTimeout = setTimeout(() => {
          if (websocket.readyState === WebSocket.CONNECTING) {
            websocket.close();
            useHttpFallback();
          }
        }, 5000);
        
        websocket.onopen = () => {
          clearTimeout(connectionTimeout);
          console.log('WebSocket connected successfully');
          websocket.send(JSON.stringify({
            type: 'join_public_chat',
            sessionId: sessionId,
            websiteUrl: window.location.hostname
          }));
        };
        
        websocket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'agent_message') {
              addMessage(data.message, 'agent', data.agentName);
            }
          } catch (e) {
            console.error('Error parsing WebSocket message:', e);
          }
        };
        
        websocket.onerror = (error) => {
          clearTimeout(connectionTimeout);
          console.error('WebSocket error:', error);
          useHttpFallback();
        };
        
        websocket.onclose = (event) => {
          clearTimeout(connectionTimeout);
          console.log('WebSocket closed:', event.code, event.reason);
          
          if (isOpen && event.code !== 1000) {
            setTimeout(() => {
              if (isOpen) {
                connectWebSocket();
              }
            }, 3000);
          }
        };
        
      } catch (error) {
        console.error('WebSocket connection failed:', error);
        useHttpFallback();
      }
    }
    
    // HTTP fallback for messaging
    function useHttpFallback() {
      console.log('Using HTTP fallback for messaging');
      addMessage('Connected via HTTP. You can send messages normally.', 'system');
    }
    
    // Send message via HTTP when WebSocket fails
    function sendMessageHttp(message) {
      fetch(\`\${config.serverUrl}/api/public-chat/message\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionId,
          message: message,
          websiteUrl: window.location.hostname
        })
      }).then(response => {
        if (response.ok) {
          // Poll for agent responses
          pollForResponses();
        }
      }).catch(error => {
        console.error('HTTP message send failed:', error);
        addMessage('Message could not be sent. Please try again.', 'system');
      });
    }
    
    // Poll for agent responses when using HTTP fallback
    function pollForResponses() {
      if (!isOpen || (websocket && websocket.readyState === WebSocket.OPEN)) return;
      
      fetch(\`\${config.serverUrl}/api/public-chat/messages/\${sessionId}\`)
        .then(response => response.json())
        .then(data => {
          if (data.messages) {
            // Show new agent messages
            data.messages.forEach(msg => {
              if (msg.sender === 'agent' && !document.querySelector(\`[data-msg-id="\${msg.id}"]\`)) {
                addMessage(msg.message, 'agent', msg.agentName);
              }
            });
          }
          
          // Continue polling
          setTimeout(pollForResponses, 2000);
        })
        .catch(error => {
          console.error('Polling failed:', error);
          setTimeout(pollForResponses, 5000);
        });
    }

    // Show welcome message
    function showWelcomeMessage() {
      addMessage("I can help you discover cities, build smart itineraries, and even book flights, hotels, or car rentals with exclusive agency discounts. Whether you're exploring locally or going global—I'm here to make travel easy. How can I assist you today?", 'agent', 'City Discoverer');
    }

    // Add message to chat
    function addMessage(text, sender, agentName = null) {
      const messageDiv = document.createElement('div');
      let styles = '';
      
      if (sender === 'user') {
        styles = 'background: ' + config.brandColor + '; color: white; margin-left: auto; text-align: right;';
      } else if (sender === 'system') {
        styles = 'background: #fee; color: #c53030; margin: 0 auto; text-align: center; font-size: 14px; border: 1px solid #fbb;';
      } else {
        styles = 'background: white; color: #333; margin-right: auto; border: 1px solid #e9ecef;';
      }
      
      messageDiv.style.cssText = \`
        margin-bottom: 12px;
        padding: 8px 12px;
        border-radius: 12px;
        max-width: 80%;
        \${styles}
      \`;
      
      if (sender === 'agent' && agentName) {
        messageDiv.innerHTML = \`<div style="font-size: 12px; opacity: 0.7; margin-bottom: 4px;">\${agentName}</div>\${text}\`;
      } else {
        messageDiv.textContent = text;
      }
      
      // Add message ID for tracking
      if (arguments[3]) {
        messageDiv.setAttribute('data-msg-id', arguments[3]);
      }
      
      messages.appendChild(messageDiv);
      messages.scrollTop = messages.scrollHeight;
    }

    // Send message
    function sendMessage() {
      const text = input.value.trim();
      if (!text) return;
      
      addMessage(text, 'user');
      input.value = '';
      
      if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.send(JSON.stringify({
          type: 'public_chat_message',
          sessionId: sessionId,
          message: text,
          websiteUrl: window.location.hostname
        }));
      } else {
        // Use HTTP fallback
        sendMessageHttp(text);
      }
    }

    // Event listeners
    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  }, 100);
})();
</script>
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
                  Add this complete script to any website's HTML, preferably before the closing &lt;/body&gt; tag. No external files needed - everything is self-contained and will connect directly to your Public Chat Inbox.
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