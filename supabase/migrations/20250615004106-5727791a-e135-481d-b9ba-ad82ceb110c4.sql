
-- Create table to store allowlisted IPs
CREATE TABLE public.allowlisted_ips (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address_or_cidr text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  CONSTRAINT unique_ip_address_or_cidr UNIQUE (ip_address_or_cidr)
);

COMMENT ON TABLE public.allowlisted_ips IS 'Stores IP addresses and CIDR ranges that are exempt from security blocks.';
COMMENT ON COLUMN public.allowlisted_ips.ip_address_or_cidr IS 'An individual IPv4/IPv6 address or a CIDR range.';
COMMENT ON COLUMN public.allowlisted_ips.description IS 'Reason for allowlisting this IP/range.';
COMMENT ON COLUMN public.allowlisted_ips.created_by IS 'The admin user who added this entry.';

-- Enable Row Level Security
ALTER TABLE public.allowlisted_ips ENABLE ROW LEVEL SECURITY;

-- Admins have full access to manage the allowlist
CREATE POLICY "Allow admins full access to allowlisted IPs"
ON public.allowlisted_ips
FOR ALL
USING (is_current_user_admin())
WITH CHECK (is_current_user_admin());

-- Create function to check if an IP is in the allowlist
CREATE OR REPLACE FUNCTION public.is_ip_in_allowlist(check_ip text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  is_allowed boolean;
BEGIN
  -- Use exception handling for invalid inet format, which can happen if check_ip or a stored value is not a valid IP/CIDR.
  BEGIN
    SELECT EXISTS (
      SELECT 1
      FROM public.allowlisted_ips
      WHERE is_active = true AND check_ip::inet <<= ip_address_or_cidr::inet
    )
    INTO is_allowed;
  EXCEPTION WHEN invalid_text_representation THEN
    -- If the IP or CIDR in the DB is invalid, or check_ip is invalid, treat as not allowed for safety.
    is_allowed := false;
  END;
  
  RETURN is_allowed;
END;
$function$;
