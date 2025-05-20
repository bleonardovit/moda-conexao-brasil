
export type TrialStatus = 'not_started' | 'active' | 'expired' | 'converted';

export interface UserTrialInfo {
  userId: string;
  status: TrialStatus;
  startDate?: string | null;
  endDate?: string | null;
  allowedSupplierIds?: string[];
  lastRotationDate?: string | null;
}

export interface FreeTrialConfig {
  user_id: string;
  allowed_supplier_ids: string[] | null;
  last_rotation_at: string | null;
}

