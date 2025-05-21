
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { getUserTrialInfo, getAllowedSuppliersForTrial, isSupplierAllowedForTrial } from '@/services/trialService';
import type { UserTrialInfo, TrialStatus } from '@/types';
import { toast } from '@/hooks/use-toast';

interface TrialStatusState {
  status: TrialStatus;
  isInTrial: boolean;
  trialInfo: UserTrialInfo | null;
  daysRemaining: number;
  hoursRemaining: number;
  allowedSupplierIds: string[];
  isSupplierAllowed: (supplierId: string) => Promise<boolean>;
  isLoading: boolean;
}

export function useTrialStatus(): TrialStatusState {
  const { user } = useAuth();
  const [trialInfo, setTrialInfo] = useState<UserTrialInfo | null>(null);
  const [allowedSupplierIds, setAllowedSupplierIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Calculate remaining time
  const calculateTimeRemaining = () => {
    if (!trialInfo || !trialInfo.endDate) {
      return { days: 0, hours: 0 };
    }

    const now = new Date();
    const endDate = new Date(trialInfo.endDate);
    const diffTime = Math.max(0, endDate.getTime() - now.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    return { days: diffDays, hours: diffHours };
  };

  const { days: daysRemaining, hours: hoursRemaining } = calculateTimeRemaining();

  // Check if supplier is allowed for this trial user
  const checkIsSupplierAllowed = async (supplierId: string): Promise<boolean> => {
    if (!user?.id) return false;
    
    try {
      // If user has an active subscription, always return true
      if (user.subscription_status === 'active' || user.subscription_status === 'trialing') {
        return true;
      }
      
      // If not in trial, return false
      if (trialInfo?.status !== 'active') {
        return false;
      }

      return await isSupplierAllowedForTrial(user.id, supplierId);
    } catch (error) {
      console.error('Error checking supplier access:', error);
      return false;
    }
  };

  useEffect(() => {
    const fetchTrialInfo = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const info = await getUserTrialInfo(user.id);
        setTrialInfo(info);

        // Only fetch allowed suppliers if user is in trial
        if (info?.status === 'active') {
          const allowedIds = await getAllowedSuppliersForTrial(user.id);
          setAllowedSupplierIds(allowedIds);
        }
      } catch (error) {
        console.error('Error fetching trial info:', error);
        toast({
          title: "Erro",
          description: "Não foi possível obter informações sobre o período de teste.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrialInfo();
    // Set up a timer to refresh trial status every hour
    const timer = setInterval(fetchTrialInfo, 60 * 60 * 1000);
    return () => clearInterval(timer);
  }, [user?.id]);

  return {
    status: trialInfo?.status || 'not_started',
    isInTrial: trialInfo?.status === 'active',
    trialInfo,
    daysRemaining,
    hoursRemaining,
    allowedSupplierIds,
    isSupplierAllowed: checkIsSupplierAllowed,
    isLoading
  };
}
