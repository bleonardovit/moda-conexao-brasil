
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { Toaster } from 'sonner';

import LandingPage from './pages/LandingPage';
import Home from './pages/Home';
import Index from './pages/Index';
import Auth from './pages/auth/Auth';
import ResetConfirmation from './pages/auth/ResetConfirmation';

import AdminHome from './pages/admin/AdminHome';
import UsersManagement from './pages/admin/UsersManagement';
import SuppliersManagement from './pages/admin/SuppliersManagement';
import SuppliersBulkUpload from './pages/admin/SuppliersBulkUpload';
import NotificationsManagement from './pages/admin/NotificationsManagement';
import ArticlesManagement from './pages/admin/ArticlesManagement';
import Reports from './pages/admin/Reports';
import TrackingSettings from './pages/admin/TrackingSettings';
import { TrackingScripts } from './components/tracking/TrackingScripts';
import { AuthProvider } from './hooks/useAuth';

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <TrackingScripts />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/home" element={<Home />} />
            <Route path="/index" element={<Index />} />
            
            {/* Auth routes */}
            <Route path="/auth">
              <Route index element={<Auth />} />
              <Route path="login" element={<Auth />} />
              <Route path="register" element={<Auth />} />
              <Route path="reset-password" element={<Auth />} />
              <Route path="reset-confirmation" element={<ResetConfirmation />} />
            </Route>
            
            {/* Admin routes */}
            <Route path="/admin" element={<AdminHome />} />
            <Route path="/admin/users" element={<UsersManagement />} />
            <Route path="/admin/suppliers" element={<SuppliersManagement />} />
            <Route path="/admin/suppliers/bulk" element={<SuppliersBulkUpload />} />
            <Route path="/admin/notifications" element={<NotificationsManagement />} />
            <Route path="/admin/articles" element={<ArticlesManagement />} />
            <Route path="/admin/reports" element={<Reports />} />
            <Route path="/admin/tracking-settings" element={<TrackingSettings />} />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
