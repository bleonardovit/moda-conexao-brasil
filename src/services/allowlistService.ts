
import { supabase } from '@/integrations/supabase/client';
import type { AllowlistedIP } from '@/types/security';
import { PostgrestError } from '@supabase/supabase-js';

export const getAllowlistedIPs = async (): Promise<AllowlistedIP[]> => {
  const { data, error } = await supabase
    .from('allowlisted_ips')
    .select(`
      *,
      profiles ( email )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching allowlisted IPs:', error);
    throw error;
  }
  
  return data.map((item: any) => ({
      ...item,
      created_by_email: item.profiles?.email,
      profiles: undefined,
  }));
};

export const addAllowlistedIP = async (
  ipAddressOrCidr: string,
  description: string
): Promise<{ data: AllowlistedIP | null; error: PostgrestError | null }> => {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('allowlisted_ips')
    .insert({
      ip_address_or_cidr: ipAddressOrCidr,
      description: description || null,
      created_by: user?.id ?? null,
    })
    .select()
    .single();

  return { data, error };
};

export const updateAllowlistedIP = async (
  id: string,
  updates: Partial<Pick<AllowlistedIP, 'is_active' | 'description'>>
): Promise<{ data: AllowlistedIP | null; error: PostgrestError | null }> => {
  const { data, error } = await supabase
    .from('allowlisted_ips')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
    
  return { data, error };
};

export const removeAllowlistedIP = async (id: string): Promise<{ error: PostgrestError | null }> => {
  const { error } = await supabase
    .from('allowlisted_ips')
    .delete()
    .eq('id', id);

  return { error };
};

export const isValidIPCidr = (ip: string): boolean => {
    const ipv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv4Cidr = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/(3[0-2]|[12]?[0-9])$/;
    const ipv6 = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;

    return ipv4.test(ip) || ipv4Cidr.test(ip) || ipv6.test(ip);
}
