
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
import LandingPage from "./pages/LandingPage";

// Páginas de autenticação
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ResetPassword from "./pages/auth/ResetPassword";
import ResetConfirmation from "./pages/auth/ResetConfirmation";
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

// Configuração do React Query
import { defaultQueryOptions } from "./lib/react-query-config";

const queryClient = new QueryClient({
  defaultOptions: defaultQueryOptions,
});

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
  const { user, isInitializing } = useAuth();
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    isAdmin: false,
    hasSubscription: true
  });
  
  // Efeito para verificar o status de autenticação baseado no user do AuthProvider
  useEffect(() => {
    // Somente atualizar o estado de auth quando a inicialização estiver completa
    if (!isInitializing) {
      if (user) {
        setAuth({
          isAuthenticated: true,
          isAdmin: user.role === 'admin',
          hasSubscription: user.subscription_status === 'active' || true // Temporariamente considerando todos como tendo assinatura
        });
        console.log('Auth state atualizado: usuário autenticado');
      } else {
        setAuth({
          isAuthenticated: false,
          isAdmin: false,
          hasSubscription: true
        });
        console.log('Auth state atualizado: sem usuário');
      }
    }
  }, [user, isInitializing]);

  // Loading state durante inicialização
  if (isInitializing) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-brand.dark">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
      </div>
    );
  }

  // Componente para rota protegida que requer autenticação
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!auth.isAuthenticated) {
      console.log('Redirecionando rota protegida para login');
      return <Navigate to="/auth/login" replace />;
    }
    return <>{children}</>;
  };

  // Componente para rota protegida que requer assinatura ativa
  const SubscriptionRoute = ({ children }: { children: React.ReactNode }) => {
    if (!auth.isAuthenticated) {
      console.log('Redirecionando rota de assinatura para login');
      return <Navigate to="/auth/login" replace />;
    }
    if (!auth.hasSubscription) {
      // Redirecionar para página de assinatura (a ser implementada)
      console.log('Redirecionando para assinatura');
      return <Navigate to="/subscription" replace />;
    }
    return <>{children}</>;
  };

  // Componente para rota protegida que requer privilégios de administrador
  const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    if (!auth.isAuthenticated || !auth.isAdmin) {
      console.log('Redirecionando rota admin: usuário não é admin');
      return <Navigate to="/suppliers" replace />;
    }
    return <>{children}</>;
  };

  // Componente para rotas públicas que devem redirecionar usuários já logados
  const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
    if (auth.isAuthenticated) {
      console.log('Redirecionando rota pública: usuário já está logado');
      return <Navigate to="/home" replace />;
    }
    return <>{children}</>;
  };

  return (
    <Routes>
      {/* Landing page como rota principal */}
      <Route path="/" element={<LandingPage />} />
      
      {/* Home page ao logar */}
      <Route 
        path="/home" 
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } 
      />
      
      {/* Rotas de autenticação - apenas para usuários não autenticados */}
      <Route path="/auth/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path="/auth/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
      <Route path="/auth/reset-password" element={<PublicOnlyRoute><ResetPassword /></PublicOnlyRoute>} />
      <Route path="/auth/reset-confirmation" element={<PublicOnlyRoute><ResetConfirmation /></PublicOnlyRoute>} />
      <Route path="/auth/payment" element={<Payment />} />
      
      {/* Fornecedores */}
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
      
      {/* Perfil */}
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
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
      
      {/* Artigos (requerem assinatura) */}
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
