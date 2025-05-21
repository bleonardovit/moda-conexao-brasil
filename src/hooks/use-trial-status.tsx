
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  getUserTrialInfo, 
  isFeatureAccessibleInTrial, 
  getAllowedSuppliersForTrial, 
  isSupplierAllowedForTrial 
} from '@/services/trialService';

export interface TrialStatus {
  isInTrial: boolean;
  daysRemaining: number;
  hoursRemaining: number;
  hasExpired: boolean;
  allowedSupplierIds: string[];
  isSupplierAllowed: (supplierId: string) => Promise<boolean>;
  isFeatureAllowed: (featureKey: string) => Promise<boolean>;
}

export function useTrialStatus(): TrialStatus {
  const { user, isAuthenticated } = useAuth();
  const [isInTrial, setIsInTrial] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [hoursRemaining, setHoursRemaining] = useState(0);
  const [hasExpired, setHasExpired] = useState(false);
  const [allowedSupplierIds, setAllowedSupplierIds] = useState<string[]>([]);

  useEffect(() => {
    const checkTrialStatus = async () => {
      if (!isAuthenticated || !user?.id) {
        setIsInTrial(false);
        return;
      }

      try {
        const trialInfo = await getUserTrialInfo(user.id);
        
        if (trialInfo && trialInfo.trial_status === 'active') {
          setIsInTrial(true);
          
          // Calculate days and hours remaining
          if (trialInfo.trial_end_date) {
            const endDate = new Date(trialInfo.trial_end_date);
            const now = new Date();
            const diff = endDate.getTime() - now.getTime();
            
            if (diff > 0) {
              const days = Math.floor(diff / (1000 * 60 * 60 * 24));
              const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
              
              setDaysRemaining(days);
              setHoursRemaining(hours);
              setHasExpired(false);
            } else {
              setDaysRemaining(0);
              setHoursRemaining(0);
              setHasExpired(true);
            }
          }
          
          // Get allowed suppliers
          const allowedSuppliers = await getAllowedSuppliersForTrial(user.id);
          setAllowedSupplierIds(allowedSuppliers);
        } else {
          setIsInTrial(false);
        }
      } catch (error) {
        console.error('Error checking trial status:', error);
        setIsInTrial(false);
      }
    };
    
    checkTrialStatus();
    
    // Set up interval to update the time remaining
    const interval = setInterval(checkTrialStatus, 60 * 1000); // Update every minute
    
    return () => clearInterval(interval);
  }, [isAuthenticated, user?.id]);
  
  const isSupplierAllowed = useCallback(async (supplierId: string): Promise<boolean> => {
    if (!isAuthenticated || !user?.id || !isInTrial) return true;
    try {
      return await isSupplierAllowedForTrial(user.id, supplierId);
    } catch (error) {
      console.error('Error checking supplier access:', error);
      return false;
    }
  }, [isAuthenticated, user?.id, isInTrial]);
  
  const isFeatureAllowed = useCallback(async (featureKey: string): Promise<boolean> => {
    if (!isAuthenticated || !user?.id || !isInTrial) return true;
    try {
      return await isFeatureAccessibleInTrial(user.id, featureKey);
    } catch (error) {
      console.error('Error checking feature access:', error);
      return false;
    }
  }, [isAuthenticated, user?.id, isInTrial]);
  
  return {
    isInTrial,
    daysRemaining,
    hoursRemaining,
    hasExpired,
    allowedSupplierIds,
    isSupplierAllowed,
    isFeatureAllowed
  };
}
