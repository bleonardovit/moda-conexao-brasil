import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';

import { ThemeProvider } from "@/components/ui/theme-provider"
import { Toaster } from '@/components/ui/sonner';

import LandingPage from './pages/LandingPage';
import Suppliers from './pages/Suppliers';
import Search from './pages/Search';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import Articles from './pages/Articles';
import Home from './pages/Home';
import Index from './pages/Index';
import Auth from './pages/Auth';
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
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <TrackingScripts /> {/* Add the TrackingScripts component */}
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/suppliers" element={<Suppliers />} />
              <Route path="/search" element={<Search />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/articles" element={<Articles />} />
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
              <Route path="/admin/tracking-settings" element={<TrackingSettings />} /> {/* Add TrackingSettings route */}
              
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </BrowserRouter>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
