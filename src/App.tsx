import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import NotFound from "./pages/NotFound";

// Páginas de autenticação
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ResetPassword from "./pages/auth/ResetPassword";

// Páginas do app
import SuppliersList from "./pages/suppliers/SuppliersList";
import SupplierDetail from "./pages/suppliers/SupplierDetail";
import Profile from "./pages/profile/Profile";

// Páginas administrativas
import UsersManagement from "./pages/admin/UsersManagement";
import SuppliersManagement from "./pages/admin/SuppliersManagement";
import Reports from "./pages/admin/Reports";

const queryClient = new QueryClient();

// Mock para simulação de autenticação
const MOCK_AUTH = {
  isAuthenticated: true,
  isAdmin: false,
  hasSubscription: true
};

const App = () => {
  const [auth, setAuth] = useState(MOCK_AUTH);

  // Componente para rota protegida que requer autenticação
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!auth.isAuthenticated) {
      return <Navigate to="/auth/login" replace />;
    }
    return <>{children}</>;
  };

  // Componente para rota protegida que requer assinatura ativa
  const SubscriptionRoute = ({ children }: { children: React.ReactNode }) => {
    if (!auth.isAuthenticated) {
      return <Navigate to="/auth/login" replace />;
    }
    if (!auth.hasSubscription) {
      // Redirecionar para página de assinatura (a ser implementada)
      return <Navigate to="/subscription" replace />;
    }
    return <>{children}</>;
  };

  // Componente para rota protegida que requer privilégios de administrador
  const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    if (!auth.isAuthenticated || !auth.isAdmin) {
      return <Navigate to="/suppliers" replace />;
    }
    return <>{children}</>;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Redirecionamento da raiz */}
            <Route 
              path="/" 
              element={
                auth.isAuthenticated 
                  ? <Navigate to="/suppliers" replace /> 
                  : <Navigate to="/auth/login" replace />
              } 
            />
            
            {/* Rotas de autenticação */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            
            {/* Rotas de aplicativo protegidas (requerem assinatura) */}
            <Route 
              path="/suppliers" 
              element={
                <SubscriptionRoute>
                  <SuppliersList />
                </SubscriptionRoute>
              } 
            />
            <Route 
              path="/suppliers/:id" 
              element={
                <SubscriptionRoute>
                  <SupplierDetail />
                </SubscriptionRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            
            {/* Rotas administrativas */}
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <Navigate to="/admin/users" replace />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <AdminRoute>
                  <UsersManagement />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/suppliers" 
              element={
                <AdminRoute>
                  <SuppliersManagement />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/reports" 
              element={
                <AdminRoute>
                  <Reports />
                </AdminRoute>
              } 
            />
            
            {/* Rota de 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
