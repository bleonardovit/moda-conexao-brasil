
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

// Import pages
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
import SearchPage from "./pages/search/SearchPage";
import { LimitedSearch } from "./pages/search/LimitedSearch";
import NotificationsPage from "./pages/notifications/NotificationsPage";
import NotificationDetailPage from "./pages/notifications/NotificationDetailPage";
import NotFound from "./pages/NotFound";

// Import legal pages
import TermsOfService from "./pages/legal/TermsOfService";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import CookiePolicy from "./pages/legal/CookiePolicy";

// Import admin pages
import UsersManagement from "./pages/admin/UsersManagement";
import SuppliersManagement from "./pages/admin/SuppliersManagement";
import SuppliersBulkUpload from "./pages/admin/SuppliersBulkUpload";
import ArticlesManagement from "./pages/admin/ArticlesManagement";
import ReviewsModeration from "./pages/admin/ReviewsModeration";
import NotificationsManagement from "./pages/admin/NotificationsManagement";
import SEOManagement from "./pages/admin/SEOManagement";
import TrackingSettings from "./pages/admin/TrackingSettings";
import SecurityMonitoring from "./pages/admin/SecurityMonitoring";
import Reports from "./pages/admin/Reports";
import AdminDashboard from "./pages/admin/AdminDashboard";

// Import performance page
import PerformanceMonitor from "./pages/performance/PerformanceMonitor";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
              
              {/* Search routes */}
              <Route path="/search" element={<SearchPage />} />
              <Route path="/search/limited" element={<LimitedSearch />} />
              
              {/* Notifications routes */}
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/notifications/:id" element={<NotificationDetailPage />} />
              
              {/* Legal routes */}
              <Route path="/legal/terms" element={<TermsOfService />} />
              <Route path="/legal/privacy" element={<PrivacyPolicy />} />
              <Route path="/legal/cookies" element={<CookiePolicy />} />
              
              {/* Admin routes */}
              <Route element={<AdminRouteGuard />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<UsersManagement />} />
                <Route path="/admin/suppliers" element={<SuppliersManagement />} />
                <Route path="/admin/suppliers/bulk-upload" element={<SuppliersBulkUpload />} />
                <Route path="/admin/articles" element={<ArticlesManagement />} />
                <Route path="/admin/reviews-moderation" element={<ReviewsModeration />} />
                <Route path="/admin/notifications" element={<NotificationsManagement />} />
                <Route path="/admin/seo" element={<SEOManagement />} />
                <Route path="/admin/tracking-settings" element={<TrackingSettings />} />
                <Route path="/admin/security-monitoring" element={<SecurityMonitoring />} />
                <Route path="/admin/reports" element={<Reports />} />
              </Route>
              
              {/* Performance route */}
              <Route path="/performance" element={<PerformanceMonitor />} />
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
