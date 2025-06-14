
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isCurrentUserAdminCached } from '@/services/optimizedDbFunctions';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export const AdminRouteGuard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const adminStatus = await isCurrentUserAdminCached();
      setIsAdmin(adminStatus);
    };

    if (!authLoading) {
      if (user) {
        checkAdminStatus();
      } else {
        // If no user is logged in, they are not an admin.
        setIsAdmin(false);
      }
    }
  }, [user, authLoading]);

  if (authLoading || isAdmin === null) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
};
