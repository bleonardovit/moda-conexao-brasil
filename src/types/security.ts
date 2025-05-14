
export interface LoginLog {
  id: number;
  user_id: string | null;
  user_email: string | null;
  ip_address: string;
  success: boolean;
  attempted_at: string;
}

export interface ActiveSession {
  id: number;
  user_id: string;
  ip_address: string;
  login_at: string;
  last_active: string;
  user_email?: string;
  full_name?: string;
}

export interface BlockedIP {
  id: number;
  ip_address: string;
  blocked_at: string;
  blocked_until: string;
  reason: string | null;
  attempts_count: number;
}

export interface SecuritySetting {
  id: number;
  key: string;
  value: string;
  description: string | null;
  updated_at: string;
  updated_by: string | null;
}

export interface LoginStats {
  totalLogins: number;
  successfulLogins: number;
  failedLogins: number;
  uniqueIPs: number;
  blockedIPs: number;
}

export interface DailyLoginStat {
  date: string;
  total: number;
  successful: number;
  failed: number;
}
