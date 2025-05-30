
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  getUserTrialInfo, 
  getAllowedSuppliersForTrial, 
  isSupplierAllowedForTrial,
  checkAndUpdateTrialStatus,
  autoStartTrialForUser
} from '@/services/trialService';
import { checkFeatureAccess } from '@/services/featureAccessService'; 

export interface TrialStatus {
  isInTrial: boolean;
  daysRemaining: number;
  hoursRemaining: number;
  hasExpired: boolean;
  isLoading: boolean;
  allowedSupplierIds: string[];
  isSupplierAllowed: (supplierId: string) => Promise<boolean>;
  isFeatureAllowed: (featureKey: string) => Promise<boolean>;
}

export function useTrialStatus(): TrialStatus {
  const { user } = useAuth();
  const [isInTrial, setIsInTrial] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [hoursRemaining, setHoursRemaining] = useState(0);
  const [hasExpired, setHasExpired] = useState(true); // Start restrictive
  const [isLoading, setIsLoading] = useState(true); // Start loading
  const [allowedSupplierIds, setAllowedSupplierIds] = useState<string[]>([]);

  useEffect(() => {
    const checkTrialStatus = async () => {
      if (!user?.id) {
        setIsInTrial(false);
        setHasExpired(true); // Remain restrictive if no user
        setDaysRemaining(0);
        setHoursRemaining(0);
        setAllowedSupplierIds([]);
        setIsLoading(false); // Done loading
        return;
      }

      try {
        setIsLoading(true); // Start verification
        
        // Auto-start trial for new users
        await autoStartTrialForUser(user.id);
        
        // Check if trial has expired and update status in DB
        await checkAndUpdateTrialStatus(user.id);

        const trialInfo = await getUserTrialInfo(user.id);
        
        if (trialInfo) {
          if (trialInfo.trial_status === 'active') {
            setIsInTrial(true);
            setHasExpired(false); // Allow access only after verification
            
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
              } else {
                setDaysRemaining(0);
                setHoursRemaining(0);
              }
            }
            const suppliers = await getAllowedSuppliersForTrial(user.id);
            setAllowedSupplierIds(suppliers);
          } else if (trialInfo.trial_status === 'expired') {
            setIsInTrial(false);
            setHasExpired(true);
            setDaysRemaining(0);
            setHoursRemaining(0);
            setAllowedSupplierIds([]);
          } else { // e.g., 'not_started', 'converted'
            setIsInTrial(false);
            setHasExpired(false); // Allow access for non-trial users
            setDaysRemaining(0);
            setHoursRemaining(0);
            setAllowedSupplierIds([]);
          }
        } else { // No trial info found
          setIsInTrial(false);
          setHasExpired(false);
          setDaysRemaining(0);
          setHoursRemaining(0);
          setAllowedSupplierIds([]);
        }
      } catch (error) {
        console.error('Error checking trial status:', error);
        setIsInTrial(false);
        setHasExpired(true); // Remain restrictive on error
        setDaysRemaining(0);
        setHoursRemaining(0);
        setAllowedSupplierIds([]);
      } finally {
        setIsLoading(false); // Done with verification
      }
    };
    
    checkTrialStatus();
    
    // Set up interval to update the time remaining & status
    const interval = setInterval(checkTrialStatus, 60 * 1000); // Update every minute
    
    return () => clearInterval(interval);
  }, [user?.id]);
  
  const isSupplierAllowed = useCallback(async (supplierId: string): Promise<boolean> => {
    if (!user?.id) return true; 
    if (hasExpired) return false; // If trial has expired, supplier is not allowed
    
    // If not in an active trial (e.g., subscribed, or trial not_started/converted)
    // access is not restricted by *trial* limitations.
    if (!isInTrial) return true; 

    // If in active trial and not expired:
    // Check if supplier is in the allowed list
    return allowedSupplierIds.includes(supplierId);
  }, [user?.id, isInTrial, hasExpired, allowedSupplierIds]);
  
  const isFeatureAllowed = useCallback(async (featureKey: string): Promise<boolean> => {
    try {
      // user?.id can be null for anonymous users, checkFeatureAccess handles this.
      const accessResult = await checkFeatureAccess(user?.id, featureKey);
      // A feature is considered "allowed" if its access level is anything other than 'none'.
      // Specific limitations (like count or blur) are handled by the components themselves.
      return accessResult.access !== 'none';
    } catch (error) {
      console.error(`Error checking feature access for ${featureKey}:`, error);
      return false; // Default to not allowed on error to be safe.
    }
  }, [user?.id]);
  
  return {
    isInTrial,
    daysRemaining,
    hoursRemaining,
    hasExpired,
    isLoading,
    allowedSupplierIds,
    isSupplierAllowed,
    isFeatureAllowed
  };
}
