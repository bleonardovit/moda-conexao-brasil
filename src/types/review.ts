
// Types for reviews
export interface Review {
  id: string;
  supplier_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
  hidden?: boolean;
}

export interface ReviewBan {
  user_id: string;
  blocked_at: string;
  blocked_by?: string;
  reason?: string;
}
