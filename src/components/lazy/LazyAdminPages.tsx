
import React from 'react';

// Lazy load admin pages for better code splitting
export const LazyAdminDashboard = React.lazy(() => import('@/pages/admin/AdminDashboard'));
export const LazyUsersManagement = React.lazy(() => import('@/pages/admin/UsersManagement'));
export const LazySuppliersManagement = React.lazy(() => import('@/pages/admin/SuppliersManagement'));
export const LazySuppliersBulkUpload = React.lazy(() => import('@/pages/admin/SuppliersBulkUpload'));
export const LazyArticlesManagement = React.lazy(() => import('@/pages/admin/ArticlesManagement'));
export const LazyReviewsModeration = React.lazy(() => import('@/pages/admin/ReviewsModeration'));
export const LazyNotificationsManagement = React.lazy(() => import('@/pages/admin/NotificationsManagement'));
export const LazySEOManagement = React.lazy(() => import('@/pages/admin/SEOManagement'));
export const LazyTrackingSettings = React.lazy(() => import('@/pages/admin/TrackingSettings'));
export const LazySecurityMonitoring = React.lazy(() => import('@/pages/admin/SecurityMonitoring'));
export const LazyReports = React.lazy(() => import('@/pages/admin/Reports'));

// Lazy load other heavy pages
export const LazyPerformanceMonitor = React.lazy(() => import('@/pages/performance/PerformanceMonitor'));
export const LazySearchPage = React.lazy(() => import('@/pages/search/SearchPage'));
