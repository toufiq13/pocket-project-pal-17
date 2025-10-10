import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AIChatWidget } from "@/components/AIChatWidget";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import RoomPlanner from "./pages/RoomPlanner";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/room-planner" element={<RoomPlanner />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <AIChatWidget />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;