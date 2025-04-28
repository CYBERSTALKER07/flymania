import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/layout";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Home from "@/pages/Home";
import Auth from "@/pages/Auth";
import SellTicket from "@/pages/SellTicket";
import SoldTickets from "@/pages/SoldTickets";
import AdminDashboard from "@/pages/AdminDashboard";
import SalesReports from "@/pages/SalesReports";
import OperatorPerformance from "@/pages/OperatorPerformance";
import PaymentsTracker from "@/pages/PaymentsTracker";
import AdvancedAnalytics from "@/pages/AdvancedAnalytics";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import PrepaidPage from "@/pages/PrepaidPage";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CreateAgentForm } from "@/components/admin/CreateAgentForm";
import Expenses from "@/pages/Expenses";
import ConsumptionsPage from "@/pages/ConsumptionsPage";

const queryClient = new QueryClient();

const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
};

const ProtectedRoute = ({ children, requiresAdmin = false }: { children: React.ReactNode, requiresAdmin?: boolean }) => {
  const { user, loading } = useAuth();
  const isAdmin = user?.email === "cyerstalekr@gmail.com";
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" />;
  }
  
  // Remove this check to allow all users to access admin pages
  // if (requiresAdmin && !isAdmin) {
  //   return <Navigate to="/" />;
  // }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/auth" element={
                <PageWrapper>
                  <Auth />
                </PageWrapper>
              } />
              <Route element={<Layout />}>
                <Route path="/" element={
                  <ProtectedRoute>
                    <PageWrapper>
                      <Home />
                    </PageWrapper>
                  </ProtectedRoute>
                } />
                <Route path="/sell-ticket/*" element={
                  <ProtectedRoute>
                    <PageWrapper>
                      <SellTicket />
                    </PageWrapper>
                  </ProtectedRoute>
                } />
                <Route path="/sell-ticket/prepaid" element={
                  <ProtectedRoute>
                    <PageWrapper>
                      <PrepaidPage />
                    </PageWrapper>
                  </ProtectedRoute>
                } />
                <Route path="/sold-tickets" element={
                  <ProtectedRoute>
                    <PageWrapper>
                      <SoldTickets />
                    </PageWrapper>
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute requiresAdmin={true}>
                    <PageWrapper>
                      <AdminDashboard />
                    </PageWrapper>
                  </ProtectedRoute>
                } />
                <Route path="/sales-reports" element={
                  <ProtectedRoute>
                    <PageWrapper>
                      <SalesReports />
                    </PageWrapper>
                  </ProtectedRoute>
                } />
                <Route path="/operator-performance" element={
                  <ProtectedRoute>
                    <PageWrapper>
                      <OperatorPerformance />
                    </PageWrapper>
                  </ProtectedRoute>
                } />
                <Route path="/payments-tracker" element={
                  <ProtectedRoute>
                    <PageWrapper>
                      <PaymentsTracker />
                    </PageWrapper>
                  </ProtectedRoute>
                } />
                <Route path="/advanced-analytics" element={
                  <ProtectedRoute requiresAdmin={true}>
                    <PageWrapper>
                      <AdvancedAnalytics />
                    </PageWrapper>
                  </ProtectedRoute>
                } />
                <Route path="/expenses" element={
                  <ProtectedRoute>
                    <PageWrapper>
                      <Expenses />
                    </PageWrapper>
                  </ProtectedRoute>
                } />
                <Route path="/consumptions" element={
                  <ProtectedRoute>
                    <PageWrapper>
                      <ConsumptionsPage />
                    </PageWrapper>
                  </ProtectedRoute>
                } />
              </Route>
              <Route path="*" element={
                <PageWrapper>
                  <NotFound />
                </PageWrapper>
              } />
            </Routes>
          </AnimatePresence>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
