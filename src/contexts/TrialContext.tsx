
import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { useTrialStatus } from '@/hooks/use-trial-status';

interface TrialContextValue {
  isInTrial: boolean;
  daysRemaining: number;
  hoursRemaining: number;
  hasExpired: boolean;
  isLoading: boolean;
  isVerified: boolean;
  allowedSupplierIds: string[];
  isSupplierAllowed: (supplierId: string) => Promise<boolean>;
  isFeatureAllowed: (featureKey: string) => Promise<boolean>;
}

const TrialContext = createContext<TrialContextValue | null>(null);

export function useTrialContext() {
  const context = useContext(TrialContext);
  if (!context) {
    throw new Error('useTrialContext must be used within a TrialProvider');
  }
  return context;
}

interface TrialProviderProps {
  children: React.ReactNode;
}

export function TrialProvider({ children }: TrialProviderProps) {
  const trialStatus = useTrialStatus();

  // Memoizar o valor do contexto para evitar re-renders desnecessários
  const contextValue = useMemo(() => ({
    isInTrial: trialStatus.isInTrial,
    daysRemaining: trialStatus.daysRemaining,
    hoursRemaining: trialStatus.hoursRemaining,
    hasExpired: trialStatus.hasExpired,
    isLoading: trialStatus.isLoading,
    isVerified: trialStatus.isVerified,
    allowedSupplierIds: trialStatus.allowedSupplierIds,
    isSupplierAllowed: trialStatus.isSupplierAllowed,
    isFeatureAllowed: trialStatus.isFeatureAllowed,
  }), [
    trialStatus.isInTrial,
    trialStatus.daysRemaining,
    trialStatus.hoursRemaining,
    trialStatus.hasExpired,
    trialStatus.isLoading,
    trialStatus.isVerified,
    trialStatus.allowedSupplierIds,
    trialStatus.isSupplierAllowed,
    trialStatus.isFeatureAllowed,
  ]);

  return (
    <TrialContext.Provider value={contextValue}>
      {children}
    </TrialContext.Provider>
  );
}
