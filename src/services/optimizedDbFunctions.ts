
import { supabase } from '@/integrations/supabase/client';

/**
 * Serviço otimizado para usar as funções SECURITY DEFINER do banco
 * Essas funções foram criadas para evitar problemas de performance RLS
 */

/**
 * Obtém o ID do usuário atual usando função otimizada do banco
 */
export const getCurrentUserId = async (): Promise<string | null> => {
  try {
    const { data, error } = await supabase.rpc('get_current_user_id');
    
    if (error) {
      console.error('Error getting current user ID:', error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error('Exception in getCurrentUserId:', err);
    return null;
  }
};

/**
 * Verifica se o usuário atual é admin usando função otimizada do banco
 */
export const isCurrentUserAdmin = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('is_current_user_admin');
    
    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
    
    return data || false;
  } catch (err) {
    console.error('Exception in isCurrentUserAdmin:', err);
    return false;
  }
};

/**
 * Verifica se o usuário pode avaliar um fornecedor específico
 */
export const userCanReviewSupplier = async (supplierUuid: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('user_can_review_supplier', {
      supplier_uuid: supplierUuid
    });
    
    if (error) {
      console.error('Error checking review permission:', error);
      return false;
    }
    
    return data || false;
  } catch (err) {
    console.error('Exception in userCanReviewSupplier:', err);
    return false;
  }
};

/**
 * Cache simples para evitar múltiplas chamadas para verificação de admin
 */
let adminStatusCache: { value: boolean; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const isCurrentUserAdminCached = async (): Promise<boolean> => {
  const now = Date.now();
  
  if (adminStatusCache && (now - adminStatusCache.timestamp) < CACHE_DURATION) {
    return adminStatusCache.value;
  }
  
  const isAdmin = await isCurrentUserAdmin();
  adminStatusCache = { value: isAdmin, timestamp: now };
  
  return isAdmin;
};

/**
 * Limpa o cache de status de admin (útil após login/logout)
 */
export const clearAdminStatusCache = (): void => {
  adminStatusCache = null;
};
