
import { supabase } from '@/integrations/supabase/client';
import { SEOSettings, SEOUpdateData } from '@/types/seo';

export const getSEOSettings = async (): Promise<SEOSettings | null> => {
  try {
    const { data, error } = await supabase
      .from('seo_settings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching SEO settings:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getSEOSettings:', error);
    return null;
  }
};

export const updateSEOSettings = async (
  id: string, 
  updates: SEOUpdateData,
  userId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('seo_settings')
      .update({
        ...updates,
        updated_by: userId,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating SEO settings:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateSEOSettings:', error);
    return false;
  }
};
