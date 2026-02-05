import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Sender pages
import SenderDashboard from "./pages/sender/SenderDashboard";
import CreateRemittance from "./pages/sender/CreateRemittance";
import RemittanceDetail from "./pages/sender/RemittanceDetail";
import SenderHistory from "./pages/sender/SenderHistory";

// Recipient pages
import RecipientLogin from "./pages/recipient/RecipientLogin";
import RecipientHome from "./pages/recipient/RecipientHome";
import RequestPayment from "./pages/recipient/RequestPayment";
import PaymentStatus from "./pages/recipient/PaymentStatus";
import RecipientHistory from "./pages/recipient/RecipientHistory";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Landing / Role Selection */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />

          {/* Sender Routes */}
          <Route path="/sender" element={<SenderDashboard />} />
          <Route path="/sender/create" element={<CreateRemittance />} />
          <Route path="/sender/remittance/:id" element={<RemittanceDetail />} />
          <Route path="/sender/history" element={<SenderHistory />} />
          
          {/* Recipient Routes */}
          <Route path="/recipient/login" element={<RecipientLogin />} />
          <Route path="/recipient" element={<RecipientHome />} />
          <Route path="/recipient/request" element={<RequestPayment />} />
          <Route path="/recipient/payment-status" element={<PaymentStatus />} />
          <Route path="/recipient/history" element={<RecipientHistory />} />
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
