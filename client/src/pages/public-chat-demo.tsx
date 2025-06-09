import { PublicChatWidget } from "@/components/public-chat-widget";

export default function PublicChatDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              City Discoverer
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Discover Amazing Urban Adventures and City Experiences
            </p>
            <div className="grid md:grid-cols-3 gap-8 text-left">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-3">National Parks</h3>
                <p className="text-gray-600">Explore stunning landscapes and wildlife in America's most beautiful national parks.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-3">City Adventures</h3>
                <p className="text-gray-600">Experience vibrant cities with guided tours, local cuisine, and cultural attractions.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-3">Custom Journeys</h3>
                <p className="text-gray-600">Create personalized itineraries tailored to your interests and travel style.</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">Public Chat Widget Demo</h2>
            <p className="text-gray-600 mb-6">
              This page demonstrates the public chat widget that can be embedded on any website. 
              The widget allows visitors to chat with support agents without requiring authentication.
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Try it out:</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Click the blue chat button in the bottom right corner</li>
                <li>Ask about pricing, trips, or contact information</li>
                <li>Get instant responses from our AI support agent</li>
                <li>Minimize/maximize the chat window as needed</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Embed This Widget</h2>
            <p className="text-gray-600 mb-4">
              Copy and paste this code into any website to add the chat widget:
            </p>
            
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono overflow-x-auto">
              <pre>{`<!-- Expedition America Chat Widget -->
<div id="expedition-chat"></div>
<script>
(function() {
  // Load React and required dependencies
  const reactScript = document.createElement('script');
  reactScript.src = 'https://unpkg.com/react@18/umd/react.production.min.js';
  reactScript.onload = function() {
    const reactDomScript = document.createElement('script');
    reactDomScript.src = 'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js';
    reactDomScript.onload = function() {
      // Chat widget configuration
      window.ExpeditionChatConfig = {
        companyName: 'Expedition America',
        agentName: 'Travel Specialist',
        brandColor: '#3b82f6',
        welcomeMessage: 'Hi! How can we help you plan your next adventure?'
      };
      
      // Load the chat widget
      const widgetScript = document.createElement('script');
      widgetScript.src = '${window.location.origin}/chat-widget.js';
      document.head.appendChild(widgetScript);
    };
    document.head.appendChild(reactDomScript);
  };
  document.head.appendChild(reactScript);
})();
</script>`}</pre>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Customization Options:</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p><code>companyName</code> - Your company name</p>
                <p><code>agentName</code> - Display name for support agents</p>
                <p><code>brandColor</code> - Primary color for the widget</p>
                <p><code>welcomeMessage</code> - First message shown to visitors</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* The actual public chat widget */}
      <PublicChatWidget
        companyName="Expedition America"
        agentName="Travel Specialist"
        brandColor="#3b82f6"
        welcomeMessage="Hi! How can we help you plan your next adventure?"
      />
    </div>
  );
}