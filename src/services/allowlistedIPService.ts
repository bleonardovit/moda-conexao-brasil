
import { supabase } from '@/integrations/supabase/client';
import { AllowlistedIP } from '@/types';
import { executeAdminQuery, isCurrentUserAdmin } from './adminSecurityService';

export const getAllowlistedIPs = async (): Promise<AllowlistedIP[]> => {
  console.log('🔍 Fetching allowlisted IPs...');
  
  return executeAdminQuery(
    async () => {
      const { data, error } = await supabase
        .from('allowlisted_ips')
        .select(`
          id,
          ip_address_or_cidr,
          description,
          is_active,
          created_at,
          created_by,
          profiles!created_by(full_name)
        `)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('❌ Error fetching allowlisted IPs:', error);
        throw error;
      }
      
      // Transform data to include created_by_email
      const transformedData = (data || []).map(item => ({
        ...item,
        created_by_email: item.profiles?.full_name || 'Unknown'
      }));
      
      console.log(`✅ Found ${transformedData.length} allowlisted IPs`);
      return { data: transformedData, error: null };
    },
    []
  );
};

export const addAllowlistedIP = async (
  ipAddress: string,
  description: string | null = null
): Promise<boolean> => {
  console.log('➕ Adding allowlisted IP:', ipAddress);
  
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    console.warn('⚠️ User is not admin, cannot add allowlisted IP');
    return false;
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('allowlisted_ips')
      .insert({
        ip_address_or_cidr: ipAddress,
        description: description,
        is_active: true,
        created_by: user.id
      });
      
    if (error) {
      console.error('❌ Error adding allowlisted IP:', error);
      return false;
    }
    
    console.log('✅ Allowlisted IP added successfully');
    return true;
  } catch (error) {
    console.error('❌ Error in addAllowlistedIP:', error);
    return false;
  }
};

export const removeAllowlistedIP = async (id: string): Promise<boolean> => {
  console.log('🗑️ Removing allowlisted IP:', id);
  
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    console.warn('⚠️ User is not admin, cannot remove allowlisted IP');
    return false;
  }

  try {
    const { error } = await supabase
      .from('allowlisted_ips')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('❌ Error removing allowlisted IP:', error);
      return false;
    }
    
    console.log('✅ Allowlisted IP removed successfully');
    return true;
  } catch (error) {
    console.error('❌ Error in removeAllowlistedIP:', error);
    return false;
  }
};

export const toggleAllowlistedIP = async (id: string, isActive: boolean): Promise<boolean> => {
  console.log('🔄 Toggling allowlisted IP:', id, 'to', isActive);
  
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    console.warn('⚠️ User is not admin, cannot toggle allowlisted IP');
    return false;
  }

  try {
    const { error } = await supabase
      .from('allowlisted_ips')
      .update({ is_active: isActive })
      .eq('id', id);
      
    if (error) {
      console.error('❌ Error toggling allowlisted IP:', error);
      return false;
    }
    
    console.log('✅ Allowlisted IP toggled successfully');
    return true;
  } catch (error) {
    console.error('❌ Error in toggleAllowlistedIP:', error);
    return false;
  }
};
