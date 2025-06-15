
import React, { Suspense } from 'react';
import { LoadingSpinner } from './loading-spinner';

interface OptimizedSuspenseProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  message?: string;
}

export const OptimizedSuspense = React.memo(function OptimizedSuspense({
  children,
  fallback,
  message = 'Carregando página...'
}: OptimizedSuspenseProps) {
  const defaultFallback = (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" message={message} />
    </div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
});
