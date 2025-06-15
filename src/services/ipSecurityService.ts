// SECURITY: Enhanced IP Security Service
// Provides secure IP detection with fallback methods and validation

export interface IPDetectionResult {
  ip: string;
  source: 'ipify' | 'ipapi' | 'ipinfo' | 'fallback';
  reliable: boolean;
}

/**
 * SECURITY: Helper function to create fetch with timeout
 */
const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeoutMs: number = 5000): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

/**
 * SECURITY: Get client IP address with multiple fallback methods
 * Uses multiple services to ensure reliability and prevent bypass
 */
export const getClientIPSecure = async (): Promise<IPDetectionResult> => {
  // Primary method: ipify.org (most reliable)
  try {
    const response = await fetchWithTimeout('https://api.ipify.org?format=json', {
      headers: {
        'Accept': 'application/json'
      }
    }, 5000);
    
    if (response.ok) {
      const data = await response.json();
      if (data.ip && isValidIP(data.ip)) {
        return {
          ip: data.ip,
          source: 'ipify',
          reliable: true
        };
      }
    }
  } catch (error) {
    console.warn('Primary IP service failed:', error);
  }

  // Fallback 1: ipapi.co
  try {
    const response = await fetchWithTimeout('https://ipapi.co/ip/', {
      headers: {
        'Accept': 'text/plain'
      }
    }, 5000);
    
    if (response.ok) {
      const ip = await response.text();
      if (isValidIP(ip.trim())) {
        return {
          ip: ip.trim(),
          source: 'ipapi',
          reliable: true
        };
      }
    }
  } catch (error) {
    console.warn('Fallback IP service 1 failed:', error);
  }

  // Fallback 2: ipinfo.io
  try {
    const response = await fetchWithTimeout('https://ipinfo.io/ip', {
      headers: {
        'Accept': 'text/plain'
      }
    }, 5000);
    
    if (response.ok) {
      const ip = await response.text();
      if (isValidIP(ip.trim())) {
        return {
          ip: ip.trim(),
          source: 'ipinfo',
          reliable: true
        };
      }
    }
  } catch (error) {
    console.warn('Fallback IP service 2 failed:', error);
  }

  // Last resort: return a placeholder that will be logged as suspicious
  console.error('SECURITY ALERT: All IP detection methods failed');
  return {
    ip: 'unknown',
    source: 'fallback',
    reliable: false
  };
};

/**
 * SECURITY: Validate IP address format
 */
const isValidIP = (ip: string): boolean => {
  // IPv4 validation
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  
  // IPv6 validation (basic)
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
};

/**
 * SECURITY: Check if IP should be exempt from blocking by checking the database allowlist.
 */
export const isIPAllowlisted = async (ip: string): Promise<boolean> => {
  if (!ip || ip === 'unknown' || ip === '127.0.0.1') {
    return false;
  }
  
  try {
    const { data, error } = await supabase.rpc('is_ip_in_allowlist', { check_ip: ip });
    
    if (error) {
      console.error('Error checking IP allowlist:', error);
      // Fail safe: if check fails, don't treat as allowlisted.
      return false; 
    }
    
    if (data === true) {
        console.log(`SECURITY: IP ${ip} is on the allowlist.`);
    }

    return data === true;
  } catch (error) {
    console.error('Exception checking IP allowlist:', error);
    return false;
  }
};

/**
 * SECURITY: Log suspicious IP activity
 */
export const logSuspiciousIPActivity = async (
  ip: string, 
  activity: string, 
  details: any = {}
): Promise<void> => {
  try {
    console.warn('SECURITY ALERT: Suspicious IP activity', {
      ip,
      activity,
      details,
      timestamp: new Date().toISOString()
    });
    
    // TODO: Implement proper security audit logging to database
    // This should be stored in a security_audit_log table
  } catch (error) {
    console.error('Error logging suspicious IP activity:', error);
  }
};
