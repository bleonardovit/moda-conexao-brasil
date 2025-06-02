import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
import LandingPage from "./pages/LandingPage";
import LandingPageTest from "./pages/LandingPageTest";
import { TrackingScripts } from "./components/tracking/TrackingScripts";

// Páginas legais
import TermsOfService from "./pages/legal/TermsOfService";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import CookiePolicy from "./pages/legal/CookiePolicy";

// Páginas de autenticação
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ResetPassword from "./pages/auth/ResetPassword";
import ResetConfirmation from "./pages/auth/ResetConfirmation";
import Payment from "./pages/auth/Payment";
import SelectPlan from "./pages/auth/SelectPlan";

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
import TrackingSettings from "./pages/admin/TrackingSettings";
import SecurityMonitoring from "./pages/admin/SecurityMonitoring";

// Configuração do React Query
import { defaultQueryOptions } from "./lib/react-query-config";

// Imports para ExpiredTrialGate
import { useTrialStatus } from '@/hooks/use-trial-status';
import { AppLayout } from '@/components/layout/AppLayout';
import { TrialBanner } from '@/components/trial/TrialBanner';
import { FeatureLimitedAccess } from '@/components/trial/FeatureLimitedAccess';
import { Loader2 } from 'lucide-react';

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
              <TrackingScripts />
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
    hasSubscription: true // Note: This logic might need review for strict subscription checks
  });
  
  // Efeito para verificar o status de autenticação baseado no user do AuthProvider
  // Usando uma dependência memoizada para evitar execuções desnecessárias
  const userIdentifier = useMemo(() => user?.id, [user?.id]);
  
  useEffect(() => {
    // Somente atualizar o estado de auth quando a inicialização estiver completa
    if (!isInitializing) {
      if (user) {
        // Usando uma comparação de estado funcional para evitar atualizações desnecessárias
        setAuth(prevAuth => {
          if (prevAuth.isAuthenticated && prevAuth.isAdmin === (user.role === 'admin')) {
            // Estado não mudou, evitar re-renderização
            return prevAuth;
          }
          
          // Estado mudou, atualizar
          const newAuth = {
            isAuthenticated: true,
            isAdmin: user.role === 'admin',
            // Trial users are considered as having a subscription for routing purposes
            // They will have feature limitations applied at the component level
            hasSubscription: user.subscription_status === 'active' || user.trial_status === 'active' || true
          };
          console.log('Auth state atualizado: usuário autenticado');
          return newAuth;
        });
      } else {
        setAuth(prevAuth => {
          if (!prevAuth.isAuthenticated) {
            // Já está não-autenticado, evitar re-renderização
            return prevAuth;
          }
          
          // Estado mudou, atualizar
          console.log('Auth state atualizado: sem usuário');
          return {
            isAuthenticated: false,
            isAdmin: false,
            hasSubscription: true
          };
        });
      }
    }
  }, [userIdentifier, isInitializing, user]);

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
  
  // Novo componente para bloquear acesso se o trial expirou
  const ExpiredTrialGate = ({ children }: { children: React.ReactNode }) => {
    const { hasExpired, isVerified } = useTrialStatus();

    // Mostrar loading até que a verificação seja concluída
    if (!isVerified && auth.isAuthenticated) {
       return (
         <AppLayout>
            <div className="flex justify-center items-center h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
              <p className="ml-2 text-muted-foreground">Verificando status da sua conta...</p>
            </div>
         </AppLayout>
       );
    }

    // Só mostrar tela de trial expirado após verificação completa E se realmente expirou
    if (isVerified && hasExpired) {
      return (
        <AppLayout>
          <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <TrialBanner />
            <FeatureLimitedAccess
              title="Teste Gratuito Expirado"
              message="Seu período de teste gratuito expirou. Para continuar utilizando esta funcionalidade e ter acesso completo aos recursos, por favor, assine um de nossos planos."
              featureName="este recurso"
            />
          </div>
        </AppLayout>
      );
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
      return <Navigate to="/auth/select-plan" />; // Changed to select-plan
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
      
      {/* Nova rota para a Landing Page de Teste */}
      <Route path="/landing-test" element={<LandingPageTest />} />
      
      {/* Páginas legais - públicas */}
      <Route path="/legal/terms" element={<TermsOfService />} />
      <Route path="/legal/privacy" element={<PrivacyPolicy />} />
      <Route path="/legal/cookies" element={<CookiePolicy />} />
      
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
      <Route path="/auth/select-plan" element={<SelectPlan />} />
      <Route path="/auth/reset-password" element={<PublicOnlyRoute><ResetPassword /></PublicOnlyRoute>} />
      <Route path="/auth/reset-confirmation" element={<PublicOnlyRoute><ResetConfirmation /></PublicOnlyRoute>} />
      <Route path="/auth/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} /> {/* Payment should be protected */}
      
      {/* Fornecedores */}
      <Route 
        path="/suppliers" 
        element={
          <ProtectedRoute>
            <ExpiredTrialGate>
              <SuppliersList />
            </ExpiredTrialGate>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/suppliers/:id" 
        element={
          <ProtectedRoute>
            <ExpiredTrialGate>
              {/* SubscriptionRoute could still be here if non-trial users also need subscription */}
              <SubscriptionRoute> 
                <SupplierDetail />
              </SubscriptionRoute>
            </ExpiredTrialGate>
          </ProtectedRoute>
        } 
      />
      
      {/* Página de favoritos */}
      <Route 
        path="/favorites" 
        element={
          <ProtectedRoute>
            <ExpiredTrialGate>
              <Favorites />
            </ExpiredTrialGate>
          </ProtectedRoute>
        } 
      />
      
      {/* Página de busca */}
      <Route 
        path="/search" 
        element={
          <ProtectedRoute>
            <ExpiredTrialGate>
              <SearchPage />
            </ExpiredTrialGate>
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
          <ProtectedRoute>
            <ExpiredTrialGate>
               {/* SubscriptionRoute could still be here if non-trial users also need subscription */}
              <SubscriptionRoute>
                <ArticlesPage />
              </SubscriptionRoute>
            </ExpiredTrialGate>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/articles/:id" 
        element={
          <ProtectedRoute>
            <ExpiredTrialGate>
              {/* SubscriptionRoute could still be here if non-trial users also need subscription */}
              <SubscriptionRoute>
                <ArticleDetailPage />
              </SubscriptionRoute>
            </ExpiredTrialGate>
          </ProtectedRoute>
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
      {/* Nova rota para configurações de rastreamento */}
      <Route 
        path="/admin/tracking-settings" 
        element={
          <AdminRoute>
            <TrackingSettings />
          </AdminRoute>
        } 
      />
      
      {/* Nova rota para monitoramento de segurança */}
      <Route 
        path="/admin/security-monitoring" 
        element={
          <AdminRoute>
            <SecurityMonitoring />
          </AdminRoute>
        } 
      />
      
      {/* Rota de 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
