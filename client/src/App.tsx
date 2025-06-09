import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AccessPortal from "@/pages/access-portal";
import Dashboard from "@/pages/dashboard";
import AgentDashboard from "@/pages/agent-dashboard";
import AdminConsole from "@/pages/admin-console";
import AdminSupportRequests from "@/pages/admin-support-requests";
import AdminTripManagement from "@/pages/admin-trip-management";
import SecureAdmin from "@/pages/secure-admin";
import PublicChatDemo from "@/pages/public-chat-demo";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={AccessPortal} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/agent-panel" component={AgentDashboard} />
      <Route path="/admin/felixdgreat" component={SecureAdmin} />
      <Route path="/admin/felixdgreat/console" component={AdminConsole} />
      <Route path="/admin/felixdgreat/support-requests" component={AdminSupportRequests} />
      <Route path="/admin/felixdgreat/trip-management" component={AdminTripManagement} />
      <Route path="/public-chat-demo" component={PublicChatDemo} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
