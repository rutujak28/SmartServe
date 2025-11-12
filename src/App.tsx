import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import NotFound from "./pages/NotFound";
import ScanQR from "./pages/ScanQR";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import FoodItemDetail from "./pages/FoodItemDetail";
import Search from "./pages/Search";
import PaymentOptions from "./pages/PaymentOptions";
import PaymentFull from "./pages/PaymentFull";
import PaymentSplit from "./pages/PaymentSplit";
import PaymentSplitEqual from "./pages/PaymentSplitEqual";
import PaymentSplitCustom from "./pages/PaymentSplitCustom";
import PaymentProcessing from "./pages/PaymentProcessing";
import PaymentSuccess from "./pages/PaymentSuccess";
import OrderTracking from "./pages/OrderTracking";
import Feedback from "./pages/Feedback";
import ForgotPassword from "./pages/ForgotPassword";
import KitchenDashboard from "./pages/KitchenDashboard";
import FloatingChatButton from "./components/chat/FloatingChatButton";

// Admin Portal Pages
import AdminLogin from "./pages/admin/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import AdminOrders from "./pages/admin/Orders";
import Menu from "./pages/admin/Menu";
import Payments from "./pages/admin/Payments";
import Analytics from "./pages/admin/Analytics";
import Users from "./pages/admin/Users";
import FeedbackPage from "./pages/admin/FeedbackPage";
import AIInsights from "./pages/admin/AIInsights";
import Reports from "./pages/admin/Reports";
import AdminSettings from "./pages/admin/Settings";
import AuditLogs from "./pages/admin/AuditLogs";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
              <Routes>
                <Route path="/" element={<Navigate to="/scan/1" replace />} />
                <Route path="/scan/:tableId" element={<ScanQR />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/item/:itemId" element={<ProtectedRoute><FoodItemDetail /></ProtectedRoute>} />
                <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
                <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                <Route path="/payment" element={<ProtectedRoute><PaymentOptions /></ProtectedRoute>} />
                <Route path="/payment/full" element={<ProtectedRoute><PaymentFull /></ProtectedRoute>} />
                <Route path="/payment/split" element={<ProtectedRoute><PaymentSplit /></ProtectedRoute>} />
                <Route path="/payment/split/equal" element={<ProtectedRoute><PaymentSplitEqual /></ProtectedRoute>} />
                <Route path="/payment/split/custom" element={<ProtectedRoute><PaymentSplitCustom /></ProtectedRoute>} />
                <Route path="/payment/processing" element={<ProtectedRoute><PaymentProcessing /></ProtectedRoute>} />
                <Route path="/payment/success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
                <Route path="/orders/track/:orderId" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
                <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
                
                {/* Kitchen Display - Staff and Admin */}
                <Route path="/kitchen" element={<ProtectedRoute allowedRoles={['staff', 'admin']}><KitchenDashboard /></ProtectedRoute>} />
                
                {/* Admin Portal Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><Dashboard /></ProtectedRoute>} />
                <Route path="/admin/orders" element={<ProtectedRoute allowedRoles={['admin', 'staff']}><AdminOrders /></ProtectedRoute>} />
                <Route path="/admin/menu" element={<ProtectedRoute allowedRoles={['admin']}><Menu /></ProtectedRoute>} />
                <Route path="/admin/payments" element={<ProtectedRoute allowedRoles={['admin', 'staff']}><Payments /></ProtectedRoute>} />
                <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['admin']}><Analytics /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><Users /></ProtectedRoute>} />
                <Route path="/admin/feedback" element={<ProtectedRoute allowedRoles={['admin']}><FeedbackPage /></ProtectedRoute>} />
                <Route path="/admin/ai-insights" element={<ProtectedRoute allowedRoles={['admin']}><AIInsights /></ProtectedRoute>} />
                <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin', 'staff']}><Reports /></ProtectedRoute>} />
                <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><AdminSettings /></ProtectedRoute>} />
                <Route path="/admin/audit-logs" element={<ProtectedRoute allowedRoles={['admin']}><AuditLogs /></ProtectedRoute>} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
                <FloatingChatButton />
              </BrowserRouter>
            </TooltipProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
