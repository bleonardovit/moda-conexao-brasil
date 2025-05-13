
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface TrackingSettings {
  id: string;
  name: string;
  key: string;
  value: string | null;
  is_active: boolean;
  script: string | null;
  created_at: string;
  updated_at: string;
  last_updated_by: string | null;
}

/**
 * Fetch all tracking settings from the database
 */
export const getTrackingSettings = async (): Promise<TrackingSettings[]> => {
  try {
    const { data, error } = await supabase
      .from('tracking_settings')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching tracking settings:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch tracking settings:', error);
    return [];
  }
};

/**
 * Fetch a specific tracking setting by key
 */
export const getTrackingSettingByKey = async (key: string): Promise<TrackingSettings | null> => {
  try {
    const { data, error } = await supabase
      .from('tracking_settings')
      .select('*')
      .eq('key', key)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error code
        console.error('Error fetching tracking setting:', error);
      }
      return null;
    }

    return data;
  } catch (error) {
    console.error(`Failed to fetch tracking setting with key ${key}:`, error);
    return null;
  }
};

/**
 * Update a tracking setting
 */
export const updateTrackingSetting = async (
  id: string,
  updates: Partial<Omit<TrackingSettings, 'id' | 'created_at' | 'updated_at'>>
): Promise<TrackingSettings | null> => {
  try {
    // Get the current user's ID for the last_updated_by field
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      toast({
        title: "Erro ao atualizar configuração",
        description: "Você precisa estar autenticado para realizar esta ação.",
        variant: "destructive"
      });
      return null;
    }

    const { data, error } = await supabase
      .from('tracking_settings')
      .update({
        ...updates,
        last_updated_by: session.user.id
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating tracking setting:', error);
      toast({
        title: "Erro ao atualizar configuração",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }

    toast({
      title: "Configuração atualizada",
      description: "As configurações de rastreamento foram atualizadas com sucesso."
    });

    return data;
  } catch (error) {
    console.error('Failed to update tracking setting:', error);
    return null;
  }
};

/**
 * Validate tracking setting value format
 */
export const validateTrackingFormat = (key: string, value: string): boolean => {
  if (!value) return true; // Empty values are considered valid
  
  switch (key) {
    case 'facebook_pixel':
      // Facebook Pixel ID format: 15 digits
      return /^\d{15}$/.test(value);
    
    case 'gtm':
      // Google Tag Manager format: GTM-XXXXXX where X is alphanumeric
      return /^GTM-[A-Z0-9]{6,7}$/.test(value);
    
    case 'hotjar':
      // Hotjar ID format: numeric values
      return /^\d+$/.test(value);
    
    case 'custom_script':
      // Custom script: any non-empty string
      return true;
    
    default:
      return true;
  }
};

/**
 * Get active tracking scripts
 */
export const getActiveTrackingScripts = async (): Promise<TrackingSettings[]> => {
  try {
    const { data, error } = await supabase
      .from('tracking_settings')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching active tracking settings:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch active tracking settings:', error);
    return [];
  }
};
