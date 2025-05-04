
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider } from "@/hooks/useAuth";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
import LandingPage from "./pages/LandingPage";

// Páginas de autenticação
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ResetPassword from "./pages/auth/ResetPassword";
import Payment from "./pages/auth/Payment";

// Páginas do app
import SuppliersList from "./pages/suppliers/SuppliersList";
import SupplierDetail from "./pages/suppliers/SupplierDetail";
import Profile from "./pages/profile/Profile";
import Favorites from "./pages/favorites/Favorites";
import SearchPage from "./pages/search/SearchPage";
import ArticlesPage from "./pages/articles/ArticlesPage";
import ArticleDetailPage from "./pages/articles/ArticleDetailPage";
import NotificationsPage from "./pages/notifications/NotificationsPage";
import NotificationDetailPage from "./pages/notifications/NotificationDetailPage";

// Páginas administrativas
import UsersManagement from "./pages/admin/UsersManagement";
import SuppliersManagement from "./pages/admin/SuppliersManagement";
import SuppliersBulkUpload from "./pages/admin/SuppliersBulkUpload";
import NotificationsManagement from "./pages/admin/NotificationsManagement";
import Reports from "./pages/admin/Reports";
import ArticlesManagement from "./pages/admin/ArticlesManagement";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

// Componente separado para rotas para usar o AuthProvider
const AppRoutes = () => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    isAdmin: false,
    hasSubscription: true
  });
  
  // Efeito para verificar o status de autenticação no sessionStorage
  useEffect(() => {
    const checkAuthStatus = () => {
      const userRole = sessionStorage.getItem('user_role');
      
      if (userRole) {
        setAuth({
          isAuthenticated: true,
          isAdmin: userRole === 'admin',
          hasSubscription: true  // Mantendo a assinatura como true para esse exemplo
        });
      } else {
        setAuth({
          isAuthenticated: false,
          isAdmin: false,
          hasSubscription: true
        });
      }
    };
    
    // Verificar status inicial
    checkAuthStatus();
    
    // Escutar mudanças no sessionStorage
    const handleStorageChange = () => {
      checkAuthStatus();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

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
    <Routes>
      {/* Landing page como rota principal */}
      <Route path="/" element={<LandingPage />} />
      
      {/* Home page redirects to suppliers when authenticated */}
      <Route 
        path="/home" 
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
      <Route path="/auth/payment" element={<Payment />} />
      
      {/* Rotas de aplicativo protegidas (requerem assinatura) */}
      <Route 
        path="/home" 
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/suppliers" 
        element={
          <ProtectedRoute>
            <SuppliersList />
          </ProtectedRoute>
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
      
       {/* Fornecedores */}
      <Route 
        path="/suppliers" 
        element={
          <ProtectedRoute>
            <SuppliersList />
          </ProtectedRoute>
        } 
      />
      
      {/* Página de favoritos */}
      <Route 
        path="/favorites" 
        element={
          <ProtectedRoute>
            <Favorites />
          </ProtectedRoute>
        } 
      />
      
      {/* Página de busca */}
      <Route 
        path="/search" 
        element={
          <ProtectedRoute>
            <SearchPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Notificações */}
      <Route 
        path="/notifications" 
        element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/notifications/:id" 
        element={
          <ProtectedRoute>
            <NotificationDetailPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Novas rotas para artigos (requerem assinatura) */}
      <Route 
        path="/articles" 
        element={
          <SubscriptionRoute>
            <ArticlesPage />
          </SubscriptionRoute>
        } 
      />
      <Route 
        path="/articles/:id" 
        element={
          <SubscriptionRoute>
            <ArticleDetailPage />
          </SubscriptionRoute>
        } 
      />
      
      {/* Configurações */}
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <Home />
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
        path="/admin/suppliers/bulk-upload" 
        element={
          <AdminRoute>
            <SuppliersBulkUpload />
          </AdminRoute>
        } 
      />
      <Route 
        path="/admin/notifications" 
        element={
          <AdminRoute>
            <NotificationsManagement />
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
      <Route 
        path="/admin/articles" 
        element={
          <AdminRoute>
            <ArticlesManagement />
          </AdminRoute>
        } 
      />
      
      {/* Rota de 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
