
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  getUserTrialInfo, 
  // isFeatureAccessibleInTrial, // No longer directly used here
  getAllowedSuppliersForTrial, 
  isSupplierAllowedForTrial,
  checkAndUpdateTrialStatus,
  autoStartTrialForUser
} from '@/services/trialService';
import { checkFeatureAccess } from '@/services/featureAccessService'; // Import checkFeatureAccess

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
  const { user } = useAuth();
  const [isInTrial, setIsInTrial] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [hoursRemaining, setHoursRemaining] = useState(0);
  const [hasExpired, setHasExpired] = useState(false);
  const [allowedSupplierIds, setAllowedSupplierIds] = useState<string[]>([]);

  useEffect(() => {
    const checkTrialStatus = async () => {
      if (!user?.id) {
        setIsInTrial(false);
        setHasExpired(false); // Reset expired state if no user
        setDaysRemaining(0);
        setHoursRemaining(0);
        return;
      }

      try {
        // Auto-start trial for new users
        await autoStartTrialForUser(user.id);
        
        // Check if trial has expired and update status in DB
        await checkAndUpdateTrialStatus(user.id);

        const trialInfo = await getUserTrialInfo(user.id);
        
        if (trialInfo) {
          if (trialInfo.trial_status === 'active') {
            setIsInTrial(true);
            setHasExpired(false);
            
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
                // Trial ended, but status might not be 'expired' yet in DB if checkAndUpdateTrialStatus hasn't run after the exact moment
                setDaysRemaining(0);
                setHoursRemaining(0);
                // setHasExpired(true); // Rely on trialInfo.trial_status for expired state
              }
            }
          } else if (trialInfo.trial_status === 'expired') {
            setIsInTrial(false);
            setHasExpired(true);
            setDaysRemaining(0);
            setHoursRemaining(0);
          } else { // e.g., 'not_started', 'converted'
            setIsInTrial(false);
            setHasExpired(false);
            setDaysRemaining(0);
            setHoursRemaining(0);
          }
          
          // Get allowed suppliers if in active trial
          if (trialInfo.trial_status === 'active') {
            const allowedSuppliers = await getAllowedSuppliersForTrial(user.id);
            setAllowedSupplierIds(allowedSuppliers);
          } else {
            setAllowedSupplierIds([]);
          }

        } else { // No trial info found
          setIsInTrial(false);
          setHasExpired(false);
          setDaysRemaining(0);
          setHoursRemaining(0);
        }
      } catch (error) {
        console.error('Error checking trial status:', error);
        setIsInTrial(false);
        setHasExpired(false);
      }
    };
    
    checkTrialStatus();
    
    // Set up interval to update the time remaining & status
    const interval = setInterval(checkTrialStatus, 60 * 1000); // Update every minute
    
    return () => clearInterval(interval);
  }, [user?.id]);
  
  const isSupplierAllowed = useCallback(async (supplierId: string): Promise<boolean> => {
    if (!user?.id) return true; // Non-logged in users might have different general restrictions, but for trial-specific, assume allowed if not in trial logic
    if (!isInTrial) return true; // If not in an active trial, supplier restrictions specific to trial don't apply
    try {
      return await isSupplierAllowedForTrial(user.id, supplierId);
    } catch (error) {
      console.error('Error checking supplier access:', error);
      return false;
    }
  }, [user?.id, isInTrial]);
  
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
  }, [user?.id]); // user.id is the primary dependency here.
  
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

