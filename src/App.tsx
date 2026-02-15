import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { handleApiError, shouldRetry } from "@/lib/error-handler";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Sender pages
import SenderDashboard from "./pages/sender/SenderDashboard";
import CreateRemittance from "./pages/sender/CreateRemittance";
import RemittanceDetail from "./pages/sender/RemittanceDetail";
import SenderHistory from "./pages/sender/SenderHistory";
import PendingApprovals from "./pages/sender/PendingApprovals";

// Recipient pages
import RecipientLogin from "./pages/recipient/RecipientLogin";
import RecipientHome from "./pages/recipient/RecipientHome";
import RequestPayment from "./pages/recipient/RequestPayment";
import PaymentStatus from "./pages/recipient/PaymentStatus";
import RecipientHistory from "./pages/recipient/RecipientHistory";

// Shared pages
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";

// Configure React Query with global error handling and retry logic
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry retryable errors (503, 408, etc.) up to 3 times
      retry: (failureCount, error) => {
        if (failureCount >= 3) return false;
        return shouldRetry(error);
      },
      // Exponential backoff: 1s, 2s, 4s
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      // Don't refetch on window focus by default (can be overridden per query)
      refetchOnWindowFocus: false,
      // Stale time: 30 seconds
      staleTime: 30000,
    },
    mutations: {
      // Mutations don't retry by default (user-triggered actions)
      retry: false,
      // Global error handler for mutations
      onError: (error) => {
        // Handle error with centralized handler (shows toast, etc.)
        handleApiError(error, {
          showToast: true,
          context: 'Mutation',
        });
      },
    },
  },
});

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
          <Route path="/sender/approvals" element={<PendingApprovals />} />
          
          {/* Recipient Routes */}
          <Route path="/recipient/login" element={<RecipientLogin />} />
          <Route path="/recipient" element={<RecipientHome />} />
          <Route path="/recipient/request" element={<RequestPayment />} />
          <Route path="/recipient/payment-status" element={<PaymentStatus />} />
          <Route path="/recipient/history" element={<RecipientHistory />} />
          
          {/* Shared Routes */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
