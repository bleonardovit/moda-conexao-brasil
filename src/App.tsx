
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { GlobalSEO } from "@/components/seo/GlobalSEO";
import { TrackingScripts } from "@/components/tracking/TrackingScripts";
import { SitemapGenerator } from "./components/sitemap/SitemapGenerator";
import { AdminRouteGuard } from "./components/auth/AdminRouteGuard";
import { AuthProvider } from "./hooks/useAuth";
import { GlobalErrorBoundary, QueryErrorBoundary } from "@/components/error-boundaries";
import { OptimizedSuspense } from "@/components/ui/optimized-suspense";
import { useWebVitals } from "@/hooks/useWebVitals";

// Import regular pages (these load immediately)
import Index from "./pages/Index";
import Home from "./pages/Home";
import LandingPage from "./pages/LandingPage";
import LandingPageTest from "./pages/LandingPageTest";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import SelectPlan from "./pages/auth/SelectPlan";
import Payment from "./pages/auth/Payment";
import ResetPassword from "./pages/auth/ResetPassword";
import ResetConfirmation from "./pages/auth/ResetConfirmation";
import Profile from "./pages/profile/Profile";
import SuppliersList from "./pages/suppliers/SuppliersList";
import SupplierDetail from "./pages/suppliers/SupplierDetail";
import Favorites from "./pages/favorites/Favorites";
import FavoritesList from "./pages/favorites/FavoritesList";
import ArticlesPage from "./pages/articles/ArticlesPage";
import ArticleDetailPage from "./pages/articles/ArticleDetailPage";
import { LimitedSearch } from "./pages/search/LimitedSearch";
import NotificationsPage from "./pages/notifications/NotificationsPage";
import NotificationDetailPage from "./pages/notifications/NotificationDetailPage";
import NotFound from "./pages/NotFound";

// Import legal pages
import TermsOfService from "./pages/legal/TermsOfService";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import CookiePolicy from "./pages/legal/CookiePolicy";

// Import lazy-loaded admin pages
import {
  LazyAdminDashboard,
  LazyUsersManagement,
  LazySuppliersManagement,
  LazySuppliersBulkUpload,
  LazyArticlesManagement,
  LazyReviewsModeration,
  LazyNotificationsManagement,
  LazySEOManagement,
  LazyTrackingSettings,
  LazySecurityMonitoring,
  LazyReports,
  LazyPerformanceMonitor,
  LazySearchPage
} from "./components/lazy/LazyAdminPages";

