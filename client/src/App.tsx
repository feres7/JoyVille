import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useWebSocket } from "./hooks/use-websocket";
import Home from "@/pages/home";
import AdminDashboard from "@/pages/admin-dashboard";
import Retail from "@/pages/retail";
import Wholesale from "@/pages/wholesale";
import Checkout from "@/pages/checkout";
import Orders from "@/pages/orders";
import NavigationHeader from "@/components/navigation-header";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen gradient-bg">
      <NavigationHeader />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/retail" component={Retail} />
        <Route path="/wholesale" component={Wholesale} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/orders" component={Orders} />
        <Route path="/admin/dashboard" component={AdminDashboard} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WebSocketProvider />
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function WebSocketProvider() {
  useWebSocket();
  return null;
}

export default App;