// Optimized QueryClient configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on UUID errors
        if (error?.message?.includes('invalid input syntax for type uuid')) {
          console.error('UUID error detected, not retrying:', error);
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

// Global error handler for unhandled errors
const handleGlobalError = (error: Error, errorInfo: React.ErrorInfo) => {
  console.error('Global unhandled error:', {
    error: error.message,
    stack: error.stack,
    errorInfo
  });
};

// App component with Web Vitals monitoring
function AppWithVitals() {
  useWebVitals();
  
  return (
    <GlobalErrorBoundary onError={handleGlobalError}>
      <QueryClientProvider client={queryClient}>
        <QueryErrorBoundary>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <TooltipProvider>
              <GlobalSEO />
              <TrackingScripts />
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AuthProvider>
                  <Routes>
                    {/* Main routes */}
                    <Route path="/" element={<Index />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/landing" element={<LandingPage />} />
                    <Route path="/landing-test" element={<LandingPageTest />} />
                    
                    {/* Sitemap route */}
                    <Route path="/sitemap.xml" element={<SitemapGenerator />} />
                    
                    {/* Pricing Route */}
                    <Route path="/pricing" element={<SelectPlan />} />
                    
                    {/* Auth routes */}
                    <Route path="/auth/login" element={<Login />} />
                    <Route path="/auth/register" element={<Register />} />
                    <Route path="/auth/select-plan" element={<SelectPlan />} />
                    <Route path="/auth/payment" element={<Payment />} />
                    <Route path="/auth/reset-password" element={<ResetPassword />} />
                    <Route path="/auth/reset-confirmation" element={<ResetConfirmation />} />
                    
                    {/* Profile routes */}
                    <Route path="/profile" element={<Profile />} />
                    
                    {/* Suppliers routes */}
                    <Route path="/suppliers" element={<SuppliersList />} />
                    <Route path="/suppliers/:id" element={<SupplierDetail />} />
                    
                    {/* Favorites routes */}
                    <Route path="/favorites" element={<Favorites />} />
                    <Route path="/favorites/list" element={<FavoritesList />} />
                    
                    {/* Articles routes */}
                    <Route path="/articles" element={<ArticlesPage />} />
                    <Route path="/articles/:id" element={<ArticleDetailPage />} />
                    
                    {/* Search routes - lazy loaded for better performance */}
                    <Route 
                      path="/search" 
                      element={
                        <OptimizedSuspense message="Carregando página de busca...">
                          <LazySearchPage />
                        </OptimizedSuspense>
                      } 
                    />
                    <Route path="/search/limited" element={<LimitedSearch />} />
                    
                    {/* Notifications routes */}
                    <Route path="/notifications" element={<NotificationsPage />} />
                    <Route path="/notifications/:id" element={<NotificationDetailPage />} />
                    
                    {/* Legal routes */}
                    <Route path="/legal/terms" element={<TermsOfService />} />
                    <Route path="/legal/privacy" element={<PrivacyPolicy />} />
                    <Route path="/legal/cookies" element={<CookiePolicy />} />
                    
                    {/* Admin routes - all lazy loaded */}
                    <Route element={<AdminRouteGuard />}>
                      <Route 
                        path="/admin" 
                        element={
                          <OptimizedSuspense message="Carregando dashboard administrativo...">
                            <LazyAdminDashboard />
                          </OptimizedSuspense>
                        } 
                      />
                      <Route 
                        path="/admin/users" 
                        element={
                          <OptimizedSuspense message="Carregando gerenciamento de usuários...">
                            <LazyUsersManagement />
                          </OptimizedSuspense>
                        } 
                      />
                      <Route 
                        path="/admin/suppliers" 
                        element={
                          <OptimizedSuspense message="Carregando gerenciamento de fornecedores...">
                            <LazySuppliersManagement />
                          </OptimizedSuspense>
                        } 
                      />
                      <Route 
                        path="/admin/suppliers/bulk-upload" 
                        element={
                          <OptimizedSuspense message="Carregando upload em massa...">
                            <LazySuppliersBulkUpload />
                          </OptimizedSuspense>
                        } 
                      />
                      <Route 
                        path="/admin/articles" 
                        element={
                          <OptimizedSuspense message="Carregando gerenciamento de artigos...">
                            <LazyArticlesManagement />
                          </OptimizedSuspense>
                        } 
                      />
                      <Route 
                        path="/admin/reviews-moderation" 
                        element={
                          <OptimizedSuspense message="Carregando moderação de avaliações...">
                            <LazyReviewsModeration />
                          </OptimizedSuspense>
                        } 
                      />
                      <Route 
                        path="/admin/notifications" 
                        element={
                          <OptimizedSuspense message="Carregando gerenciamento de notificações...">
                            <LazyNotificationsManagement />
                          </OptimizedSuspense>
                        } 
                      />
                      <Route 
                        path="/admin/seo" 
                        element={
                          <OptimizedSuspense message="Carregando configurações de SEO...">
                            <LazySEOManagement />
                          </OptimizedSuspense>
                        } 
                      />
                      <Route 
                        path="/admin/tracking-settings" 
                        element={
                          <OptimizedSuspense message="Carregando configurações de rastreamento...">
                            <LazyTrackingSettings />
                          </OptimizedSuspense>
                        } 
                      />
                      <Route 
                        path="/admin/security-monitoring" 
                        element={
                          <OptimizedSuspense message="Carregando monitoramento de segurança...">
                            <LazySecurityMonitoring />
                          </OptimizedSuspense>
                        } 
                      />
                      <Route 
                        path="/admin/reports" 
                        element={
                          <OptimizedSuspense message="Carregando relatórios...">
                            <LazyReports />
                          </OptimizedSuspense>
                        } 
                      />
                    </Route>
                    
                    {/* Performance route - lazy loaded */}
                    <Route 
                      path="/performance" 
                      element={
                        <OptimizedSuspense message="Carregando monitor de performance...">
                          <LazyPerformanceMonitor />
                        </OptimizedSuspense>
                      } 
                    />
                    
                    {/* 404 route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </AuthProvider>
              </BrowserRouter>
            </TooltipProvider>
          </ThemeProvider>
        </QueryErrorBoundary>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );
}

const App = () => <AppWithVitals />;

export default App;
